# Frontend Agent Notes

## Package manager
- Use **pnpm** (not npm/yarn). All commands below assume pnpm.

## Key commands
- `pnpm dev` — Start dev server at http://localhost:3000
- `pnpm build` — Production build
- `pnpm lint` / `pnpm lint:fix` — ESLint with @antfu/eslint-config
- `pnpm postinstall` — Runs `nuxt prepare` (auto-generated after install)

## Tech stack
- Nuxt 4 (`compatibilityDate: '2025-07-15'`)
- @nuxt/ui v4 (provides Tailwind CSS + UI components)
- TypeScript (nuxt generates tsconfig.app.json, tsconfig.server.json, tsconfig.shared.json, tsconfig.node.json under .nuxt/)
- `.nuxt/` is generated — do not edit or commit

## ESLint conventions (from @antfu/eslint-config)
- 2-space indent
- Single quotes
- Stroustrup brace style
- Config at `eslint.config.js`

## Structure
- `app/app.vue` — Root app wrapper (`<UApp><NuxtPage /></UApp>`)
- `app/assets/css/main.css` — Entry CSS
- `public/` — Static assets

## Language conventions
- **Code**: English (variables, functions, components, comments, commit messages)
- **UI / user-facing text**: Spanish (labels, buttons, messages, route names, page titles, form placeholders)

Example:
- Route: `/turnos/nuevo` (Spanish path)
- Component: `TurnoForm.vue` (English code, Spanish semantic name)
- Button label: "Guardar turno" (Spanish UI text)

## Skills
- Available: `nuxt`, `nuxt-ui`, `frontend-design`. Load with the `skill` tool when working on UI tasks.