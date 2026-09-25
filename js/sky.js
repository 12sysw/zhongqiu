/**
 * 中秋夜空画布引擎 (Starry Sky, Glowing Moon, Lanterns, Osmanthus)
 */
class MidAutumnSky {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    // 元素容器
    this.stars = [];
    this.lanterns = [];
    this.petals = [];
    this.sparkles = [];
    this.clouds = [];
    this.meteors = [];
    
    // 默认月亮参数
    this.moon = {
      x: 0,
      y: 0,
      radius: 65,
      glowRadius: 160,
      craterRings: []
    };
    
    // 祝福语预设库 (飘在夜空中的愿望)
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

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    this.initStars(160);
    this.initClouds(5);
    this.initPetals(35);
    
    // 预先生成几盏灯在不同高度
    for (let i = 0; i < 7; i++) {
      const l = this.createLantern(
        Math.random() * this.width,
        this.height * 0.2 + Math.random() * (this.height * 0.7),
        this.defaultWishes[Math.floor(Math.random() * this.defaultWishes.length)],
        Math.random() > 0.4 ? '#f4a261' : '#c83226'
      );
      this.lanterns.push(l);
    }

    // 绑定点击事件：点中天灯显示寄语，点空处绽放星尘
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.handleClick(e.touches[0]);
      }
    }, { passive: true });

    // 周期生成流星和新天灯
    setInterval(() => {
      if (Math.random() > 0.5 && this.meteors.length < 2) {
        this.spawnMeteor();
      }
    }, 4500);

    setInterval(() => {
      if (this.lanterns.length < 15) {
        const text = this.defaultWishes[Math.floor(Math.random() * this.defaultWishes.length)];
        this.lanterns.push(this.createLantern(
          50 + Math.random() * (this.width - 100),
          this.height + 40,
          text,
          Math.random() > 0.3 ? '#f4a261' : '#c83226'
        ));
      }
    }, 3800);

    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    
    this.ctx.scale(this.dpr, this.dpr);

    // 月亮自适应位置：桌面右上方偏中，移动端上方居中偏右
    if (this.width > 768) {
      this.moon.x = this.width * 0.78;
      this.moon.y = Math.max(110, this.height * 0.2);
      this.moon.radius = Math.min(75, this.width * 0.065);
    } else {
      this.moon.x = this.width * 0.75;
      this.moon.y = 110;
      this.moon.radius = Math.min(50, this.width * 0.12);
    }
    this.moon.glowRadius = this.moon.radius * 2.8;
  }

  initStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.85),
        radius: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.3 ? '#fff9e6' : '#a0c4ff'
      });
    }
  }

  initClouds(count) {
    this.clouds = [];
    for (let i = 0; i < count; i++) {
      this.clouds.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.5),
        width: 180 + Math.random() * 260,
        height: 40 + Math.random() * 60,
        speed: 0.15 + Math.random() * 0.2,
        alpha: 0.08 + Math.random() * 0.12
      });
    }
  }

  initPetals(count) {
    this.petals = [];
    for (let i = 0; i < count; i++) {
      this.petals.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 4 + 3,
        speedY: Math.random() * 0.8 + 0.5,
        speedX: Math.random() * 0.6 - 0.2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        alpha: Math.random() * 0.6 + 0.4,
        color: Math.random() > 0.4 ? '#ffdd59' : '#ffa801'
      });
    }
  }

  createLantern(x, y, text = '阖家团圆', color = '#f4a261') {
    const scale = 0.75 + Math.random() * 0.4;
    return {
      x,
      y,
      scale,
      width: 32 * scale,
      height: 44 * scale,
      speedY: 0.5 + Math.random() * 0.4,
      swaySpeed: 0.015 + Math.random() * 0.015,
      swayAmount: 18 * scale,
      swayOffset: Math.random() * Math.PI * 2,
      baseX: x,
      text,
      color,
      flameFlicker: Math.random() * Math.PI,
      alpha: 0.95
    };
  }

  // 外部调用：放飞用户自制专属天灯
  addCustomLantern(text, color = '#f4a261') {
    const lantern = this.createLantern(
      this.width * 0.35 + Math.random() * (this.width * 0.3),
      this.height + 20,
      text,
      color
    );
    // 增加专属天灯的亮丽度与尺寸
    lantern.scale = 1.35;
    lantern.width = 32 * 1.35;
    lantern.height = 44 * 1.35;
    lantern.speedY = 1.1; // 升空更有动力
    this.lanterns.push(lantern);

    // 伴随金光星尘爆发
    this.createSparkleBurst(lantern.baseX, this.height - 50, 30);
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
        radius: Math.random() * 2.5 + 1,
        alpha: 1,
        color: Math.random() > 0.4 ? '#ffd166' : '#fff3cd'
      });
    }
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // 检查是否点中了月亮
    const distToMoon = Math.hypot(clickX - this.moon.x, clickY - this.moon.y);
    if (distToMoon <= this.moon.radius * 1.2) {
      this.createSparkleBurst(this.moon.x, this.moon.y, 40);
      if (window.onMoonClick) window.onMoonClick();
      return;
    }

    // 检查是否点击了天灯
    for (let i = this.lanterns.length - 1; i >= 0; i--) {
      const l = this.lanterns[i];
      const dist = Math.hypot(clickX - l.x, clickY - (l.y + l.height / 2));
      if (dist < l.width * 1.5) {
        this.createSparkleBurst(l.x, l.y + l.height / 2, 20);
        if (window.showToast) {
          window.showToast(`🏮 祈愿签：“${l.text}”`);
        }
        return;
      }
    }

    // 点空处生成花火光芒
    this.createSparkleBurst(clickX, clickY, 12);
  }

  drawMoon() {
    const ctx = this.ctx;
    const m = this.moon;

    // 多重外层柔和金色月晕
    const glow = ctx.createRadialGradient(m.x, m.y, m.radius * 0.6, m.x, m.y, m.glowRadius);
    glow.addColorStop(0, 'rgba(255, 245, 205, 0.45)');
    glow.addColorStop(0.3, 'rgba(255, 225, 140, 0.25)');
    glow.addColorStop(0.7, 'rgba(255, 210, 100, 0.08)');
    glow.addColorStop(1, 'rgba(255, 200, 80, 0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // 月球主体质感
    const moonGrad = ctx.createRadialGradient(
      m.x - m.radius * 0.35,
      m.y - m.radius * 0.35,
      m.radius * 0.1,
      m.x,
      m.y,
      m.radius
    );
    moonGrad.addColorStop(0, '#ffffff');
    moonGrad.addColorStop(0.4, '#fff9db');
    moonGrad.addColorStop(0.8, '#fae19c');
    moonGrad.addColorStop(1, '#f3cb69');

    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    ctx.fill();

    // 嫦娥奔月 / 玉兔月影淡雅轮廓剪影 (东方雅韵)
    ctx.save();
    ctx.fillStyle = 'rgba(195, 155, 80, 0.22)';
    // 淡淡的环形山与云纹暗斑
    ctx.beginPath();
    ctx.arc(m.x - m.radius * 0.25, m.y - m.radius * 0.1, m.radius * 0.28, 0, Math.PI * 2);
    ctx.arc(m.x + m.radius * 0.2, m.y + m.radius * 0.22, m.radius * 0.35, 0, Math.PI * 2);
    ctx.arc(m.x - m.radius * 0.05, m.y + m.radius * 0.35, m.radius * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // 玉兔侧卧简影
    ctx.fillStyle = 'rgba(170, 130, 65, 0.26)';
    ctx.beginPath();
    const rx = m.x + m.radius * 0.05;
    const ry = m.y + m.radius * 0.1;
    ctx.ellipse(rx, ry, m.radius * 0.18, m.radius * 0.25, Math.PI / 6, 0, Math.PI * 2); // 身体
    ctx.ellipse(rx - m.radius * 0.1, ry - m.radius * 0.18, m.radius * 0.1, m.radius * 0.12, 0, 0, Math.PI * 2); // 兔头
    ctx.fill();
    // 兔耳朵
    ctx.beginPath();
    ctx.ellipse(rx - m.radius * 0.15, ry - m.radius * 0.3, m.radius * 0.04, m.radius * 0.14, -Math.PI / 10, 0, Math.PI * 2);
    ctx.ellipse(rx - m.radius * 0.08, ry - m.radius * 0.32, m.radius * 0.04, m.radius * 0.15, Math.PI / 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawLantern(l) {
    const ctx = this.ctx;
    const w = l.width;
    const h = l.height;

    ctx.save();
    ctx.translate(l.x, l.y);

    // 外层孔明灯暖光光晕
    const glow = ctx.createRadialGradient(0, h * 0.5, w * 0.2, 0, h * 0.5, w * 2.2);
    glow.addColorStop(0, 'rgba(255, 200, 80, 0.35)');
    glow.addColorStop(0.5, 'rgba(255, 120, 40, 0.15)');
    glow.addColorStop(1, 'rgba(255, 100, 30, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, h * 0.5, w * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 灯笼主体 (上宽下窄的八角/弧形古典天灯)
    const bodyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (l.color === '#c83226') {
      bodyGrad.addColorStop(0, '#ff7675');
      bodyGrad.addColorStop(0.5, '#d63031');
      bodyGrad.addColorStop(1, '#63171b');
    } else {
      bodyGrad.addColorStop(0, '#ffeaa7');
      bodyGrad.addColorStop(0.4, '#f39c12');
      bodyGrad.addColorStop(1, '#b75005');
    }

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.35, 0);
    ctx.quadraticCurveTo(0, -2, w * 0.35, 0); // 顶弧
    ctx.quadraticCurveTo(w * 0.55, h * 0.45, w * 0.38, h * 0.88); // 右侧
    ctx.quadraticCurveTo(0, h * 0.92, -w * 0.38, h * 0.88); // 底弧
    ctx.quadraticCurveTo(-w * 0.55, h * 0.45, -w * 0.35, 0); // 左侧
    ctx.closePath();
    ctx.fill();

    // 灯骨架金线
    ctx.strokeStyle = 'rgba(255, 235, 170, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 内部烛火微闪
    const flicker = Math.sin(l.flameFlicker) * 2;
    const flameGrad = ctx.createRadialGradient(0, h * 0.72 + flicker, 1, 0, h * 0.72 + flicker, w * 0.3);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.4, '#fff7a0');
    flameGrad.addColorStop(0.8, '#ff6b35');
    flameGrad.addColorStop(1, 'rgba(255, 107, 53, 0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.arc(0, h * 0.72 + flicker, w * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 下挂流苏穗子
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.75)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.9);
    ctx.lineTo(0, h * 1.25);
    ctx.stroke();

    ctx.fillStyle = '#c83226';
    ctx.beginPath();
    ctx.arc(0, h * 1.28, 2.5 * l.scale, 0, Math.PI * 2);
    ctx.fill();

    // 天灯上书写的毛笔寄语
    if (l.text && l.scale > 0.8) {
      ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
      ctx.font = `${Math.floor(10 * l.scale)}px "Kaiti SC", "KaiTi", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const char = l.text.substring(0, 4);
      for (let c = 0; c < char.length; c++) {
        ctx.fillText(char[c], 0, h * 0.28 + c * (11 * l.scale));
      }
    }

    ctx.restore();
  }

  drawOsmanthusPetal(p) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    // 绘制经典的十字四瓣桂花形态
    const s = p.size;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, s * 0.7, s * 0.35, s * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // 花蕊
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  animate() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. 绘制繁星
    const now = Date.now() * 0.001;
    for (let star of this.stars) {
      const alpha = Math.abs(Math.sin(now * star.twinkleSpeed * 10 + star.twinkleOffset)) * star.alpha;
      ctx.fillStyle = star.color;
      ctx.globalAlpha = Math.max(0.15, alpha);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 2. 绘制皓月
    this.drawMoon();

    // 3. 绘制悠悠祥云
    for (let cloud of this.clouds) {
      cloud.x += cloud.speed;
      if (cloud.x > this.width + cloud.width) {
        cloud.x = -cloud.width;
      }
      ctx.save();
      ctx.globalAlpha = cloud.alpha;
      const grad = ctx.createLinearGradient(cloud.x, cloud.y, cloud.x + cloud.width, cloud.y);
      grad.addColorStop(0, 'rgba(255, 230, 180, 0)');
      grad.addColorStop(0.5, 'rgba(255, 235, 200, 0.45)');
      grad.addColorStop(1, 'rgba(255, 230, 180, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cloud.x + cloud.width / 2, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. 绘制流星
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      m.alpha -= m.decay;

      if (m.alpha <= 0 || m.x > this.width || m.y > this.height) {
        this.meteors.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = m.alpha;
      const tailX = m.x - Math.cos(m.angle) * m.length;
      const tailY = m.y - Math.sin(m.angle) * m.length;
      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#ffd166');
      grad.addColorStop(1, 'rgba(255, 209, 102, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      ctx.restore();
    }

    // 5. 绘制并更新孔明灯
    for (let i = this.lanterns.length - 1; i >= 0; i--) {
      const l = this.lanterns[i];
      l.y -= l.speedY;
      l.flameFlicker += 0.08;
      // 随风摆动
      l.x = l.baseX + Math.sin(now * l.swaySpeed * 10 + l.swayOffset) * l.swayAmount;

      this.drawLantern(l);

      // 超出屏幕顶部回收
      if (l.y < -80) {
        this.lanterns.splice(i, 1);
      }
    }

    // 6. 飘落桂花
    for (let p of this.petals) {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(now * 2 + p.y * 0.01) * 0.5;
      p.rotation += p.rotationSpeed;

      if (p.y > this.height + 20) {
        p.y = -10;
        p.x = Math.random() * this.width;
      }
      this.drawOsmanthusPetal(p);
    }

    // 7. 点击光芒粒子
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.94;
      s.vy *= 0.94;
      s.alpha -= 0.025;

      if (s.alpha <= 0) {
        this.sparkles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}

window.MidAutumnSky = MidAutumnSky;
