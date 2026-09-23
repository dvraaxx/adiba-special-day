/* ==========================================================
   0. UTILITIES
   ========================================================== */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(pointer: fine)').matches;
const hero = document.getElementById('hero');

/* ==========================================================
   1. LOADING SCREEN + HERO ENTRANCE
   ========================================================== */
const loadingScreen = document.getElementById('loadingScreen');

function revealHeroStagger() {
  document.querySelectorAll('.hero-stagger').forEach(el => {
    const delay = parseInt(el.dataset.delay || '0', 10);
    el.style.transitionDelay = (delay * 0.15) + 's';
    el.classList.add('is-visible');
  });
}

window.addEventListener('load', () => {
  const hideDelay = prefersReducedMotion ? 150 : 1900;
  setTimeout(() => {
    loadingScreen.classList.add('is-hidden');
    revealHeroStagger();
    setTimeout(() => hero.classList.add('opened'), prefersReducedMotion ? 50 : 900);
  }, hideDelay);
});

document.getElementById('scrollCue').addEventListener('click', () => {
  document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
});

/* Subtle hero parallax on scroll */
if (!prefersReducedMotion) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      hero.style.backgroundPosition = 'center ' + (scrolled * 0.15) + 'px';
    }
  }, { passive: true });
}

/* ==========================================================
   2. READING PROGRESS BAR
   ========================================================== */
const progressFill = document.getElementById('progressFill');
function updateProgress() {
  const scrolled = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? (scrolled / max) * 100 : 0;
  progressFill.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

/* ==========================================================
   3. AMBIENT SPARKLES CANVAS
   ========================================================== */
const sparklesCanvas = document.getElementById('sparklesCanvas');
const sparklesCtx = sparklesCanvas.getContext('2d');
let sparkles = [];

function sizeSparklesCanvas() {
  sparklesCanvas.width = window.innerWidth;
  sparklesCanvas.height = window.innerHeight;
}
function initSparkles() {
  sizeSparklesCanvas();
  const count = Math.round((sparklesCanvas.width * sparklesCanvas.height) / 26000);
  sparkles = Array.from({ length: count }, () => ({
    x: Math.random() * sparklesCanvas.width,
    y: Math.random() * sparklesCanvas.height,
    r: 0.6 + Math.random() * 1.4,
    phase: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * 0.8,
    drift: (Math.random() - 0.5) * 0.15
  }));
}
function drawSparkles(t) {
  sparklesCtx.clearRect(0, 0, sparklesCanvas.width, sparklesCanvas.height);
  sparklesCtx.fillStyle = '#E8C874';
  sparkles.forEach(s => {
    const twinkle = 0.35 + 0.65 * Math.abs(Math.sin((t / 900) * s.speed + s.phase));
    s.y -= 0.06 * s.speed;
    s.x += s.drift;
    if (s.y < -10) s.y = sparklesCanvas.height + 10;
    if (s.x < -10) s.x = sparklesCanvas.width + 10;
    if (s.x > sparklesCanvas.width + 10) s.x = -10;
    sparklesCtx.globalAlpha = twinkle * 0.55;
    sparklesCtx.beginPath();
    sparklesCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sparklesCtx.fill();
  });
  sparklesCtx.globalAlpha = 1;
  requestAnimationFrame(drawSparkles);
}
window.addEventListener('resize', sizeSparklesCanvas);
initSparkles();
if (!prefersReducedMotion) requestAnimationFrame(drawSparkles);

/* ==========================================================
   4. HERO FLOATING PETALS CANVAS
   ========================================================== */
const petalsCanvas = document.getElementById('petalsCanvas');
const petalsCtx = petalsCanvas.getContext('2d');
let petals = [];

function sizePetalsCanvas() {
  const rect = hero.getBoundingClientRect();
  petalsCanvas.width = rect.width;
  petalsCanvas.height = rect.height;
}
function makePetal() {
  return {
    x: Math.random() * petalsCanvas.width,
    y: -20,
    size: 6 + Math.random() * 8,
    speedY: 0.4 + Math.random() * 0.6,
    swayAmp: 20 + Math.random() * 30,
    swaySpeed: 0.4 + Math.random() * 0.6,
    swayPhase: Math.random() * Math.PI * 2,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.02,
    hue: Math.random() > 0.5 ? '232,200,116' : '251,241,228',
    alpha: 0.3 + Math.random() * 0.35
  };
}
function initPetals() {
  sizePetalsCanvas();
  const count = Math.max(10, Math.round(petalsCanvas.width / 60));
  petals = Array.from({ length: count }, () => {
    const p = makePetal();
    p.y = Math.random() * petalsCanvas.height;
    return p;
  });
}
function drawPetals(t) {
  petalsCtx.clearRect(0, 0, petalsCanvas.width, petalsCanvas.height);
  petals.forEach(p => {
    p.y += p.speedY;
    p.rotation += p.spin;
    const sway = Math.sin((t / 1000) * p.swaySpeed + p.swayPhase) * p.swayAmp * 0.02;
    p.x += sway;
    if (p.y > petalsCanvas.height + 20) {
      Object.assign(p, makePetal());
    }
    petalsCtx.save();
    petalsCtx.translate(p.x, p.y);
    petalsCtx.rotate(p.rotation);
    petalsCtx.fillStyle = 'rgba(' + p.hue + ',' + p.alpha + ')';
    petalsCtx.beginPath();
    petalsCtx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
    petalsCtx.fill();
    petalsCtx.restore();
  });
  requestAnimationFrame(drawPetals);
}
window.addEventListener('resize', sizePetalsCanvas);
initPetals();
if (!prefersReducedMotion) requestAnimationFrame(drawPetals);

/* ==========================================================
   5. SCROLL REVEAL (section-level)
   ========================================================== */
const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });
revealItems.forEach(item => revealObserver.observe(item));

