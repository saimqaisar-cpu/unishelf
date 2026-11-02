"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Semester {
  id: string;
  name: string;
  number: number;
  slug: string;
}

interface Scheme {
  id: string;
  name: string;
  semesters: Semester[];
}

interface Program {
  id: string;
  name: string;
  slug: string; // Program slug zaroori hai
  schemes: Scheme[];
}

interface SelectionFormProps {
  programs: Program[];
}

export default function SelectionForm({ programs }: SelectionFormProps) {
  const router = useRouter();
  
  const [selectedProgramId, setSelectedProgramId] = useState(programs[0]?.id || "");
  const [selectedSemesterSlug, setSelectedSemesterSlug] = useState("");

  const currentProgram = programs.find((p) => p.id === selectedProgramId);
  const allSemesters = currentProgram?.schemes.flatMap((scheme) => scheme.semesters) || [];

  const uniqueSemesters = Array.from(
    new Map(allSemesters.map((sem) => [sem.number, sem])).values()
  ).sort((a, b) => a.number - b.number);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSemesterSlug && currentProgram) {
      router.push(`/programs/${currentProgram.slug}/${selectedSemesterSlug}`);
    }
  };

  return (
    <form onSubmit={handleConfirm} className="space-y-6">
      <div className="space-y-5">
        {/* Program Field */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            Select Degree Program
          </label>
          <div className="relative">
            <select
              value={selectedProgramId}
              onChange={(e) => {
                setSelectedProgramId(e.target.value);
                setSelectedSemesterSlug("");
              }}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#7A1C1C]/20 focus:border-[#7A1C1C] transition cursor-pointer appearance-none"
            >
              {programs.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Semester Field */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            Select Semester
          </label>
          <div className="relative">
            <select
              value={selectedSemesterSlug}
              onChange={(e) => setSelectedSemesterSlug(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#7A1C1C]/20 focus:border-[#7A1C1C] transition cursor-pointer appearance-none"
            >
              <option value="" disabled>
                -- Choose Semester --
              </option>
              {uniqueSemesters.map((sem) => (
                <option key={sem.id} value={sem.slug}>
                  {sem.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!selectedSemesterSlug}
          className="w-full bg-[#7A1C1C] hover:bg-[#631616] disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 text-sm tracking-wide cursor-pointer shadow-lg shadow-[#7A1C1C]/20 active:scale-[0.99]"
        >
          Confirm & View Books →
        </button>
      </div>
    </form>
  );
}