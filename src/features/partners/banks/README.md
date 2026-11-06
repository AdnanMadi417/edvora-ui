# Banks

A Partners sub-feature for the bank reference list used by adviser payout accounts.

- `components`: shared admin/data-entry directory, details, create/edit pages, and tests.
- `hooks`: bank queries and mutations.
- `services`: existing bank API methods.
- `types`: bank records, list parameters, and mutation payloads.
- `index.ts`: public exports.

Routes remain `/admin/advisors/banks` and `/data-entry/banks`. Bank-account integrations use the same list and payload contracts. Inactive-only filtering requests the full list and filters inactive records locally. The legacy `features/banks` hook/type/service barrels remain compatibility exports. There is no bank deletion workflow.