/* ==========================================================
   6. MENU ICONS — staggered entrance + ripple
   ========================================================== */
const menuStaggerItems = document.querySelectorAll('.menu-stagger');
const menuObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const index = parseInt(el.dataset.index || '0', 10);
      setTimeout(() => el.classList.add('is-visible'), index * 120);
      menuObserver.unobserve(el);
    }
  });
}, { threshold: 0.3 });
menuStaggerItems.forEach(item => menuObserver.observe(item));

document.querySelectorAll('.menu-icon-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 1.6;
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

/* ==========================================================
   7. MENU ↔ PANEL NAVIGATION
   ========================================================== */
const panels = document.querySelectorAll('.panel');
let lastFocusedTrigger = null;

function resetPanelStagger(panel) {
  panel.querySelectorAll('.panel-stagger').forEach(el => {
    el.classList.remove('is-visible');
  });
}
function playPanelStagger(panel) {
  panel.querySelectorAll('.panel-stagger').forEach(el => {
    const delay = parseInt(el.dataset.delay || '0', 10);
    el.style.transitionDelay = (delay * 0.1) + 's';
    el.classList.add('is-visible');
  });
}

function openPanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  panels.forEach(p => { p.classList.remove('is-active'); p.setAttribute('aria-hidden', 'true'); });
  resetPanelStagger(panel);
  panel.classList.add('is-active');
  panel.setAttribute('aria-hidden', 'false');
  panel.scrollTop = 0;
  document.body.classList.add('panel-open');

  if (id === 'panelGift') sizeConfettiCanvas();

  requestAnimationFrame(() => requestAnimationFrame(() => playPanelStagger(panel)));

  const heading = panel.querySelector('.section-title');
  if (heading) heading.focus();
}

function closeToMenu() {
  const activePanel = document.querySelector('.panel.is-active');
  panels.forEach(p => { p.classList.remove('is-active'); p.setAttribute('aria-hidden', 'true'); });
  if (activePanel) resetPanelStagger(activePanel);
  document.body.classList.remove('panel-open');
  if (lastFocusedTrigger) lastFocusedTrigger.focus();
}

document.querySelectorAll('.menu-icon-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    lastFocusedTrigger = btn;
    openPanel(btn.dataset.target);
  });
});
document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', closeToMenu);
});

/* ==========================================================
   8. DRAG & DROP — mouse + touch
   ========================================================== */
const desk = document.getElementById('desk');
const draggables = document.querySelectorAll('.draggable');

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

