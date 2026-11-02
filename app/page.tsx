import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const departments = await prisma.department.findMany({
    include: {
      programs: {
        include: {
          schemes: {
            include: {
              semesters: {
                orderBy: { number: "asc" },
              },
            },
          },
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-white font-sans text-[#14213D]">
      <Header />
      <HeroSection departments={departments} />
      
      {/* Explore Your Academic Collection Section */}
      <section className="py-20 text-center bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-[1px] w-[160px] bg-[#7A0C12]"></div>
            <h2 className="text-[38px] font-serif font-bold text-[#14213D] tracking-tight">Explore Your Academic Collection</h2>
            <div className="h-[1px] w-[160px] bg-[#7A0C12]"></div>
          </div>
          <p className="text-black/70 text-sm max-w-xl mx-auto">
            Browse prescribed books and academic resources organized by your degree program and semester.
          </p>
        </div>

        {/* Light Grey Strip (#F6F4F4) with 3 columns */}
        <div className="bg-[#F6F4F4] py-12 mt-14 border-y border-black/5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-black/10">
            
            {/* Column 1 */}
            <div className="flex items-center gap-5 px-6">
              <div className="text-[#7A0C12] bg-[#7A0C12]/10 p-3.5 rounded-2xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <div className="text-left font-serif">
                <h3 className="font-bold text-lg text-[#14213D]">Organized by</h3>
                <p className="text-sm text-black/70 font-sans mt-0.5">Academic Program</p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex items-center gap-5 px-6 pt-6 md:pt-0">
              <div className="text-[#7A0C12] bg-[#7A0C12]/10 p-3.5 rounded-2xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div className="text-left font-serif">
                <h3 className="font-bold text-lg text-[#14213D]">Semester-Based</h3>
                <p className="text-sm text-black/70 font-sans mt-0.5">Book Discovery</p>
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex items-center gap-5 px-6 pt-6 md:pt-0">
              <div className="text-[#7A0C12] bg-[#7A0C12]/10 p-3.5 rounded-2xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div className="text-left font-serif">
                <h3 className="font-bold text-lg text-[#14213D]">Easy Access to</h3>
                <p className="text-sm text-black/70 font-sans mt-0.5">Learning Resources</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about-section" className="py-20 bg-[#FAF8F5] border-t border-black/10 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6 space-y-10">
          
          <div className="text-center space-y-3">
            <span className="bg-[#7A0C12]/10 text-[#7A0C12] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              About UniShelf & GCUF Library
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#14213D]">
              Empowering Scholars with Digital Academic Resources
            </h2>
            <p className="text-sm text-black/70 max-w-2xl mx-auto leading-relaxed">
              UniShelf serves as the official digital library repository for Government College University Faisalabad (GCUF), meticulously designed to bridge the academic resource gap for students and faculty. Our platform provides seamless access to authorized curriculum guides, semester-wise course packs, and verified scholarly literature tailored to various degree programs. By centralizing essential academic materials into an intuitive, secure portal, we aim to uphold the university's commitment to academic excellence, transparency, and accessible higher education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#7A0C12]/10 text-[#7A0C12] flex items-center justify-center font-bold text-lg">📚</div>
              <h3 className="font-bold text-[#14213D] text-base">Authorized Textbooks</h3>
              <p className="text-xs text-black/70 leading-relaxed">
                All prescribed textbooks and semester course packs are verified by respective academic departments of GCUF.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#7A0C12]/10 text-[#7A0C12] flex items-center justify-center font-bold text-lg">⚡</div>
              <h3 className="font-bold text-[#14213D] text-base">Instant Access</h3>
              <p className="text-xs text-black/70 leading-relaxed">
                Quickly filter by degree programs and semesters to find exact reading materials without any hassle.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#7A0C12]/10 text-[#7A0C12] flex items-center justify-center font-bold text-lg">🏛️</div>
              <h3 className="font-bold text-[#14213D] text-base">GCUF Heritage</h3>
              <p className="text-xs text-black/70 leading-relaxed">
                Built to uphold the academic excellence and scholarly traditions of Government College University Faisalabad.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#10213F] text-white pt-16 pb-12 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-serif font-bold text-white tracking-tight">UniShelf</span>
                <span className="text-[10px] uppercase font-serif tracking-widest text-white/60">Academic Library</span>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              A digital academic library designed to help students discover prescribed textbooks and academic resources in one organized place.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Explore</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link href="#" className="hover:text-white transition">Browse Books</Link></li>
              <li><Link href="#" className="hover:text-white transition">Academic Programs</Link></li>
              <li><Link href="#" className="hover:text-white transition">Semester Resources</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Help</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link href="#" className="hover:text-white transition">How to Use UniShelf</Link></li>
              <li><Link href="#" className="hover:text-white transition">Report an Issue</Link></li>
              <li><Link href="#" className="hover:text-white transition">Contact / Feedback</Link></li>
            </ul>
          </div>

          <div className="space-y-3 text-xs text-white/70">
            <p>© 2026 UniShelf. All rights reserved.</p>
            <p className="italic text-white/50 text-[11px] leading-relaxed">
              UniShelf is an independent academic resource platform. Availability and access to resources may vary.
            </p>
          </div>

        </div>
      </footer>
    </main>
  );
}