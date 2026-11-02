import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdministrators, createAdministrator, deleteAdministrator } from "@/app/actions/admins";

export default async function AdminsManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated_true") {
    redirect("/admin");
  }

  const admins = await getAdministrators();
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-black/10 py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/admin/dashboard" className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C] hover:underline">
            ← Back to Control Center
          </Link>
          <span className="text-xs font-mono font-bold text-black/50">Administrator Security & Access Control</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold">Administrator Accounts</h1>
          <p className="text-black/60 text-xs mt-1">Manage authorized platform administrators, create secure accounts, and revoke access.</p>
        </div>

        {resolvedSearchParams?.error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-bold">
            ⚠️ {resolvedSearchParams.error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Create Admin Form */}
          <div className="space-y-6">
            <div className="border border-black/10 rounded-2xl p-6 bg-black/[0.01]">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 text-[#7A1C1C]">Create New Admin Account</h2>
              <p className="text-[11px] text-black/60 mb-4">Authorized personnel only. New accounts receive full admin privileges.</p>
              
              <form action={async (formData) => {
                "use server";
                const res = await createAdministrator(formData);
                if (!res.success) {
                  redirect(`/admin/dashboard/admins?error=${encodeURIComponent(res.error || "")}`);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    autoComplete="off"
                    placeholder="e.g. Muhammad Siam Qaisar" 
                    className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    autoComplete="off"
                    placeholder="admin@unishelf.edu" 
                    className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Temporary Password (Min 8 Chars)</label>
                  <input 
                    type="password" 
                    name="password" 
                    required 
                    autoComplete="new-password"
                    placeholder="••••••••" 
                    className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold" 
                  />
                </div>

                <button type="submit" className="w-full bg-[#7A1C1C] hover:bg-[#631616] text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer">
                  Create Admin Account →
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Administrators List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black/50">Authorized Administrators ({admins.length})</h2>
            
            {admins.length === 0 ? (
              <div className="border border-dashed border-black/20 rounded-2xl p-8 text-center text-xs text-black/50">
                No additional administrators found.
              </div>
            ) : (
              <div className="space-y-4">
                {admins.map((admin: any) => (
                  <div key={admin.id} className="border border-black/10 rounded-2xl p-6 bg-white shadow-xs flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                          {admin.isActive ? "ACTIVE" : "PENDING"}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold">{admin.name}</h3>
                      <p className="text-xs font-mono text-black/60">{admin.email}</p>
                    </div>

                    <form action={async () => {
                      "use server";
                      await deleteAdministrator(admin.id);
                    }}>
                      <button type="submit" className="text-red-600 hover:underline text-xs font-bold cursor-pointer whitespace-nowrap">
                        Revoke Access
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-black/10 py-6 text-center text-xs text-black/40">
        <p>© 2026 UniShelf Platform. Administrator Security Module.</p>
      </footer>
    </div>
  );
}