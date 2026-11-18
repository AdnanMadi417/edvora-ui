"use client";

import Tag from "components/ub/data/badges/Tag";
import CatalogCard from "components/ub/data/cards/CatalogCard";
import { Avatar } from "components/ub/data/media/Avatar";
import { Demo } from "../Showcase";

export default function CatalogCards() {
  return (
    <Demo
      name="CatalogCard"
      path="components/ub/data/cards/CatalogCard.tsx"
      description="The one anatomy for every catalogue card (programs, universities, language centers, logistics providers): avatar with the status circle and the name in a tooltip, one sub-line, short tags, a two-column grid of labelled facts (commission in green), and up to two text buttons pinned to the bottom so buttons line up across a row. No icon-only actions, no descriptions."
      code={'<CatalogCard name="…" avatar={<Avatar … />} status={{ status: "active" }} subtitle="…" tags={<Tag …/>} facts={[{ label: "Duration", value: "3 years" }]} href="…" actions={[{ label: "View details", href: "…" }, { label: "Apply now", href: "…", variant: "primary" }]} />'}
      props={[
        { name: "name / avatar / status / subtitle", type: "string / ReactNode / EntityCellStatus / ReactNode", description: "The header, same as EntityCell; the name gets a tooltip." },
        { name: "tags", type: "ReactNode", description: "Short tags only (level, scholarship)." },
        { name: "facts", type: "{ label, value, wide?, tone? }[]", description: "Labelled facts in two columns; wide spans both; tone success for commission." },
        { name: "href", type: "string", description: "The whole card opens it (pointer shortcut)." },
        { name: "actions", type: "{ label, href, variant?, ariaLabel?, external? }[]", description: "One or two text buttons at the bottom." },
        { name: "footer", type: "ReactNode", description: "Replaces the buttons, e.g. a locked state." },
      ]}
    >
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <CatalogCard
          name="Bachelor of Computer Science (Hons) with a Specialism in Data Analytics"
          avatar={<Avatar name="Asia Pacific University" size={40} alt="" />}
          status={{ status: "active", label: "Visible" }}
          subtitle="Asia Pacific University"
          tags={
            <>
              <Tag hue="indigo" size="sm">Bachelor&apos;s Degree</Tag>
              <Tag hue="amber" size="sm">Scholarship</Tag>
            </>
          }
          facts={[
            { label: "Duration", value: "3 years" },
            { label: "Location", value: "Kuala Lumpur" },
            { label: "First-year tuition", value: "MYR 6,000" },
            { label: "Your commission", value: "MYR 1,500", tone: "success" },
          ]}
          href="#c-catalog-card"
          actions={[
            { label: "View details", href: "#c-catalog-card" },
            { label: "Apply now", href: "#c-catalog-card", variant: "primary" },
          ]}
        />
        <CatalogCard
          name="KL Student Arrival Services"
          avatar={<Avatar name="KL Student Arrival Services" size={40} alt="" />}
          status={{ status: false }}
          subtitle="Kuala Lumpur"
          facts={[
            { label: "Single service", value: "From RM 80" },
            { label: "Package", value: "Not listed" },
          ]}
          footer={<p className="py-2 text-center text-ub-label-sm text-ub-text-secondary">Contact locked</p>}
        />
      </div>
    </Demo>
  );
}
