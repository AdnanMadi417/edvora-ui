# Applications component swap

The existing pages, section order, routes, application props, API contracts, fetching hooks and mutation handlers are retained. This change replaces inline presentation with the existing Unibexs kit. Existing unrelated overview/dashboard work is excluded from the commits.

Sources: [redesign brief](unibexs-frontend-redesign-brief.md) and [near-black dark-mode guide](unibexs-dark-mode-guide.md).

## Final mapping

Paths below are relative to `src/features/applications/`.

| File | Old UI | Component used |
| --- | --- | --- |
| `admin/components/table/AdminApplications.tsx` | Inline outer card | `Card`; existing `ApplicationsTable` retained |
| `account-manager/components/table/ManagerApplications.tsx` | Inline outer card | `Card`; existing `ApplicationsTable` retained |
| `partner/components/table/PartnerApplications.tsx` | Inline outer card | `Card`; existing `ApplicationsTable` retained |
| `components/ApplicationsTable.tsx` | Inline student-image initials and manually toned status | `Avatar` through `PresignedImage`; `StatusTag` |
| `components/ApplicationTrackerCard.tsx` | Inline next-step notice | `Alert` (polite status announcement retained) |
| `components/CommissionCard.tsx` | Commission status tag | `StatusTag` with original explicit tone and size |
| `components/OfferCard.tsx` | Offer status tag | `StatusTag` with original explicit tone and size |
| `components/StudentInfoCard.tsx` | Inline email link and button-styled WhatsApp anchor | `TextLink`, `LinkBtn` |
| `partner/components/details/MDACSection.tsx` | Button-styled external anchor | `LinkBtn` |
| `partner/components/details/PartnerNextStepPanel.tsx` | Payment-method loading text | `Skeleton` with accessible loading status |
| `admin/components/popups/UpdateStatus.tsx` | Clickable status boxes, document labels, visa-fee notice, payout summary surface | `RadioCardGroup`, `FieldLabel`, `Alert`, `Card` |
| `account-manager/components/popups/UpdateStatus.tsx` | Clickable status boxes, document labels, visa-fee notice | `RadioCardGroup`, `FieldLabel`, `Alert` |
| `shared/types.ts` | Unused status-option colour fields | Removed `color`, `bgColor`, `borderColor` from the internal presentation type |
| `shared/UpdateCorrectionRequest.tsx` | Reason block, document label/row surfaces, error notice | `DescriptionList`, `FieldLabel`, `Card`, `Alert` |
| `form/ApplicationFormView.tsx` | Validation summary, validation links, header icon, programme summary surface, document-group error | `Alert`, `TextLink`, `IconTile`, `Card`, `FieldError` |
| `partner/components/form/stages/DocumentUploadList.tsx` | Progress and optional-document surfaces | `Card`; existing `FileUpload`, `ProgressBar`, `Toggle` retained |
| `partner/components/popups/RequiredAction.tsx` | Template-download boxes | `FileRow` with existing view/download controls and template labels |
| `disputes/components/DisputeSection.tsx` | Dispute status tag | `StatusTag` with original explicit tone |
| `disputes/components/ResolveDisputeCorrection.tsx` | Payout-loading text | `Skeleton` with accessible loading status |
| `pay-ins/components/admin/RecordPayIn.tsx` | Application summary surface | `Card` |
| `pay-ins/components/admin/UniversityPayInSection.tsx` | Received/voided tag | `StatusTag` with original explicit tone |
| `pay-ins/components/admin/VoidPayIn.tsx` | Current-payment surface and corrected-payment caption | `Card`, `FieldLabel` |
| `payouts/components/PartnerPayoutSection.tsx` | Paid/voided tag | `StatusTag` with original explicit tone |
| `payouts/components/admin/BatchPayout.tsx` | Bank-summary surface and amount-group caption | `Card`, `FieldLabel` |
| `payouts/components/admin/FinanceQueuePage.tsx` | Outer surface, custom advisor search popup, waiting-on tags | `Card`, server-search `Combobox`, `StatusTag` |
| `payouts/components/admin/PayoutCorrectionFields.tsx` | Summary surfaces, corrected-amount caption, detached field errors | `Card`, `FieldLabel`, `FieldError` |
| `payouts/components/admin/PayoutDetailPage.tsx` | Outer surface and active/voided tag | `Card`, `StatusTag` |
| `payouts/components/admin/PayoutStatementSection.tsx` | Voided tag | `StatusTag` |

