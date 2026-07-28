import { useState, useRef, useCallback, useEffect } from "react";
import {
  AudioClipsMap,
  CurrentPlaybackInfo,
  PlaybackItem,
  SymbolPlaybackEvent,
  GlyphOverlapSettings,
} from "../types";

export function usePlaybackScheduler(
  getAudioContext: () => AudioContext,
  clips: AudioClipsMap,
  volume: number,
  loop: boolean,
  glyphOverlap?: GlyphOverlapSettings
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(-1);

  const [currentInfo, setCurrentInfo] = useState<CurrentPlaybackInfo>({
    isPlaying: false,
    isPaused: false,
    activeItemIndex: -1,
    totalItems: 0,
    currentSymbol: null,
    currentEnglishChar: "",
    currentGlyph: "",
    currentPitchLevel: null,
    characterIndex: 0,
    totalCharacters: 0,
  });

  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const itemsRef = useRef<PlaybackItem[]>([]);
  const currentIndexRef = useRef<number>(0);
  const isCancelledRef = useRef<boolean>(false);

  const clearAllScheduled = useCallback(() => {
    isCancelledRef.current = true;
    // Stop audio nodes
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {
        // Source might already be stopped
      }
    });
    activeSourcesRef.current = [];

    // Clear timers
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  const stopPlayback = useCallback(() => {
    clearAllScheduled();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveItemIndex(-1);
    setCurrentInfo({
      isPlaying: false,
      isPaused: false,
      activeItemIndex: -1,
      totalItems: 0,
      currentSymbol: null,
      currentEnglishChar: "",
      currentGlyph: "",
      currentPitchLevel: null,
      characterIndex: 0,
      totalCharacters: 0,
    });
  }, [clearAllScheduled]);

  const playSequenceFrom = useCallback(
    (items: PlaybackItem[], startIndex: number = 0) => {
      clearAllScheduled();

      if (!items || items.length === 0 || startIndex >= items.length) {
        stopPlayback();
        return;
      }

      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Master audio node setup (Dynamics compressor for gluing pseudo-mixing)
      let destinationNode: AudioNode = ctx.destination;
      if (glyphOverlap?.enabled && glyphOverlap?.masterCompression) {
        try {
          const compressor = ctx.createDynamicsCompressor();
          compressor.threshold.value = -20;
          compressor.knee.value = 10;
          compressor.ratio.value = 6;
          compressor.attack.value = 0.005;
          compressor.release.value = 0.1;
          compressor.connect(ctx.destination);
          destinationNode = compressor;
        } catch (err) {
          destinationNode = ctx.destination;
        }
      }

      isCancelledRef.current = false;
      itemsRef.current = items;
      currentIndexRef.current = startIndex;

      setIsPlaying(true);
      setIsPaused(false);

      const symbolEvents = items.filter((it) => it.type === "symbol") as SymbolPlaybackEvent[];
      const totalGlyphs = symbolEvents.length > 0 ? Math.max(...symbolEvents.map((s) => s.glyphIndex)) : 0;

      let delayAcc = 0; // Accumulated delay in milliseconds

      for (let i = startIndex; i < items.length; i++) {
        const item = items[i];

        if (item.type === "symbol") {
          const symEvent = item as SymbolPlaybackEvent;
          const scheduleDelay = delayAcc;
          const clipState = clips[symEvent.symbol];

          // Check if this symbol belongs to a multi-symbol glyph and if there is a next symbol in the same glyph
          const isMultiSymbolGlyph = symEvent.glyph && symEvent.glyph.length > 1;

          let nextSymbolEvent: SymbolPlaybackEvent | null = null;
          for (let j = i + 1; j < items.length; j++) {
            if (items[j].type === "symbol") {
              nextSymbolEvent = items[j] as SymbolPlaybackEvent;
              break;
            }
          }

          const isNextInSameGlyph =
            nextSymbolEvent !== null &&
            nextSymbolEvent.glyphIndex === symEvent.glyphIndex;

          const compressionFactor =
            glyphOverlap?.enabled && isMultiSymbolGlyph && glyphOverlap.glyphCompression
              ? glyphOverlap.glyphCompression
              : 1.0;

          const effectiveRate = symEvent.playbackRate * compressionFactor;

          // Timer for UI sync & playing audio
          const timerId = window.setTimeout(() => {
            if (isCancelledRef.current) return;

            currentIndexRef.current = i;
            setActiveItemIndex(i);

            // Play audio buffer
            if (clipState && clipState.buffer) {
              try {
                const source = ctx.createBufferSource();
                source.buffer = clipState.buffer;
                source.playbackRate.value = effectiveRate;

                const gainNode = ctx.createGain();
                source.connect(gainNode);
                gainNode.connect(destinationNode);

                const now = ctx.currentTime;
                const clipDurationSec = clipState.buffer.duration / effectiveRate;

                if (glyphOverlap?.enabled && glyphOverlap?.smoothEnvelopes) {
                  const fadeMs = glyphOverlap.crossfadeMs ?? 20;
                  const fadeSec = Math.min(fadeMs / 1000, clipDurationSec / 2);

                  // Attack ramp
                  gainNode.gain.setValueAtTime(0, now);
                  gainNode.gain.linearRampToValueAtTime(volume, now + Math.max(0.003, fadeSec));

                  // Decay / Fade-out ramp at clip tail
                  const fadeOutStart = now + Math.max(fadeSec, clipDurationSec - fadeSec);
                  gainNode.gain.setValueAtTime(volume, fadeOutStart);
                  gainNode.gain.linearRampToValueAtTime(0, now + clipDurationSec);
                } else {
                  gainNode.gain.setValueAtTime(volume, now);
                }

                source.start(now);
                activeSourcesRef.current.push(source);
              } catch (err) {
                console.error("Playback audio error:", err);
              }
            }

            // Update UI status
            setCurrentInfo({
              isPlaying: true,
              isPaused: false,
              activeItemIndex: i,
              totalItems: items.length,
              currentSymbol: symEvent.symbol,
              currentEnglishChar: symEvent.englishCharacter,
              currentGlyph: symEvent.glyph,
              currentPitchLevel: symEvent.pitch,
              characterIndex: symEvent.glyphIndex,
              totalCharacters: totalGlyphs,
            });
          }, scheduleDelay);

          timeoutsRef.current.push(timerId);

          // Approximate clip duration in ms based on effective playback rate
          const rawDurationMs = clipState && clipState.buffer
            ? (clipState.buffer.duration * 1000) / effectiveRate
            : 60;

          if (glyphOverlap?.enabled && isNextInSameGlyph) {
            let overlapMs = 0;
            if (glyphOverlap.overlapMode === "percent") {
              overlapMs = rawDurationMs * (glyphOverlap.overlapAmount / 100);
            } else {
              overlapMs = glyphOverlap.overlapAmount;
            }
            overlapMs = Math.min(overlapMs, rawDurationMs - 10);

            const intraGlyphStepDurationMs = Math.max(10, rawDurationMs - overlapMs);
            delayAcc += intraGlyphStepDurationMs;
          } else {
            delayAcc += rawDurationMs + symEvent.delayAfterMs;
          }
        } else if (item.type === "pause") {
          // If this pause is an intra-glyph symbol pause and overlap is enabled, skip adding its duration
          let isIntraGlyphPause = false;
          if (glyphOverlap?.enabled && item.reason === "character") {
            const prevItem = i > 0 ? items[i - 1] : null;
            const nextItem = i < items.length - 1 ? items[i + 1] : null;
            if (
              prevItem &&
              prevItem.type === "symbol" &&
              nextItem &&
              nextItem.type === "symbol" &&
              prevItem.glyphIndex === nextItem.glyphIndex
            ) {
              isIntraGlyphPause = true;
            }
          }

          if (!isIntraGlyphPause) {
            delayAcc += item.durationMs;
          }
        }
      }

      // Completion timer
      const completionTimerId = window.setTimeout(() => {
        if (isCancelledRef.current) return;

        if (loop) {
          playSequenceFrom(items, 0);
        } else {
          stopPlayback();
        }
      }, delayAcc + 100);

      timeoutsRef.current.push(completionTimerId);
    },
    [clips, getAudioContext, loop, volume, stopPlayback, clearAllScheduled, glyphOverlap]
  );

  const pausePlayback = useCallback(() => {
    if (!isPlaying) return;
    const currentIdx = currentIndexRef.current;
    clearAllScheduled();
    setIsPlaying(false);
    setIsPaused(true);
    setCurrentInfo((prev) => ({ ...prev, isPlaying: false, isPaused: true }));
  }, [isPlaying, clearAllScheduled]);

  const resumePlayback = useCallback(() => {
    if (!isPaused || itemsRef.current.length === 0) return;
    playSequenceFrom(itemsRef.current, currentIndexRef.current);
  }, [isPaused, playSequenceFrom]);

  useEffect(() => {
    return () => {
      clearAllScheduled();
    };
  }, [clearAllScheduled]);

  return {
    isPlaying,
    isPaused,
    activeItemIndex,
    currentInfo,
    startPlayback: (items: PlaybackItem[]) => playSequenceFrom(items, 0),
    pausePlayback,
    resumePlayback,
    stopPlayback,
  };
}
