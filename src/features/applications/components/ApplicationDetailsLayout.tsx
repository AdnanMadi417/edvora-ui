"use client";

import type { ReactNode } from "react";
import Button from "components/ub/core/buttons/Button";
import StickyActionBar from "components/ub/navigation/controls/StickyActionBar";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import { APPLICATION_DETAILS_TABS, type ApplicationDetailsTab } from "features/applications/shared/applicationDetailTabs";
import type { HeaderAction } from "./ApplicationHeader";

export interface ApplicationDetailsLayoutProps {
  header: ReactNode;
  alerts?: ReactNode;
  tracker: ReactNode;
  activeTab: ApplicationDetailsTab;
  onTabChange: (tab: ApplicationDetailsTab) => void;
  /** Panel content per tab; only the active one renders. */
  panels: Record<ApplicationDetailsTab, ReactNode>;
  /** Counts on tabs, e.g. documents needing replacement. */
  tabCounts?: Partial<Record<ApplicationDetailsTab, number>>;
  /** The header's Primary action, repeated in the sticky bar below 768px. */
  primaryAction?: HeaderAction | null;
  /** Repeat the Primary action in a fixed bar below 768px. Default true; false when embedded (style guide previews). */
  stickyAction?: boolean;
  /** Anything rendered after the page (dialogs, popups). */
  children?: ReactNode;
}

const ID = "application-details";

/**
 * Application Details page frame (brief §6): header, alerts, tracker, then
 * Overview · Documents · Offer & visa · Commission · Activity. Tabs scroll
 * horizontally on mobile, where the Primary action moves to a sticky bar.
 */
export default function ApplicationDetailsLayout({ header, alerts, tracker, activeTab, onTabChange, panels, tabCounts = {}, primaryAction, stickyAction = true, children }: ApplicationDetailsLayoutProps) {
  const sticky = !!primaryAction && stickyAction;
  const tabs = APPLICATION_DETAILS_TABS.map((t) => ({ ...t, count: tabCounts[t.key] }));
  return (
    <div className={sticky ? "mx-auto grid gap-4 pb-20 md:gap-6 md:pb-0" : "mx-auto grid gap-4 md:gap-6"}>
      {header}
      {alerts}
      {tracker}
      <div className="min-w-0">
        <Tabs<ApplicationDetailsTab> tabs={tabs} active={activeTab} onChange={onTabChange} idPrefix={ID} inset={false} aria-label="Application sections" />
        <div {...tabPanelProps(ID, activeTab)} className="mt-4 min-w-0 focus-visible:outline-none md:mt-6">
          {panels[activeTab]}
        </div>
      </div>
      {sticky && primaryAction && (
        <StickyActionBar aria-label="Next action">
          <Button
            variant="primary"
            text={primaryAction.label}
            icon={primaryAction.icon ? <primaryAction.icon className="h-4 w-4" aria-hidden="true" /> : undefined}
            onClick={primaryAction.onClick}
            loading={primaryAction.loading}
            disabled={primaryAction.disabled}
            className="flex-1"
          />
        </StickyActionBar>
      )}
      {children}
    </div>
  );
}

/** Overview grid: wide left column and a narrow right column from 992px; one column below. */
export function OverviewGrid({ main, aside }: { main: ReactNode; aside: ReactNode }) {
  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
      <div className="grid min-w-0 content-start gap-4 md:gap-6 lg:col-span-2">{main}</div>
      <div className="grid min-w-0 content-start gap-4 md:gap-6">{aside}</div>
    </div>
  );
}

/** Two cards side by side from 992px (Offer & visa tab). */
export function TwoColumn({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:gap-6 lg:grid-cols-2">{children}</div>;
}
