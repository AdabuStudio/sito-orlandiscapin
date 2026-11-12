/** Mini-formattatore per i campi testo: paragrafi (riga vuota), liste ("- "), **grassetto**, [link](url). Sempre escapato. */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = (s: string) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|mailto:|tel:)[^)\s]*)\)/g, '<a href="$2">$1</a>');

export function formatText(body: string): string {
  return body.trim().split(/\n{2,}/).map((block) => {
    const lines = block.split('\n');
    if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
      return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-•]\s+/, ''))}</li>`).join('')}</ul>`;
    }
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('\n');
}

export const formatDate = (iso: string, lang = 'it') =>
  new Date(iso).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' });
