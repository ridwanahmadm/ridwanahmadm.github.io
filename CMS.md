# Content Studio

Open `/cms-login/` using HTTPS or the local HTTP preview. This route has `noindex` and is intentionally absent from public navigation. There is no client-side password: the editor itself is public, while writes to GitHub require a repository token. Do not put sensitive information in portfolio content.

## Edit and preview

Choose a section. Fields are populated from `data/projects.json`. Toggle `enabled` to hide a section. List items can be added or removed; projects have Edit, Delete, Move up/down, and Publish/Unpublish controls. These controls change the draft; **Publish/Unpublish on a project does not commit anything**. Save project dialogs before previewing. Stats, experience, navigation, galleries, case-study body sections, and links are editable lists.

Every image/video entry uses `{src, alt, type}`. Supply descriptive alt text when media is present. Upload images to resize their longest side to at most 1600 px and convert to WebP at 84% quality. GIF uploads become a still image. Videos must be MP4/WebM, under 8 MB, and are not recompressed. Images larger than 15 MB and uploaded SVGs are rejected. Existing SVG paths remain supported. Remove media clears its field; uploaded files are deleted from GitHub on the next publish only if no content still references them.

Drafts and uploaded media are saved in IndexedDB on this browser/device. Visitors never read them. Clearing browser data removes drafts; Export backup downloads the whole content plus uploaded media. Import accepts that backup or schema-v2 content JSON. Preview draft opens the existing public homepage with `?preview=1`; it reads the saved draft and displays an unpublished banner. This URL works only on the device/browser with the draft. Changes after preview require another preview before publish.

## Publish on GitHub Pages

1. Push this site's code and assets to your GitHub repository first. Select the deployment branch and root directory in GitHub Pages. There is no build step.
2. Create a **fine-grained personal access token** restricted to that repository with **Contents: read and write**. Enter owner, repository, branch, and token in the editor. The token lives only in module memory, never the repository, IndexedDB, backups, or localStorage. Reload/disconnect clears it.
3. Connect. If repository JSON differs from the draft's base, export a backup and load repository content before reconciling. This prevents silently overwriting someone else's changes.
4. Preview the final draft. Click **Publish previewed draft**, review the repository/branch confirmation, and confirm.
5. The editor creates media blobs, a tree based on the existing repository tree, one commit, and a non-forced branch update. Unrelated files are preserved. If the branch advances during publishing, the update fails rather than overwriting history. Wait for GitHub Pages deployment; the CMS confirms the commit, not the deployment.

Protected branches, expired tokens, missing initial files, and insufficient token permissions can prevent publishing. Token authentication protects repository writes, not access to this page. This design has no paid backend, multi-user roles, or server-side editor sessions. Never use the editor in an untrusted browser or paste a token into content fields.

## Schema v2

The single source of truth remains **`data/projects.json`**, upgraded from the original project-only schema. Public routes read this same file. Top-level keys:

- `schemaVersion: 2`, `seo: {title, description, worksTitle}`, `brand: {name, fullName, favicon}`.
- `navigation: [{label, href}]`; public links are text-only.
- `hero: {enabled, headline, role, subtitle, ctaLabel, ctaLink, note, scrollLabel, media}`. Newlines in headings are retained.
- `about: {enabled, label, headline, text, image, experience: [{company, role, detail}], summary, learning: {heading, text}}`.
- `marquee: {enabled, items: [string], separator}` and `stats: {enabled, label, items: [{value, prefix, suffix, label}], mockups: [media]}`.
- `work: {enabled, label, headline, text, featuredLimit, ctaIntro, ctaLabel, ctaLink}` and `works: {label, headline, text}`.
- `footer: {enabled, label, heading, text, email, linkedin, emailLabel, linkedinLabel, note, backLabel, emptyContact}`.
- `ui`: public interface strings and accessibility labels, editable in the Interface labels tab.
- `projects`: objects with `title, slug, subtitle, summary, category, image, description, impact, impactNote, role, tags: [string], cover, gallery: [media], body: [{heading, text, image}], links: [{label, href}], order, published`.

`subtitle` and `image` are preserved legacy fields and kept in sync when a project is saved. The editor shows `summary` and `cover` as the canonical fields; public cards use them. Project slugs must be unique lowercase hyphenated strings. Public lists filter `published`, sort by `order`, and render without project numbers. The homepage shows up to `featuredLimit` projects. Body text is plain text, never executable HTML. `impact` can start with a number, e.g. `3.2x itinerary completion [DUMMY]`; `[DUMMY]` keeps a visible unverified label. Section numbering is generated from visible sections.

Backup shape: `{content, assets: {"assets/img/uploads/uuid.webp": {base64, type}}, deletions: [path], baseSha}`. Only `content` is written to public JSON; uploaded bytes become separate files. `baseSha` is the Git blob SHA of the content the draft started from, used for conflict detection.

## Verification for this revision

Public layouts were tested at 375, 768, and 1440 px, along with keyboard modal dismissal and reduced motion. CMS verification covered project create/edit/delete/reorder/visibility, hero headline/subtitle/image upload, draft restoration, preview, backup export/import, invalid import rejection, stats add/delete, and cancelling unsaved project edits. GitHub blob/tree/commit/non-forced-ref requests were tested through an API mock without writing to any external repository. Live GitHub authentication and Pages deployment remain unverified until a repository and token are configured.

## Figma content revision

Open **Work experience** to edit company, role, and dates/details; add or remove entries here. **Experience & mockups** edits the experience statistic and overlapping mockup images. **Hero → Media** accepts a background image or looping video. All fields stay editable through the existing draft/preview/publish workflow.

An older local draft is preserved and clearly flagged if the site content changes. Export its backup before using **Reset to latest site content** to load this revision.

Eight Figma-based studies are published; the original six placeholder projects remain unpublished. Reported metrics are labeled and documented in [CONTENT_AUDIT.md](CONTENT_AUDIT.md). The homepage uses six native scroll-driven panels on sufficiently large viewports, with a readable list on mobile and when reduced motion is enabled.
