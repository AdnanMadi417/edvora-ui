"use client";
import { ArrowLeft, Landmark, Pencil } from "lucide-react";
import { useBank } from "../hooks";
import SectionCard from "components/ub/data/cards/SectionCard";
import DescriptionList from "components/ub/data/display/DescriptionList";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Tag from "components/ub/data/badges/Tag";
import Loading from "components/ub/feedback/states/Loading";
import { getCountryName } from "constants/lists";
export default function BankDetails({
  id,
  basePath = "/admin/advisors/banks",
}: {
  id: string;
  basePath?: string;
}) {
  const { bank, loading, error, refetch } = useBank(id);
  if (loading) return <Loading text="Loading bank details..." />;
  if (error)
    return (
      <SectionCard
        title="Bank details"
        state="error"
        errorMessage={error}
        onRetry={refetch}
      />
    );
  if (!bank)
    return (
      <SectionCard
        title="Bank details"
        state="empty"
        empty={{
          title: "Bank not found",
          description:
            "Return to the bank reference list to choose another bank.",
        }}
        action={
          <LinkBtn
            href={basePath}
            title="Back to banks"
            variant="tertiary"
            icon={<ArrowLeft className="h-4 w-4" />}
          />
        }
      />
    );
  return (
    <article className="mt-6 min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header className="flex flex-col gap-4 border-b border-ub-border p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-ub-lg border border-ub-border bg-ub-tone-brand-bg text-ub-tone-brand-text">
            <Landmark className="h-7 w-7" />
          </span>
          <div className="min-w-0 space-y-2">
            <p className="text-ub-caption font-medium uppercase tracking-wider text-ub-text-tertiary">
              Bank reference
            </p>
            <h1 className="break-words text-ub-heading-lg">{bank.name}</h1>
            <p className="text-ub-body-sm text-ub-text-secondary">
              {getCountryName(bank.country)} · {bank.code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <LinkBtn
            href={basePath}
            title="Back to banks"
            variant="tertiary"
            icon={<ArrowLeft className="h-4 w-4" />}
          />
          <LinkBtn
            href={`${basePath}/${id}/edit`}
            title="Edit bank"
            variant="secondary"
            icon={<Pencil className="h-4 w-4" />}
          />
        </div>
      </header>
      <div className="grid gap-4 bg-ub-surface-subtle p-3 sm:gap-6 sm:p-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <SectionCard
          title="Bank details"
          as="h2"
          description="Official identifiers used for adviser payout accounts."
        >
          <DescriptionList
            columns={2}
            divided
            items={[
              { label: "Bank name", value: bank.name },
              {
                label: "Country",
                value: `${getCountryName(bank.country)} (${bank.country})`,
              },
              { label: "Bank code", value: bank.code },
              { label: "SWIFT code", value: bank.swift_code },
            ]}
            fallback="Not provided"
          />
        </SectionCard>
        <SectionCard title="Availability" as="h2">
          <div className="space-y-4">
            <Tag hue={bank.is_active ? "teal" : "grey"}>
              {bank.is_active ? "Active" : "Inactive"}
            </Tag>
            <p className="text-ub-body-sm text-ub-text-secondary">
              {bank.is_active
                ? "This bank is available in the bank picker on adviser account forms."
                : "This bank is hidden from new selections. Existing account records retain their bank reference."}
            </p>
          </div>
        </SectionCard>
      </div>
    </article>
  );
}
