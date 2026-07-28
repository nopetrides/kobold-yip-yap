import {
  AppSettings,
  PlaybackItem,
  PitchLevel,
  SymbolPlaybackEvent,
  PausePlaybackEvent,
} from "../types";
import {
  ENGLISH_TO_KOBOLD_MAP,
  KOBOLD_TO_ENGLISH_MAP,
  PUNCTUATION_CHARACTERS,
  KOBOLD_PUNCTUATION_CODES,
} from "./koboldCharacterMap";
import { encodeEnglishToKobold } from "./encodeEnglish";
import {
  getPitchForSymbol,
  getRateForPitchLevel,
  getSemitonesForPitchLevel,
  generateControlledRandomPitches,
} from "./pitchMath";

const PUNCTUATION_PAUSES: Record<string, number> = {
  ",": 120,
  ".": 250,
  "?": 280,
  "!": 220,
  ":": 160,
  ";": 180,
  "-": 60,
  "'": 20,
  '"': 40,
  "(": 50,
  ")": 50,
  "/": 80,
};

/**
 * Parses Kobold or English text and builds an explicit list of PlaybackItems.
 */
export function buildPlaybackSequence(
  inputText: string,
  settings: AppSettings,
  isKoboldSource: boolean = false
): PlaybackItem[] {
  if (!inputText.trim()) return [];

  const items: PlaybackItem[] = [];
  const speed = settings.timing.globalSpeed || 1.0;

  const symbolGapMs = Math.max(0, settings.timing.symbolGapMs / speed);
  const charGapMs = Math.max(0, settings.timing.characterGapMs / speed);
  const wordGapMs = Math.max(0, settings.timing.wordGapMs / speed);
  const lineGapMs = Math.max(0, settings.timing.lineGapMs / speed);

  // Derive the effective Kobold text string for sequence generation
  const effectiveKoboldText = isKoboldSource
    ? inputText
    : encodeEnglishToKobold(inputText).output;

  // Split lines
  const lines = effectiveKoboldText.split(/\r?\n/);

  // Pre-calculate controlled random pitch list based on actual valid Kobold glyph count
  let glyphCountTotal = 0;
  for (const l of lines) {
    if (!l.trim()) continue;
    const words = l.split(/ {2,}/);
    for (const w of words) {
      if (!w.trim()) continue;
      const rawGlyphs = w.trim().split(" ");
      for (const g of rawGlyphs) {
        if (!g) continue;
        const validSymbols = g.replace(/[^.\-:]/g, "");
        if (validSymbols) {
          glyphCountTotal++;
        }
      }
    }
  }

  const randomPitches = generateControlledRandomPitches(glyphCountTotal, settings.randomSeed);

  let globalGlyphIndex = 0;

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    if (line.trim() === "") {
      if (l < lines.length - 1) {
        items.push({ type: "pause", durationMs: lineGapMs, reason: "line" });
      }
      continue;
    }

    // Split words by 2 or more spaces in Kobold text representation
    const words = line.split(/ {2,}/);

    for (let w = 0; w < words.length; w++) {
      const wordStr = words[w];
      if (!wordStr) continue;

      const rawGlyphs = wordStr.trim().split(" ");
      const glyphTokens: { glyph: string; englishChar: string }[] = [];

      for (const g of rawGlyphs) {
        if (!g) continue;
        const eng = KOBOLD_TO_ENGLISH_MAP.get(g) || "[?]";
        glyphTokens.push({ glyph: g, englishChar: eng });
      }

      for (let g = 0; g < glyphTokens.length; g++) {
        const { glyph, englishChar } = glyphTokens[g];

        // Only process valid Kobold symbols (. - :)
        const validSymbols = glyph.replace(/[^.\-:]/g, "");
        if (!validSymbols) {
          continue;
        }

        // Check if this token is punctuation
        const isPunctuation =
          PUNCTUATION_CHARACTERS.has(englishChar) ||
          KOBOLD_PUNCTUATION_CODES.has(glyph);

        const synthesizeThisGlyph =
          !isPunctuation || settings.synthesizePunctuationAudio !== false;

        const symbolCount = validSymbols.length;

        if (synthesizeThisGlyph) {
          globalGlyphIndex++;

          for (let s = 0; s < symbolCount; s++) {
            const sym = validSymbols[s] as "." | "-" | ":";

            // Calculate base pitch level
            let pitchLevel: PitchLevel = getPitchForSymbol(
              s,
              validSymbols,
              settings.pitchPatternMode,
              g,
              randomPitches[(globalGlyphIndex - 1) % Math.max(1, randomPitches.length)],
              englishChar,
              glyphTokens.length
            );

            // Expressive punctuation overrides on the final symbol of the glyph
            if (settings.expressivePunctuation && s === symbolCount - 1) {
              if (englishChar === "?") {
                pitchLevel = "high";
              } else if (englishChar === ".") {
                pitchLevel = "low";
              } else if (englishChar === "!") {
                pitchLevel = pitchLevel === "low" ? "mid" : "high";
              }
            }

            const semitones = getSemitonesForPitchLevel(pitchLevel, settings.pitch, sym);
            const playbackRate = getRateForPitchLevel(pitchLevel, settings.pitch, sym);

            const isLastSymbolInGlyph = s === symbolCount - 1;

            const symbolEvent: SymbolPlaybackEvent = {
              type: "symbol",
              symbol: sym,
              pitch: pitchLevel,
              semitones,
              playbackRate,
              englishCharacter: englishChar,
              glyph: validSymbols,
              glyphIndex: globalGlyphIndex,
              characterIndex: globalGlyphIndex,
              wordIndex: w,
              delayAfterMs: 0,
            };

            items.push(symbolEvent);

            if (!isLastSymbolInGlyph && symbolGapMs > 0) {
              items.push({ type: "pause", durationMs: symbolGapMs, reason: "character" });
            }
          }
        }

        // Punctuation extra pause
        let extraPunctuationPauseMs = 0;
        if (settings.expressivePunctuation && PUNCTUATION_PAUSES[englishChar]) {
          extraPunctuationPauseMs = PUNCTUATION_PAUSES[englishChar] / speed;
        }

        // Character gap pause after glyph if not last in word, or if punctuation silence
        const punctuationSilenceMs = isPunctuation && !synthesizeThisGlyph ? (extraPunctuationPauseMs || charGapMs) : 0;
        const totalGapMs = (g < glyphTokens.length - 1 ? charGapMs : 0) + extraPunctuationPauseMs + punctuationSilenceMs;
        if (totalGapMs > 0) {
          items.push({
            type: "pause",
            durationMs: totalGapMs,
            reason: (extraPunctuationPauseMs > 0 || isPunctuation) ? "punctuation" : "character",
          });
        }
      }

      // Word gap pause if not last word in line
      if (w < words.length - 1 && wordGapMs > 0) {
        items.push({ type: "pause", durationMs: wordGapMs, reason: "word" });
      }
    }

    // Line gap pause if not last line
    if (l < lines.length - 1 && lineGapMs > 0) {
      items.push({ type: "pause", durationMs: lineGapMs, reason: "line" });
    }
  }

  return items;
}
