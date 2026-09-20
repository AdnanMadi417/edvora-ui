
import React, { type ReactNode } from "react";
import emptyPng from "/public/img/dashboards/message-icon.png";
import Image from "next/image";

interface EmptyDataProps {
  title?: string;
  subtitle?: string;
  /** Overrides the default message-bubble icon — that icon reads as a chat
   *  notification, which is wrong for the many non-chat empty states
   *  (programs, universities, payment methods, ...) that reuse this
   *  component under its original "no messages" name. Pass any icon
   *  element (e.g. a lucide-react icon) for a context that isn't chat. */
  icon?: ReactNode;
}

export default function EmptyData({ title = "No Messages Yet", subtitle = "You can contact us anytime if you have questions or need assistance.", icon }: EmptyDataProps) {
  return (
    <section>
      <div className="mt-5 p-10 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted">
            {icon ?? (
              <Image
                width={60}
                height={60}
                src={emptyPng}
                alt="No data"
                className="h-14 w-14 opacity-80"
              />
            )}
          </div>

          <p className="text-p2 font-medium text-slate-900">{title}</p>

          <p className="text-caption font-normal text-slate-600">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
