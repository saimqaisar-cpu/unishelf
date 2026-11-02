import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDepartments, getProgramsWithDetails, createDepartment, createProgram, createSemester, deleteProgram } from "@/app/actions/programs";
import DeleteProgramButton from "./DeleteProgramButton";

export default async function ProgramsManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated_true") {
    redirect("/admin");
  }

  const departments = await getDepartments();
  const programs = await getProgramsWithDetails();
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-black/10 py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/admin/dashboard" className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C] hover:underline">
            ← Back to Control Center
          </Link>
          <span className="text-xs font-mono font-bold text-black/50">Academic Hierarchy Hub</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 flex-1 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Departments, Programs & Semesters</h1>
            <p className="text-black/60 text-xs mt-1">Departments ke lihaz se programs aur semesters ko organize karein.</p>
          </div>
          <Link 
            href="/admin/dashboard/books/catalog" 
            className="bg-[#7A1C1C] hover:bg-[#631616] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
          >
            View Books Catalog & Mapping Hub →
          </Link>
        </div>

        {resolvedSearchParams?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-bold">
            ⚠️ {resolvedSearchParams.error}
          </div>
        )}

        {/* Quick Setup Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/[0.02] border border-black/10 p-6 rounded-2xl">
          
          {/* Add Department */}
          <form action={async (formData) => {
            "use server";
            const res = await createDepartment(formData);
            if (!res.success) redirect(`/admin/dashboard/programs?error=${encodeURIComponent(res.error || "")}`);
          }} className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C]">1. Add Department</h2>
            <input type="text" name="name" required placeholder="Department Name (e.g. IT)" className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold" />
            <input type="text" name="code" required placeholder="Code (e.g. IT)" className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold" />
            <button type="submit" className="w-full bg-black hover:bg-[#7A1C1C] text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer">
              + Save Department
            </button>
          </form>

          {/* Add Program */}
          <form action={async (formData) => {
            "use server";
            const res = await createProgram(formData);
            if (!res.success) redirect(`/admin/dashboard/programs?error=${encodeURIComponent(res.error || "")}`);
          }} className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C]">2. Add Program</h2>
            <select name="departmentId" required className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold">
              <option value="">Select Department</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <input type="text" name="name" required placeholder="Program Name (e.g. ADP IT)" className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold" />
            <input type="text" name="code" required placeholder="Code (e.g. ADP-IT)" className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold" />
            <button type="submit" className="w-full bg-[#7A1C1C] hover:bg-[#631616] text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer">
              + Save Program
            </button>
          </form>

          {/* Add Semester */}
          <form action={async (formData) => {
            "use server";
            const res = await createSemester(formData);
            if (!res.success) redirect(`/admin/dashboard/programs?error=${encodeURIComponent(res.error || "")}`);
          }} className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C]">3. Add Semester</h2>
            <select name="programId" required className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold">
              <option value="">Select Program</option>
              {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" name="semesterNumber" min="1" max="8" required placeholder="Semester Number (e.g. 1)" className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold" />
            <input type="text" name="name" required placeholder="Title (e.g. Semester 1)" className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold" />
            <button type="submit" className="w-full bg-black hover:bg-[#7A1C1C] text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer">
              + Add Semester
            </button>
          </form>

        </div>

        {/* Departments & Programs Hierarchical View */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black/50">Departments & Programs Hierarchy</h2>
          </div>

          {departments.length === 0 ? (
            <div className="border border-dashed border-black/20 rounded-2xl p-10 text-center text-xs text-black/40">
              Koi department mojood nahi hai. Pehle upar diye gaye box se department banayein.
            </div>
          ) : (
            <div className="space-y-6">
              {departments.map((dept) => {
                const deptPrograms = programs.filter((p) => p.departmentId === dept.id);

                return (
                  <div key={dept.id} className="border border-black/10 rounded-2xl p-6 bg-white shadow-xs space-y-4">
                    {/* Department Header */}
                    <div className="flex items-center justify-between border-b border-black/5 pb-3">
                      <div>
                        <span className="text-[10px] bg-[#7A1C1C]/10 text-[#7A1C1C] font-mono px-2 py-0.5 rounded uppercase font-bold">
                          Department Code: {dept.code}
                        </span>
                        <h3 className="text-lg font-extrabold mt-1">{dept.name}</h3>
                      </div>
                      <span className="text-xs font-bold text-black/50">{deptPrograms.length} Programs</span>
                    </div>

                    {/* Programs under this Department */}
                    {deptPrograms.length === 0 ? (
                      <p className="text-xs text-black/40 italic py-2">Is department mein abhi tak koi program add nahi kiya gaya.</p>
                    ) : (
                      <div className="space-y-4 pl-2 sm:pl-4 border-l-2 border-black/5">
                        {deptPrograms.map((prog) => {
                          const semesters = prog.schemes.flatMap(s => s.semesters);

                          return (
                            <div key={prog.id} className="bg-black/[0.01] border border-black/10 rounded-xl p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-extrabold">{prog.name} <span className="text-xs font-mono text-black/50">({prog.code})</span></h4>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Link 
                                    href={`/admin/dashboard/books/catalog`}
                                    className="text-[11px] font-bold text-[#7A1C1C] hover:underline"
                                  >
                                    Manage Books in Catalog →
                                  </Link>
                                  <DeleteProgramButton programId={prog.id} programName={prog.name} onDelete={deleteProgram} />
                                </div>
                              </div>

                              {/* Semesters */}
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1.5">Semesters:</p>
                                {semesters.length === 0 ? (
                                  <p className="text-xs text-black/40 italic">Koi semester add nahi hai.</p>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {semesters.map((sem) => (
                                      <Link 
                                        key={sem.id} 
                                        href={`/admin/dashboard/semesters/${sem.id}`}
                                        className="bg-white hover:bg-[#7A1C1C] hover:text-white border border-black/10 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-2xs"
                                      >
                                        {sem.name} ⚙️
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
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
        </div>
      </main>

      <footer className="border-t border-black/10 py-6 text-center text-xs text-black/40">
        <p>© 2026 UniShelf Platform. Programs Module.</p>
      </footer>
    </div>
  );
}