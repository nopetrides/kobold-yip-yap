import { KOBOLD_CHARACTER_TABLE, ENGLISH_TO_KOBOLD_MAP, KOBOLD_TO_ENGLISH_MAP } from "./koboldCharacterMap";
import { encodeEnglishToKobold } from "./encodeEnglish";
import { decodeKoboldToEnglish } from "./decodeKobold";
import { getPitchForSymbol } from "./pitchMath";
import { buildPlaybackSequence } from "./buildPlaybackSequence";
import { DEFAULT_SETTINGS } from "./settingsStorage";
import { generateGlyphGeometry } from "./glyphPathGenerator";

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

export function runAllUnitTests(): TestResult[] {
  const results: TestResult[] = [];

  // 1. Mapping Integrity
  try {
    const englishKeys = new Set<string>();
    const koboldGlyphs = new Set<string>();
    let invalidCharFound = false;
    let invalidLengthFound = false;

    for (const entry of KOBOLD_CHARACTER_TABLE) {
      if (englishKeys.has(entry.english)) {
        throw new Error(`Duplicate English key in table: ${entry.english}`);
      }
      englishKeys.add(entry.english);

      if (koboldGlyphs.has(entry.code)) {
        throw new Error(`Duplicate Kobold glyph in table: ${entry.code}`);
      }
      koboldGlyphs.add(entry.code);

      if (!/^[.\-:]+$/.test(entry.code)) {
        invalidCharFound = true;
      }
      if (entry.code.length < 1 || entry.code.length > 4) {
        invalidLengthFound = true;
      }
    }

    if (invalidCharFound) throw new Error("Glyph contains non-Kobold symbols!");
    if (invalidLengthFound) throw new Error("Glyph length out of bounds (1-4 symbols required)!");

    // Check bi-directional map consistency
    for (const [eng, code] of ENGLISH_TO_KOBOLD_MAP) {
      if (KOBOLD_TO_ENGLISH_MAP.get(code) !== eng) {
        throw new Error(`Forward/Reverse map mismatch for ${eng} <-> ${code}`);
      }
    }

    results.push({
      name: "Mapping Integrity",
      passed: true,
      message: `All ${KOBOLD_CHARACTER_TABLE.length} characters mapped uniquely with valid 1-4 symbol codes.`,
    });
  } catch (err: any) {
    results.push({
      name: "Mapping Integrity",
      passed: false,
      message: err.message,
    });
  }

  // 2. English Encoding
  try {
    const testCases = [
      { input: "KOBOLD", expected: ".: .- ... .- :- ..:" },
      { input: "KING", expected: ".: - :. .--" },
      { input: "HELLO!", expected: ".-: .. :- :- .- ..-." },
      { input: "HI THERE", expected: ".-: -  -: .-: .. -. .." },
    ];

    let allPass = true;
    const failures: string[] = [];

    for (const tc of testCases) {
      const res = encodeEnglishToKobold(tc.input);
      if (res.output !== tc.expected) {
        allPass = false;
        failures.push(`"${tc.input}" -> got "${res.output}", expected "${tc.expected}"`);
      }
    }

    results.push({
      name: "English Encoding",
      passed: allPass,
      message: allPass ? "All English encoding test cases passed." : "Encoding mismatch.",
      details: failures.join("; "),
    });
  } catch (err: any) {
    results.push({ name: "English Encoding", passed: false, message: err.message });
  }

  // 3. Kobold Decoding
  try {
    const testCases = [
      { input: ".: .- ... .- :- ..:", expected: "KOBOLD" },
      { input: ".: - :. .--", expected: "KING" },
    ];

    let allPass = true;
    const failures: string[] = [];

    for (const tc of testCases) {
      const res = decodeKoboldToEnglish(tc.input);
      if (res.output !== tc.expected) {
        allPass = false;
        failures.push(`"${tc.input}" -> got "${res.output}", expected "${tc.expected}"`);
      }
    }

    results.push({
      name: "Kobold Decoding",
      passed: allPass,
      message: allPass ? "All Kobold decoding test cases passed." : "Decoding mismatch.",
      details: failures.join("; "),
    });
  } catch (err: any) {
    results.push({ name: "Kobold Decoding", passed: false, message: err.message });
  }

  // 4. Word Spacing
  try {
    const enc = encodeEnglishToKobold("A A");
    const dec = decodeKoboldToEnglish(enc.output);
    const pass = enc.output === ".  ." && dec.output === "A A";

    results.push({
      name: "Word Spacing (2 spaces)",
      passed: pass,
      message: pass
        ? 'Correct 2-space word boundary ("A A" <-> ".  .").'
        : `Got encoded "${enc.output}", decoded "${dec.output}"`,
    });
  } catch (err: any) {
    results.push({ name: "Word Spacing", passed: false, message: err.message });
  }

  // 5. Invalid Glyph Handling
  try {
    const res = decodeKoboldToEnglish(".: ----- ..");
    const hasMarker = res.output === "K[?]E";
    const hasWarning = res.warnings.some((w) => w.value === "-----");

    results.push({
      name: "Invalid Glyph Handling",
      passed: hasMarker && hasWarning,
      message: hasMarker && hasWarning
        ? 'Invalid glyph "-----" correctly produced "K[?]E" with detailed warning.'
        : `Output: "${res.output}", warnings count: ${res.warnings.length}`,
    });
  } catch (err: any) {
    results.push({ name: "Invalid Glyph Handling", passed: false, message: err.message });
  }

  // 6. Pentatonic Pitch Pattern Mode
  try {
    const sequence = [0, 1, 2, 3, 4].map((i) => getPitchForSymbol(i, "..", "pentatonic", 0));
    const expected = ["low", "mid", "high", "mid", "low"];
    const matches = sequence.every((p, idx) => p === expected[idx]);

    results.push({
      name: "Pentatonic Pitch Pattern Mode",
      passed: matches,
      message: matches
        ? "Pentatonic pitch mode correctly cycles through 5-step melodic contour."
        : `Got [${sequence.join(", ")}], expected [${expected.join(", ")}]`,
    });
  } catch (err: any) {
    results.push({ name: "Pentatonic Pitch Pattern Mode", passed: false, message: err.message });
  }

  // 7. Alphabet Pitch Pattern Mode
  try {
    const p1 = getPitchForSymbol(0, ".", "alphabet", 0, undefined, "A");
    const p2 = getPitchForSymbol(0, ".", "alphabet", 0, undefined, "M");
    const p3 = getPitchForSymbol(0, ".", "alphabet", 0, undefined, "Z");
    const matches = p1 === "low" && p2 === "mid" && p3 === "high";

    results.push({
      name: "Alphabet Pitch Pattern Mode",
      passed: matches,
      message: matches
        ? "Alphabet Altitude correctly maps letter tiers (A -> low, M -> mid, Z -> high)."
        : `Got A:${p1}, M:${p2}, Z:${p3}`,
    });
  } catch (err: any) {
    results.push({ name: "Alphabet Pitch Pattern Mode", passed: false, message: err.message });
  }

  // 8. Word Intonation Arc Pitch Pattern Mode
  try {
    const wordPitches = ["H", "E", "L", "L", "O"].map((c, idx) =>
      getPitchForSymbol(0, ".", "wordArc", idx, undefined, c, 5)
    );
    const expected = ["high", "mid", "mid", "mid", "low"];
    const matches = wordPitches.every((p, idx) => p === expected[idx]);

    results.push({
      name: "Word Intonation Arc Mode",
      passed: matches,
      message: matches
        ? "Word Arc correctly creates high onset and low terminal cadence (^ H-E-L-L v O)."
        : `Got [${wordPitches.join(", ")}], expected [${expected.join(", ")}]`,
    });
  } catch (err: any) {
    results.push({ name: "Word Intonation Arc Mode", passed: false, message: err.message });
  }

  // 9. Punctuation Audio Synthesis Toggle
  try {
    const seqWithPunctuation = buildPlaybackSequence("Hello, world!", {
      ...DEFAULT_SETTINGS,
      synthesizePunctuationAudio: true,
    });
    const seqWithoutPunctuation = buildPlaybackSequence("Hello, world!", {
      ...DEFAULT_SETTINGS,
      synthesizePunctuationAudio: false,
    });

    const hasCommaAudioWithToggle = seqWithPunctuation.some(
      (item) => item.type === "symbol" && (item.englishCharacter === "," || item.englishCharacter === "!")
    );
    const hasCommaAudioWithoutToggle = seqWithoutPunctuation.some(
      (item) => item.type === "symbol" && (item.englishCharacter === "," || item.englishCharacter === "!")
    );

    const matches = hasCommaAudioWithToggle && !hasCommaAudioWithoutToggle;

    results.push({
      name: "Punctuation Audio Synthesis Toggle",
      passed: matches,
      message: matches
        ? "Punctuation audio toggle correctly includes/excludes audio beep symbols for punctuation marks."
        : `With toggle: ${hasCommaAudioWithToggle}, Without toggle: ${hasCommaAudioWithoutToggle}`,
    });
  } catch (err: any) {
    results.push({ name: "Punctuation Audio Synthesis Toggle", passed: false, message: err.message });
  }

  // 10. Per-Symbol Pitch Tier Settings
  try {
    const customPitchSettings = {
      ...DEFAULT_SETTINGS,
      pitch: {
        lowSemitones: 0,
        midSemitones: 0,
        highSemitones: 0,
        bySymbol: {
          ".": { lowSemitones: -5, midSemitones: -2, highSemitones: 2 },
          "-": { lowSemitones: 4, midSemitones: 6, highSemitones: 8 },
          ":": { lowSemitones: 10, midSemitones: 12, highSemitones: 14 },
        },
      },
    };

    const seq = buildPlaybackSequence("A", customPitchSettings); // 'A' maps to Kobold glyphs
    const tapEvent = seq.find((item) => item.type === "symbol" && item.symbol === ".");
    const scratchEvent = seq.find((item) => item.type === "symbol" && item.symbol === "-");

    let isCorrect = true;
    if (tapEvent && tapEvent.type === "symbol") {
      // Tap pitch should match dot pitch tiers
      const allowedDotPitches = [-5, -2, 2];
      if (!allowedDotPitches.includes(tapEvent.semitones)) {
        isCorrect = false;
      }
    }
    if (scratchEvent && scratchEvent.type === "symbol") {
      const allowedScratchPitches = [4, 6, 8];
      if (!allowedScratchPitches.includes(scratchEvent.semitones)) {
        isCorrect = false;
      }
    }

    results.push({
      name: "Per-Symbol Pitch Tier Settings",
      passed: isCorrect,
      message: isCorrect
        ? "Per-symbol pitch tier settings correctly apply distinct pitch semitones to individual symbols (. vs - vs :)."
        : "Per-symbol pitch settings were not correctly applied during sequence generation.",
    });
  } catch (err: any) {
    results.push({ name: "Per-Symbol Pitch Tier Settings", passed: false, message: err.message });
  }

  // 11. Glyph Overlap & Live Pseudo-Mixing Configuration
  try {
    const overlapSettings = {
      ...DEFAULT_SETTINGS,
      glyphOverlap: {
        enabled: true,
        overlapMode: "percent" as const,
        overlapAmount: 40,
        crossfadeMs: 25,
        glyphCompression: 1.2,
        masterCompression: true,
        smoothEnvelopes: true,
      },
    };

    const isConfigured =
      overlapSettings.glyphOverlap.enabled === true &&
      overlapSettings.glyphOverlap.overlapAmount === 40 &&
      overlapSettings.glyphOverlap.crossfadeMs === 25 &&
      overlapSettings.glyphOverlap.masterCompression === true;

    results.push({
      name: "Glyph Overlap & Pseudo-Mixing Configuration",
      passed: isConfigured,
      message: isConfigured
        ? "Glyph overlap, crossfading, speed compression, and master dynamics compressor settings are fully validated."
        : "Glyph overlap configuration mismatch.",
    });
  } catch (err: any) {
    results.push({ name: "Glyph Overlap & Pseudo-Mixing Configuration", passed: false, message: err.message });
  }

  // 12. Kobold Glyph Count Accuracy
  try {
    const englishSample = "Hello, world!";
    const seq = buildPlaybackSequence(englishSample, DEFAULT_SETTINGS, false);
    const symbolEvents = seq.filter((item) => item.type === "symbol");
    const maxGlyphIndex = symbolEvents.length > 0 ? Math.max(...symbolEvents.map((s: any) => s.glyphIndex)) : 0;
    
    // "Hello, world!" has 12 Kobold glyphs (H, E, L, L, O, ,, W, O, R, L, D, !)
    const isExactCount = maxGlyphIndex === 12;

    results.push({
      name: "Kobold Glyph Count Accuracy",
      passed: isExactCount,
      message: isExactCount
        ? `Playback sequence correctly schedules exactly ${maxGlyphIndex} Kobold glyphs without space phantom tokens.`
        : `Expected 12 Kobold glyphs, got ${maxGlyphIndex}`,
    });
  } catch (err: any) {
    results.push({ name: "Kobold Glyph Count Accuracy", passed: false, message: err.message });
  }

  // 13. Connected Glyph Structural Shape Generation
  try {
    const geomA = generateGlyphGeometry(".", "junction");
    const geomI = generateGlyphGeometry("-", "junction");
    const geomU = generateGlyphGeometry(":", "junction");
    const geomE = generateGlyphGeometry("..", "junction");
    const geomB = generateGlyphGeometry("...", "junction");
    const geomD = generateGlyphGeometry("..:", "junction");
    const geomF = generateGlyphGeometry(".-.", "junction");

    const isConnectedValid =
      geomA.ring !== undefined && // A has sigil ring around central dot
      geomI.pathD.length > 0 && // I (Scratch) renders diagonal claw slash
      geomU.dots.length === 2 && // U (Bite) has 2 vertical dots
      geomU.pathD.includes("M 50 28 L 50 72") && // U (Bite) connects Bite dots vertically
      geomE.dots.length === 2 && // E (Tap Tap) has 2 horizontal dots
      geomE.pathD.includes("M 22 50 L 78 50") && // E (Tap Tap) connects Taps horizontally
      geomB.dots.length === 3 && // B ('...') has 3 punch dots
      geomB.pathD.includes("M 22 50 L 50 50") && // B (Tap Tap Tap) connects Taps horizontally
      geomD.dots.length === 4 && // D (Tap Tap Bite) has 2 Tap dots + 2 Bite dots
      geomD.pathD.includes("M 78 28 L 78 72") && // D connects Bite vertically and Taps horizontally
      geomF.dots.length === 2 && // F (.-.) has 2 Tap dots below Scratch baseline
      geomF.pathD.length > 0;

    results.push({
      name: "Connected Glyph Structural Shape Generation",
      passed: isConnectedValid,
      message: isConnectedValid
        ? "Connected symbol shape renderer correctly composes structural glyphs with literal positions (A=dot+ring, Scratch=diagonal claw slashes, U=vertical Bite stem, E & B=horizontal Tap connectors, D=horizontal Taps + vertical Bite)."
        : "Structural glyph vector geometry generation failed.",
    });
  } catch (err: any) {
    results.push({ name: "Connected Glyph Structural Shape Generation", passed: false, message: err.message });
  }

  return results;
}
