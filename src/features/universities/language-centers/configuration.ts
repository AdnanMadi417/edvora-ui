import { z } from "zod";

const text = z.string();
const required = text.trim().min(1, "This field is required.");
const url = text.refine(
  (value) =>
    !value ||
    (/^https?:\/\//i.test(value) &&
      (() => {
        try {
          return !!new URL(value).hostname;
        } catch {
          return false;
        }
      })()),
  "Enter a full http or https URL."
);
const positive = text.refine(
  (value) =>
    value === "" || (Number.isFinite(Number(value)) && Number(value) > 0),
  "Enter a number greater than zero."
);
const amount = required.refine(
  (value) => Number.isFinite(Number(value)) && Number(value) >= 0,
  "Enter a valid amount of zero or more."
);
const currency = required
  .regex(/^[A-Z]{3}$/, "Use a three-letter currency code, such as MYR.")
  .refine((value) => {
    try {
      new Intl.NumberFormat("en", { style: "currency", currency: value });
      return true;
    } catch {
      return false;
    }
  }, "Enter a valid currency code.");
const price = z.object({ amount, currency });
export const levelSchema = z.object({
  id: required,
  name: required,
  order: required.refine(
    (v) => Number.isInteger(Number(v)) && Number(v) > 0,
    "Enter a positive whole number."
  ),
  duration: required,
  learningHours: positive,
});
export const feeSchema = price.extend({
  id: required,
  basis: z.enum(["level", "month", "course"]),
  levelId: text,
});
export const packageSchema = price.extend({
  id: required,
  name: required,
  duration: text,
  services: text,
});
export const chargeSchema = price.extend({
  id: required,
  kind: z.enum([
    "Visa",
    "Insurance",
    "Accommodation",
    "Refundable deposit",
    "Other",
  ]),
  description: text,
  refundable: z.boolean(),
});
export const courseSchema = z
  .object({
    id: required,
    name: required,
    language: required,
    studyMode: text,
    entryRequirements: text,
    placementTest: text,
    levels: z.array(levelSchema),
    intakes: z.array(
      z.object({
        id: required,
        date: required.refine(
          (v) =>
            /^\d{4}-\d{2}-\d{2}$/.test(v) &&
            !Number.isNaN(Date.parse(v)) &&
            new Date(v).toISOString().slice(0, 10) === v,
          "Enter a valid start date."
        ),
      })
    ),
    fees: z.array(feeSchema),
    packages: z.array(packageSchema),
    charges: z.array(chargeSchema),
  })
  .superRefine((course, ctx) => {
    const orders = new Set<string>();
    course.levels.forEach((level, i) => {
      const order = String(Number(level.order));
      if (orders.has(order))
        ctx.addIssue({
          code: "custom",
          path: ["levels", i, "order"],
          message: "Each level must have a unique order.",
        });
      orders.add(order);
    });
    course.fees.forEach((fee, i) => {
      if (
        fee.basis === "level" &&
        !course.levels.some((level) => level.id === fee.levelId)
      )
        ctx.addIssue({
          code: "custom",
          path: ["fees", i, "levelId"],
          message: "Choose a level for this fee.",
        });
    });
  });
export const configurationSchema = z
  .object({
    enabled: z.boolean(),
    name: text,
    description: text,
    location: text,
    website: url,
    email: text.refine(
      (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Enter a valid email address."
    ),
    phone: text,
    courses: z.array(courseSchema),
    sources: z.array(
      z.object({
        id: required,
        label: required,
        url: url.refine((v) => !!v, "Enter the official source URL."),
      })
    ),
    brochure: z
      .object({
        name: required,
        dataUrl: text.startsWith("data:application/pdf;base64,"),
      })
      .nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.enabled && !value.name.trim())
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message: "Enter the language centre name.",
      });
  });
export interface CentrePrice {
  amount: string;
  currency: string;
}
export interface CentreLevel {
  id: string;
  name: string;
  order: string;
  duration: string;
  learningHours: string;
}
export interface CentreFee extends CentrePrice {
  id: string;
  basis: "level" | "month" | "course";
  levelId: string;
}
export interface CentrePackage extends CentrePrice {
  id: string;
  name: string;
  duration: string;
  services: string;
}
export interface CentreCharge extends CentrePrice {
  id: string;
  kind: "Visa" | "Insurance" | "Accommodation" | "Refundable deposit" | "Other";
  description: string;
  refundable: boolean;
}
export interface CentreCourse {
  id: string;
  name: string;
  language: string;
  studyMode: string;
  entryRequirements: string;
  placementTest: string;
  levels: CentreLevel[];
  intakes: { id: string; date: string }[];
  fees: CentreFee[];
  packages: CentrePackage[];
  charges: CentreCharge[];
}
export interface CentreConfiguration {
  enabled: boolean;
  name: string;
  description: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  courses: CentreCourse[];
  sources: { id: string; label: string; url: string }[];
  brochure: { name: string; dataUrl: string } | null;
}
export const newId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const emptyConfiguration = (): CentreConfiguration => ({
  enabled: false,
  name: "",
  description: "",
  location: "",
  website: "",
  email: "",
  phone: "",
  courses: [],
  sources: [],
  brochure: null,
});
export const emptyCourse = (): CentreCourse => ({
  id: newId(),
  name: "",
  language: "",
  studyMode: "",
  entryRequirements: "",
  placementTest: "",
  levels: [],
  intakes: [],
  fees: [],
  packages: [],
  charges: [],
});
export function configurationErrors(
  value: CentreConfiguration
): Record<string, string> {
  if (!value.enabled) return {};
  const result = configurationSchema.safeParse(
    withoutRemovedCentreFields(value)
  );
  return result.success
    ? {}
    : Object.fromEntries(
        result.error.issues.map((issue) => [
          issue.path.join("."),
          issue.message,
        ])
      );
}
export function formatPrice(value: { amount: string; currency: string }) {
  return `${value.currency} ${new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
  }).format(Number(value.amount))}`;
}

/** Accept older saved records while retiring fields removed from the UI. */
export function withoutRemovedCentreFields(
  value: CentreConfiguration
): CentreConfiguration {
  return {
    ...value,
    website: "",
    email: "",
    phone: "",
    sources: [],
    brochure: null,
    courses: value.courses.map((course) => ({ ...course, intakes: [] })),
  };
}
