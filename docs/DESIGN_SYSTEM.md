# AMOH Design System

## Direction

**Ocean Wonder / Scientific Clarity**. AMOH uses an editorial voice for public explanation and a quieter, denser tool surface for field work. The product has its own identity and does not imply affiliation with National Geographic, Lindblad Expeditions, the United Nations, or World Oceans Day.

## Tokens

The operational palette is defined in `frontend/styles.css` with semantic tokens:

- Ocean structure: `--ocean-950`, `--ocean-900`, `--ocean-700`, `--ocean-600`
- Surfaces: `--surface-page`, `--surface-panel`, `--surface-subtle`
- Text and borders: `--text-primary`, `--text-secondary`, `--border-default`
- Accents: `--accent-yellow`, `--accent-aqua`, `--accent-coral`
- Semantic state colors are separate: saved, pending and error.

Yellow marks a concrete action or selection. It is not used as a general text color. State is always paired with text or a label.

## Typography

The current local-only fallback uses Georgia for editorial headings and Trebuchet MS/Verdana for interface text. No CDN is loaded. Source Serif 4, Source Sans 3 and IBM Plex Mono can replace these fallbacks once licensed font files are added to the repository with their license notices.

## Components in the MVP

- App shell and AMOH wordmark
- Navigation item
- Connectivity indicator
- Metric strip
- Observation capture form
- Local/demo status label
- Evidence table and empty state
- Offline map placeholder
- Uncertainty notice

## Accessibility checklist

- Visible keyboard focus
- Native labelled form controls
- `aria-live` save status
- Table alternative when map tiles are unavailable
- Responsive layouts at desktop, tablet and mobile widths
- Reduced-motion media query
- Status text is not communicated by color alone
- Long values scroll in tables instead of resizing the layout

## Known limits

The current repository does not contain an authorised offline map package or local font files. The Explore area therefore shows an explicit unavailable state rather than fabricated geography. A production map must include attribution, scale, projection limitations and a verified local tile license.
