"use client";

import { useState } from "react";
import { changeAdminPassword } from "@/app/actions/admin-auth";

export default function ChangePasswordForm({ adminEmail }: { adminEmail: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmNewPassword", confirmNewPassword);

    const res = await changeAdminPassword(adminEmail, formData);
    if (res.success) {
      setMessage(res.message || "Password changed successfully! Please log in again.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        window.location.href = "/admin";
      }, 2000);
    } else {
      setError(res.error || "Failed to change password.");
    }
    setLoading(false);
  }

  return (
    <div className="border border-black/10 rounded-2xl p-6 bg-white shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#7A1C1C]">Security Settings</h2>
          <p className="text-xs text-black/60 mt-0.5">Update your account password regularly to keep the dashboard secure.</p>
        </div>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-black hover:bg-[#7A1C1C] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            Change Password →
          </button>
        )}
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-6 mt-6 border-t border-black/10">
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-xs font-bold">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Current Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">New Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-3 py-2.5 bg-white border border-black/20 rounded-xl text-xs font-semibold"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#7A1C1C] hover:bg-[#631616] text-white text-xs font-bold py-3 px-6 rounded-xl transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Updating..." : "Update Password →"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError("");
                setMessage("");
              }}
              className="bg-black/5 hover:bg-black/10 text-black text-xs font-bold py-3 px-5 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}