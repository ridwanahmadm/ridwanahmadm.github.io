# Design contract — portfolio v2 ("quiet clarity")

Every page is built from this file. If a change isn't covered here, decide it here first.

## Why v2

v1 read as AI-generated and tiring to read. An audit against Anthropic's `frontend-design` guidance, the `avoid-ai-design` tell catalogue and NN/g research found the cause: almost every section carried its own effect (shader, 3D tilt, blur reveals, sticky stacking, marquee, count-ups, glass, gradient text) and the type system used the common generated-page tells (italic accent word, all-caps mono eyebrows, middle-dot meta strings, 01/02 numbering, arrow-suffixed buttons, uniform rounded cards). NN/g found that scroll-triggered animation combined with reading causes cognitive overload, and that people scan headings first (layer-cake pattern), so the fix is fewer effects and clearer headings, not more.

## References and what we take from them

- **Old site (ridwanahmadm.github.io v1):** one typeface, soft sky background, navy ink, linear story (statement → about → work → contact), plain underlined text links. Total weight ~300 KB.
- **Kononenko Architectural Bureau:** one idea per screen, hierarchy from size and colour only (single weight), unframed imagery, small grey metadata, one signature moment.
- **Astapable:** the work is the site; short page; one family in two weights; real product media instead of decoration.

## Tokens

| Name | Hex | Role |
| --- | --- | --- |
| Paper | `#F6F9FC` | Page background |
| Sky | `#E3F0FB` | Hero, Siiru band, media plates |
| Ink | `#0E2A44` | Text, deep-sea navy (from v1 #142E45) |
| Ink soft | `#475C71` | Secondary text (≥ 5.4:1 on every light background) |
| Sea | `#1A619E` | Links and the one interactive accent (≥ 5.0:1 on every light background) |
| Line | `#D3E0EC` | Hairlines |
| Deep | `#0B2239` | Contact band |

No shadows, no glass, no grain, no dark mode. The only gradient is the hero sky (`#E5F2FD` to `#D0E7FA`), matched to the backdrop of the portrait so the photo stands in it without a frame.

**Type:** Plus Jakarta Sans only — drawn by Tokotype for Jakarta's city identity, a grounded choice for a Jakarta designer. Weights 400 and 500 (600 only for small UI). Sentence case. No all-caps labels, no monospace.

Scale (px): 14 meta · 17 body · 20 lead · 26 item title · 40 section · 72 display. Body line length ≤ 66ch, line-height 1.6.

**Shape:** media radius 6px; buttons are underlined text links; no cards with borders + shadows.

## Contrast (WCAG 2.2 AA, checked)

Every text/background pair passes AA with margin: 4.5:1 for normal text, 3:1 for large text and for focus indicators. Gradients are checked at both stops. On the Deep band, focus outlines switch to white (Sea on Deep is only ~2.5:1). Links inside paragraphs are underlined, so they never rely on colour alone. Re-run the contrast audit after any colour change.

| Pair | Ratio |
| --- | --- |
| Ink on Paper / Sky / hero bottom | 13.9 / 12.6 / 11.5 |
| Ink soft on Paper / Sky / hero bottom | 6.5 / 6.0 / 5.4 |
| Sea on Paper / Sky / hero bottom / plate | 6.1 / 5.6 / 5.1 / 5.2 |
| #B6C8DA on Deep (contact text) | 9.4 |
| #8FA6BD on Deep (footer) | 6.4 |

## Layout

12-column grid, 1240px max, left-aligned. Sections are introduced by a plain, descriptive H2 (no eyebrow). Work items are rows: text in 4 columns, media in 7, separated by space rather than rules. Hairlines are kept only where they encode structure: tables, the Siiru list, the facts row and the More work divider. Mobile is one column with 16px gutters.

```
Ridwan Ahmad Ma'arif                          Work  About  Contact
I design products people trust with their
money and their journeys.                      (sky band)
Senior product designer at Siiru ...
-------------------------------------------------------------------
Selected work
[text 4][media 8]   x5, hairlines between
More work: four text links
-------------------------------------------------------------------
Siiru, up close     (sky band — the one bold moment)
[list of 8 designs + note][large phone, switches on click]
-------------------------------------------------------------------
Siiru product film  [16:9 player] chapters as text
How I use AI        table: stage | AI helps | I decide ; four live builds
About               portrait + bio ; experience table ; mentoring ; research
Think we'd make a great team?   (deep band) email, LinkedIn
```

## Motion

Purpose first (NN/g), checked against the Mahabbati research doc (§5) on 2026-10-20.

1. **One page-load sequence** on the home hero: name, statement, lead and photo fade in and rise 12px, 400ms, 70ms stagger, done within 1.2s. Nothing else animates on scroll.
2. **No autoplay, no endless loops** (WCAG 2.2.2, NN/g homepage). Posters carry the page. Project rows preview their recordings only while a fine pointer rests on them, and return to the poster on leave. Every screen recording has a visible 44px play/pause button and plays once. Films start only from their Play button, with captions; starting one film pauses the other.
3. **User-triggered:** opening a Siiru design plays that screen once and slides its label 22px with `transform` (never padding or other layout properties).
4. **Page transitions:** cross-document View Transitions, 250ms cross-fade, and the clicked cover morphs into the case-study cover (400ms).
5. **Micro:** links change underline colour within 150ms; buttons press to 0.94 scale in 140ms.

Easing `cubic-bezier(.2,.7,.2,1)`. Every UI duration ≤ 400ms. `prefers-reduced-motion` removes all of the above.

## Hero

The name is the H1 (NN/g: say who you are first; one or two lines at display size). The positioning sentence sits below it at 22–28px, then the domains line. A full sentence at display size is a known generated-page tell, so it is not used.

## Writing

Plain, first person, specific. Descriptive headings that work when scanned alone. Front-load the point. No hype words, no rhetorical hooks, no "Not X. Y." constructions, sparing em dashes. Metrics are "as reported in the project study"; company numbers are labelled as Siiru's.
