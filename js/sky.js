/**
 * 中秋夜空画布引擎 · 性能优化版
 * 星辰 / 天灯 / 桂花 / 流星 / 点击星芒
 * 优化策略：所有渐变元素预渲染为离屏贴图（天灯、桂花、星芒、云），
 * 每帧只做 drawImage；DPR 封顶 2；按实测帧率自适应降质。
 * （月亮由 DOM/CSS 绘制，不在画布内）
 */
class MidAutumnSky {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.stars = [];
    this.lanterns = [];
    this.petals = [];
    this.sparkles = [];
    this.clouds = [];
    this.meteors = [];

    // 画质分级（按实测帧率单向降级）
    this.qualityLevels = [
      { stars: 150, petals: 30, clouds: 5, lanternCap: 12 },
      { stars: 90,  petals: 16, clouds: 4, lanternCap: 9 },
      { stars: 50,  petals: 8,  clouds: 3, lanternCap: 6 }
    ];
    this.quality = 0;

    // 帧率采样
    this.frameSamples = [];
    this.sampleWindow = 90;

    // 天灯寄语库
    this.defaultWishes = [
      "但愿人长久 千里共婵娟",
      "月圆人圆事事圆",
      "长安常安 岁岁欢愉",
      "家人闲坐 灯火可亲",
      "所求皆如愿 所行化坦途",
      "万事顺遂 幸福安康",
      "海上生明月 天涯共此时",
      "迎中秋 阖家幸福",
      "明月入怀 喜乐无忧",
      "春祺夏安 秋绥冬禧"
    ];

