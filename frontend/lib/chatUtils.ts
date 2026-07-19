function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function formatMessage(text: string): string {
  let html = escapeHtml(text)
    .replace(/```([\s\S]*?)```/g, '<code class="code-block">$1</code>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, '<span class="list-item">• $1</span>')
    .replace(/(https?:\/\/[^\s<]+)/g, (match) => {
      if (!isSafeUrl(match)) return match;
      const safe = escapeHtml(match);
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="chat-link">${safe}</a>`;
    });

  const paragraphs = html.split(/\n\n+/);
  return paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<code") || trimmed.startsWith('<span class="list-item"')) {
        return trimmed;
      }
      const lines = trimmed.split("\n");
      if (lines.length > 1 && lines.every((l) => l.startsWith('<span class="list-item"'))) {
        return lines.join("\n");
      }
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
}
