// Small, purposeful behaviour only. See DESIGN.md → Motion.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Old shared links used ?project=slug.
const legacy = new URLSearchParams(location.search).get('project');
if (legacy && /^[a-z0-9-]+$/.test(legacy)) location.replace(`work/${legacy}.html`);

window.__booted = true;

// Header hairline once the page scrolls.
const top = $('.top');
if (top) {
  const onScroll = () => top.classList.toggle('is-stuck', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// The one page-load sequence.
const hero = $('.hero');
if (hero) requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-in')));

// Product videos play only while on screen.
const autoplay = $$('video[data-autoplay]');
if (autoplay.length && !reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (v.dataset.manual) return;
      if (isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
    });
  }, { threshold: 0.25 });
  autoplay.forEach((v) => { v.muted = true; io.observe(v); });
}

// Siiru, up close: one open design at a time, mirrored on the phone.
const viewer = $('.viewer');
if (viewer) {
  const buttons = $$('.design > button', viewer);
  const screens = $$('.viewer-stage video', viewer);
  const stage = $('.viewer-stage', viewer);
  const stageVisible = () => stage && stage.offsetParent !== null;
  const open = (i) => {
    buttons.forEach((b, k) => b.setAttribute('aria-expanded', String(k === i)));
    screens.forEach((v, k) => {
      const on = k === i;
      v.classList.toggle('is-on', on);
      if (on && stageVisible() && !reduce) { v.preload = 'auto'; v.currentTime = 0; v.play().catch(() => {}); } else v.pause();
    });
  };
  buttons.forEach((b, i) => b.addEventListener('click', () => open(i)));
  if (stage) new IntersectionObserver(([en]) => {
    const v = screens.find((s) => s.classList.contains('is-on'));
    if (!v || reduce || !stageVisible()) return;
    en.isIntersecting ? v.play().catch(() => {}) : v.pause();
  }).observe(stage);
  open(0);
}

// Product film: teaser loop until the visitor presses play.
const film = $('[data-film]');
if (film) {
  const video = $('video', film);
  const play = $('.film-play', film);
  const chapters = $$('[data-at]');
  let started = false;
  const start = (at = 0) => {
    if (!started) {
      started = true;
      video.dataset.manual = '1';
      video.pause();
      video.loop = false;
      video.src = film.dataset.src;
      const track = Object.assign(document.createElement('track'), { kind: 'captions', srclang: 'en', label: 'English', src: film.dataset.captions, default: true });
      video.append(track);
      video.muted = false;
      video.controls = true;
      film.classList.add('is-playing');
    }
    const go = () => { video.currentTime = at; video.play().catch(() => {}); };
    video.readyState >= 1 ? go() : video.addEventListener('loadedmetadata', go, { once: true });
  };
  play.addEventListener('click', () => start(0));
  chapters.forEach((b) => b.addEventListener('click', () => start(parseFloat(b.dataset.at))));
  const times = chapters.map((b) => parseFloat(b.dataset.at));
  video.addEventListener('timeupdate', () => {
    if (!started) return;
    let idx = 0;
    times.forEach((t, i) => { if (video.currentTime >= t) idx = i; });
    chapters.forEach((b, i) => b.setAttribute('aria-current', String(i === idx)));
  });
}

// Page transitions: the clicked cover morphs into the case-study cover.
$$('[data-vt]').forEach((media) => {
  const link = media.closest('a');
  if (!link) return;
  link.addEventListener('click', () => {
    $$('[data-vt]').forEach((m) => { m.style.viewTransitionName = ''; });
    media.style.viewTransitionName = media.dataset.vt;
  });
});
addEventListener('pagereveal', (e) => {
  const from = window.navigation?.activation?.from?.url || '';
  const m = from.match(/work\/([a-z0-9-]+)\.html/);
  if (!e.viewTransition || !m) return;
  const media = $(`[data-vt="cover-${m[1]}"]`);
  if (!media) return;
  media.style.viewTransitionName = media.dataset.vt;
  e.viewTransition.finished.finally(() => { media.style.viewTransitionName = ''; });
});
