/**
 * Normalizes accented characters and Unicode diacritics.
 * Examples:
 *   É -> E
 *   Á -> A
 *   Ñ -> N
 *   Ö -> O
 */
export function normalizeEnglishString(input: string): string {
  if (!input) return "";
  // Decompose accented characters and strip combining diacritical marks
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