draggables.forEach(el => {
  const deskRect = desk.getBoundingClientRect();
  const xPercent = parseFloat(getComputedStyle(el).getPropertyValue('--x')) || 0;
  const yPercent = parseFloat(getComputedStyle(el).getPropertyValue('--y')) || 0;
  let left = (xPercent / 100) * deskRect.width;
  let top = (yPercent / 100) * deskRect.height;
  el.style.left = left + 'px';
  el.style.top = top + 'px';

  let startX = 0, startY = 0, originLeft = 0, originTop = 0, dragging = false, moved = false;

  function onPointerDown(e) {
    dragging = true;
    moved = false;
    el.classList.add('is-dragging');
    el.setPointerCapture(e.pointerId);
    startX = e.clientX;
    startY = e.clientY;
    originLeft = parseFloat(el.style.left);
    originTop = parseFloat(el.style.top);
  }
  function onPointerMove(e) {
    if (!dragging) return;
    const dRect = desk.getBoundingClientRect();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved = true;
    const maxLeft = dRect.width - el.offsetWidth;
    const maxTop = dRect.height - el.offsetHeight;
    el.style.left = clamp(originLeft + dx, 0, maxLeft) + 'px';
    el.style.top = clamp(originTop + dy, 0, maxTop) + 'px';
  }
  function onPointerUp(e) {
    dragging = false;
    el.classList.remove('is-dragging');
    try { el.releasePointerCapture(e.pointerId); } catch (err) { }
  }

  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onPointerUp);
  el.addEventListener('click', (e) => {
    if (moved) {
      e.stopImmediatePropagation();
      moved = false;
    }
  });

  el.addEventListener('keydown', (e) => {
    const step = 12;
    const dRect = desk.getBoundingClientRect();
    const maxLeft = dRect.width - el.offsetWidth;
    const maxTop = dRect.height - el.offsetHeight;
    let curLeft = parseFloat(el.style.left);
    let curTop = parseFloat(el.style.top);
    switch (e.key) {
      case 'ArrowLeft': curLeft -= step; break;
      case 'ArrowRight': curLeft += step; break;
      case 'ArrowUp': curTop -= step; break;
      case 'ArrowDown': curTop += step; break;
      default: return;
    }
    e.preventDefault();
    el.style.left = clamp(curLeft, 0, maxLeft) + 'px';
    el.style.top = clamp(curTop, 0, maxTop) + 'px';
  });
});

/* ==========================================================
   9. PHOTO TILT EFFECT (3D mouse-tracking)
   ========================================================== */
if (isFinePointer && !prefersReducedMotion) {
  document.querySelectorAll('.tilt-target').forEach(card => {
    const frame = card.querySelector('.photo-frame');
    if (!frame) return;
    card.addEventListener('mousemove', (e) => {
      if (card.classList.contains('is-dragging')) return;
      const rect = card.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      frame.style.transition = 'none';
      frame.style.transform = 'perspective(600px) rotateX(' + (-relY * 16) + 'deg) rotateY(' + (relX * 16) + 'deg)';
    });
    card.addEventListener('mouseleave', () => {
      frame.style.transition = 'transform .4s var(--ease)';
      frame.style.transform = '';
    });
  });
}

/* ==========================================================
   10. LIGHTBOX (klik foto)
   ========================================================== */
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxContent = document.getElementById('lightboxContent');
const lightboxCloseBtn = document.getElementById('lightboxClose');
let lightboxTrigger = null;

function openLightbox(photoEl) {
  lightboxTrigger = photoEl;
  const inner = photoEl.querySelector('.photo-inner');
  const caption = photoEl.querySelector('.photo-caption');
  lightboxContent.innerHTML = '';
  const clone = document.createElement('div');
  clone.className = 'photo-inner-clone';
  clone.textContent = inner ? inner.textContent : '';
  lightboxContent.appendChild(clone);
  if (caption) {
    const cap = document.createElement('p');
    cap.className = 'lightbox-caption';
    cap.textContent = caption.textContent;
    lightboxContent.appendChild(cap);
  }
  lightboxOverlay.classList.add('is-active');
  lightboxOverlay.setAttribute('aria-hidden', 'false');
  lightboxCloseBtn.focus();
}
function closeLightbox() {
  lightboxOverlay.classList.remove('is-active');
  lightboxOverlay.setAttribute('aria-hidden', 'true');
  if (lightboxTrigger) lightboxTrigger.focus();
}
document.querySelectorAll('.photo.tilt-target').forEach(photo => {
  photo.addEventListener('click', () => openLightbox(photo));
  photo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(photo);
    }
  });
});
lightboxCloseBtn.addEventListener('click', closeLightbox);
lightboxOverlay.addEventListener('click', (e) => {
  if (e.target === lightboxOverlay) closeLightbox();
});

