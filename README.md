# Ridwan — Product Designer Portfolio

An existing HTML/CSS/ES6 portfolio revised in place. Static GitHub Pages hosting; no framework, package installation, or build step.

## Local preview

Run `python3 -m http.server 8080` from this directory, then open http://127.0.0.1:8080. Use HTTP rather than `file://` so the browser can fetch JSON.

## Routes

- `index.html`: hero, marquee, About, stats, featured projects, and contact/footer.
- `works.html`: all published projects in the selected order, with the same detail modal.
- `cms-login/index.html`: content editor, media uploads, draft preview, backup import/export, and optional GitHub publishing. It is intentionally absent from public navigation and uses noindex.

All content is read from `data/projects.json` (schema version 2). Every public copy field, media source/alt text, navigation label, and interface label is editable. Section numbering is generated automatically; navigation and project numbers have been removed. The font remains Inter with an Arial fallback. The existing sky-blue palette is retained. CTA buttons are text-only; the modal close control remains accessible.

Read [CMS.md](CMS.md) for editing, schema, preview, and publishing instructions. Local drafts use IndexedDB and are visible only on this device. Publishing commits content and uploaded media to your GitHub repository; it does not deploy the site's code for the first time. A fine-grained GitHub token stays in tab memory only. There is no server-side CMS login.

## GitHub Pages

Public site: **https://ridwanahmadm.github.io/**. Publishing repository: **ridwanahmadm/ridwanahmadm.github.io**, branch **main**, directory **/ (root)**. `.nojekyll` serves the static files directly. Paths also support project URLs such as `/portfolio/`. Changes made through the CMS reach visitors after the repository commit and GitHub Pages deployment finish. In the CMS, connect owner `ridwanahmadm`, repository `ridwanahmadm.github.io`, and branch `main`; supply your repository-scoped token only in the editor’s connection form.

## Before publishing

- Review [CONTENT_AUDIT.md](CONTENT_AUDIT.md), especially the conflicting e-KYC and homepage metrics. Current figures are attributed to the original portfolio and await confirmation of their measurement scope.
- Review the rewritten English copy and original Figma assets. Eight studies, work history, learning, email, and LinkedIn are populated from the supplied portfolio and owner information.
- The previous six concept projects and **DUMMY** metrics remain unpublished in the CMS. Verify their content and replace placeholder assets before publishing those entries.
- Replace the hero background through **Hero → Media** if desired; it currently uses an original Hijra mockup. **Experience & mockups** controls the three-card collage, and **Work experience** edits all employment entries.

## Motion

The motion system uses CSS and IntersectionObserver/requestAnimationFrame only. Hero text and background have gentle scroll parallax, capped at 60px. On desktop, featured projects form native sticky panels: the next project rises into view while the preceding copy fades and recedes. Short viewports, mobile, reduced motion, and oversized CMS copy use the readable list. Project images and the experience collage have subtle parallax; counters start when their numbers enter view. Tokens at the top of `assets/css/style.css` control durations, easing, and distances. Reduced motion disables parallax, marquee, counters, and autoplay. No halo/WebGL dependencies remain.
