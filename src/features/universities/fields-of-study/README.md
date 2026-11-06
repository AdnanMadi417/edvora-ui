# Fields of study

A Universities sub-feature for the study areas used by Programs.

- `components/admin`: admin entry component and create/edit dialogs.
- `components/data-entry`: entry component with deletion disabled.
- `components/shared`: shared responsive directory, filters, details, and confirmation.
- `hooks`: list and mutation state.
- `services`: API requests using the existing Knowledge Hub endpoints.
- `types`: field records and mutation payloads.
- `index.ts`: public exports.

Existing admin and data-entry route URLs are preserved. The old Knowledge Hub hooks barrel re-exports the new hooks to keep program consumers compatible. Field codes remain assigned by the API.
