/**
 * image.js
 * Utility helpers for resolving image URLs so components can safely display images
 * regardless of whether the backend returns absolute URLs (http/https/data) or
 * relative paths (e.g., "/uploads/...").
 *
 * Environment variables:
 * - REACT_APP_API_BASE: When provided, relative paths will be prefixed with this
 *   base URL to produce absolute URLs suitable for cross-origin loading.
 */

/**
 * Resolve a possibly relative image URL to an absolute URL when needed.
 *
 * Rules:
 * - Returns empty string if input is falsy.
 * - Returns the original string if it's already absolute (http/https or data URI).
 * - For root-relative paths ("/uploads/..."), prefixes REACT_APP_API_BASE when available; otherwise returns as-is.
 * - For non-root relative paths ("uploads/..."), normalizes to "/uploads/..." and prefixes base when available.
 * - Always fails safe by returning the best-effort string form if an error occurs.
 *
 * @param {string} url - Original URL or path coming from the API or UI.
 * @returns {string} A safe URL string that can be used as an <img src>.
 */
export function resolveImageUrl(url) {
  if (!url) return '';
  try {
    let s = String(url).trim();
    // Already absolute (http/https/data)
    if (/^(?:https?:)?\/\//i.test(s) || s.startsWith('data:')) return s;
    const base = process.env.REACT_APP_API_BASE || '';
    // Normalize common no-slash forms
    if (s.startsWith('uploads/') || s.startsWith('images/') || s.startsWith('files/')) s = `/${s}`;
    // Root-relative path -> prefix API base when available
    if (s.startsWith('/')) {
      if (base) {
        const b = base.endsWith('/') ? base.slice(0, -1) : base;
        return `${b}${s}`;
      }
      return s; // same-origin fallback
    }
    // Any other non-absolute relative path -> prefix API base if provided
    if (base) {
      const b = base.endsWith('/') ? base.slice(0, -1) : base;
      const p = s.startsWith('/') ? s : `/${s}`;
      return `${b}${p}`;
    }
    return s; // fallback
  } catch {
    return String(url || '');
  }
}

