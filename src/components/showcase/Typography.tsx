"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Heading from "components/ub/core/Heading";
import Text from "components/ub/core/Text";
import Amount, { Numeral } from "components/ub/core/Amount";
import RefId from "components/ub/core/RefId";
import TextLink from "components/ub/core/TextLink";
import Prose from "components/ub/core/Prose";
import { formatCurrency, formatDisplayDate, formatNumber, formatPercent, formatTime } from "lib/format";
import { Demo, ShowcaseSection, Variant } from "./Showcase";

// Full class names so Tailwind's JIT can see them.
const TYPE: [string, string, string][] = [
  ["display-lg", "text-ub-display-lg-mobile sm:text-ub-display-lg", "Marketing hero"],
  ["display-md", "text-ub-display-md-mobile sm:text-ub-display-md", "Dashboard welcome, empty-state hero"],
  ["heading-xl", "text-ub-heading-xl-mobile sm:text-ub-heading-xl", "Page titles"],
  ["heading-lg", "text-ub-heading-lg", "Section titles"],
  ["heading-md", "text-ub-heading-md", "Card and modal titles"],
  ["heading-sm", "text-ub-heading-sm", "Sub-sections, drawer titles"],
  ["body-lg", "text-ub-body-lg", "Onboarding, Knowledge Hub articles"],
  ["body-md", "text-ub-body-md", "Default"],
  ["body-sm", "text-ub-body-sm", "Tables, dense UI, helper text"],
  ["label-lg", "text-ub-label-lg", "Large buttons"],
  ["label-md", "text-ub-label-md", "Buttons, labels, tabs"],
  ["label-sm", "text-ub-label-sm", "Tags, table headers"],
  ["caption", "text-ub-caption", "Timestamps, metadata"],
  ["data-xl", "ub-tabular text-ub-data-xl", "KPI values"],
  ["data-lg", "ub-tabular text-ub-data-lg", "Secondary KPI values"],
];

