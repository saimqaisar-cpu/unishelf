import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SemesterDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Find semester by ID (since we are passing semester.id from the hero selector)
  const semester = await prisma.semester.findUnique({
    where: { id: slug },
    include: {
      scheme: {
        include: {
          program: {
            include: {
              department: {
                include: {
                  university: true,
                },
              },
            },
          },
        },
      },
      courses: {
        where: { isPublished: true },
        include: {
          courseBooks: {
            include: {
              book: true,
            },
          },
        },
        orderBy: { code: "asc" },
      },
    },
  });

  if (!semester) {
    notFound();
  }

  const program = semester.scheme.program;
  const department = program.department;
  const university = department.university;

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      {/* Top Academic Navigation Bar */}
      <header className="border-b border-black/10 py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C] hover:underline flex items-center space-x-1"
          >
            <span>← Back to Curriculum Index</span>
          </Link>
          <span className="text-xs font-mono font-bold text-black/50">
            {university.name} — {program.code}
          </span>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-1">
        {/* Semester Header Info */}
        <div className="mb-10 border-b border-black/10 pb-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className="bg-[#7A1C1C] text-white font-black px-3 py-1 rounded text-xs tracking-widest uppercase">
              {semester.name}
            </span>
            <span className="text-xs font-bold text-black/50 uppercase tracking-wider">
              {semester.scheme.name}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
            {program.name} Courses & Prescribed Textbooks
          </h1>
          <p className="text-black/60 text-sm mt-2 max-w-2xl">
            Verified academic reading materials and digital resources prescribed for {semester.name} under the {department.name} framework.
          </p>
        </div>

        {/* Courses & Books List */}
        {semester.courses.length === 0 ? (
          <div className="bg-black/[0.02] border border-black/10 rounded-2xl p-12 text-center">
            <h3 className="text-base font-bold text-black">No Courses Published Yet</h3>
            <p className="text-xs text-black/50 mt-1">Course outlines and prescribed textbooks are currently being updated for this semester.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {semester.courses.map((course) => (
              <div key={course.id} className="bg-white border border-black/10 rounded-2xl p-6 sm:p-8 shadow-xs">
                {/* Course Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/10 pb-4 mb-6 gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black bg-black text-white px-2.5 py-1 rounded-md">
                        {course.code}
                      </span>
                      {course.creditHours && (
                        <span className="text-xs font-bold text-black/50">
                          {course.creditHours} Credit Hours
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold text-black mt-2">
                      {course.name}
                    </h2>
                  </div>
                </div>

                {/* Mapped Books Section */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black/50 mb-4">
                    Prescribed Textbooks & Reading Material
                  </h3>

                  {course.courseBooks.length === 0 ? (
                    <p className="text-xs text-black/40 italic bg-black/[0.02] p-4 rounded-xl border border-black/5">
                      No textbook has been mapped to this course yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.courseBooks.map(({ book }) => (
                        <div
                          key={book.id}
                          className="flex items-start space-x-4 p-4 rounded-xl border border-black/10 bg-black/[0.01] hover:border-black/30 transition"
                        >
                          {/* Book Cover */}
                          <div className="w-16 h-22 bg-black/10 rounded-lg shrink-0 overflow-hidden border border-black/10 flex items-center justify-center">
                            {book.coverImageUrl ? (
                              <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-black/40 text-center px-1">No Cover</span>
                            )}
                          </div>

                          {/* Book Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-black truncate" title={book.title}>
                              {book.title}
                            </h4>
                            {book.authors && (
                              <p className="text-xs text-black/60 truncate mt-0.5">
                                By {book.authors}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-medium text-black/50">
                              {book.edition && <span>{book.edition}</span>}
                              {book.publisher && <span>{book.publisher}</span>}
                            </div>

                            {/* Action Button: Read Book vs Open Book */}
                            <div className="mt-4">
                              {book.bookType === "PDF" && book.pdfStorageUrl ? (
                                <a
                                  href={book.pdfStorageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center bg-[#7A1C1C] hover:bg-[#631616] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                                >
                                  Read Book →
                                </a>
                              ) : book.externalUrl ? (
                                <a
                                  href={book.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center bg-[#2B5D8A] hover:bg-[#1f4365] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                                >
                                  Open Book →
                                </a>
                              ) : (
                                <span className="text-xs text-black/40 italic">Resource unavailable</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 py-6 text-center text-xs text-black/40">
        <p>© 2026 UniShelf Platform. Academic Resource Portal.</p>
      </footer>
    </div>
  );
}