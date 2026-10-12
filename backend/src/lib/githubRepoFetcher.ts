// Fetches a bounded slice of a public GitHub repo's source so the AI review
// can actually read the student's code, instead of grading a free-text
// description. Uses the raw.githubusercontent.com CDN for file bodies (no
// GitHub API rate limit) and the API only for the repo/tree metadata.

const CODE_EXTENSIONS = new Set([
  '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.c', '.cpp', '.h', '.hpp',
  '.go', '.rb', '.php', '.cs', '.html', '.css', '.sql', '.md',
]);

// Common extensionless filenames worth including even though they have no
// dotted extension to match against CODE_EXTENSIONS.
const CODE_BASENAMES = new Set(['README', 'Dockerfile', 'Makefile']);

function isCodeRelevant(path: string): boolean {
  const base = path.split('/').pop() ?? path;
  if (CODE_BASENAMES.has(base)) return true;
  const dot = base.lastIndexOf('.');
  if (dot === -1) return false;
  return CODE_EXTENSIONS.has(base.slice(dot));
}

const SKIP_PATH_SEGMENTS = [
  'node_modules/', '.git/', 'dist/', 'build/', 'vendor/', '__pycache__/',
  '.venv/', 'venv/', 'coverage/', '.next/', 'out/',
];

const MAX_FILES = 12;
const MAX_FILE_CHARS = 8_000;
const MAX_TOTAL_CHARS = 35_000;
const MAX_TREE_ENTRY_SIZE = 60_000; // skip anything this large — likely generated/vendored/binary

export interface FetchedFile {
  path: string;
  content: string;
}

export interface RepoFetchResult {
  files: FetchedFile[];
  truncated: boolean;
  defaultBranch: string;
}

interface GitTreeEntry {
  path: string;
  type: string;
  size?: number;
}

function scoreEntry(path: string): number {
  // Prefer root-level files and common entry points; push deeply-nested
  // files down the priority list.
  const depth = path.split('/').length;
  const base = path.split('/').pop() ?? path;
  let score = -depth;
  if (/^(main|app|index|server)\.(py|js|ts|jsx|tsx)$/i.test(base)) score += 10;
  if (/^readme/i.test(base)) score += 8;
  return score;
}

let warnedMissingToken = false;

export async function fetchRepoFiles(owner: string, repo: string): Promise<RepoFetchResult | null> {
  const headers: Record<string, string> = { 'User-Agent': 'Fraylon-Academy-Reviewer' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  } else if (!warnedMissingToken) {
    // Log once per process, not once per review — this degradation is easy
    // to miss otherwise (each individual anonymous request still succeeds
    // until the shared 60/hour limit is hit, which then fails reviews for
    // every student on this server at once with no obvious cause).
    warnedMissingToken = true;
    console.warn(
      '[githubRepoFetcher] GITHUB_TOKEN is not set — repo checks are going out ' +
      'unauthenticated (60 req/hour, shared across all students) instead of ' +
      'the authenticated limit (5000 req/hour). Set GITHUB_TOKEN in .env.'
    );
  }

  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) return null;
  const repoData = (await repoRes.json()) as { default_branch?: string };
  const defaultBranch = repoData.default_branch ?? 'main';

  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    { headers },
  );
  if (!treeRes.ok) return null;
  const treeData = (await treeRes.json()) as { tree?: GitTreeEntry[]; truncated?: boolean };
  const entries = treeData.tree ?? [];

  const candidates = entries
    .filter(e => e.type === 'blob')
    .filter(e => !SKIP_PATH_SEGMENTS.some(seg => e.path.includes(seg)))
    .filter(e => isCodeRelevant(e.path))
    .filter(e => (e.size ?? 0) <= MAX_TREE_ENTRY_SIZE)
    .sort((a, b) => scoreEntry(b.path) - scoreEntry(a.path))
    .slice(0, MAX_FILES);

  const files: FetchedFile[] = [];
  let totalChars = 0;

  for (const entry of candidates) {
    if (totalChars >= MAX_TOTAL_CHARS) break;
    try {
      const rawRes = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${entry.path}`,
      );
      if (!rawRes.ok) continue;
      let content = await rawRes.text();
      if (content.length > MAX_FILE_CHARS) content = content.slice(0, MAX_FILE_CHARS) + '\n… (truncated)';
      const remaining = MAX_TOTAL_CHARS - totalChars;
      if (content.length > remaining) content = content.slice(0, remaining) + '\n… (truncated)';
      files.push({ path: entry.path, content });
      totalChars += content.length;
    } catch {
      // Skip unreadable files rather than failing the whole review.
    }
  }

  return { files, truncated: !!treeData.truncated || candidates.length < entries.filter(e => e.type === 'blob').length, defaultBranch };
}
