# CLAUDE.md

One Vite + React app that builds a separate site per client via `VITE_SITE_TARGET` (`platinum`, `steve-giralt`, `deliverables`, `a1-sealcoating`).

## Website design standards

Every client build or fix follows the `website-standards` skill in `.claude/skills/`: size the job, render it with `playwright-cli` at phone, tablet, and desktop widths, and audit changed files with `web-design-guidelines`. Keep each client's existing brand; the skills refine it, they don't replace it.

- Run one site: `npm run dev:<site>`, or `npm run build:<site> && npm run preview:<site>` for the built version.
- Existing visual QA: `npm run qa:visual:<site>` (screenshots land in `content-audit/visual-qa/<site>/`).
