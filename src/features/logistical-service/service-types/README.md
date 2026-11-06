# Logistics service types

A sub-feature of Logistics Marketplace for the named services providers can offer.

- `components/admin/table`: admin directory entry point.
- `components/admin/form`: shared create/edit form with name validation and API errors.
- `components/admin/popups`: create, edit, and delete confirmation controllers.
- `components/data-entry`: directory entry point with deletion disabled.
- `components/shared`: responsive directory, search, sorting, pagination, and workflow tests.
- `hooks`: service-type queries and mutations.
- `services`: existing logistic-service endpoints.
- `types`: service records and mutation payloads.
- `utils`: shared service-name validation.
- `index.ts`: public exports.

Admin and data-entry URLs remain unchanged. Parent hooks, types, service methods, and component exports remain compatible with provider create/edit forms. Records have a name only; no description or filter fields are added.
