import { useState, useRef, useCallback, useEffect } from "react";
import { AudioClipsMap } from "../types";
import { generateDefaultAudioBuffer } from "../utils/defaultAudioGenerator";

export function useAudioBuffers() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const [clips, setClips] = useState<AudioClipsMap>({
    ".": { buffer: null, fileName: "Default Tap.wav", durationSeconds: 0.05, isCustom: false, isDecoding: false },
    "-": { buffer: null, fileName: "Default Scratch.wav", durationSeconds: 0.07, isCustom: false, isDecoding: false },
    ":": { buffer: null, fileName: "Default Bite.wav", durationSeconds: 0.08, isCustom: false, isDecoding: false },
  });

  const loadDefaultSound = useCallback(async (sym: "." | "-" | ":") => {
    const ctx = getAudioContext();
    const baseUrl = import.meta.env.BASE_URL || "/";
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";

    const soundUrls = {
      ".": `${cleanBaseUrl}sounds/Default Tap.wav`,
      "-": `${cleanBaseUrl}sounds/Default Scratch.wav`,
      ":": `${cleanBaseUrl}sounds/Default Bite.wav`,
    };
    const fileNames = {
      ".": "Default Tap.wav",
      "-": "Default Scratch.wav",
      ":": "Default Bite.wav",
    };

    setClips((prev) => ({
      ...prev,
      [sym]: { ...prev[sym], isDecoding: true, error: undefined },
    }));

    try {
      const response = await fetch(soundUrls[sym]);
      if (!response.ok) throw new Error(`Network error (${response.status}) fetching sound clip.`);
      const arrayBuffer = await response.arrayBuffer();
      
      const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
        ctx.decodeAudioData(arrayBuffer, resolve, reject);
      });

      setClips((prev) => ({
        ...prev,
        [sym]: {
          buffer: audioBuffer,
          fileName: fileNames[sym],
          durationSeconds: audioBuffer.duration,
          isCustom: false,
          isDecoding: false,
          error: undefined,
        },
      }));
    } catch (err) {
      console.warn(`Failed to fetch default audio file for ${sym}, falling back to Web Audio synthesis:`, err);
      try {
        const fallbackBuffer = generateDefaultAudioBuffer(ctx, sym);
        setClips((prev) => ({
          ...prev,
          [sym]: {
            buffer: fallbackBuffer,
            fileName: `${fileNames[sym]} (Synthesized)`,
            durationSeconds: fallbackBuffer.duration,
            isCustom: false,
            isDecoding: false,
            error: undefined,
          },
        }));
      } catch (synthErr) {
        setClips((prev) => ({
          ...prev,
          [sym]: {
            ...prev[sym],
            isDecoding: false,
            error: "Failed to load default sound.",
          },
        }));
      }
    }
  }, [getAudioContext]);

  // Ensure default generated buffers exist on load
  useEffect(() => {
    const symbols: ("." | "-" | ":")[] = [".", "-", ":"];
    symbols.forEach(sym => {
      // We check if it already has a buffer to avoid reloading if already loaded, 
      // but in strict mode this will fire twice so state checks aren't perfect inside the loop. 
      // It's safe to just fire them, as React state handles it.
      loadDefaultSound(sym);
    });
  }, [loadDefaultSound]);

  // Upload custom file for a symbol
  const uploadAudioFile = useCallback(
    async (symbol: "." | "-" | ":", file: File) => {
      setClips((prev) => ({
        ...prev,
        [symbol]: { ...prev[symbol], isDecoding: true, error: undefined },
      }));

      try {
        const ctx = getAudioContext();
        const arrayBuffer = await file.arrayBuffer();
        
        // decodeAudioData
        const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
          ctx.decodeAudioData(arrayBuffer, resolve, reject);
        });

        setClips((prev) => ({
          ...prev,
          [symbol]: {
            buffer: audioBuffer,
            fileName: file.name,
            durationSeconds: audioBuffer.duration,
            isCustom: true,
            isDecoding: false,
          },
        }));
      } catch (err: any) {
        console.error("Audio decoding error:", err);
        setClips((prev) => ({
          ...prev,
          [symbol]: {
            ...prev[symbol],
            isDecoding: false,
            error: "Failed to decode audio file. Please try a valid WAV/MP3/OGG file.",
          },
        }));
      }
    },
    [getAudioContext]
  );

  // Reset symbol to built-in default sound
  const resetToDefaultAudio = useCallback(
    (symbol: "." | "-" | ":") => {
      loadDefaultSound(symbol);
    },
    [loadDefaultSound]
  );

  // Preview play a single buffer with optional semitones
  const previewAudio = useCallback(
    (symbol: "." | "-" | ":", semitones: number = 0, volume: number = 0.8) => {
      const ctx = getAudioContext();
      const clipState = clips[symbol];
      if (!clipState || !clipState.buffer) return;

      const source = ctx.createBufferSource();
      source.buffer = clipState.buffer;
      source.playbackRate.value = Math.pow(2, semitones / 12);

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start();
    },
    [clips, getAudioContext]
  );

  return {
    getAudioContext,
    clips,
    uploadAudioFile,
    resetToDefaultAudio,
    previewAudio,
  };
}
