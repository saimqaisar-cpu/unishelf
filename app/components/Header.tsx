import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white h-[64px] border-b border-black/10 sticky top-0 z-50 flex items-center shadow-xs">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="text-[#7A0C12]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-serif font-bold text-[#14213D] leading-none tracking-tight">UniShelf</span>
            <span className="text-[8px] font-serif text-black/60 tracking-wider mt-0.5 uppercase">Academic Library</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#14213D]">
          <Link href="/" className="text-[#7A0C12] font-bold pb-0.5 border-b-2 border-[#7A0C12]">Home</Link>
          <Link href="#browse" className="hover:text-[#7A0C12] transition-colors">Browse Books</Link>
          <Link href="#about-section" className="hover:text-[#7A0C12] transition-colors scroll-smooth">About</Link>
        </div>

        {/* Styled Right Button */}
        <button className="flex items-center gap-2 bg-[#7A0C12] hover:bg-[#63090e] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
          Academic Resources
        </button>
      </div>
    </header>
  );
}