"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Inbox, RefreshCw, GraduationCap, Wallet, X, FileCheck2 } from "lucide-react";
import TableWrapper from "components/ub/data/TableWrapper";
import TableLoadingRow from "components/ub/data/TableLoadingRow";
import TableSkeletonRows from "components/ub/data/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/TableEmptyRow";
import TableErrorRow from "components/ub/data/TableErrorRow";
import TablePagination from "components/ub/data/TablePagination";
import AnimatedTableRow from "components/ub/data/AnimatedTableRow";
import StatusBadge from "components/ub/data/StatusBadge";
import type { StatusBadgeVariant } from "components/ub/data/StatusBadge";
import AppDate from "components/ub/data/AppDate";
import type { DateFormat } from "components/ub/data/appDateTypes";
import RichTextDisplay from "components/ub/data/RichTextDisplay";
import CourseList from "components/ub/data/CourseList";
import Faq from "components/ub/data/Faq";
import Card from "components/ub/data/Card";
import Widget from "components/ub/data/Widget";
import PresignedImage from "components/ub/data/PresignedImage";
import PageContainer from "components/ub/core/PageContainer";
import FadeIn from "components/ub/core/FadeIn";
import Dropdown from "components/ub/navigation/Dropdown";
import ModalHeader from "components/ub/feedback/ModalHeader";
import Button from "components/ub/core/Button";
import PublicNavbar from "components/ub/navigation/PublicNavbar";
import Footer from "components/ub/navigation/Footer";
import SiteFooter from "components/ub/navigation/SiteFooter";
import { card, menuItem, modalPanel, popover, tableCell, tableHead, tableHeadCell, tableRow } from "components/ub/recipes";
import { Demo, ShowcaseSection, StateSwitch, Variant } from "./Showcase";

const ROWS: { id: string; student: string; ref: string; institution: string; stage: string; variant: StatusBadgeVariant; updated: string }[] = [
  { id: "app_001", student: "Nur Aisyah Binti Kamal", ref: "UBX-2026-0412", institution: "Sunway University", stage: "Offer received", variant: "success", updated: "2026-10-27T08:30:00Z" },
  { id: "app_002", student: "Chinedu Okafor", ref: "UBX-2026-0413", institution: "Taylor's University", stage: "Documents pending", variant: "warning", updated: "2026-10-25T11:00:00Z" },
  { id: "app_003", student: "Tanvir Hossain", ref: "UBX-2026-0414", institution: "UCSI University", stage: "Action needed", variant: "attention", updated: "2026-10-22T04:15:00Z" },
  { id: "app_004", student: "Sara Mahmoud", ref: "UBX-2026-0415", institution: "Asia Pacific University", stage: "In Institution review", variant: "info", updated: "2026-10-20T09:45:00Z" },
];
const TABLE_STATES = ["data", "loading", "skeleton", "empty", "error"] as const;
const DATE_FORMATS: DateFormat[] = ["month", "month-year", "short", "long", "datetime", "relative"];

