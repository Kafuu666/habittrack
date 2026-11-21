import { CalendarMonth, DayDetail } from '../types';
import { api, unwrap } from './api';

export const calendarService = {
  month: (month: string) => unwrap<CalendarMonth>(api.get('/calendar', { params: { month } })),
  day: (date: string) => unwrap<DayDetail>(api.get(`/calendar/${date}`)),
};
