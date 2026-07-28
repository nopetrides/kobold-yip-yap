import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  onOpenTestModal: () => void;
  onOpenConnectedOptions?: () => void;
  connectedEnabled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTestModal,
  onOpenConnectedOptions,
  connectedEnabled = false,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 py-6 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xl font-mono font-bold tracking-widest border border-amber-500/30">
              .:-
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-400">
              Kobold YipYap
            </h1>
          </div>
          <p className="text-slate-400 text-sm sm:text-base mt-1">
            <span className="text-slate-200 font-semibold">Ternary Translator &amp; Speech Synth</span> — Translate written English into Kobold symbols and synthesize audio speech.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenConnectedOptions && (
            <button
              onClick={onOpenConnectedOptions}
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg border transition ${
                connectedEnabled
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
              title="Configure Connected Shape Glyph Renderer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Connected Shapes {connectedEnabled ? "(ON)" : "(OFF)"}</span>
            </button>
          )}

          <button
            onClick={onOpenTestModal}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg border border-slate-700 transition"
            title="Run Spec Diagnostic Tests"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Run Spec Diagnostics</span>
          </button>
        </div>
      </div>
    </header>
  );
};
