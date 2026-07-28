import React, { useState } from "react";
import { ChevronDown, ChevronUp, Play, Copy, Check, Search, BookOpen } from "lucide-react";
import { CategoryType, ConnectedRendererSettings } from "../types";
import { KOBOLD_CHARACTER_TABLE } from "../utils/koboldCharacterMap";
import { ConnectedGlyph } from "./ConnectedGlyph";

interface CharacterTableProps {
  onPreviewSymbolSequence: (code: string) => void;
  connectedSettings?: ConnectedRendererSettings;
}

export const CharacterTable: React.FC<CharacterTableProps> = ({
  onPreviewSymbolSequence,
  connectedSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const categories: { key: CategoryType | "all"; label: string }[] = [
    { key: "all", label: "All Characters" },
    { key: "letter", label: "Letters" },
    { key: "number", label: "Numbers" },
    { key: "punctuation", label: "Punctuation" },
    { key: "phoneme", label: "Phonemes" },
  ];

  const filteredCharacters = KOBOLD_CHARACTER_TABLE.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.english.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      (item.label && item.label.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleCopyGlyph = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl my-6 overflow-hidden shadow-md">
      {/* Header Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between bg-slate-900 hover:bg-slate-800/80 transition text-left"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-base font-bold text-slate-100">Kobold Character Table</h2>
            <p className="text-xs text-slate-400">
              Complete canonical ternary mapping dictionary ({KOBOLD_CHARACTER_TABLE.length} entries)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-mono hidden sm:inline">
            {isOpen ? "Collapse" : "Expand Table"}
          </span>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-950/40">
          {/* Filters & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeCategory === cat.key
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search character or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredCharacters.map((charItem) => (
              <div
                key={charItem.english + charItem.code}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between hover:border-amber-500/40 transition group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-lg font-bold text-slate-100 font-mono">
                      {charItem.english}
                    </span>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">
                      {charItem.category}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopyGlyph(charItem.code)}
                    className="p-1 text-slate-500 hover:text-amber-400 rounded transition"
                    title="Click to copy Kobold glyph"
                  >
                    {copiedCode === charItem.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {connectedSettings?.enabled && connectedSettings?.renderInTable ? (
                  <div className="my-2 flex justify-center">
                    <ConnectedGlyph
                      glyphCode={charItem.code}
                      englishChar={charItem.english}
                      settings={{ ...connectedSettings, showLabels: false }}
                      size="sm"
                    />
                  </div>
                ) : (
                  <div className="my-2 py-1.5 px-2 bg-slate-950 rounded-lg border border-slate-800/80 text-center font-mono text-base font-bold text-amber-300 tracking-wider">
                    {charItem.code}
                  </div>
                )}

                <button
                  onClick={() => onPreviewSymbolSequence(charItem.code)}
                  className="w-full py-1 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Play</span>
                </button>
              </div>
            ))}
          </div>

          {filteredCharacters.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No matching characters found for "{searchQuery}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
