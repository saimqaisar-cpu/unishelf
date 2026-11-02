"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { handleAdminLogin, handleAdminLogout } from "../actions/admin-auth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Force clear session immediately when landing on /admin login page
  useEffect(() => {
    async function clearSession() {
      await handleAdminLogout();
    }
    clearSession();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const formData = new FormData();
    formData.append("unishelf_user_id", email);
    formData.append("unishelf_user_pass", password);

    const res = await handleAdminLogin(formData);
    if (res.success) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between font-sans">
      {/* Top Bar */}
      <header className="border-b border-black/10 py-5 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C] hover:underline">
            ← Back to Public Site
          </Link>
          <span className="text-xs font-mono font-bold text-black/50">UniShelf Secure Portal</span>
        </div>
      </header>

      {/* Login Form Container */}
      <main className="max-w-md w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <span className="bg-[#7A1C1C] text-white font-black px-3 py-1 rounded text-xs tracking-widest uppercase">
            Restricted Area
          </span>
          <h1 className="text-3xl font-extrabold text-black mt-4">Admin Authentication</h1>
          <p className="text-black/60 text-sm mt-1">
            Sign in using your administrator email.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold text-center">
            Invalid email or password. Please try again.
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5 bg-black/[0.015] border border-black/10 rounded-2xl p-8 shadow-xs" autoComplete="off">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
              Email Address
            </label>
            <input
              type="text"
              name="unishelf_user_id"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your admin email"
              autoComplete="off"
              className="w-full px-4 py-3.5 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
              Password
            </label>
            <input
              type="password"
              name="unishelf_user_pass"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoComplete="new-password"
              className="w-full px-4 py-3.5 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7A1C1C] hover:bg-[#631616] text-white font-bold py-4 rounded-xl transition text-sm shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In to Dashboard →"}
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 py-6 text-center text-xs text-black/40">
        <p>© 2026 UniShelf Platform. Authorized Personnel Only.</p>
      </footer>
    </div>
  );
}