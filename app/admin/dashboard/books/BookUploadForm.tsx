"use client";

import { useState } from "react";

interface Semester {
  id: string;
  name: string;
  number: number;
}

interface Program {
  id: string;
  name: string;
  code: string;
  schemes: {
    semesters: Semester[];
  }[];
}

interface Department {
  id: string;
  name: string;
  code: string;
  programs: Program[];
}

export default function BookUploadForm({ departments, action }: { departments: Department[]; action: (formData: FormData) => void }) {
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedProgId, setSelectedProgId] = useState("");
  const [resourceType, setResourceType] = useState("PDF"); // "PDF" ya "EXTERNAL"

  const currentDept = departments.find((d) => d.id === selectedDeptId);
  const programs = currentDept?.programs || [];

  const currentProg = programs.find((p) => p.id === selectedProgId);
  const semesters = currentProg?.schemes.flatMap((s) => s.semesters) || [];

  return (
    <form action={action} className="space-y-4 bg-white border border-black/10 rounded-2xl p-6 shadow-xs">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[#7A1C1C]">Upload & Map Semester Book</h2>
      <p className="text-[11px] text-black/60">Select department, program, semester, and choose whether to upload a PDF from device or add an external link.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {/* Book Title */}
        <div>
          <label className="block text-xs font-bold uppercase mb-1">Book Title *</label>
          <input type="text" name="title" required placeholder="e.g. Operating Systems" className="w-full px-3 py-2.5 bg-black/[0.02] border border-black/20 rounded-xl text-xs font-semibold" />
        </div>

        {/* Authors */}
        <div>
          <label className="block text-xs font-bold uppercase mb-1">Author(s)</label>
          <input type="text" name="authors" placeholder="e.g. Abraham Silberschatz" className="w-full px-3 py-2.5 bg-black/[0.02] border border-black/20 rounded-xl text-xs font-semibold" />
        </div>

        {/* Resource Type Selection */}
        <div>
          <label className="block text-xs font-bold uppercase mb-1">Resource Option *</label>
          <select 
            name="bookType" 
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            className="w-full px-3 py-2.5 bg-black/[0.02] border border-black/20 rounded-xl text-xs font-semibold"
          >
            <option value="PDF">Upload PDF from Device</option>
            <option value="EXTERNAL">Add External Web Link</option>
          </select>
        </div>

        {/* Dynamic Field: Device File Upload OR External Link */}
        {resourceType === "PDF" ? (
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Upload PDF File *</label>
            <input type="file" name="file" accept=".pdf" required className="w-full text-xs text-black/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#7A1C1C] file:text-white hover:file:bg-[#631616] cursor-pointer bg-black/[0.02] border border-black/20 rounded-xl" />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold uppercase mb-1">External Web Link *</label>
            <input type="url" name="externalUrl" required placeholder="https://example.com/book" className="w-full px-3 py-2.5 bg-black/[0.02] border border-black/20 rounded-xl text-xs font-semibold" />
          </div>
        )}

        {/* 1. Department */}
        <div>
          <label className="block text-xs font-bold uppercase mb-1">1. Select Department *</label>
          <select 
            value={selectedDeptId} 
            onChange={(e) => {
              setSelectedDeptId(e.target.value);
              setSelectedProgId("");
            }} 
            className="w-full px-3 py-2.5 bg-black/[0.02] border border-black/20 rounded-xl text-xs font-semibold"
            required
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>

        {/* 2. Program */}
        <div>
          <label className="block text-xs font-bold uppercase mb-1">2. Select Program *</label>
          <select 
            value={selectedProgId} 
            disabled={!selectedDeptId}
            onChange={(e) => setSelectedProgId(e.target.value)} 
            className="w-full px-3 py-2.5 bg-black/[0.02] border border-black/20 rounded-xl text-xs font-semibold disabled:opacity-50"
            required
          >
            <option value="">Select Program</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
            ))}
          </select>
        </div>

        {/* 3. Semester */}
        <div>
          <label className="block text-xs font-bold uppercase mb-1">3. Select Semester *</label>
          <select 
            name="semesterId" 
            required
            disabled={!selectedProgId}
            className="w-full px-3 py-2.5 bg-black/[0.02] border border-black/20 rounded-xl text-xs font-semibold disabled:opacity-50"
          >
            <option value="">Select Semester</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>{s.name} (Semester #{s.number})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" className="w-full bg-[#7A1C1C] hover:bg-[#631616] text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer">
          + Save & Publish Book to Semester
        </button>
      </div>
    </form>
  );
}