"use client";

import { useState } from "react";
import { deleteAdministrator } from "@/app/actions/admin-invites";
import { useRouter } from "next/navigation";

export default function DeleteAdminButton({ adminId, adminEmail }: { adminId: string; adminEmail: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (confirmInput !== adminEmail) {
      alert("Entered email does not match. Deletion cancelled.");
      return;
    }

    setLoading(true);
    const res = await deleteAdministrator(adminId);
    if (res.success) {
      router.push(`/admin/dashboard/admins?message=${encodeURIComponent(res.message || "Admin deleted successfully.")}`);
      router.refresh();
    } else {
      alert(res.error || "Failed to delete admin.");
      setLoading(false);
      setShowConfirm(false);
    }
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="text-xs font-bold text-red-600 hover:underline border border-red-200 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition"
      >
        Remove Access
      </button>
    );
  }

  return (
    <form onSubmit={handleDelete} className="bg-red-50 border border-red-300 p-3 rounded-xl space-y-2 mt-2">
      <p className="text-[11px] font-bold text-red-800">
        Confirm deletion by typing this email: <span className="font-mono text-black">{adminEmail}</span>
      </p>
      <input
        type="text"
        required
        value={confirmInput}
        onChange={(e) => setConfirmInput(e.target.value)}
        placeholder="Type admin email to confirm"
        className="w-full px-2 py-1.5 bg-white border border-red-300 rounded text-xs font-semibold focus:outline-none"
      />
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={loading || confirmInput !== adminEmail}
          className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-1.5 rounded transition disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Confirm & Delete"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowConfirm(false);
            setConfirmInput("");
          }}
          className="bg-black/10 hover:bg-black/20 text-black text-[10px] font-bold px-3 py-1.5 rounded transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}