Already migrated application components, headers, tabs, trackers, tables, pagination, cards, notices, uploads and dialogs remain in use. No new sections, charts, features or application components were added.

## Old UI left in place

- Application form outer semantic `section` and its existing header/body/footer layout. `Card` currently renders a `div`; preserving the form's existing semantics takes precedence over replacing this wrapper.
- Compact document picker/drop target and the manager's hidden replacement-file input. Existing upload controls would change their presentation or interaction model.
- Pipeline section heading/footer shell: wrapping it in `DashboardCard` would introduce another card and change the existing structure.
- Backend stage text in the application table. List rows do not carry the stage code required by `stages.ts`; no new stage-name map or API field was invented. Existing mapped stage tags elsewhere remain unchanged.
- Finance days-waiting text and its current overdue logic. `DaysTag` labels mean “in stage” or “due”; neither matches elapsed finance waiting time without changing its meaning or urgency thresholds.
- `BankAccountPayoutSummary` and compact no-documents text: no equivalent component preserves their content and density.
- Document checkbox lists continue using `Checkbox`, `Chip` and existing selection logic. `SearchableChecklist` would add search and select-all features.
- Ordinary headings, data text and layout wrappers remain where they are.

## Shared props added

| Component | Addition | Purpose |
| --- | --- | --- |
| `LinkBtn` | `target`, `rel`, `children` | Preserve external destinations, new tabs and screen-reader hints |
| `StatusTag` | Optional `tone` | Preserve domain-specific status colours; recognised stages still use the central stage map |
| `PresignedImage` | Optional `renderImage(src)` | Render `Avatar` using the existing signed-URL fetch |
| `RadioCardGroup` | Disabled options/reasons, description, React-node hint, vertical layout | Preserve status eligibility and next-action copy; keyboard navigation skips disabled choices |
| `Combobox` | Accessible name, controlled query/callback, server-results mode, results visibility, loading state/message | Preserve the existing advisor-search hook, two-character threshold and 400 ms debounce |

No further prop additions are required for this swap. A future finance-specific `DaysTag` label/threshold variant or a compact upload variant could replace the remaining mismatches, but neither was added.

## Cleanup

No files deleted. Removed the replaced inline markup, its unused imports, and the now-unused per-status colour/background/border style definitions in both status dialogs. Shared components still used elsewhere were retained.

## Validation

- `pnpm build`: passed (90 routes generated). The final mock-data preview build also passed with network access for the existing Google-hosted Inter font.
- `pnpm exec tsc --noEmit`: passed separately; the repository build configuration skips its own type/lint checks.
- `pnpm lint`: passed with existing repository warnings.
- `pnpm test:ci --runInBand`: 75 suites, 432 tests passed.
- Added focused regression coverage for disabled-status keyboard navigation and controlled server-search selection/loading.
- Browser checks cover advisor filter/select/clear, status selection, external-link attributes and opening/editing the correction dialog without submitting mutations.
- Screenshot evidence is local at `/tmp/applications-swap-evidence/`, including paired 1440/375 captures and light/dark, LTR/RTL checks of shared screen compositions. `index.html` presents 118 before/after pairs (236 screenshots).
- Browser validation uses deterministic local mock data and a mock-only fixture cookie, not a live backend account. No real pay-in, payout, status or document mutation was submitted.
