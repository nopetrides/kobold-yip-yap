import { KOBOLD_TO_ENGLISH_MAP } from "./koboldCharacterMap";
import { CaseMode, TranslationResult, TranslationWarning } from "../types";

export interface DecodeOptions {
  caseMode?: CaseMode;
}

/**
 * Decodes Kobold ternary symbols into English text.
 *
 * Rules:
 * - Normalizes tabs to spaces.
 * - Single space separates glyphs within a word.
 * - Two or more consecutive spaces separate words.
 * - Line breaks preserved.
 * - Unknown or malformed glyphs become [?] with warnings.
 */
export function decodeKoboldToEnglish(
  input: string,
  options: DecodeOptions = {}
): TranslationResult {
  if (!input) {
    return { output: "", warnings: [] };
  }

  const caseMode = options.caseMode || "uppercase";
  const warnings: TranslationWarning[] = [];
  
  // Normalize tabs to spaces
  const normalizedInput = input.replace(/\t/g, " ");
  const lines = normalizedInput.split(/\r?\n/);
  const decodedLines: string[] = [];

  let glyphCounter = 0;

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    if (line.trim() === "") {
      decodedLines.push("");
      continue;
    }

    // Split line into words by 2 or more consecutive spaces
    const rawWords = line.split(/ {2,}/);
    const decodedWords: string[] = [];

    for (let w = 0; w < rawWords.length; w++) {
      const wordStr = rawWords[w];
      if (!wordStr) continue;

      // Glyphs in a word are separated by single space
      const glyphs = wordStr.trim().split(" ");
      let wordDecoded = "";

      for (let g = 0; g < glyphs.length; g++) {
        const glyph = glyphs[g];
        glyphCounter++;

        if (!glyph) continue;

        // Validation check
        const isValidChars = /^[.\-:]+$/.test(glyph);
        const isValidLength = glyph.length >= 1 && glyph.length <= 4;
        const mappedChar = KOBOLD_TO_ENGLISH_MAP.get(glyph);

        if (isValidChars && isValidLength && mappedChar) {
          wordDecoded += mappedChar;
        } else {
          wordDecoded += "[?]";
          warnings.push({
            type: "invalid-glyph",
            value: glyph,
            position: glyphCounter,
            message: `Unknown glyph "${glyph}" at position ${glyphCounter}.`,
          });
        }
      }

      // Apply case formatting to the decoded word
      if (wordDecoded) {
        if (caseMode === "lowercase") {
          wordDecoded = wordDecoded.toLowerCase();
        } else if (caseMode === "titlecase") {
          wordDecoded = wordDecoded.charAt(0).toUpperCase() + wordDecoded.slice(1).toLowerCase();
        } else {
          wordDecoded = wordDecoded.toUpperCase();
        }
        decodedWords.push(wordDecoded);
      }
    }

    decodedLines.push(decodedWords.join(" "));
  }

  return {
    output: decodedLines.join("\n"),
    warnings,
  };
}
