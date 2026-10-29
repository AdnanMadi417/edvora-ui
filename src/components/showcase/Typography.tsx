"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Demo, ShowcaseSection } from "./Showcase";

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
