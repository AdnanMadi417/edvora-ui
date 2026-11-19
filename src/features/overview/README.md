# Role dashboards

The five Home routes use `RoleOverview` with role-scoped resources and the existing session authorization checks.

## Priorities

- **Admin:** actionable applications, active application count, advisor verification, payouts, university-level commission and pipeline.
- **Advisor:** personal next steps, active applications, offer-stage applications, eligible commission, pipeline, and recent account notifications. Agency owners request team applications; agency members never receive commission widgets or team-management links.
- **Account manager:** actionable applications and paused cases from the assigned/shared advisor scope, advisor directory, and pipeline. No finance widget.
- **Reviewer:** advisor verification and pending registrations, verified counts, manager directory, and verification distribution. No application or financial data.
- **Data entry:** required-field checks, catalogue counts, hidden programs as a neutral separate list, language centers, and recent updates. No application or financial data.

The reference-inspired layout uses compact white summary cards, a reporting grid, and a shortcuts/activity rail from 1600px. Desktop report panels compare application stages and commission status side by side when permitted. Mobile uses two-column metrics followed by the work queue and stacked reporting cards. Lists initially show three entries and can expand up to the fetched preview size; the full-directory link remains available. Up to four metrics are displayed, and zero-value exception panels are hidden. No invented deadlines, historic trends, or conversion rates are shown.

## Definitions and data integrity

`actionRequired` scans all pages of the role's active application endpoint and applies the same staff/advisor status classifications used by the existing overview. It counts applications, not tasks. Account-manager scope is enforced by its endpoint. Agency application scope uses `include_members` only for agency owners. Offer-stage counts come from the existing pipeline's server totals and are omitted if that stage is not configured.

Catalogue quality checks cover the required program name, university, qualification, field of study, and at least one delivery mode. Optional fees, descriptions and duration are not flagged. Hidden programs are not inherently invalid. Checks scan both visible and hidden records.

All calculated totals require complete pagination. Missing pages, repeated IDs and changes to server totals result in an error, rather than a misleading partial sum. The current client-side aggregation is bounded to 200 pages; a server summary endpoint is appropriate for larger datasets. Existing previews and headline metrics still use their established API totals.

## Commission by university

Available only to admins and advisors allowed to view commission under the existing session policy. Finance data comes from the admin Finance Queue or the partner's self-service Statement endpoint; account-manager access is not expanded.

- **Expected:** commission records waiting on the university.
- **Ready for payout:** commission records waiting on Unibexs.
- **Paid:** settled records. Admins see actual `paid_amount` and `paid_currency`; advisors see the statement's current amount/currency, not an invented original agreed figure.
- **Disputed:** counted separately and excluded from the three monetary buckets.

University names and currency codes form separate groups. Currencies are never summed together. Missing/redacted amounts remain unavailable, including when only part of a bucket is undisclosed. Selecting an amount opens the actual supporting application records. Mobile also exposes paid amounts below the university identity so settled-only universities still show useful information.

Finance records currently provide a university name rather than an ID. The widget links to a university profile only when exactly one accessible catalogue record matches that name; otherwise it displays the name and an icon without guessing a profile. Stable university IDs on finance responses are the preferred future contract.

All new resources use existing APIs. Demo data comes from the app's mock adapter and refreshes with the established overview lifecycle. Live deployment still needs the API's existing authorization, scope and pagination contracts.

## Reporting visuals

Application charts compare current stage counts, not historical conversion rates. Commission charts show expected, ready and paid amounts for one explicit currency at a time; null amounts use an unavailable state rather than partial totals. Reviewer verification and data-entry catalogue completeness use gauges based on their existing disjoint counts. Zero-value chart categories have zero-height bars. There are no sample historical trends, calendar events or invented schedules.
