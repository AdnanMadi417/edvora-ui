import { FileText } from "lucide-react";
import PeopleList, { PeopleListItem } from "components/ub/dashboard/lists/PeopleList";
import TaskList, { TaskListItem } from "components/ub/dashboard/lists/TaskList";
import ActivityFeed from "components/ub/dashboard/lists/ActivityFeed";
import { statusTone } from "config/statusTone";
import type { OverviewItem } from "../model/types";

// People lists: advisors and registrations are always rows, never an avatar carousel.
const PEOPLE = new Set(["reviews", "advisors", "advisorsAttention", "registrations", "amWorkload"]);

/** Every home list in the shared row; activity in the dated timeline. */
export default function OverviewItems({
  resourceId,
  title,
  items,
  viewer = "staff",
}: {
  resourceId: string;
  title: string;
  items: OverviewItem[];
  /** Whose home: amber marks what waits on this viewer. */
  viewer?: "advisor" | "staff";
}) {
  if (resourceId === "updates") {
    return (
      <ActivityFeed
        label={title}
        items={items.map((item) => ({ id: item.id, title: item.title, nextStep: item.description, at: item.at, href: item.href }))}
      />
    );
  }
  if (PEOPLE.has(resourceId)) {
    return (
      <PeopleList count={items.length} label={title}>
        {items.map((item) => (
          <PeopleListItem
            key={item.id}
            name={item.title}
            avatarSrc={item.avatar?.src}
            work={item.description}
            status={item.status}
            statusLabel={item.statusLabel}
            statusTone={item.status ? statusTone(item.status, viewer) : undefined}
            waitingDays={item.waitingDays}
            // The whole row opens the item; the verb is read first by screen readers.
            href={item.href}
            hrefLabel={item.actionLabel}
          />
        ))}
      </PeopleList>
    );
  }
  return (
    <TaskList count={items.length} label={title}>
      {items.map((item) => (
        <TaskListItem
          key={item.id}
          title={item.title}
          avatar={item.avatar}
          icon={item.avatar ? undefined : FileText}
          meta={item.description}
          status={item.status}
          statusLabel={item.statusLabel ?? item.status?.replace(/_/g, " ")}
          statusTone={item.status ? statusTone(item.status, viewer) : undefined}
          waitingDays={item.waitingDays}
          href={item.href}
          hrefLabel={item.actionLabel}
        />
      ))}
    </TaskList>
  );
}
