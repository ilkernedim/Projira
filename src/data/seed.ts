import type { BoardData, SprintReport, Task, TaskType, Priority } from '../interfaces';
import { GECMIS, TAKIM } from './ekip';

const kisi = (id: string) => {
  const u = TAKIM.find((t) => t.id === id)!;
  return { id: u.id, name: u.ad };
};

const ilker = { id: 'user-1', name: 'İlker' };

interface Ham {
  baslik: string;
  aciklama: string;
  tur: TaskType;
  oncelik: Priority;
  kolon: 'todo' | 'in-progress' | 'done';
  kisi?: string;
  tahmin: number;
  gercek?: number;
}

const hamlar: Ham[] = [
  { baslik: 'Üye girişini hazırla', aciklama: 'Kullanıcıların hesaplarına giriş yapabileceği ekran ve bağlantıları hazırla.', tur: 'Task', oncelik: 'High', kolon: 'todo', kisi: 'elif', tahmin: 24 },
  { baslik: 'Sipariş ekranını hazırla', aciklama: 'Yeni sipariş oluşturma ve siparişi görüntüleme akışını tamamla.', tur: 'Task', oncelik: 'High', kolon: 'in-progress', kisi: 'elif', tahmin: 30, gercek: 6 },
  { baslik: 'Ana sayfayı düzenle', aciklama: 'Başlıkları, görselleri ve sayfa yerleşimini düzenle.', tur: 'Task', oncelik: 'Medium', kolon: 'todo', kisi: 'mert', tahmin: 18 },
  { baslik: 'İletişim formunu hazırla', aciklama: 'İletişim formu tamamlandı ve kontrol edildi.', tur: 'Task', oncelik: 'Medium', kolon: 'done', kisi: 'mert', tahmin: 6, gercek: 7 },
  { baslik: 'Mobil görünümü düzenle', aciklama: 'Sayfaların telefonda rahat kullanılmasını sağla.', tur: 'Task', oncelik: 'Medium', kolon: 'todo', kisi: 'zeynep', tahmin: 12 },
  { baslik: 'Son kontrolleri yap', aciklama: 'Bağlantıları ve temel kullanıcı akışlarını kontrol et.', tur: 'Task', oncelik: 'Medium', kolon: 'in-progress', kisi: 'zeynep', tahmin: 6, gercek: 2 },
];

export function ornekPano(): BoardData {
  const tasks: Record<string, Task> = {};
  const columns: BoardData['columns'] = {
    todo: { id: 'todo', title: 'Yapılacak', taskIds: [] },
    'in-progress': { id: 'in-progress', title: 'Devam ediyor', taskIds: [] },
    done: { id: 'done', title: 'Tamamlandı', taskIds: [] },
  };
  const simdi = Date.now();
  hamlar.forEach((h, i) => {
    const id = `task-${i + 1}`;
    tasks[id] = {
      id,
      title: h.baslik,
      description: h.aciklama,
      type: h.tur,
      priority: h.oncelik,
      statusId: h.kolon,
      assignee: h.kisi ? kisi(h.kisi) : undefined,
      reporter: ilker,
      createdAt: simdi,
      estimatedTime: h.tahmin,
      loggedTime: h.gercek,
    };
    columns[h.kolon].taskIds.push(id);
  });
  return { tasks, columns, columnOrder: ['todo', 'in-progress', 'done'] };
}

const tamamlanan = [4, 5, 5];
const tamamlanmayan = [2, 1, 1];

// Üç geçmiş sprint, her birinde kişi bazlı tahmin ve gerçekleşen saat
export function ornekSprintler(): SprintReport[] {
  const gun = 24 * 60 * 60 * 1000;
  return Array.from({ length: 3 }, (_, i) => {
    const memberStats: Record<string, { estimated: number; logged: number }> = {};
    let totalEstimated = 0;
    let totalLogged = 0;
    TAKIM.forEach((u) => {
      const [t, g] = GECMIS[u.id][i];
      memberStats[u.id] = { estimated: t, logged: g };
      totalEstimated += t;
      totalLogged += g;
    });
    return {
      id: `ornek-sprint-${i + 1}`,
      name: `Sprint ${i + 1}`,
      completedTasks: tamamlanan[i],
      uncompletedTasks: tamamlanmayan[i],
      totalEstimated,
      totalLogged,
      deviationPercent: Math.round(((totalLogged - totalEstimated) / totalEstimated) * 100),
      endDate: Date.now() - (3 - i) * 14 * gun,
      memberStats,
      ornek: true,
    };
  });
}
