import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { redirect } from "next/navigation";

// Server action to handle form submission
async function handleAddBook(formData: FormData) {
  "use server";

  const title = formData.get("title") as string;
  const authors = formData.get("authors") as string;
  const publisher = formData.get("publisher") as string;
  const edition = formData.get("edition") as string;
  const isbn = formData.get("isbn") as string;
  const fileUrl = formData.get("fileUrl") as string;
  const courseId = formData.get("courseId") as string;
  const role = formData.get("role") as string;

  if (!title || !authors || !courseId) {
    return;
  }

  // Create the book (using pdfStorageUrl matching the Prisma schema)
  const newBook = await prisma.book.create({
    data: {
      title,
      authors,
      publisher: publisher || null,
      edition: edition || null,
      isbn: isbn || null,
      pdfStorageUrl: fileUrl || null,
    },
  });

  // Map the book to the selected course (using courseBookMapping matching the Prisma schema)
  await prisma.courseBookMapping.create({
    data: {
      courseId,
      bookId: newBook.id,
      role: role || "TEXTBOOK",
    },
  });

  redirect("/admin/dashboard");
}

export default async function AddBookPage() {
  // Fetch available courses for the dropdown
  const courses = await prisma.course.findMany({
    include: { semester: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-black/10 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C] hover:underline"
          >
            ← Back to Dashboard
          </Link>
          <span className="font-bold text-black text-sm">Add New Textbook</span>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-black">Assign Textbook to Course</h1>
          <p className="text-black/60 text-sm mt-1">
            Fill in the details below to add a new textbook and map it to an existing course.
          </p>
        </div>

        <form action={handleAddBook} className="space-y-6 bg-black/[0.015] border border-black/10 rounded-2xl p-8">
          {/* Course Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
              Select Course *
            </label>
            <select
              name="courseId"
              required
              defaultValue=""
              className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
            >
              <option value="" disabled>
                -- Choose Course --
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name} ({course.semester.name})
                </option>
              ))}
            </select>
          </div>

          {/* Book Role */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
              Book Role *
            </label>
            <select
              name="role"
              required
              defaultValue="TEXTBOOK"
              className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
            >
              <option value="TEXTBOOK">Textbook (Primary)</option>
              <option value="REFERENCE">Reference Book</option>
            </select>
          </div>

          {/* Book Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
              Book Title *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Java: How to Program"
              className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
            />
          </div>

          {/* Authors */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
              Author(s) *
            </label>
            <input
              type="text"
              name="authors"
              required
              placeholder="e.g. Paul Deitel, Harvey Deitel"
              className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Publisher */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                Publisher
              </label>
              <input
                type="text"
                name="publisher"
                placeholder="e.g. Pearson"
                className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
              />
            </div>

            {/* Edition */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                Edition
              </label>
              <input
                type="text"
                name="edition"
                placeholder="e.g. 11th Edition"
                className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
              />
            </div>
          </div>

          {/* ISBN */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
              ISBN
            </label>
            <input
              type="text"
              name="isbn"
              placeholder="e.g. 978-0134743356"
              className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
            />
          </div>

          {/* File URL / PDF Link */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
              PDF / Download URL
            </label>
            <input
              type="url"
              name="fileUrl"
              placeholder="https://example.com/book.pdf"
              className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[#7A1C1C] hover:bg-[#631616] text-white font-bold py-4 rounded-xl transition text-sm shadow-sm cursor-pointer"
            >
              Save & Publish Textbook →
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-black/10 py-6 text-center text-xs text-black/50 mt-12">
        <p>© 2026 UniShelf Admin Panel. All rights reserved.</p>
      </footer>
    </div>
  );
}