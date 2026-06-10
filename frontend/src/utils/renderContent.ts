export function renderMarkdown(text: string): string {
  return text
    .replace(/`(.+?)`/g, '<code class="text-blue-300 font-mono text-xs bg-slate-800 px-1 py-0.5 rounded">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-slate-200">$1</em>');
}
