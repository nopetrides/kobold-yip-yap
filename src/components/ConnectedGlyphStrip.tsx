import React, { useState } from "react";
import { Sparkles, Settings, EyeOff, Copy, Check } from "lucide-react";
import { ConnectedRendererSettings } from "../types";
import { ConnectedGlyph } from "./ConnectedGlyph";
import { KOBOLD_TO_ENGLISH_MAP } from "../utils/koboldCharacterMap";
import { encodeEnglishToKobold } from "../utils/encodeEnglish";

interface ConnectedGlyphStripProps {
  koboldText: string;
  englishText?: string;
  settings: ConnectedRendererSettings;
  onUpdateSettings: (updated: ConnectedRendererSettings) => void;
  activeGlyphIndex?: number; // 1-indexed glyph index currently playing
  onToggleOptions?: () => void;
  className?: string;
}

export const ConnectedGlyphStrip: React.FC<ConnectedGlyphStripProps> = ({
  koboldText,
  englishText = "",
  settings,
  onUpdateSettings,
  activeGlyphIndex,
  onToggleOptions,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  if (!settings.enabled || !settings.renderInWorkspace) {
    return null;
  }

  // Derive Kobold text if missing
  const effectiveKobold = koboldText.trim()
    ? koboldText
    : encodeEnglishToKobold(englishText).output;

  if (!effectiveKobold.trim()) {
    return null;
  }

  // Parse lines, words, and glyphs
  const lines = effectiveKobold.split(/\r?\n/);
  let globalGlyphCounter = 0;

  const handleCopySvgSequence = () => {
    navigator.clipboard.writeText(effectiveKobold);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200">Connected Glyph Shape View</span>
          <span className="bg-amber-500/10 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/20">
            {settings.style} style
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <button
            onClick={handleCopySvgSequence}
            className="p-1 hover:text-amber-300 text-slate-400 rounded transition"
            title="Copy Kobold Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {onToggleOptions && (
            <button
              onClick={onToggleOptions}
              className="p-1 hover:text-amber-300 text-slate-400 rounded transition"
              title="Connected Shape Renderer Options"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onUpdateSettings({ ...settings, renderInWorkspace: false })}
            className="p-1 hover:text-rose-400 text-slate-400 rounded transition"
            title="Hide Connected Shape View (Easily Removable)"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Glyphs Display Container */}
      <div className="flex flex-wrap gap-x-6 gap-y-4 max-h-60 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 custom-scrollbar">
        {lines.map((line, lineIdx) => {
          if (!line.trim()) return null;
          const words = line.split(/ {2,}/);

          return (
            <div key={lineIdx} className="flex flex-wrap gap-x-5 gap-y-3 items-center">
              {words.map((wordStr, wordIdx) => {
                if (!wordStr.trim()) return null;
                const glyphs = wordStr.trim().split(" ");

                return (
                  <div
                    key={wordIdx}
                    className="flex items-center gap-1.5 p-1.5 bg-slate-900/60 rounded-xl border border-slate-800/50"
                  >
                    {glyphs.map((g, gIdx) => {
                      if (!g) return null;
                      const validSymbols = g.replace(/[^.\-:]/g, "");
                      if (!validSymbols) return null;

                      globalGlyphCounter++;
                      const currentCount = globalGlyphCounter;
                      const engChar = KOBOLD_TO_ENGLISH_MAP.get(validSymbols) || "[?]";
                      const isActive = activeGlyphIndex === currentCount;

                      return (
                        <ConnectedGlyph
                          key={gIdx}
                          glyphCode={validSymbols}
                          englishChar={engChar}
                          settings={settings}
                          size="md"
                          isActive={isActive}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
