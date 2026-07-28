import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Header } from "./components/Header";
import { TranslationWorkspace } from "./components/TranslationWorkspace";
import { ConnectedGlyphStrip } from "./components/ConnectedGlyphStrip";
import { ConnectedRendererOptions } from "./components/ConnectedRendererOptions";
import { ValidationPanel } from "./components/ValidationPanel";
import { CurrentPlaybackDisplay } from "./components/CurrentPlaybackDisplay";
import { PlaybackToolbar } from "./components/PlaybackToolbar";
import { AudioSettings } from "./components/AudioSettings";
import { CharacterTable } from "./components/CharacterTable";
import { ImportExportControls } from "./components/ImportExportControls";
import { TestResultsModal } from "./components/TestResultsModal";

import { AppSettings, TranslationWarning } from "./types";
import {
  DEFAULT_SETTINGS,
  loadSettingsFromStorage,
  saveSettingsToStorage,
} from "./utils/settingsStorage";
import { encodeEnglishToKobold } from "./utils/encodeEnglish";
import { decodeKoboldToEnglish } from "./utils/decodeKobold";
import { buildPlaybackSequence } from "./utils/buildPlaybackSequence";
import { useAudioBuffers } from "./hooks/useAudioBuffers";
import { usePlaybackScheduler } from "./hooks/usePlaybackScheduler";

