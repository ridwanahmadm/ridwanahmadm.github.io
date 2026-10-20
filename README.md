# ridwanahmadm.github.io

Portfolio of **Ridwan Ahmad Ma'arif** — Senior Product Designer, Jakarta.
Live: https://ridwanahmadm.github.io/

A static site with no framework and no runtime dependencies: HTML, CSS and ES modules, deployed straight from `main` by GitHub Pages.

## Structure

```
DESIGN.md               Design contract: tokens, layout, motion and writing rules (read first)
index.html              Home: hero, selected work, Siiru up close, product films, how I lead, AI, about, contact
work/*.html             Case studies (generated, don't edit by hand)
content/cases.json      Source for every case study
tools/build.mjs         Generates work/*.html and sitemap.xml from content/cases.json
tools/serve.mjs         Tiny local preview server
assets/css/site.css     All styles
assets/js/site.js       All behaviour: hover previews, play buttons, Siiru viewer, film players, page transitions
assets/media/           Siiru (ID-EN) and Mahabbati (EN) films, captions, promo, app recordings
404.html, works.html    Not-found page and legacy redirect
```

## Edit & preview

```bash
node tools/build.mjs      # after editing content/cases.json
node tools/serve.mjs      # http://localhost:4321
```

## Notes

- Motion is limited to one hero load sequence, user-triggered changes and page transitions (see DESIGN.md). All of it respects `prefers-reduced-motion`, and every page works without JavaScript.
- Page-to-page transitions use cross-document View Transitions where the browser supports them.
- Legacy `?project=slug` links redirect to the matching case study.
