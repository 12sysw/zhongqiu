/**
 * 中秋雅乐引擎 - 纯 Web Audio API 国风五声音阶古筝与编钟合成器
 * 无需外部大体积音频文件，零依赖，秒级加载，随时可播
 */
class MidAutumnAudio {
  constructor() {
    this.ctx = null;
    this.isPlayingBgm = false;
    this.bgmTimer = null;
    this.isMuted = false;

    // 中国传统五声音阶 (宫 商 角 徵 羽 -> 对应音高频率 Hz: C4, D4, E4, G4, A4, C5, D5, E5, G5, A5)
    this.pentatonicFrequencies = [
      261.63, 293.66, 329.63, 392.00, 440.00, // C4 - A4
      523.25, 587.33, 659.25, 783.99, 880.00  // C5 - A5
    ];

    // 《彩云追月》与《平湖秋月》灵感旋律片段音程序列 (0-indexed)
    this.melodySequence = [
      [5, 4, 3, 2],
      [4, 3, 2, 0],
      [2, 3, 4, 7],
      [5, 4, 3, 2, 0],
      [4, 7, 8, 7],
      [9, 8, 7, 5, 4],
      [2, 4, 5, 7],
      [0, 2, 4, 3, 2]
    ];
    this.phraseIndex = 0;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 古筝拨弦仿真合成 (具有余音绕梁的指数衰减与泛音谐波)
  playPluck(freq = 440, duration = 2.2, volume = 0.25) {
    if (this.isMuted) return;
    this.ensureContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // 仿古筝弦振：三角波 + 适度低通滤波器动态开合
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    // 泛音泛起与共振
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, t);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.8, t + duration);

    // 包络：极快起音 (Attack: 0.015s) + 自然拨弦悠扬余颤 (Decay)
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + duration);
  }

  // 灵动金玉编钟/风铃音效 (放飞天灯、吉庆时刻)
  playChime(pitchMultiplier = 1) {
    if (this.isMuted) return;
    this.ensureContext();

    const baseFreq = 523.25 * pitchMultiplier; // C5
    const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2]; // 泛音叠加

    freqs.forEach((f, idx) => {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      const vol = (0.2 / (idx + 1));
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 1.8);
    });
  }

  // 祥瑞开箱/锣鼓暖音
  playGong() {
    if (this.isMuted) return;
    this.ensureContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 2.5);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 2.5);
  }

  // 启动月下背景雅乐
  startBGM() {
    this.ensureContext();
    if (this.isPlayingBgm) return;
    this.isPlayingBgm = true;

    const playNextNote = () => {
      if (!this.isPlayingBgm) return;

      const phrase = this.melodySequence[this.phraseIndex % this.melodySequence.length];
      let noteDelay = 0;

      phrase.forEach((noteIdx, i) => {
        setTimeout(() => {
          if (!this.isPlayingBgm || this.isMuted) return;
          const freq = this.pentatonicFrequencies[noteIdx];
          this.playPluck(freq, 2.5, 0.16);
        }, noteDelay);
        noteDelay += 650 + Math.random() * 200; // 随性优雅的东方留白节奏
      });

      this.phraseIndex++;
      // 下一乐句间隔 2.5 - 4 秒，舒缓宁静
      const nextDelay = noteDelay + 2200 + Math.random() * 1200;
      this.bgmTimer = setTimeout(playNextNote, nextDelay);
    };

    playNextNote();
  }

  // 停止背景音乐
  stopBGM() {
    this.isPlayingBgm = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  toggleBGM() {
    if (this.isPlayingBgm) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }
}

window.midAutumnAudio = new MidAutumnAudio();
