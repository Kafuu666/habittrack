import { DayDetail, Habit, HabitPayload } from '../types';
import { api, unwrap } from './api';

export const habitService = {
  list: (params?: { is_active?: boolean; category_id?: number }) =>
    unwrap<Habit[]>(api.get('/habits', { params: { limit: 100, ...params } })),
  get: (id: number) => unwrap<Habit>(api.get(`/habits/${id}`)),
  create: (payload: HabitPayload) => unwrap<Habit>(api.post('/habits', payload)),
  update: (id: number, payload: Partial<HabitPayload>) => unwrap<Habit>(api.put(`/habits/${id}`, payload)),
  remove: (id: number) => unwrap<null>(api.delete(`/habits/${id}`)),

  todayLogs: () => unwrap<DayDetail>(api.get('/habits/logs/today')),
  complete: (id: number) => unwrap<unknown>(api.post(`/habits/${id}/complete`, {})),
  uncomplete: (id: number) => unwrap<unknown>(api.delete(`/habits/${id}/complete`)),
};
