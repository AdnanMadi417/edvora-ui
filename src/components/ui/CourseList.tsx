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

const formatPrice = (value: number, currency: string) => `${currency} ${value.toLocaleString()}`;

interface CourseListProps {
  courses: Course[];
}

export default function CourseList({ courses }: CourseListProps) {
  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <div key={course.name} className="rounded-lg border border-slate-100 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">{course.name}</p>
            <p className="text-xs text-slate-500">
              {course.duration} · Intake: {course.intake}
            </p>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-xs">
              <thead>
                <tr className="text-slate-400">
                  <th className="pb-1.5 pr-4 font-medium">Level</th>
                  <th className="pb-1.5 pr-4 font-medium">Duration</th>
                  <th className="pb-1.5 pr-4 font-medium">Price (MYR)</th>
                  <th className="pb-1.5 font-medium">Price (USD)</th>
                </tr>
              </thead>
              <tbody>
                {course.levels.map((level) => (
                  <tr key={`${course.name}-${level.level}`} className="border-t border-slate-100">
                    <td className="py-1.5 pr-4 text-slate-700">
                      {level.level}. {level.level_name}
                    </td>
                    <td className="py-1.5 pr-4 text-slate-500">{level.duration}</td>
                    <td className="py-1.5 pr-4 text-slate-700">{formatPrice(level.price_myr, "RM")}</td>
                    <td className="py-1.5 text-slate-700">{formatPrice(level.price_usd, "$")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {course.notes && <p className="mt-2 text-xs italic text-slate-400">{course.notes}</p>}
        </div>
      ))}
    </div>
  );
}
