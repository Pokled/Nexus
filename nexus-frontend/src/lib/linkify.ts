/**
 * Linkify — convert bare URLs to clickable <a> tags
 *
 * Used in two contexts:
 *  - Chat messages (HTML content from sanitize-html/TipTap): process text nodes only
 *  - Whisper messages (plain text): split approach, no XSS risk
 */

const URL_REGEX = /(https?:\/\/[^\s<>"'{}|\\^`[\]]+)/g

// ── For HTML content (chat) ───────────────────────────────────────────────────
// Replaces bare URLs only inside text nodes (between > and <), skipping anything
// already inside an <a> tag to avoid double-linking.

export function linkifyHtml(html: string): string {
  // Fast-path: if the content contains no URL, skip
  if (!html.includes('http')) return html

  let insideAnchor = 0
  // Process the HTML token by token: tags vs text nodes
  return html.replace(/(<\/?a[\s>])|>([^<]+)</g, (match, anchorTag, textNode) => {
    if (anchorTag) {
      // Track whether we're inside an <a>…</a>
      if (anchorTag.startsWith('</a')) insideAnchor = Math.max(0, insideAnchor - 1)
      else insideAnchor++
      return match
    }
    if (insideAnchor > 0) return match  // don't linkify inside existing <a>
    const linked = textNode.replace(URL_REGEX, (url: string) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300 underline break-all">${url}</a>`
    )
    return '>' + linked + '<'
  })
}

// ── For plain text (whisper) ──────────────────────────────────────────────────
// Returns an array of segments: { type: 'text'|'url', value: string }
// Rendered safely without XSS (use Svelte {segment.value} for text).

export interface TextSegment { type: 'text'; value: string }
export interface UrlSegment  { type: 'url';  value: string }
export type Segment = TextSegment | UrlSegment

export function linkifyText(content: string): Segment[] {
  const segments: Segment[] = []
  let last = 0
  for (const match of content.matchAll(URL_REGEX)) {
    const start = match.index!
    if (start > last) segments.push({ type: 'text', value: content.slice(last, start) })
    segments.push({ type: 'url', value: match[0] })
    last = start + match[0].length
  }
  if (last < content.length) segments.push({ type: 'text', value: content.slice(last) })
  return segments.length ? segments : [{ type: 'text', value: content }]
}