export default function App() {
  // Settings state persisted in localStorage
  const [settings, setSettings] = useState<AppSettings>(() => loadSettingsFromStorage());
  const [englishText, setEnglishText] = useState<string>(settings.englishText);
  const [koboldText, setKoboldText] = useState<string>(settings.koboldText);
  const [warnings, setWarnings] = useState<TranslationWarning[]>([]);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isConnectedOptionsOpen, setIsConnectedOptionsOpen] = useState(false);

  // Audio Hooks
  const { getAudioContext, clips, uploadAudioFile, resetToDefaultAudio, previewAudio } =
    useAudioBuffers();

  const {
    isPlaying,
    isPaused,
    currentInfo,
    startPlayback,
    pausePlayback,
    resumePlayback,
    stopPlayback,
  } = usePlaybackScheduler(getAudioContext, clips, settings.volume, settings.loop, settings.glyphOverlap);

  // Save non-audio settings to localStorage
  useEffect(() => {
    saveSettingsToStorage({
      ...settings,
      englishText,
      koboldText,
    });
  }, [settings, englishText, koboldText]);

  // Handle Real-time Translation
  useEffect(() => {
    if (settings.direction === "enToKobold") {
      const res = encodeEnglishToKobold(englishText);
      setKoboldText(res.output);
      setWarnings(res.warnings);
    }
  }, [englishText, settings.direction]);

  useEffect(() => {
    if (settings.direction === "koboldToEn") {
      const res = decodeKoboldToEnglish(koboldText, {
        caseMode: settings.outputCase,
      });
      setEnglishText(res.output);
      setWarnings(res.warnings);
    }
  }, [koboldText, settings.direction, settings.outputCase]);

  // Handle Play Speech
  const handlePlaySpeech = useCallback(() => {
    const textToPlay = settings.direction === "enToKobold" ? englishText : koboldText;
    const isKoboldSrc = settings.direction === "koboldToEn";

    const sequence = buildPlaybackSequence(textToPlay, settings, isKoboldSrc);
    if (sequence.length > 0) {
      startPlayback(sequence);
    }
  }, [englishText, koboldText, settings, startPlayback]);

  // Handle Preview single symbol sequence from character table
  const handlePreviewSymbolSequence = useCallback(
    (code: string) => {
      const sequence = buildPlaybackSequence(code, settings, true);
      if (sequence.length > 0) {
        startPlayback(sequence);
      }
    },
    [settings, startPlayback]
  );

  // Handle direction swap
  const handleSwap = useCallback(() => {
    const nextDir = settings.direction === "enToKobold" ? "koboldToEn" : "enToKobold";
    setSettings((prev) => ({ ...prev, direction: nextDir }));
  }, [settings.direction]);

  // Handle reset all settings
  const handleResetAllSettings = useCallback(() => {
    if (window.confirm("Are you sure you want to reset all settings to their default values?")) {
      setSettings(DEFAULT_SETTINGS);
      setEnglishText(DEFAULT_SETTINGS.englishText);
      setKoboldText(DEFAULT_SETTINGS.koboldText);
      resetToDefaultAudio(".");
      resetToDefaultAudio("-");
      resetToDefaultAudio(":");
    }
  }, [resetToDefaultAudio]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* App Header */}
      <Header
        onOpenTestModal={() => setIsTestModalOpen(true)}
        onOpenConnectedOptions={() => setIsConnectedOptionsOpen(true)}
        connectedEnabled={settings.connectedRenderer.enabled}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Translation Workspace */}
        <TranslationWorkspace
          direction={settings.direction}
          onDirectionChange={(dir) => setSettings((s) => ({ ...s, direction: dir }))}
          englishText={englishText}
          onEnglishTextChange={setEnglishText}
          koboldText={koboldText}
          onKoboldTextChange={setKoboldText}
          outputCase={settings.outputCase}
          onOutputCaseChange={(cMode) => setSettings((s) => ({ ...s, outputCase: cMode }))}
          onPlay={handlePlaySpeech}
          onStop={stopPlayback}
          isPlaying={isPlaying || isPaused}
          onSwap={handleSwap}
        />

        {/* Connected Symbol Shape Strip */}
        <ConnectedGlyphStrip
          koboldText={koboldText}
          englishText={englishText}
          settings={settings.connectedRenderer}
          onUpdateSettings={(updated) => setSettings((s) => ({ ...s, connectedRenderer: updated }))}
          activeGlyphIndex={currentInfo.isPlaying ? currentInfo.characterIndex : undefined}
          onToggleOptions={() => setIsConnectedOptionsOpen(true)}
        />

        {/* Connected Renderer Options Collapsible / Inline Modal */}
        {isConnectedOptionsOpen && (
          <div className="relative z-20">
            <ConnectedRendererOptions
              settings={settings.connectedRenderer}
              onChange={(updated) => setSettings((s) => ({ ...s, connectedRenderer: updated }))}
              onClose={() => setIsConnectedOptionsOpen(false)}
            />
          </div>
        )}

        {/* Validation & Audio Warnings */}
        <ValidationPanel warnings={warnings} />

        {/* Playback Progress & Real-time Indicator */}
        <CurrentPlaybackDisplay
          info={currentInfo}
          connectedSettings={settings.connectedRenderer}
        />

        {/* Main Playback Control Bar */}
        <PlaybackToolbar
          isPlaying={isPlaying}
          isPaused={isPaused}
          onPlay={handlePlaySpeech}
          onPause={pausePlayback}
          onResume={resumePlayback}
          onStop={stopPlayback}
          loop={settings.loop}
          onLoopChange={(loopVal) => setSettings((s) => ({ ...s, loop: loopVal }))}
          volume={settings.volume}
          onVolumeChange={(volVal) => setSettings((s) => ({ ...s, volume: volVal }))}
          globalSpeed={settings.timing.globalSpeed}
          onSpeedChange={(speedVal) =>
            setSettings((s) => ({
              ...s,
              timing: { ...s.timing, globalSpeed: speedVal },
            }))
          }
          disabled={!koboldText.trim()}
        />

        {/* Audio Clips & Pitch Settings */}
        <AudioSettings
          clips={clips}
          onUploadFile={uploadAudioFile}
          onResetAudio={resetToDefaultAudio}
          onPreviewSymbol={previewAudio}
          settings={settings}
          onUpdateSettings={setSettings}
          onResetAllSettings={handleResetAllSettings}
        />

        {/* Character Map Table */}
        <CharacterTable
          onPreviewSymbolSequence={handlePreviewSymbolSequence}
          connectedSettings={settings.connectedRenderer}
        />

        {/* Import & Export Controls */}
        <ImportExportControls
          englishText={englishText}
          koboldText={koboldText}
          settings={settings}
          onImportSettings={(newSet) => {
            setSettings(newSet);
            if (newSet.englishText) setEnglishText(newSet.englishText);
            if (newSet.koboldText) setKoboldText(newSet.koboldText);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4">
          Kobold YipYap • Ternary Translator & Speech Synth • Pure Web Audio API & Client-side Transliteration • nopetrides
        </div>
      </footer>

      {/* Diagnostics Test Runner Modal */}
      <TestResultsModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}
