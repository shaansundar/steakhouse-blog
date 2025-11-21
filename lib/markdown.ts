/**
 * Simple markdown to HTML converter for blog posts
 * This is a basic implementation. For production, consider using a library like remark or marked.
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers
  // Convert # to h2 (since page title is already h1), ## to h3, ### to h4, etc.
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h2>$1</h2>'); // Convert # to h2 to maintain single h1 per page

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Helper function to escape HTML entities
  // Note: & must be escaped last to avoid double-escaping existing entities
  function escapeHtml(text: string): string {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/&/g, '&amp;'); // Escape & last to avoid double-escaping
  }

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

  // Images with alt text: ![alt text](image-url) or ![alt text](image-url "title")
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)/gim, (match, altText, imageUrl, title) => {
    // Ensure alt text exists - if empty, use a descriptive default
    const alt = altText.trim() || 'Image';
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
    return `<img src="${imageUrl}" alt="${escapeHtml(alt)}"${titleAttr} />`;
  });

  // Code blocks - escape HTML entities inside code blocks
  html = html.replace(/```([\s\S]*?)```/gim, (match, code) => {
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  });

  // Inline code - escape HTML entities inside inline code
  html = html.replace(/`([^`]+)`/gim, (match, code) => {
    return `<code>${escapeHtml(code)}</code>`;
  });

  // Unordered lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

  // Paragraphs (split by double newlines)
  const paragraphs = html.split('\n\n');
  html = paragraphs
    .map((para) => {
      const trimmed = para.trim();
      // Don't wrap if already wrapped in a tag
      if (trimmed.startsWith('<') || trimmed === '') {
        return trimmed;
      }
      return `<p>${trimmed}</p>`;
    })
    .join('\n');

  return html;
}

