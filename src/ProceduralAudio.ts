class ProceduralAudio {
  private ctx: AudioContext | null = null;
  private musicInterval: any = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playBeep(frequency: number, type: OscillatorType = 'square', duration: number = 0.1, volume: number = 0.1) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playCollect() {
    this.init();
    // High pitched ding
    this.playBeep(880, 'sine', 0.1, 0.2);
    setTimeout(() => this.playBeep(1108.73, 'sine', 0.2, 0.2), 100);
  }

  playBlock() {
    this.init();
    // Low bonk
    this.playBeep(150, 'sawtooth', 0.1, 0.3);
  }

  playMove() {
    this.init();
    // Quick tick
    this.playBeep(300, 'square', 0.05, 0.05);
  }

  playSplash() {
    this.init();
    // Noise burst for splash
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  playTrainWarning() {
    this.init();
    // Train horn
    this.playBeep(440, 'square', 0.5, 0.2);
    setTimeout(() => this.playBeep(440, 'square', 0.5, 0.2), 600);
  }

  playGameOver() {
    this.init();
    // Descending womp
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 1);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 1);
  }

  startMusic() {
    this.init();
    if (this.musicInterval) return;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
    let index = 0;

    this.musicInterval = setInterval(() => {
      this.playBeep(notes[index], 'triangle', 0.2, 0.05);
      index = (index + 1) % notes.length;
    }, 400);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export default new ProceduralAudio();
