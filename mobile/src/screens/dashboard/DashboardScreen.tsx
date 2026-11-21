import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { HabitCheckItem } from '../../components/HabitCheckItem';
import { ProgressRing } from '../../components/ProgressRing';
import { Screen } from '../../components/Screen';
import { EmptyView, ErrorView, LoadingView } from '../../components/StateViews';
import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { getErrorMessage } from '../../services/api';
import { habitService } from '../../services/habitService';
import { statsService } from '../../services/statsService';
import { DayHabit } from '../../types';
import { formatLongDate, greeting } from '../../utils/date';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [busyId, setBusyId] = useState<number | null>(null);

  const { data, loading, error, refreshing, reload, refresh } = useFocusLoad(async () => {
    const [day, overview] = await Promise.all([habitService.todayLogs(), statsService.overview()]);
    return { day, overview };
  });

  const toggle = async (item: DayHabit) => {
    setBusyId(item.habit_id);
    try {
      if (item.completed) await habitService.uncomplete(item.habit_id);
      else await habitService.complete(item.habit_id);
      await reload();
    } catch (e) {
      Alert.alert('Gagal memperbarui', getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const firstName = user?.name.split(' ')[0] ?? '';

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View>
        <Text style={styles.date}>{formatLongDate(new Date())}</Text>
        <Text style={styles.greeting}>
          {greeting()}, {firstName}!
        </Text>
      </View>

      {loading ? (
        <LoadingView />
      ) : error && !data ? (
        <ErrorView message={error} onRetry={reload} />
      ) : data ? (
        <>
          <Card style={styles.summary}>
            <ProgressRing percent={data.day.summary.progress} />
            <View style={styles.summaryText}>
              <Text style={styles.summaryTitle}>Progres hari ini</Text>
              <Text style={styles.summaryLine}>
                <Text style={styles.strong}>{data.day.summary.completed}</Text> dari{' '}
                <Text style={styles.strong}>{data.day.summary.scheduled}</Text> kebiasaan selesai
              </Text>
              <View style={styles.streakRow}>
                <Ionicons name="flame" size={18} color={colors.warning} />
                <Text style={styles.streakText}>
                  Streak {data.overview.best_current_streak} hari • terbaik {data.overview.best_streak}
                </Text>
              </View>
            </View>
          </Card>

          <Text style={styles.section}>Checklist hari ini</Text>

          {data.day.habits.length === 0 ? (
            <Card>
              <EmptyView
                icon="sparkles-outline"
                title="Tidak ada kebiasaan hari ini"
                subtitle="Tambahkan kebiasaan di tab Kebiasaan, atau nikmati hari liburmu."
              />
            </Card>
          ) : (
            data.day.habits.map((item) => (
              <HabitCheckItem key={item.habit_id} item={item} busy={busyId === item.habit_id} onToggle={toggle} />
            ))
          )}

          {error ? <Text style={styles.stale}>Data mungkin belum terbaru: {error}</Text> : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  date: { color: colors.textSecondary, fontSize: 13 },
  greeting: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 2 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  summaryText: { flex: 1, gap: spacing.xs },
  summaryTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  summaryLine: { color: colors.textSecondary, fontSize: 14 },
  strong: { color: colors.text, fontWeight: '800' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  streakText: { color: colors.secondary, fontSize: 13, fontWeight: '600', flexShrink: 1 },
  section: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: spacing.sm },
  stale: { color: colors.warning, fontSize: 12, textAlign: 'center' },
});
