import { Activity, ChartNoAxesCombined, FlaskConical, LayoutDashboard, PanelsTopLeft, Settings2 } from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';

const items = [
  {id:'overview', label:'Buradan başlayın', icon:LayoutDashboard},
  {id:'board', label:'Görevler', icon:PanelsTopLeft},
  {id:'jury', label:'Kendiniz deneyin', icon:FlaskConical},
] as const;
const extra = [
  {id:'dengai', label:'Ayrıntılı analiz', icon:Activity},
  {id:'reports', label:'Dönem raporları', icon:ChartNoAxesCombined},
  {id:'settings', label:'Ayarlar', icon:Settings2},
] as const;
export default function Sidebar() {
  const {currentView,setCurrentView}=useBoardStore();
  return <nav aria-label="Ana menü" className="app-sidebar hidden md:flex">
    <button className="brand-lockup" onClick={()=>setCurrentView('overview')} aria-label="DENG-AI başlangıç"><span className="brand-symbol"><i/><i/><i/></span><span>DENG<span className="brand-ai">-AI</span><small>İş yükünü dengeleyin.</small></span></button>
    <p className="nav-section">KISA DEMO</p>
    <div className="nav-items">{items.map(item=><button key={item.id} aria-current={currentView===item.id?'page':undefined} className={currentView===item.id?'selected':''} onClick={()=>setCurrentView(item.id)}><item.icon size={19}/><span>{item.label}</span></button>)}</div>
    <details className="advanced-navigation" open={extra.some(item=>item.id===currentView) || undefined}><summary>Diğer araçlar</summary><div className="nav-items">{extra.map(item=><button key={item.id} aria-current={currentView===item.id?'page':undefined} className={currentView===item.id?'selected':''} onClick={()=>setCurrentView(item.id)}><item.icon size={18}/>{item.label}</button>)}</div></details>
    <div className="sidebar-foot" style={{marginTop:'auto'}}>Örnek verilerle çalışan demo</div>
  </nav>;
}
