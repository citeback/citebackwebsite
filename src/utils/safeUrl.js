/**
 * Validate a URL to prevent javascript: injection in href attributes.
 * Returns the original URL if it uses http: or https:, otherwise returns ''.
 */
export function safeUrl(url) {
  if (!url) return ''
  try {
    const u = new URL(url)
    return (u.protocol === 'https:' || u.protocol === 'http:') ? url : ''
  } catch {
    return ''
  }
}