/* ==========================================================
   11. SURAT — TYPEWRITER
   ========================================================== */
const letterCard = document.getElementById('letterCard');
const letterPaper = document.getElementById('letterPaper');
const openLetterBtn = document.getElementById('openLetterBtn');
const closeLetterBtn = document.getElementById('closeLetterBtn');

const typewriterEls = Array.from(letterPaper.querySelectorAll('.typewriter-target'));
const typewriterOriginals = typewriterEls.map(el => el.innerHTML);
let typewriterGeneration = 0;

function tokenizeHTML(html) {
  return html.match(/<[^>]+>|[\s\S]/g) || [];
}

function runTypewriter() {
  typewriterGeneration++;
  const gen = typewriterGeneration;
  let skip = prefersReducedMotion;

  typewriterEls.forEach(el => { el.innerHTML = ''; });

  function onSkipClick(e) {
    if (e.target.closest('.btn-close-letter')) return;
    skip = true;
  }
  letterPaper.addEventListener('click', onSkipClick);

  let ti = 0;
  function typeNext() {
    if (gen !== typewriterGeneration) return;
    if (ti >= typewriterEls.length) {
      letterPaper.removeEventListener('click', onSkipClick);
      return;
    }
    const el = typewriterEls[ti];
    if (skip) {
      el.innerHTML = typewriterOriginals[ti];
      ti++;
      typeNext();
      return;
    }
    const tokens = tokenizeHTML(typewriterOriginals[ti]);
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    el.appendChild(cursor);
    let idx = 0;
    function typeChar() {
      if (gen !== typewriterGeneration) return;
      if (skip) {
        cursor.remove();
        el.innerHTML = typewriterOriginals[ti];
        ti++;
        typeNext();
        return;
      }
      if (idx >= tokens.length) {
        cursor.remove();
        ti++;
        typeNext();
        return;
      }
      cursor.insertAdjacentHTML('beforebegin', tokens[idx]);
      idx++;
      setTimeout(typeChar, 16 + Math.random() * 34);
    }
    typeChar();
  }
  typeNext();
}

openLetterBtn.addEventListener('click', () => {
  letterCard.classList.add('is-open');
  runTypewriter();
});
closeLetterBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  letterCard.classList.remove('is-open');
  typewriterGeneration++;
});

/* ==========================================================
   12. KEJUTAN TERAKHIR — CONFETTI
   ========================================================== */
const surpriseBtn = document.getElementById('surpriseBtn');
const surpriseMessage = document.getElementById('surpriseMessage');
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
let confettiParticles = [];
let confettiRunning = false;
let spawnUntil = 0;

function sizeConfettiCanvas() {
  const wrap = canvas.closest('.panel-inner');
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
}
window.addEventListener('resize', sizeConfettiCanvas);
sizeConfettiCanvas();

const confettiColors = ['#E8C874', '#C9A227', '#93384A', '#6B1E2B'];
const confettiShapes = ['square', 'circle', 'heart', 'star'];
const confettiEmoji = ['🎂', '🎉', '🤎'];

function spawnRainParticle() {
  const useEmoji = Math.random() < 0.12;
  return {
    type: useEmoji ? 'emoji' : confettiShapes[Math.floor(Math.random() * confettiShapes.length)],
    emoji: confettiEmoji[Math.floor(Math.random() * confettiEmoji.length)],
    x: Math.random() * canvas.width,
    y: -20,
    r: useEmoji ? 16 + Math.random() * 8 : 4 + Math.random() * 5,
    speedY: 1.2 + Math.random() * 2,
    speedX: (Math.random() - 0.5) * 1.6,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.2,
    windPhase: Math.random() * Math.PI * 2,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
  };
}
function spawnBurstParticle(originX, originY) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 3 + Math.random() * 6;
  const useEmoji = Math.random() < 0.15;
  return {
    type: useEmoji ? 'emoji' : confettiShapes[Math.floor(Math.random() * confettiShapes.length)],
    emoji: confettiEmoji[Math.floor(Math.random() * confettiEmoji.length)],
    x: originX,
    y: originY,
    r: useEmoji ? 16 + Math.random() * 8 : 4 + Math.random() * 6,
    speedY: Math.sin(angle) * speed - 2,
    speedX: Math.cos(angle) * speed,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.25,
    windPhase: Math.random() * Math.PI * 2,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
  };
}
function drawHeart(size) {
  const s = size / 10;
  ctx.beginPath();
  ctx.moveTo(0, 2 * s);
  ctx.bezierCurveTo(0, 0, -4 * s, -3 * s, -7 * s, 0);
  ctx.bezierCurveTo(-10 * s, 4 * s, -4 * s, 8 * s, 0, 12 * s);
  ctx.bezierCurveTo(4 * s, 8 * s, 10 * s, 4 * s, 7 * s, 0);
  ctx.bezierCurveTo(4 * s, -3 * s, 0, 0, 0, 2 * s);
  ctx.closePath();
  ctx.fill();
}
function drawStarShape(size) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
    const a2 = a + Math.PI / 5;
    ctx.lineTo(Math.cos(a2) * size * 0.45, Math.sin(a2) * size * 0.45);
  }
  ctx.closePath();
  ctx.fill();
}

