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
  { id: 'elif', ad: 'Elif', rol: 'Backend', renk: '#ef6719' },
  { id: 'mert', ad: 'Mert', rol: 'Frontend', renk: '#4b8eff' },
  { id: 'zeynep', ad: 'Zeynep', rol: 'Test', renk: '#8b5cf6' },
  { id: 'can', ad: 'Can', rol: 'Backend', renk: '#14b8a6' },
  { id: 'deniz', ad: 'Deniz', rol: 'Frontend', renk: '#e879a9' },
];

// her sprint için [tahmin, gerçekleşen] saat, sprint 1'den 6'ya
export const GECMIS: Record<string, [number, number][]> = {
  elif: [[40, 52], [42, 60], [45, 66], [44, 64], [46, 68], [48, 72]],
  mert: [[38, 42], [40, 44], [36, 40], [42, 47], [40, 43], [38, 41]],
  zeynep: [[30, 31], [32, 32], [34, 35], [30, 31], [33, 33], [35, 35]],
  can: [[36, 44], [38, 50], [40, 52], [38, 49], [42, 55], [40, 52]],
  deniz: [[28, 30], [30, 31], [34, 35], [32, 34], [30, 31], [34, 36]],
};
