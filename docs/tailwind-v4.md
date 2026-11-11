# Moving to Tailwind CSS v4

We are on Tailwind 3.4. The setup is already shaped like v4, so the upgrade is mostly swapping the build plugin and running the official codemod.

## Already done (on v3)

- **One stylesheet.** `src/styles/globals.css` is the only CSS entry, imported once from `src/app/AppWrappers.tsx`. It imports Tailwind first, then `base.css`, then the design tokens, in cascade order. `index.css`, `legacy.css`, `App.css`, `Contact.css` and `MiniCalendar.css` are gone.
- **No legacy CSS variables.** The old `:root` variables (`--card-bg`, `--radius-md`, `--font-weight-medium`…) were read only by `tailwind.config.js`, so their values now live in the config. Classes such as `bg-card`, `rounded-md` and `font-medium` render exactly as before.
- **Element defaults are in the base layer** (`base.css`), so utilities keep winning once v4 uses native cascade layers.
- **`tailwindcss-rtl` removed.** Tailwind has `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `rounded-s-` and similar built in. The plugin only added duplicate rules and `[dir]` overrides. It has no v4 version.
- **Object screens removed.** The `sm-max`, `md-max`… entries were unused, and they turned off Tailwind's `min-*`/`max-*` variants (`min-[480px]:grid-cols-2` in FormPage and FormModal never compiled until now). Use `max-md:` and similar instead.
- **Classes removed in v4 replaced:** `flex-shrink-0` → `shrink-0`, `flex-grow` → `grow`.
- **Dead config removed:** the `./app` and `./components` content paths (everything is in `./src`) and an unused top-level `overlay` theme key.

Check used for every step: compile the CSS before and after, and compare every rule and its order. Then compare screenshots of 15 pages at 1440px and 375px, light and dark, against a build of the previous commit.

## Upgrade steps

1. Branch, then run the codemod: `npx @tailwindcss/upgrade`. It updates dependencies and renames classes across `src`.
2. If you do it by hand instead:
   - `pnpm add -D tailwindcss@4 @tailwindcss/postcss`, then `pnpm remove autoprefixer postcss-import` (v4 handles imports and prefixes itself).
   - `postcss.config.js`: `plugins: { '@tailwindcss/postcss': {} }`.
   - `globals.css`: replace the four `tailwindcss/*` imports with:
     ```css
     @import "tailwindcss";
     @config "../../tailwind.config.js";
     ```
   - Dark mode: add `@custom-variant dark (&:where([data-ub-theme="dark"], [data-ub-theme="dark"] *));` to `globals.css`.
   - Typography: keep it in the config, or use `@plugin "@tailwindcss/typography";`.
3. Check the renamed defaults. Our config overrides `rounded-sm/md/lg/full`, so those keep their values, but these change:
   - `shadow-sm` → `shadow-xs`, `shadow` → `shadow-sm`, `blur-sm` → `blur-xs`
   - `rounded` (no suffix) → `rounded-sm`
   - `outline-none` → `outline-hidden`
   - `ring` is 1px in v4, so use `ring-3` for the old 3px ring
   - Borders and dividers default to `currentColor`, not gray-200. Add the compatibility rule the codemod suggests, or give every `border` a colour.
   - Placeholder text defaults to the current colour at 50% opacity.
4. Upgrade `prettier-plugin-tailwindcss` (currently 0.2.1) to a version that supports v4.
5. Browser support: v4 needs Safari 16.4+, Chrome 111+ and Firefox 128+. Our production browserslist still allows Safari 10 and Chrome 51. Agree the new minimum with the team before upgrading.
6. Check the result with the same before/after CSS and screenshot comparison, and fix anything that changed.
