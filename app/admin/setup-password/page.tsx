"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { setupAdminPassword } from "@/app/actions/admin-invites";

export default function SetupPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Missing invitation token.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    const res = await setupAdminPassword(token, formData);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
      }, 3000);
    } else {
      setError(res.error || "Failed to set password.");
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full border border-black/10 p-8 rounded-2xl">
          <h1 className="text-lg font-bold text-red-600">Invalid Link</h1>
          <p className="text-xs text-black/60 mt-2">This invitation link is invalid or missing the security token.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between font-sans">
      <main className="max-w-md w-full mx-auto px-6 py-20 flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <span className="bg-[#7A1C1C] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
            Security Setup
          </span>
          <h1 className="text-3xl font-extrabold text-black mt-3">Set Your Password</h1>
          <p className="text-black/60 text-xs mt-1">Enter a secure password to activate your administrator account.</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-xs text-center font-bold">
            Password successfully set! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="border border-black/10 rounded-2xl p-8 bg-black/[0.01] space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase mb-2">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-2">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-xs font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7A1C1C] hover:bg-[#631616] text-white text-xs font-bold py-3.5 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Saving Password..." : "Activate Account →"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}