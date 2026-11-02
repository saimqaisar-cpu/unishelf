"use client";

import { useState, useTransition } from "react";

interface DeleteBookProps {
  bookId: string;
  bookTitle: string;
  onDelete: (id: string) => Promise<any>;
}

export default function DeleteBookButton({ bookId, bookTitle, onDelete }: DeleteBookProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="text-red-600 hover:underline text-xs font-bold cursor-pointer whitespace-nowrap"
      >
        Remove Book
      </button>

      {/* Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-black/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-base font-extrabold text-black">Confirm Book Removal</h3>
            </div>
            
            <p className="text-xs text-black/70 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-black">"{bookTitle}"</span>? This action will remove the book and its course mappings permanently.
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
                    await onDelete(bookId);
                  });
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Removing..." : "Yes, Remove Book"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}