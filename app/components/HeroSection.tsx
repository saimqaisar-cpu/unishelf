"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSection({ departments = [] }: { departments?: any[] }) {
  const router = useRouter();
  const [selectedProgId, setSelectedProgId] = useState("");
  const [selectedSemId, setSelectedSemId] = useState("");

  const safeDepartments = Array.isArray(departments) ? departments : [];
  const allPrograms = safeDepartments.flatMap((d) => d.programs || []);
  const currentProg = allPrograms.find((p) => p.id === selectedProgId);
  const semesters = currentProg?.schemes?.flatMap((s: any) => s.semesters) || [];

  const handleViewBooks = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSemId) {
      // Updated to public student semester/books page route
      router.push(`/semester/${selectedSemId}`);
    } else {
      alert("Baraye meherbani program aur semester select karein.");
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-10 overflow-hidden border-b border-gray-200 bg-white">
      {/* Background GCUF Old Campus Image direct with natural colors and light opacity */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-75 pointer-events-none z-0"
        style={{ backgroundImage: `url('/gcuf-old-campus-1024x512.jpg')` }}
      ></div>

      <div className="max-w-4xl mx-auto px-6 relative z-20 text-center space-y-5 w-full">
        
        {/* University Badge */}
        <div className="inline-flex items-center gap-2 bg-[#7A0C12]/10 text-[#7A0C12] px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider mx-auto border border-[#7A0C12]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7A0C12]"></span>
          Government College University Faisalabad (GCUF)
        </div>

        {/* Central Typography */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#14213D] leading-tight">
            Find Your Prescribed <span className="text-[#7A0C12]">Textbooks</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed font-medium">
            Access authorized curriculum guides, semester-wise course packs, and verified scholarly literature curated for GCUF scholars.
          </p>
        </div>

        {/* Refined Premium Academic Search Panel (Desktop width ~640px max, responsive on mobile) */}
        <form onSubmit={handleViewBooks} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200/90 text-left text-gray-900 space-y-4 w-full max-w-[640px] mx-auto">
          
          {/* Introductory Heading & Description */}
          <div className="space-y-1 pb-3 border-b border-gray-100">
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#14213D] flex items-center gap-2">
              <span className="text-[#7A0C12]">📖</span> Find Your Course Books
            </h3>
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              Select your academic program and semester to explore prescribed reading materials.
            </p>
          </div>

          <div className="space-y-3 pt-0.5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Degree Program <span className="text-[#7A0C12]">*</span>
              </label>
              <select 
                value={selectedProgId}
                onChange={(e) => {
                  setSelectedProgId(e.target.value);
                  setSelectedSemId("");
                }}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5]/60 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:border-[#7A0C12] transition-all cursor-pointer shadow-2xs"
                required
              >
                <option value="">-- Choose Degree Program --</option>
                {allPrograms.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Semester <span className="text-[#7A0C12]">*</span>
              </label>
              <select 
                value={selectedSemId}
                onChange={(e) => setSelectedSemId(e.target.value)}
                disabled={!selectedProgId}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5]/60 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:border-[#7A0C12] disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
                required
              >
                <option value="">-- Choose Semester --</option>
                {semesters.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} (Semester #{s.number})</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#7A0C12] hover:bg-[#63090e] text-white text-xs sm:text-sm font-medium py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer tracking-wide mt-1 group"
          >
            <span>View Prescribed Books</span>
            <svg className="w-4 h-4 text-white/90 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </form>

      </div>
    </section>
  );
}