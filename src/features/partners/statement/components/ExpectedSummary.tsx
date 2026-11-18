"use client";
import { Hourglass, RotateCw } from "lucide-react";
import Button from "components/ub/core/buttons/Button";
import Skeleton from "components/ub/feedback/states/Skeleton";
import { formatCurrency } from "lib/format";
import type { CurrencyTotal } from "../utils/expected";

export interface ExpectedSummaryProps {
  totals: CurrencyTotal[];
  /** Applications before the commission stage. */
  count: number;
  /** The application list is still loading. */
  loading: boolean;
  error: string | null;
  /** Amounts still loading / that failed to load. */
  pending: number;
  failed: number;
  onRetry: () => void;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Commission still to come, one total per currency (never added across currencies). */
export default function ExpectedSummary({
  totals,
  count,
  loading,
  error,
  pending,
  failed,
  onRetry,
}: ExpectedSummaryProps) {
  const loaded = count - pending - failed;
  return (
    <section
      aria-labelledby="expected-commission-heading"
      aria-busy={loading || pending > 0}
      className="rounded-ub-lg border border-ub-border bg-ub-surface-subtle p-4"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-ub-md bg-ub-tone-brand-bg text-ub-tone-brand-text">
          <Hourglass className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="expected-commission-heading" className="text-ub-label-md text-ub-text-primary">
            Expected commission
          </h2>
          <p className="mt-1 text-ub-body-sm text-ub-text-secondary">
            {loading
              ? "Finding your applications in progress…"
              : error
              ? "Your expected commission couldn't load."
              : count === 0
              ? "No commission expected yet. Applications in progress will show here before they reach the commission stage."
              : `From ${plural(count, "application")} in progress that haven't reached the commission stage yet.`}
          </p>

          {loading ? (
            <div className="mt-3 flex flex-wrap gap-6">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-7 w-24" />
            </div>
          ) : (
            !error &&
            count > 0 && (
              <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
                {totals.map((total) => (
                  <div key={total.currency}>
                    <dt className="sr-only">Expected in {total.currency}</dt>
                    <dd className="text-ub-heading-lg text-ub-text-primary ub-tabular">
                      {formatCurrency(total.amount, { currency: total.currency })}
                    </dd>
                    <dd className="text-ub-caption text-ub-text-tertiary">
                      {plural(total.count, "application")}
                    </dd>
                  </div>
                ))}
                {pending > 0 && (
                  <div aria-hidden="true">
                    <Skeleton className="h-7 w-28" />
                    <Skeleton className="mt-1 h-3 w-16" />
                  </div>
                )}
              </dl>
            )
          )}

          {!loading && !error && pending > 0 && (
            <p role="status" className="mt-2 text-ub-caption text-ub-text-secondary">
              Adding up {loaded} of {plural(count, "application")}…
            </p>
          )}
          {!loading && (error || (failed > 0 && pending === 0)) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p role="alert" className="text-ub-caption text-ub-text-secondary">
                {error
                  ? error
                  : `${plural(failed, "application")} couldn't load, so ${failed === 1 ? "it isn't" : "they aren't"} in the totals.`}
              </p>
              <Button
                variant="tertiary"
                size="sm"
                text="Try again"
                icon={<RotateCw className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={onRetry}
              />
            </div>
          )}
          {!loading && !error && count > 0 && (
            <p className="mt-2 text-ub-caption text-ub-text-tertiary">
              Based on the commission agreed for each program. Unibexs confirms the final amount at the commission stage.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
