# Portfolio content audit

Revised against Ridwan’s existing [Figma portfolio](https://www.figma.com/proto/6sJv9drZxaXjDptTn8Q7Vv/Portfolio-Ridwan-Ahmad-Maarif?node-id=914-387). The current website structure, static stack, blue palette, routes, and CMS remain in place.

## Coverage

Reviewed the main page and all eight detail pages on the supplied prototype page:

| Figma node | Revised content |
| --- | --- |
| 914:387 | Hero, introduction, work history, learning, contact, and project collection |
| 1766:8177 | Hijra’s first 100K users |
| 969:356 | e-KYC iterations, constraints, and results |
| 1135:15343 | Homepage redesign and information hierarchy |
| 1254:2823 | Pertamina Banjarmasin operational HMI |
| 1287:1300 | Hijra loyalty exploration |
| 1162:4404 | COMPFEST UX Academy judging and certificate |
| 1403:747 | Qurban Plus website exploration |
| 1446:1170 | Five Figma interaction studies |

The homepage features six studies. All eight entries are available on the Works page. Each detail modal includes the rewritten explanation, original visuals, and a link to its original Figma page. Interaction studies show static previews with a link to the original prototype; they are not presented as live recordings. The original six placeholder projects remain in the CMS as **unpublished** entries so previous content is preserved and dummy results are absent from the public site.

## Editorial changes

- Shortened titles and summaries; structured substantial cases around the challenge, research, decisions, outcome, and lessons.
- Replaced vague engagement and growth claims with the evidence described in each study. The first 100K users is identified as a shared team milestone rather than a result caused by design alone.
- Corrected “Automate Approved” to “automated approvals,” “Collage Students” to “college students,” and the fuel depot terminology.
- Corrected the Qurban Plus page’s copied “Hijra Loyalty Features” heading and removed unrelated e-KYC boilerplate from the homepage study.
- Corrected “Linkedn” to “LinkedIn.” Changed the malformed email website link to `mailto:hellomaarif@gmail.com`.
- Kept explorations separate from measured work. No launch or engagement metrics were invented for loyalty, Qurban Plus, Pertamina, or interaction studies.
- Preserved HSI — Shortener from the owner’s supplied information alongside the work history in Figma. No dates were invented for that role.

## Results that need owner confirmation

| Study | Source inconsistency | Current treatment |
| --- | --- | --- |
| e-KYC | Overview says +35%; final iteration says +16% by February 2025. Earlier iterations mention 6.x% and +13%. The source does not define how these relate or whether they are relative percentages or percentage points. | Shows +16% with a reported-result note. Does not sum the iterations or invent a baseline. The detail explains the difference. |
| Homepage | Overview says +8% retention; body says +8% engagement time. | Uses the body’s engagement-time description, alongside the reported +12% monthly transactional users. Both are explicitly attributed to the original study. |
| First 100K | Reports a milestone without attribution, measurement window, or baseline. | Presents it as a shared team milestone supported by product and partnerships. |
| Pertamina | Describes a five-day brief and roughly 12 hours of design work without measured usability results. | Keeps delivery context in the detail; makes no quantified usability claim. |

These figures are not independently verified. Confirm metric definitions, baselines, dates, and attribution before publishing them as validated outcomes. Each project’s `impact` and `impactNote` can be updated in the CMS.

## Assets

Original Figma mockups, research maps, screens, portrait, posters, certificate, and chatbot vectors were downloaded into `assets/img/figma/`. Raster files were optimized to WebP; the chatbot SVG assembles its original exported vector layers. No full portfolio-page screenshot is used as a website section. Temporary Figma asset URLs are not needed at runtime.

The hero’s background currently uses the original Hijra homepage mockup. Replace it with an image or MP4/WebM loop through **Hero → Media**. The three-card experience collage is editable under **Experience & mockups → Mockups**.

## Verification

Checked 375, 768, 1218, and 1440 px layouts, all six scroll-driven project transitions and modals, the eight-entry Works collection, reduced-motion fallback, and CMS experience add/edit/delete, restored drafts, and preview. The scroll sequence uses native sticky panels and gentle parallax; shorter screens and mobile retain the full readable list. No live repository was published.
