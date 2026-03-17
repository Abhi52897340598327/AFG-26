# Design Handoff Folder

This folder is for Figma/Canva handoff so design changes can be dropped in without rewriting business logic.

## Folder map
- `designs/tokens.css`: shared color/spacing/radius tokens.
- `designs/component-map.json`: where each UI section lives in code.
- `designs/figma-canva-handoff.md`: export/import checklist.
- `designs/code/ui-contracts.ts`: TypeScript contracts for design-driven components.

## Suggested workflow
1. Build/iterate screen in Figma or Canva.
2. Export assets to `public/images/design-imports/`.
3. Update `designs/tokens.css` to match fonts/colors/shadows.
4. Use `designs/component-map.json` to find the exact React section to edit.
5. Keep behavior in `app/page.tsx` and only swap visual layer/styles.
