import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import SemesterSwitcher from "./SemesterSwitcher";

export default async function CourseOutlinePage({
  params,
}: {
  params: Promise<{ slug: string; semesterSlug: string }>;
}) {
  const { slug, semesterSlug } = await params;

  // 1. Fetch program and ensure it exists
  const program = await prisma.program.findUnique({
    where: { slug },
    include: {
      department: true,
      schemes: {
        include: {
          semesters: {
            orderBy: { number: "asc" },
          },
        },
      },
    },
  });

  if (!program) {
    notFound();
  }

  // Flatten all semesters across schemes for this program
  const allSemesters = program.schemes.flatMap((scheme) => scheme.semesters);

  // Find the currently active semester matching the semesterSlug
  const currentSemester = allSemesters.find((sem) => sem.slug === semesterSlug);

  if (!currentSemester) {
    notFound();
  }

  // 2. Fetch courses belonging strictly to this verified program and semester
  const courses = await prisma.course.findMany({
    where: { semesterId: currentSemester.id },
    include: {
      courseBooks: {
        include: {
          book: true,
        },
      },
    },
    orderBy: { code: "asc" },
  });

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-black/10 py-5 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C] hover:underline">
            ← Back to Home
          </Link>
          <span className="text-xs font-mono font-bold text-black/50">UniShelf Course Outline</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto px-6 py-10 flex-1">
        <div className="mb-6">
          <span className="text-[10px] bg-black/5 font-mono text-black/70 px-2.5 py-1 rounded-md uppercase font-bold">
            {program.department ? program.department.name : "University Program"}
          </span>
          <h1 className="text-3xl font-extrabold mt-2">{program.name}</h1>
          <p className="text-black/60 text-xs mt-1">Viewing curriculum and prescribed books for {currentSemester.name}.</p>
        </div>

        {/* Compact Semester Switcher */}
        <SemesterSwitcher
          programSlug={program.slug}
          semesters={allSemesters}
          currentSemesterSlug={currentSemester.slug}
        />

        {/* Courses & Prescribed Books Section */}
        <div className="mt-8 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black/50">
            {currentSemester.name} Courses & Textbooks ({courses.length})
          </h2>

          {courses.length === 0 ? (
            <div className="border border-dashed border-black/20 rounded-2xl p-8 text-center text-xs text-black/50">
              No courses or prescribed books have been added for this semester yet.
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="border border-black/10 rounded-2xl p-6 bg-white shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-black/5 pb-3">
                    <div>
                      <span className="text-[10px] bg-[#7A1C1C]/10 text-[#7A1C1C] px-2 py-0.5 rounded font-mono font-bold">
                        {course.code} {course.creditHours ? `• ${course.creditHours} Cr. Hrs` : ""}
                      </span>
                      <h3 className="text-base font-extrabold mt-1">{course.name}</h3>
                    </div>
                  </div>

                  {/* Prescribed Books */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-black/40 mb-2">Prescribed Books & References:</p>
                    {course.courseBooks.length === 0 ? (
                      <p className="text-xs text-black/40 italic">No textbook mapped to this course yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {course.courseBooks.map((mapping) => {
                          const book = mapping.book;
                          return (
                            <div key={mapping.id} className="bg-black/[0.02] border border-black/10 p-3.5 rounded-xl flex items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center space-x-2 mb-0.5">
                                  <span className="text-[9px] bg-black/5 font-mono px-1.5 py-0.5 rounded uppercase font-bold">
                                    {mapping.role}
                                  </span>
                                  <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold">
                                    {book.bookType}
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold">{book.title}</h4>
                                <p className="text-[11px] text-black/60">
                                  {book.authors ? `By ${book.authors}` : ""} {book.edition ? `• ${book.edition}` : ""}
                                </p>
                              </div>

                              {book.externalUrl && (
                                <a
                                  href={book.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-black hover:bg-[#7A1C1C] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap"
                                >
                                  Access Resource →
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-black/10 py-6 text-center text-xs text-black/40">
        <p>© 2026 UniShelf Platform. Student Course Outline.</p>
      </footer>
    </div>
  );
}