import { useMemo, useState } from 'react';
import { ornekPano, ornekSprintler } from '../data/seed';
import { GUNLUK_SAAT, SPRINT_KAPASITE_SAAT } from '../data/ekip';
import { analizEt, oneriBul, senaryoKur, tarihYaz } from '../lib/dengai';
import { useBoardStore } from '../store/useBoardStore';

const panel = 'jury-panel rounded-xl border border-white/10 bg-surface-container-low p-lg';
const input = 'rounded-lg border border-white/20 bg-surface-container p-sm text-on-surface w-full';
const button = 'rounded-lg border border-primary/30 px-md py-sm text-primary hover:bg-primary/10';
const sayi = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });

export default function JuryGuide() {
  const [veri, setVeri] = useState(() => ({ board: ornekPano(), history: ornekSprintler(), kaynak: 'Örnek veri' }));
  const [tarih, setTarih] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });
  const [kisi, setKisi] = useState('elif');
  const [yeni, setYeni] = useState(0);
  const [devir, setDevir] = useState(0);
  const [hedef, setHedef] = useState('zeynep');
  const [secim, setSecim] = useState<'yeni' | 'paylas' | 'ozel' | null>(null);
  const [indirildi, setIndirildi] = useState(false);
  const baslangic = useMemo(() => {
    const [y, a, g] = tarih.split('-').map(Number);
    return new Date(y, a - 1, g);
  }, [tarih]);
  const temel = useMemo(() => analizEt(veri.board, veri.history, baslangic), [veri, baslangic]);
  const oneri = useMemo(() => oneriBul(veri.board, veri.history, baslangic), [veri, baslangic]);
  const ekip = temel.uyeler.map(u => u.uye);
  const degisim = senaryoKur(temel, {}, kisi, yeni, kisi, hedef, devir);
  const sonuc = analizEt(veri.board, veri.history, baslangic, degisim.ekstra);
  const toplam = (a: typeof temel) => a.uyeler.reduce((n, u) => n + u.atanan, 0);
  const fark = sonuc.gercekciIsGunu - temel.gercekciIsGunu;
  const sifirla = () => { setYeni(0); setDevir(0); setIndirildi(false); setSecim(null); };
  const aktar = () => {
    const blob = new Blob([JSON.stringify({
      aciklama: 'DENG-AI kural tabanlı demo. Gerçek müşteri verisi veya doğrulanmış tahmin başarısı değildir.',
      kaynak: veri.kaynak, baslangic: tarih, gunlukSaat: GUNLUK_SAAT, sprintKapasitesi: SPRINT_KAPASITE_SAAT,
      pano: veri.board, sprintler: veri.history,
      senaryo: { kisi, hedef, yeniSaat: yeni, istenenDevir: devir, uygulananDevir: degisim.aktarilan, ekstra: degisim.ekstra },
      mevcut: temel, sonuc,
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'DENG-AI-juri-kontrol.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setIndirildi(true);
  };
  return <div className="flex-1 overflow-y-auto p-margin-page space-y-lg">
    <section className={panel}>
      <p className="text-primary font-label-sm mb-sm">KENDİNİZ DENEYİN</p>
      <h1 className="font-display text-display mb-sm">Bir değişiklik yapın, teslim tarihini karşılaştırın.</h1>
      <p className="text-on-surface-variant">Bu planda en yoğun kişi <strong>{temel.darbogaz.uye.ad}</strong>. Aşağıdaki iki seçenekten birine basın; sonucu hemen altında görün.</p>
      <p className="jury-source">{veri.kaynak} · Bu ekranda yaptıklarınız görev panosunu değiştirmez.</p>
    </section>
    <section className={`${panel} jury-quick`}>
      <h2 className="font-h2 text-h2 mb-sm">1. Ne değişsin?</h2>
      <p className="text-on-surface-variant mb-lg">İki seçenek birbirinden bağımsızdır. Diğerine bastığınızda ilk plana dönüp yeni denemeyi hesaplarız.</p>
      <div className="jury-choices jury-two-choices">
        <button aria-pressed={secim === 'yeni'} onClick={() => { sifirla(); setSecim('yeni'); setKisi(temel.darbogaz.uye.id); setYeni(12); }}><span>EK İŞ</span><strong>{temel.darbogaz.uye.ad} için 12 saat iş ekle</strong><small>İş miktarı artarsa teslim ne kadar gecikir?</small></button>
        <button aria-pressed={secim === 'paylas'} disabled={!oneri} onClick={() => { if (oneri) { sifirla(); setSecim('paylas'); setKisi(oneri.kimden.uye.id); setHedef(oneri.kime.uye.id); setDevir(oneri.saat); } }}><span>İŞ PAYLAŞIMI</span><strong>{oneri ? `${oneri.kimden.uye.ad} üzerindeki işi ${oneri.kime.uye.ad} ile paylaş` : 'İşi başka birine paylaştır'}</strong><small>{oneri ? `${oneri.saat} saatlik işi aktar. Yeni iş eklenmez.` : 'Bu planda teslimi erkene alan bir paylaşım bulunamadı.'}</small></button>
      </div>
      <div className={`jury-answer ${fark > 0 ? 'jury-delay' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        <span>2. SONUÇ NE OLDU?</span>
        <h2>{yeni === 0 && degisim.aktarilan === 0 ? (secim ? 'Bu ayarlarda teslim tarihi değişmiyor.' : 'Henüz bir değişiklik yapmadınız.') : fark < 0 ? `Tahmini teslim ${-fark} iş günü erkene geliyor.` : fark > 0 ? `Tahmini teslim ${fark} iş günü gecikiyor.` : 'Tahmini teslim tarihi değişmiyor.'}</h2>
        <p>{yeni === 0 && degisim.aktarilan === 0 ? 'Başlamak için yukarıdaki iki seçenekten birine basın.' : `${yeni > 0 ? `${ekip.find(u => u.id === kisi)?.ad} için ${yeni} saat yeni iş eklendi. ` : ''}${degisim.aktarilan > 0 ? `${ekip.find(u => u.id === kisi)?.ad} üzerindeki ${degisim.aktarilan} saatlik iş ${ekip.find(u => u.id === hedef)?.ad} adlı kişiye aktarıldı. ` : ''}${yeni === 0 ? 'Toplam iş aynı kaldı; yalnızca kimin yapacağı değişti.' : 'Toplam iş miktarı arttı.'}`}</p>
        <div className="jury-comparison">
          <div><span>İLK PLANDA TESLİM</span><strong>{tarihYaz(temel.gercekciBitis)}</strong></div>
          <div><span>BU DENEMEDE TESLİM</span><strong>{tarihYaz(sonuc.gercekciBitis)}</strong></div>
        </div>
        <p className="jury-work-total">Toplam kalan iş: {sayi(toplam(temel))} saat → {sayi(toplam(sonuc))} saat</p>
      </div>
      <div className="jury-reset-row"><p>Başka bir sonucu görmek için diğer seçeneğe basın.</p><button className={button} onClick={sifirla} disabled={!secim && yeni === 0 && devir === 0}>İlk plana dön</button></div>
      <p className="jury-source">Sonuçlar kural tabanlı tahminlerdir. İş paylaşımında kişilerin o işi yapabilecek yetkinlikte olduğu varsayılır.</p>
    </section>
    <details className={panel}>
      <summary className="cursor-pointer text-primary font-h2 text-h2">İsteğe bağlı: kişiyi ve saatleri kendim seçeyim</summary>
      <div className="flex flex-wrap items-center justify-between gap-md mb-md">
        <h2 className="font-h2 text-h2">Kontrolü siz alın</h2><span className="text-primary">{veri.kaynak}</span>
      </div>
      <div className="flex flex-wrap gap-sm mb-lg">
        <button className={button} onClick={() => { setVeri({ board: ornekPano(), history: ornekSprintler(), kaynak: 'Örnek veri' }); sifirla(); }}>Örnek veriyi yükle</button>
        <button className={button} onClick={() => {
          const state = useBoardStore.getState();
          setVeri({ board: structuredClone(state.board), history: structuredClone(state.pastSprints), kaynak: 'Panonun anlık kopyası (örnek kayıtlar içerebilir)' }); sifirla();
        }}>Mevcut panoyu kopyala</button>
        <button className={button} onClick={sifirla}>Denemeyi sıfırla</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-md">
        <label>Başlangıç tarihi<input className={`${input} mt-sm`} aria-label="Başlangıç tarihi" type="date" value={tarih} onChange={e => { if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) setTarih(e.target.value); }} /></label>
        <label>Üzerinde çalışacağınız kişi<select className={`${input} mt-sm`} value={kisi} onChange={e => { setSecim('ozel'); setKisi(e.target.value); setDevir(0); }}>{ekip.map(u => <option key={u.id} value={u.id}>{u.ad} · {u.rol}</option>)}</select></label>
        <label>Yeni iş: {yeni} saat<input aria-label="Yeni iş saati" className="w-full mt-md" type="range" min="0" max="60" value={yeni} onChange={e => { setSecim('ozel'); setYeni(+e.target.value); }} /></label>
        <label>Devredilecek iş: {degisim.aktarilan} saat<input aria-label="Devredilecek saat" className="w-full mt-md" type="range" min="0" max={(temel.uyeler.find(u => u.uye.id === kisi)?.atanan ?? 0) + yeni} value={degisim.aktarilan} disabled={kisi === hedef} onChange={e => { setSecim('ozel'); setDevir(+e.target.value); }} /></label>
        <label>İşin devredileceği kişi<select className={`${input} mt-sm`} value={hedef} onChange={e => { setSecim('ozel'); setHedef(e.target.value); }}>{ekip.map(u => <option key={u.id} value={u.id}>{u.ad} · {u.rol}</option>)}</select></label>
      </div>
      <p className="mt-md text-on-surface-variant">Bir kişi seçin, yeni iş veya devredilecek saat miktarını değiştirin. Teslim tarihi ve toplam iş yukarıdaki sonuç alanında güncellenir. İş devrinde yetkinlik uygunluğu ayrıca değerlendirilir.</p>
    </details>
    <details className={panel}>
      <summary className="cursor-pointer text-primary font-h2 text-h2 mb-md">Bu sonuca nasıl ulaşıldı?</summary>
      <p className="mb-md text-on-surface-variant">Kişi çarpanı = geçmiş gerçekleşen saat / geçmiş tahmin. Düzeltilmiş yük = kalan iş × çarpan. İş günü = yük / {GUNLUK_SAAT}, yukarı yuvarlanır. Teslimi en uzun süren kişi belirler. Hesap tam hassasiyetle yapılır; tabloda iki ondalık gösterilir.</p>
      <div className="overflow-x-auto"><table className="w-full text-left font-label-sm whitespace-nowrap">
        <caption className="sr-only">Kişi bazında hesap girdileri ve sonuçları</caption>
        <thead><tr>{['Kişi', 'Geçmiş tahmin', 'Geçmiş gerçek', 'Çarpan', 'Kalan iş', 'Düzeltilmiş yük', 'Kapasite', 'İş günü'].map(h => <th className="p-sm" scope="col" key={h}>{h}</th>)}</tr></thead>
        <tbody>{sonuc.uyeler.map(u => {
          const kayitlar = veri.history.map(s => s.memberStats?.[u.uye.id]).filter(s => s !== undefined);
          return <tr key={u.uye.id} className="border-t border-white/10"><th scope="row" className="p-sm">{u.uye.ad}</th>
            <td className="p-sm">{sayi(kayitlar.reduce((n, s) => n + s.estimated, 0))}</td><td className="p-sm">{sayi(kayitlar.reduce((n, s) => n + s.logged, 0))}</td>
            <td className="p-sm">×{sayi(u.carpan)}{u.gecmisSayisi === 0 ? ' (ekip)' : ''}</td><td className="p-sm">{sayi(u.atanan)}</td><td className="p-sm">{sayi(u.gercekciSaat)}</td><td className="p-sm">%{u.yukYuzde}</td><td className="p-sm">{u.isGunu}</td></tr>;
        })}</tbody>
      </table></div>
      <p className="mt-md">Atanmamış {temel.atanmamislar.length} görev ({sayi(temel.atanmamisSaat)} saat) teslim tahminine dahil değil.</p>
      <details className="mt-md"><summary className="cursor-pointer text-primary">Varsayımlar ve demonun sınırları</summary><ul className="list-disc pl-lg space-y-sm mt-md">
        <li>Bu sürüm kural tabanlıdır. Yapay zeka modeli ve gerçek Jira bağlantısı yoktur.</li>
        <li>Kalan iş, tahmin edilen süreden harcanan süre çıkarılarak hesaplanır. Süresi dolmuş ama bitmemiş görevlerde ayrıca kalan iş tahmini gerekir.</li>
        <li>Kapasite kişi başına iki haftada {SPRINT_KAPASITE_SAAT} saattir. Hafta sonları atlanır; resmi tatiller, izinler ve görev bağımlılıkları hesaba katılmaz.</li>
        <li>Geçmişi olmayan kişide ekip çarpanı, hiç geçmiş yoksa 1 kullanılır. Tahminler bir teslim garantisi değildir.</li>
        <li>Kapasite aşımı iş yükü sinyalidir; kişinin sağlığı veya performansı hakkında bir teşhis değildir.</li>
        <li>Veriler bu tarayıcıda saklanır. Başka cihazda aynı verileri otomatik olarak görmezsiniz.</li>
      </ul></details>
      <button className={`${button} mt-lg`} onClick={aktar}>Kontrol dosyasını indir (JSON)</button>
      <p role="status" className="mt-sm text-on-surface-variant">{indirildi ? 'İndirme başlatıldı. Dosya, indirildiği andaki girdileri ve sonuçları içerir.' : 'Hesap girdileri, pano kopyası, sprint geçmişi ve sonuçları birlikte indirin.'}</p>
    </details>
  </div>;
}
