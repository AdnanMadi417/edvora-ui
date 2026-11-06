# Document types

A Universities sub-feature for document requirements and static templates downloaded by advisers.

- `components/shared`: responsive searchable directory and workflow tests.
- `components/admin`: document details and static-template upload/replacement page.
- `hooks`: document queries, template mutation, and template downloads.
- `services`: existing document-type endpoints.
- `types`: document records, query options, and template payloads.
- `index.ts`: public exports.

The main route remains `/admin/document-types`. Details use `/admin/document-types/[id]`; template uploads use `/admin/document-types/upload` or `/admin/document-types/[id]/edit`. The API supports template updates for eligible document types, not document-type creation/deletion. `hooks/useDocumentType` remains a compatibility export for application consumers.
