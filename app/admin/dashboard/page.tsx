import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// Server action to delete a book
async function handleDeleteBook(formData: FormData) {
  "use server";
  const bookId = formData.get("bookId") as string;
  if (!bookId) return;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.courseBookMapping.deleteMany({
        where: { bookId },
      });
      await tx.book.delete({
        where: { id: bookId },
      });
    });
  } catch (error) {
    console.error("Failed to delete book:", error);
  }

  revalidatePath("/");
  revalidatePath("/admin/dashboard/books");
}

export default async function AdminBooksPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated_true") {
    redirect("/admin");
  }

  // Fetch all books with their mapped courses
  const books = await prisma.book.findMany({
    include: {
      courseMappings: {
        include: {
          course: {
            include: { semester: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-black/10 py-5 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/admin/dashboard" className="text-xs font-bold text-[#7A1C1C] hover:underline">
              ← Back to Hub
            </Link>
            <span className="text-black/30">/</span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Manage Books</span>
          </div>
          <Link
            href="/admin/dashboard/new-book"
            className="bg-[#7A1C1C] hover:bg-[#631616] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            + Add New Book
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl w-full mx-auto px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Book Catalog Management</h1>
            <p className="text-black/60 text-xs mt-1">View, manage, or remove textbooks and reference resources from the library.</p>
          </div>
          <span className="text-xs font-mono font-bold bg-black/5 px-3 py-1 rounded-full">
            Total Books: {books.length}
          </span>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-black/20 rounded-2xl bg-black/[0.01]">
            <p className="text-sm font-semibold text-black/60">No books added yet.</p>
            <Link
              href="/admin/dashboard/new-book"
              className="inline-block mt-4 text-xs font-bold text-[#7A1C1C] hover:underline"
            >
              Click here to add your first book →
            </Link>
          </div>
        ) : (
          <div className="border border-black/10 rounded-2xl overflow-hidden shadow-xs bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/[0.02] border-b border-black/10 text-[11px] font-mono uppercase tracking-wider text-black/60">
                    <th className="py-3.5 px-6">Book Title & Author</th>
                    <th className="py-3.5 px-6">Publisher / Edition</th>
                    <th className="py-3.5 px-6">Mapped Course</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-xs">
                  {books.map((book) => {
                    const mapping = book.courseMappings[0];
                    const course = mapping?.course;
                    return (
                      <tr key={book.id} className="hover:bg-black/[0.01] transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-black text-sm">{book.title}</div>
                          <div className="text-black/60 text-xs mt-0.5">By {book.authors}</div>
                        </td>
                        <td className="py-4 px-6 text-black/70">
                          <div>{book.publisher || "N/A"}</div>
                          <div className="text-[11px] text-black/50 mt-0.5">{book.edition || "Standard Edition"}</div>
                        </td>
                        <td className="py-4 px-6">
                          {course ? (
                            <div>
                              <span className="font-mono font-bold text-[#7A1C1C]">{course.code}</span>
                              <div className="text-black/60 text-[11px] truncate max-w-xs">{course.name} ({course.semester?.name})</div>
                            </div>
                          ) : (
                            <span className="text-black/40 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right space-x-3">
                          {book.pdfStorageUrl && (
                            <a
                              href={book.pdfStorageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-black/70 hover:text-black font-semibold underline"
                            >
                              PDF Link
                            </a>
                          )}
                          <form action={handleDeleteBook} className="inline-block">
                            <input type="hidden" name="bookId" value={book.id} />
                            <button
                              type="submit"
                              className="text-red-600 hover:text-red-800 font-bold transition cursor-pointer bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200"
                            >
                              Delete
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-black/10 py-6 text-center text-xs text-black/40">
        <p>© 2026 UniShelf Platform. Book Management Module.</p>
      </footer>
    </div>
  );
}