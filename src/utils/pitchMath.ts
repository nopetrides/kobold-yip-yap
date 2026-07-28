import { PitchLevel, PitchPatternMode, PitchSettings } from "../types";

export function semitonesToRate(semitones: number): number {
  return Math.pow(2, semitones / 12);
}

export function getRateForPitchLevel(
  level: PitchLevel,
  settings: PitchSettings,
  symbol?: string
): number {
  const semitones = getSemitonesForPitchLevel(level, settings, symbol);
  return semitonesToRate(semitones);
}

export function getSemitonesForPitchLevel(
  level: PitchLevel,
  settings: PitchSettings,
  symbol?: string
): number {
  const key = level === "low" ? "lowSemitones" : level === "mid" ? "midSemitones" : "highSemitones";
  if (symbol && settings.bySymbol && (symbol === "." || symbol === "-" || symbol === ":")) {
    const symSettings = settings.bySymbol[symbol as "." | "-" | ":"];
    if (symSettings && typeof symSettings[key] === "number") {
      return symSettings[key];
    }
  }
  return settings[key] ?? 0;
}

/**
 * Computes the pitch level for a symbol at `symbolIndex` inside a `glyph`
 * given the chosen `mode`, character index in word, and pitch settings.
 */
export function getPitchForSymbol(
  symbolIndex: number,
  glyph: string,
  mode: PitchPatternMode,
  charIndexInWord: number,
  randomLevelsForGlyph?: PitchLevel,
  englishCharacter?: string,
  totalCharsInWord?: number
): PitchLevel {
  if (mode === "fixed") {
    return "mid";
  }

  if (mode === "cycle") {
    const cyclePattern: PitchLevel[] = ["low", "mid", "high", "mid"];
    return cyclePattern[charIndexInWord % cyclePattern.length];
  }

  if (mode === "pentatonic") {
    const pentatonicPattern: PitchLevel[] = ["low", "mid", "high", "mid", "low"];
    const idx = (charIndexInWord + symbolIndex) % pentatonicPattern.length;
    return pentatonicPattern[idx];
  }

  if (mode === "alphabet") {
    // Determine pitch tier from character's position in alphabet (A=1 ... Z=26)
    const ch = (englishCharacter || "").toUpperCase().trim();
    let letterIndex = 0;
    if (ch >= "A" && ch <= "Z") {
      letterIndex = ch.charCodeAt(0) - 64; // 1..26
    } else {
      letterIndex = (charIndexInWord % 26) + 1;
    }

    // A-I (1-9) -> low, J-R (10-18) -> mid, S-Z (19-26) -> high
    let basePitch: PitchLevel = "mid";
    if (letterIndex <= 9) {
      basePitch = "low";
    } else if (letterIndex <= 18) {
      basePitch = "mid";
    } else {
      basePitch = "high";
    }

    if (symbolIndex > 0) {
      const tiers: PitchLevel[] = ["low", "mid", "high"];
      const baseIdx = tiers.indexOf(basePitch);
      const nextIdx = (baseIdx + symbolIndex) % 3;
      return tiers[nextIdx];
    }
    return basePitch;
  }

  if (mode === "wordArc") {
    // Word Intonation Arc: Start High (^), Middle Mid (-), End Low (v)
    const wordLen = totalCharsInWord && totalCharsInWord > 0 ? totalCharsInWord : 1;
    let basePitch: PitchLevel = "mid";

    if (wordLen === 1) {
      basePitch = "mid";
    } else if (charIndexInWord === 0) {
      basePitch = "high"; // ^ Onset accent
    } else if (charIndexInWord === wordLen - 1) {
      basePitch = "low"; // v Terminal cadence
    } else {
      basePitch = "mid"; // - Middle sustain
    }

    if (symbolIndex > 0) {
      const tiers: PitchLevel[] = ["low", "mid", "high"];
      const baseIdx = tiers.indexOf(basePitch);
      const offset = symbolIndex % 2 === 1 ? 1 : -1;
      const nextIdx = Math.max(0, Math.min(2, baseIdx + offset));
      return tiers[nextIdx];
    }
    return basePitch;
  }

  if (mode === "vowelHarmonic") {
    const ch = (englishCharacter || "").toUpperCase().trim();
    const isVowel = "AEIOUY".includes(ch);

    if (isVowel) {
      return symbolIndex === 0 ? "high" : "mid";
    } else {
      const consPitches: PitchLevel[] = ["low", "mid", "low"];
      const idx = (charIndexInWord + symbolIndex) % consPitches.length;
      return consPitches[idx];
    }
  }

  if (mode === "random" && randomLevelsForGlyph) {
    return randomLevelsForGlyph;
  }

  // Default: Glyph Contour
  const len = glyph.length;
  if (len === 1) {
    return "mid";
  }
  if (len === 2) {
    const pattern2: PitchLevel[] = ["low", "high"];
    return pattern2[symbolIndex % 2];
  }
  if (len === 3) {
    const pattern3: PitchLevel[] = ["low", "mid", "high"];
    return pattern3[symbolIndex % 3];
  }
  // 4-symbol
  const pattern4: PitchLevel[] = ["low", "mid", "high", "mid"];
  return pattern4[symbolIndex % 4];
}

// Simple Mulberry32 seeded PRNG for consistent Controlled Random playback
export function createSeededRandom(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateControlledRandomPitches(
  glyphCount: number,
  seed: number
): PitchLevel[] {
  const rand = createSeededRandom(seed);
  const levels: PitchLevel[] = ["low", "mid", "high"];
  const result: PitchLevel[] = [];

  for (let i = 0; i < glyphCount; i++) {
    let pick = levels[Math.floor(rand() * 3)];
    // Ensure no level repeats more than 2 times consecutively
    if (result.length >= 2 && result[result.length - 1] === pick && result[result.length - 2] === pick) {
      const remaining = levels.filter((l) => l !== pick);
      pick = remaining[Math.floor(rand() * remaining.length)];
    }
    result.push(pick);
  }

  return result;
}
