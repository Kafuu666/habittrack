const pad = (n: number) => String(n).padStart(2, '0');

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// Indeks 0 = Senin (hari ke-1) ... indeks 6 = Minggu (hari ke-7), sama dengan day_of_week di backend
export const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => toDateStr(new Date());
export const monthStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const formatLongDate = (d: Date) =>
  `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;

export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export function monthTitle(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS_ID[m - 1]} ${y}`;
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  return monthStr(new Date(y, m - 1 + delta, 1));
}

// Sel kalender per bulan (minggu dimulai Senin); null = sel kosong
export function buildMonthCells(month: string): (string | null)[] {
  const [y, m] = month.split('-').map(Number);
  const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const total = new Date(y, m, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < offset; i += 1) cells.push(null);
  for (let d = 1; d <= total; d += 1) cells.push(`${month}-${pad(d)}`);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// Label hari singkat ("Sen", "Sel", ...) untuk sebuah tanggal "YYYY-MM-DD"
export const shortDayLabel = (dateStr: string) => DAY_LABELS[(parseDateStr(dateStr).getDay() + 6) % 7];

export function scheduleLabel(days: number[]): string {
  if (days.length >= 7) return 'Setiap hari';
  return [...days].sort((a, b) => a - b).map((d) => DAY_LABELS[d - 1]).join(', ');
}

// "19:00" -> Date (hari ini, jam tersebut) untuk time picker
export function timeToDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

export const dateToTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
