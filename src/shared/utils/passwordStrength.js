/**
 * passwordStrength.js
 * Lightweight password strength evaluator used in auth flows and forms.
 * Produces a normalized 0..4 score with a user-facing label, color, and percent for UI bars.
 */

/**
 * Evaluate the strength of a password.
 *
 * Scoring (0..4):
 * - Length contributes up to 2 points (every 6 chars ~ 1 point, capped at 2).
 * - Character variety (lower/upper/number/symbol) contributes up to ~2 points.
 * - +1 bonus for length >= 12.
 *
 * @param {string} [pw=''] Password input.
 * @returns {{score: 0|1|2|3|4, label: string, color: 'error'|'warning'|'info'|'success', percent: number}}
 */
export function evaluatePassword(pw = '') {
  // Length buckets: every 6 chars earns ~1 point up to 2 points total (0..2)
  const lengthScore = Math.min(2, Math.floor((pw.length || 0) / 6)); // 0..2
  // Character class presence contributes to variety
  const hasLower = /[a-z]/.test(pw) ? 1 : 0;
  const hasUpper = /[A-Z]/.test(pw) ? 1 : 0;
  const hasNumber = /\d/.test(pw) ? 1 : 0;
  const hasSymbol = /[^A-Za-z0-9]/.test(pw) ? 1 : 0;
  const varietyScore = hasLower + hasUpper + hasNumber + hasSymbol; // 0..4

  // Weighted score 0..4
  // - varietyScore/2 caps variety to ~2 points (needs at least 2 classes for 1pt, 4 classes ~2pt)
  // - +1 bonus for length >= 12 incentivizes longer passphrases
  const raw = Math.min(4, Math.round(lengthScore + Math.min(2, varietyScore / 2) + (pw.length >= 12 ? 1 : 0)));

  const map = [
    // UI mapping provides semantic label, color feedback, and progress percent
    { label: 'Very weak', color: 'error', percent: 10 },
    { label: 'Weak', color: 'warning', percent: 35 },
    { label: 'Fair', color: 'warning', percent: 55 },
    { label: 'Good', color: 'info', percent: 75 },
    { label: 'Strong', color: 'success', percent: 100 },
  ];
  return { score: raw, ...map[raw] };
}
