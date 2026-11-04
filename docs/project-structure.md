# Project structure

Keep shared UI in `src/components/ub` and feature-specific UI, hooks, and services in `src/features`. Routes in `src/app` compose these modules. Use lowercase folder names, kebab-case for multiword folders, and preserve the existing PascalCase component and `use…` hook filenames.

## Shared UI

| Category | Subfolders |
| --- | --- |
| `ub/forms` | `text`, `password`, `selection`, `choices`, `uploads`, `layout`, `numeric`, `dates` |
| `ub/core` | `buttons`, `typography`, `layout`, `motion` |
| `ub/data` | `tables`, `cards`, `display`, `badges`, `media`, `formatting` |
| `ub/navigation` | `layout`, `menus`, `links`, `controls` |
| `ub/feedback` | `dialogs`, `states`, `notifications` |
| `ub/dashboard` | `charts`, `cards`, `lists`, `pipeline`, `shared` |

`ub/brand` and `ub/icons` retain their existing organization. Category-level `index.ts` files preserve their public exports. Import a specific component directly when its module is all that is needed:

```tsx
import Input from "components/ub/forms/text/Input";
import UploadField from "components/ub/forms/uploads/UploadField";
import FormPage from "components/ub/forms/layout/FormPage";
import SectionCard from "components/ub/data/cards/SectionCard";
```

Keep component tests beside the component. Tests covering several modules live in a category's `__tests__` folder. Small helpers belong with the component group they support, such as table selection helpers in `data/tables` and file-drop handling in `forms/uploads`.

## Showcase and landing pages

- `components/showcase/sections`: component and foundation demonstrations.
- `components/showcase/patterns`: complete screen and workflow examples.
- Showcase routing, gallery composition, and handoff modules remain at the showcase root.
- `components/landing/sections`: page sections, including the hero, services, and contact section.
- `components/landing/layout`: landing navigation, footer, and logo.
- `components/landing/ui`: the existing landing-specific visual primitives.

Update `components/ub/catalog.ts` and showcase example paths when moving or adding shared components.

## Feature hooks

Keep hooks with their owning feature and group crowded hook folders by domain:

- Universities: `institutions`, `branches`, `payment-methods`, `types`, `required-fields`.
- Partners: `registration`, `profile`, `management`.
- Programs: `catalog`, `batch`, `copy`, `scholarships`, `configuration`.

Feature hook `index.ts` files remain the public entry points. Smaller feature folders keep their existing structure until a distinct group is useful. Do not move feature-specific components into the shared UI library solely to reduce the number of files in a feature folder.
