"use client";

import { useState } from "react";
import { ArrowRight, Lock, Truck } from "lucide-react";
import { useLogisticProviders } from "features/logistical-service/hooks";
import LogisticsProviderCard from "components/ub/data/cards/LogisticsProviderCard";
import SectionCard from "components/ub/data/cards/SectionCard";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import TablePagination from "components/ub/data/tables/TablePagination";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Skeleton from "components/ub/feedback/states/Skeleton";

const ITEMS_PER_PAGE = 9;
export default function LogisticsMarketplace({
  locked = false,
  visaProcessingCount = 0,
  basePath = "/partner",
}: {
  locked?: boolean;
  visaProcessingCount?: number;
  basePath?: string;
}) {
  const { serviceProviders, loading, error, refetch } = useLogisticProviders();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const matching = locked
    ? serviceProviders
    : serviceProviders.filter((provider) =>
        `${provider.name} ${provider.nationality} ${
          provider.main_location
        } ${provider.services_offered
          ?.map((service) => service.name)
          .join(" ")}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(matching.length / ITEMS_PER_PAGE))
  );
  const rows = matching.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  return (
    <div className="mt-6 min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header className="border-b border-ub-border p-4 sm:p-6">
        <p className="text-ub-body-sm text-ub-text-secondary">
          Explore airport transfers, accommodation support, and local services.
          Compare providers and connect directly.
        </p>
      </header>
      {locked && (
        <SectionCard
          className="m-3 sm:m-6"
          title="Unlock Logistics Marketplace"
          as="h2"
          description="Available once at least one student reaches Visa Processing or a later stage."
          action={<Lock className="h-5 w-5 shrink-0 text-ub-text-secondary" />}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-ub-body-sm text-ub-text-secondary">
              <span className="font-medium text-ub-text-primary">
                {visaProcessingCount}{" "}
                {visaProcessingCount === 1 ? "student" : "students"}
              </span>{" "}
              currently at Visa Processing or later.
            </p>
            <LinkBtn
              href={`${basePath}/applications`}
              label="View applications"
              variant="secondary"
              icon={<ArrowRight className="h-4 w-4" />}
            />
          </div>
        </SectionCard>
      )}
      {!locked && (
        <div className="border-b border-ub-border p-4 sm:p-6">
          <DataTableToolbar
            className="!mb-0"
            search={{
              value: search,
              onChange: (value) => {
                setSearch(value);
                setPage(1);
              },
              placeholder: "Search providers, locations, or services...",
            }}
            actions={
              <p
                role="status"
                className="whitespace-nowrap text-ub-label-sm text-ub-text-secondary"
              >
                {loading
                  ? "Loading providers…"
                  : `${matching.length} providers`}
              </p>
            }
          />
        </div>
      )}
      {loading ? (
        <div
          role="status"
          aria-label="Loading providers"
          className="grid gap-4 p-3 sm:p-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="space-y-5 rounded-ub-xl border border-ub-border bg-ub-surface p-5"
            >
              <Skeleton className="h-14 w-14 rounded-ub-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <SectionCard
          className="m-3 sm:m-6"
          title="Provider listings"
          state="error"
          errorMessage={error}
          onRetry={refetch}
        />
      ) : !rows.length ? (
        <SectionCard
          className="m-3 sm:m-6"
          title="Provider listings"
          state="empty"
          empty={{
            icon: Truck,
            title: "No providers found",
            description: search
              ? "Try another provider, location, or service."
              : "No logistics providers are currently available.",
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 p-3 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((provider) => (
              <LogisticsProviderCard
                key={provider.id}
                provider={provider}
                href={`${basePath}/logistics-marketplace/${provider.id}`}
                locked={locked}
              />
            ))}
          </div>
          <div className="bg-ub-surface">
            <TablePagination
              currentPage={currentPage}
              onPageChange={setPage}
              itemsPerPage={ITEMS_PER_PAGE}
              itemCount={rows.length}
              totalCount={matching.length}
              itemLabel="providers"
            />
          </div>
        </>
      )}
    </div>
  );
}
