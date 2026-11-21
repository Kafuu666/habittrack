import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { HabitIcon } from '../../components/HabitIcon';
import { Screen } from '../../components/Screen';
import { EmptyView, ErrorView, LoadingView } from '../../components/StateViews';
import { colors, radius, spacing } from '../../constants/theme';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { calendarService } from '../../services/calendarService';
import { CalendarDay, DayStatus } from '../../types';
import {
  DAY_LABELS,
  buildMonthCells,
  formatLongDate,
  monthStr,
  monthTitle,
  parseDateStr,
  shiftMonth,
  todayStr,
} from '../../utils/date';

const STATUS_COLOR: Record<DayStatus, string | null> = {
  COMPLETED: colors.success,
  PARTIAL: colors.warning,
  MISSED: colors.danger,
  PENDING: colors.primary,
  UPCOMING: null,
  NO_SCHEDULE: null,
};

const LEGEND: { label: string; color: string }[] = [
  { label: 'Selesai', color: colors.success },
  { label: 'Sebagian', color: colors.warning },
  { label: 'Terlewat', color: colors.danger },
  { label: 'Belum', color: colors.primary },
];

export default function CalendarScreen() {
  const [month, setMonth] = useState(monthStr(new Date()));
  const [selected, setSelected] = useState(todayStr());
  const today = todayStr();

  const cal = useFocusLoad(() => calendarService.month(month), [month]);
  const day = useFocusLoad(() => calendarService.day(selected), [selected]);

  const changeMonth = (delta: number) => {
    const next = shiftMonth(month, delta);
    setMonth(next);
    // Pilih tanggal 1 pada bulan baru (atau hari ini bila bulan berjalan)
    setSelected(next === monthStr(new Date()) ? today : `${next}-01`);
  };

  const byDate = new Map<string, CalendarDay>((cal.data?.days ?? []).map((d) => [d.date, d]));
  const cells = buildMonthCells(month);

  return (
    <Screen
      refreshing={cal.refreshing || day.refreshing}
      onRefresh={() => {
        void cal.refresh();
        void day.refresh();
      }}
    >
      <Text style={styles.title}>Kalender</Text>

      <Card>
        <View style={styles.monthRow}>
          <Pressable onPress={() => changeMonth(-1)} hitSlop={12} accessibilityLabel="Bulan sebelumnya">
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.monthTitle}>{monthTitle(month)}</Text>
          <Pressable onPress={() => changeMonth(1)} hitSlop={12} accessibilityLabel="Bulan berikutnya">
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {DAY_LABELS.map((l) => (
            <Text key={l} style={styles.weekLabel}>
              {l}
            </Text>
          ))}
        </View>

        {cal.loading ? (
          <LoadingView />
        ) : cal.error && !cal.data ? (
          <ErrorView message={cal.error} onRetry={cal.reload} />
        ) : (
          <View style={styles.grid}>
            {cells.map((date, index) => {
              if (!date) return <View key={`empty-${index}`} style={styles.cell} />;
              const info = byDate.get(date);
              const dotColor = info ? STATUS_COLOR[info.status] : null;
              const isSelected = date === selected;
              const isToday = date === today;
              return (
                <Pressable
                  key={date}
                  style={styles.cell}
                  onPress={() => setSelected(date)}
                  accessibilityLabel={`Tanggal ${Number(date.slice(8))}`}
                >
                  <View style={[styles.dayBubble, isSelected && styles.daySelected, isToday && !isSelected && styles.dayToday]}>
                    <Text style={[styles.dayText, info?.status === 'NO_SCHEDULE' && styles.dayMuted]}>
                      {Number(date.slice(8))}
                    </Text>
                  </View>
                  <View style={[styles.dot, dotColor ? { backgroundColor: dotColor } : null]} />
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.legend}>
          {LEGEND.map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: l.color }]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.legendNote}>Tanggal tanpa penanda berarti tidak ada jadwal atau belum tiba.</Text>
      </Card>

      <Text style={styles.section}>{formatLongDate(parseDateStr(selected))}</Text>

      {day.loading ? (
        <LoadingView />
      ) : day.error && !day.data ? (
        <ErrorView message={day.error} onRetry={day.reload} />
      ) : day.data && day.data.habits.length === 0 ? (
        <Card>
          <EmptyView icon="calendar-clear-outline" title="Tidak ada jadwal" subtitle="Tidak ada kebiasaan terjadwal pada tanggal ini." />
        </Card>
      ) : (
        day.data?.habits.map((h) => (
          <Card key={h.habit_id} style={styles.habitRow}>
            <HabitIcon name={h.icon} color={h.completed ? colors.success : colors.secondary} />
            <Text style={[styles.habitName, h.completed && styles.habitDone]} numberOfLines={1}>
              {h.name}
            </Text>
            <Ionicons
              name={h.completed ? 'checkmark-circle' : selected < today ? 'close-circle' : 'ellipse-outline'}
              size={24}
              color={h.completed ? colors.success : selected < today ? colors.danger : colors.textSecondary}
            />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  monthTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  weekRow: { flexDirection: 'row', marginBottom: spacing.xs },
  weekLabel: { width: '14.2857%', textAlign: 'center', color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.2857%', alignItems: 'center', paddingVertical: 3, gap: 2 },
  dayBubble: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  daySelected: { backgroundColor: colors.primary },
  dayToday: { borderWidth: 1, borderColor: colors.secondary },
  dayText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  dayMuted: { color: colors.textSecondary },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'transparent' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { color: colors.textSecondary, fontSize: 12 },
  legendNote: { color: colors.textSecondary, fontSize: 11, marginTop: spacing.xs },
  section: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: spacing.sm },
  habitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12, borderRadius: radius.md },
  habitName: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
  habitDone: { color: colors.textSecondary },
});