function confettiTick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (Date.now() < spawnUntil && Math.random() < 0.7) {
    confettiParticles.push(spawnRainParticle());
  }
  const t = Date.now();
  confettiParticles.forEach(p => {
    p.speedY += 0.08;
    p.y += p.speedY;
    p.x += p.speedX + Math.sin(t / 500 + p.windPhase) * 0.5;
    p.rotation += p.spin;
  });
  confettiParticles = confettiParticles.filter(p => p.y < canvas.height + 30);

  confettiParticles.forEach(p => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    if (p.type === 'emoji') {
      ctx.font = p.r + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, 0, 0);
    } else {
      ctx.fillStyle = p.color;
      if (p.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'heart') {
        drawHeart(p.r);
      } else if (p.type === 'star') {
        drawStarShape(p.r * 0.6);
      } else {
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      }
    }
    ctx.restore();
  });

  if (confettiParticles.length > 0 || Date.now() < spawnUntil) {
    requestAnimationFrame(confettiTick);
  } else {
    confettiRunning = false;
  }
}

surpriseBtn.addEventListener('click', () => {
  surpriseMessage.classList.add('is-shown');
  sizeConfettiCanvas();

  const btnRect = surpriseBtn.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const originX = btnRect.left + btnRect.width / 2 - canvasRect.left;
  const originY = btnRect.top + btnRect.height / 2 - canvasRect.top;
  const burstCount = prefersReducedMotion ? 0 : 36;
  for (let i = 0; i < burstCount; i++) {
    confettiParticles.push(spawnBurstParticle(originX, originY));
  }

  spawnUntil = Date.now() + (prefersReducedMotion ? 0 : 2400);
  if (!confettiRunning) {
    confettiRunning = true;
    requestAnimationFrame(confettiTick);
  }
});

/* ==========================================================
   13. CUSTOM CURSOR (Event Listeners)
   ========================================================== */
if (isFinePointer && !prefersReducedMotion) {
  const cursorEl = document.getElementById('customCursor');
  document.body.classList.add('has-custom-cursor');
  cursorEl.style.opacity = '0';

  window.addEventListener('mousemove', (e) => {
    cursorEl.style.opacity = '1';
    cursorEl.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px) translate(-50%, -50%)';
  });
  document.addEventListener('mouseleave', () => { cursorEl.style.opacity = '0'; });

  const hoverSelector = 'a, button, .draggable, .photo-inner, .menu-icon-btn, [tabindex]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSelector)) cursorEl.classList.add('is-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSelector)) cursorEl.classList.remove('is-hover');
  });
  document.addEventListener('mousedown', () => cursorEl.classList.add('is-active'));
  document.addEventListener('mouseup', () => cursorEl.classList.remove('is-active'));
}

/* ==========================================================
   14. KEYBOARD SHORTCUTS
   ========================================================== */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (lightboxOverlay.classList.contains('is-active')) {
      closeLightbox();
      return;
    }
    const openPanelEl = document.querySelector('.panel.is-active');
    if (openPanelEl) closeToMenu();
  }
});

/* ==========================================================
   15. MOTION & MICRO-INTERACTIONS — PARALLAX + DESK STAGGER
   (Agent 2 — Motion & Micro-interaction Specialist)
   ========================================================== */

