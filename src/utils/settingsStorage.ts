import { AppSettings } from "../types";

export const STORAGE_KEY = "kobold_ternary_translator_settings_v1";

export const DEFAULT_SETTINGS: AppSettings = {
  direction: "enToKobold",
  outputCase: "uppercase",
  pitchPatternMode: "contour",
  pitch: {
    lowSemitones: -3,
    midSemitones: 0,
    highSemitones: 3,
    bySymbol: {
      ".": { lowSemitones: -3, midSemitones: 0, highSemitones: 3 },
      "-": { lowSemitones: -3, midSemitones: 0, highSemitones: 3 },
      ":": { lowSemitones: -3, midSemitones: 0, highSemitones: 3 },
    },
  },
  timing: {
    symbolGapMs: 20,
    characterGapMs: 45,
    wordGapMs: 140,
    lineGapMs: 300,
    globalSpeed: 1.0,
    scaleSoundDurationWithSpeed: false,
  },
  glyphOverlap: {
    enabled: false,
    overlapMode: "percent",
    overlapAmount: 35,
    crossfadeMs: 25,
    glyphCompression: 1.1,
    masterCompression: true,
    smoothEnvelopes: true,
  },
  connectedRenderer: {
    enabled: true,
    style: "junction",
    colorTheme: "amber",
    strokeWidth: 3,
    smoothness: 60,
    showLabels: true,
    glowEffect: true,
    renderInWorkspace: true,
    renderInTable: true,
    renderInPlayback: true,
  },
  expressivePunctuation: true,
  synthesizePunctuationAudio: true,
  loop: false,
  volume: 0.8,
  englishText: "Hello, Kobold!",
  koboldText: ".-: .. :- :- .- ...-  .: .- ... .- :- ..: ..-.",
  randomSeed: 12345,
};

export function loadSettingsFromStorage(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        pitch: { ...DEFAULT_SETTINGS.pitch, ...parsed.pitch },
        timing: { ...DEFAULT_SETTINGS.timing, ...parsed.timing },
        glyphOverlap: { ...DEFAULT_SETTINGS.glyphOverlap, ...parsed.glyphOverlap },
        connectedRenderer: { ...DEFAULT_SETTINGS.connectedRenderer, ...parsed.connectedRenderer },
      };
    }
  } catch (err) {
    console.warn("Failed to load settings from localStorage:", err);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettingsToStorage(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn("Failed to save settings to localStorage:", err);
  }
}

export function exportSettingsJSON(settings: AppSettings): string {
  const exportData = {
    version: "1.0",
    appName: "Kobold Ternary Translator",
    exportedAt: new Date().toISOString(),
    settings,
  };
  return JSON.stringify(exportData, null, 2);
}

export function importSettingsJSON(jsonString: string): AppSettings {
  const parsed = JSON.parse(jsonString);
  const data = parsed.settings || parsed;

  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid settings JSON structure.");
  }

  return {
    ...DEFAULT_SETTINGS,
    ...data,
    pitch: { ...DEFAULT_SETTINGS.pitch, ...(data.pitch || {}) },
    timing: { ...DEFAULT_SETTINGS.timing, ...(data.timing || {}) },
  };
}
