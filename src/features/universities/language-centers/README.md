# Language Centre

Frontend-only language-centre configuration shared by the Admin and Data Entry university forms. Advisors browse the same information in the university Language Centre section. Direct course applications are outside scope.

## Current fields

The Has Language Centre toggle reveals grouped sections for centre name, description and location; courses, languages, study modes, entry requirements and placement tests; ordered levels with duration and learning hours; tuition amounts, currencies and per-level/month/course pricing; packages and included services; and additional charges with refundable deposits.

Brochures, official sources, centre website, contact email/phone and language-course intake dates are removed. University-wide intake months are independent and remain available. Missing optional information is hidden.

## Components and persistence

`components/CentreConfigurationSection.tsx` shares the form section, toggle and data states. `CentreConfigurationFields` manages repeated course and pricing records. `CentreConfigurationView` presents separate tuition, packages and charges in the university profile and directory drawer. The shared accessible Tabs component provides keyboard navigation. The university directory includes a Has Language Centre filter.

`configuration.ts` validates names, unique positive level ordering, durations, explicit amounts/currencies and fee-to-level associations. Blank prices are not converted to zero. Removed fields cannot block validation. Legacy model properties remain as empty compatibility fields; older saved records remain readable and retired values are excluded on subsequent saves.

`hooks/useCentreConfiguration.ts` saves structured data per university under `unibexs:language-centre:v1:<id>`. Data survives refreshes in this browser but does not sync across browsers, devices or users. Storage failures have retry/error states. Existing university save flows retain their existing API behavior and availability flag; course/pricing configuration is not sent in the payload. No new backend endpoint is introduced.

## Demo and existing directory

`fixtures/demoData.ts` contains five demo centres with three courses each for APU, UCSI, Sunway, INTI and Limkokwing. Tuition covers all three pricing bases, plus packages, services, additional charges and refundable deposits. Removed fields are empty. All prices are illustrative. Saved edits and disabled centres take priority. Fixtures are disabled when `NEXT_PUBLIC_USE_MOCKS=false`.

The existing standalone directory supports Admin management, Data Entry create/edit, and read-only advisor browsing. University/status filters live in the filter drawer; action menus use concise labels. Its existing basic-centre mock contracts remain separate from browser-local course configuration.

University and program detail pages display all sections together. Their shared `DetailsSectionNav` keeps the tinted active button and bottom-border styling while scrolling to the selected section. All language courses start expanded.

## Dedicated centre details

Each directory row links to `/<role>/language-centers/<centre-id>` for Admin, Data Entry and Advisor. The shared DataTable row-link behavior supports keyboard access, normal link navigation and clicking non-interactive cells. Action menus stay independent, and the first cell contains no nested links.

`LanguageCenterDetails.tsx` resolves the ID using the existing list API, so no new backend endpoint is required. Direct loads and refreshes show the linked university, the same saved course/pricing content as the university profile, and a summary with back/university links. Missing records, loading failures and retry use shared states. Admin/Data Entry can edit centre basics or open the university editor for course/pricing configuration. Only Admin offers deletion, with confirmation. Advisor routes retain their feature flag and reject inactive centres and inactive, hidden or unavailable universities.

Advisors browse language centres as responsive, fully clickable cards showing the university identity, centre name, description and location. Search, filters, pagination, loading, retry and empty states remain available. Admin and Data Entry retain table management.
