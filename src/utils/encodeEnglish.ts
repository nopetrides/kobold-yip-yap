import { ENGLISH_TO_KOBOLD_MAP } from "./koboldCharacterMap";
import { normalizeEnglishString } from "./normalizeEnglish";
import { TranslationResult, TranslationWarning } from "../types";

/**
 * Encodes English text into Kobold ternary symbols.
 *
 * Rules:
 * - Converts letters to uppercase & normalizes accented chars.
 * - Single space between glyphs in the same word.
 * - Two spaces between words.
 * - Line breaks preserved.
 * - Unsupported chars replaced with <?> and reported as warnings.
 */
export function encodeEnglishToKobold(input: string): TranslationResult {
  if (!input) {
    return { output: "", warnings: [] };
  }

  const warnings: TranslationWarning[] = [];
  const lines = input.split(/\r?\n/);
  const encodedLines: string[] = [];

  let globalCharIndex = 0;

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    // Split line into words and spaces preserving empty tokens if multiple spaces
    const words = line.split(" ");
    const encodedWords: string[] = [];

    for (let w = 0; w < words.length; w++) {
      const word = words[w];
      if (word === "") {
        // Extra space in input - preserve spacing
        encodedWords.push("");
        globalCharIndex += 1;
        continue;
      }

      const encodedGlyphs: string[] = [];

      for (let c = 0; c < word.length; c++) {
        const rawChar = word[c];
        const normalizedChar = normalizeEnglishString(rawChar).toUpperCase();

        if (ENGLISH_TO_KOBOLD_MAP.has(normalizedChar)) {
          encodedGlyphs.push(ENGLISH_TO_KOBOLD_MAP.get(normalizedChar)!);
        } else {
          // Unsupported character
          encodedGlyphs.push("<?>");
          warnings.push({
            type: "unsupported-character",
            value: rawChar,
            position: globalCharIndex,
            message: `Unsupported character "${rawChar}" at position ${globalCharIndex + 1}.`,
          });
        }
        globalCharIndex += 1;
      }

      // Join glyphs in word with single space
      encodedWords.push(encodedGlyphs.join(" "));
      
      // Account for word boundary space in input
      if (w < words.length - 1) {
        globalCharIndex += 1;
      }
    }

    // Join words in line with TWO spaces
    encodedLines.push(encodedWords.join("  "));
    
    // Account for line break character
    if (l < lines.length - 1) {
      globalCharIndex += 1;
    }
  }

  return {
    output: encodedLines.join("\n"),
    warnings,
  };
}
