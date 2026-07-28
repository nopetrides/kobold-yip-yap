import React from "react";
import { CurrentPlaybackInfo, ConnectedRendererSettings } from "../types";
import { Volume2, Activity } from "lucide-react";
import { ConnectedGlyph } from "./ConnectedGlyph";

interface CurrentPlaybackDisplayProps {
  info: CurrentPlaybackInfo;
  connectedSettings?: ConnectedRendererSettings;
}

export const CurrentPlaybackDisplay: React.FC<CurrentPlaybackDisplayProps> = ({ info, connectedSettings }) => {
  const {
    isPlaying,
    isPaused,
    currentSymbol,
    currentEnglishChar,
    currentGlyph,
    currentPitchLevel,
    characterIndex,
    totalCharacters,
  } = info;

  if (!isPlaying && !isPaused) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 my-4 flex items-center justify-between text-slate-400 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-500" />
          <span>Speech Synthesizer Ready. Click <strong>Play Speech</strong> to synthesize Kobold audio speech.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 my-4 shadow-lg text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <Volume2 className={`w-4 h-4 ${isPlaying ? "animate-pulse text-amber-400" : "text-amber-600"}`} />
          <span>
            {isPaused ? "Playback Paused" : "Kobold Speech Synthesizing..."}
          </span>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Progress: <span className="text-amber-300 font-bold">{characterIndex}</span> / {totalCharacters} Glyphs
        </div>
      </div>

      {/* Symbol Indicators */}
      <div className="grid grid-cols-3 gap-3 my-4">
        {/* Tap Dot */}
        <div
          className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-100 ${
            currentSymbol === "." && isPlaying
              ? "bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-md shadow-amber-500/20"
              : "bg-slate-800/60 text-slate-300 border-slate-700"
          }`}
        >
          <span className="text-2xl font-mono font-bold leading-none">.</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">Tap</span>
        </div>

        {/* Scratch Dash */}
        <div
          className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-100 ${
            currentSymbol === "-" && isPlaying
              ? "bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-md shadow-amber-500/20"
              : "bg-slate-800/60 text-slate-300 border-slate-700"
          }`}
        >
          <span className="text-2xl font-mono font-bold leading-none">-</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">Scratch</span>
        </div>

        {/* Bite Colon */}
        <div
          className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-100 ${
            currentSymbol === ":" && isPlaying
              ? "bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-md shadow-amber-500/20"
              : "bg-slate-800/60 text-slate-300 border-slate-700"
          }`}
        >
          <span className="text-2xl font-mono font-bold leading-none">:</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">Bite</span>
        </div>
      </div>

      {/* Connected Glyph Live Shape Display during playback */}
      {connectedSettings?.enabled && connectedSettings?.renderInPlayback && currentGlyph && (
        <div className="my-3 py-2 px-3 bg-slate-950/80 rounded-xl border border-amber-500/30 flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase text-slate-400">
            Active Connected Shape:
          </span>
          <ConnectedGlyph
            glyphCode={currentGlyph}
            englishChar={currentEnglishChar || ""}
            settings={connectedSettings}
            size="md"
            isActive={isPlaying}
          />
        </div>
      )}

      {/* Info Details */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">English</span>
          <span className="text-amber-300 text-base font-bold">{currentEnglishChar || "-"}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Kobold Glyph</span>
          <span className="text-amber-300 text-base font-bold">{currentGlyph || "-"}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Pitch</span>
          <span className="text-amber-300 text-xs font-bold uppercase">{currentPitchLevel || "-"}</span>
        </div>
      </div>
    </div>
  );
};
