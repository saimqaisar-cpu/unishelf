"use client";

import { useState, useTransition } from "react";

interface DeleteButtonProps {
  programId: string;
  programName: string;
  onDelete: (id: string) => Promise<any>;
}

export default function DeleteProgramButton({ programId, programName, onDelete }: DeleteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="text-red-600 hover:underline text-[11px] font-bold cursor-pointer"
      >
        Delete Program
      </button>

      {/* Big Screen Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center space-x-3 text-red-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-base font-extrabold text-black">Confirm Program Deletion</h3>
            </div>
            
            <p className="text-xs text-black/70 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-black">"{programName}"</span>? All associated semesters, courses, and resources under this program will be permanently removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsConfirming(false)}
                className="px-4 py-2 bg-black/5 hover:bg-black/10 text-black rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    await onDelete(programId);
                  });
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Yes, Delete Program"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}