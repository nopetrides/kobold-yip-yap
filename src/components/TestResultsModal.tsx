import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, RefreshCw, X, ShieldCheck } from "lucide-react";
import { runAllUnitTests, TestResult } from "../utils/unitTests";

interface TestResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestResultsModal: React.FC<TestResultsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tests, setTests] = useState<TestResult[]>([]);

  const handleRunTests = () => {
    const res = runAllUnitTests();
    setTests(res);
  };

  useEffect(() => {
    if (isOpen) {
      handleRunTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalPass = tests.filter((t) => t.passed).length;
  const allPassed = tests.length > 0 && totalPass === tests.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100">Specification Diagnostics</h2>
              <p className="text-xs text-slate-400">
                Automated tests for mapping integrity, encoding, decoding, and spacing rules.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Overview Badge */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-semibold ${
              allPassed
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/40 border-rose-500/40 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {allPassed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
              <span>
                {allPassed
                  ? "All Specification Tests Passed Successfully!"
                  : `${totalPass} / ${tests.length} Tests Passed`}
              </span>
            </div>

            <button
              onClick={handleRunTests}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-run</span>
            </button>
          </div>

          {/* Test List */}
          <div className="space-y-3">
            {tests.map((test, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{test.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      test.passed
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {test.passed ? "PASS" : "FAIL"}
                  </span>
                </div>

                <p className="text-slate-400 text-xs font-sans leading-relaxed">
                  {test.message}
                </p>

                {test.details && (
                  <div className="bg-slate-900 p-2 rounded text-rose-300 text-[11px] mt-2 font-mono">
                    {test.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
