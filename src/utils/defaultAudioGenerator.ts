/**
 * Synthesizes default organic Kobold sound buffers using Web Audio API
 * so the translator works out-of-the-box without requiring custom file uploads.
 */
export function generateDefaultAudioBuffer(
  ctx: AudioContext,
  symbol: "." | "-" | ":"
): AudioBuffer {
  const sampleRate = ctx.sampleRate;

  if (symbol === ".") {
    // Tap sound: short percussive woodblock click (~0.05s)
    const duration = 0.05;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, numSamples, sampleRate);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const freq = 1200 * Math.exp(-t * 60); // fast frequency drop
      const envelope = Math.exp(-t * 55);
      channel[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.9;
    }
    return buffer;
  }

  if (symbol === "-") {
    // Scratch sound: bandpass noise friction burst (~0.07s)
    const duration = 0.07;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, numSamples, sampleRate);
    const channel = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const whiteNoise = Math.random() * 2 - 1;
      // Highpass/bandpass filter simulation
      lastOut = 0.8 * lastOut + 0.2 * whiteNoise;
      const envelope = Math.sin((t / duration) * Math.PI); // Smooth burst envelope
      channel[i] = lastOut * envelope * 0.8;
    }
    return buffer;
  }

  // Bite sound: short vocal double pop (: ~0.08s)
  const duration = 0.08;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const channel = buffer.getChannelData(0);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = 600 + Math.sin(t * 120) * 300;
    const envelope = Math.exp(-t * 30) * Math.sin((t / duration) * Math.PI);
    channel[i] = (Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sign(Math.sin(2 * Math.PI * freq * 1.5 * t))) * envelope * 0.7;
  }

  return buffer;
}