/* --- 15a. Parallax halus dalam panel (desk background + letter card) ---
   IntersectionObserver menentukan kapan target sedang terlihat;
   listener scroll di panel (passive: true) hanya menjadwalkan
   satu requestAnimationFrame per tick, tidak menulis DOM langsung
   di dalam handler scroll. */
function initPanelParallax(panelEl, targetEl, { strength = 0.08, background = false } = {}) {
  if (prefersReducedMotion || !panelEl || !targetEl) return;

  let ticking = false;
  let inView = false;

  function apply() {
    ticking = false;
    if (!inView || !panelEl.classList.contains('is-active')) return;
    const panelRect = panelEl.getBoundingClientRect();
    const elRect = targetEl.getBoundingClientRect();
    const centerOffset = (elRect.top + elRect.height / 2) - (panelRect.top + panelRect.height / 2);
    const offset = centerOffset * strength;
    if (background) {
      targetEl.style.backgroundPosition = 'center ' + offset.toFixed(1) + 'px';
    } else {
      targetEl.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(apply);
    }
  }

  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      inView = entry.isIntersecting;
      if (inView) apply();
    });
  }, { threshold: 0 }).observe(targetEl);

  panelEl.addEventListener('scroll', onScroll, { passive: true });
}

initPanelParallax(document.getElementById('panelMoment'), desk, { strength: 0.05, background: true });
initPanelParallax(document.getElementById('panelJourney'), letterCard, { strength: 0.1 });

/* --- 15b. Staggered reveal per item di desk (foto, sticky-note, doodle) ---
   Bukan cuma reveal level-section (.panel-stagger) seperti sebelumnya —
   tiap item di desk dapat delay sendiri. Class reveal dilepas lagi
   setelah transisi selesai supaya rotate(var(--r)) & :hover normal
   kembali berfungsi tanpa konflik spesifisitas jangka panjang. */
const deskStaggerItems = desk ? Array.from(desk.querySelectorAll('.photo, .sticky-note, .doodle')) : [];

function playDeskStagger() {
  if (prefersReducedMotion) return;
  deskStaggerItems.forEach((el, i) => {
    el.classList.remove('is-visible');
    el.classList.add('desk-item-reveal');
    el.style.transitionDelay = (i * 0.06) + 's';
    void el.offsetWidth; // force reflow supaya transisi restart tiap panel dibuka ulang

    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-visible')));

    const onDone = (e) => {
      if (e.target !== el) return;
      el.classList.remove('desk-item-reveal', 'is-visible');
      el.style.transitionDelay = '';
      el.removeEventListener('transitionend', onDone);
    };
    el.addEventListener('transitionend', onDone);
  });
}

const momentTrigger = document.querySelector('.menu-icon-btn[data-target="panelMoment"]');
if (momentTrigger) momentTrigger.addEventListener('click', playDeskStagger);

/* ==========================================================
   16. KEEPSAKE / PRINT — SIMPAN SURAT SEBAGAI KENANGAN
   ========================================================== */
const printKeepsake = document.createElement('div');
printKeepsake.id = 'printKeepsake';
printKeepsake.setAttribute('aria-hidden', 'true');
document.body.appendChild(printKeepsake);

function buildKeepsakeHTML() {
  return typewriterEls.map((el, i) => {
    const tag = el.tagName.toLowerCase();
    const cls = el.className.replace('typewriter-target', '').trim();
    return '<' + tag + (cls ? ' class="' + cls + '"' : '') + '>' + typewriterOriginals[i] + '</' + tag + '>';
  }).join('');
}

const keepsakeBtn = document.createElement('button');
keepsakeBtn.type = 'button';
keepsakeBtn.className = 'btn-keepsake';
keepsakeBtn.textContent = '🖨 Simpan Surat sebagai Kenangan';
keepsakeBtn.addEventListener('click', () => {
  printKeepsake.innerHTML = '<div class="keepsake-page">' + buildKeepsakeHTML() + '</div>';
  window.print();
});
letterPaper.appendChild(keepsakeBtn);

/* ==========================================================
   17. REASONS FLIP CARDS
   ========================================================== */
document.querySelectorAll('.reason-card').forEach(card => {
  card.addEventListener('click', () => {
    const pressed = card.getAttribute('aria-pressed') === 'true';
    card.setAttribute('aria-pressed', String(!pressed));
  });
});

