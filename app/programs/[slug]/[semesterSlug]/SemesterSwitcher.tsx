"use client";

import Link from "next/link";

interface Semester {
  id: string;
  number: number;
  slug: string;
  name: string;
}

interface SemesterSwitcherProps {
  programSlug: string;
  semesters: Semester[];
  currentSemesterSlug: string;
}

export default function SemesterSwitcher({
  programSlug,
  semesters,
  currentSemesterSlug,
}: SemesterSwitcherProps) {
  // Sort semesters by number
  const sortedSemesters = [...semesters].sort((a, b) => a.number - b.number);

  // Group semesters if more than 4 (e.g. 8 semesters into groups of 4)
  const group1 = sortedSemesters.filter((s) => s.number <= 4);
  const group2 = sortedSemesters.filter((s) => s.number > 4);

  return (
    <div className="my-6 p-4 border border-black/10 rounded-2xl bg-white shadow-xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-black/50 mb-3">
        CURRICULUM PROGRESSION
      </h3>

      <div className="space-y-3">
        {/* Group 1: Sem 1 - 4 */}
        {group1.length > 0 && (
          <div>
            <div className="text-[10px] font-mono text-black/40 mb-1.5 uppercase">Years 1–2 (Semesters 1–4)</div>
            <div className="flex flex-wrap gap-2">
              {group1.map((sem) => {
                const isActive = sem.slug === currentSemesterSlug;
                return (
                  <Link
                    key={sem.id}
                    href={`/programs/${programSlug}/${sem.slug}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#7A1C1C] text-white shadow-xs"
                        : "bg-black/[0.03] text-black/70 hover:bg-black/[0.06] border border-black/10"
                    }`}
                  >
                    Sem {sem.number}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Group 2: Sem 5 - 8 (if applicable) */}
        {group2.length > 0 && (
          <div className="pt-2 border-t border-black/5">
            <div className="text-[10px] font-mono text-black/40 mb-1.5 uppercase">Years 3–4 (Semesters 5–8)</div>
            <div className="flex flex-wrap gap-2">
              {group2.map((sem) => {
                const isActive = sem.slug === currentSemesterSlug;
                return (
                  <Link
                    key={sem.id}
                    href={`/programs/${programSlug}/${sem.slug}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#7A1C1C] text-white shadow-xs"
                        : "bg-black/[0.03] text-black/70 hover:bg-black/[0.06] border border-black/10"
                    }`}
                  >
                    Sem {sem.number}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}