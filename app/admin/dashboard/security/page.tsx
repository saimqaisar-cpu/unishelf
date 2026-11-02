import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import ChangePasswordForm from "@/app/admin/dashboard/ChangePasswordForm";
import { getAdministrators, deleteAdministrator } from "@/app/actions/admins";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  const adminEmail = cookieStore.get("admin_email")?.value;

  if (!session || session.value !== "authenticated_true" || !adminEmail) {
    redirect("/admin");
  }

  const admins = await getAdministrators();

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-black/10 py-5 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/admin/dashboard" className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C] hover:underline">
            ← Back to Control Center
          </Link>
          <span className="text-xs font-mono font-bold text-black/50">Admin Security & Settings</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto px-6 py-10 flex-1 space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold">Security & Access Settings</h1>
          <p className="text-black/60 text-xs mt-1">Manage your credentials and authorized platform administrators.</p>
        </div>

        {/* Password Update Section */}
        <ChangePasswordForm adminEmail={adminEmail} />

        {/* Administrator Access Control Section */}
        <div className="border border-black/10 rounded-2xl p-6 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#7A1C1C]">Authorized Administrators</h2>
              <p className="text-xs text-black/60 mt-0.5">Manage accounts with access to this control center.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-black/5 px-2.5 py-1 rounded-full">{admins.length} Total</span>
          </div>

          <div className="space-y-3 pt-2">
            {admins.map((admin) => (
              <div key={admin.id} className="border border-black/10 p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                      {admin.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                    <span className="text-xs font-extrabold">{admin.name}</span>
                  </div>
                  <p className="text-xs font-mono text-black/60 mt-1">{admin.email}</p>
                </div>

                {admin.email !== adminEmail && (
                  <form action={async () => {
                    "use server";
                    await deleteAdministrator(admin.id);
                  }}>
                    <button type="submit" className="text-red-600 hover:underline text-xs font-bold cursor-pointer">
                      Revoke Access
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-black/10 py-6 text-center text-xs text-black/40">
        <p>© 2026 UniShelf Platform. Security & Settings.</p>
      </footer>
    </div>
  );
}