import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronRight, FlaskConical, Layers3, MoveRight, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';
import { ornekPano, ornekSprintler } from '../data/seed';
import { analizEt, oneriBul, tarihYaz } from '../lib/dengai';

const steps = [
  { name: 'Mevcut plan', detail: 'Görünmeyen yükü keşfet', icon: Layers3 },
  { name: 'Yeni talep', detail: '12 saat daha iş gelirse?', icon: TrendingUp },
  { name: 'Dengeli dağılım', detail: 'Mevcut işi yeniden dağıt', icon: Sparkles },
];

export default function Overview() {
  const kayitliPano = useBoardStore(s => s.board);
  const kayitliGecmis = useBoardStore(s => s.pastSprints);
  const [sunum, setSunum] = useState(false);
  const [notlarAcik, setNotlarAcik] = useState(false);
  const [ornek] = useState(() => ({ board: ornekPano(), history: ornekSprintler() }));
  const board = sunum ? ornek.board : kayitliPano;
  const history = sunum ? ornek.history : kayitliGecmis;
  const baslatRef = useRef<HTMLButtonElement>(null);
  const kapatRef = useRef<HTMLButtonElement>(null);
  const cik = () => { setSunum(false); setStep(0); baslatRef.current?.focus(); };

  const resetDemo = useBoardStore(s => s.resetDemo);
  const navigate = useBoardStore(s => s.setCurrentView);
  const [step, setStep] = useState(0);
  const [date] = useState(() => new Date());
  useEffect(() => {
    if (!sunum) return;
    kapatRef.current?.focus();
    const arkaPlan = Array.from(document.querySelectorAll<HTMLElement>('.app-sidebar, .app-topbar'));
    const onceki = arkaPlan.map(el => el.inert);
    arkaPlan.forEach(el => { el.inert = true; });
    const tus = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.matches('input,select,textarea')) return;
      if (event.key === 'Escape') { setSunum(false); setStep(0); baslatRef.current?.focus(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); setStep(s => Math.min(2, s + 1)); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); setStep(s => Math.max(0, s - 1)); }
    };
    window.addEventListener('keydown', tus);
    return () => { window.removeEventListener('keydown', tus); arkaPlan.forEach((el, i) => { el.inert = onceki[i]; }); };
  }, [sunum]);

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

  const talepFarki = analizEt(board, history, date, { [base.darbogaz.uye.id]: 12 }).gercekciIsGunu - base.gercekciIsGunu;
  const konusma = [
    `DENG-AI, iş yükünün teslim tarihine etkisini görünür hale getiriyor. Bu örnekte üç geliştirici ve altı görev var. ${base.darbogaz.uye.ad} en yoğun kişi. Normal plan ${shortDate(base.planBitis)} gösterirken, geçmiş hızları dikkate alan tahmin ${shortDate(base.gercekciBitis)} gösteriyor.`,
    `Şimdi en yoğun kişiye 12 saatlik yeni iş ekliyorum. Ekrandaki yük ve tarih bu talebe göre değişiyor. ${talepFarki > 0 ? `Bu senaryoda teslim ${talepFarki} iş günü gecikiyor.` : 'Bu talebin tarih üzerindeki etkisini burada görüyoruz.'} Böylece yeni işe söz vermeden önce etkisini değerlendirebiliyoruz.`,
    proposal ? `Şimdi ilk plana geri dönüp işi farklı dağıtıyorum. Önceki 12 saatlik ek talep bu senaryoya dahil değil. ${proposal.kimden.uye.ad} kişisinden ${proposal.kime.uye.ad} kişisine ${proposal.saat} saatlik işi devredince, tahmini teslim ${proposal.kazancGun} iş günü öne geliyor. Toplam iş aynı, dağılımı değişiyor.` : 'Bu veriyle tek bir aktarım süre kazandırmıyor. Sistem her durumda iyileşme varmış gibi bir sonuç göstermiyor.',
  ];
  const kapanis = 'Bu, örnek verilerle çalışan kural tabanlı bir karar destek demosu. Yapay zeka modeli ve gerçek Jira bağlantısı henüz yok. Amacımız, yeni bir kararın etkisini uygulamadan önce görebilmek. İsterseniz şimdi siz de deneyebilirsiniz.';
  const notlariIndir = () => {
    const text = `DENG-AI — 2 DAKİKALIK SUNUM KARTI\n\nGenel bakış > Sunuma başla. Yerel sunucu gerekmez.\nSunum modu bağımsız üç kişilik örneği kullanır; kayıtlı panoyu değiştirmez.\n\n${konusma.map((n, i) => `${i+1}. ${steps[i].name}\n${n}`).join('\n\n')}\n\nKAPANIŞ\n${kapanis}\n\nKULLANIM\nİleri/Geri düğmeleri veya sağ/sol ok tuşları. Esc ile çıkış.\nKonuşma notları açılırsa ekrana yansır; jüri öncesi kapat.\nJüriye bırak düğmesi bağımsız deneme ekranını açar.\nTarihler ve sonuçlar seçili veri ve başlangıç gününe göre değişir.\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'DENG-AI-Sunum-Karti.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <div className={`overview-page flex-1 overflow-y-auto ${sunum ? 'presentation-mode' : ''}`}>
    {sunum && <div className="presentation-toolbar">
      <div><span className="eyebrow">2 DAKİKALIK DEMO · BAĞIMSIZ ÖRNEK VERİ</span><strong>Adım {step + 1} / 3 · {steps[step].name}</strong></div>
      <button ref={kapatRef} onClick={cik}>Sunumdan çık <span>Esc</span></button>
    </div>}
    {!sunum && <div className="presentation-launch">
      <div><strong>Sunumun hazır. Üç adımda anlat.</strong><p>Örnek verilerle başlar. Kayıtlı görevlerin değişmez.</p></div>
      <button ref={baslatRef} onClick={() => { setStep(0); setNotlarAcik(false); setSunum(true); }}>Sunuma başla <ArrowRight size={18}/></button>
    </div>}

    <div className="overview-heading"><div><p className="eyebrow">KAPASİTE ZEKA PLATFORMU · ETKİLEŞİMLİ DEMO</p><h1>İşin ritmini bil.<br /><span>Dengeyle planla.</span></h1><p className="overview-intro">Teslim tarihinin arkasındaki iş yükünü görün.<br className="hidden sm:block" /> Karar vermeden önce farklı olasılıkları deneyin.</p></div>
      <div className="demo-stamp"><span className="status-dot" /> {sunum ? 'Bağımsız sunum örneği' : 'Pano verisine bağlı'}<span>{samples} örnek sprint · {history.length - samples} ek sprint</span></div>
    </div>
    {!sunum && <div className="simple-demo-switch">
      <span>Sade örnek: 3 kişi · 6 görev · 3 geçmiş çalışma dönemi</span>
      <button onClick={() => {
        if (window.confirm('Bu tarayıcıdaki pano ve sprint geçmişi 3 kişilik sade örnekle değiştirilecek. Mevcut kayıtlar silinir. Devam edilsin mi?')) { resetDemo(); setStep(0); }
      }}>Sade örnekle başla</button>
    </div>}
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
    {sunum && <section className="presentation-coach">
      <div className="presentation-navigation"><button disabled={step === 0} onClick={() => setStep(s => s - 1)}>← Geri</button><span>{['Sorunu göster · yaklaşık 30 saniye', 'Yeni talebi dene · yaklaşık 30 saniye', 'Çözümü ve sınırları anlat · yaklaşık 60 saniye'][step]}</span>{step < 2 ? <button onClick={() => setStep(s => s + 1)}>Sonraki adım →</button> : <button onClick={() => { setSunum(false); navigate('jury'); }}>Jüriye bırak →</button>}</div>
      <div className="presentation-tools"><button aria-expanded={notlarAcik} onClick={() => setNotlarAcik(!notlarAcik)}>{notlarAcik ? 'Konuşma notlarını gizle' : 'Prova için konuşma notlarını göster'}</button><button onClick={notlariIndir}>Sunum kartını indir</button></div>
      {notlarAcik && <div className="presentation-notes"><small>BU NOTLAR EKRANA YANSIR · SUNUMDAN ÖNCE GİZLEYEBİLİRSİN</small><h3>Şunu söyleyebilirsin</h3><p>{konusma[step]}</p>{step === 2 && <p>{kapanis}</p>}</div>}
    </section>}
    <div className="overview-actions"><button className="action-card" onClick={() => navigate('jury')}><span className="action-icon"><FlaskConical size={24} /></span><span><b>Kontrolü siz alın</b><small>Saatleri değiştirin, hesabı kendiniz doğrulayın.</small></span><ArrowUpRight size={23}/></button><button className="action-card" onClick={() => navigate('dengai')}><span className="action-icon purple"><Layers3 size={24}/></span><span><b>Analizin derinine inin</b><small>Sprint geçmişi, kapasite ve serbest senaryolar.</small></span><ChevronRight size={23}/></button></div>
    <footer className="overview-footer"><span><ShieldCheck size={17}/> Şeffaf hesap · Örnek veriler etiketli · Gerçek Jira bağlantısı yok</span><button onClick={() => navigate('jury')}>Nasıl hesaplanıyor? <ArrowRight size={14}/></button></footer>
  </div>;
}