/* ==========================================================
   18. AMBIENT MUSIC (musik latar lembut, opsional)
   Ganti ambientAudio.src di bawah ke file lagu asli kamu.
   ========================================================== */
const ambientAudio = document.createElement('audio');
ambientAudio.src = 'assets/audio/GANTI_LAGU_KAMU.mp3';
ambientAudio.loop = true;
ambientAudio.volume = 0.35;
ambientAudio.preload = 'none';

const ambientBtn = document.createElement('button');
ambientBtn.type = 'button';
ambientBtn.className = 'btn-ambient-music';
ambientBtn.setAttribute('aria-pressed', 'false');
ambientBtn.setAttribute('aria-label', 'Putar musik latar');
ambientBtn.textContent = '♪';
document.body.appendChild(ambientBtn);

function setAmbientPlaying(playing) {
  ambientBtn.classList.toggle('is-playing', playing);
  ambientBtn.setAttribute('aria-pressed', String(playing));
  ambientBtn.setAttribute('aria-label', playing ? 'Jeda musik latar' : 'Putar musik latar');
}

ambientBtn.addEventListener('click', () => {
  if (ambientAudio.paused) {
    ambientAudio.play().then(() => setAmbientPlaying(true)).catch(() => setAmbientPlaying(false));
  } else {
    ambientAudio.pause();
    setAmbientPlaying(false);
  }
});

// Coba mulai otomatis begitu ada interaksi pertama (mengikuti kebijakan autoplay browser)
document.addEventListener('click', function tryAmbientAutoStart() {
  if (ambientAudio.paused) {
    ambientAudio.play().then(() => setAmbientPlaying(true)).catch(() => { });
  }
  document.removeEventListener('click', tryAmbientAutoStart);
}, { once: true });

/* ==========================================================
   19. HERO COUNTDOWN — menuju 24 September (ulang tahun ke-23 Adiba)
   Ganti tanggal di bawah kalau perlu (format ISO, offset +07:00 = WIB).
   ========================================================== */
const heroCountdown = document.getElementById('heroCountdown');
const birthdayTarget = new Date('2026-09-23T00:00:00+07:00'); // Diubah ke hari ini agar bisa di-preview

function updateHeroCountdown() {
  if (!heroCountdown) return;
  const now = new Date();
  const diff = birthdayTarget - now;
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff > 0) {
    const days = Math.floor(diff / oneDay);
    const hours = Math.floor((diff % oneDay) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    let text;
    if (days > 0) {
      text = days + ' hari ' + hours + ' jam menuju hari spesialmu 🎂';
    } else if (hours > 0) {
      text = hours + ' jam ' + minutes + ' menit lagi 🎂';
    } else {
      text = minutes + ' menit lagi 🎂';
    }
    heroCountdown.textContent = text;
    heroCountdown.style.display = '';
  } else if (diff > -oneDay) {
    heroCountdown.textContent = 'Hari ini harinya. Selamat ulang tahun ke-23, Adiba 🎉';
    heroCountdown.style.display = '';
  } else {
    heroCountdown.style.display = 'none';
  }
}

updateHeroCountdown();
setInterval(updateHeroCountdown, 30000);

/* ==========================================================
   20. COUNTDOWN GATE — mengunci web sampai waktunya tiba
   Target sama dengan hero countdown: 24 September 2026, WIB.
   Ganti tanggalnya di sini kalau perlu.
   ========================================================== */
const countdownGate = document.getElementById('countdownGate');
const gateTarget = new Date('2026-09-23T00:00:00+07:00'); // Diubah ke hari ini agar gate langsung terbuka
let gateTimer;

function padNum(n) {
  return String(n).padStart(2, '0');
}

function tickGate() {
  const diff = gateTarget - Date.now();

  if (diff <= 0) {
    countdownGate.classList.add('is-unlocked');
    document.body.style.overflow = '';
    clearInterval(gateTimer);
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  document.getElementById('cdHours').textContent = padNum(hours);
  document.getElementById('cdMinutes').textContent = padNum(minutes);
  document.getElementById('cdSeconds').textContent = padNum(seconds);
}

if (countdownGate) {
  if (gateTarget - Date.now() > 0) {
    document.body.style.overflow = 'hidden';
    tickGate();
    gateTimer = setInterval(tickGate, 1000);
  } else {
    countdownGate.classList.add('is-unlocked');
  }
}
