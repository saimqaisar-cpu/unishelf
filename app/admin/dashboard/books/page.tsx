import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { createBook, deleteBook } from "@/app/actions/books";
import DeleteBookButton from "./DeleteBookButton";
import BookUploadForm from "./BookUploadForm";
import HierarchySection from "./HierarchySection";

export default async function BooksManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; q?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated_true") {
    redirect("/admin");
  }

  // Fetch departments with complete nested programs, semesters, and courses for the cascading form
  const departments = await prisma.department.findMany({
    include: {
      programs: {
        include: {
          schemes: {
            include: {
              semesters: {
                orderBy: { number: "asc" },
                include: {
                  courses: true,
                },
              },
            },
          },
        },
      },
    },
  });
  
  const programs = await prisma.program.findMany({
    include: {
      department: true,
      schemes: {
        include: {
          semesters: {
            orderBy: { number: "asc" },
            include: {
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
          },
        },
      },
    },
  });

  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-black/10 py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/admin/dashboard" className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C] hover:underline">
            ← Back to Control Center
          </Link>
          <span className="text-xs font-mono font-bold text-black/50">Hierarchical Books & Curriculum Hub</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 flex-1 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">Prescribed Textbooks & Curriculum Mapping</h1>
            <p className="text-black/60 text-xs mt-1">Upload books from device, manage files, and organize them department-wise.</p>
          </div>
        </div>

        {resolvedSearchParams?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-bold">
            ⚠️ {resolvedSearchParams.error}
          </div>
        )}

        {resolvedSearchParams?.success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-xs font-bold">
            ✅ {resolvedSearchParams.success}
          </div>
        )}

        {/* Cascading Upload Form Component */}
        <BookUploadForm 
          departments={departments} 
          action={async (formData) => {
            "use server";
            const res = await createBook(formData);
            if (!res.success) {
              redirect(`/admin/dashboard/books?error=${encodeURIComponent(res.error || "")}`);
            }
            redirect(`/admin/dashboard/books?success=Book uploaded and mapped successfully`);
          }} 
        />

        {/* Collapsible Hierarchy Section with Button */}
        <HierarchySection>
          {departments.length === 0 ? (
            <div className="border border-dashed border-black/20 rounded-2xl p-10 text-center text-xs text-black/40">
              No departments or programs created yet.
            </div>
          ) : (
            <div className="space-y-6">
              {departments.map((dept) => {
                const deptPrograms = programs.filter((p) => p.departmentId === dept.id);

                return (
                  <div key={dept.id} className="border border-black/10 rounded-2xl p-6 bg-white shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-black/5 pb-3">
                      <div>
                        <span className="text-[10px] bg-[#7A1C1C]/10 text-[#7A1C1C] font-mono px-2 py-0.5 rounded uppercase font-bold">
                          Department: {dept.code}
                        </span>
                        <h3 className="text-lg font-extrabold mt-1">{dept.name}</h3>
                      </div>
                      <span className="text-xs font-bold text-black/50">{deptPrograms.length} Programs</span>
                    </div>

                    {deptPrograms.length === 0 ? (
                      <p className="text-xs text-black/40 italic py-2">No programs in this department.</p>
                    ) : (
                      <div className="space-y-4 pl-2 sm:pl-4 border-l-2 border-black/5">
                        {deptPrograms.map((prog) => {
                          const semesters = prog.schemes.flatMap(s => s.semesters);

                          return (
                            <div key={prog.id} className="bg-black/[0.01] border border-black/10 rounded-xl p-4 space-y-3">
                              <h4 className="text-sm font-extrabold">{prog.name} <span className="text-xs font-mono text-black/50">({prog.code})</span></h4>

                              {semesters.length === 0 ? (
                                <p className="text-xs text-black/40 italic">No semesters added.</p>
                              ) : (
                                <div className="space-y-3 pl-2 border-l border-black/10">
                                  {semesters.map((sem) => (
                                    <div key={sem.id} className="space-y-2">
                                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A1C1C]">{sem.name}</span>
                                      
                                      {!sem.courses || sem.courses.length === 0 ? (
                                        <p className="text-[11px] text-black/40 italic">No courses mapped.</p>
                                      ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {sem.courses.map((course) => (
                                            <div key={course.id} className="bg-white border border-black/10 rounded-xl p-3.5 space-y-2">
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold">{course.name} <span className="font-mono text-[10px] text-black/50">({course.code})</span></span>
                                              </div>
                                              
                                              <div className="space-y-1.5 pt-2 border-t border-black/5">
                                                {!course.courseBooks || course.courseBooks.length === 0 ? (
                                                  <p className="text-[11px] text-black/40 italic">No prescribed books assigned.</p>
                                                ) : (
                                                  course.courseBooks.map((cb) => (
                                                    <div key={cb.id} className="flex items-center justify-between bg-black/[0.02] px-3 py-2 rounded-lg text-xs">
                                                      <div>
                                                        <span className="font-bold">{cb.book.title}</span>
                                                        <span className="text-black/50 text-[10px] ml-1.5 font-mono">({cb.role})</span>
                                                      </div>
                                                      <DeleteBookButton bookId={cb.book.id} bookTitle={cb.book.title} onDelete={deleteBook} />
                                                    </div>
                                                  ))
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </HierarchySection>
      </main>

      <footer className="border-t border-black/10 py-6 text-center text-xs text-black/40">
        <p>© 2026 UniShelf Platform. Hierarchical Books Catalog Module.</p>
      </footer>
    </div>
  );
}