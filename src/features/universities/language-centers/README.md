# Language Centers

A university-linked directory at `/admin/language-centers` and `/data-entry/language-centers`, under Knowledge Hub. University details follow the program details structure: header section links, readable content sections, and a summary sidebar. Language centers appear as detail cards for admin, data-entry and advisor users, without an embedded table. The separate directory accepts `?university_id=...`.

Admins can create, view, edit and delete. Data-entry users can create, view and edit, matching existing university management permissions. Access control in a real deployment must also be enforced by the API.

Each center has a required university, name and location, plus optional email, phone and description, and an active status. Search covers the center name, university and location. University and status filters combine with search. The shared table supplies sorting, pagination and compact mobile rows.

## API contract

This UI-only repository implements the following routes in `src/mocks/handlers/languageCenters.ts`; these are new contracts, not verified existing backend endpoints:

- `GET /knowledge-hub/language-centers` → `{ items: LanguageCenter[] }`
- `POST /knowledge-hub/language-centers` → created `LanguageCenter`
- `PUT /knowledge-hub/language-centers/:id` → updated `LanguageCenter`
- `DELETE /knowledge-hub/language-centers/:id` → `{ success: true }`

See `types.ts` for payloads. The mock validates university links and synchronizes `has_language_center` on creation, reassignment and deletion. Availability means at least one linked center exists, including inactive centers. Initial demo entries are derived from universities already marked as having a language center; contact fields are left empty. Changes persist for the mock session and reset on a full reload, consistent with the rest of the app. Implement these contracts and authorization in the backend before running with mocks disabled.

Course management, enrollment and language-center public profiles are not included in this initial directory.

## Advisor access

`/partner/language-centers` is a read-only catalogue under Knowledge Hub, controlled by the existing university browsing feature flag. Advisors see active centers linked to active, visible universities, can search and filter by university, and open center details or the linked university profile. Create, edit and delete actions are not offered. Advisor university profiles show active linked centers as readable detail cards.

The university Language Centers section shows name, description, location and contact details, with loading, empty and retry states. Management users also see inactive centers and a “Manage centers” link to the scoped directory. Tables, filters and create/edit forms remain in that standalone directory.

The directory and center details display the linked university logo, name and a Public/Private badge. Logos use the shared image component with an initial fallback. The existing searchable university picker combines with a Public/Private institution-type filter, center status and text search. Advisor visibility restrictions remain in effect.
