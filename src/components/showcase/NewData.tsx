"use client";

import { useState } from "react";
import { AlertCircle, Bell, Download, FileText, GraduationCap, Inbox, Plus, UserPlus, Users, Wallet } from "lucide-react";
import Tag, { type TagHue } from "components/ub/data/Tag";
import DaysTag from "components/ub/data/DaysTag";
import Chip from "components/ub/data/Chip";
import CountBadge from "components/ub/data/CountBadge";
import { Avatar, AvatarGroup, type AvatarSize } from "components/ub/data/Avatar";
import StatCard from "components/ub/data/StatCard";
import { List, ListItem } from "components/ub/data/List";
import DataTable, { DataTablePrimaryCell, type DataTableColumn, type DataTableDensity } from "components/ub/data/DataTable";
import TablePagination from "components/ub/data/TablePagination";
import Button from "components/ub/core/Button";
import type { TagTone } from "components/ub/recipes";
import { Demo, ShowcaseSection, StateSwitch, Variant } from "./Showcase";

const TONES: TagTone[] = ["success", "danger", "warning", "attention", "info", "neutral", "brand"];

// Proposed stage → hue mapping (brief §4.3; final list pending, §11).
const STAGES: { label: string; hue?: TagHue; tone?: TagTone }[] = [
  { label: "Enquiry", hue: "grey" },
  { label: "Documents pending", hue: "amber" },
  { label: "Submitted to Institution", hue: "indigo" },
  { label: "In Institution review", hue: "sky" },
  { label: "Offer received", hue: "teal" },
  { label: "Visa in progress", hue: "plum" },
  { label: "Arrival and Logistics", hue: "pink" },
  { label: "Enrolled", tone: "success" },
  { label: "Commission paid", tone: "success" },
  { label: "Withdrawn", hue: "grey" },
];

const INTAKES = ["Jan 2027", "Apr 2027", "Jul 2027", "Sep 2027"];
const LEVELS = ["Foundation", "Diploma", "Degree", "Masters"];
const AVATAR_SIZES: AvatarSize[] = [24, 32, 40, 48, 64, 96];
const ADVISORS = ["Nur Aisyah Binti Kamal", "Chinedu Okafor", "Tanvir Hossain", "Sara Mahmoud", "Lim Wei Jie", "Priya Nair", "Ahmad Faiz"].map((name) => ({ name }));

type Application = {
  id: string;
  student: string;
  ref: string;
  institution: string;
  stage: (typeof STAGES)[number];
  daysInStage: number;
  commission: number;
  updated: string;
};

const APPLICATIONS: Application[] = [
  { id: "app_0412", student: "Nur Aisyah Binti Kamal", ref: "UBX-2026-0412", institution: "Sunway University", stage: STAGES[4], daysInStage: 2, commission: 4200, updated: "12 Oct 2026" },
  { id: "app_0413", student: "Chinedu Okafor", ref: "UBX-2026-0413", institution: "Taylor's University", stage: STAGES[1], daysInStage: 9, commission: 3100, updated: "08 Oct 2026" },
  { id: "app_0414", student: "Tanvir Hossain", ref: "UBX-2026-0414", institution: "UCSI University", stage: STAGES[5], daysInStage: 17, commission: 5600, updated: "29 Sep 2026" },
  { id: "app_0415", student: "Sara Mahmoud", ref: "UBX-2026-0415", institution: "Asia Pacific University", stage: STAGES[3], daysInStage: 5, commission: 3850, updated: "15 Oct 2026" },
  { id: "app_0416", student: "Lim Wei Jie", ref: "UBX-2026-0416", institution: "Monash University Malaysia", stage: STAGES[2], daysInStage: 1, commission: 6000, updated: "21 Oct 2026" },
];

const rm = (n: number) => `RM${n.toLocaleString("en-MY")}`;

