import { MonthlyStats, Overview, StreaksData, WeeklyStats } from '../types';
import { api, unwrap } from './api';

export const statsService = {
  overview: () => unwrap<Overview>(api.get('/statistics/overview')),
  weekly: () => unwrap<WeeklyStats>(api.get('/statistics/weekly')),
  monthly: (month?: string) => unwrap<MonthlyStats>(api.get('/statistics/monthly', { params: { month } })),
  streaks: () => unwrap<StreaksData>(api.get('/statistics/streaks')),
};
