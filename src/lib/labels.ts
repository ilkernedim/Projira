import type { Priority, TaskType } from '../interfaces';

export const oncelikAdi: Record<Priority, string> = { Highest: 'Çok yüksek', High: 'Yüksek', Medium: 'Orta', Low: 'Düşük', Lowest: 'Çok düşük' };
export const turAdi: Record<TaskType, string> = { Task: 'Görev', Bug: 'Hata', Story: 'Kullanıcı hikayesi', Epic: 'Ana iş' };
export const durumAdi = (id: string, fallback: string) => ({ todo: 'Yapılacak', 'in-progress': 'Devam ediyor', done: 'Tamamlandı' }[id] ?? fallback);
