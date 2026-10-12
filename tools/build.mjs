// Generates every case-study page in /work and sitemap.xml from content/cases.json.
// Usage: node tools/build.mjs   (no dependencies)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://ridwanahmadm.github.io';
const { order, cases } = JSON.parse(readFileSync(join(root, 'content/cases.json'), 'utf8'));

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rel = (p) => (/^(https?:|mailto:|#|\.\.\/)/.test(p) ? p : `../${p}`);

const phone = (name) => `<div class="phone"><div class="phone-screen"><video src="../assets/media/app-${name}.mp4" poster="../assets/media/app-${name}.jpg" muted loop playsinline preload="none" data-autoplay></video></div></div>`;

const fig = (b) => `<figure class="fig${b.small ? ' is-small' : ''}">
          <div class="fig-frame${b.tall ? ' is-tall' : ''}"${b.tall ? ' tabindex="0" role="region" aria-label="' + esc(b.alt) + ', scrollable"' : ''}><img src="${rel(b.src)}" alt="${esc(b.alt)}" width="${b.w}" height="${b.h}" loading="lazy" decoding="async"></div>${b.caption ? `
          <figcaption>${esc(b.caption)}</figcaption>` : ''}
        </figure>`;

const FILM = `<div class="film" data-film data-src="../assets/media/siiru-showreel-id-en.mp4" data-captions="../assets/media/siiru-showreel-en.vtt" style="margin-top:28px;width:min(980px,calc(100vw - 2 * var(--gutter)))">
          <video src="../assets/media/siiru-showreel-teaser.mp4" poster="../assets/media/siiru-showreel-poster.jpg" muted loop playsinline preload="none" data-autoplay aria-label="Siiru product film, Indonesia edition in English"></video>
          <button class="film-play" type="button"><span><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>Play the film (2:00)</span></button>
        </div>`;

function block(b) {
  switch (b.type) {
    case 'image': return fig(b);
    case 'pair': return `<div class="pair">${b.items.map(fig).join('')}</div>`;
    case 'phones': return `<div class="phones" style="--n:${b.items.length}">
          ${b.items.map(([v, t, d]) => `<figure>${phone(v)}<figcaption><strong>${esc(t)}</strong>${esc(d)}</figcaption></figure>`).join('\n          ')}
        </div>`;
    case 'stats': return `<dl class="stats" style="--n:${b.items.length}">${b.items.map(([v, l]) => `<div><dt>${esc(v)}</dt><dd>${esc(l)}</dd></div>`).join('')}</dl>`;
    case 'modes': return `<dl class="modes">${b.items.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
    case 'note': return `<div class="note"><p>${esc(b.text)}</p></div>`;
    case 'film': return FILM;
    case 'builds': return `<div class="builds" style="grid-template-columns:repeat(${b.items.length},1fr);margin-top:28px">${b.items.map(([href, img, t, d]) => `<a class="build" href="${href}" rel="noopener">
            <div class="build-shot"><img src="${rel(img)}" alt="${esc(t)}" loading="lazy" decoding="async"></div>
            <span class="t">${esc(t)}</span><span class="meta">${esc(d)}</span>
          </a>`).join('')}</div>`;
    default: throw new Error(`Unknown block type: ${b.type}`);
  }
}

function cover(slug, c) {
  const vt = `style="view-transition-name: cover-${slug}"`;
  if (c.plate) return `<div class="cover" ${vt}><div class="plate" role="img" aria-label="${esc(c.alt)}">${c.plate.map(phone).join('')}</div></div>`;
  return `<div class="cover" ${vt}><img src="${rel(c.src)}" alt="${esc(c.alt)}" width="${c.w}" height="${c.h}" fetchpriority="high" decoding="async"></div>`;
}

function page(slug, i) {
  const c = cases[slug];
  const nextSlug = order[(i + 1) % order.length];
  const next = cases[nextSlug];
  const ogImage = c.cover.plate ? `${SITE}/${c.cover.poster}` : `${SITE}/${c.cover.src}`;
  const sections = c.sections.map((s) => `<section class="case-section">
        <h2>${esc(s.heading)}</h2>
        ${(s.body || []).map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
        ${(s.blocks || []).map(block).join('\n        ')}
      </section>`).join('\n      ');
  const links = (c.links || []).map(([label, href]) => `<a class="link" href="${rel(href)}" rel="noopener">${esc(label)}</a>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(c.title)}, Ridwan Ahmad Ma'arif</title>
  <meta name="description" content="${esc(c.summary)}">
  <meta name="theme-color" content="#f6f9fc">
  <link rel="canonical" href="${SITE}/work/${slug}.html">
  <link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${SITE}/work/${slug}.html">
  <meta property="og:title" content="${esc(c.title)}">
  <meta property="og:description" content="${esc(c.summary)}">
  <meta property="og:image" content="${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <script>document.documentElement.classList.add('js');</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="../assets/css/site.css">
  <script type="module" src="../assets/js/site.js"></script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>

  <header class="top">
    <div class="wrap">
      <a class="name" href="../index.html">Ridwan<span> Ahmad Ma'arif</span></a>
      <nav class="menu" aria-label="Main">
        <a href="../index.html#work" aria-current="page">Work</a>
        <a href="../index.html#siiru">Siiru</a>
        <a href="../index.html#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
    </div>
  </header>

  <main id="main">
    <header class="case-head">
      <div class="wrap">
        <a class="link back" href="../index.html#work">All work</a>
        <h1 class="display">${esc(c.title)}</h1>
        <p class="lead">${esc(c.summary)}</p>
        ${c.part ? `<p class="part"><strong>My part:</strong> ${esc(c.part)}</p>` : ''}
        <dl class="facts">${c.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        ${cover(slug, c.cover)}
      </div>
    </header>

    <div class="case-body">
      <div class="wrap">
        <div class="col">
      ${sections}
        ${c.note ? `<p class="footnote">${esc(c.note)}</p>` : ''}
        ${links ? `<p class="links" style="margin-top:28px">${links}</p>` : ''}
        </div>
        <div class="case-end">
          <a class="next" href="${nextSlug}.html"><small>Next project</small><span class="h3">${esc(next.title)}</span></a>
          <a class="link" href="../index.html#work">All work</a>
        </div>
      </div>
    </div>
  </main>

  <footer class="contact" id="contact" aria-labelledby="contact-title">
    <div class="wrap">
      <h2 class="display" id="contact-title">Think we'd make a great team?</h2>
      <p>I'm exploring Lead Product Designer and Design Manager roles, and thoughtful collaborations.</p>
      <p class="links">
        <a class="link" href="mailto:hellomaarif@gmail.com">hellomaarif@gmail.com</a>
        <a class="link" href="https://www.linkedin.com/in/ridwanam/" rel="noopener">LinkedIn</a>
      </p>
      <div class="foot">
        <span>© 2026 Ridwan Ahmad Ma'arif. Set in Plus Jakarta Sans by Tokotype.</span>
        <a href="#main">Back to top</a>
      </div>
    </div>
  </footer>
</body>
</html>
`;
}

mkdirSync(join(root, 'work'), { recursive: true });
order.forEach((slug, i) => {
  writeFileSync(join(root, 'work', `${slug}.html`), page(slug, i));
  console.log(`✓ work/${slug}.html`);
});

const today = new Date().toISOString().slice(0, 10);
const urls = ['', ...order.map((s) => `work/${s}.html`)];
writeFileSync(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}/${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
console.log('✓ sitemap.xml');
