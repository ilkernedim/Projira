import { ArrowUpRight, Search } from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';
const names = {overview:'Genel bakış',board:'Görev panosu',dengai:'Kapasite analizi',jury:'Jüri rehberi',reports:'Sprint raporları',settings:'Ayarlar'};
export default function Topbar(){
 const {searchQuery,setSearchQuery,currentView,setCurrentView}=useBoardStore();
 return <header className="app-topbar">
  <div className="hidden md:flex items-center gap-sm"><span className="text-on-surface-variant">Çalışma alanı</span><span className="text-outline">/</span><b>{names[currentView]}</b></div>
  <select aria-label="Sayfa seç" className="md:hidden bg-surface-container text-on-surface p-sm rounded" value={currentView} onChange={e=>setCurrentView(e.target.value as typeof currentView)}>{Object.entries(names).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select>
  <div className="flex items-center gap-md">{currentView==='board'&&<label className="hidden sm:flex items-center gap-sm"><Search size={16}/><input aria-label="Görev ara" className="bg-transparent border-b border-white/10 py-1 outline-none focus:border-primary w-40" placeholder="Görev ara…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/></label>}
  <button className="topbar-demo" onClick={()=>setCurrentView(currentView==='jury'?'overview':'jury')}>{currentView==='jury'?'Genel bakış':'Kendiniz deneyin'}<ArrowUpRight size={15}/></button></div>
 </header>;
}