    this.init();
  }

  get caps() { return this.qualityLevels[this.quality]; }

  init() {
    this.bakeSprites();
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.seedLanterns(6);

    // 点击夜空：点中天灯拆阅祈愿，点空处绽放星芒
    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.button && e.button !== 0) return;
      this.handleClick(e);
    });

    // 周期性流星与新天灯
    setInterval(() => {
      if (Math.random() > 0.5 && this.meteors.length < 2) this.spawnMeteor();
    }, 5000);

    setInterval(() => {
      if (this.lanterns.length < this.caps.lanternCap) {
        this.lanterns.push(this.createLantern(
          50 + Math.random() * (this.width - 100),
          this.height + 40
        ));
      }
    }, 4200);

    this.lastTs = 0;
    requestAnimationFrame((ts) => this.animate(ts));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.initStars(this.caps.stars);
    this.initClouds(this.caps.clouds);
    this.initPetals(this.caps.petals);
  }

  /* ---------- 预渲染贴图 ---------- */

  bakeSprites() {
    // 两种配色天灯（含光晕、灯身、烛火、流苏），逻辑尺寸 w=34 h=46，画布 170×170，锚点(85,85)为灯身顶部中心
    this.lanternSprites = {
      gold: this.bakeLantern(['#ffeaa7', '#f39c12', '#b75005'], 'rgba(255, 200, 80, '),
      red:  this.bakeLantern(['#ff7675', '#d63031', '#63171b'], 'rgba(255, 120, 60, ')
    };
    this.lanternBaseW = 34;
    this.lanternBaseH = 46;
    this.lanternSpriteSize = 170;

    // 桂花贴图
    this.petalSprite = this.bakePetal();
    this.petalSpriteSize = 22;

    // 星芒贴图（点击粒子）
    this.sparkSprites = {
      gold: this.bakeSpark('#ffd166'),
      pale: this.bakeSpark('#fff3cd')
    };
    this.sparkSpriteSize = 16;
  }

  bakeLantern(colors, glowPrefix) {
    const S = 170, cx = 85, cy = 85;
    const w = 34, h = 46;
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const ctx = c.getContext('2d');
    ctx.translate(cx, cy);

    // 暖光光晕
    const glow = ctx.createRadialGradient(0, h * 0.5, w * 0.2, 0, h * 0.5, w * 2.2);
    glow.addColorStop(0, glowPrefix + '0.35)');
    glow.addColorStop(0.5, glowPrefix + '0.13)');
    glow.addColorStop(1, glowPrefix + '0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, h * 0.5, w * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 灯身
    const bodyGrad = ctx.createLinearGradient(0, 0, 0, h);
    bodyGrad.addColorStop(0, colors[0]);
    bodyGrad.addColorStop(0.5, colors[1]);
    bodyGrad.addColorStop(1, colors[2]);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.35, 0);
    ctx.quadraticCurveTo(0, -2, w * 0.35, 0);
    ctx.quadraticCurveTo(w * 0.55, h * 0.45, w * 0.38, h * 0.88);
    ctx.quadraticCurveTo(0, h * 0.92, -w * 0.38, h * 0.88);
    ctx.quadraticCurveTo(-w * 0.55, h * 0.45, -w * 0.35, 0);
    ctx.closePath();
    ctx.fill();

    // 灯骨架金线
    ctx.strokeStyle = 'rgba(255, 235, 170, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 烛火
    const flame = ctx.createRadialGradient(0, h * 0.72, 1, 0, h * 0.72, w * 0.3);
    flame.addColorStop(0, '#ffffff');
    flame.addColorStop(0.4, '#fff7a0');
    flame.addColorStop(0.8, '#ff6b35');
    flame.addColorStop(1, 'rgba(255, 107, 53, 0)');
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.arc(0, h * 0.72, w * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 流苏
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.75)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.9);
    ctx.lineTo(0, h * 1.25);
    ctx.stroke();
    ctx.fillStyle = '#c83226';
    ctx.beginPath();
    ctx.arc(0, h * 1.28, 2.5, 0, Math.PI * 2);
    ctx.fill();

    return c;
  }

  bakePetal() {
    const c = document.createElement('canvas');
    c.width = 22; c.height = 22;
    const ctx = c.getContext('2d');
    ctx.translate(11, 11);
    const s = 7;
    ctx.fillStyle = '#ffdd59';
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, s * 0.7, s * 0.35, s * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
    return c;
  }

  bakeSpark(color) {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(8, 8, 0.5, 8, 8, 8);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.35, color);
    g.addColorStop(1, 'rgba(255, 209, 102, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 16, 16);
    return c;
  }

  /* ---------- 元素初始化 ---------- */

  initStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.85),
        radius: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.3 ? '#fff9e6' : '#a0c4ff'
      });
    }
    // 按颜色分两组，减少每帧 fillStyle 切换
    this.starGroups = [
      this.stars.filter(s => s.color === '#fff9e6'),
      this.stars.filter(s => s.color !== '#fff9e6')
    ];
  }

  initClouds(count) {
    this.clouds = [];
    for (let i = 0; i < count; i++) {
      const cw = 180 + Math.random() * 260;
      const ch = 40 + Math.random() * 60;
      const cloud = {
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.5),
        width: cw,
        height: ch,
        speed: 0.12 + Math.random() * 0.18,
        alpha: 0.35 + Math.random() * 0.3
      };
      cloud.sprite = this.bakeCloud(cw, ch);
      this.clouds.push(cloud);
    }
  }

  bakeCloud(cw, ch) {
    const pad = 30;
    const c = document.createElement('canvas');
    c.width = Math.ceil(cw + pad * 2);
    c.height = Math.ceil(ch + pad * 2);
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(pad, pad + ch / 2, pad + cw, pad + ch / 2);
    grad.addColorStop(0, 'rgba(255, 230, 180, 0)');
    grad.addColorStop(0.5, 'rgba(255, 235, 200, 0.45)');
    grad.addColorStop(1, 'rgba(255, 230, 180, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(pad + cw / 2, pad + ch / 2, cw / 2, ch / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    return { canvas: c, pad };
  }

  initPetals(count) {
    this.petals = [];
    for (let i = 0; i < count; i++) {
      this.petals.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 0.55 + Math.random() * 0.5,
        speedY: Math.random() * 0.8 + 0.5,
        speedX: Math.random() * 0.6 - 0.2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        alpha: Math.random() * 0.6 + 0.4
      });
    }
  }

  seedLanterns(n) {
    for (let i = 0; i < n; i++) {
      this.lanterns.push(this.createLantern(
        Math.random() * this.width,
        this.height * 0.15 + Math.random() * (this.height * 0.7)
      ));
    }
  }

  createLantern(x, y, text, color) {
    const scale = 0.75 + Math.random() * 0.4;
    return {
      x,
      y,
      baseX: x,
      scale,
      width: this.lanternBaseW * scale,
      height: this.lanternBaseH * scale,
      speedY: 0.5 + Math.random() * 0.4,
      swaySpeed: 0.015 + Math.random() * 0.015,
      swayAmount: 18 * scale,
      swayOffset: Math.random() * Math.PI * 2,
      flicker: Math.random() * Math.PI,
      text: text || this.defaultWishes[Math.floor(Math.random() * this.defaultWishes.length)],
      spriteKey: Math.random() > 0.35 ? 'gold' : 'red'
    };
  }

  // 外部调用：放飞用户专属天灯
  addCustomLantern(text, color = '#f4a261') {
    const lantern = this.createLantern(
      this.width * 0.35 + Math.random() * (this.width * 0.3),
      this.height + 20,
      text,
      color
    );
    lantern.scale = 1.35;
    lantern.width = this.lanternBaseW * 1.35;
    lantern.height = this.lanternBaseH * 1.35;
    lantern.speedY = 1.1;
    this.lanterns.push(lantern);
    this.createSparkleBurst(lantern.baseX, this.height - 50, 26);
  }

  spawnMeteor() {
    this.meteors.push({
      x: Math.random() * (this.width * 0.7) + this.width * 0.1,
      y: Math.random() * (this.height * 0.25),
      length: 80 + Math.random() * 70,
      speed: 7 + Math.random() * 4,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
      alpha: 1,
      decay: 0.02 + Math.random() * 0.015
    });
  }

  createSparkleBurst(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      this.sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2.2 + 0.9,
        alpha: 1,
        spriteKey: Math.random() > 0.4 ? 'gold' : 'pale'
      });
    }
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = this.lanterns.length - 1; i >= 0; i--) {
      const l = this.lanterns[i];
      const dist = Math.hypot(x - l.x, y - (l.y + l.height / 2));
      if (dist < l.width * 1.6) {
        this.createSparkleBurst(l.x, l.y + l.height / 2, 18);
        if (window.showToast) window.showToast('🏮 祈愿签：「' + l.text + '」');
        return;
      }
    }
    this.createSparkleBurst(x, y, 12);
  }

  /* ---------- 主循环 ---------- */

  animate(ts) {
    // 帧间隔（毫秒），归一化到 60fps 步长
    let dt = this.lastTs ? (ts - this.lastTs) : 16.7;
    this.lastTs = ts;
    if (dt > 60) dt = 60;
    const step = dt / 16.7;

    this.trackPerf(dt);

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const now = ts * 0.001;

    // 1. 星辰（两组颜色批量绘制）
    for (let g = 0; g < this.starGroups.length; g++) {
      const group = this.starGroups[g];
      ctx.fillStyle = g === 0 ? '#fff9e6' : '#a0c4ff';
      for (let i = 0; i < group.length; i++) {
        const star = group[i];
        const a = Math.abs(Math.sin(now * star.twinkleSpeed * 10 + star.twinkleOffset)) * star.alpha;
        ctx.globalAlpha = Math.max(0.15, a);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // 2. 祥云（预渲染贴图）
    for (let i = 0; i < this.clouds.length; i++) {
      const cloud = this.clouds[i];
      cloud.x += cloud.speed * step;
      if (cloud.x > this.width + cloud.width) cloud.x = -cloud.width;
      ctx.globalAlpha = cloud.alpha;
      ctx.drawImage(cloud.sprite.canvas, cloud.x - cloud.sprite.pad, cloud.y - cloud.height / 2 - cloud.sprite.pad);
    }
    ctx.globalAlpha = 1;

    // 3. 流星
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.x += Math.cos(m.angle) * m.speed * step;
      m.y += Math.sin(m.angle) * m.speed * step;
      m.alpha -= m.decay * step;

      if (m.alpha <= 0 || m.x > this.width + 100 || m.y > this.height + 100) {
        this.meteors.splice(i, 1);
        continue;
      }
      const tailX = m.x - Math.cos(m.angle) * m.length;
      const tailY = m.y - Math.sin(m.angle) * m.length;
      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, 'rgba(255, 255, 255, ' + m.alpha.toFixed(2) + ')');
      grad.addColorStop(0.3, 'rgba(255, 209, 102, ' + (m.alpha * 0.8).toFixed(2) + ')');
      grad.addColorStop(1, 'rgba(255, 209, 102, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }

    // 4. 天灯（预渲染贴图 + 呼吸式尺寸微颤模拟火光）
    const spriteSize = this.lanternSpriteSize;
    for (let i = this.lanterns.length - 1; i >= 0; i--) {
      const l = this.lanterns[i];
      l.y -= l.speedY * step;
      l.flicker += 0.08 * step;
      l.x = l.baseX + Math.sin(now * l.swaySpeed * 10 + l.swayOffset) * l.swayAmount;

      const flickerScale = l.scale * (1 + Math.sin(l.flicker * 2) * 0.03);
      const drawSize = spriteSize * flickerScale;
      const sprite = this.lanternSprites[l.spriteKey];
      ctx.drawImage(sprite, l.x - drawSize / 2, l.y - drawSize / 2, drawSize, drawSize);

      // 灯身寄语（竖排前四字）
      if (l.text && l.scale > 0.85) {
        ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
        ctx.font = Math.floor(10 * l.scale) + 'px "Kaiti SC", "KaiTi", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const chars = l.text.substring(0, 4);
        for (let c = 0; c < chars.length; c++) {
          ctx.fillText(chars[c], l.x, l.y + l.height * 0.28 + c * (11 * l.scale));
        }
      }

      if (l.y < -90) this.lanterns.splice(i, 1);
    }

    // 5. 桂花（预渲染贴图）
    const petalSize = this.petalSpriteSize;
    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.y += p.speedY * step;
      p.x += (p.speedX + Math.sin(now * 2 + p.y * 0.01) * 0.5) * step;
      p.rotation += p.rotationSpeed * step;

      if (p.y > this.height + 20) {
        p.y = -14;
        p.x = Math.random() * this.width;
      }
      const size = petalSize * p.size;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.alpha;
      ctx.drawImage(this.petalSprite, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    // 6. 星芒粒子（预渲染贴图）
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.x += s.vx * step;
      s.y += s.vy * step;
      s.vx *= Math.pow(0.94, step);
      s.vy *= Math.pow(0.94, step);
      s.alpha -= 0.025 * step;

      if (s.alpha <= 0) {
        this.sparkles.splice(i, 1);
        continue;
      }
      const size = this.sparkSpriteSize * (s.radius / 1.6);
      ctx.globalAlpha = Math.min(1, s.alpha);
      ctx.drawImage(this.sparkSprites[s.spriteKey], s.x - size / 2, s.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame((nextTs) => this.animate(nextTs));
  }

  /** 帧率采样：持续偏慢则降画质（单向） */
  trackPerf(dt) {
    this.frameSamples.push(dt);
    if (this.frameSamples.length >= this.sampleWindow) {
      const avg = this.frameSamples.reduce((a, b) => a + b, 0) / this.frameSamples.length;
      this.frameSamples.length = 0;
      if (avg > 26 && this.quality < this.qualityLevels.length - 1) {
        this.quality++;
        this.applyQuality();
      }
    }
  }

  applyQuality() {
    this.initStars(this.caps.stars);
    this.initPetals(this.caps.petals);
    this.initClouds(this.caps.clouds);
    while (this.lanterns.length > this.caps.lanternCap) this.lanterns.pop();
  }
}

window.MidAutumnSky = MidAutumnSky;
