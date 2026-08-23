/**
 * Build a pattern + flags pair from parsed rule parameters.
 *
 * The shared rule parser (LaravelValidator.parseRule) splits parameters on
 * commas, so regex patterns containing commas (e.g.
 * `regex:/^\d{1,3}(,\d{3})*$/`) arrive fragmented. Laravel never splits
 * parameters of regex/not_regex, so we rejoin the fragments here while still
 * honouring an explicit trailing flags-only token such as ['^abc$', 'i'].
 */
export function buildPattern(params) {
  const parts = Array.isArray(params)
    ? params.filter(p => p !== undefined && p !== null)
    : [];

  if (parts.length === 0) return { pattern: '', flags: '' };

  let pattern;
  let flags = '';

  const last = parts[parts.length - 1];
  if (parts.length > 1 && /^[imsux]*$/.test(last)) {
    // Explicit separate flags token, e.g. ['^abc$', 'i']
    flags = last;
    pattern = parts.slice(0, -1).join(',');
  } else {
    pattern = parts.join(',');
  }

  // Laravel-style delimited form: /pattern/flags
  if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
    const lastSlash = pattern.lastIndexOf('/');
    const trailing = pattern.slice(lastSlash + 1);
    if (/^[imsux]*$/.test(trailing)) {
      pattern = pattern.slice(1, lastSlash);
      flags = flags || trailing;
    }
  }

  return { pattern, flags };
}
