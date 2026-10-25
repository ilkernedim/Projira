import { Activity, ArrowUpRight, ChartNoAxesCombined, FlaskConical, LayoutDashboard, PanelsTopLeft, Settings2 } from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';

const items = [
  {id:'overview', label:'Genel bakış', icon:LayoutDashboard},
  {id:'dengai', label:'Kapasite analizi', icon:Activity},
  {id:'board', label:'Görev panosu', icon:PanelsTopLeft},
  {id:'reports', label:'Sprint raporları', icon:ChartNoAxesCombined},
  {id:'jury', label:'Jüri rehberi', icon:FlaskConical},
] as const;
export default function Sidebar() {
  const {currentView,setCurrentView}=useBoardStore();
  return <nav aria-label="Ana menü" className="app-sidebar hidden md:flex">
    <button className="brand-lockup" onClick={()=>setCurrentView('overview')} aria-label="DENG-AI genel bakış"><span className="brand-symbol"><i/><i/><i/></span><span>DENG<span className="brand-ai">-AI</span><small>İşin ritmini bil.</small></span></button>
    <p className="nav-section">ÇALIŞMA ALANI</p>
    <div className="nav-items">{items.map(item=><button key={item.id} aria-current={currentView===item.id?'page':undefined} className={currentView===item.id?'selected':''} onClick={()=>setCurrentView(item.id)}><item.icon size={19}/><span>{item.label}</span>{item.id==='jury'&&<span className="nav-badge">DENE</span>}</button>)}</div>
    <div className="sidebar-demo"><span className="eyebrow">BİR KARAR. FARKLI SONUÇLAR.</span><p>İş yükünü değiştirin.<br/>Takvime etkisini görün.</p><button onClick={()=>setCurrentView('jury')}>Demoyu keşfet <ArrowUpRight size={17}/></button></div>
    <button className="sidebar-settings" onClick={()=>setCurrentView('settings')}><Settings2 size={17}/> Ayarlar</button>
    <div className="sidebar-foot"><span className="status-dot"/> Projira altyapısı · Demo sürümü</div>
  </nav>;
}
