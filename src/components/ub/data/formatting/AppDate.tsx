"use client";

import React, { useMemo } from "react";
import type { AppDateProps } from "components/ub/data/formatting/appDateTypes";
import { parseDate, formatDate, toISOString } from "components/ub/data/formatting/appDateUtils";

/**
 * AppDate — universal date display component.
 *
 * Renders a semantically correct `<time>` element with a machine-readable
 * `datetime` attribute for accessibility and SEO, while displaying the date
 * in any of the five supported human-readable formats.
 *
 * @example
 * <AppDate value={user.created_at} format="short" />
 * <AppDate value={application.submitted_at} format="relative" />
 * <AppDate value={null} fallback="Not set" />
 */
const AppDate: React.FC<AppDateProps> = ({
  value,
  format  = "short",
  locale  = "en-GB",
  fallback = "—",
  className,
}) => {
  const parsed = useMemo(() => parseDate(value), [value]);
  const formatted = useMemo(
    () => (parsed ? formatDate(parsed, format, locale) : null),
    [parsed, format, locale],
  );

  // A dir attribute isolates the date from the surrounding text, so "14 Jun 2026"
  // keeps its order inside RTL pages; Arabic locales format right-to-left.
  const dir = /^(ar|fa|he|ur)\b/i.test(locale) ? "rtl" : "ltr";

  if (!parsed) {
    return <span className={className}>{fallback}</span>;
  }

  return (
    <time
      dir={dir}
      dateTime={toISOString(parsed)}
      className={className}
      title={new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(parsed)}
    >
      {formatted}
    </time>
  );
};

export default AppDate;
