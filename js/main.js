/**
 * 页面交互逻辑：弹窗、快速放灯、贺卡定制与分享、月饼盲盒、灯谜
 */
(function () {
  'use strict';

  /* ---------- 夜空引擎 ---------- */
  var sky = null;
  try {
    sky = new MidAutumnSky('sky-canvas');
  } catch (e) {
    console.error('夜空引擎初始化失败：', e);
  }

  /* ---------- 全局 Toast ---------- */
  var toastEl = document.getElementById('toastMsg');
  var toastTimer = null;
  window.showToast = function (msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  };

  /* ---------- 点月亮彩蛋 ---------- */
  var moonQuotes = [
    '🌕 今晚的月色，是专门为你点的灯',
    '🐇 玉兔捎话：好事将近',
    '✨ 但愿人长久，千里共婵娟',
    '🥮 月亮说：它也想吃月饼了'
  ];
  window.onMoonClick = function () {
    showToast(moonQuotes[Math.floor(Math.random() * moonQuotes.length)]);
  };

  /* ---------- 弹窗系统 ---------- */
  function openModal(id) {
    closeModals();
    var m = document.getElementById(id);
    if (m) m.classList.add('active');
  }
  function closeModals() {
    document.querySelectorAll('.modal-overlay.active').forEach(function (o) {
      o.classList.remove('active');
    });
  }
  document.querySelectorAll('[data-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal(btn.getAttribute('data-modal')); });
  });
  document.querySelectorAll('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', closeModals);
  });
  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModals(); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModals(); });

  /* ---------- 快速放飞天灯 ---------- */
  var wishInput = document.getElementById('wishInput');
  document.getElementById('flyBtn').addEventListener('click', releaseWish);
  wishInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') releaseWish(); });
  function releaseWish() {
    var text = (wishInput.value || '').trim() || '阖家团圆';
    if (sky) sky.addCustomLantern(text);
    showToast('🏮 天灯已带着「' + text.slice(0, 8) + '」升空');
    wishInput.value = '';
  }

  /* ---------- 贺卡定制 ---------- */
  var blessings = [
    '花好月圆，人间团圆。愿你所念之人皆在身旁，所盼之事皆能圆满。',
    '月到中秋分外明。愿你的生活如满月，事事圆满，岁岁常安。',
    '一块月饼一份甜，一盏天灯一个愿。愿你被这个世界温柔以待。',
    '山河远阔，人间烟火；月照千里，所愿皆得。',
    '愿你三冬暖，愿你春不寒；愿你月圆人圆，事事圆满。',
    '今夜月色真美，风也温柔。想你，中秋快乐。'
  ];
  var DEFAULT_MSG = blessings[0];

  var inTo = document.getElementById('inTo');
  var inFrom = document.getElementById('inFrom');
  var inMsg = document.getElementById('inMsg');
  var previewTo = document.getElementById('previewTo');
  var previewMsg = document.getElementById('previewMsg');
  var previewFrom = document.getElementById('previewFrom');
  var tagCloud = document.getElementById('blessingTags');

  blessings.forEach(function (b) {
    var t = document.createElement('button');
    t.type = 'button';
    t.className = 'tag-btn';
    t.textContent = '「' + b.slice(0, 6) + '…」';
    t.addEventListener('click', function () { inMsg.value = b; renderPreview(); });
    tagCloud.appendChild(t);
  });

  // 链接参数优先，其次记住的上次落款
  var params = new URLSearchParams(location.search);
  inTo.value = (params.get('to') || '').slice(0, 12);
  inFrom.value = (params.get('from') || '').slice(0, 12);
  try {
    if (!inFrom.value) inFrom.value = localStorage.getItem('zq-sender') || '';
  } catch (e) {}
  inMsg.value = (params.get('msg') || DEFAULT_MSG).slice(0, 60);

  function renderPreview() {
    previewTo.textContent = (inTo.value.trim() || '亲爱的朋友') + '：';
    previewMsg.textContent = inMsg.value.trim() || DEFAULT_MSG;
    var f = inFrom.value.trim();
    previewFrom.textContent = f ? ('—— ' + f) : '';
  }
  [inTo, inFrom, inMsg].forEach(function (el) { el.addEventListener('input', renderPreview); });

  function buildLink() {
    var u = new URL(location.href);
    u.search = '';
    var to = inTo.value.trim().slice(0, 12);
    var from = inFrom.value.trim().slice(0, 12);
    var msg = inMsg.value.trim().slice(0, 60);
    if (to) u.searchParams.set('to', to);
    if (from) u.searchParams.set('from', from);
    if (msg && msg !== DEFAULT_MSG) u.searchParams.set('msg', msg);
    return u.toString();
  }

  function copyText(text, okMsg) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove();
      showToast(ok ? okMsg : '复制失败，请长按地址栏手动复制');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showToast(okMsg); }, fallback);
    } else {
      fallback();
    }
  }

  document.getElementById('copyLinkBtn').addEventListener('click', function () {
    try { localStorage.setItem('zq-sender', inFrom.value.trim().slice(0, 12)); } catch (e) {}
    var link = buildLink();
    history.replaceState(null, '', link);
    copyText(link, '🔗 专属链接已复制，快发给 TA 吧');
  });

  document.getElementById('shareBtn').addEventListener('click', function () {
    var link = buildLink();
    var to = inTo.value.trim();
    var from = inFrom.value.trim();
    if (navigator.share) {
      navigator.share({
        title: '中秋快乐',
        text: (to ? '致' + to + '：' : '') + (inMsg.value.trim() || DEFAULT_MSG) + (from ? ' —— ' + from : ''),
        url: link
      }).catch(function () {});
    } else {
      copyText(link, '🔗 链接已复制，去粘贴给 TA 吧');
    }
  });

  // 带称呼的链接打开时，自动亮出贺卡
  if (params.get('to')) {
    setTimeout(function () { openModal('cardModal'); }, 900);
  }
  renderPreview();

  /* ---------- 月饼盲盒 ---------- */
  var fortunes = [
    { level: '上上签 · 大吉', desc: '好事连连，团圆美满，心之所向，皆有回响。', poem: '月满则福至，人安即好时。' },
    { level: '上签 · 吉', desc: '贵人相助，所愿皆有所成，只需稳步向前。', poem: '清风随行处，明月照归途。' },
    { level: '上签 · 吉', desc: '家庭和睦，笑口常开，健康常伴左右。', poem: '灯火可亲处，团圆自有期。' },
    { level: '中平签 · 稳', desc: '平稳安顺，宜沉淀蓄力，静待花开。', poem: '守得云开处，自见月明时。' }
  ];
  var boxResult = document.getElementById('blindboxResult');
  var fortuneLevel = document.getElementById('fortuneLevel');
  var fortuneDesc = document.getElementById('fortuneDesc');
  var fortunePoetry = document.getElementById('fortunePoetry');
  var lastPick = -1;
  document.querySelectorAll('#mooncakeGrid .mooncake-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var i;
      do { i = Math.floor(Math.random() * fortunes.length); } while (i === lastPick && fortunes.length > 1);
      lastPick = i;
      var f = fortunes[i];
      fortuneLevel.textContent = f.level;
      fortuneDesc.textContent = f.desc;
      fortunePoetry.textContent = '「' + f.poem + '」';
      boxResult.style.display = '';
      // 重新触发淡入动画
      boxResult.style.animation = 'none';
      void boxResult.offsetWidth;
      boxResult.style.animation = '';
      if (sky) sky.createSparkleBurst(window.innerWidth / 2, window.innerHeight / 2, 24);
    });
  });

  /* ---------- 灯谜 ---------- */
  var riddles = [
    { q: '中秋菊开', hint: '打一四字成语', a: '花好月圆' },
    { q: '明天日全食', hint: '打一字', a: '月' },
    { q: '十五的月亮', hint: '打一四字成语', a: '正大光明' },
    { q: '举头望明月', hint: '打一中药名', a: '当归' },
    { q: '掬水月在手', hint: '打一四字成语', a: '掌上明珠' },
    { q: '中秋归来', hint: '打一词牌名', a: '八归' }
  ];
  var riddleQuestion = document.getElementById('riddleQuestion');
  var riddleHint = document.getElementById('riddleHint');
  var riddleAnswerBox = document.getElementById('riddleAnswerBox');
  var riddleIdx = -1;
  function nextRiddle() {
    var i;
    do { i = Math.floor(Math.random() * riddles.length); } while (i === riddleIdx && riddles.length > 1);
    riddleIdx = i;
    riddleQuestion.textContent = '谜面：' + riddles[i].q;
    riddleHint.textContent = '（' + riddles[i].hint + '）';
    riddleAnswerBox.textContent = '谜底：' + riddles[i].a;
    riddleAnswerBox.classList.remove('revealed');
  }
  document.getElementById('revealBtn').addEventListener('click', function () {
    riddleAnswerBox.classList.add('revealed');
  });
  document.getElementById('nextRiddleBtn').addEventListener('click', nextRiddle);
  nextRiddle();

  /* ---------- 顶栏分享 ---------- */
  document.getElementById('sharePageBtn').addEventListener('click', function () {
    if (navigator.share) {
      navigator.share({ title: document.title, text: '但愿人长久，千里共婵娟', url: location.href }).catch(function () {});
    } else {
      copyText(location.href, '🔗 页面链接已复制');
    }
  });

  /* ---------- 收到祝福时的署名提示 ---------- */
  var fromParam = params.get('from');
  if (fromParam && params.get('to')) {
    setTimeout(function () { showToast('🌙 ' + fromParam + ' 为你点亮了这轮明月'); }, 2600);
  }
})();
