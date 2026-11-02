import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { handleAdminLogout } from "@/app/actions/admin-auth";

export default async function AdminDashboardHub() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated_true") {
    redirect("/admin");
  }

  const adminEmail = cookieStore.get("admin_email")?.value || "Admin";

  // Fetch dynamic counts from database
  const [bookCount, programCount] = await Promise.all([
    prisma.book.count(),
    prisma.program.count(),
  ]);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="border-b border-black/10 py-5 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold bg-[#7A1C1C] text-white px-2.5 py-1 rounded-md">UNISHELF ADMIN</span>
            <span className="text-xs font-bold text-black/60">{adminEmail}</span>
          </div>
          <form action={async () => {
            "use server";
            await handleAdminLogout();
            redirect("/admin");
          }}>
            <button type="submit" className="text-xs font-bold text-red-600 hover:underline cursor-pointer">
              Sign Out →
            </button>
          </form>
        </div>
      </header>

      {/* Main Hub Content */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 flex-1">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Control Center</h1>
          <p className="text-black/60 text-xs mt-1.5">Manage books, academic structure, and security settings cleanly from one hub.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Books Management */}
          <div className="border border-black/10 rounded-2xl p-6 bg-white shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A1C1C]">Catalog</span>
                <span className="text-xs font-mono font-bold bg-black/5 px-2 py-0.5 rounded-full">{bookCount} Books</span>
              </div>
              <h2 className="text-lg font-extrabold">Books</h2>
              <p className="text-xs text-black/60 mt-1">Manage prescribed textbooks, upload PDFs, and link external resources.</p>
            </div>
            <div className="pt-4 border-t border-black/5">
              <Link href="/admin/dashboard/books" className="block w-full text-center bg-black hover:bg-[#7A1C1C] text-white text-xs font-bold py-2.5 rounded-xl transition">
                Manage Books →
              </Link>
            </div>
          </div>

          {/* 2. Academic Structure */}
          <div className="border border-black/10 rounded-2xl p-6 bg-white shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A1C1C]">Hierarchy</span>
                <span className="text-xs font-mono font-bold bg-black/5 px-2 py-0.5 rounded-full">{programCount} Programs</span>
              </div>
              <h2 className="text-lg font-extrabold">Academic Structure</h2>
              <p className="text-xs text-black/60 mt-1">Configure departments, degree programs, semesters, and courses.</p>
            </div>
            <div className="pt-4 border-t border-black/5">
              <Link href="/admin/dashboard/programs" className="block w-full text-center bg-black hover:bg-[#7A1C1C] text-white text-xs font-bold py-2.5 rounded-xl transition">
                Manage Structure →
              </Link>
            </div>
          </div>

          {/* 3. Settings */}
          <div className="border border-black/10 rounded-2xl p-6 bg-white shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A1C1C]">Security</span>
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Secure</span>
              </div>
              <h2 className="text-lg font-extrabold">Settings</h2>
              <p className="text-xs text-black/60 mt-1">Update admin password and manage authorized administrator access.</p>
            </div>
            <div className="pt-4 border-t border-black/5">
              <Link href="/admin/dashboard/security" className="block w-full text-center bg-black hover:bg-[#7A1C1C] text-white text-xs font-bold py-2.5 rounded-xl transition">
                Manage Settings →
              </Link>
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-black/10 py-6 text-center text-xs text-black/40">
        <p>© 2026 UniShelf Platform. Admin Control Center.</p>
      </footer>
    </div>
  );
}