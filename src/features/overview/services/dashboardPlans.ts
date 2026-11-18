import Cookies from "js-cookie";
import api from "lib/useApi";
import { isAdvisorAction, stageCodeOf } from "features/applications/stages";
import { isStuck } from "config/sla";
import { programApi } from "features/programs/services/programApi";
import { universityApi } from "features/universities/services/universityApi";
import { languageCentersApi } from "features/universities/language-centers/api";
import { commissionsApi } from "features/applications/payouts/services/commissionsApi";
import { accountManagersApi } from "features/account-managers/services/accountManagersApi";
import { logisticServiceApi } from "features/logistical-service/services";
import { statementApi } from "features/partners/statement/services/statementApi";
import {
  byOldest,
  completeCollection,
  daysSince,
  groupUniversityCommission,
} from "../model/dashboardData";
import type {
  OverviewContext,
  OverviewItem,
  ResourcePlan,
} from "../model/types";
import { nextActionLabel, statusLabel } from "config/statusLabels";
const staffActions = new Set([
  "new_application",
  "payment_submitted",
  "eval_under_review",
  "e-visa_under_review",
  "visa_documents_under_review",
  "arrival_confirmed",
  "extra_arrival_documents_under_review",
  "issue_response_received",
  "commission_disputed",
]);
const normalize = (text = "") => text.toLowerCase().trim().replace(/\s+/g, "_");
export function createDashboardPlans(context: OverviewContext): ResourcePlan[] {
  const plans: ResourcePlan[] = [];
  const base = `/${context.role.replace(/_/g, "-")}`;
  if (
    ["admin", "account_manager", "partner"].includes(context.role) &&
    (context.role !== "partner" || context.partnerId)
  ) {
    const endpoint =
      context.role === "admin"
        ? "/admin/applications"
        : context.role === "account_manager"
        ? "/account-managers/applications"
        : `/partners/${encodeURIComponent(context.partnerId!)}/applications`;
    // One request feeds every list built from active applications (action needed,
    // waiting on Advisors, stuck), so they always agree. Reused for a few seconds per refresh.
    let shared: { at: number; rows: Promise<any[]> } | null = null;
    const activeRows = () => {
      if (!shared || Date.now() - shared.at > 5_000)
        shared = {
          at: Date.now(),
          rows: completeCollection((page) =>
            api.get(endpoint, {
              headers: Cookies.get("token") ? { Authorization: `Bearer ${Cookies.get("token")}` } : {},
              params: {
                status: "active",
                limit: 100,
                offset: (page - 1) * 100,
                ...(context.role === "partner" && context.agencyAdmin ? { include_members: true } : {}),
              },
            })
          ),
        };
      return shared.rows;
    };
    // One row per application: student, University · Advisor (staff), status, days waiting.
    const appItem = (item: any, actionLabel: string): OverviewItem => ({
      id: item.id,
      title: item.student_name || "Student",
      description: [item.university_name, context.role === "partner" ? null : item.partner_name].filter(Boolean).join(" · "),
      href: `${base}/applications/${encodeURIComponent(item.id)}`,
      status: item.status,
      statusLabel: statusLabel(item.status),
      avatar: { name: item.student_name || "Student", src: item.student_photo_file_url },
      waitingDays: daysSince(item.updated_at),
      actionLabel,
    });
    plans.push({
      id: "actionRequired",
      title:
        context.role === "partner"
          ? "Your next steps"
          : context.role === "account_manager"
          ? "Follow-ups requiring action"
          : "Applications requiring action",
      subtitle:
        context.role === "partner"
          ? "Documents, payments and corrections waiting for you."
          : context.role === "account_manager"
          ? "Actionable applications from your assigned and shared advisors."
          : "Applications ready for your team’s next step.",
      href: `${base}/applications`,
      emptyMessage:
        "You’re caught up. No applications currently require your action.",
      load: async () => {
        const rows = await activeRows();
        const actionable = rows.filter((item) =>
          context.role === "partner"
            ? isAdvisorAction(item.status) &&
              (context.canViewCommission ||
                normalize(item.status) !== "commission_ready")
            : staffActions.has(normalize(item.status))
        );
        // Every active application per university, for the home split (same scope as the pipeline).
        const perUniversity = new Map<string, number>();
        for (const row of rows) {
          const name = row.university_name?.trim() || "University unavailable";
          perUniversity.set(name, (perUniversity.get(name) ?? 0) + 1);
        }
        return {
          total: actionable.length,
          byUniversity: [...perUniversity].map(([label, value]) => ({ key: label, label, value })),
          items: actionable
            .map((item) => appItem(item, nextActionLabel(item.status)))
            // Every item: the home list expands in place (the API has no "needs action" filter).
            .sort(byOldest),
        };
      },
    });
    if (context.role === "account_manager")
      plans.push({
        id: "waitingOnAdvisors",
        title: "Waiting on Advisors",
        subtitle: "Applications where the Advisor has the next step.",
        href: `${base}/applications`,
        emptyMessage: "No application is waiting on an Advisor.",
        load: async () => {
          const rows = (await activeRows()).filter((item) => isAdvisorAction(item.status));
          return { total: rows.length, items: rows.map((item) => appItem(item, "Follow up")).sort(byOldest) };
        },
      });
    if (context.role === "admin")
      plans.push({
        id: "stuck",
        title: "Stuck applications",
        subtitle: "No update for longer than the stage allows.",
        href: `${base}/applications`,
        emptyMessage: "Nothing is stuck. Every application moved within its stage's time limit.",
        load: async () => {
          const rows = (await activeRows()).filter((item) =>
            isStuck(stageCodeOf({ name: typeof item.stage === "string" ? item.stage : item.stage?.name, code: item.stage?.code }), daysSince(item.updated_at))
          );
          return { total: rows.length, items: rows.map((item) => appItem(item, "Open application")).sort(byOldest) };
        },
      });
  }
  if (
    context.role === "admin" ||
    (context.role === "partner" &&
      context.partnerId &&
      context.canViewCommission)
  ) {
    plans.push({
      id: "universityCommission",
      title: "Commission by university",
      subtitle:
        "University processing, ready for payout and settled commissions. Currencies stay separate.",
      href:
        context.role === "admin"
          ? "/admin/finance-queue"
          : "/partner/commission-tracker",
      emptyMessage:
        "University commission will appear when applications reach the commission stage.",
      load: async () => {
        const admin = context.role === "admin";
        const [rows, universities] = await Promise.all([
          completeCollection((page) =>
            admin
              ? commissionsApi.list({ page, page_size: 100 })
              : statementApi.list({ page, page_size: 100 })
          ),
          completeCollection((page) =>
            universityApi.universities.list({
              page,
              page_size: 100,
              ...(admin
                ? { include_inactive_universities: true }
                : { is_hidden: false }),
            })
          ).catch(() => []),
        ]);
        return {
          total: rows.length,
          items: [],
          universityCommission: groupUniversityCommission(rows, admin),
          universities: universities.map((item) => ({
            id: item.id,
            name: item.name,
            logo_file_key: item.logo_file_key,
          })),
        };
      },
    });
  }
  if (context.role === "data_entry") {
    // One scan of every program (visible and hidden) feeds records to complete and intakes not set.
    let scan: { at: number; rows: Promise<any[]> } | null = null;
    const allPrograms = () => {
      if (!scan || Date.now() - scan.at > 5_000)
        scan = {
          at: Date.now(),
          rows: Promise.all(
            [false, true].map((is_hidden) =>
              completeCollection((page) =>
                programApi.programs.list({ page, page_size: 100, is_hidden, include_inactive_universities: true })
              )
            )
          ).then((lists) => [...new Map(lists.flat().map((item) => [item.id, item])).values()]),
        };
      return scan.rows;
    };
    plans.push({
      id: "catalogueQuality",
      title: "Catalogue records to complete",
      subtitle:
        "Checks required program fields and delivery mode. Optional information is not flagged.",
      href: `${base}/knowledge-hub`,
      emptyMessage: "All programs pass the required-field checks.",
      load: async () => {
        const rows = await allPrograms();
        const checks = rows
          .map((item) => ({
            item,
            missing: [
              !item.name?.trim() ? "program name" : "",
              !item.university?.id ? "university" : "",
              !(item.qualification_id || item.qualification_level)
                ? "qualification"
                : "",
              !(item.field_of_study_id || item.field_of_study?.id)
                ? "field of study"
                : "",
              !(item.is_on_campus || item.is_online) ? "delivery mode" : "",
            ].filter(Boolean),
          }))
          .filter((row) => row.missing.length);
        return {
          total: checks.length,
          items: checks.map(({ item, missing }) => ({
            id: item.id,
            title: item.name || "Unnamed program",
            // What's missing, as a short list, not a sentence.
            description: `Missing ${missing.join(", ")}`,
            href: `${base}/knowledge-hub/${encodeURIComponent(item.id)}/edit`,
            actionLabel: "Complete record",
          })),
        };
      },
    });
    plans.push({
      id: "intakesNotSet",
      title: "Intakes not set",
      subtitle: "Programs with no intake months, so Advisors can't plan a start.",
      href: `${base}/knowledge-hub`,
      emptyMessage: "Every program has its intake months.",
      load: async () => {
        const rows = (await allPrograms()).filter((item) => !item.intake_months?.length);
        return {
          total: rows.length,
          items: rows.map((item) => ({
            id: item.id,
            title: item.name || "Unnamed program",
            description: [item.university?.name, item.branch?.name].filter(Boolean).join(" · "),
            href: `${base}/knowledge-hub/${encodeURIComponent(item.id)}/edit`,
            actionLabel: "Set intakes",
          })),
        };
      },
    });
    plans.push({
      id: "providerIssues",
      title: "Provider issues",
      subtitle: "Logistics providers missing a photo, location, services or WhatsApp.",
      href: `${base}/logistics-marketplace`,
      emptyMessage: "Every logistics provider has its details.",
      load: async () => {
        const { data } = await logisticServiceApi.providers.list();
        const rows = (Array.isArray(data) ? data : []).map((p) => ({
          p,
          missing: [
            !(p.picture_file_key || p.picture_file_url) ? "photo" : "",
            !p.main_location ? "location" : "",
            !p.services_offered?.length ? "services" : "",
            !p.whatsapp ? "WhatsApp" : "",
          ].filter(Boolean),
        })).filter((r) => r.missing.length);
        return {
          total: rows.length,
          items: rows.map(({ p, missing }) => ({
            id: p.id,
            title: p.name,
            description: `Missing ${missing.join(", ")}`,
            href: `${base}/logistics-marketplace/${encodeURIComponent(p.id)}/edit`,
            avatar: { name: p.name, src: p.picture_file_url || null },
            actionLabel: "Complete details",
          })),
        };
      },
    });
    plans.push({
      id: "languageCenters",
      title: "Language centers",
      subtitle: "Centers available in the university catalogue.",
      href: `${base}/language-centers`,
      emptyMessage: "No language centers yet.",
      load: async () => {
        const { data } = await languageCentersApi.list();
        return {
          total: data.items.length,
          items: data.items.slice(0, 6).map((item) => ({
            id: item.id,
            title: item.name,
            description: item.location,
            href: `${base}/language-centers/${encodeURIComponent(item.id)}`,
            actionLabel: "Open center",
          })),
        };
      },
    });
  }
  if (context.role === "admin") {
    plans.push({
      id: "disputes",
      title: "Open disputes",
      subtitle: "Commissions an Advisor disputed. Unibexs finance resolves them.",
      href: "/admin/finance-queue",
      emptyMessage: "No open disputes.",
      load: async () => {
        const rows = await completeCollection((page) => commissionsApi.list({ waiting_on: "disputed", page, page_size: 100 }));
        return {
          total: rows.length,
          items: rows
            .map((item) => ({
              id: item.application_commission_id,
              title: item.student_name,
              description: [item.university_name, item.partner_name].filter(Boolean).join(" · "),
              href: `/admin/applications/${encodeURIComponent(item.application_id)}`,
              status: "Disputed",
              statusLabel: "Disputed",
              avatar: { name: item.student_name },
              waitingDays: typeof item.days_waiting === "number" ? item.days_waiting : undefined,
              actionLabel: "Resolve dispute",
            }))
            .sort(byOldest),
        };
      },
    });
    plans.push({
      id: "amWorkload",
      title: "Account manager workload",
      subtitle: "Advisors each account manager looks after.",
      href: "/admin/account-managers",
      emptyMessage: "No account managers yet.",
      load: async () => {
        const { data } = await accountManagersApi.list({ page: 1, page_size: 100 });
        const items = (data.items ?? [])
          .map((m) => {
            const assigned = Number(m.assigned_partners_count) || 0;
            const shared = m.shared_partners_count ?? 0;
            return {
              id: m.id,
              title: m.name,
              description: `${assigned} assigned${shared ? ` · ${shared} shared` : ""}`,
              href: `/admin/account-managers/profile/${encodeURIComponent(m.id)}`,
              avatar: { name: m.name },
              status: m.is_active === false ? "Inactive" : undefined,
              actionLabel: "Open manager",
              load: assigned + shared,
            };
          })
          // Busiest first.
          .sort((a, b) => b.load - a.load)
          .map(({ load: _load, ...item }) => item);
        return { total: data.total ?? items.length, items };
      },
    });
  }
  return plans;
}
