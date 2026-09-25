/**
 * 中秋高清贺卡海报生成引擎 (Canvas High-Res Card & Poster Generator)
 * 纯原生 Canvas 绘制，零外部网络图片依赖，手机朋友圈及微信群分享神器
 */
class PosterGenerator {
  static generateCardImage({ recipient, message, sender, sealText = '中秋吉祥' }) {
    const width = 900;
    const height = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. 深度夜空渐变背景
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0d25');
    bgGrad.addColorStop(0.3, '#171435');
    bgGrad.addColorStop(0.7, '#241b44');
    bgGrad.addColorStop(1, '#0c102a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 满天点点金星与星云微光
    ctx.fillStyle = 'rgba(255, 235, 180, 0.7)';
    for (let i = 0; i < 90; i++) {
      const sx = (Math.sin(i * 99) * 0.5 + 0.5) * width;
      const sy = (Math.cos(i * 37) * 0.5 + 0.5) * height;
      const sr = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. 顶部宏伟金月与月晕
    const moonX = width * 0.5;
    const moonY = 220;
    const moonR = 100;

    // 月晕
    const halo = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 2.8);
    halo.addColorStop(0, 'rgba(255, 245, 205, 0.45)');
    halo.addColorStop(0.4, 'rgba(255, 215, 120, 0.2)');
    halo.addColorStop(1, 'rgba(255, 200, 80, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // 皓月球体
    const moonGrad = ctx.createRadialGradient(moonX - 35, moonY - 35, 10, moonX, moonY, moonR);
    moonGrad.addColorStop(0, '#ffffff');
    moonGrad.addColorStop(0.4, '#fff9e6');
    moonGrad.addColorStop(0.8, '#fad375');
    moonGrad.addColorStop(1, '#e5a93b');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    // 4. 外层与内层古典烫金边框 (回纹国风边框)
    const margin = 50;
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.85)';
    ctx.lineWidth = 3;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    ctx.strokeStyle = 'rgba(255, 209, 102, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin + 12, margin + 12, width - (margin + 12) * 2, height - (margin + 12) * 2);

    // 四角回纹花边装饰
    this.drawCornerPattern(ctx, margin + 18, margin + 18, 1, 1);
    this.drawCornerPattern(ctx, width - margin - 18, margin + 18, -1, 1);
    this.drawCornerPattern(ctx, margin + 18, height - margin - 18, 1, -1);
    this.drawCornerPattern(ctx, width - margin - 18, height - margin - 18, -1, -1);

    // 5. 顶部大标题：中秋节贺
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f4a261';
    ctx.font = '24px "Kaiti SC", "KaiTi", "STKaiti", serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('· 岁 次 丙 午 · 仲 秋 佳 节 ·', width / 2, 380);

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 54px "Kaiti SC", "KaiTi", "Songti SC", serif';
    ctx.shadowColor = 'rgba(255, 209, 102, 0.5)';
    ctx.shadowBlur = 15;
    ctx.fillText('月满中秋 · 情暖天涯', width / 2, 455);
    ctx.shadowBlur = 0;

    // 6. 致辞对象 (Recipient)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffeaa7';
    ctx.font = 'bold 36px "Kaiti SC", "KaiTi", serif';
    ctx.fillText(`${recipient}：`, 110, 560);

    // 7. 正文祝福词 (排版折行，字字温情)
    ctx.fillStyle = '#f7f1e3';
    ctx.font = '32px "Kaiti SC", "KaiTi", "Songti SC", serif';
    const maxWidth = width - 240;
    const lineHeight = 58;
    const startY = 640;

    const lines = this.wrapText(ctx, message, maxWidth);
    lines.forEach((line, index) => {
      ctx.fillText(line, 140, startY + index * lineHeight);
    });

    // 8. 署名与朱砂印章
    const bottomBaseY = startY + Math.max(lines.length * lineHeight + 80, 280);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffd166';
    ctx.font = '34px "Kaiti SC", "KaiTi", serif';
    ctx.fillText(sender || '遥祝', width - 240, bottomBaseY);

    // 朱砂红印
    this.drawSeal(ctx, width - 200, bottomBaseY - 48, sealText);

    // 9. 底部唯美落款
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 243, 205, 0.55)';
    ctx.font = '20px "Kaiti SC", "KaiTi", serif';
    ctx.fillText('但愿人长久 · 千里共婵娟', width / 2, height - 90);

    // 底部站点水印（收到海报的人可以回访）
    ctx.fillStyle = 'rgba(255, 243, 205, 0.4)';
    ctx.font = '16px "Kaiti SC", "KaiTi", serif';
    ctx.fillText('· sxf.6666633.xyz ·', width / 2, height - 52);

    return canvas.toDataURL('image/png');
  }

  // 绘制中式拐角云纹
  static drawCornerPattern(ctx, x, y, scaleX, scaleY) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.lineTo(0, 0);
    ctx.lineTo(30, 0);
    ctx.moveTo(6, 24);
    ctx.lineTo(6, 6);
    ctx.lineTo(24, 6);
    ctx.stroke();
    ctx.restore();
  }

  // 绘制传统朱砂方印 (如：中秋吉祥)
  static drawSeal(ctx, x, y, text) {
    const size = 70;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.06); // 微微倾斜更加灵动

    // 印泥质感边框
    ctx.strokeStyle = '#c83226';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, size, size);

    // 印泥底色淡晕
    ctx.fillStyle = 'rgba(200, 50, 38, 0.12)';
    ctx.fillRect(0, 0, size, size);

    // 印文字体 (2x2 排布)
    ctx.fillStyle = '#c83226';
    ctx.font = 'bold 22px "Kaiti SC", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const src = text || '吉祥如意';
    const t = src.length === 2 ? src + src : src.padEnd(4, '吉');
    // 古代印章阅读顺序：右上 -> 右下 -> 左上 -> 左下 (或常规顺排)
    ctx.fillText(t[0], size * 0.75, size * 0.3);
    ctx.fillText(t[1], size * 0.75, size * 0.75);
    ctx.fillText(t[2], size * 0.28, size * 0.3);
    ctx.fillText(t[3], size * 0.28, size * 0.75);

    ctx.restore();
  }

  // 自动换行辅助计算
  static wrapText(ctx, text, maxWidth) {
    const paragraphs = text.split('\n');
    const result = [];

    paragraphs.forEach(para => {
      let currentLine = '';
      for (let i = 0; i < para.length; i++) {
        const char = para[i];
        const testLine = currentLine + char;
        const width = ctx.measureText(testLine).width;
        if (width > maxWidth && currentLine.length > 0) {
          result.push(currentLine);
          currentLine = char;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) result.push(currentLine);
    });

    return result;
  }
}

window.PosterGenerator = PosterGenerator;
