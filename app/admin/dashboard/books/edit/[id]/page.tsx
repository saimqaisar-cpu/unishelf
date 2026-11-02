import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// Server action to update book details
async function handleEditBook(formData: FormData) {
  "use server";
  const bookId = formData.get("bookId") as string;
  const title = (formData.get("title") as string)?.trim();
  const authors = (formData.get("authors") as string)?.trim();
  const publisher = (formData.get("publisher") as string)?.trim() || null;
  const edition = (formData.get("edition") as string)?.trim() || null;
  const isbn = (formData.get("isbn") as string)?.trim() || null;
  const fileUrl = (formData.get("fileUrl") as string)?.trim() || null;
  const courseId = formData.get("courseId") as string;
  const role = formData.get("role") as string;

  if (!bookId || !title || !authors || !courseId) return;

  try {
    await prisma.$transaction(async (tx) => {
      // Update book attributes
      await tx.book.update({
        where: { id: bookId },
        data: {
          title,
          authors,
          publisher,
          edition,
          isbn,
          pdfStorageUrl: fileUrl,
        },
      });

      // Update course mapping
      await tx.courseBookMapping.deleteMany({ where: { bookId } });
      await tx.courseBookMapping.create({
        data: {
          courseId,
          bookId,
          role: role || "TEXTBOOK",
        },
      });
    });
  } catch (error) {
    console.error("Failed to update book:", error);
  }

  revalidatePath("/");
  revalidatePath("/admin/dashboard/books");
  redirect("/admin/dashboard/books");
}

export default async function EditBookPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated_true") {
    redirect("/admin");
  }

  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: { courseMappings: true },
  });

  if (!book) redirect("/admin/dashboard/books");

  const courses = await prisma.course.findMany({
    include: { semester: true },
    orderBy: { name: "asc" },
  });

  const currentMapping = book.courseMappings[0];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      <header className="bg-white border-b border-black/10 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/admin/dashboard/books"
            className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C] hover:underline"
          >
            ← Back to Books
          </Link>
          <span className="font-bold text-black text-sm">Edit Textbook / Resource</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-black">Edit Book Details</h1>
          <p className="text-black/60 text-sm mt-1">
            Modify title, author, edition, replace PDF link, or change course assignment.
          </p>
        </div>

        <form action={handleEditBook} className="space-y-6 bg-black/[0.015] border border-black/10 rounded-2xl p-8">
          <input type="hidden" name="bookId" value={book.id} />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
              Select Course *
            </label>
            <select
              name="courseId"
              required
              defaultValue={currentMapping?.courseId || ""}
              className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
            >
              <option value="" disabled>-- Choose Course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name} ({course.semester.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
              Book Role *
            </label>
            <select
              name="role"
              required
              defaultValue={currentMapping?.role || "TEXTBOOK"}
              className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
            >
              <option value="TEXTBOOK">Textbook (Primary)</option>
              <option value="REFERENCE">Reference Book</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
              Book Title *
            </label>
            <input
              type="text"
              name="title"
              required
              defaultValue={book.title}
              className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
              Author(s) *
            </label>
            <input
              type="text"
              name="authors"
              required
              defaultValue={book.authors}
              className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                Publisher
              </label>
              <input
                type="text"
                name="publisher"
                defaultValue={book.publisher || ""}
                className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                Edition
              </label>
              <input
                type="text"
                name="edition"
                defaultValue={book.edition || ""}
                className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
              ISBN
            </label>
            <input
              type="text"
              name="isbn"
              defaultValue={book.isbn || ""}
              className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
              PDF / Download URL (Replace Link)
            </label>
            <input
              type="url"
              name="fileUrl"
              defaultValue={book.pdfStorageUrl || ""}
              className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[#7A1C1C] hover:bg-[#631616] text-white font-bold py-4 rounded-xl transition text-sm shadow-sm cursor-pointer"
            >
              Update & Save Changes →
            </button>
          </div>
        </form>
      </main>

      <footer className="bg-white border-t border-black/10 py-6 text-center text-xs text-black/50 mt-12">
        <p>© 2026 UniShelf Admin Panel. All rights reserved.</p>
      </footer>
    </div>
  );
}