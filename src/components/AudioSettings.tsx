import React, { useRef, useState } from "react";
import {
  Upload,
  Play,
  RotateCcw,
  Sliders,
  Clock,
  Music,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { AppSettings, AudioClipsMap, PitchPatternMode, PitchTierValues, GlyphOverlapSettings } from "../types";
import { semitonesToRate, getSemitonesForPitchLevel } from "../utils/pitchMath";

interface AudioSettingsProps {
  clips: AudioClipsMap;
  onUploadFile: (symbol: "." | "-" | ":", file: File) => void;
  onResetAudio: (symbol: "." | "-" | ":") => void;
  onPreviewSymbol: (symbol: "." | "-" | ":", semitones?: number) => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetAllSettings: () => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({
  clips,
  onUploadFile,
  onResetAudio,
  onPreviewSymbol,
  settings,
  onUpdateSettings,
  onResetAllSettings,
}) => {
  const tapInputRef = useRef<HTMLInputElement>(null);
  const scratchInputRef = useRef<HTMLInputElement>(null);
  const biteInputRef = useRef<HTMLInputElement>(null);

  const [selectedSymbolTab, setSelectedSymbolTab] = useState<"all" | "." | "-" | ":">("all");

  const handleFileChange = (symbol: "." | "-" | ":", e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(symbol, e.target.files[0]);
    }
  };

  // Helper to retrieve current active values for low/mid/high semitones
  const getActivePitchValues = (): PitchTierValues => {
    if (selectedSymbolTab !== "all" && settings.pitch.bySymbol?.[selectedSymbolTab]) {
      return settings.pitch.bySymbol[selectedSymbolTab];
    }
    return {
      lowSemitones: settings.pitch.lowSemitones,
      midSemitones: settings.pitch.midSemitones,
      highSemitones: settings.pitch.highSemitones,
    };
  };

  const activePitchValues = getActivePitchValues();

  const updatePitch = (key: "lowSemitones" | "midSemitones" | "highSemitones", val: number) => {
    const currentBySymbol = settings.pitch.bySymbol || {
      ".": { lowSemitones: settings.pitch.lowSemitones, midSemitones: settings.pitch.midSemitones, highSemitones: settings.pitch.highSemitones },
      "-": { lowSemitones: settings.pitch.lowSemitones, midSemitones: settings.pitch.midSemitones, highSemitones: settings.pitch.highSemitones },
      ":": { lowSemitones: settings.pitch.lowSemitones, midSemitones: settings.pitch.midSemitones, highSemitones: settings.pitch.highSemitones },
    };

    if (selectedSymbolTab === "all") {
      onUpdateSettings({
        ...settings,
        pitch: {
          ...settings.pitch,
          [key]: val,
          bySymbol: {
            ".": { ...currentBySymbol["."], [key]: val },
            "-": { ...currentBySymbol["-"], [key]: val },
            ":": { ...currentBySymbol[":"], [key]: val },
          },
        },
      });
    } else {
      onUpdateSettings({
        ...settings,
        pitch: {
          ...settings.pitch,
          bySymbol: {
            ...currentBySymbol,
            [selectedSymbolTab]: {
              ...currentBySymbol[selectedSymbolTab],
              [key]: val,
            },
          },
        },
      });
    }
  };

  const updateTiming = (key: keyof AppSettings["timing"], val: any) => {
    onUpdateSettings({
      ...settings,
      timing: { ...settings.timing, [key]: val },
    });
  };

  const updateGlyphOverlap = (key: keyof GlyphOverlapSettings, val: any) => {
    const current = settings.glyphOverlap || {
      enabled: false,
      overlapMode: "percent",
      overlapAmount: 35,
      crossfadeMs: 25,
      glyphCompression: 1.1,
      masterCompression: true,
      smoothEnvelopes: true,
    };
    onUpdateSettings({
      ...settings,
      glyphOverlap: { ...current, [key]: val },
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 my-6 space-y-8 shadow-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-slate-100">Audio & Pitch Settings</h2>
        </div>

        <button
          onClick={onResetAllSettings}
          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 hover:underline transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Settings</span>
        </button>
      </div>

      {/* 1. Audio Uploads Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-1.5">
            <Music className="w-4 h-4" />
            <span>1. Symbol Audio Clips</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Uploaded sounds remain available until page refresh.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tap Clip */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-amber-500/20 text-amber-300 rounded-lg flex items-center justify-center font-mono font-bold border border-amber-500/30">
                  .
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Tap Sound</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {clips["."].fileName} ({(clips["."].durationSeconds * 1000).toFixed(0)}ms)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => onPreviewSymbol(".", getSemitonesForPitchLevel("mid", settings.pitch, "."))}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1 transition"
              >
                <Play className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Preview</span>
              </button>

              <button
                onClick={() => tapInputRef.current?.click()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition"
              >
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </button>
              <input
                ref={tapInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => handleFileChange(".", e)}
              />

              {clips["."].isCustom && (
                <button
                  onClick={() => onResetAudio(".")}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                  title="Reset to built-in sound"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Scratch Clip */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-amber-500/20 text-amber-300 rounded-lg flex items-center justify-center font-mono font-bold border border-amber-500/30">
                  -
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Scratch Sound</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {clips["-"].fileName} ({(clips["-"].durationSeconds * 1000).toFixed(0)}ms)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => onPreviewSymbol("-", getSemitonesForPitchLevel("mid", settings.pitch, "-"))}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1 transition"
              >
                <Play className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Preview</span>
              </button>

              <button
                onClick={() => scratchInputRef.current?.click()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition"
              >
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </button>
              <input
                ref={scratchInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => handleFileChange("-", e)}
              />

              {clips["-"].isCustom && (
                <button
                  onClick={() => onResetAudio("-")}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                  title="Reset to built-in sound"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Bite Clip */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-amber-500/20 text-amber-300 rounded-lg flex items-center justify-center font-mono font-bold border border-amber-500/30">
                  :
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Bite Sound</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {clips[":"].fileName} ({(clips[":"].durationSeconds * 1000).toFixed(0)}ms)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => onPreviewSymbol(":", getSemitonesForPitchLevel("mid", settings.pitch, ":"))}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1 transition"
              >
                <Play className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Preview</span>
              </button>

              <button
                onClick={() => biteInputRef.current?.click()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition"
              >
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </button>
              <input
                ref={biteInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => handleFileChange(":", e)}
              />

              {clips[":"].isCustom && (
                <button
                  onClick={() => onResetAudio(":")}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                  title="Reset to built-in sound"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pitch Levels & Pattern Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pitch Sliders */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-amber-300">2. Pitch Tier Settings</h3>
            <button
              onClick={() =>
                onUpdateSettings({
                  ...settings,
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
                })
              }
              className="text-[11px] text-slate-400 hover:text-amber-400 underline"
            >
              Reset Pitches
            </button>
          </div>

          {/* Symbol Selector Tabs */}
          <div className="space-y-2">
            <div className="text-[11px] text-slate-400 font-medium">Select target symbol for pitch tiers:</div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800/80">
              <button
                onClick={() => setSelectedSymbolTab("all")}
                className={`flex-1 text-[11px] py-1 px-2 rounded-md font-medium transition ${
                  selectedSymbolTab === "all"
                    ? "bg-amber-500 text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                All Symbols
              </button>
              <button
                onClick={() => setSelectedSymbolTab(".")}
                className={`flex-1 text-[11px] py-1 px-2 rounded-md font-mono font-bold transition flex items-center justify-center gap-1 ${
                  selectedSymbolTab === "."
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span className="w-4 h-4 bg-slate-800/60 rounded flex items-center justify-center text-[10px]">.</span>
                <span>Tap</span>
              </button>
              <button
                onClick={() => setSelectedSymbolTab("-")}
                className={`flex-1 text-[11px] py-1 px-2 rounded-md font-mono font-bold transition flex items-center justify-center gap-1 ${
                  selectedSymbolTab === "-"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span className="w-4 h-4 bg-slate-800/60 rounded flex items-center justify-center text-[10px]">-</span>
                <span>Scratch</span>
              </button>
              <button
                onClick={() => setSelectedSymbolTab(":")}
                className={`flex-1 text-[11px] py-1 px-2 rounded-md font-mono font-bold transition flex items-center justify-center gap-1 ${
                  selectedSymbolTab === ":"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span className="w-4 h-4 bg-slate-800/60 rounded flex items-center justify-center text-[10px]">:</span>
                <span>Bite</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Low Pitch */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300">Low Pitch:</span>
                <span className="text-amber-300 font-bold">
                  {activePitchValues.lowSemitones > 0 ? `+${activePitchValues.lowSemitones}` : activePitchValues.lowSemitones} semitones (
                  {semitonesToRate(activePitchValues.lowSemitones).toFixed(3)}×)
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={activePitchValues.lowSemitones}
                onChange={(e) => updatePitch("lowSemitones", parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* Mid Pitch */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300">Mid Pitch:</span>
                <span className="text-amber-300 font-bold">
                  {activePitchValues.midSemitones > 0 ? `+${activePitchValues.midSemitones}` : activePitchValues.midSemitones} semitones (
                  {semitonesToRate(activePitchValues.midSemitones).toFixed(3)}×)
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={activePitchValues.midSemitones}
                onChange={(e) => updatePitch("midSemitones", parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* High Pitch */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300">High Pitch:</span>
                <span className="text-amber-300 font-bold">
                  {activePitchValues.highSemitones > 0 ? `+${activePitchValues.highSemitones}` : activePitchValues.highSemitones} semitones (
                  {semitonesToRate(activePitchValues.highSemitones).toFixed(3)}×)
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={activePitchValues.highSemitones}
                onChange={(e) => updatePitch("highSemitones", parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Pitch Pattern Mode */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-amber-300">3. Pitch Pattern Mode</h3>

          <div className="space-y-2 text-xs">
            {[
              {
                mode: "contour" as PitchPatternMode,
                label: "Mode 1: Glyph Contour (Default)",
                desc: "Pitch varies by symbol position inside glyph (e.g. Low -> High for 2-symbol, Low -> Mid -> High for 3-symbol).",
              },
              {
                mode: "cycle" as PitchPatternMode,
                label: "Mode 2: Character Cycle",
                desc: "Cycles Low, Mid, High, Mid per character position in word.",
              },
              {
                mode: "fixed" as PitchPatternMode,
                label: "Mode 3: Fixed Mid",
                desc: "Every symbol plays strictly at the Mid pitch setting.",
              },
              {
                mode: "random" as PitchPatternMode,
                label: "Mode 4: Controlled Random",
                desc: "Seeded random pitches per glyph without consecutive level tripling.",
              },
              {
                mode: "pentatonic" as PitchPatternMode,
                label: "Mode 5: Pentatonic Pattern",
                desc: "Melodic 5-step pentatonic scale pattern (Low -> Mid -> High -> Mid -> Low) across symbols.",
              },
              {
                mode: "alphabet" as PitchPatternMode,
                label: "Mode 6: Alphabet Altitude",
                desc: "Determines pitch tier by letter position in alphabet (A–I Low, J–R Mid, S–Z High) to give unique pitch signatures to words.",
              },
              {
                mode: "wordArc" as PitchPatternMode,
                label: "Mode 7: Word Intonation Arc (^ - v)",
                desc: "Simulates natural speech prosody: Starts High (^), sustains Mid (-), and drops Low (v) at word end.",
              },
              {
                mode: "vowelHarmonic" as PitchPatternMode,
                label: "Mode 8: Vowel Harmonic Accent",
                desc: "Gives vowels (A, E, I, O, U) bright high accents while consonants take grounding rhythm for crisp word clarity.",
              },
            ].map((item) => (
              <label
                key={item.mode}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                  settings.pitchPatternMode === item.mode
                    ? "bg-amber-500/10 border-amber-500/50 text-slate-100"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="pitchPattern"
                  value={item.mode}
                  checked={settings.pitchPatternMode === item.mode}
                  onChange={() =>
                    onUpdateSettings({ ...settings, pitchPatternMode: item.mode })
                  }
                  className="mt-0.5 accent-amber-500"
                />
                <div>
                  <div className="font-bold text-amber-300 text-xs">{item.label}</div>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Glyph Overlap & Live Pseudo-Mixing Controls */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>3. Glyph Overlap & Live Pseudo-Mixing</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
              Optional Fluid Synthesis
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/80 hover:border-amber-500/50 transition">
            <input
              type="checkbox"
              checked={settings.glyphOverlap?.enabled ?? false}
              onChange={(e) => updateGlyphOverlap("enabled", e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span className="text-xs font-bold text-slate-200">
              {settings.glyphOverlap?.enabled ? "Overlap & Crossfade Active" : "Enable Overlap & Crossfade"}
            </span>
          </label>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Blends symbols within the same Kobold glyph into a singular, fluid acoustic burst rather than waiting for each clip to finish sequentially. Crossfade tail and head frequencies and compress multi-symbol glyph timing in real time.
        </p>

        {settings.glyphOverlap?.enabled && (
          <div className="space-y-4 pt-1 animate-fadeIn">
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Mixing Presets:</span>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    glyphOverlap: {
                      enabled: true,
                      overlapMode: "percent",
                      overlapAmount: 45,
                      crossfadeMs: 30,
                      glyphCompression: 1.25,
                      masterCompression: true,
                      smoothEnvelopes: true,
                    },
                  })
                }
                className="text-[11px] bg-slate-900 hover:bg-slate-800 text-amber-300 px-2.5 py-1 rounded-md border border-slate-800 hover:border-amber-500/50 transition font-medium"
              >
                🌊 Fluid Vocal
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    glyphOverlap: {
                      enabled: true,
                      overlapMode: "percent",
                      overlapAmount: 20,
                      crossfadeMs: 12,
                      glyphCompression: 1.5,
                      masterCompression: false,
                      smoothEnvelopes: true,
                    },
                  })
                }
                className="text-[11px] bg-slate-900 hover:bg-slate-800 text-amber-300 px-2.5 py-1 rounded-md border border-slate-800 hover:border-amber-500/50 transition font-medium"
              >
                ⚡ Snappy Staccato
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    glyphOverlap: {
                      enabled: true,
                      overlapMode: "percent",
                      overlapAmount: 65,
                      crossfadeMs: 50,
                      glyphCompression: 1.0,
                      masterCompression: true,
                      smoothEnvelopes: true,
                    },
                  })
                }
                className="text-[11px] bg-slate-900 hover:bg-slate-800 text-amber-300 px-2.5 py-1 rounded-md border border-slate-800 hover:border-amber-500/50 transition font-medium"
              >
                🌌 Ambient Wave
              </button>
            </div>

            {/* Overlap Settings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              {/* Mode & Overlap Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Overlap Mode:</span>
                  <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
                    <button
                      type="button"
                      onClick={() => updateGlyphOverlap("overlapMode", "percent")}
                      className={`px-2 py-0.5 text-[10px] rounded transition ${
                        settings.glyphOverlap.overlapMode === "percent"
                          ? "bg-amber-500 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      % Percent
                    </button>
                    <button
                      type="button"
                      onClick={() => updateGlyphOverlap("overlapMode", "fixedMs")}
                      className={`px-2 py-0.5 text-[10px] rounded transition ${
                        settings.glyphOverlap.overlapMode === "fixedMs"
                          ? "bg-amber-500 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      ms Duration
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">
                      {settings.glyphOverlap.overlapMode === "percent" ? "Overlap Ratio:" : "Overlap Window:"}
                    </span>
                    <span className="text-amber-300 font-bold">
                      {settings.glyphOverlap.overlapMode === "percent"
                        ? `${settings.glyphOverlap.overlapAmount}%`
                        : `${settings.glyphOverlap.overlapAmount}ms`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={settings.glyphOverlap.overlapMode === "percent" ? "80" : "120"}
                    step="1"
                    value={settings.glyphOverlap.overlapAmount}
                    onChange={(e) => updateGlyphOverlap("overlapAmount", parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Crossfade Window */}
              <div className="space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Crossfade Window:</span>
                  <span className="text-amber-300 font-bold">{settings.glyphOverlap.crossfadeMs}ms</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="1"
                  value={settings.glyphOverlap.crossfadeMs}
                  onChange={(e) => updateGlyphOverlap("crossfadeMs", parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
                <div className="text-[10px] text-slate-500">
                  Fades out preceding clip tail while fading in the next clip.
                </div>
              </div>

              {/* Intra-Glyph Speed Compression */}
              <div className="space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Glyph Time Squeeze:</span>
                  <span className="text-amber-300 font-bold">
                    {settings.glyphOverlap.glyphCompression.toFixed(2)}× speed
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.0"
                  step="0.05"
                  value={settings.glyphOverlap.glyphCompression}
                  onChange={(e) => updateGlyphOverlap("glyphCompression", parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
                <div className="text-[10px] text-slate-500">
                  Compresses multi-symbol glyphs into dense sound bursts.
                </div>
              </div>
            </div>

            {/* Checkboxes for Dynamics & Envelopes */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.glyphOverlap.smoothEnvelopes}
                  onChange={(e) => updateGlyphOverlap("smoothEnvelopes", e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>Smooth Attack/Decay Envelopes (Prevents click/pop transients)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.glyphOverlap.masterCompression}
                  onChange={(e) => updateGlyphOverlap("masterCompression", e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>Master Glue Compressor Node (Glues overlapping symbol frequencies)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 4. Timing Controls */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
          <Clock className="w-4 h-4" />
          <span>4. Playback Delays & Rhythm</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          {/* Symbol Gap */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Symbol Gap:</span>
              <span className="text-amber-300 font-bold">{settings.timing.symbolGapMs}ms</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={settings.timing.symbolGapMs}
              onChange={(e) => updateTiming("symbolGapMs", parseInt(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Character Gap */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Character Gap:</span>
              <span className="text-amber-300 font-bold">{settings.timing.characterGapMs}ms</span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="5"
              value={settings.timing.characterGapMs}
              onChange={(e) => updateTiming("characterGapMs", parseInt(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Word Gap */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Word Gap:</span>
              <span className="text-amber-300 font-bold">{settings.timing.wordGapMs}ms</span>
            </div>
            <input
              type="range"
              min="0"
              max="800"
              step="10"
              value={settings.timing.wordGapMs}
              onChange={(e) => updateTiming("wordGapMs", parseInt(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Line Gap */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Line Gap:</span>
              <span className="text-amber-300 font-bold">{settings.timing.lineGapMs}ms</span>
            </div>
            <input
              type="range"
              min="0"
              max="1500"
              step="25"
              value={settings.timing.lineGapMs}
              onChange={(e) => updateTiming("lineGapMs", parseInt(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.synthesizePunctuationAudio !== false}
              onChange={(e) =>
                onUpdateSettings({ ...settings, synthesizePunctuationAudio: e.target.checked })
              }
              className="accent-amber-500 rounded"
            />
            <span>Synthesize Punctuation Audio (Play beep codes for punctuation)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.expressivePunctuation}
              onChange={(e) =>
                onUpdateSettings({ ...settings, expressivePunctuation: e.target.checked })
              }
              className="accent-amber-500 rounded"
            />
            <span>Expressive Punctuation (Inflection & Punctuation Pauses)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
