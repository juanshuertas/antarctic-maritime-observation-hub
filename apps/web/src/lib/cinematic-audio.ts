// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Juan Sebastián Huertas Olea. All rights reserved.
// AMOH — Antarctic Maritime Observation Hub: High-Fidelity Web Audio Polar Soundscape Engine

class NatGeoAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  protected windNoiseNode: AudioNode | null = null;
  private subDroneGain: GainNode | null = null;
  private subDroneOsc: OscillatorNode | null = null;
  private hydrophoneGain: GainNode | null = null;
  private hydrophoneInterval: number | null = null;
  protected isInitialized = false;
  private isPlaying = false;
  private currentVolume = 0.65;

  private initContext() {
    if (this.ctx && this.ctx.state !== 'closed') return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    this.isInitialized = true;
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public startSoundscape(preset: 'polar-wind' | 'glacial-depths' | 'hydrophone' | 'aurora-resonance' = 'polar-wind') {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stopSoundscape();
    this.isPlaying = true;

    switch (preset) {
      case 'polar-wind':
        this.startWind(0.35, 380, 0.8);
        this.startGlacialDrone(46, 0.2);
        break;
      case 'glacial-depths':
        this.startWind(0.15, 220, 1.2);
        this.startGlacialDrone(38, 0.45);
        this.scheduleRandomCalving();
        break;
      case 'hydrophone':
        this.startWind(0.08, 180, 0.5);
        this.startGlacialDrone(52, 0.25);
        this.startHydrophoneBiophony();
        break;
      case 'aurora-resonance':
        this.startWind(0.2, 500, 1.5);
        this.startAuroraChimes();
        this.startGlacialDrone(64, 0.3);
        break;
    }
  }

  public stopSoundscape() {
    this.isPlaying = false;
    if (this.windGain && this.ctx) {
      this.windGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
    if (this.subDroneGain && this.ctx) {
      this.subDroneGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
    if (this.hydrophoneGain && this.ctx) {
      this.hydrophoneGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
    if (this.hydrophoneInterval) {
      window.clearInterval(this.hydrophoneInterval);
      this.hydrophoneInterval = null;
    }
  }

  // --- PROCEDURAL POLAR WIND (Brownian/Pink filtered noise with slow resonant LFO) ---
  private startWind(targetGain: number, baseCutoff: number, q: number) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise algorithm
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(baseCutoff, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(q, this.ctx.currentTime);

    // LFO to slowly sweep wind howling frequency
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(this.windFilter.frequency);
    lfo.start();

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.windGain.gain.exponentialRampToValueAtTime(targetGain, this.ctx.currentTime + 1.5);

    whiteNoise.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    whiteNoise.start();
    this.windNoiseNode = whiteNoise;
  }

  // --- PROCEDURAL GLACIAL CALVING & SUB-DRONE ---
  private startGlacialDrone(freq: number, targetGain: number) {
    if (!this.ctx || !this.masterGain) return;

    this.subDroneOsc = this.ctx.createOscillator();
    this.subDroneOsc.type = 'triangle';
    this.subDroneOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Subtle pitch drift
    const drift = this.ctx.createOscillator();
    const driftGain = this.ctx.createGain();
    drift.frequency.setValueAtTime(0.05, this.ctx.currentTime);
    driftGain.gain.setValueAtTime(2.5, this.ctx.currentTime);
    drift.connect(driftGain);
    driftGain.connect(this.subDroneOsc.frequency);
    drift.start();

    this.subDroneGain = this.ctx.createGain();
    this.subDroneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.subDroneGain.gain.exponentialRampToValueAtTime(targetGain, this.ctx.currentTime + 2.0);

    this.subDroneOsc.connect(this.subDroneGain);
    this.subDroneGain.connect(this.masterGain);
    this.subDroneOsc.start();
  }

  // --- HYDROPHONE BIOPHONY & ICE CALVING CRACKS ---
  private startHydrophoneBiophony() {
    if (!this.ctx || !this.masterGain) return;

    this.hydrophoneGain = this.ctx.createGain();
    this.hydrophoneGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.hydrophoneGain.connect(this.masterGain);

    this.hydrophoneInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.hydrophoneGain) return;
      const rand = Math.random();
      if (rand > 0.6) {
        // Marine mammal chirp (whales / seals)
        this.playBioAcousticCall();
      } else if (rand > 0.3) {
        // Glacial pressure crack
        this.playIceCrackImpulse();
      }
    }, 4500);
  }

  private scheduleRandomCalving() {
    this.hydrophoneInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      if (Math.random() > 0.5) {
        this.playIceCrackImpulse();
      }
    }, 6000);
  }

  private startAuroraChimes() {
    if (!this.ctx || !this.masterGain) return;
    this.hydrophoneInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      if (Math.random() > 0.4) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const notes = [587.33, 659.25, 880.0, 987.77, 1174.66]; // D minor pentatonic ethereal scale
        const note = notes[Math.floor(Math.random() * notes.length)];

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.5);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 5.0);
      }
    }, 3200);
  }

  // --- ONE-SHOT SFX TRIGGERS ---

  /** High quality camera mechanical shutter sound effect for 4K snapshot grabs */
  public playCameraShutter() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Blade click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    // Motor whir
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.12, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, t + 0.04);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.06);
    noise.start(t + 0.04);
    noise.stop(t + 0.18);
  }

  /** Submarine sonar ping for hydrographic layers */
  public playSonarPing() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(940, t);
    osc.frequency.exponentialRampToValueAtTime(920, t + 1.2);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 2.5);
  }

  /** Waypoint navigation radio beep */
  public playRadioWaypointChirp() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1760, t);
    osc.frequency.setValueAtTime(2200, t + 0.06);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  /** Ice cracking impulse */
  private playIceCrackImpulse() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280 + Math.random() * 200, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.35);

    gain.gain.setValueAtTime(0.15 + Math.random() * 0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  /** Synthetic marine whale/seal acoustic frequency sweep */
  private playBioAcousticCall() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = 220 + Math.random() * 180;
    const endFreq = startFreq + (Math.random() > 0.5 ? 240 : -120);

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.linearRampToValueAtTime(endFreq, t + 1.2);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 1.9);
  }
}

export const NatGeoAudio = new NatGeoAudioEngine();
