import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronRight, FlaskConical, Layers3, MoveRight, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';
import { analizEt, oneriBul, tarihYaz } from '../lib/dengai';

const steps = [
  { name: 'Mevcut plan', detail: 'Görünmeyen yükü keşfet', icon: Layers3 },
  { name: 'Yeni talep', detail: '12 saat daha iş gelirse?', icon: TrendingUp },
  { name: 'Dengeli dağılım', detail: 'Mevcut işi yeniden dağıt', icon: Sparkles },
];

export default function Overview() {
  const board = useBoardStore(s => s.board);
  const history = useBoardStore(s => s.pastSprints);
  const resetDemo = useBoardStore(s => s.resetDemo);
  const navigate = useBoardStore(s => s.setCurrentView);
  const [step, setStep] = useState(0);
  const [date] = useState(() => new Date());
  const base = useMemo(() => analizEt(board, history, date), [board, history, date]);
  const proposal = useMemo(() => oneriBul(board, history, date), [board, history, date]);
  const current = useMemo(() => step === 2 && proposal ? proposal.yeni : step === 1
    ? analizEt(board, history, date, { [base.darbogaz.uye.id]: 12 }) : base,
  [step, proposal, board, history, date, base]);
  const delta = current.gercekciIsGunu - base.gercekciIsGunu;
  const overloaded = current.uyeler.filter(u => u.yukYuzde > 100).length;
  const samples = history.filter(s => s.ornek).length;
  const shortDate = (d: Date) => tarihYaz(d).split(',')[0];
  const headline = step === 0 ? (base.kaymaGun > 0 ? `Takvimde ${base.kaymaGun} iş günü görünmüyor.` : 'Planın arkasındaki kapasiteyi görün.')
    : step === 1 ? (delta > 0 ? `Küçük bir talep. ${delta} iş günü etki.` : 'Yeni talep, mevcut süreye sığıyor.')
    : proposal ? `${proposal.kazancGun} iş günü kazanmak mümkün.` : 'Mevcut dağılımda süre kazancı bulunamadı.';

  return <div className="overview-page flex-1 overflow-y-auto">
    <div className="overview-heading"><div><p className="eyebrow">KAPASİTE ZEKA PLATFORMU · ETKİLEŞİMLİ DEMO</p><h1>İşin ritmini bil.<br /><span>Dengeyle planla.</span></h1><p className="overview-intro">Teslim tarihinin arkasındaki iş yükünü görün.<br className="hidden sm:block" /> Karar vermeden önce farklı olasılıkları deneyin.</p></div>
      <div className="demo-stamp"><span className="status-dot" /> Pano verisine bağlı<span>{samples} örnek sprint · {history.length - samples} ek sprint</span></div>
    </div>
    <div className="simple-demo-switch">
      <span>Sade örnek: 3 kişi · 6 görev · 3 geçmiş çalışma dönemi</span>
      <button onClick={() => {
        if (window.confirm('Bu tarayıcıdaki pano ve sprint geçmişi 3 kişilik sade örnekle değiştirilecek. Mevcut kayıtlar silinir. Devam edilsin mi?')) { resetDemo(); setStep(0); }
      }}>Sade örnekle başla</button>
    </div>
    <div className="demo-story">
      <div className="story-tabs" role="tablist" aria-label="Demo senaryosu">{steps.map((s,i) => <button key={s.name} role="tab" id={`story-tab-${i}`} aria-selected={step === i} aria-controls="story-result" onClick={() => setStep(i)} className={step === i ? 'active' : ''}><span className="step-number">0{i + 1}</span><span><b>{s.name}</b><small>{s.detail}</small></span><s.icon size={19} /></button>)}</div>
      <section id="story-result" role="tabpanel" aria-labelledby={`story-tab-${step}`} className="story-body">
        <div className="story-explanation">
          <p className="eyebrow">{step === 0 ? 'GÖRÜNÜR OLAN RİSK' : step === 1 ? 'TALEBİN TAKVİME ETKİSİ' : 'DAHA DENGELİ BİR OLASILIK'}</p>
          <h2 aria-live="polite">{headline}</h2>
          <p>{step === 0 ? `En uzun iş yükü ${base.darbogaz.uye.ad} üzerinde. Geçmiş sprint hızları hesaba katıldığında, toplam saat kadar işin kimde olduğu da teslimi etkiliyor.` : step === 1 ? `${base.darbogaz.uye.ad} kişisine 12 saatlik yeni iş ekledik. Yük dağılımı ve teslim tarihi bu yeni talebe göre hesaplandı.` : proposal ? `${proposal.kimden.uye.ad} kişisinden ${proposal.kime.uye.ad} kişisine ${proposal.saat} saatlik iş devrini deniyoruz. Toplam iş aynı; değişen, dağılımı.` : 'Bu veriyle tek bir iş devri teslim tarihini öne çekmiyor. Farklı senaryoları analiz ekranından inceleyebilirsiniz.'}</p>
          <div className="story-outcome"><span>{step === 2 && proposal ? 'OLASI KAZANIM' : 'KAPASİTE ÜSTÜNDE'}</span><strong>{step === 2 && proposal ? proposal.kazancGun : overloaded}<small>{step === 2 && proposal ? ' iş günü' : ' kişi'}</small></strong></div>
          <p className="story-note">{step === 2 ? 'Bu senaryo mevcut plana göre hesaplanır. Önceki adımdaki 12 saat dahil değildir. İş devri için yetkinlik uygunluğu ayrıca değerlendirilmelidir.' : 'Senaryolar panodaki görevleri değiştirmez. Hesaplar kural tabanlıdır.'}</p>
        </div>
        <div className="load-visual"><div className="section-label"><h3>Ekip yük dağılımı</h3><span>2 hafta / 60 saat kapasite</span></div>
          {current.uyeler.map(u => <div className="load-person" key={u.uye.id}><div className="load-label"><div><span className="person-avatar" style={{background:u.uye.renk}}>{u.uye.ad.slice(0,1)}</span><span><b>{u.uye.ad}</b><small>{u.uye.rol}</small></span></div><strong className={u.yukYuzde > 100 ? 'overload' : 'balanced'}>%{u.yukYuzde}</strong></div><div className="load-track"><div style={{width:`${Math.min(u.yukYuzde,200)/2}%`}} className={u.yukYuzde > 100 ? 'hot' : 'cool'} /><i title="%100 kapasite sınırı" /></div></div>)}
          <div className="load-key"><span><i /> Planlanan yük</span><span>Orta çizgi = %100 kapasite</span></div>
        </div>
      </section>
      <div className="story-timeline" aria-live="polite"><div><span>{step === 0 ? 'TAKVİMDEKİ PLAN' : 'MEVCUT TAHMİN'}</span><strong>{shortDate(step === 0 ? base.planBitis : base.gercekciBitis)}</strong></div><MoveRight aria-hidden="true" /><div><span>{step === 0 ? 'GEÇMİŞ HIZA GÖRE' : 'SENARYO SONUCU'}</span><strong>{shortDate(current.gercekciBitis)}</strong></div><div className={`timeline-delta ${delta < 0 ? 'gain' : ''}`}>{delta === 0 ? <><Check size={17} />{step === 0 ? `${base.kaymaGun > 0 ? '+' : ''}${base.kaymaGun} iş günü fark` : 'Tarih değişmiyor'}</> : <>{delta < 0 ? '−' : '+'}{Math.abs(delta)} iş günü</>}</div></div>
    </div>
    <div className="overview-actions"><button className="action-card" onClick={() => navigate('jury')}><span className="action-icon"><FlaskConical size={24} /></span><span><b>Kontrolü siz alın</b><small>Saatleri değiştirin, hesabı kendiniz doğrulayın.</small></span><ArrowUpRight size={23}/></button><button className="action-card" onClick={() => navigate('dengai')}><span className="action-icon purple"><Layers3 size={24}/></span><span><b>Analizin derinine inin</b><small>Sprint geçmişi, kapasite ve serbest senaryolar.</small></span><ChevronRight size={23}/></button></div>
    <footer className="overview-footer"><span><ShieldCheck size={17}/> Şeffaf hesap · Örnek veriler etiketli · Gerçek Jira bağlantısı yok</span><button onClick={() => navigate('jury')}>Nasıl hesaplanıyor? <ArrowRight size={14}/></button></footer>
  </div>;
}
