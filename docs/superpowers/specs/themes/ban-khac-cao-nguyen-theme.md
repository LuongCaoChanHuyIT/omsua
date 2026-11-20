# Theme Specification: Bản Khắc Cao Nguyên (Highland Botanical Press — WCAG AA Edition)

**Created via:** `theme-factory` + `frontend-design` + `a11y-debugging`  
**Brand:** Ốm Sữa — Trà sữa của người Đà Lạt (*Since 2017*)  
**Zero Pure White/Black Rule:** Strictly `0` instances of `#FFFFFF` or `#000000` across all surfaces, borders, text, SVG illustrations, and print plates.

---

## 1. Visual Identity & Mood

**Bản Khắc Cao Nguyên** pairs warm deckle-edged Đà Lạt art paper (`#EEEADF`, `#F7F4EC`) and sun-warmed botanical pigments (`#F4E3AD`, `#C7CBBD`, `#C8BA9B`, `#B6A152`) with three WCAG AA-calibrated deep roasted inks (`#9E450B`, `#4D5922`, `#805B1A`) so every 12px badge, price numeral, and primary CTA achieves `>= 4.7:1` contrast without ever touching sterile white or pure black.

---

## 2. Cohesive Color Palette

### Canonical 14 Figma Brand Tokens (`@omsua/shared`)
- **Canvas Cream:** `#EEEADF` (`--color-canvas-cream`) — Primary warm art-paper backdrop
- **Surface Light:** `#F7F4EC` (`--color-surface-light`) — Elevated menu sheets, modals, inputs
- **Card Butter:** `#F4E3AD` (`--color-card-butter`) — Milk-tea highlight band & parchment callouts
- **Card Sage:** `#C7CBBD` (`--color-card-sage`) — Fruit-tea & Kombucha botanical field
- **Card Olive Gold:** `#B6A152` (`--color-card-olive-gold`) — Signature medal tint (`#29261D` text = `5.91:1`)
- **Card Taupe:** `#C8BA9B` (`--color-card-taupe`) — Cầu Đất phin & Cold Brew ground
- **Hero Espresso:** `#29261D` (`--color-hero-espresso` / `--color-espresso`) — Primary body ink & night-mist stage (`14.1:1` on `#F7F4EC`)
- **Olive Primary:** `#594C00` (`--color-olive-primary`) — Display headings & focus rings (`7.77:1` on `#F7F4EC`)
- **Warm Muted:** `#6B6255` (`--color-warm-muted`) — Editorial descriptions on cream/light surfaces (`4.99:1` on `#EEEADF`, `5.44:1` on `#F7F4EC`)
- **Subhead Ochre:** `#A67C2E` (`--color-subhead-ochre`) — Decorative rules & large ornamental accents
- **Terracotta:** `#D96B1E` (`--color-terracotta`) — Warm decorative accents, progress fills, hover borders
- **Coral Sketch:** `#E07D77` (`--color-coral-sketch`) — Spice pill fill with `#29261D` text (`5.30:1`)
- **Artichoke:** `#7A8B3B` (`--color-artichoke`) — Botanical illustration leaves & progress accents

### WCAG AA High-Contrast Companion Inks (`@theme` CSS Tokens)
- **Terracotta Deep:** `#9E450B` (`--color-terracotta-deep`) — Primary CTA fills with `#F7F4EC` text (`5.76:1` AA) and VND price numerals on `#F7F4EC` (`5.76:1` AA) / `#EEEADF` (`4.73:1` AA)
- **Artichoke Deep:** `#4D5922` (`--color-artichoke-deep`) — Botanical badge fills (`+ SIGNATURE`, `★ BEST SELLER`, `+ Chọn`) with `#F7F4EC` text (`6.90:1` AA)
- **Ochre Deep:** `#805B1A` (`--color-ochre-deep`) — Small `12px` eyebrow & metadata ink on `#F7F4EC` (`5.55:1` AA) and `#EEEADF` (`5.05:1` AA)

---

## 3. Complementary Font Pairings

| Role | Font Family | Weights | Typographic Discipline |
|---|---|---|---|
| **Display & KPI Numerals** | `Fraunces` | `600`, `700` | `text-wrap: balance`, tight `-0.02em` tracking |
| **Editorial Menu & Story** | `Lora` | `400`, `500`, `600`, `400i` | `max-w-[65ch]`, `leading-relaxed` (`1.62`) |
| **UI Controls & Forms** | `Be Vietnam Pro` | `400`–`800` | `tabular-nums` on all prices/counts/timers, `>= 12px` floor |
| **Artisanal Pull-Quotes** | `Dancing Script` | `700` | Reserved strictly for 1 signature quote per major surface |
| **Đà Lạt Snack Display** | `Shantell Sans` | `700`, `800` | Expressive street-snack section header |
