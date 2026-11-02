import Link from "next/link";

export default function HierarchySection({ children }: { children?: React.ReactNode }) {
  return (
    <div className="space-y-6 pt-6 border-t border-black/10">
      <Link 
        href="/admin/dashboard/books/catalog"
        className="group flex items-center justify-between bg-white border border-black/15 hover:border-[#7A1C1C] p-5 rounded-2xl shadow-xs transition-all duration-300 cursor-pointer"
      >
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#7A1C1C]">Curriculum Overview</span>
          <h2 className="text-sm font-extrabold text-black group-hover:text-[#7A1C1C] transition-colors">
            View All Departments, Programs & Books Hierarchy Catalog
          </h2>
          <p className="text-[11px] text-black/50">Click to open the complete academic structure and managed textbooks catalog page.</p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-black/60 group-hover:text-[#7A1C1C] transition-colors">
            Open Catalog →
          </span>
        </div>
      </Link>

      {/* Render children passed inside HierarchySection */}
      {children}
    </div>
  );
}