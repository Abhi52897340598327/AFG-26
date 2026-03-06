# Figma/Canva Handoff Checklist

## 1) Export settings
- Export icons as SVG.
- Export backgrounds/illustrations as optimized SVG or WebP.
- Use 1x scale for web.
- Keep file names stable (`hero-pattern.svg`, `diagnosis-flow.svg`, etc.).

## 2) Place files
- Put exports in: `public/images/design-imports/`.
- Keep reusable shared visuals in: `public/images/`.

## 3) Map designs to code
- Open `designs/component-map.json`.
- Match design frames to the relevant section IDs.
- Update only section-level markup/styles in `app/page.tsx`.

## 4) Keep behavior intact
- Do not remove button handlers (`onClick`) unless replacing with another handler.
- Keep API integration to `/api/stuck/diagnose`.
- Keep session saving (`Save Session`) connected to local history state.

## 5) Token sync
- Update `designs/tokens.css` with new palette/spacing/radius.
- Mirror major token changes into Tailwind utility classes used in `app/page.tsx`.
