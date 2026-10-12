/** Pulls a `something.py` filename out of already-authored requirements/description text,
 * so "Open the Project" / "Test Your Project" can name the right file without inventing one. */
export function deriveMainFile(texts: (string | undefined)[]): string | null {
  for (const text of texts) {
    if (!text) continue;
    const match = text.match(/\b[\w-]+\.py\b/);
    if (match) return match[0];
  }
  return null;
}
