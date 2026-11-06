# Payment methods

A Universities sub-feature for the payment method catalog and batch assignment UI.

- `components/admin`: admin list, details, edit form, create/delete dialogs, and batch assignment.
- `components/data-entry`: directory entry point with deletion disabled.
- `components/shared`: responsive directory and shared create/edit fields and validation.
- `hooks`: catalog queries, mutations, and batch assignment state.
- `services`: authenticated calls to existing `/admin/payment-methods` endpoints.
- `types`: catalog records, form payloads, and batch assignment payloads.
- `index.ts`: public exports.

Existing route URLs are preserved. Data-entry now also has a read-only details route at `/data-entry/payment-methods/[id]`. The Knowledge Hub hooks barrel remains a compatibility export for current consumers. University-specific payment assignment records remain in the parent Universities feature.
