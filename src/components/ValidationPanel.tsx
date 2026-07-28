import React from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { TranslationWarning } from "../types";

interface ValidationPanelProps {
  warnings: TranslationWarning[];
  missingAudioSymbols?: string[];
  audioError?: string;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  warnings,
  missingAudioSymbols = [],
  audioError,
}) => {
  const hasWarnings = warnings.length > 0;
  const hasAudioIssues = missingAudioSymbols.length > 0 || !!audioError;

  if (!hasWarnings && !hasAudioIssues) {
    return null;
  }

  return (
    <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-4 my-4 space-y-3">
      <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Validation & Audio Alerts</span>
      </div>

      <ul className="text-xs sm:text-sm text-amber-200/90 space-y-1.5 list-disc list-inside pl-1">
        {hasAudioIssues && audioError && (
          <li className="flex items-start gap-2 text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{audioError}</span>
          </li>
        )}

        {missingAudioSymbols.length > 0 && (
          <li className="flex items-start gap-2 text-amber-300">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Missing audio clips for symbols:{" "}
              <strong className="font-mono text-amber-200">
                {missingAudioSymbols.join(", ")}
              </strong>
              . Upload audio or reset to built-in sounds to play full text.
            </span>
          </li>
        )}

        {warnings.map((warn, idx) => (
          <li key={idx} className="font-mono text-amber-300/90 leading-relaxed">
            {warn.message}
          </li>
        ))}
      </ul>
    </div>
  );
};
