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
  // Elif (Backend): açık işler 20 + 14 + 10 + 14 = 58 saat
  { baslik: 'Kimlik Doğrulama Servisini Yenile', aciklama: 'Token süresi ve yenileme akışı yeniden yazılacak.', tur: 'Story', oncelik: 'High', kolon: 'todo', kisi: 'elif', tahmin: 20 },
  { baslik: 'Webhook Altyapısı', aciklama: 'Dış sistemlere olay bildirimi gönderen kuyruk yapısı.', tur: 'Story', oncelik: 'High', kolon: 'todo', kisi: 'elif', tahmin: 14 },
  { baslik: 'Oran Sınırlama ve Loglama', aciklama: 'API isteklerine oran sınırı ve ayrıntılı log eklenecek.', tur: 'Task', oncelik: 'Medium', kolon: 'todo', kisi: 'elif', tahmin: 14 },
  { baslik: 'Bildirim Sistemi Entegrasyonu', aciklama: 'E-posta ve uygulama içi bildirim gönderen merkezi servis.', tur: 'Story', oncelik: 'High', kolon: 'in-progress', kisi: 'elif', tahmin: 16, gercek: 6 },
  { baslik: 'Ödeme API Entegrasyonu', aciklama: 'Ödeme sağlayıcısı bağlandı ve test edildi.', tur: 'Story', oncelik: 'High', kolon: 'done', kisi: 'elif', tahmin: 16, gercek: 22 },
  // Mert (Frontend): 16 + 10 + 7 + 5 = 38 saat
  { baslik: 'Müşteri Dashboard Tasarımı', aciklama: 'Yönetim panelinde satış, kullanıcı ve gelir grafikleri.', tur: 'Story', oncelik: 'High', kolon: 'todo', kisi: 'mert', tahmin: 16 },
  { baslik: 'Profil Sayfası Mobil Uyum', aciklama: 'Profil ekranının küçük ekranlarda düzeni.', tur: 'Task', oncelik: 'Medium', kolon: 'todo', kisi: 'mert', tahmin: 10 },
  { baslik: 'Tema ve Erişilebilirlik', aciklama: 'Koyu tema ve klavye erişilebilirliği düzeltmeleri.', tur: 'Task', oncelik: 'Low', kolon: 'todo', kisi: 'mert', tahmin: 7 },
  { baslik: 'Sayfa Yüklenme Performansı Optimizasyonu', aciklama: 'Görsellerin lazy-load edilmesi ve bundle boyutunun küçültülmesi.', tur: 'Task', oncelik: 'Medium', kolon: 'in-progress', kisi: 'mert', tahmin: 8, gercek: 3 },
  { baslik: 'Kullanıcı Profil Sayfası', aciklama: 'Profil bilgilerini güncelleme sayfası tamamlandı.', tur: 'Story', oncelik: 'Medium', kolon: 'done', kisi: 'mert', tahmin: 6, gercek: 7 },
  // Zeynep (Test): 14 + 12 + 8 = 34 saat
  { baslik: 'Uçtan Uca Test Senaryoları', aciklama: 'Kritik kullanıcı akışları için otomatik senaryolar.', tur: 'Task', oncelik: 'High', kolon: 'todo', kisi: 'zeynep', tahmin: 14 },
  { baslik: 'Performans Testi', aciklama: 'Yük altında yanıt süreleri ölçülecek.', tur: 'Task', oncelik: 'Medium', kolon: 'todo', kisi: 'zeynep', tahmin: 12 },
  { baslik: 'Regresyon Test Paketi', aciklama: 'Her sürümde çalışacak regresyon paketi.', tur: 'Task', oncelik: 'Medium', kolon: 'in-progress', kisi: 'zeynep', tahmin: 12, gercek: 4 },
  { baslik: 'Test Ortamı Kurulumu', aciklama: 'İzole test ortamı hazırlandı.', tur: 'Task', oncelik: 'Medium', kolon: 'done', kisi: 'zeynep', tahmin: 8, gercek: 8 },
  // Can (Backend): 4 + 22 + 6 + 12 = 44 saat
  { baslik: 'Login Sayfasında Şifre Sıfırlama Hatası', aciklama: 'Sıfırlama e-postası bazı kullanıcılara ulaşmıyor.', tur: 'Bug', oncelik: 'Highest', kolon: 'todo', kisi: 'can', tahmin: 4 },
  { baslik: 'Veri Taşıma Betikleri', aciklama: 'Eski şemadan yeni şemaya veri taşıma.', tur: 'Story', oncelik: 'High', kolon: 'todo', kisi: 'can', tahmin: 22 },
  { baslik: 'API Dokümantasyonu Hazırla', aciklama: 'Tüm endpoint\'ler için Swagger dokümantasyonu.', tur: 'Task', oncelik: 'Low', kolon: 'todo', kisi: 'can', tahmin: 6 },
  { baslik: 'Raporlama Sorguları', aciklama: 'Yönetim raporları için optimize sorgular.', tur: 'Story', oncelik: 'Medium', kolon: 'in-progress', kisi: 'can', tahmin: 20, gercek: 8 },
  { baslik: 'Veritabanı Yedekleme Sistemi', aciklama: 'Günlük otomatik yedekleme kuruldu ve test edildi.', tur: 'Task', oncelik: 'High', kolon: 'done', kisi: 'can', tahmin: 5, gercek: 7 },
  // Deniz (Frontend): 16 + 9 + 8 = 33 saat
  { baslik: 'Ayarlar Ekranı', aciklama: 'Hesap ve bildirim ayarlarının tek ekranda toplanması.', tur: 'Story', oncelik: 'Medium', kolon: 'todo', kisi: 'deniz', tahmin: 16 },
  { baslik: 'Bildirim Tercihleri Arayüzü', aciklama: 'Kanal bazında bildirim açma ve kapama.', tur: 'Task', oncelik: 'Medium', kolon: 'todo', kisi: 'deniz', tahmin: 9 },
  { baslik: 'Form Doğrulama Bileşenleri', aciklama: 'Ortak form doğrulama bileşen kütüphanesi.', tur: 'Task', oncelik: 'Medium', kolon: 'in-progress', kisi: 'deniz', tahmin: 14, gercek: 6 },
  { baslik: 'Tasarım Sistemi Bileşenleri', aciklama: 'Düğme, giriş ve kart bileşenleri tamamlandı.', tur: 'Task', oncelik: 'Medium', kolon: 'done', kisi: 'deniz', tahmin: 10, gercek: 11 },
  // Atanmamış iş: DENG-AI uyarısı için, bir kişiye atanınca grafikler değişir
  { baslik: 'Takvim Dışa Aktarma', aciklama: 'Sprint takvimini Google Takvim\'e aktaran özellik fikri, henüz kimseye atanmadı.', tur: 'Story', oncelik: 'Medium', kolon: 'todo', tahmin: 12 },
];

export function ornekPano(): BoardData {
  const tasks: Record<string, Task> = {};
  const columns: BoardData['columns'] = {
    todo: { id: 'todo', title: 'TO DO', taskIds: [] },
    'in-progress': { id: 'in-progress', title: 'IN PROGRESS', taskIds: [] },
    done: { id: 'done', title: 'DONE', taskIds: [] },
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

const tamamlanan = [9, 10, 11, 10, 11, 12];
const tamamlanmayan = [3, 3, 2, 4, 3, 4];

// altı geçmiş sprint, her birinde kişi bazlı tahmin ve gerçekleşen saat
export function ornekSprintler(): SprintReport[] {
  const gun = 24 * 60 * 60 * 1000;
  return Array.from({ length: 6 }, (_, i) => {
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
      endDate: Date.now() - (6 - i) * 14 * gun,
      memberStats,
      ornek: true,
    };
  });
}