/** Shows the rendered size / line height / weight of the sample, measured live. */
function TypeRow({ token, cls, use }: { token: string; cls: string; use: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [spec, setSpec] = useState("");
  useEffect(() => {
    const measure = () => {
      if (!ref.current) return;
      const s = getComputedStyle(ref.current);
      setSpec(`${parseFloat(s.fontSize)}/${parseFloat(s.lineHeight)} · ${s.fontWeight}`);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return (
    <li className="grid gap-1 border-b border-ub-border py-4 last:border-0 md:grid-cols-[180px_minmax(0,1fr)] md:gap-6">
      <div>
        <code className="ub-ref text-ub-label-sm text-ub-text-primary">{token}</code>
        <p className="ub-tabular text-ub-caption text-ub-text-tertiary">{spec || " "}</p>
        <p className="text-ub-caption text-ub-text-tertiary">{use}</p>
      </div>
      <p ref={ref} className={clsx(cls, "truncate text-ub-text-primary")}>
        Track every application in one place
      </p>
    </li>
  );
}

export default function Typography() {
  return (
    <ShowcaseSection
      id="typography"
      number="02"
      title="Typography"
      description="Inter for every Latin language, Thmanya Sans for Arabic (system Arabic font until licensing is confirmed). Sentence case everywhere, left-aligned, and reading containers no wider than 680px."
    >
      <Demo name="Type scale" path="tailwind.config.js" description="Classes: text-ub-<token>. Display and heading-xl step down below 640px. Sizes are measured from the rendered sample.">
        <ul>
          {TYPE.map(([token, cls, use]) => (
            <TypeRow key={token} token={token} cls={cls} use={use} />
          ))}
        </ul>
      </Demo>

      <Demo name="Heading" path="components/ub/core/Heading.tsx" description="Pick the level for the document outline and the size for the look. Each level has a default size." className="space-y-3">
        <Heading level={1} size="display-md">Good morning, Nur Aisyah</Heading>
        <Heading level={2}>Application Tracker</Heading>
        <Heading level={3}>Offer received</Heading>
        <Heading level={4}>Documents</Heading>
        <Heading level={3} size="heading-sm" truncate className="max-w-xs">
          Bachelor of Computer Science (Hons) · Sunway University
        </Heading>
      </Demo>

      <Demo name="Text" path="components/ub/core/Text.tsx" description="Body, label and caption sizes with semantic tones. Emphasis by weight, never color or italics." className="grid gap-6 md:grid-cols-2">
        <Variant label="Sizes">
          <div className="space-y-1">
            <Text size="body-lg">Body large · onboarding and articles</Text>
            <Text>Body medium · the default</Text>
            <Text size="body-sm">Body small · tables and helper text</Text>
            <Text size="label-md" tone="primary">Label medium · buttons and labels</Text>
            <Text size="caption" tone="tertiary">Caption · updated 2 hours ago</Text>
          </div>
        </Variant>
        <Variant label="Tones and weight">
          <div className="space-y-1">
            <Text tone="primary" weight="semibold">Primary, semibold</Text>
            <Text tone="secondary">Secondary</Text>
            <Text tone="tertiary">Tertiary</Text>
            <Text tone="success">Document verified</Text>
            <Text tone="danger">This file is over 10 MB. Upload a PDF under 10 MB.</Text>
            <Text size="body-sm" lineClamp={2} className="max-w-xs">
              Line clamp: Sunway University requires certified copies of SPM results, a passport valid for 18 months and a recent photo for every applicant.
            </Text>
          </div>
        </Variant>
      </Demo>

      <Demo name="Amount, Numeral and RefId" path="components/ub/core/Amount.tsx" description="Money, counts and IDs in the brief's formats, always with tabular numerals or ss02." className="grid gap-6 sm:grid-cols-3">
        <Variant label="Amount">
          <div className="space-y-1 text-ub-heading-sm text-ub-text-primary">
            <p><Amount value={4200} /></p>
            <p><Amount value={3000} currency="SGD" /></p>
            <p><Amount value={18500.8} decimals={2} /></p>
            <p><Amount value={1250} signed /> <Amount value={-320} signed /></p>
          </div>
        </Variant>
        <Variant label="Numeral">
          <div className="space-y-1 text-ub-heading-sm text-ub-text-primary">
            <p><Numeral value={3500} /></p>
            <p><Numeral value={128} suffix=" students" /></p>
            <p className="text-ub-data-lg"><Numeral value={94} suffix="%" /></p>
          </div>
        </Variant>
        <Variant label="RefId">
          <div className="space-y-2 text-ub-body-md text-ub-text-primary">
            <p><RefId value="UBX-2026-0412" /></p>
            <p><RefId value="UBX-2026-0412" copyable /></p>
            <p><RefId value="A12345678" /></p>
          </div>
        </Variant>
      </Demo>

      <Demo name="TextLink and Prose" path="components/ub/core/Prose.tsx" description="Prose caps reading width at 680px and styles headings, lists and links inside it. TextLink is for links within sentences; use TextButton for standalone actions.">
        <Prose size="lg">
          <h2>Entry requirements</h2>
          <p>
            Applicants need <strong>SPM with five credits</strong>, including Mathematics. See the <TextLink href="#typography">Knowledge Hub</TextLink> for each Institution&apos;s intakes, or check the{" "}
            <TextLink href="https://www.emgs.com.my" external>
              EMGS visa guide
            </TextLink>
            .
          </p>
          <ul>
            <li>IELTS 5.5 or an equivalent English test</li>
            <li>Passport valid for at least 18 months</li>
          </ul>
        </Prose>
      </Demo>

      <Demo name="Formats" path="lib/format.ts" description="One place for display formats (brief §8). Components above use these; call them directly for strings.">
        <div className="overflow-x-auto rounded-ub-lg border border-ub-border">
          <table className="w-full text-start">
            <thead className="bg-ub-table-head text-ub-label-sm text-ub-text-secondary">
              <tr>
                <th className="h-11 px-4 text-start font-medium">Type</th>
                <th className="h-11 px-4 text-start font-medium">Call</th>
                <th className="h-11 px-4 text-start font-medium">Output</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Currency", "formatCurrency(4200)", formatCurrency(4200)],
                ["Currency", 'formatCurrency(3000, { currency: "SGD" })', formatCurrency(3000, { currency: "SGD" })],
                ["Number", "formatNumber(3500)", formatNumber(3500)],
                ["Percent", "formatPercent(0.124)", formatPercent(0.124)],
                ["Date", "formatDisplayDate(…)", formatDisplayDate(new Date(2026, 5, 12))],
                ["Time", "formatTime(…)", formatTime(new Date(2026, 5, 12, 14, 30))],
                ["Recent date", "formatSmartDate(…)", "2 hours ago (under 7 days)"],
              ].map(([type, call, out]) => (
                <tr key={call} className="border-t border-ub-border">
                  <td className="h-12 px-4 text-ub-body-sm text-ub-text-secondary">{type}</td>
                  <td className="h-12 px-4"><code className="ub-ref text-ub-caption text-ub-text-primary">{call}</code></td>
                  <td className="ub-tabular h-12 px-4 text-ub-body-sm text-ub-text-primary">{out}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Demo>

      <Demo name="Numerals" path="styles/tokens/utilities.css" className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-ub-label-sm text-ub-text-tertiary">Proportional (default)</p>
          <div className="space-y-1 text-ub-heading-sm text-ub-text-primary">
            <p>RM1,111.11</p>
            <p>RM4,200.00</p>
            <p>RM18,500.80</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-ub-label-sm text-ub-text-tertiary">.ub-tabular: tables, amounts, dates, KPIs</p>
          <div className="ub-tabular space-y-1 text-end text-ub-heading-sm text-ub-text-primary sm:text-start">
            <p>RM1,111.11</p>
            <p>RM4,200.00</p>
            <p>RM18,500.80</p>
          </div>
        </div>
      </Demo>

      <Demo name="Reference IDs" path="styles/tokens/utilities.css" description={'.ub-ref turns on the "ss02" stylistic set for reference IDs, student IDs and passport numbers. Never use a monospace font for IDs.'} className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-ub-label-sm text-ub-text-tertiary">Default</p>
          <p className="text-ub-heading-lg text-ub-text-primary">UBX-2026-0412 · Il1 O0</p>
        </div>
        <div>
          <p className="mb-2 text-ub-label-sm text-ub-text-tertiary">.ub-ref</p>
          <p className="ub-ref text-ub-heading-lg text-ub-text-primary">UBX-2026-0412 · Il1 O0</p>
        </div>
      </Demo>

      <Demo name="Arabic" path="styles/tokens/utilities.css" description="No letter-spacing, no italics, +4px line height per step, Western numerals for data, dir=auto on mixed strings.">
        <div lang="ar" dir="rtl" className="space-y-2 text-ub-text-primary">
          <p className="text-ub-heading-lg leading-[36px]">تتبّع كل طلب في مكان واحد</p>
          <p className="text-ub-body-md leading-[28px] text-ub-text-secondary">
            مرحبًا نور عائشة، لديك 3 طلبات تحتاج إلى إجراء اليوم. الرسوم: <span className="ub-tabular">RM4,200</span>
          </p>
        </div>
      </Demo>

      <Demo name="Writing rules" path="docs/unibexs-frontend-redesign-brief.md" className="grid gap-3 sm:grid-cols-2">
        {[
          ["Sentence case", "Submit application, not Submit Application."],
          ["Verb + object labels", "The resulting status reuses the words: Application submitted."],
          ["Emphasis by weight or size", "Never color or italics in product UI."],
          ["Approved terms", "Advisor, Institution, Unibexs System, Knowledge Hub, Application Tracker, placed."],
          ["Formats", "12 Jun 2026 · 2:30 pm · RM4,200 · SGD 3,000 · 3,500"],
          ["Errors say how to fix", "This file is over 10 MB. Upload a PDF under 10 MB."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-ub-md border border-ub-border p-4">
            <p className="text-ub-label-md text-ub-text-primary">{title}</p>
            <p className="mt-1 text-ub-body-sm text-ub-text-secondary">{body}</p>
          </div>
        ))}
      </Demo>
    </ShowcaseSection>
  );
}
