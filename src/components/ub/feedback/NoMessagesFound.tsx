import React, { type ReactNode } from "react";
import { MessageSquare } from "lucide-react";
import { emptyBody, emptyIconCircle, emptyTitle } from "components/ub/recipes";

interface EmptyDataProps {
  title?: string;
  subtitle?: string;
  /** Overrides the default message-bubble icon — that icon reads as a chat
   *  notification, which is wrong for the many non-chat empty states
   *  (programs, Institutions, payment methods, ...) that reuse this
   *  component under its original "no messages" name. Pass any icon
   *  element (e.g. a lucide-react icon) for a context that isn't chat. */
  icon?: ReactNode;
}

/** Empty state (brief §4.7): 32px icon in a 64px brand circle, heading-md title, one sentence. */
export default function EmptyData({
  title = "No messages yet",
  subtitle = "You can contact us anytime if you have questions or need assistance.",
  icon,
}: EmptyDataProps) {
  return (
    <section>
      <div className="mt-5 px-4 py-10 text-center md:px-6">
        <div className="flex flex-col items-center gap-4">
          <div className={`${emptyIconCircle} [&>svg]:h-8 [&>svg]:w-8`}>
            {icon ?? <MessageSquare className="h-8 w-8" aria-hidden="true" />}
          </div>

          <div className="space-y-1">
            <p className={emptyTitle}>{title}</p>
            <p className={`${emptyBody} mx-auto`}>{subtitle}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
