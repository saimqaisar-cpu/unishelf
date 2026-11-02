import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { deleteBook } from "@/app/actions/books";
import DeleteBookButton from "@/app/admin/dashboard/books/DeleteBookButton";

export default async function SemesterEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated_true") {
    redirect("/admin");
  }

  const { id } = await params;

  const semester = await prisma.semester.findUnique({
    where: { id },
    include: {
      scheme: {
        include: {
          program: {
            include: {
              department: true,
            },
          },
        },
      },
      courses: {
        include: {
          courseBooks: {
            include: {
              book: true,
            },
          },
        },
      },
    },
  });

  if (!semester) {
    redirect("/admin/dashboard/books");
  }

  const program = semester.scheme.program;
  const department = program.department;

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      <header className="border-b border-black/10 py-5 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/admin/dashboard/books/catalog" className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C] hover:underline">
            ← Back to Catalog
          </Link>
          <span className="text-xs font-mono font-bold text-black/50">Semester Management Hub</span>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-6 py-10 flex-1 space-y-8">
        <div className="border border-black/10 rounded-2xl p-6 bg-black/[0.01] space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-[#7A1C1C]/10 text-[#7A1C1C] font-mono px-2 py-0.5 rounded uppercase font-bold">
              {department.name} ({department.code})
            </span>
            <span className="text-[10px] bg-black/5 font-mono text-black/70 px-2 py-0.5 rounded uppercase font-bold">
              {program.name}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold">{semester.name} (Semester #{semester.number})</h1>
          <p className="text-xs text-black/60">Manage courses and prescribed textbooks for this specific semester.</p>
        </div>

        {/* Courses & Books List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black/50">Mapped Courses & Textbooks</h2>

          {semester.courses.length === 0 ? (
            <div className="border border-dashed border-black/20 rounded-2xl p-8 text-center text-xs text-black/40">
              No courses mapped to this semester yet.
            </div>
          ) : (
            <div className="space-y-4">
              {semester.courses.map((course) => (
                <div key={course.id} className="border border-black/10 rounded-2xl p-5 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold">{course.name}</h3>
                      <span className="text-xs font-mono text-black/50">Course Code: {course.code}</span>
                    </div>
                  </div>

                  {/* Books for this course */}
                  <div className="pt-3 border-t border-black/5 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-black/40">Assigned Books:</p>
                    {course.courseBooks.length === 0 ? (
                      <p className="text-xs text-black/40 italic">No books assigned to this course.</p>
                    ) : (
                      <div className="space-y-2">
                        {course.courseBooks.map((cb) => (
                          <div key={cb.id} className="flex items-center justify-between bg-black/[0.02] px-3 py-2 rounded-xl text-xs">
                            <div>
                              <span className="font-bold">{cb.book.title}</span>
                              <span className="text-black/50 text-[10px] ml-1.5 font-mono">({cb.role})</span>
                              {cb.book.externalUrl && (
                                <a href={cb.book.externalUrl} target="_blank" className="ml-3 text-[#7A1C1C] hover:underline font-bold">
                                  View File / Link ↗
                                </a>
                              )}
                            </div>
                            <DeleteBookButton bookId={cb.book.id} bookTitle={cb.book.title} onDelete={deleteBook} />
                          </div>
                        ))}
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
        <p>© 2026 UniShelf Platform. Semester Management.</p>
      </footer>
    </div>
  );
}