"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="text-[#7A0C12] bg-[#7A0C12]/10 p-2.5 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-serif font-bold text-[#14213D] tracking-tight">UniShelf</span>
            <span className="text-[10px] uppercase font-serif tracking-widest text-[#7A0C12] font-semibold">GCUF Library</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-gray-700">
          <Link href="/" className="hover:text-[#7A0C12] transition">Home</Link>
          <Link href="/admin" className="hover:text-[#7A0C12] transition">Admin Portal</Link>
        </nav>

        {/* Right Action */}
        <div>
          <Link
            href="/admin"
            className="bg-[#7A0C12] hover:bg-[#631616] text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow-sm"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </header>
  );
}