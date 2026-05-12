import { useBoardStore } from '../store/useBoardStore';

export default function Sidebar() {
  const { currentView, setCurrentView } = useBoardStore();

  return (
    <nav className="fixed left-0 top-0 h-full w-[260px] z-50 bg-surface-container-low border-r border-white/5 flex flex-col py-md hidden md:flex">
      <div className="px-lg mb-xl flex items-center gap-sm">
        <div className="w-8 h-8 rounded-DEFAULT bg-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspaces</span>
        </div>
        <div>
          <h1 className="font-h2 text-h2 text-on-surface">Projira</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Enterprise Plan</p>
        </div>
      </div>
      
      <div className="flex-1 px-sm space-y-1">
        <button 
          onClick={() => setCurrentView('board')}
          className={`w-full flex items-center gap-md px-md py-sm rounded-DEFAULT transition-all ${
            currentView === 'board' 
              ? 'text-primary bg-secondary-container/20 border-l-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest group'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={currentView === 'board' ? { fontVariationSettings: "'FILL' 1" } : {}}>grid_view</span>
          <span className={`font-body-md text-body-md ${currentView === 'board' ? 'font-medium' : ''}`}>Boards</span>
        </button>
        
        <button 
          onClick={() => setCurrentView('reports')}
          className={`w-full flex items-center gap-md px-md py-sm rounded-DEFAULT transition-all ${
            currentView === 'reports' 
              ? 'text-primary bg-secondary-container/20 border-l-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest group'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={currentView === 'reports' ? { fontVariationSettings: "'FILL' 1" } : {}}>bar_chart</span>
          <span className={`font-body-md text-body-md ${currentView === 'reports' ? 'font-medium' : ''}`}>Reports</span>
        </button>
      </div>
      
      <div className="px-sm mt-auto space-y-1 mb-lg">
        <button 
          onClick={() => setCurrentView('settings')}
          className={`w-full flex items-center gap-md px-md py-sm rounded-DEFAULT transition-all ${
            currentView === 'settings' 
              ? 'text-primary bg-secondary-container/20 border-l-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest group'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={currentView === 'settings' ? { fontVariationSettings: "'FILL' 1" } : {}}>settings</span>
          <span className={`font-body-md text-body-md ${currentView === 'settings' ? 'font-medium' : ''}`}>Settings</span>
        </button>
      </div>
    </nav>
  );
}
