// Web Audio API Ambient Sound & Notification Chimes (Zero external assets needed)

let audioCtx = null;
let ambientOsc1 = null;
let ambientOsc2 = null;
let ambientGain = null;
let noiseNode = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play a crystal glass chime when timer completes
export const playCompletionChime = () => {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
      
      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 1.3);
    });
  } catch (e) {
    console.warn('Audio chime warning:', e);
  }
};

// Start soft Cyber-Focus Binaural drone
export const startAmbientSound = () => {
  try {
    const ctx = getAudioContext();
    if (ambientGain) return; // already playing

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.01, ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2);

    // Alpha wave binaural base: 196 Hz (G3) & 206 Hz (10Hz difference = Alpha focus)
    ambientOsc1 = ctx.createOscillator();
    ambientOsc1.type = 'sine';
    ambientOsc1.frequency.setValueAtTime(196, ctx.currentTime);

    ambientOsc2 = ctx.createOscillator();
    ambientOsc2.type = 'sine';
    ambientOsc2.frequency.setValueAtTime(206, ctx.currentTime);

    ambientOsc1.connect(ambientGain);
    ambientOsc2.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    ambientOsc1.start();
    ambientOsc2.start();
  } catch (e) {
    console.warn('Ambient start error:', e);
  }
};

export const stopAmbientSound = () => {
  try {
    if (ambientGain && audioCtx) {
      ambientGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
      setTimeout(() => {
        if (ambientOsc1) {
          ambientOsc1.stop();
          ambientOsc1.disconnect();
          ambientOsc1 = null;
        }
        if (ambientOsc2) {
          ambientOsc2.stop();
          ambientOsc2.disconnect();
          ambientOsc2 = null;
        }
        if (ambientGain) {
          ambientGain.disconnect();
          ambientGain = null;
        }
      }, 1000);
    }
  } catch (e) {
    console.warn('Ambient stop error:', e);
  }
};
