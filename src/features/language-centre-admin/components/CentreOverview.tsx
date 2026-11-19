"use client";
import {
  BookOpen,
  Building2,
  CalendarDays,
  CircleAlert,
  Pencil,
} from "lucide-react";
import DashboardHeader from "components/ub/dashboard/shared/DashboardHeader";
import DashboardCard from "components/ub/dashboard/cards/DashboardCard";
import StatTile from "components/ub/dashboard/cards/StatTile";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import { useAssignedCentre } from "./CentreAccessBoundary";
const base = "/language-centre-admin";
export default function CentreOverview() {
  const { centre } = useAssignedCentre();
  const config = centre.configuration;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const intakes = config.courses
    .flatMap((course) =>
      course.intakes.map((intake) => ({ ...intake, courseName: course.name }))
    )
    .filter((intake) => intake.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const missing = [
    !config.description && "Centre description",
    !config.location && "Centre location",
    !config.email && "Contact email",
    !config.phone && "Contact phone",
    !centre.logo && "Centre logo",
    !centre.branches.length && "Branches",
    !config.courses.length && "Courses",
    !config.courses.some((course) => course.fees.length) && "Tuition fees",
  ].filter(Boolean) as string[];
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        title={config.name}
        subtitle="Manage your language centre, branches and courses."
        primaryAction={
          <LinkBtn
            href={`${base}/courses`}
            label="Manage courses"
            icon={<BookOpen className="h-4 w-4" />}
          />
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Courses"
          value={config.courses.length}
          icon={BookOpen}
        />
        <StatTile
          label="Branches"
          value={centre.branches.length}
          icon={Building2}
        />
        <StatTile
          label="Upcoming intakes"
          value={intakes.length}
          icon={CalendarDays}
        />
        <StatTile
          label="Missing profile information"
          value={missing.length}
          icon={CircleAlert}
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <DashboardCard
          title="Upcoming intakes"
          subtitle="Available course start dates"
        >
          {intakes.length ? (
            <ul className="divide-y divide-ub-border">
              {intakes.slice(0, 6).map((intake) => (
                <li
                  key={`${intake.courseName}-${intake.id}`}
                  className="flex flex-wrap justify-between gap-2 py-3 text-ub-body-sm"
                >
                  <span>{intake.courseName}</span>
                  <time dateTime={intake.date}>
                    {new Intl.DateTimeFormat("en-GB", {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(intake.date))}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ub-body-sm text-ub-text-secondary">
              No upcoming intakes. Add dates in Courses.
            </p>
          )}
        </DashboardCard>
        <DashboardCard
          title="Profile checklist"
          subtitle="Complete your centre's information"
        >
          {missing.length ? (
            <ul className="list-disc space-y-2 ps-5 text-ub-body-sm text-ub-text-secondary">
              {missing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-ub-body-sm text-ub-text-secondary">
              Your profile information is complete.
            </p>
          )}
        </DashboardCard>
        <DashboardCard title="Your courses">
          {config.courses.length ? (
            <ul className="divide-y divide-ub-border">
              {config.courses.map((course) => (
                <li
                  key={course.id}
                  className="flex flex-wrap justify-between gap-2 py-3 text-ub-body-sm"
                >
                  <span>{course.name}</span>
                  <span className="text-ub-text-secondary">
                    {course.levels.length} levels · {course.language}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ub-body-sm text-ub-text-secondary">
              No courses added yet.
            </p>
          )}
        </DashboardCard>
        <DashboardCard title="Quick actions">
          <div className="flex flex-wrap gap-3">
            <LinkBtn
              href={`${base}/centre-profile`}
              label="Update centre profile"
              icon={<Pencil className="h-4 w-4" />}
            />
            <LinkBtn
              href={`${base}/branches`}
              label="Manage branches"
              icon={<Building2 className="h-4 w-4" />}
            />
            <LinkBtn
              href={`${base}/courses`}
              label="Update courses and fees"
              icon={<BookOpen className="h-4 w-4" />}
            />
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
