// Renders the course/pricing table for a university's language center tab
// (features/universities/components/public/UniversityPublicProfile.tsx) —
// its own component so that markup exists once, not copy-pasted, if
// language centers ever get their own profile again.
//
// Matches the sample course data shape given for this feature: a course
// has a name/duration/intake and a list of levels, each separately priced
// in MYR and USD. No real "language centers" backend/types module exists
// yet (grepped — nothing in this repo or unibexs-backend), so this shape
// is modeled directly off that sample rather than an existing type.
import { card, tableHead, tableRow, tableScroll } from "components/ub/recipes";

export interface CourseLevel {
  level_name: string;
  level: number;
  duration: string;
  price_myr: number;
  price_usd: number;
}

export interface Course {
  name: string;
  duration: string;
  intake: string;
  levels: CourseLevel[];
  notes: string;
}

// Brief §8: "RM4,200" (no space) for ringgit, "USD 3,000" for other codes.
const formatPrice = (value: number, currency: string) =>
  currency === "RM" ? `RM${value.toLocaleString()}` : `${currency} ${value.toLocaleString()}`;

interface CourseListProps {
  courses: Course[];
}

export default function CourseList({ courses }: CourseListProps) {
  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <div key={course.name} className={`${card} p-4`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-ub-heading-sm text-ub-text-primary">{course.name}</p>
            <p className="text-ub-caption text-ub-text-tertiary">
              {course.duration} · Intake: {course.intake}
            </p>
          </div>

          <div className={`mt-3 rounded-ub-md border border-ub-border ${tableScroll}`}>
            <table className="w-full min-w-[420px] text-start">
              <thead className={tableHead}>
                <tr>
                  <th scope="col" className="h-10 px-3 text-start font-medium">Level</th>
                  <th scope="col" className="h-10 px-3 text-start font-medium">Duration</th>
                  <th scope="col" className="h-10 px-3 text-end font-medium">Price (MYR)</th>
                  <th scope="col" className="h-10 px-3 text-end font-medium">Price (USD)</th>
                </tr>
              </thead>
              <tbody>
                {course.levels.map((level) => (
                  <tr key={`${course.name}-${level.level}`} className={tableRow}>
                    <td className="h-11 px-3 text-ub-body-sm text-ub-text-primary">
                      {level.level}. {level.level_name}
                    </td>
                    <td className="h-11 px-3 text-ub-body-sm text-ub-text-secondary">{level.duration}</td>
                    <td className="ub-tabular h-11 px-3 text-end text-ub-body-sm text-ub-text-primary">
                      {formatPrice(level.price_myr, "RM")}
                    </td>
                    <td className="ub-tabular h-11 px-3 text-end text-ub-body-sm text-ub-text-primary">
                      {formatPrice(level.price_usd, "USD")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {course.notes && <p className="mt-2 text-ub-caption text-ub-text-tertiary">{course.notes}</p>}
        </div>
      ))}
    </div>
  );
}
