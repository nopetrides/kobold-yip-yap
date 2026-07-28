export type CategoryType = "letter" | "number" | "punctuation" | "phoneme";

export interface KoboldCharacter {
  english: string;
  code: string;
  category: CategoryType;
  label?: string;
}

export type TranslationWarningType = "unsupported-character" | "invalid-glyph" | "missing-audio";

export interface TranslationWarning {
  type: TranslationWarningType;
  value: string;
  position: number;
  message: string;
}

export interface TranslationResult {
  output: string;
  warnings: TranslationWarning[];
}

export type PitchLevel = "low" | "mid" | "high";

export type PitchPatternMode =
  | "contour"
  | "cycle"
  | "fixed"
  | "random"
  | "pentatonic"
  | "alphabet"
  | "wordArc"
  | "vowelHarmonic";

export type CaseMode = "uppercase" | "lowercase" | "titlecase";

export interface PitchTierValues {
  lowSemitones: number;
  midSemitones: number;
  highSemitones: number;
}

export interface PitchSettings {
  lowSemitones: number;
  midSemitones: number;
  highSemitones: number;
  bySymbol?: {
    ".": PitchTierValues;
    "-": PitchTierValues;
    ":": PitchTierValues;
  };
}

export interface TimingSettings {
  symbolGapMs: number;
  characterGapMs: number;
  wordGapMs: number;
  lineGapMs: number;
  globalSpeed: number;
  scaleSoundDurationWithSpeed: boolean;
}

export type OverlapMode = "percent" | "fixedMs";

export type ConnectedShapeStyle = "junction" | "runic" | "chiseled" | "wireframe";
export type ConnectedShapeColor = "amber" | "cyan" | "emerald" | "amethyst" | "monochrome";

export interface ConnectedRendererSettings {
  enabled: boolean;
  style: ConnectedShapeStyle;
  colorTheme: ConnectedShapeColor;
  strokeWidth: number; // 2..8
  smoothness: number; // 0..100
  showLabels: boolean; // show corresponding Kobold symbol code / English character
  glowEffect: boolean; // SVG drop shadow / blur glow
  renderInWorkspace: boolean; // show connected shape panel under workspace
  renderInTable: boolean; // show connected shapes inside character dictionary table
  renderInPlayback: boolean; // show connected shape animated highlight in playback bar
}

export interface GlyphOverlapSettings {
  enabled: boolean;
  overlapMode: OverlapMode;
  overlapAmount: number; // 0..80 for percent, 0..150 for fixedMs
  crossfadeMs: number; // 0..80 ms
  glyphCompression: number; // 1.0..2.0x intra-glyph speed multiplier
  masterCompression: boolean; // Dynamic Compressor Node
  smoothEnvelopes: boolean; // Attack and decay gain ramps
}

export interface AppSettings {
  direction: "enToKobold" | "koboldToEn";
  outputCase: CaseMode;
  pitchPatternMode: PitchPatternMode;
  pitch: PitchSettings;
  timing: TimingSettings;
  glyphOverlap: GlyphOverlapSettings;
  connectedRenderer: ConnectedRendererSettings;
  expressivePunctuation: boolean;
  synthesizePunctuationAudio: boolean;
  loop: boolean;
  volume: number; // 0.0 to 1.0
  englishText: string;
  koboldText: string;
  randomSeed: number;
}

export interface SymbolPlaybackEvent {
  type: "symbol";
  symbol: "." | "-" | ":";
  pitch: PitchLevel;
  semitones: number;
  playbackRate: number;
  englishCharacter: string;
  glyph: string;
  glyphIndex: number;
  characterIndex: number;
  wordIndex: number;
  delayAfterMs: number;
}

export interface PausePlaybackEvent {
  type: "pause";
  durationMs: number;
  reason: "character" | "word" | "line" | "punctuation";
}

export type PlaybackItem = SymbolPlaybackEvent | PausePlaybackEvent;

export interface AudioBufferState {
  buffer: AudioBuffer | null;
  fileName: string;
  durationSeconds: number;
  isCustom: boolean;
  isDecoding: boolean;
  error?: string;
}

export interface AudioClipsMap {
  ".": AudioBufferState;
  "-": AudioBufferState;
  ":": AudioBufferState;
}

export interface CurrentPlaybackInfo {
  isPlaying: boolean;
  isPaused: boolean;
  activeItemIndex: number;
  totalItems: number;
  currentSymbol: "." | "-" | ":" | null;
  currentEnglishChar: string;
  currentGlyph: string;
  currentPitchLevel: PitchLevel | null;
  characterIndex: number;
  totalCharacters: number;
}
