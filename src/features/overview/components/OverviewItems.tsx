import { FileText } from "lucide-react";
import PeopleList, { PeopleListItem } from "components/ub/dashboard/lists/PeopleList";
import TaskList, { TaskListItem } from "components/ub/dashboard/lists/TaskList";
import Timeline from "components/ub/data/display/Timeline";
import { TextButton } from "components/ub/core/buttons/TextButton";
import type { OverviewItem } from "../model/types";

// People lists: advisors and registrations are always rows, never an avatar carousel.
const PEOPLE = new Set(["reviews", "advisors", "registrations"]);

/** The row's one verb + object button; it opens the item. Same words and style on every role. */
function RowAction({ item }: { item: OverviewItem }) {
  const label = item.actionLabel ?? "Open";
  return (
    <TextButton href={item.href} size="sm" aria-label={`${label}: ${item.title}`} className="[@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11">
      {label}
    </TextButton>
  );
}

/** Every home list in the shared row; activity in the dated timeline. */
export default function OverviewItems({
  resourceId,
  title,
  items,
}: {
  resourceId: string;
  title: string;
  items: OverviewItem[];
}) {
  if (resourceId === "updates") {
    return (
      <Timeline
        aria-label={title}
        grouped={false}
        events={items.map((item) => ({
          id: item.id,
          title: (
            <TextButton href={item.href} className="max-w-full text-start [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11">
              <span className="whitespace-normal break-words">{item.title}</span>
            </TextButton>
          ),
          description: item.description,
          at: item.at ?? "",
        }))}
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
            waitingDays={item.waitingDays}
            action={<RowAction item={item} />}
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
          waitingDays={item.waitingDays}
          action={<RowAction item={item} />}
        />
      ))}
    </TaskList>
  );
}