const COLUMNS: DataTableColumn<Application>[] = [
  {
    key: "student",
    header: "Student",
    sortable: true,
    width: "28%",
    cell: (r) => <DataTablePrimaryCell name={r.student} reference={r.ref} />,
  },
  { key: "institution", header: "Institution", sortable: true, cell: (r) => <span className="text-ub-text-secondary">{r.institution}</span> },
  {
    key: "stage",
    header: "Stage",
    sortable: true,
    sortValue: (r) => STAGES.indexOf(r.stage),
    cell: (r) => (
      <Tag hue={r.stage.hue} tone={r.stage.tone}>
        {r.stage.label}
      </Tag>
    ),
  },
  { key: "daysInStage", header: "Time in stage", sortable: true, cell: (r) => <DaysTag mode="inStage" days={r.daysInStage} size="sm" /> },
  { key: "commission", header: "Commission", align: "end", sortable: true, cell: (r) => rm(r.commission) },
];

const TABLE_STATES = ["data", "loading", "empty", "error"] as const;
const DENSITIES: readonly DataTableDensity[] = ["comfortable", "compact"];

export default function NewData() {
  const [intakes, setIntakes] = useState<string[]>(["Jan 2027"]);
  const [levels, setLevels] = useState<string[]>(["Degree"]);
  const [applied, setApplied] = useState(["Sunway University", "Kuala Lumpur"]);
  const [statLoading, setStatLoading] = useState<"data" | "loading">("data");
  const [tableState, setTableState] = useState<(typeof TABLE_STATES)[number]>("data");
  const [density, setDensity] = useState<DataTableDensity>("comfortable");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [openItem, setOpenItem] = useState("UBX-2026-0412");

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <ShowcaseSection
      id="data-new"
      title="Data (brief components)"
      description="Tags, days tags, chips, count badges, avatars, stat cards, lists and the data table from brief §4.3–§4.7."
    >
      <Demo name="Tag" path="components/ub/data/Tag.tsx" description="24px (md) or 20px (sm), radius 6, label-sm. Text is always present; dot or icon are optional." className="grid gap-6">
        <Variant label="Tones (tinted)">
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <Tag key={t} tone={t} dot>
                {t[0].toUpperCase() + t.slice(1)}
              </Tag>
            ))}
          </div>
        </Variant>
        <Variant label="Tones (solid)">
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <Tag key={t} tone={t} variant="solid">
                {t[0].toUpperCase() + t.slice(1)}
              </Tag>
            ))}
          </div>
        </Variant>
        <Variant label="Stage tags (proposed hues, pending §11)">
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <Tag key={s.label} hue={s.hue} tone={s.tone}>
                {s.label}
              </Tag>
            ))}
          </div>
        </Variant>
        <Variant label="Small, with icon, and the action-needed flag">
          <div className="flex flex-wrap items-center gap-2">
            <Tag hue="amber" size="sm">
              Documents pending
            </Tag>
            <Tag tone="danger" size="sm" icon={<AlertCircle />}>
              Action needed
            </Tag>
            <Tag tone="brand" icon={<GraduationCap />}>
              Degree
            </Tag>
            <Tag hue="indigo" variant="solid">
              Submitted to Institution
            </Tag>
          </div>
        </Variant>
      </Demo>

      <Demo name="DaysTag" path="components/ub/data/DaysTag.tsx" description="Thresholds live in DAYS_TAG_THRESHOLDS. Days in stage: 0–3 grey, 4–7 amber, 8–14 orange, 15+ red." className="grid gap-6 sm:grid-cols-2">
        <Variant label="Days in stage">
          <div className="flex flex-wrap gap-2">
            {[1, 5, 9, 17].map((d) => (
              <DaysTag key={d} mode="inStage" days={d} />
            ))}
          </div>
        </Variant>
        <Variant label="Deadline">
          <div className="flex flex-wrap gap-2">
            {[21, 10, 3, 0, -2].map((d) => (
              <DaysTag key={d} mode="deadline" days={d} />
            ))}
          </div>
        </Variant>
      </Demo>

      <Demo name="Chip" path="components/ub/data/Chip.tsx" description="Toggle chips use aria-pressed and show a check when selected. Removable chips get a separate labelled × button." className="grid gap-6">
        <Variant label="Study level filter">
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <Chip key={l} selected={levels.includes(l)} onSelectedChange={() => toggle(levels, setLevels, l)}>
                {l}
              </Chip>
            ))}
          </div>
        </Variant>
        <Variant label="Intake (month-year)">
          <div className="flex flex-wrap gap-2">
            {INTAKES.map((i) => (
              <Chip key={i} size="md" selected={intakes.includes(i)} onSelectedChange={() => toggle(intakes, setIntakes, i)}>
                {i}
              </Chip>
            ))}
          </div>
        </Variant>
        <Variant label="Removable">
          <div className="flex flex-wrap gap-2">
            {applied.map((a) => (
              <Chip key={a} onRemove={() => setApplied((xs) => xs.filter((x) => x !== a))}>
                {a}
              </Chip>
            ))}
            {applied.length === 0 && (
              <Button variant="tertiary" size="sm" text="Reset filters" onClick={() => setApplied(["Sunway University", "Kuala Lumpur"])} />
            )}
            <Chip disabled>Masters (unavailable)</Chip>
          </div>
        </Variant>
      </Demo>

      <Demo name="CountBadge" path="components/ub/data/CountBadge.tsx" description="Caps at 99+. Screen readers hear the full phrase, e.g. “4 unread”." className="flex flex-wrap items-center gap-8">
        <Variant label="Nav item">
          <span className="inline-flex h-10 items-center gap-2 rounded-ub-md px-3 text-ub-label-md text-ub-text-primary">
            <Inbox aria-hidden="true" className="h-5 w-5" /> Messages <CountBadge count={4} />
          </span>
        </Variant>
        <Variant label="Bell (danger)">
          <span className="relative inline-grid h-10 w-10 place-items-center text-ub-icon-default">
            <Bell aria-hidden="true" className="h-5 w-5" />
            <CountBadge count={12} tone="danger" label={(n) => `${n} new notifications`} className="absolute -top-0.5 -end-0.5" />
          </span>
        </Variant>
        <Variant label="Capped">
          <CountBadge count={240} label={(n) => `${n} applications need action`} />
        </Variant>
      </Demo>

      <Demo name="Avatar and AvatarGroup" path="components/ub/data/Avatar.tsx" description="Initials fall back when there's no image. Status dot is 25% of the diameter. Groups overlap −8px and show at most 4." className="grid gap-6">
        <Variant label="Sizes 24 / 32 / 40 / 48 / 64 / 96">
          <div className="flex flex-wrap items-end gap-3">
            {AVATAR_SIZES.map((s) => (
              <Avatar key={s} name="Nur Aisyah Binti Kamal" size={s} status={s >= 40 ? "online" : undefined} />
            ))}
          </div>
        </Variant>
        <Variant label="Status">
          <div className="flex gap-3">
            <Avatar name="Chinedu Okafor" status="online" />
            <Avatar name="Sara Mahmoud" status="away" />
            <Avatar name="Tanvir Hossain" status="offline" />
          </div>
        </Variant>
        <Variant label="Group (7 Advisors)">
          <AvatarGroup people={ADVISORS} label="Assigned Advisors" />
        </Variant>
      </Demo>

      <Demo name="StatCard" path="components/ub/data/StatCard.tsx" description="Light glass, data-xl tabular value, delta tag with sign and icon, context caption, optional sparkline.">
        <StateSwitch<"data" | "loading"> value={statLoading} options={["data", "loading"] as const} onChange={setStatLoading} label="Stat card state" />
        <div className="grid gap-4 rounded-ub-lg bg-ub-canvas p-4 ub-canvas-light sm:grid-cols-3">
          <StatCard
            loading={statLoading === "loading"}
            label="Students placed"
            icon={<GraduationCap />}
            value="128"
            delta={{ value: 12 }}
            context="vs last intake"
            sparkline={[62, 70, 68, 84, 91, 104, 128]}
            sparklineLabel="Students placed over the last 7 intakes, rising from 62 to 128"
          />
          <StatCard loading={statLoading === "loading"} label="Commission this month" icon={<Wallet />} value={rm(42600)} delta={{ value: -4.5 }} context="vs September" />
          <StatCard loading={statLoading === "loading"} label="Documents overdue" icon={<FileText />} value="3" delta={{ value: -2, unit: "", goodWhen: "down" }} context="vs last week" />
        </div>
      </Demo>

      <Demo name="List and ListItem" path="components/ub/data/List.tsx" description="Divided rows with leading, title, description, meta and a trailing action. Rows can be buttons or links; dense is 44px." className="grid gap-6 lg:grid-cols-2">
        <Variant label="Interactive (button rows)">
          <List bordered aria-label="Recent applications">
            {APPLICATIONS.slice(0, 3).map((a) => (
              <ListItem
                key={a.id}
                leading={<Avatar name={a.student} alt="" />}
                title={a.student}
                description={`${a.institution} · ${a.ref}`}
                meta={a.updated}
                current={openItem === a.ref}
                onClick={() => setOpenItem(a.ref)}
                trailing={<DaysTag mode="inStage" days={a.daysInStage} size="sm" />}
              />
            ))}
          </List>
        </Variant>
        <Variant label="Dense, static">
          <List bordered dense aria-label="Required documents">
            <ListItem leading={<FileText aria-hidden="true" className="h-5 w-5" />} title="Passport" description="Uploaded 12 Oct 2026" trailing={<Tag tone="success" size="sm">Verified</Tag>} />
            <ListItem leading={<FileText aria-hidden="true" className="h-5 w-5" />} title="SPM certificate" description="Uploaded 08 Oct 2026" trailing={<Tag tone="warning" size="sm">In review</Tag>} />
            <ListItem leading={<FileText aria-hidden="true" className="h-5 w-5" />} title="IELTS result" description="Not uploaded yet" trailing={<Tag tone="danger" size="sm">Missing</Tag>} />
          </List>
        </Variant>
      </Demo>

      <Demo
        name="DataTable"
        path="components/ub/data/DataTable.tsx"
        description="Typed columns, sorting (asc → desc → off), row selection with select-all and a bulk-action bar, two densities, loading / empty / error states, pagination slot. Below 768px rows stack as label: value."
      >
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <StateSwitch<(typeof TABLE_STATES)[number]> value={tableState} options={TABLE_STATES} onChange={setTableState} label="Table state" />
          <StateSwitch<DataTableDensity> value={density} options={DENSITIES} onChange={setDensity} label="Density" />
        </div>
        <DataTable<Application>
          caption="Application Tracker"
          columns={COLUMNS}
          rows={tableState === "empty" ? [] : APPLICATIONS}
          getRowId={(r) => r.id}
          getRowLabel={(r) => r.student}
          density={density}
          loading={tableState === "loading"}
          error={tableState === "error" ? "We couldn't load applications. Check your connection and try again." : null}
          onRetry={() => setTableState("data")}
          empty={{
            title: "No applications yet",
            description: "Add your first student to start tracking every step.",
            icon: <Users aria-hidden="true" />,
            action: <Button variant="primary" icon={<UserPlus aria-hidden="true" className="h-4 w-4" />} text="Add student" />,
          }}
          selectable
          selectedIds={selected}
          onSelectionChange={setSelected}
          defaultSort={{ key: "student", direction: "asc" }}
          bulkActions={(_ids, clear) => (
            <>
              <Button variant="secondary" size="sm" icon={<Download aria-hidden="true" className="h-4 w-4" />} text="Export" />
              <Button variant="secondary" size="sm" icon={<Plus aria-hidden="true" className="h-4 w-4" />} text="Assign Advisor" onClick={clear} />
            </>
          )}
          footer={
            <TablePagination
              currentPage={page}
              onPageChange={setPage}
              itemsPerPage={5}
              itemCount={tableState === "data" ? APPLICATIONS.length : 0}
              totalCount={42}
              itemLabel="applications"
              loading={tableState === "loading"}
            />
          }
        />
      </Demo>
    </ShowcaseSection>
  );
}
