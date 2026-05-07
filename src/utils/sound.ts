let globalAudioCtx: AudioContext | null = null;

export const playCameraClick = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    if (!globalAudioCtx) {
      globalAudioCtx = new AudioContextClass();
    }
    
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch(() => {});
    }

    const ctx = globalAudioCtx;

    const playClick = (timeOffset: number, pitchOffset: number, duration: number, isTail: boolean) => {
      // Noise component
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = isTail ? 'bandpass' : 'highpass';
      noiseFilter.frequency.value = isTail ? 1200 : 2500;
        
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, ctx.currentTime + timeOffset);
      noiseGain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + timeOffset + 0.005);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + duration);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      
      // Oscillator component (the thud)
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      
      const oscGain = ctx.createGain();
      
      osc.frequency.setValueAtTime(140 + pitchOffset, ctx.currentTime + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + timeOffset + duration * 0.8);
      
      oscGain.gain.setValueAtTime(0, ctx.currentTime + timeOffset);
      oscGain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + timeOffset + 0.005);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + duration);
      
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      
      noise.start(ctx.currentTime + timeOffset);
      osc.start(ctx.currentTime + timeOffset);
      
      noise.stop(ctx.currentTime + timeOffset + duration);
      osc.stop(ctx.currentTime + timeOffset + duration);
    };

    // First mechanical click (shutter open / mirror slap up)
    playClick(0, 30, 0.035, false);
    
    // Second mechanical click (shutter close / mirror slap down) with a slight delay
    playClick(0.06, 10, 0.05, true);

  } catch (e) {
    // Ignore errors for headless environments or unsupported browsers
  }
};
