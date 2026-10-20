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

// Media moves only when someone asks for it: no autoplay, no endless loops
// (WCAG 2.2.2 and NN/g). Posters carry the page until then.
const fine = matchMedia('(pointer: fine)').matches;
const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
const setBtn = (btn, state, name) => {
  btn.dataset.state = state;
  btn.innerHTML = state === 'playing' ? ICON_PAUSE : ICON_PLAY;
  const verb = state === 'playing' ? 'Pause' : state === 'ended' ? 'Replay' : 'Play';
  btn.setAttribute('aria-label', `${verb} screen recording: ${name}`);
};
const playOnce = (v) => { v.loop = false; v.muted = true; v.preload = 'auto'; if (v.ended) v.currentTime = 0; v.play().catch(() => {}); };
const toggle = (v) => (v.paused || v.ended ? playOnce(v) : v.pause());
const follow = (v, btn, name, isActive = () => true) => {
  const sync = () => { if (isActive()) setBtn(btn, v.ended ? 'ended' : v.paused ? 'paused' : 'playing', name); };
  ['play', 'pause', 'ended'].forEach((ev) => v.addEventListener(ev, sync));
};

// Project rows: a quiet preview while the pointer rests on the row (desktop only).
if (fine && !reduce) $$('[data-preview]').forEach((box) => {
  const vids = $$('video', box);
  const host = box.closest('a') || box;
  host.addEventListener('pointerenter', () => vids.forEach((v) => { v.muted = true; v.loop = true; v.preload = 'auto'; v.play().catch(() => {}); }));
  host.addEventListener('pointerleave', () => vids.forEach((v) => { v.pause(); v.load(); }));
});

// Screen recordings: a visible play and pause button on each one.
$$('[data-clip]').forEach((box) => {
  const v = $('video', box);
  const btn = $('.clip-btn', box);
  if (!v || !btn) return;
  const name = box.dataset.clip;
  setBtn(btn, 'paused', name);
  follow(v, btn, name);
  btn.addEventListener('click', () => toggle(v));
});

// Siiru, up close: one open design at a time, mirrored on the phone.
const viewer = $('.viewer');
if (viewer) {
  const buttons = $$('.design > button', viewer);
  const screens = $$('.viewer-stage video', viewer);
  const stage = $('.viewer-stage', viewer);
  const stageBtn = $('.viewer-stage .clip-btn', viewer);
  const names = buttons.map((b) => b.textContent.trim());
  const stageVisible = () => stage && stage.offsetParent !== null;
  let current = 0;
  screens.forEach((v, k) => follow(v, stageBtn, names[k], () => k === current));
  const open = (i, fromUser) => {
    current = i;
    buttons.forEach((b, k) => b.setAttribute('aria-expanded', String(k === i)));
    screens.forEach((v, k) => {
      v.classList.toggle('is-on', k === i);
      if (k !== i) { v.pause(); if (v.currentTime) v.load(); }
    });
    $$('.design-body video', viewer).forEach((v) => v.pause());
    if (stageBtn) setBtn(stageBtn, 'paused', names[i]);
    if (fromUser && stageVisible() && !reduce) playOnce(screens[i]);
  };
  buttons.forEach((b, i) => b.addEventListener('click', () => open(i, true)));
  if (stageBtn) stageBtn.addEventListener('click', () => toggle(screens[current]));
  open(0, false);
}

// Product films: the native player stays as the no-JS fallback; with JS a
// single "Play" button starts the full film with sound and captions.
$$('[data-film]').forEach((film) => {
  const video = $('video', film);
  const play = $('.film-play', film);
  const item = film.closest('.film-item') || document;
  const chapters = $$('[data-at]', item);
  video.controls = false;
  let started = false;
  const start = (at = 0) => {
    $$('[data-film] video').forEach((other) => { if (other !== video) other.pause(); });
    if (!started) { started = true; video.controls = true; film.classList.add('is-playing'); }
    video.preload = 'auto';
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
});

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
