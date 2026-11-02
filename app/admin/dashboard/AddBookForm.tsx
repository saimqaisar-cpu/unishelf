"use client";

import { useState, useEffect } from "react";
import { getPrograms, getSemestersByProgram, getCoursesBySemester, createBookRecord } from "@/app/actions/admin-books";

export default function AddBookForm({ onSuccess }: { onSuccess?: () => void }) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  
  const [bookType, setBookType] = useState<"PDF" | "EXTERNAL">("PDF");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load Programs on mount
  useEffect(() => {
    getPrograms().then(setPrograms).catch(console.error);
  }, []);

  // Load Semesters when Program changes
  useEffect(() => {
    if (selectedProgram) {
      setSelectedSemester("");
      setSelectedCourse("");
      setSemesters([]);
      setCourses([]);
      getSemestersByProgram(selectedProgram).then(setSemesters).catch(console.error);
    }
  }, [selectedProgram]);

  // Load Courses when Semester changes
  useEffect(() => {
    if (selectedSemester) {
      setSelectedCourse("");
      setCourses([]);
      getCoursesBySemester(selectedSemester).then(setCourses).catch(console.error);
    }
  }, [selectedSemester]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("bookType", bookType);
    formData.append("courseId", selectedCourse);

    const res = await createBookRecord(formData);
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Book added successfully and published!");
      form.reset();
      setSelectedProgram("");
      setSelectedSemester("");
      setSelectedCourse("");
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(res.error || "Failed to add book.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-black/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl mx-auto">
      <div className="border-b border-black/10 pb-4">
        <h2 className="text-xl font-extrabold text-black">Add New Prescribed Textbook</h2>
        <p className="text-xs text-black/60 mt-1">Follow the steps below to map and publish academic resources securely.</p>
      </div>

      {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold">{errorMsg}</div>}
      {successMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-bold">{successMsg}</div>}

      {/* STEP 1: Select Program */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-black">
          1. Select Program <span className="text-[#7A1C1C]">*</span>
        </label>
        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          required
          className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
        >
          <option value="">-- Choose Academic Program --</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.department?.name})
            </option>
          ))}
        </select>
      </div>

      {/* STEP 2: Select Semester */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-black">
          2. Select Semester <span className="text-[#7A1C1C]">*</span>
        </label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          disabled={!selectedProgram}
          required
          className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C] disabled:bg-black/5 disabled:cursor-not-allowed"
        >
          <option value="">-- Choose Semester --</option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* STEP 3: Enter Book Title & Course Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-black">
            Book Title / Name <span className="text-[#7A1C1C]">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. Database System Concepts"
            className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-black">
            Select Course <span className="text-[#7A1C1C]">*</span>
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={!selectedSemester}
            required
            className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C] disabled:bg-black/5 disabled:cursor-not-allowed"
          >
            <option value="">-- Choose Course --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STEP 4: Choose Book Type (Option A vs Option B) */}
      <div className="space-y-3 pt-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-black">
          4. Choose Resource Type <span className="text-[#7A1C1C]">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setBookType("PDF")}
            className={`border rounded-2xl p-4 cursor-pointer transition flex items-start space-x-3 ${
              bookType === "PDF" ? "border-[#7A1C1C] bg-[#7A1C1C]/5" : "border-black/20 hover:border-black/40"
            }`}
          >
            <input type="radio" checked={bookType === "PDF"} onChange={() => setBookType("PDF")} className="mt-1 accent-[#7A1C1C]" />
            <div>
              <p className="text-sm font-bold text-black">Option A: Upload Complete Book</p>
              <p className="text-xs text-black/60 mt-0.5">Upload secure verified PDF directly to UniShelf storage.</p>
            </div>
          </div>

          <div
            onClick={() => setBookType("EXTERNAL")}
            className={`border rounded-2xl p-4 cursor-pointer transition flex items-start space-x-3 ${
              bookType === "EXTERNAL" ? "border-[#7A1C1C] bg-[#7A1C1C]/5" : "border-black/20 hover:border-black/40"
            }`}
          >
            <input type="radio" checked={bookType === "EXTERNAL"} onChange={() => setBookType("EXTERNAL")} className="mt-1 accent-[#7A1C1C]" />
            <div>
              <p className="text-sm font-bold text-black">Option B: Cover + External Link</p>
              <p className="text-xs text-black/60 mt-0.5">Link directly to publisher or authorized open-access page.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional Fields based on Book Type */}
      {bookType === "PDF" ? (
        <div className="space-y-4 p-4 bg-black/[0.02] rounded-2xl border border-black/10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C]">Option A Fields (PDF Upload)</h3>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Upload PDF File <span className="text-[#7A1C1C]">*</span></label>
            <input type="file" name="pdfFile" accept="application/pdf" required className="w-full text-xs text-black/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#7A1C1C] file:text-white hover:file:bg-[#631616]" />
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4 bg-black/[0.02] rounded-2xl border border-black/10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A1C1C]">Option B Fields (External Link)</h3>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Direct External Book URL <span className="text-[#7A1C1C]">*</span></label>
            <input type="url" name="externalUrl" required placeholder="https://publisher.com/book-page" className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]" />
          </div>
        </div>
      )}

      {/* Optional Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Author Name(s)</label>
          <input type="text" name="authors" placeholder="e.g. Abraham Silberschatz" className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Publisher</label>
          <input type="text" name="publisher" placeholder="e.g. McGraw-Hill" className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Edition</label>
          <input type="text" name="edition" placeholder="e.g. 7th Edition" className="w-full px-4 py-3 bg-white border border-black/20 rounded-xl text-black text-sm font-semibold focus:outline-none focus:border-[#7A1C1C]" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">Book Cover Image</label>
          <input type="file" name="coverFile" accept="image/*" className="w-full text-xs text-black/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-black/10 file:text-black hover:file:bg-black/20" />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading || !selectedCourse}
          className="w-full bg-[#7A1C1C] hover:bg-[#631616] text-white font-bold py-4 rounded-xl transition text-sm shadow-sm cursor-pointer disabled:opacity-50"
        >
          {loading ? "Publishing Resource..." : "Publish Book to Course Outline →"}
        </button>
      </div>
    </form>
  );
}