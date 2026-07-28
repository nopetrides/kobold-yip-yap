import React, { useRef } from "react";
import { Download, Upload, Copy, FileText, Check } from "lucide-react";
import { AppSettings } from "../types";
import { exportSettingsJSON, importSettingsJSON } from "../utils/settingsStorage";

interface ImportExportControlsProps {
  englishText: string;
  koboldText: string;
  settings: AppSettings;
  onImportSettings: (newSettings: AppSettings) => void;
}

export const ImportExportControls: React.FC<ImportExportControlsProps> = ({
  englishText,
  koboldText,
  settings,
  onImportSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedStatus, setCopiedStatus] = React.useState<string | null>(null);

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonStr = exportSettingsJSON(settings);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kobold-translator-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const imported = importSettingsJSON(content);
          onImportSettings(imported);
          alert("Settings imported successfully!");
        } catch (err) {
          alert("Failed to import settings: Invalid file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(label);
    setTimeout(() => setCopiedStatus(null), 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 my-6 space-y-3 shadow-md">
      <h3 className="text-sm font-bold text-slate-200">Import & Export Data</h3>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Copy English */}
        <button
          onClick={() => handleCopy(englishText, "English")}
          disabled={!englishText}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-40"
        >
          {copiedStatus === "English" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>Copy English</span>
        </button>

        {/* Copy Kobold */}
        <button
          onClick={() => handleCopy(koboldText, "Kobold")}
          disabled={!koboldText}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-40"
        >
          {copiedStatus === "Kobold" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>Copy Kobold</span>
        </button>

        {/* Download Kobold Text */}
        <button
          onClick={() => handleDownloadFile("kobold-translation.txt", koboldText)}
          disabled={!koboldText}
          className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 font-mono transition disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Download Kobold (.txt)</span>
        </button>

        {/* Download English Text */}
        <button
          onClick={() => handleDownloadFile("english-text.txt", englishText)}
          disabled={!englishText}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-40"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Download English (.txt)</span>
        </button>

        {/* Export Settings */}
        <button
          onClick={handleExportJSON}
          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 flex items-center gap-1.5 font-semibold transition"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Export Settings (JSON)</span>
        </button>

        {/* Import Settings */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import Settings</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImportJSON}
        />
      </div>
    </div>
  );
};
