import { addBusinessDays, differenceInBusinessDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { GUNLUK_SAAT, SPRINT_KAPASITE_SAAT, sprintAdlari, type EkipUyesi } from '../data/ornekEkip';

// Gerçek teslim hızı: gerçekleşen saat / tahmin edilen saat. 1,30 demek, 100 saatlik iş gerçekte 130 saat sürüyor.
export function carpan(gecmis: { tahmin: number; gercek: number }[]): number {
  const tahmin = gecmis.reduce((t, s) => t + s.tahmin, 0);
  const gercek = gecmis.reduce((t, s) => t + s.gercek, 0);
  return tahmin > 0 ? gercek / tahmin : 1;
}

export interface UyeAnalizi {
  uye: EkipUyesi;
  carpan: number;
  atanan: number;
  gercekciSaat: number;
  yukYuzde: number;
  isGunu: number;
  planIsGunu: number;
  // son sprintlerin kapasiteye göre yükü (gerçekleşen / kapasite)
  yukGecmisi: number[];
  tukenmisRisk: boolean;
}

export interface EkipAnalizi {
  uyeler: UyeAnalizi[];
  ekipCarpani: number;
  planBitis: Date;
  gercekciBitis: Date;
  kaymaGun: number;
  planIsGunu: number;
  gercekciIsGunu: number;
  darbogaz: UyeAnalizi;
}

export function analizEt(ekip: EkipUyesi[], baslangic: Date, ekstra: Record<string, number> = {}): EkipAnalizi {
  const uyeler: UyeAnalizi[] = ekip.map((uye) => {
    const c = carpan(uye.gecmis);
    const atanan = uye.atanan + (ekstra[uye.id] ?? 0);
    const gercekciSaat = atanan * c;
    const yukGecmisi = uye.gecmis.map((s) => s.gercek / SPRINT_KAPASITE_SAAT);
    const son3 = yukGecmisi.slice(-3);
    return {
      uye,
      carpan: c,
      atanan,
      gercekciSaat,
      yukYuzde: Math.round((gercekciSaat / SPRINT_KAPASITE_SAAT) * 100),
      isGunu: Math.ceil(gercekciSaat / GUNLUK_SAAT),
      planIsGunu: Math.ceil(atanan / GUNLUK_SAAT),
      yukGecmisi,
      // son üç sprintin üçünde de kapasitenin üzerinde çalışılmışsa risk var
      tukenmisRisk: son3.length === 3 && son3.every((y) => y > 1),
    };
  });

  const planIsGunu = Math.max(...uyeler.map((u) => u.planIsGunu));
  const gercekciIsGunu = Math.max(...uyeler.map((u) => u.isGunu));
  const darbogaz = uyeler.reduce((a, b) => (b.isGunu > a.isGunu ? b : a));
  const tumGecmis = ekip.flatMap((u) => u.gecmis);

  return {
    uyeler,
    ekipCarpani: carpan(tumGecmis),
    planBitis: addBusinessDays(baslangic, planIsGunu),
    gercekciBitis: addBusinessDays(baslangic, gercekciIsGunu),
    kaymaGun: gercekciIsGunu - planIsGunu,
    planIsGunu,
    gercekciIsGunu,
    darbogaz,
  };
}

export function sprintOzeti(ekip: EkipUyesi[]) {
  return sprintAdlari.map((ad, i) => {
    const tahmin = ekip.reduce((t, u) => t + u.gecmis[i].tahmin, 0);
    const gercek = ekip.reduce((t, u) => t + u.gecmis[i].gercek, 0);
    return { ad, tahmin, gercek, sapma: Math.round(((gercek - tahmin) / tahmin) * 100) };
  });
}

export const tarihYaz = (d: Date) => format(d, 'd MMMM yyyy, EEEE', { locale: tr });
export const gunFarki = (a: Date, b: Date) => differenceInBusinessDays(a, b);

// Kural tabanlı yorumlar. Yapay zeka modeli kullanmaz, aynı veriyle her zaman aynı sonucu verir.
export function yorumlar(a: EkipAnalizi): { tur: 'uyari' | 'bilgi' | 'iyi'; metin: string }[] {
  const liste: { tur: 'uyari' | 'bilgi' | 'iyi'; metin: string }[] = [];
  const yuzde = Math.round((a.ekipCarpani - 1) * 100);
  liste.push({
    tur: yuzde > 15 ? 'uyari' : 'bilgi',
    metin: `Ekip tahminlerini ortalama %${yuzde} düşük koyuyor. 100 saatlik bir iş gerçekte yaklaşık ${Math.round(a.ekipCarpani * 100)} saat sürüyor.`,
  });
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
  const rahat = a.uyeler.filter((u) => u.yukYuzde < 70).map((u) => u.uye.ad);
  if (rahat.length) liste.push({ tur: 'iyi', metin: `${rahat.join(', ')} kapasitesinin %70'inin altında, iş devredilebilir.` });
  return liste;
}
