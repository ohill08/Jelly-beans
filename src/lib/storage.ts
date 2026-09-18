import type { DayEntry } from './types';

const STORAGE_KEY = 'habit-jar:entries';

export function loadEntries(): DayEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DayEntry[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => a.date.localeCompare(b.date)) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: DayEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently.
  }
}

export function upsertEntry(entries: DayEntry[], entry: DayEntry): DayEntry[] {
  const withoutDate = entries.filter((e) => e.date !== entry.date);
  const next = [...withoutDate, entry].sort((a, b) => a.date.localeCompare(b.date));
  saveEntries(next);
  return next;
}
