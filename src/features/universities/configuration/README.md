# University configuration

A sub-feature of Universities for institution types and application submission requirements.

- `components/`: admin and data-entry entry components plus shared directory, details, and create/edit views. Component tests live beside their components.
- `hooks/`: university-type CRUD, assignment, and application-field queries.
- `services/`: configuration request methods, preserving the existing endpoint and payload contracts.
- `types/`: type definitions owned by this sub-feature.
- `index.ts`: public exports, matching the other nested features in this repository.

Routes remain `/admin/config-universities` and `/data-entry/university-configuration`. Their page files import this sub-feature. Main university records, campuses, and payment assignments remain in the parent Universities feature. Parent hook/type exports provide compatibility for existing consumers.
