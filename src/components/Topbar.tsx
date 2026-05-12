import { useBoardStore } from '../store/useBoardStore';

export default function Topbar() {
  const { searchQuery, setSearchQuery } = useBoardStore();

  return (
    <header className="flex justify-between items-center px-lg h-16 w-full shrink-0 bg-surface/80 backdrop-blur-md border-b border-white/10 z-40">
      <div className="flex items-center gap-lg">
        <button className="md:hidden text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="font-h1 text-h1 font-bold text-on-surface tracking-tight md:hidden">AeroFlow</div>
        
        <div className="hidden md:flex items-center text-on-surface-variant font-body-md text-body-md">
          <span>Projects</span>
          <span className="material-symbols-outlined text-[18px] mx-xs">chevron_right</span>
          <span>Projira</span>
          <span className="material-symbols-outlined text-[18px] mx-xs">chevron_right</span>
          <span className="text-on-surface font-medium">Sprint Board</span>
        </div>
      </div>
      
      <div className="flex items-center gap-md">
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input 
            className="bg-surface-container border border-outline-variant text-on-surface font-body-md text-body-md rounded-DEFAULT pl-10 pr-4 py-1.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 w-[240px] transition-all placeholder:text-outline" 
            placeholder="Search issues..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-xs">
          <button className="p-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-DEFAULT transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <button className="p-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-DEFAULT transition-colors active:scale-95 duration-200 hidden sm:block">
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>
        </div>
        
      </div>
    </header>
  );
}
