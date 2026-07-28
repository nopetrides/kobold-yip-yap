import React from "react";
import { Play, Pause, RotateCcw, Square, Volume2, FastForward, Repeat } from "lucide-react";

interface PlaybackToolbarProps {
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  loop: boolean;
  onLoopChange: (loop: boolean) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  globalSpeed: number;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

export const PlaybackToolbar: React.FC<PlaybackToolbarProps> = ({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onResume,
  onStop,
  loop,
  onLoopChange,
  volume,
  onVolumeChange,
  globalSpeed,
  onSpeedChange,
  disabled = false,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 my-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-md">
      {/* Playback Action Buttons */}
      <div className="flex items-center gap-2">
        {!isPlaying && !isPaused && (
          <button
            onClick={onPlay}
            disabled={disabled}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition shadow-md shadow-amber-500/20 disabled:opacity-40"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Play Speech</span>
          </button>
        )}

        {isPlaying && (
          <button
            onClick={onPause}
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition"
          >
            <Pause className="w-4 h-4 fill-slate-950" />
            <span>Pause</span>
          </button>
        )}

        {isPaused && (
          <button
            onClick={onResume}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition shadow-md"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Resume</span>
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            onClick={onStop}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 font-semibold px-3.5 py-2 rounded-lg text-sm border border-slate-700 transition"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop</span>
          </button>
        )}

        {/* Loop Toggle */}
        <button
          onClick={() => onLoopChange(!loop)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
            loop
              ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
              : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
          }`}
          title="Loop Playback"
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>Loop</span>
        </button>
      </div>

      {/* Speed & Volume Sliders */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
        {/* Speed Slider */}
        <div className="flex items-center gap-2 min-w-[150px]">
          <FastForward className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">Speed:</span>
          <input
            type="range"
            min="0.25"
            max="3.0"
            step="0.05"
            value={globalSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-20 accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-amber-300 w-10 text-right">{globalSpeed.toFixed(2)}×</span>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 min-w-[150px]">
          <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">Volume:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-amber-300 w-9 text-right">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
