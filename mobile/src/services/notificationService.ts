import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { colors } from '../constants/theme';
import { Habit } from '../types';
import { habitService } from './habitService';

const CHANNEL_ID = 'habit-reminders';
const ENABLED_KEY = 'settings.remindersEnabled';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function isRemindersEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(ENABLED_KEY)) !== 'false';
}

export async function setRemindersEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Pengingat kebiasaan',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: colors.primary,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Jadwalkan ulang semua pengingat lokal dari daftar kebiasaan (backend hanya menyimpan preferensi)
export async function scheduleReminders(habits: Habit[]): Promise<void> {
  await cancelAllReminders();
  if (!(await isRemindersEnabled())) return;
  if (!(await ensureNotificationPermission())) return;

  for (const habit of habits) {
    if (!habit.is_active || !habit.reminder_time) continue;
    const [hour, minute] = habit.reminder_time.split(':').map(Number);
    const content = { title: 'Waktunya kebiasaanmu', body: habit.name, data: { habitId: habit.id } };

    if (habit.schedule_days.length >= 7) {
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: CHANNEL_ID,
        },
      });
    } else {
      for (const day of habit.schedule_days) {
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            // Backend: 1 = Senin ... 7 = Minggu. Expo: 1 = Minggu ... 7 = Sabtu.
            weekday: day === 7 ? 1 : day + 1,
            hour,
            minute,
            channelId: CHANNEL_ID,
          },
        });
      }
    }
  }
}

// Ambil kebiasaan terbaru dari server lalu jadwalkan ulang; kegagalan tidak boleh mengganggu alur utama
export async function resyncReminders(): Promise<void> {
  try {
    const habits = await habitService.list();
    await scheduleReminders(habits);
  } catch {
    // diabaikan
  }
}
