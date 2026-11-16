# Design — DharmaWatch

A locked design system for DharmaWatch. Established for the Black & Red Minimalist Editorial Redesign.

/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* Hallmark · genre: editorial-modern-minimal · theme: obsidian-crimson */

## 1. Aesthetic Direction: Minimalist Black & Red Newsroom
- **Spirit**: Authoritative, investigative, fearless, uncompromising. Like a hybrid of Reuters investigative dossiers, Swiss modernist typography, and a cyber-forensic archive.
- **Geometry**: Sharp rectangular geometry, hairline borders (`1px solid var(--color-rule)`), crisp square badges, zero rounded bubbly pills or gratuitous gradients.
- **Rhythm**: Generous structural spacing, clear editorial hierarchy, stark contrast between pitch black backgrounds, pure white typography, and focused crimson red markers.

## 2. Color Tokens
- `--color-paper`: `#050505` (Deepest pitch black)
- `--color-paper-surface`: `#0c0c0e` (Elevated card/surface black)
- `--color-paper-subtle`: `#141418` (Subtle hover/active background)
- `--color-ink`: `#FAFAFA` (Crisp high-contrast white text)
- `--color-ink-muted`: `#A1A1AA` (Zinc-400 secondary metadata)
- `--color-ink-dim`: `#71717A` (Zinc-500 tertiary/dates)
- `--color-rule`: `#222226` (Razor 1px hairline border)
- `--color-rule-strong`: `#383842` (Prominent section divider)
- `--color-accent`: `#DC2626` (Editorial Crimson Red)
- `--color-accent-bright`: `#EF4444` (High-visibility red for dark backgrounds)
- `--color-accent-dark`: `#991B1B` (Deep crimson for pressed/subtle accents)
- `--color-accent-bg`: `rgba(220, 38, 38, 0.08)` (Subtle red tint for active badges)
- `--color-focus`: `#EF4444` (Crisp focus ring)

### Light Mode Complement (Crisp Stark Monochrome + Crimson)
- `--color-paper-light`: `#FFFFFF`
- `--color-paper-surface-light`: `#F9F9FB`
- `--color-ink-light`: `#09090B`
- `--color-rule-light`: `#E4E4E7`
- `--color-accent-light`: `#DC2626`

## 3. Typography Rules
- **Display & Headings**: `Inter`, weights 600–800, `letter-spacing: -0.025em`. Normal style (strictly roman, zero italic headings).
- **Metadata & Tags**: `JetBrains Mono`, weight 500–600, uppercase, `letter-spacing: 0.05em`.
- **Editorial Longform Reading**: `Newsreader`, weights 400 & 500 for longform article body.
- **Deck / Excerpt**: `Inter`, weight 400–500, `line-height: 1.55`.

## 4. UI Component Voices
- **Masthead**: Stark brand block `DHARMA` + `WATCH` with red dot or crimson block. Clean ticker `DOCUMENTING · VERIFYING · INVESTIGATING`.
- **Category Navigation**: Minimalist horizontal rail, uppercase, with 2px bottom crimson bar on active state.
- **Breaking News Bar**: Monospace `[LATEST]` badge in solid red, cycling ticker with hairline borders.
- **Cards & Feed**: Razor hairline dividers, high-contrast typography, monospace datelines `[2026-07-22]`, title turning crimson on hover.
- **Dossiers & Case Files**: Forensic audit aesthetic, red verification grades (`[CONFIRMED]`, `[PRIMARY EVIDENCE]`), incident timeline with red node connectors.
- **Buttons & CTAs**: Crisp rectangular buttons (`rounded-none` or `rounded-xs`), solid crimson with white text or outlined with 1px border.
