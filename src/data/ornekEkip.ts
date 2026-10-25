// DENG-AI demosu için örnek veri. Gerçek ekip verisi değildir, ekranda "örnek veri" olarak etiketlenir.
export interface UyeGecmisi {
  tahmin: number;
  gercek: number;
}

export interface EkipUyesi {
  id: string;
  ad: string;
  rol: string;
  // her sprint için tahmin edilen ve gerçekleşen saat (sprint 1'den 6'ya)
  gecmis: UyeGecmisi[];
  // bu sprintte kişiye atanan, henüz bitmemiş işin tahmini saati
  atanan: number;
}

// 2 haftalık sprint, kişi başı haftada 30 verimli saat
export const SPRINT_KAPASITE_SAAT = 60;
export const GUNLUK_SAAT = 6;
export const SPRINT_IS_GUNU = 10;

export const sprintAdlari = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6'];

const g = (liste: [number, number][]): UyeGecmisi[] => liste.map(([tahmin, gercek]) => ({ tahmin, gercek }));

export const ornekEkip: EkipUyesi[] = [
  { id: 'elif', ad: 'Elif', rol: 'Backend', atanan: 58,
    gecmis: g([[40, 52], [42, 60], [45, 66], [44, 64], [46, 68], [48, 72]]) },
  { id: 'mert', ad: 'Mert', rol: 'Frontend', atanan: 38,
    gecmis: g([[38, 42], [40, 44], [36, 40], [42, 47], [40, 43], [38, 41]]) },
  { id: 'zeynep', ad: 'Zeynep', rol: 'Test', atanan: 34,
    gecmis: g([[30, 31], [32, 32], [34, 35], [30, 31], [33, 33], [35, 35]]) },
  { id: 'can', ad: 'Can', rol: 'Backend', atanan: 44,
    gecmis: g([[36, 44], [38, 50], [40, 52], [38, 49], [42, 55], [40, 52]]) },
  { id: 'deniz', ad: 'Deniz', rol: 'Frontend', atanan: 33,
    gecmis: g([[28, 30], [30, 31], [34, 35], [32, 34], [30, 31], [34, 36]]) },
];
