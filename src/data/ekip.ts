// DENG-AI demosunun ekibi ve örnek geçmişi. Gerçek bir ekibe ait değildir, ekranda "örnek veri" olarak etiketlenir.
export interface TakimUyesi {
  id: string;
  ad: string;
  rol: string;
  renk: string;
}

// 2 haftalık sprint, kişi başı haftada 30 verimli saat
export const SPRINT_KAPASITE_SAAT = 60;
export const GUNLUK_SAAT = 6;

export const TAKIM: TakimUyesi[] = [
  { id: 'elif', ad: 'Elif', rol: 'Geliştirici', renk: '#ef6719' },
  { id: 'mert', ad: 'Mert', rol: 'Geliştirici', renk: '#4b8eff' },
  { id: 'zeynep', ad: 'Zeynep', rol: 'Geliştirici', renk: '#8b5cf6' },

];

// her sprint için [tahmin, gerçekleşen] saat, ilk üç kayıt sade demoda kullanılır
export const GECMIS: Record<string, [number, number][]> = {
  elif: [[40, 60], [44, 66], [48, 72]],
  mert: [[30, 33], [30, 33], [30, 33]],
  zeynep: [[30, 30], [30, 30], [30, 30]],
  can: [[36, 44], [38, 50], [40, 52], [38, 49], [42, 55], [40, 52]],
  deniz: [[28, 30], [30, 31], [34, 35], [32, 34], [30, 31], [34, 36]],
};

// Önceki demo kayıtları silinmez; analizde bu kişilerin işleri de korunur.
export const ESKI_UYELER: TakimUyesi[] = [
  { id: 'can', ad: 'Can', rol: 'Geliştirici', renk: '#14b8a6' },
  { id: 'deniz', ad: 'Deniz', rol: 'Geliştirici', renk: '#e879a9' },
];
