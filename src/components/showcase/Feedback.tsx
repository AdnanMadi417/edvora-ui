"use client";

import { useState } from "react";
import { Bell, GraduationCap, Search } from "lucide-react";
import Button from "components/ub/core/Button";
import Loading from "components/ub/feedback/Loading";
import Skeleton from "components/ub/feedback/Skeleton";
import AsyncStateView from "components/ub/feedback/AsyncStateView";
import type { AsyncStatus } from "components/ub/feedback/AsyncStatus";
import EmptyData from "components/ub/feedback/EmptyData";
import EmptyTableData from "components/ub/feedback/EmptyTableData";
import NoDocumentsRequired from "components/ub/feedback/NoDocumentsRequired";
import NoMessagesFound from "components/ub/feedback/NoMessagesFound";
import Tooltip from "components/ub/feedback/Tooltip";
import { useToast } from "components/ub/feedback/ToastContext";
import { Demo, ShowcaseSection, StateSwitch, Variant } from "./Showcase";

const ASYNC_STATES = ["loading", "success", "empty", "error"] as const;

export default function Feedback() {
  const { showToast } = useToast();
  const [status, setStatus] = useState<AsyncStatus>("success");

  return (
    <ShowcaseSection id="feedback" title="Feedback" description="Toasts, loaders, skeletons, async states, empty states and tooltips.">
      <Demo name="Toast" path="components/ub/feedback/ToastContext.tsx" description="useToast().showToast(message, type) inside a ToastProvider." className="flex flex-wrap gap-3">
        <Button text="Success toast" onClick={() => showToast("Application submitted. The Institution has been notified.", "success")} />
        <Button text="Error toast" onClick={() => showToast("This file is over 10 MB. Upload a PDF under 10 MB.", "error")} />
        <Button text="Info toast" onClick={() => showToast("Offer letter received from Sunway University.", "info")} />
      </Demo>

      <Demo name="Loading" path="components/ub/feedback/Loading.tsx" className="grid gap-6 sm:grid-cols-2">
        <Variant label="Default">
          <div className="relative h-40 overflow-hidden rounded-ub-md border border-ub-border">
            <Loading />
          </div>
        </Variant>
        <Variant label="With text">
          <div className="relative h-40 overflow-hidden rounded-ub-md border border-ub-border">
            <Loading text="Loading applications…" size={32} />
          </div>
        </Variant>
      </Demo>

      <Demo name="Skeleton" path="components/ub/feedback/Skeleton.tsx">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </Demo>

      <Demo name="AsyncStateView" path="components/ub/feedback/AsyncStateView.tsx" description="One wrapper for loading / error / empty / success.">
        <StateSwitch<AsyncStatus> value={status} options={ASYNC_STATES} onChange={setStatus} />
        <AsyncStateView
          status={status}
          skeleton={
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          }
          errorMessage="We couldn't load programs. Check your connection and try again."
          onRetry={() => setStatus("loading")}
          emptyTitle="No programs yet"
          emptySubtitle="Add your first program to start matching students."
          emptyIcon={GraduationCap}
        >
          <ul className="space-y-1 text-ub-body-sm text-ub-text-primary">
            <li>Bachelor of Computer Science (Hons) · Sunway University</li>
            <li>Master of Data Science · Taylor&apos;s University</li>
            <li>Diploma in Information Technology · UCSI University</li>
          </ul>
        </AsyncStateView>
      </Demo>

      <Demo name="Empty states" path="components/ub/feedback/" className="grid gap-6 lg:grid-cols-2">
        <Variant label="EmptyData">
          <EmptyData title="No notifications" subtitle="You're all caught up." icon={Bell} />
        </Variant>
        <Variant label="EmptyTableData">
          <EmptyTableData title="No applications found" subtitle="Try clearing a filter or searching another name." icon={<Search className="h-6 w-6" />} />
        </Variant>
        <Variant label="NoDocumentsRequired">
          <NoDocumentsRequired title="No documents required" subtitle="This stage doesn't need any uploads." />
        </Variant>
        <Variant label="NoMessagesFound">
          <NoMessagesFound />
        </Variant>
      </Demo>

      <Demo name="Tooltip" path="components/ub/feedback/Tooltip.tsx" className="flex flex-wrap items-center justify-center gap-10 py-10">
        {(["top", "bottom", "left", "right"] as const).map((p) => (
          <Tooltip key={p} content={`Tooltip on the ${p}`} position={p}>
            <span tabIndex={0} className="inline-flex h-9 items-center rounded-ub-full border border-ub-border px-4 text-ub-label-md text-ub-text-primary">
              Hover: {p}
            </span>
          </Tooltip>
        ))}
      </Demo>
    </ShowcaseSection>
  );
}
