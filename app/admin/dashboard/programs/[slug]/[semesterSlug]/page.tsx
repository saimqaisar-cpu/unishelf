import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { createSemester, deleteSemester } from "@/app/actions/programs";

export default async function ProgramSemestersPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated_true") {
    redirect("/admin");
  }

  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  // Fetch program with department and schemes/semesters
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
    redirect("/admin/dashboard/programs");
  }

  const allSemesters = program.schemes.flatMap((s) => s.semesters);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-black/10 py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/admin/dashboard/programs" className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C] hover:underline">
            ← Back to Programs Hub
          </Link>
          <span className="text-xs font-mono font-bold text-black/50">Program Management</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 flex-1 space-y-8">
        {/* Program Header Info */}
        <div className="border border-black/10 rounded-2xl p-6 bg-black/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] bg-[#7A1C1C]/10 text-[#7A1C1C] font-mono px-2 py-0.5 rounded uppercase font-bold">
              {program.department?.name || "Department"} ({program.department?.code})
            </span>
            <h1 className="text-2xl font-extrabold mt-1.5">{program.name}</h1>
            <p className="text-xs font-mono text-black/50 mt-0.5">Program Code: {program.code}</p>
          </div>
        </div>

        {resolvedSearchParams?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-bold">
            ⚠️ {resolvedSearchParams.error}
          </div>
        )}

        {/* Add Semester Form for this Program */}
        <div className="border border-black/10 rounded-2xl p-6 bg-white space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#7A1C1C]">Add New Semester to {program.name}</h2>
          <form action={async (formData) => {
            "use server";
            formData.append("programId", program.id);
            const res = await createSemester(formData);
            if (!res.success) {
              redirect(`/admin/dashboard/programs/${slug}?error=${encodeURIComponent(res.error || "")}`);
            }
          }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Semester Number</label>
              <input type="number" name="semesterNumber" min="1" max="8" required placeholder="e.g. 1" className="w-full px-3 py-2.5 bg-black/[0.02] border border-black/20 rounded-xl text-xs font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Semester Title</label>
              <input type="text" name="name" required placeholder="e.g. Semester 1" className="w-full px-3 py-2.5 bg-black/[0.02] border border-black/20 rounded-xl text-xs font-semibold" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-black hover:bg-[#7A1C1C] text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer">
                + Add Semester
              </button>
            </div>
          </form>
        </div>

        {/* Existing Semesters Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black/50">Existing Semesters ({allSemesters.length})</h2>

          {allSemesters.length === 0 ? (
            <div className="border border-dashed border-black/20 rounded-2xl p-10 text-center text-xs text-black/40">
              Is program ke liye abhi tak koi semester add nahi kiya gaya. Upar diye gaye form se add karein.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allSemesters.map((sem) => (
                <div key={sem.id} className="border border-black/10 rounded-2xl p-5 bg-white shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-black/5 font-mono px-2 py-0.5 rounded uppercase font-bold text-black/60">
                        Semester #{sem.number}
                      </span>
                      <form action={async () => {
                        "use server";
                        await deleteSemester(sem.id);
                      }}>
                        <button type="submit" className="text-red-600 hover:underline text-[11px] font-bold cursor-pointer">
                          Remove
                        </button>
                      </form>
                    </div>
                    <h3 className="text-base font-extrabold mt-2">{sem.name}</h3>
                  </div>

                  <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                    <span className="text-[11px] text-black/50 font-medium">Admin Control Hub</span>
                    <Link 
                      href={`/admin/dashboard/programs/${slug}/${sem.slug}`}
                      className="bg-[#7A1C1C] hover:bg-[#631616] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition"
                    >
                      Manage Semester →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-black/10 py-6 text-center text-xs text-black/40">
        <p>© 2026 UniShelf Platform. Program Semesters Module.</p>
      </footer>
    </div>
  );
}