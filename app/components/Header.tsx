"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="text-[#7A0C12] bg-[#7A0C12]/10 p-2 rounded-xl group-hover:bg-[#7A0C12]/20 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-serif font-bold text-[#14213D] tracking-tight">UniShelf</span>
            <span className="text-[9px] uppercase font-serif tracking-widest text-[#7A0C12] font-semibold">GCUF Library</span>
          </div>
        </Link>

        {/* Minimal Right Indicator */}
        <div className="text-xs font-medium text-gray-400 tracking-wider uppercase">
          GCUF Official Platform
        </div>
      </div>
    </header>
  );
}