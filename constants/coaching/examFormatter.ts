/**
 * Utility to convert raw database strings into proper Title Case.
 * Preserves standard acronyms (CUET, NEET, JEE, GATE, UGC, NET, PG, UG, etc.)
 */
export function toTitleCase(str?: string): string {
  if (!str) return "";
  const trimmed = str.trim();
  if (!trimmed) return "";

  const acronyms = new Set([
    "CUET", "NEET", "JEE", "GATE", "UGC", "NET", "UGC-NET",
    "EAMCET", "ICET", "PG", "UG", "NTA", "CBT", "MBBS", "BDS",
    "IIT", "NIT", "AIIMS", "PDF", "2024", "2025", "2026", "2027",
  ]);

  const minorWords = new Set([
    "and", "or", "in", "for", "of", "to", "the", "a", "an", "cum", "at", "by",
  ]);

  // Check if all-uppercase
  const isAllUpper = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
  if (!isAllUpper) return trimmed;

  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      const upper = word.toUpperCase();
      if (acronyms.has(upper)) return upper;
      if (index > 0 && minorWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
