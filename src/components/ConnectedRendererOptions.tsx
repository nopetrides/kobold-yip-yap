import React from "react";
import { Sliders, Sparkles, Eye, Power, RotateCcw } from "lucide-react";
import {
  ConnectedRendererSettings,
  ConnectedShapeStyle,
  ConnectedShapeColor,
} from "../types";
import { ConnectedGlyph } from "./ConnectedGlyph";

interface ConnectedRendererOptionsProps {
  settings: ConnectedRendererSettings;
  onChange: (updated: ConnectedRendererSettings) => void;
  onClose?: () => void;
}

export const ConnectedRendererOptions: React.FC<ConnectedRendererOptionsProps> = ({
  settings,
  onChange,
  onClose,
}) => {
  const stylesList: { key: ConnectedShapeStyle; label: string; desc: string }[] = [
    { key: "junction", label: "Structural Junctions", desc: "Clean joins forming structural T, L, Cross, and Gate runes (e.g. T = ┤)" },
    { key: "runic", label: "Runic Ring Caps", desc: "Structural junctions embellished with terminal loop caps & badge frames" },
    { key: "chiseled", label: "Chiseled Stone", desc: "Bold structural strokes with angular chiseled joint accents" },
    { key: "wireframe", label: "Geometric Wireframe", desc: "Minimalist vector line art with diamond node markers at junctions" },
  ];

  const themesList: { key: ConnectedShapeColor; label: string; bgClass: string }[] = [
    { key: "amber", label: "Amber Gold", bgClass: "bg-amber-500" },
    { key: "cyan", label: "Cyber Cyan", bgClass: "bg-sky-400" },
    { key: "emerald", label: "Emerald Sigil", bgClass: "bg-emerald-400" },
    { key: "amethyst", label: "Amethyst Mystical", bgClass: "bg-purple-400" },
    { key: "monochrome", label: "Monochrome", bgClass: "bg-slate-200" },
  ];

  const updateField = <K extends keyof ConnectedRendererSettings>(
    field: K,
    val: ConnectedRendererSettings[K]
  ) => {
    onChange({
      ...settings,
      [field]: val,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Connected Symbol Shape Renderer
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30 uppercase">
                Structural Glyph Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Composes Kobold symbols (.-:) into unified structural rune junctions
            </p>
          </div>
        </div>

        {/* Master Power Toggle */}
        <button
          onClick={() => updateField("enabled", !settings.enabled)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow ${
            settings.enabled
              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
              : "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40"
          }`}
          title={settings.enabled ? "Connected Renderer Enabled" : "Connected Renderer Disabled"}
        >
          <Power className="w-4 h-4" />
          <span>{settings.enabled ? "Renderer ON" : "Renderer OFF"}</span>
        </button>
      </div>

      {/* Live Interactive Preview */}
      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col items-center justify-center space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
          Live Structural Glyph Preview ("A" = <code className="text-amber-400 font-bold">.</code>, "I" = <code className="text-amber-400 font-bold">-</code>, "B" = <code className="text-amber-400 font-bold">...</code>, "F" = <code className="text-amber-400 font-bold">.-.</code>, "T" = <code className="text-amber-400 font-bold">-:</code>)
        </span>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <ConnectedGlyph
            glyphCode="."
            englishChar="A"
            settings={settings}
            size="md"
          />
          <ConnectedGlyph
            glyphCode="-"
            englishChar="I"
            settings={settings}
            size="md"
          />
          <ConnectedGlyph
            glyphCode="..."
            englishChar="B"
            settings={settings}
            size="md"
          />
          <ConnectedGlyph
            glyphCode=".-."
            englishChar="F"
            settings={settings}
            size="md"
          />
          <ConnectedGlyph
            glyphCode="-:"
            englishChar="T"
            settings={settings}
            size="md"
          />
        </div>
      </div>

      {settings.enabled && (
        <div className="space-y-5 text-xs text-slate-300">
          {/* Shape Style Picker */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 block flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Structural Runic Style</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {stylesList.map((st) => (
                <button
                  key={st.key}
                  onClick={() => updateField("style", st.key)}
                  className={`p-2.5 rounded-xl text-left border transition flex flex-col gap-0.5 ${
                    settings.style === st.key
                      ? "bg-amber-500/10 border-amber-500 text-amber-300 shadow"
                      : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <span className="font-bold text-slate-100 text-xs">{st.label}</span>
                  <span className="text-[11px] text-slate-400">{st.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Themes */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 block">Color Theme</label>
            <div className="flex items-center gap-2 flex-wrap">
              {themesList.map((tm) => (
                <button
                  key={tm.key}
                  onClick={() => updateField("colorTheme", tm.key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                    settings.colorTheme === tm.key
                      ? "bg-slate-800 border-amber-400 text-slate-100 shadow"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${tm.bgClass}`} />
                  <span>{tm.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders: Stroke Width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              <div className="flex justify-between font-semibold text-slate-300 text-xs">
                <span>Stroke Weight</span>
                <span className="font-mono text-amber-400">{settings.strokeWidth}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                step="0.5"
                value={settings.strokeWidth}
                onChange={(e) => updateField("strokeWidth", parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          {/* Display Locations & Options */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="font-bold text-slate-200 block flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Display Locations & Extras</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-800/40">
                <input
                  type="checkbox"
                  checked={settings.renderInWorkspace}
                  onChange={(e) => updateField("renderInWorkspace", e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>Show connected strip in Workspace</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-800/40">
                <input
                  type="checkbox"
                  checked={settings.renderInTable}
                  onChange={(e) => updateField("renderInTable", e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>Show in Character Table</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-800/40">
                <input
                  type="checkbox"
                  checked={settings.renderInPlayback}
                  onChange={(e) => updateField("renderInPlayback", e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>Highlight in Playback Display</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950/60 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-800/40">
                <input
                  type="checkbox"
                  checked={settings.glowEffect}
                  onChange={(e) => updateField("glowEffect", e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>SVG Drop Shadow Glow</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Footer Controls & Quick Removable Master Reset */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={() => {
            onChange({
              ...settings,
              enabled: false,
            });
            if (onClose) onClose();
          }}
          className="px-3.5 py-1.5 rounded-lg bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold border border-rose-800/50 flex items-center gap-1.5 transition"
          title="Turn off connected glyph shapes completely"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Disable & Remove Connected Shapes</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Close Options
          </button>
        )}
      </div>
    </div>
  );
};
