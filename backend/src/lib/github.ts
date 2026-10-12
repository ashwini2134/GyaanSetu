/** Extracts the GitHub username/owner segment from a profile or repo URL. */
export function extractGithubUsername(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.trim().match(/^https?:\/\/(www\.)?github\.com\/([^/\s?#]+)/i);
  return match ? match[2].toLowerCase() : null;
}
