import React from "react";
import { ArrowLeftRight, Copy, Trash2, Play, Square, Check } from "lucide-react";
import { CaseMode } from "../types";

interface TranslationWorkspaceProps {
  direction: "enToKobold" | "koboldToEn";
  onDirectionChange: (dir: "enToKobold" | "koboldToEn") => void;
  englishText: string;
  onEnglishTextChange: (text: string) => void;
  koboldText: string;
  onKoboldTextChange: (text: string) => void;
  outputCase: CaseMode;
  onOutputCaseChange: (cMode: CaseMode) => void;
  onPlay: () => void;
  onStop: () => void;
  isPlaying: boolean;
  onSwap: () => void;
}

export const TranslationWorkspace: React.FC<TranslationWorkspaceProps> = ({
  direction,
  onDirectionChange,
  englishText,
  onEnglishTextChange,
  koboldText,
  onKoboldTextChange,
  outputCase,
  onOutputCaseChange,
  onPlay,
  onStop,
  isPlaying,
  onSwap,
}) => {
  const [copiedField, setCopiedField] = React.useState<"english" | "kobold" | null>(null);

  const handleCopy = (text: string, field: "english" | "kobold") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isEnActive = direction === "enToKobold";

  // Calculate counts
  const charCount = englishText.length;
  const glyphCount = koboldText
    .trim()
    .split(/\s+/)
    .filter((g) => g.length > 0).length;

  return (
    <div className="space-y-4">
      {/* Direction & Options Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDirectionChange("enToKobold")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition ${
              direction === "enToKobold"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            English → Kobold
          </button>

          <button
            onClick={onSwap}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition"
            title="Swap Panels & Direction"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDirectionChange("koboldToEn")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition ${
              direction === "koboldToEn"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Kobold → English
          </button>
        </div>

        {/* Case Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400">
          <span className="font-medium">Output Case:</span>
          <select
            value={outputCase}
            onChange={(e) => onOutputCaseChange(e.target.value as CaseMode)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-mono text-xs"
          >
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="titlecase">Title case</option>
          </select>
        </div>
      </div>

      {/* Side-by-side Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* English Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-72 sm:h-80 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200 text-sm">English</span>
              {isEnActive && (
                <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] uppercase font-semibold border border-amber-500/20">
                  Input
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-500">{charCount} chars</span>
              <button
                onClick={() => handleCopy(englishText, "english")}
                disabled={!englishText}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition disabled:opacity-40"
                title="Copy English Text"
              >
                {copiedField === "english" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              {isEnActive && (
                <button
                  onClick={() => onEnglishTextChange("")}
                  disabled={!englishText}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition disabled:opacity-40"
                  title="Clear English Text"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <textarea
            value={englishText}
            onChange={(e) => onEnglishTextChange(e.target.value)}
            readOnly={!isEnActive}
            placeholder={isEnActive ? "Type English text here to translate into Kobold..." : "Decoded English will appear here..."}
            className={`w-full flex-1 mt-3 bg-slate-950/60 p-3 rounded-lg border text-sm sm:text-base text-slate-100 placeholder-slate-600 focus:outline-none resize-none ${
              isEnActive
                ? "border-slate-800 focus:border-amber-500/60"
                : "border-slate-900 text-slate-300 cursor-default"
            }`}
          />
        </div>

        {/* Kobold Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-72 sm:h-80 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-400 text-sm">Kobold Symbols</span>
              {!isEnActive && (
                <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] uppercase font-semibold border border-amber-500/20">
                  Input
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-500">{glyphCount} glyphs</span>
              <button
                onClick={() => handleCopy(koboldText, "kobold")}
                disabled={!koboldText}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition disabled:opacity-40"
                title="Copy Kobold Text"
              >
                {copiedField === "kobold" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              {!isEnActive && (
                <button
                  onClick={() => onKoboldTextChange("")}
                  disabled={!koboldText}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition disabled:opacity-40"
                  title="Clear Kobold Text"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <textarea
            value={koboldText}
            onChange={(e) => onKoboldTextChange(e.target.value)}
            readOnly={isEnActive}
            placeholder={!isEnActive ? "Enter Kobold ternary symbols here (. - : and spaces)..." : "Encoded Kobold symbols will appear here..."}
            className={`w-full flex-1 mt-3 bg-slate-950/80 p-3 rounded-lg border font-mono text-base sm:text-lg text-amber-300 tracking-wider placeholder-slate-700 focus:outline-none resize-none ${
              !isEnActive
                ? "border-slate-800 focus:border-amber-500/60"
                : "border-slate-900 cursor-default"
            }`}
          />

          {/* Quick Play Control Bar in Kobold Panel */}
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-800 text-xs">
            <span className="text-slate-500 text-[11px]">
              Symbols: <code className="text-amber-400">.</code> (Tap), <code className="text-amber-400">-</code> (Scratch), <code className="text-amber-400">:</code> (Bite)
            </span>

            <div className="flex items-center gap-2">
              {isPlaying ? (
                <button
                  onClick={onStop}
                  className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition shadow"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop Speech</span>
                </button>
              ) : (
                <button
                  onClick={onPlay}
                  disabled={!koboldText.trim()}
                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs transition shadow-md shadow-amber-500/20 disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Play Kobold</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
