import { useMemo, useState } from 'react';
import { ornekPano, ornekSprintler } from '../data/seed';
import { GUNLUK_SAAT, SPRINT_KAPASITE_SAAT, TAKIM } from '../data/ekip';
import { analizEt, oneriBul, senaryoKur, tarihYaz } from '../lib/dengai';
import { useBoardStore } from '../store/useBoardStore';

const panel = 'jury-panel rounded-xl border border-white/10 bg-surface-container-low p-lg';
const input = 'rounded-lg border border-white/20 bg-surface-container p-sm text-on-surface w-full';
const button = 'rounded-lg border border-primary/30 px-md py-sm text-primary hover:bg-primary/10';
const sayi = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });

export default function JuryGuide() {
  const [veri, setVeri] = useState(() => ({ board: ornekPano(), history: ornekSprintler(), kaynak: 'Örnek veri' }));
  const [tarih, setTarih] = useState('2026-10-26');
  const [kisi, setKisi] = useState('elif');
  const [yeni, setYeni] = useState(0);
  const [devir, setDevir] = useState(0);
  const [hedef, setHedef] = useState('zeynep');
  const [indirildi, setIndirildi] = useState(false);
  const baslangic = useMemo(() => {
    const [y, a, g] = tarih.split('-').map(Number);
    return new Date(y, a - 1, g);
  }, [tarih]);
  const temel = useMemo(() => analizEt(veri.board, veri.history, baslangic), [veri, baslangic]);
  const oneri = useMemo(() => oneriBul(veri.board, veri.history, baslangic), [veri, baslangic]);
  const degisim = senaryoKur(temel, {}, kisi, yeni, kisi, hedef, devir);
  const sonuc = analizEt(veri.board, veri.history, baslangic, degisim.ekstra);
  const toplam = (a: typeof temel) => a.uyeler.reduce((n, u) => n + u.atanan, 0);
  const fark = sonuc.gercekciIsGunu - temel.gercekciIsGunu;
  const sifirla = () => { setYeni(0); setDevir(0); setIndirildi(false); };
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
    <section className={`${panel} bg-gradient-to-br from-primary/15 to-secondary/5`}>
      <p className="text-primary font-label-sm mb-sm">DENG-AI · KENDİNİZ DENEYİN</p>
      <h1 className="font-display text-display mb-sm">Ekibi rahatlatın. Takvimi değiştirin.</h1>
      <p className="text-on-surface-variant max-w-3xl">Beş kişilik bir ekip düşünün. İşler eşit dağılmadığında teslim gecikebilir. Yeni iş ekleyerek veya işi paylaşarak ne değiştiğini burada deneyin.</p>
      <p className="mt-md text-on-surface-variant">{veri.kaynak} · Kural tabanlı hesap · Gerçek görevler etkilenmez</p>
    </section>
    <section className={`${panel} jury-quick`}>
      <h2 className="font-h2 text-h2 mb-sm">Bir karar seçin, sonucu görün</h2>
      <p className="text-on-surface-variant mb-lg">Her düğme mevcut plandan başlayan ayrı bir denemedir. Gerçek görevleriniz değişmez.</p>
      <div className="jury-choices">
        <button onClick={() => { sifirla(); setKisi(temel.darbogaz.uye.id); setYeni(12); }}><span>01 · YENİ TALEP</span><strong>Yeni iş gelirse?</strong><small>{temel.darbogaz.uye.ad} kişisine 12 saatlik iş ekle</small></button>
        <button disabled={!oneri} onClick={() => { if (oneri) { sifirla(); setKisi(oneri.kimden.uye.id); setHedef(oneri.kime.uye.id); setDevir(oneri.saat); } }}><span>02 · İŞ DAĞILIMI</span><strong>İşi paylaştırırsak?</strong><small>{oneri ? `${oneri.kimden.uye.ad} → ${oneri.kime.uye.ad} · ${oneri.saat} saat devret` : 'Bu planda süre kazandıran devir bulunamadı'}</small></button>
        <button onClick={sifirla}><span>03 · KARŞILAŞTIR</span><strong>Başa dön</strong><small>Eklenen işi ve devri kaldır</small></button>
      </div>
      <div className="jury-answer" role="status">
        <span>BU KARAR NEYİ DEĞİŞTİRDİ?</span>
        <h2>{yeni === 0 && degisim.aktarilan === 0 ? 'Şu an mevcut planı görüyorsunuz.' : fark < 0 ? `Teslim ${-fark} iş günü öne geliyor.` : fark > 0 ? `Teslim ${fark} iş günü gecikiyor.` : 'İş dağılımı değişti; teslim tarihi aynı.'}</h2>
        <p>{yeni > 0 ? `${TAKIM.find(u => u.id === kisi)?.ad} kişisine ${yeni} saat yeni iş eklendi. ` : ''}{degisim.aktarilan > 0 ? `${TAKIM.find(u => u.id === kisi)?.ad} kişisinin yükü %${temel.uyeler.find(u => u.uye.id === kisi)?.yukYuzde} seviyesinden %${sonuc.uyeler.find(u => u.uye.id === kisi)?.yukYuzde} seviyesine geliyor. ` : ''}{yeni === 0 && degisim.aktarilan === 0 ? 'Yukarıdan bir deneme seçin. Sonuç burada anında güncellenir.' : 'Bu sonuçlar seçili veriden hesaplanan tahminlerdir.'}</p>
      </div>
    </section>
    <details className={panel}>
      <summary className="cursor-pointer text-primary font-h2 text-h2">Kendi senaryomu oluşturmak istiyorum</summary>
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
        <label>Üzerinde çalışacağınız kişi<select className={`${input} mt-sm`} value={kisi} onChange={e => { setKisi(e.target.value); setDevir(0); }}>{TAKIM.map(u => <option key={u.id} value={u.id}>{u.ad} · {u.rol}</option>)}</select></label>
        <label>Yeni iş: {yeni} saat<input aria-label="Yeni iş saati" className="w-full mt-md" type="range" min="0" max="60" value={yeni} onChange={e => setYeni(+e.target.value)} /></label>
        <label>Devredilecek iş: {degisim.aktarilan} saat<input aria-label="Devredilecek saat" className="w-full mt-md" type="range" min="0" max={(temel.uyeler.find(u => u.uye.id === kisi)?.atanan ?? 0) + yeni} value={degisim.aktarilan} disabled={kisi === hedef} onChange={e => setDevir(+e.target.value)} /></label>
        <label>İşin devredileceği kişi<select className={`${input} mt-sm`} value={hedef} onChange={e => setHedef(e.target.value)}>{TAKIM.map(u => <option key={u.id} value={u.id}>{u.ad} · {u.rol}</option>)}</select></label>
      </div>
      <p className="mt-md text-on-surface-variant">Önerilen deneme: örnek veride Elif'e 12 saat ekleyin. Sonra 18 saati Zeynep'e devredin. Her iki adımda da teslim tarihini ve toplam işi karşılaştırın. İş devrinde yetkinlik uygunluğunu ayrıca değerlendirmek gerekir.</p>
    </details>
    <section className="grid sm:grid-cols-3 gap-md" aria-live="polite">
      <div className={panel}><h2>Karardan önce</h2><p className="font-h2 text-h2 mt-sm">{tarihYaz(temel.gercekciBitis)}</p><p>{temel.gercekciIsGunu} iş günü</p></div>
      <div className={panel}><h2>Bu karardan sonra</h2><p className="font-h2 text-h2 mt-sm">{tarihYaz(sonuc.gercekciBitis)}</p><p>{fark === 0 ? 'Tarih değişmiyor' : fark > 0 ? `${fark} iş günü daha geç` : `${-fark} iş günü daha erken`}</p></div>
      <div className={panel}><h2>Toplam kalan iş</h2><p className="font-h2 text-h2 mt-sm">{sayi(toplam(temel))} → {sayi(toplam(sonuc))} saat</p><p>{yeni} saat yeni iş eklendi. Devir toplam işi değiştirmez.</p></div>
    </section>
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
