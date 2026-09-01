// Date Utilities with Turkish locale support

export const TURKISH_DAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts', 'Paz'];
export const TURKISH_DAYS_FULL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

/**
 * Format a Date or dateKey to "YYYY-MM-DD"
 */
export function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/**
 * Format date nicely e.g., "1 Eylül 2026, Salı"
 */
export function formatTurkishDate(dateOrKey: Date | string, includeDayName = true): string {
  const d = typeof dateOrKey === 'string' ? parseDateKey(dateOrKey) : dateOrKey;
  const day = d.getDate();
  const month = TURKISH_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  
  if (!includeDayName) {
    return `${day} ${month} ${year}`;
  }
  
  // getDay: 0 is Sun, 1 is Mon...
  const jsDay = d.getDay();
  const trDayIndex = jsDay === 0 ? 6 : jsDay - 1;
  const dayName = TURKISH_DAYS_FULL[trDayIndex];
  
  return `${day} ${month} ${year}, ${dayName}`;
}

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Returns the 7 days of the current week (Monday to Sunday)
 */
export function getCurrentWeekDays(referenceDate: Date = new Date()): { dateKey: string; dayName: string; shortName: string; dayNumber: number; isToday: boolean; isPast: boolean; isFuture: boolean }[] {
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);
  
  // Calculate Monday of this week
  const jsDay = ref.getDay(); // 0 is Sun, 1 is Mon ...
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;
  
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + diffToMonday);
  
  const todayKey = getTodayKey();
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const key = formatDateKey(current);
    const dayNumber = current.getDate();
    
    days.push({
      dateKey: key,
      dayName: TURKISH_DAYS_FULL[i],
      shortName: TURKISH_DAYS_SHORT[i],
      dayNumber,
      isToday: key === todayKey,
      isPast: key < todayKey,
      isFuture: key > todayKey
    });
  }
  
  return days;
}

/**
 * Returns ISO week ID like "2026-W36"
 */
export function getWeekId(d: Date = new Date()): string {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${target.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

export const getCurrentWeekId = getWeekId;
