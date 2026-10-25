import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ornekEkip, SPRINT_KAPASITE_SAAT } from '../data/ornekEkip';
import { analizEt, gunFarki, sprintOzeti, tarihYaz, yorumlar } from '../lib/dengai';
import { useBoardStore } from '../store/useBoardStore';

const kart = 'rounded-xl p-lg bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]';

const yorumRenk = {
  uyari: 'border-error/40 bg-error/10 text-on-surface',
  bilgi: 'border-primary/30 bg-primary/10 text-on-surface',
  iyi: 'border-secondary/30 bg-secondary/10 text-on-surface',
} as const;
const yorumIkon = { uyari: 'warning', bilgi: 'info', iyi: 'check_circle' } as const;

export default function DengAi() {
  const board = useBoardStore((s) => s.board);
  const baslangic = useMemo(() => new Date(), []);

  // what-if girdileri
  const [yeniSaat, setYeniSaat] = useState(0);
  const [yeniKisi, setYeniKisi] = useState('zeynep');
  const [devirSaat, setDevirSaat] = useState(0);
  const [devirKimden, setDevirKimden] = useState('elif');
  const [devirKime, setDevirKime] = useState('zeynep');

  const temel = useMemo(() => analizEt(ornekEkip, baslangic), [baslangic]);

  const ekstra = useMemo(() => {
    const e: Record<string, number> = {};
    if (yeniSaat) e[yeniKisi] = (e[yeniKisi] ?? 0) + yeniSaat;
    if (devirSaat && devirKimden !== devirKime) {
      e[devirKimden] = (e[devirKimden] ?? 0) - devirSaat;
      e[devirKime] = (e[devirKime] ?? 0) + devirSaat;
    }
    return e;
  }, [yeniSaat, yeniKisi, devirSaat, devirKimden, devirKime]);

  const senaryo = useMemo(() => analizEt(ornekEkip, baslangic, ekstra), [baslangic, ekstra]);
  const degisti = Object.keys(ekstra).length > 0;
  const gosterilen = senaryo;
  const ozet = useMemo(() => sprintOzeti(ornekEkip), []);
  const liste = useMemo(() => yorumlar(gosterilen), [gosterilen]);
  const riskliSayisi = gosterilen.uyeler.filter((u) => u.tukenmisRisk || u.yukYuzde > 100).length;
  const farkGun = gunFarki(senaryo.gercekciBitis, temel.gercekciBitis);

  // Projira panosundaki bekleyen işler, what-if'e tek tıkla eklenebilir
  const bekleyen = (board.columns['todo']?.taskIds ?? []).map((id) => board.tasks[id]).filter((t) => t && t.estimatedTime);

  return (
    <div className="flex-1 p-margin-page overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-lg">
        <div>
          <div className="flex items-center gap-sm mb-1">
            <h1 className="font-display text-display text-on-surface">DENG-AI</h1>
            <span className="px-2 py-1 rounded bg-tertiary-container/20 text-tertiary font-label-sm border border-tertiary-container/30">Örnek veri</span>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Geçmiş sprintlerden ekibin gerçek teslim hızını öğrenir, kapasiteyi gösterir, değişiklikleri önceden hesaplar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        <div className="col-span-1 md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          <div className={kart}>
            <h3 className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Gerçek teslim hızı</h3>
            <span className="font-display text-display text-on-surface">×{gosterilen.ekipCarpani.toFixed(2)}</span>
            <p className="font-label-sm text-on-surface-variant mt-sm">6 sprintin ortalaması. Tahmin 100 saatse gerçek {Math.round(gosterilen.ekipCarpani * 100)}.</p>
          </div>
          <div className={kart}>
            <h3 className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Kâğıt üstündeki plan</h3>
            <span className="font-h1 text-h1 text-on-surface">{tarihYaz(senaryo.planBitis).split(',')[0]}</span>
            <p className="font-label-sm text-on-surface-variant mt-sm">{senaryo.planIsGunu} iş günü, tahminlere göre</p>
          </div>
          <div className={`${kart} ${senaryo.kaymaGun > 0 ? 'border-error/30' : ''}`}>
            <h3 className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">DENG-AI gerçekçi teslim</h3>
            <span className={`font-h1 text-h1 ${senaryo.kaymaGun > 0 ? 'text-error' : 'text-on-surface'}`}>{tarihYaz(senaryo.gercekciBitis).split(',')[0]}</span>
            <p className="font-label-sm text-on-surface-variant mt-sm">
              {senaryo.kaymaGun > 0 ? `Plana göre +${senaryo.kaymaGun} iş günü` : 'Plan tutuyor'}
              {degisti && farkGun !== 0 ? `, mevcut duruma göre ${farkGun > 0 ? '+' : ''}${farkGun} gün` : ''}
            </p>
          </div>
          <div className={kart}>
            <h3 className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Risk altındaki kişi</h3>
            <span className={`font-display text-display ${riskliSayisi > 0 ? 'text-error' : 'text-on-surface'}`}>{riskliSayisi}</span>
            <p className="font-label-sm text-on-surface-variant mt-sm">Kapasitesini aşan veya tükenmişlik riski olan</p>
          </div>
        </div>

        <div className={`col-span-1 md:col-span-7 ${kart}`}>
          <h2 className="font-h2 text-h2 text-on-surface mb-md">Tahmin ve gerçekleşen, sprint bazında (saat)</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ozet} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#414755" vertical={false} />
                <XAxis dataKey="ad" stroke="#8b90a0" tick={{ fill: '#8b90a0', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#8b90a0" tick={{ fill: '#8b90a0', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1c2028', border: '1px solid #414755', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="tahmin" name="Tahmini (saat)" fill="#adc6ff" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="gercek" name="Gerçekleşen (saat)" fill="#d0bcff" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="font-label-sm text-on-surface-variant mt-sm">Sapma 6 sprintin hepsinde %{Math.min(...ozet.map((o) => o.sapma))} ile %{Math.max(...ozet.map((o) => o.sapma))} arasında. Tahminler her seferinde aynı yönde yanlış, yani sorun tesadüf değil, düzenli bir eğilim.</p>
        </div>

        <div className={`col-span-1 md:col-span-5 ${kart}`}>
          <h2 className="font-h2 text-h2 text-on-surface mb-md">DENG-AI yorumu</h2>
          <div className="space-y-sm">
            {liste.map((y, i) => (
              <div key={i} className={`flex gap-sm items-start rounded-lg border p-sm ${yorumRenk[y.tur]}`}>
                <span className="material-symbols-outlined text-[18px] mt-[1px]">{yorumIkon[y.tur]}</span>
                <p className="font-body-md text-body-md">{y.metin}</p>
              </div>
            ))}
          </div>
          <p className="font-label-sm text-on-surface-variant mt-md">Bu yorumlar kural tabanlıdır, aynı veriyle aynı sonucu verir.</p>
        </div>

        <div className={`col-span-1 md:col-span-7 ${kart}`}>
          <h2 className="font-h2 text-h2 text-on-surface mb-md">Kapasite ve tükenmişlik radarı</h2>
          <div className="space-y-md">
            {gosterilen.uyeler.map((u) => {
              const yuzde = Math.min(u.yukYuzde, 160);
              const renk = u.yukYuzde > 100 ? 'bg-error' : u.yukYuzde > 85 ? 'bg-tertiary-container' : 'bg-primary';
              return (
                <div key={u.uye.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-body-md text-on-surface">
                      {u.uye.ad} <span className="text-on-surface-variant font-label-sm">· {u.uye.rol} · hız ×{u.carpan.toFixed(2)}</span>
                      {u.tukenmisRisk && <span className="ml-sm px-2 py-[2px] rounded bg-error/20 text-error font-label-sm">tükenmişlik riski</span>}
                    </span>
                    <span className={`font-label-sm ${u.yukYuzde > 100 ? 'text-error' : 'text-on-surface-variant'}`}>
                      {u.atanan} saat atandı → gerçekte {Math.round(u.gercekciSaat)} saat, %{u.yukYuzde}
                    </span>
                  </div>
                  <div className="relative w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className={`${renk} h-3 rounded-full`} style={{ width: `${(yuzde / 160) * 100}%` }} />
                    <div className="absolute top-0 h-3 w-[2px] bg-on-surface/70" style={{ left: `${(100 / 160) * 100}%` }} title={`Kapasite ${SPRINT_KAPASITE_SAAT} saat`} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="font-label-sm text-on-surface-variant mt-md">Dikey çizgi kapasite sınırı ({SPRINT_KAPASITE_SAAT} saat, 2 haftalık sprint). Çubuk, kişinin geçmiş hızıyla düzeltilmiş yükü gösterir.</p>
        </div>

        <div className={`col-span-1 md:col-span-5 ${kart}`}>
          <h2 className="font-h2 text-h2 text-on-surface mb-md">What-if: şunu yaparsak ne olur?</h2>

          <div className="space-y-md">
            <div>
              <label className="font-label-sm text-on-surface-variant block mb-1">Yeni iş ekle: {yeniSaat} saat</label>
              <input type="range" min={0} max={40} step={2} value={yeniSaat} onChange={(e) => setYeniSaat(+e.target.value)} className="w-full accent-[#adc6ff]" />
              <select value={yeniKisi} onChange={(e) => setYeniKisi(e.target.value)} className="mt-sm w-full bg-surface-container-high border border-white/10 rounded-lg px-sm py-sm text-on-surface font-body-md">
                {ornekEkip.map((u) => <option key={u.id} value={u.id}>{u.ad} ({u.rol}) kişisine ver</option>)}
              </select>
              {bekleyen.length > 0 && (
                <div className="flex flex-wrap gap-sm mt-sm">
                  {bekleyen.map((t) => (
                    <button key={t.id} onClick={() => setYeniSaat(Math.min(40, t.estimatedTime ?? 0))} className="px-sm py-1 rounded border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-left" title={t.title}>
                      Panodan: {t.title.length > 24 ? t.title.slice(0, 24) + '…' : t.title} ({t.estimatedTime}s)
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="font-label-sm text-on-surface-variant block mb-1">İş devret: {devirSaat} saat</label>
              <input type="range" min={0} max={30} step={2} value={devirSaat} onChange={(e) => setDevirSaat(+e.target.value)} className="w-full accent-[#d0bcff]" />
              <div className="grid grid-cols-2 gap-sm mt-sm">
                <select value={devirKimden} onChange={(e) => setDevirKimden(e.target.value)} className="bg-surface-container-high border border-white/10 rounded-lg px-sm py-sm text-on-surface font-body-md">
                  {ornekEkip.map((u) => <option key={u.id} value={u.id}>{u.ad} kişisinden</option>)}
                </select>
                <select value={devirKime} onChange={(e) => setDevirKime(e.target.value)} className="bg-surface-container-high border border-white/10 rounded-lg px-sm py-sm text-on-surface font-body-md">
                  {ornekEkip.map((u) => <option key={u.id} value={u.id}>{u.ad} kişisine</option>)}
                </select>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-surface-container-low p-md">
              <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Sonuç</p>
              <p className="font-body-lg text-on-surface">
                Gerçekçi teslim: <b className={senaryo.kaymaGun > 0 ? 'text-error' : ''}>{tarihYaz(senaryo.gercekciBitis)}</b>
              </p>
              <p className="font-label-sm text-on-surface-variant mt-1">
                {degisti ? (farkGun === 0 ? 'Mevcut duruma göre tarih değişmiyor.' : `Mevcut duruma göre ${farkGun > 0 ? farkGun + ' iş günü gecikme' : -farkGun + ' iş günü kazanç'}.`) : 'Bir değişiklik seçince burada görünür.'}
              </p>
            </div>
            {degisti && (
              <button onClick={() => { setYeniSaat(0); setDevirSaat(0); }} className="w-full px-md py-sm rounded-lg border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm transition-colors">
                Sıfırla
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
