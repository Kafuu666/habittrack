export interface User {
  id: number;
  name: string;
  email: string;
  photo_url?: string | null; // path relatif, ubah ke URL penuh dengan assetUrl()
  created_at?: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface CategoryRef {
  id: number;
  name: string;
  color: string | null;
}

export interface Category extends CategoryRef {
  is_default: boolean;
  user_id: number | null;
}

export type Frequency = 'DAILY' | 'WEEKLY';

export interface Habit {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  frequency: Frequency;
  target_count: number;
  reminder_time: string | null; // "HH:mm"
  is_active: boolean;
  category_id: number | null;
  category: CategoryRef | null;
  schedule_days: number[]; // 1 = Senin ... 7 = Minggu
  created_at: string;
  updated_at: string;
}

export interface HabitPayload {
  name: string;
  description?: string | null;
  category_id?: number | null;
  icon?: string | null;
  frequency: Frequency;
  days_of_week?: number[];
  target_count: number;
  reminder_time: string | null;
  is_active?: boolean;
}

export interface DaySummary {
  scheduled: number;
  completed: number;
  progress: number;
}

export interface DayHabit {
  habit_id: number;
  name: string;
  icon: string | null;
  category: CategoryRef | null;
  target_count: number;
  reminder_time: string | null;
  completed: boolean;
  completed_at: string | null;
}

export interface DayDetail {
  date: string;
  summary: DaySummary;
  habits: DayHabit[];
}

export type DayStatus = 'NO_SCHEDULE' | 'COMPLETED' | 'PARTIAL' | 'MISSED' | 'PENDING' | 'UPCOMING';

export interface CalendarDay extends DaySummary {
  date: string;
  status: DayStatus;
}

export interface CalendarMonth {
  month: string;
  days: CalendarDay[];
}

export interface DailyStat extends DaySummary {
  date: string;
}

export interface Totals {
  scheduled: number;
  completed: number;
  rate: number;
}

export interface WeeklyStats {
  from: string;
  to: string;
  days: DailyStat[];
  totals: Totals;
}

export interface MonthlyStats {
  month: string;
  from: string;
  to: string;
  days: DailyStat[];
  weeks: (Totals & { label: string })[];
  totals: Totals;
}

export interface TopHabit {
  habit_id: number;
  name: string;
  icon: string | null;
  scheduled: number;
  completed: number;
  rate: number;
}

export interface Overview {
  today: DaySummary;
  active_habits: number;
  total_completed: number;
  completion_rate_30d: number;
  best_current_streak: number;
  best_streak: number;
  top_habits: TopHabit[];
}

export interface StreakItem {
  habit_id: number;
  name: string;
  icon: string | null;
  current: number;
  best: number;
}

export interface StreaksData {
  best_current: number;
  best_ever: number;
  habits: StreakItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  details?: { field: string; message: string }[];
}
