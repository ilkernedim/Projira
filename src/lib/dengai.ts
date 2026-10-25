import { addBusinessDays, differenceInBusinessDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { GUNLUK_SAAT, SPRINT_KAPASITE_SAAT, TAKIM, type TakimUyesi } from '../data/ekip';
import type { BoardData, SprintReport, Task } from '../interfaces';

export interface Kayit {
  tahmin: number;
  gercek: number;
}

// Gerçek teslim hızı: gerçekleşen saat / tahmin edilen saat. 1,30 demek, 100 saatlik iş gerçekte 130 saat sürüyor.
export function carpan(gecmis: Kayit[]): number {
  const tahmin = gecmis.reduce((t, s) => t + s.tahmin, 0);
  const gercek = gecmis.reduce((t, s) => t + s.gercek, 0);
  return tahmin > 0 ? gercek / tahmin : 1;
}

// Panodaki DONE dışındaki görevler: henüz bitmemiş iş
export function acikIsler(board: BoardData): Task[] {
  return Object.values(board.columns)
    .filter((k) => k.id !== 'done')
    .flatMap((k) => k.taskIds.map((id) => board.tasks[id]))
    .filter((t): t is Task => Boolean(t));
}

export const kalanSaat = (t: Task) => Math.max((t.estimatedTime ?? 0) - (t.loggedTime ?? 0), 0);

export interface UyeAnalizi {
  uye: TakimUyesi;
  carpan: number;
  gecmisSayisi: number;
  atanan: number;
  gercekciSaat: number;
  yukYuzde: number;
  isGunu: number;
  planIsGunu: number;
  // geçmiş sprintlerin kapasiteye göre yükü (gerçekleşen / kapasite)
  yukGecmisi: number[];
  tukenmisRisk: boolean;
  isler: Task[];
}

export interface EkipAnalizi {
  uyeler: UyeAnalizi[];
  ekipCarpani: number;
  sprintSayisi: number;
  planBitis: Date;
  gercekciBitis: Date;
  kaymaGun: number;
  planIsGunu: number;
  gercekciIsGunu: number;
  darbogaz: UyeAnalizi;
  atanmamislar: Task[];
  atanmamisSaat: number;
}

function uyeGecmisi(sprintler: SprintReport[], id: string): Kayit[] {
  return sprintler
    .filter((s) => s.memberStats?.[id])
    .map((s) => ({ tahmin: s.memberStats![id].estimated, gercek: s.memberStats![id].logged }));
}

export function analizEt(board: BoardData, sprintler: SprintReport[], baslangic: Date, ekstra: Record<string, number> = {}): EkipAnalizi {
  const acik = acikIsler(board);
  const tumGecmis = TAKIM.flatMap((u) => uyeGecmisi(sprintler, u.id));
  const ekipCarpani = carpan(tumGecmis);

  const uyeler: UyeAnalizi[] = TAKIM.map((uye) => {
    const gecmis = uyeGecmisi(sprintler, uye.id);
    // kişinin kendi geçmişi yoksa ekip ortalaması kullanılır
    const c = gecmis.length > 0 ? carpan(gecmis) : ekipCarpani;
    const isler = acik.filter((t) => t.assignee?.id === uye.id);
    const atanan = Math.max(isler.reduce((t, i) => t + kalanSaat(i), 0) + (ekstra[uye.id] ?? 0), 0);
    const gercekciSaat = atanan * c;
    const yukGecmisi = gecmis.map((s) => s.gercek / SPRINT_KAPASITE_SAAT);
    const son3 = yukGecmisi.slice(-3);
    return {
      uye,
      carpan: c,
      gecmisSayisi: gecmis.length,
      atanan,
      gercekciSaat,
      yukYuzde: Math.round((gercekciSaat / SPRINT_KAPASITE_SAAT) * 100),
      isGunu: Math.ceil(gercekciSaat / GUNLUK_SAAT),
      planIsGunu: Math.ceil(atanan / GUNLUK_SAAT),
      yukGecmisi,
      // son üç sprintin üçünde de kapasitenin üzerinde çalışılmışsa risk var
      tukenmisRisk: son3.length === 3 && son3.every((y) => y > 1),
      isler,
    };
  });

  const planIsGunu = Math.max(...uyeler.map((u) => u.planIsGunu));
  const gercekciIsGunu = Math.max(...uyeler.map((u) => u.isGunu));
  const darbogaz = uyeler.reduce((a, b) => (b.isGunu > a.isGunu ? b : a));
  const atanmamislar = acik.filter((t) => !t.assignee && kalanSaat(t) > 0);

  return {
    uyeler,
    ekipCarpani,
    sprintSayisi: sprintler.filter((s) => s.memberStats).length,
    planBitis: addBusinessDays(baslangic, planIsGunu),
    gercekciBitis: addBusinessDays(baslangic, gercekciIsGunu),
    kaymaGun: gercekciIsGunu - planIsGunu,
    planIsGunu,
    gercekciIsGunu,
    darbogaz,
    atanmamislar,
    atanmamisSaat: atanmamislar.reduce((t, i) => t + kalanSaat(i), 0),
  };
}

export function sprintOzeti(sprintler: SprintReport[]) {
  return sprintler.map((s) => ({
    ad: s.name,
    tahmin: s.totalEstimated,
    gercek: s.totalLogged,
    sapma: s.deviationPercent,
    ornek: Boolean(s.ornek),
  }));
}

// İş dengeleme önerisi: en yüklü kişiden en az yüklü kişiye 2 saatlik adımlarla iş aktarır,
// teslim tarihini en çok öne çeken dağılımı bulur.
export interface Oneri {
  ekstra: Record<string, number>;
  kimden: UyeAnalizi;
  kime: UyeAnalizi;
  saat: number;
  yeni: EkipAnalizi;
  kazancGun: number;
}

export function oneriBul(board: BoardData, sprintler: SprintReport[], baslangic: Date): Oneri | null {
  const temel = analizEt(board, sprintler, baslangic);
  if (temel.kaymaGun <= 0 && temel.uyeler.every((u) => u.yukYuzde <= 100)) return null;

  const ekstra: Record<string, number> = {};
  let guncel = temel;
  let enIyi: { ekstra: Record<string, number>; analiz: EkipAnalizi } | null = null;

  for (let adim = 0; adim < 20; adim++) {
    const cok = guncel.uyeler.reduce((a, b) => (b.yukYuzde > a.yukYuzde ? b : a));
    const az = guncel.uyeler.reduce((a, b) => (b.yukYuzde < a.yukYuzde ? b : a));
    if (cok.uye.id === az.uye.id || cok.atanan < 2 || cok.yukYuzde - az.yukYuzde < 5) break;
    ekstra[cok.uye.id] = (ekstra[cok.uye.id] ?? 0) - 2;
    ekstra[az.uye.id] = (ekstra[az.uye.id] ?? 0) + 2;
    guncel = analizEt(board, sprintler, baslangic, ekstra);
    if (!enIyi || guncel.gercekciIsGunu < enIyi.analiz.gercekciIsGunu) enIyi = { ekstra: { ...ekstra }, analiz: guncel };
  }

  if (!enIyi || enIyi.analiz.gercekciIsGunu >= temel.gercekciIsGunu) return null;
  const sirali = Object.entries(enIyi.ekstra).sort((a, b) => a[1] - b[1]);
  const kimdenId = sirali[0][0];
  const kimeId = sirali[sirali.length - 1][0];
  return {
    ekstra: enIyi.ekstra,
    kimden: temel.uyeler.find((u) => u.uye.id === kimdenId)!,
    kime: temel.uyeler.find((u) => u.uye.id === kimeId)!,
    saat: Math.abs(sirali[0][1]),
    yeni: enIyi.analiz,
    kazancGun: temel.gercekciIsGunu - enIyi.analiz.gercekciIsGunu,
  };
}

export const tarihYaz = (d: Date) => format(d, 'd MMMM yyyy, EEEE', { locale: tr });
export const gunFarki = (a: Date, b: Date) => differenceInBusinessDays(a, b);

// Kural tabanlı yorumlar. Yapay zeka modeli kullanmaz, aynı veriyle her zaman aynı sonucu verir.
export function yorumlar(a: EkipAnalizi): { tur: 'uyari' | 'bilgi' | 'iyi'; metin: string }[] {
  const liste: { tur: 'uyari' | 'bilgi' | 'iyi'; metin: string }[] = [];
  if (a.sprintSayisi === 0) {
    return [{ tur: 'bilgi', metin: 'Henüz kapanmış sprint yok. DENG-AI, bir sprint tamamlandıkça ekibin gerçek hızını öğrenir.' }];
  }
  const yuzde = Math.round((a.ekipCarpani - 1) * 100);
  if (yuzde > 5) {
    liste.push({
      tur: yuzde > 15 ? 'uyari' : 'bilgi',
      metin: `Ekip tahminlerini ortalama %${yuzde} düşük koyuyor. 100 saatlik bir iş gerçekte yaklaşık ${Math.round(a.ekipCarpani * 100)} saat sürüyor.`,
    });
  } else {
    liste.push({ tur: 'iyi', metin: 'Ekibin tahminleri gerçekleşenle uyumlu, belirgin bir sapma görünmüyor.' });
  }
  if (a.kaymaGun > 0) {
    liste.push({
      tur: 'uyari',
      metin: `Kâğıt üstündeki plan ${tarihYaz(a.planBitis)} diyor, geçmiş hıza göre gerçekçi teslim ${tarihYaz(a.gercekciBitis)}. Aradaki fark ${a.kaymaGun} iş günü.`,
    });
  }
  liste.push({
    tur: 'bilgi',
    metin: `Takvimi belirleyen kişi ${a.darbogaz.uye.ad} (${a.darbogaz.isGunu} iş günü). İş dağılımı değişirse tarih de değişir.`,
  });
  a.uyeler.filter((u) => u.tukenmisRisk).forEach((u) =>
    liste.push({ tur: 'uyari', metin: `${u.uye.ad} son üç sprinttir kapasitesinin üzerinde çalışıyor. Tükenmişlik riski var.` }),
  );
  a.uyeler.filter((u) => u.yukYuzde > 100 && !u.tukenmisRisk).forEach((u) =>
    liste.push({ tur: 'uyari', metin: `${u.uye.ad} bu sprint kapasitesinin %${u.yukYuzde}'ine ulaşıyor.` }),
  );
  if (a.atanmamisSaat > 0) {
    liste.push({ tur: 'bilgi', metin: `${a.atanmamislar.length} görev (${a.atanmamisSaat} saat) kimseye atanmamış, teslim tarihine dahil değil. Atanınca tarih değişebilir.` });
  }
  const rahat = a.uyeler.filter((u) => u.yukYuzde < 70).map((u) => u.uye.ad);
  if (rahat.length) liste.push({ tur: 'iyi', metin: `${rahat.join(', ')} kapasitesinin %70'inin altında, iş devredilebilir.` });
  return liste;
}
