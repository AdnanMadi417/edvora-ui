import { ClipboardCheck, FileText, Wallet } from "lucide-react";
import StatusTag from "components/ub/dashboard/shared/StatusTag";
import PeopleList, {
  PeopleListItem,
} from "components/ub/dashboard/lists/PeopleList";
import TaskList, { TaskListItem } from "components/ub/dashboard/lists/TaskList";
import CardLinkButton from "components/ub/dashboard/cards/CardLinkButton";
import Timeline from "components/ub/data/display/Timeline";
import AppDate from "components/ub/data/formatting/AppDate";
import { TextButton } from "components/ub/core/buttons/TextButton";
import type { OverviewItem } from "../model/types";

/** Match each resource to the existing design system's specialized list. */
export default function OverviewItems({
  resourceId,
  title,
  items,
}: {
  resourceId: string;
  title: string;
  items: OverviewItem[];
}) {
  if (["reviews", "advisors", "registrations"].includes(resourceId)) {
    return (
      <PeopleList count={items.length} label={title}>
        {items.map((item) => (
          <PeopleListItem
            key={item.id}
            name={item.title}
            work={resourceId === "registrations" ? (
              <span>
                {item.description}
                {item.at && Number.isFinite(Date.parse(item.at)) && (
                  <span className="mt-1 block"><AppDate value={item.at} /></span>
                )}
              </span>
            ) : item.description}
            action={
              <CardLinkButton
                href={item.href}
                label={`Open ${resourceId === "registrations" ? "registration" : "advisor"}: ${item.title}`}
              />
            }
          />
        ))}
      </PeopleList>
    );
  }
  if (resourceId === "updates") {
    return (
      <Timeline
        aria-label={title}
        grouped={false}
        events={items.map((item) => ({
          id: item.id,
          title: (
            <TextButton href={item.href} className="max-w-full text-start">
              <span className="whitespace-normal break-words">
                {item.title}
              </span>
            </TextButton>
          ),
          description: item.description,
          at: item.at ?? "",
        }))}
      />
    );
  }
  return (
    <TaskList count={items.length} label={title}>
      {items.map((item) => (
        <TaskListItem
          key={item.id}
          icon={
            resourceId === "active"
              ? ClipboardCheck
              : resourceId === "commission"
              ? Wallet
              : FileText
          }
          title={
            <TextButton href={item.href} className="max-w-full text-start">
              <span className="whitespace-normal break-words">
                {item.title}
              </span>
            </TextButton>
          }
          meta={
            <span className="block whitespace-normal break-words">
              {item.description}
              {item.status && (
                <span className="mt-2 block">
                  <StatusTag
                    status={item.status}
                    label={item.statusLabel ?? item.status.replace(/_/g, " ")}
                  />
                </span>
              )}
              {item.at && Number.isFinite(Date.parse(item.at)) && (
                <span className="mt-1 block">
                  <AppDate value={item.at} />
                </span>
              )}
            </span>
          }
        />
      ))}
    </TaskList>
  );
}
