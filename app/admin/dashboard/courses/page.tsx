import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCoursesWithDetails, getAllSemesters, createCourse, deleteCourse } from "@/app/actions/courses";

export default async function CoursesManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated_true") {
    redirect("/admin");
  }

  const courses = await getCoursesWithDetails();
  const semesters = await getAllSemesters();
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-black/10 py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/admin/dashboard" className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C] hover:underline">
            ← Back to Control Center
          </Link>
          <span className="text-xs font-mono font-bold text-black/50">Course Curriculum Management</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold">Academic Courses & Curriculum Mapping</h1>
          <p className="text-black/60 text-xs mt-1">Add courses to specific semesters and manage prescribed subjects.</p>
        </div>

        {resolvedSearchParams?.error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-bold">
            ⚠️ {resolvedSearchParams.error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Add Course Form */}
          <div className="space-y-6">
            <div className="border border-black/10 rounded-2xl p-6 bg-black/[0.01]">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 text-[#7A1C1C]">Add New Course</h2>
              <p className="text-[11px] text-black/60 mb-4">Select a semester and assign course details.</p>
              
              <form action={async (formData) => {
                "use server";
                const res = await createCourse(formData);
                if (!res.success) {
                  redirect(`/admin/dashboard/courses?error=${encodeURIComponent(res.error || "")}`);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Select Semester & Program</label>
                  <select name="semesterId" required className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold">
                    <option value="">Select Semester</option>
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.scheme.program.name} — {sem.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Course Code</label>
                  <input type="text" name="code" required placeholder="e.g. CS-301" className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Course Name</label>
                  <input type="text" name="name" required placeholder="e.g. Data Structures & Algorithms" className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Credit Hours (Optional)</label>
                  <input type="number" name="creditHours" min="1" max="4" placeholder="e.g. 3" className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold" />
                </div>
                <button type="submit" className="w-full bg-[#7A1C1C] hover:bg-[#631616] text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer">
                  Create Course →
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Courses List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black/50">Existing Courses ({courses.length})</h2>
            
            {courses.length === 0 ? (
              <div className="border border-dashed border-black/20 rounded-2xl p-8 text-center text-xs text-black/50">
                No courses created yet. Use the form on the left to add courses to semesters.
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => {
                  const programName = course.semester?.scheme?.program?.name || "General Program";
                  const semesterName = course.semester?.name || "Semester";

                  return (
                    <div key={course.id} className="border border-black/10 rounded-2xl p-6 bg-white shadow-xs flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-black/5 font-mono text-black/70 px-2 py-0.5 rounded uppercase font-bold">
                            {programName} • {semesterName}
                          </span>
                          {course.creditHours && (
                            <span className="text-[10px] bg-[#7A1C1C]/10 text-[#7A1C1C] px-2 py-0.5 rounded font-mono font-bold">
                              {course.creditHours} Cr. Hrs
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-extrabold">{course.name} <span className="font-mono text-xs text-black/50">({course.code})</span></h3>
                      </div>

                      <form action={async () => {
                        "use server";
                        await deleteCourse(course.id);
                      }}>
                        <button type="submit" className="text-red-600 hover:underline text-xs font-bold cursor-pointer whitespace-nowrap">
                          Delete
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-black/10 py-6 text-center text-xs text-black/40">
        <p>© 2026 UniShelf Platform. Course Management Module.</p>
      </footer>
    </div>
  );
}