export default function DataDisplay() {
  const [state, setState] = useState<(typeof TABLE_STATES)[number]>("data");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [replay, setReplay] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  // "Two hours ago" is set after mount: Date.now() differs between server and client renders.
  const [twoHoursAgo, setTwoHoursAgo] = useState<Date | null>(null);
  useEffect(() => setTwoHoursAgo(new Date(Date.now() - 2 * 3600_000)), []);
  const rows = [...ROWS].sort((a, b) => (sortAsc ? 1 : -1) * a.student.localeCompare(b.student));

  return (
    <>
      <ShowcaseSection id="data" title="Data display" description="Tables and their states, dates, rich text, cards and content blocks.">
        <Demo name="Table kit" path="components/ub/data/" description="TableWrapper + AnimatedTableRow + the loading / skeleton / empty / error rows + TablePagination.">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <StateSwitch<(typeof TABLE_STATES)[number]> value={state} options={TABLE_STATES} onChange={setState} label="Table state" />
            <button type="button" onClick={() => setSortAsc((s) => !s)} className="mb-4 text-ub-label-md text-ub-text-link hover:underline">
              Sort by student {sortAsc ? "Z–A" : "A–Z"} (animates rows)
            </button>
          </div>
          <TableWrapper footer={<TablePagination currentPage={page} onPageChange={setPage} itemsPerPage={4} itemCount={4} totalCount={24} itemLabel="applications" loading={state === "loading"} />}>
            <table className="w-full text-start">
              <thead className={tableHead}>
                <tr>
                  <th className={tableHeadCell}>Student</th>
                  <th className={tableHeadCell}>Institution</th>
                  <th className={tableHeadCell}>Stage</th>
                  <th className={tableHeadCell}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {state === "loading" && <TableLoadingRow colSpan={4} text="Loading applications…" />}
                {state === "skeleton" && <TableSkeletonRows columns={4} rows={4} />}
                {state === "empty" && <TableEmptyRow colSpan={4} title="No applications yet" subtitle="Add your first student to start tracking every step." icon={<Inbox className="h-6 w-6" />} />}
                {state === "error" && <TableErrorRow colSpan={4} message="We couldn't load applications. Check your connection and try again." onRetry={() => setState("data")} />}
                {state === "data" && (
                  <AnimatePresence initial={false}>
                    {rows.map((r) => (
                      <AnimatedTableRow key={r.id} className={tableRow}>
                        <td className={tableCell}>
                          <p className="text-ub-label-md text-ub-text-primary">{r.student}</p>
                          <p className="ub-ref text-ub-caption text-ub-text-tertiary">{r.ref}</p>
                        </td>
                        <td className={`${tableCell} text-ub-text-secondary`}>{r.institution}</td>
                        <td className={tableCell}>
                          <StatusBadge variant={r.variant}>{r.stage}</StatusBadge>
                        </td>
                        <td className={`${tableCell} text-ub-text-tertiary`}>
                          <AppDate value={r.updated} format="relative" />
                        </td>
                      </AnimatedTableRow>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </TableWrapper>
        </Demo>

        <Demo name="AppDate" path="components/ub/data/AppDate.tsx" className="grid gap-4 sm:grid-cols-3">
          {DATE_FORMATS.map((f) => (
            <Variant key={f} label={`format="${f}"`}>
              <AppDate value={f === "relative" ? twoHoursAgo : "2026-06-12T14:30:00Z"} format={f} className="text-ub-body-md text-ub-text-primary" />
            </Variant>
          ))}
          <Variant label="Empty value">
            <AppDate value={null} className="text-ub-body-md text-ub-text-primary" />
          </Variant>
        </Demo>

        <Demo name="RichTextDisplay" path="components/ub/data/RichTextDisplay.tsx">
          <RichTextDisplay html="<h3>Entry requirements</h3><ul><li>SPM with 5 credits including Mathematics</li><li>IELTS 5.5 or equivalent</li></ul><p>Annual tuition from <strong>RM18,500</strong>. See the <a href='#data'>Knowledge Hub</a> for intakes.</p>" />
        </Demo>

        <Demo name="CourseList" path="components/ub/data/CourseList.tsx">
          <CourseList
            courses={[
              {
                name: "Bachelor of Computer Science (Hons)",
                duration: "3 years",
                intake: "January, May, September",
                notes: "Includes a 12-week industrial placement.",
                levels: [
                  { level_name: "Year 1", level: 1, duration: "12 months", price_myr: 18500, price_usd: 3940 },
                  { level_name: "Year 2", level: 2, duration: "12 months", price_myr: 19200, price_usd: 4090 },
                ],
              },
              {
                name: "Foundation in Engineering",
                duration: "1 year",
                intake: "January, September",
                notes: "Guaranteed progression to the engineering degrees.",
                levels: [{ level_name: "Foundation", level: 1, duration: "12 months", price_myr: 14800, price_usd: 3150 }],
              },
            ]}
          />
        </Demo>

        <Demo name="Faq" path="components/ub/data/Faq.tsx">
          <Faq
            items={[
              { question: "Who can see my public profile?", answer: "Anyone with the link. Your profile isn't listed in a public directory." },
              { question: "How is commission tracked?", answer: "Automatically. Each placed student moves from expected to invoiced to paid." },
              { question: "Can I change my bank account?", answer: "Yes. A new account replaces the old one for future payouts." },
            ]}
          />
        </Demo>

        <Demo name="Card, Widget and PresignedImage" path="components/ub/data/Card.tsx" className="grid gap-6 md:grid-cols-3">
          <Variant label="Card">
            <Card extra="p-5">
              <p className="text-ub-label-md text-ub-text-secondary">Commission pending</p>
              <p className="ub-tabular mt-1 text-ub-data-lg text-ub-text-primary">RM12,400</p>
            </Card>
          </Variant>
          <Variant label="Widget">
            <Widget icon={<Wallet className="h-6 w-6" />} title="Placed this year" subtitle="48" />
          </Variant>
          <Variant label="PresignedImage (mock storage)">
            <div className="flex items-center gap-3">
              <PresignedImage fileKey="universities/logos/uni_004.png" alt="Sunway University" className="h-14 w-14 rounded-full object-cover" fallback={<span className="grid h-14 w-14 place-items-center rounded-full bg-ub-blue-50 text-ub-blue-700">SU</span>} />
              <PresignedImage alt="No file" className="h-14 w-14 rounded-full" fallback={<span className="grid h-14 w-14 place-items-center rounded-full bg-ub-blue-50 text-ub-label-md text-ub-blue-700">NA</span>} />
            </div>
          </Variant>
        </Demo>
      </ShowcaseSection>

      <ShowcaseSection id="overlays" title="Overlays and motion" description="Dropdown, modal header and entrance animation.">
        <Demo name="Dropdown" path="components/ub/navigation/Dropdown.tsx" className="flex min-h-[180px] items-start">
          <Dropdown
            button={
              <span className="inline-flex h-10 cursor-pointer items-center rounded-ub-full border border-ub-border px-4 text-ub-label-md text-ub-text-primary">Open dropdown</span>
            }
            classNames="top-12 left-0 w-56"
          >
            <ul className={`${popover} p-1`}>
              {["Profile settings", "Notifications", "Switch area"].map((i) => (
                <li key={i}>
                  <button type="button" className={menuItem}>
                    {i}
                  </button>
                </li>
              ))}
            </ul>
          </Dropdown>
        </Demo>

        <Demo name="ModalHeader" path="components/ub/feedback/ModalHeader.tsx" className="flex flex-col items-start gap-4">
          <div className={`w-full max-w-lg overflow-hidden ${card}`}>
            <ModalHeader title="Upload offer letter" description="Sunway University · UBX-2026-0412" icon={FileCheck2} onClose={() => undefined} />
          </div>
          <Button text="Open in a modal" onClick={() => setModalOpen(true)} />
          {modalOpen && (
            <div className="fixed inset-0 z-[80] grid place-items-center bg-ub-scrim p-4" role="dialog" aria-modal="true" aria-label="Demo modal" onClick={() => setModalOpen(false)}>
              <div className={`w-full max-w-[560px] overflow-hidden ${modalPanel}`} onClick={(e) => e.stopPropagation()}>
                <ModalHeader title="Withdraw this application?" description="The Institution will be notified, and this can't be undone." icon={X} onClose={() => setModalOpen(false)} />
                <div className="flex justify-end gap-3 p-5">
                  <Button text="Keep application" onClick={() => setModalOpen(false)} />
                  <Button variant="destructive" text="Withdraw application" onClick={() => setModalOpen(false)} />
                </div>
              </div>
            </div>
          )}
        </Demo>

        <Demo name="FadeIn" path="components/ub/core/FadeIn.tsx">
          <button type="button" onClick={() => setReplay((r) => r + 1)} className="mb-4 inline-flex items-center gap-1.5 text-ub-label-md text-ub-text-link hover:underline">
            <RefreshCw className="h-4 w-4" aria-hidden /> Replay
          </button>
          <div key={replay} className="grid gap-4 sm:grid-cols-4">
            {(["up", "left", "right", "none"] as const).map((d, i) => (
              <FadeIn key={d} direction={d} delay={i * 0.1}>
                <div className="rounded-ub-lg border border-ub-border p-4 text-center text-ub-label-md text-ub-text-primary">
                  <GraduationCap className="mx-auto mb-2 h-5 w-5 text-ub-icon-interactive" aria-hidden />
                  direction=&quot;{d}&quot;
                </div>
              </FadeIn>
            ))}
          </div>
        </Demo>
      </ShowcaseSection>

      <ShowcaseSection id="layout" title="Layout" description="Page container and the public site chrome. The portal sidebar and navbar need a role session, so open an area from / to see them.">
        <Demo name="PageContainer" path="components/ub/core/PageContainer.tsx" className="space-y-4">
          {(["form", "table"] as const).map((v) => (
            <Variant key={v} label={`variant="${v}"`}>
              <div className="rounded-ub-md bg-ub-selected p-2">
                <PageContainer variant={v}>
                  <div className="rounded-ub-md border border-dashed border-ub-blue-400 bg-ub-surface p-3 text-center text-ub-body-sm text-ub-text-secondary">max width for {v} pages</div>
                </PageContainer>
              </div>
            </Variant>
          ))}
        </Demo>
        <Demo name="PublicNavbar" path="components/ub/navigation/PublicNavbar.tsx" className="p-0">
          <div className="relative [&_header]:!relative">
            <PublicNavbar />
          </div>
        </Demo>
        <Demo name="Footer (portal)" path="components/ub/navigation/Footer.tsx">
          <Footer />
        </Demo>
        <Demo name="SiteFooter (public)" path="components/ub/navigation/SiteFooter.tsx" className="p-0">
          <SiteFooter />
        </Demo>
      </ShowcaseSection>
    </>
  );
}
