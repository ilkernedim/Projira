import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SPRINT_KAPASITE_SAAT, TAKIM } from '../data/ekip';
import { analizEt, gunFarki, kalanSaat, oneriBul, senaryoKur, sprintOzeti, tarihYaz, yorumlar } from '../lib/dengai';
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
  const sprintler = useBoardStore((s) => s.pastSprints);
  const resetDemo = useBoardStore((s) => s.resetDemo);
  const baslangic = useMemo(() => new Date(), []);

  // what-if girdileri
  const [yeniSaat, setYeniSaat] = useState(0);
  const [yeniKisi, setYeniKisi] = useState('zeynep');
  const [devirSaat, setDevirSaat] = useState(0);
  const [devirKimden, setDevirKimden] = useState('elif');
  const [devirKime, setDevirKime] = useState('zeynep');
  const [oneriEkstra, setOneriEkstra] = useState<Record<string, number> | null>(null);

  // pano veya sprint geçmişi değişince tüm hesap yeniden yapılır
  const temel = useMemo(() => analizEt(board, sprintler, baslangic), [board, sprintler, baslangic]);
  const oneri = useMemo(() => oneriBul(board, sprintler, baslangic), [board, sprintler, baslangic]);

  // Pano değiştiğinde eski öneriyi yeni veriye uygulama.
  const [oneriPano, setOneriPano] = useState<typeof board | null>(null);
  const [oneriGecmis, setOneriGecmis] = useState<typeof sprintler | null>(null);
  const aktifOneri = oneriPano === board && oneriGecmis === sprintler ? oneriEkstra : null;
  const { ekstra, aktarilan } = useMemo(() => senaryoKur(
    temel, aktifOneri ?? {}, yeniKisi, yeniSaat, devirKimden, devirKime, devirSaat,
  ), [temel, aktifOneri, yeniKisi, yeniSaat, devirKimden, devirKime, devirSaat]);
  const devirSiniri = Math.max(0, (temel.uyeler.find((u) => u.uye.id === devirKimden)?.atanan ?? 0)
    + (aktifOneri?.[devirKimden] ?? 0) + (yeniKisi === devirKimden ? yeniSaat : 0));

  const senaryo = useMemo(() => analizEt(board, sprintler, baslangic, ekstra), [board, sprintler, baslangic, ekstra]);
  const degisti = Object.keys(ekstra).length > 0;
  const ozet = useMemo(() => sprintOzeti(sprintler), [sprintler]);
  const liste = useMemo(() => yorumlar(senaryo), [senaryo]);
  const riskliSayisi = senaryo.uyeler.filter((u) => u.tukenmisRisk || u.yukYuzde > 100).length;
  const farkGun = gunFarki(senaryo.gercekciBitis, temel.gercekciBitis);
  const ornekSayisi = sprintler.filter((s) => s.ornek).length;
  const gercekSayisi = sprintler.filter((s) => !s.ornek && s.memberStats).length;
  const acikSaat = senaryo.uyeler.reduce((t, u) => t + u.atanan, 0);

  const sifirla = () => {
    setYeniSaat(0);
    setDevirSaat(0);
    setOneriEkstra(null);
  };

  return (
    <div className="flex-1 p-margin-page overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-lg">
        <div>
          <div className="flex flex-wrap items-center gap-sm mb-1">
            <h1 className="font-display text-display text-on-surface">DENG-AI</h1>
            <span className="px-2 py-1 rounded bg-primary/15 text-primary font-label-sm border border-primary/30">Canlı: panodan okunuyor</span>
            <span className="px-2 py-1 rounded bg-tertiary-container/20 text-tertiary font-label-sm border border-tertiary-container/30">
              {ornekSayisi} sprint örnek veri{gercekSayisi > 0 ? `, ${gercekSayisi} sprint sizin` : ''}
            </span>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Geçmiş sprintlerden ekibin gerçek teslim hızını öğrenir, kapasiteyi gösterir, değişiklikleri önceden hesaplar. Panoya görev eklediğinizde, kişi atadığınızda veya sprint kapattığınızda aşağıdaki her şey güncellenir.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Pano ve sprint geçmişi örnek demo verisine döner. Devam edilsin mi?')) {
              resetDemo();
              sifirla();
            }
          }}
          className="shrink-0 px-md py-sm rounded-lg border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm transition-colors flex items-center gap-sm"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          Demo verisini sıfırla
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        <div className="col-span-1 md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          <div className={kart}>
            <h3 className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Gerçek teslim hızı</h3>
            <span className="font-display text-display text-on-surface">×{senaryo.ekipCarpani.toFixed(2)}</span>
            <p className="font-label-sm text-on-surface-variant mt-sm">{senaryo.sprintSayisi} sprintin ortalaması. Tahmin 100 saatse gerçek {Math.round(senaryo.ekipCarpani * 100)}.</p>
          </div>
          <div className={kart}>
            <h3 className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">Kâğıt üstündeki plan</h3>
            <span className="font-h1 text-h1 text-on-surface">{tarihYaz(senaryo.planBitis).split(',')[0]}</span>
            <p className="font-label-sm text-on-surface-variant mt-sm">{senaryo.planIsGunu} iş günü, {acikSaat} saat açık iş, tahminlere göre</p>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#D6DAE5" vertical={false} />
                <XAxis dataKey="ad" stroke="#667085" tick={{ fill: '#667085', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#667085" tick={{ fill: '#667085', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#F4F3FA', border: '1px solid #D6DAE5', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="tahmin" name="Tahmini (saat)" fill="#5B4BDB" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="gercek" name="Gerçekleşen (saat)" fill="#0F9386" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {ozet.length > 0 && (
            <p className="font-label-sm text-on-surface-variant mt-sm">
              Sapma {ozet.length} sprintte %{Math.min(...ozet.map((o) => o.sapma))} ile %{Math.max(...ozet.map((o) => o.sapma))} arasında. Sapma hep aynı yönde ise sorun tesadüf değil, düzenli bir eğilimdir.
            </p>
          )}
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

        {oneri && (
          <div className={`col-span-1 md:col-span-12 ${kart} border-secondary/30 bg-secondary/[0.06]`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
              <div className="flex gap-md items-start">
                <span className="material-symbols-outlined text-secondary text-[28px]">auto_awesome</span>
                <div>
                  <h2 className="font-h2 text-h2 text-on-surface">DENG-AI önerisi: işi dengele</h2>
                  <p className="font-body-lg text-on-surface-variant mt-1">
                    <b className="text-on-surface">{oneri.kimden.uye.ad}</b> kişisinden <b className="text-on-surface">{oneri.kime.uye.ad}</b> kişisine yaklaşık{' '}
                    <b className="text-on-surface">{oneri.saat} saatlik</b> iş aktarılırsa gerçekçi teslim{' '}
                    <b className="text-on-surface">{tarihYaz(oneri.yeni.gercekciBitis).split(',')[0]}</b> olur ({oneri.kazancGun} iş günü kazanç).{' '}
                    {oneri.kimden.uye.ad} yükü %{oneri.kimden.yukYuzde} değerinden %{oneri.yeni.uyeler.find((u) => u.uye.id === oneri.kimden.uye.id)?.yukYuzde}'e iner; {oneri.kime.uye.ad} yükü %{oneri.kime.yukYuzde} değerinden %{oneri.yeni.uyeler.find((u) => u.uye.id === oneri.kime.uye.id)?.yukYuzde}'e çıkar.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setYeniSaat(0);
                  setDevirSaat(0);
                  setOneriEkstra(oneri.ekstra);
                  setOneriPano(board);
                  setOneriGecmis(sprintler);
                }}
                className="shrink-0 px-lg py-sm rounded-lg bg-secondary-container text-on-secondary-container hover:brightness-110 font-label-sm transition-all"
              >
                Senaryoda uygula
              </button>
            </div>
          </div>
        )}

        <div className={`col-span-1 md:col-span-7 ${kart}`}>
          <h2 className="font-h2 text-h2 text-on-surface mb-md">Kapasite ve tükenmişlik radarı</h2>
          <div className="space-y-md">
            {senaryo.uyeler.map((u) => {
              const yuzde = Math.min(u.yukYuzde, 160);
              const renk = u.yukYuzde > 100 ? 'bg-error' : u.yukYuzde > 85 ? 'bg-tertiary-container' : 'bg-primary';
              return (
                <div key={u.uye.id}>
                  <div className="flex justify-between items-end gap-sm mb-1">
                    <div className="flex items-center gap-sm min-w-0">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0" style={{ background: u.uye.renk }}>{u.uye.ad.slice(0, 2).toUpperCase()}</span>
                      <span className="font-body-md text-on-surface truncate">
                        {u.uye.ad} <span className="text-on-surface-variant font-label-sm">· {u.uye.rol} · hız ×{u.carpan.toFixed(2)}</span>
                      </span>
                      {u.tukenmisRisk && <span className="px-2 py-[2px] rounded bg-error/20 text-error font-label-sm whitespace-nowrap">tükenmişlik riski</span>}
                    </div>
                    <div className="flex items-end gap-md shrink-0">
                      <div className="flex items-end gap-[2px] h-5" title="Son sprintlerin kapasiteye göre yükü">
                        {u.yukGecmisi.slice(-6).map((y, i) => (
                          <div key={i} className={`w-[5px] rounded-sm ${y > 1 ? 'bg-error' : 'bg-outline'}`} style={{ height: `${Math.min(y, 1.4) / 1.4 * 100}%` }} />
                        ))}
                      </div>
                      <span className={`font-label-sm text-right ${u.yukYuzde > 100 ? 'text-error' : 'text-on-surface-variant'}`}>
                        {Math.round(u.atanan)} saat atandı → gerçekte {Math.round(u.gercekciSaat)} saat, %{u.yukYuzde}
                      </span>
                    </div>
                  </div>
                  <div className="relative w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className={`${renk} h-3 rounded-full transition-all duration-500`} style={{ width: `${(yuzde / 160) * 100}%` }} />
                    <div className="absolute top-0 h-3 w-[2px] bg-on-surface/70" style={{ left: `${(100 / 160) * 100}%` }} title={`Kapasite ${SPRINT_KAPASITE_SAAT} saat`} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="font-label-sm text-on-surface-variant mt-md">Dikey çizgi kapasite sınırı ({SPRINT_KAPASITE_SAAT} saat, 2 haftalık sprint). Çubuk, kişinin geçmiş hızıyla düzeltilmiş yükü gösterir. Sağdaki küçük çubuklar son sprintlerin yükü, kırmızılar kapasite üstü.</p>
        </div>

        <div className={`col-span-1 md:col-span-5 ${kart}`}>
          <h2 className="font-h2 text-h2 text-on-surface mb-md">What-if: şunu yaparsak ne olur?</h2>

          <div className="space-y-md">
            <div>
              <label className="font-label-sm text-on-surface-variant block mb-1">Yeni iş ekle: {yeniSaat} saat</label>
              <input type="range" min={0} max={Math.max(40, yeniSaat)} step={1} value={yeniSaat} onChange={(e) => setYeniSaat(+e.target.value)} className="w-full accent-[#5B4BDB]" />
              <select value={yeniKisi} onChange={(e) => setYeniKisi(e.target.value)} className="mt-sm w-full bg-surface-container-high border border-white/10 rounded-lg px-sm py-sm text-on-surface font-body-md">
                {TAKIM.map((u) => <option key={u.id} value={u.id}>{u.ad} ({u.rol}) kişisine ver</option>)}
              </select>
              {senaryo.atanmamislar.length > 0 && (
                <div className="mt-sm">
                  <p className="font-label-sm text-on-surface-variant mb-1">Panoda kimseye atanmamış işler (tıklayınca saati doldurur):</p>
                  <div className="flex flex-wrap gap-sm">
                    {senaryo.atanmamislar.map((t) => (
                      <button key={t.id} onClick={() => setYeniSaat(kalanSaat(t))} className="px-sm py-1 rounded border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-left" title={t.title}>
                        {t.title.length > 26 ? t.title.slice(0, 26) + '…' : t.title} ({kalanSaat(t)}s)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="font-label-sm text-on-surface-variant block mb-1">İş devret: {aktarilan} saat</label>
              <input type="range" min={0} max={devirSiniri} step={1} value={aktarilan} disabled={devirKimden === devirKime || devirSiniri === 0} onChange={(e) => setDevirSaat(+e.target.value)} className="w-full accent-[#0F9386]" />
              <div className="grid grid-cols-2 gap-sm mt-sm">
                <select value={devirKimden} onChange={(e) => { setDevirKimden(e.target.value); setDevirSaat(0); }} className="bg-surface-container-high border border-white/10 rounded-lg px-sm py-sm text-on-surface font-body-md">
                  {TAKIM.map((u) => <option key={u.id} value={u.id}>{u.ad} kişisinden</option>)}
                </select>
                <select value={devirKime} onChange={(e) => setDevirKime(e.target.value)} className="bg-surface-container-high border border-white/10 rounded-lg px-sm py-sm text-on-surface font-body-md">
                  {TAKIM.map((u) => <option key={u.id} value={u.id}>{u.ad} kişisine</option>)}
                </select>
              </div>
            </div>

            <p className="font-label-sm text-on-surface-variant">Bu bir senaryodur; panodaki görevleri değiştirmez. Aktarım, kişinin kalan işiyle sınırlıdır. Farklı roller arasında iş devretmeden önce yetkinlik uygunluğunu değerlendirin.</p>
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
              <div className="overflow-x-auto">
                <table className="w-full text-left font-label-sm">
                  <caption className="text-left text-on-surface mb-sm">Kalan iş karşılaştırması (saat)</caption>
                  <thead><tr><th scope="col">Kişi</th><th scope="col">Mevcut</th><th scope="col">Senaryo</th></tr></thead>
                  <tbody>{temel.uyeler.map((u, i) => <tr key={u.uye.id} className="border-t border-white/10">
                    <th scope="row" className="py-2 font-normal">{u.uye.ad}</th><td>{u.atanan}</td><td>{senaryo.uyeler[i].atanan}</td>
                  </tr>)}</tbody>
                  <tfoot><tr className="border-t border-white/10"><th scope="row">Toplam</th><td>{temel.uyeler.reduce((t, u) => t + u.atanan, 0)}</td><td>{acikSaat}</td></tr></tfoot>
                </table>
              </div>
            )}
            {degisti && (
              <button onClick={sifirla} className="w-full px-md py-sm rounded-lg border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm transition-colors">
                Senaryoyu sıfırla
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
