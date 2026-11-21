import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

import { Card } from '../../components/Card';
import { HabitIcon } from '../../components/HabitIcon';
import { ProgressBar } from '../../components/ProgressBar';
import { Screen } from '../../components/Screen';
import { EmptyView, ErrorView, LoadingView } from '../../components/StateViews';
import { colors, radius, spacing } from '../../constants/theme';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { statsService } from '../../services/statsService';
import { shortDayLabel } from '../../utils/date';

type Range = 'weekly' | 'monthly';

export default function StatisticsScreen() {
  const { width } = useWindowDimensions();
  const [range, setRange] = useState<Range>('weekly');

  const { data, loading, error, refreshing, reload, refresh } = useFocusLoad(async () => {
    const [overview, weekly, monthly, streaks] = await Promise.all([
      statsService.overview(),
      statsService.weekly(),
      statsService.monthly(),
      statsService.streaks(),
    ]);
    return { overview, weekly, monthly, streaks };
  });

  // lebar layar - padding halaman (2 x 16) - padding kartu (2 x 16)
  const chartWidth = width - spacing.md * 4;

  const chart =
    data &&
    (range === 'weekly'
      ? {
          labels: data.weekly.days.map((d) => shortDayLabel(d.date)),
          values: data.weekly.days.map((d) => d.progress),
          totals: data.weekly.totals,
        }
      : {
          labels: data.monthly.weeks.map((w) => w.label),
          values: data.monthly.weeks.map((w) => w.rate),
          totals: data.monthly.totals,
        });

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Text style={styles.title}>Statistik</Text>

      {loading ? (
        <LoadingView />
      ) : error && !data ? (
        <ErrorView message={error} onRetry={reload} />
      ) : data && chart ? (
        <>
          <View style={styles.tiles}>
            <Tile icon="checkmark-done" label="Total selesai" value={String(data.overview.total_completed)} />
            <Tile icon="pie-chart-outline" label="Konsistensi 30 hari" value={`${data.overview.completion_rate_30d}%`} />
            <Tile icon="flame" label="Streak saat ini" value={`${data.streaks.best_current} hari`} color={colors.warning} />
            <Tile icon="trophy-outline" label="Streak terbaik" value={`${data.streaks.best_ever} hari`} color={colors.success} />
          </View>

          <Card>
            <View style={styles.chartHeader}>
              <Text style={styles.cardTitle}>Progres</Text>
              <View style={styles.segment}>
                {(['weekly', 'monthly'] as Range[]).map((r) => (
                  <Pressable key={r} onPress={() => setRange(r)} style={[styles.segItem, range === r && styles.segActive]}>
                    <Text style={[styles.segText, range === r && styles.segTextActive]}>
                      {r === 'weekly' ? 'Mingguan' : 'Bulanan'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {chart.totals.scheduled === 0 ? (
              <EmptyView
                icon="bar-chart-outline"
                title="Belum ada data"
                subtitle="Grafik muncul setelah kamu punya kebiasaan terjadwal."
              />
            ) : (
              <>
                <BarChart
                  data={{ labels: chart.labels, datasets: [{ data: chart.values }] }}
                  width={chartWidth}
                  height={200}
                  yAxisLabel=""
                  yAxisSuffix="%"
                  fromZero
                  withInnerLines={false}
                  chartConfig={{
                    backgroundGradientFrom: colors.card,
                    backgroundGradientTo: colors.card,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                    labelColor: () => colors.textSecondary,
                    barPercentage: 0.6,
                  }}
                  style={styles.chart}
                />
                <Text style={styles.caption}>
                  {chart.totals.completed} dari {chart.totals.scheduled} aktivitas selesai ({chart.totals.rate}%)
                  {range === 'monthly' ? ' • per kelompok hari dalam bulan ini' : ''}
                </Text>
              </>
            )}
          </Card>

          <Card style={styles.listCard}>
            <Text style={styles.cardTitle}>Konsistensi tertinggi (30 hari)</Text>
            {data.overview.top_habits.length === 0 ? (
              <Text style={styles.muted}>Belum ada data.</Text>
            ) : (
              data.overview.top_habits.map((h) => (
                <View key={h.habit_id} style={styles.topRow}>
                  <HabitIcon name={h.icon} size={20} />
                  <View style={styles.topBody}>
                    <View style={styles.topLine}>
                      <Text style={styles.topName} numberOfLines={1}>
                        {h.name}
                      </Text>
                      <Text style={styles.topRate}>{h.rate}%</Text>
                    </View>
                    <ProgressBar percent={h.rate} color={colors.success} />
                  </View>
                </View>
              ))
            )}
          </Card>

          <Card style={styles.listCard}>
            <Text style={styles.cardTitle}>Streak per kebiasaan</Text>
            {data.streaks.habits.length === 0 ? (
              <Text style={styles.muted}>Belum ada kebiasaan aktif.</Text>
            ) : (
              data.streaks.habits.map((s) => (
                <View key={s.habit_id} style={styles.streakRow}>
                  <HabitIcon name={s.icon} size={20} />
                  <Text style={styles.topName} numberOfLines={1}>
                    {s.name}
                  </Text>
                  <Ionicons name="flame" size={16} color={colors.warning} />
                  <Text style={styles.streakVal}>{s.current}</Text>
                  <Text style={styles.muted}>/ {s.best}</Text>
                </View>
              ))
            )}
            <Text style={styles.footnote}>Angka: streak saat ini / streak terbaik. Hari tanpa jadwal tidak memutus streak.</Text>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

function Tile({ icon, label, value, color = colors.secondary }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string; color?: string }) {
  return (
    <View style={styles.tile}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    width: '48.5%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 2,
  },
  tileValue: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 4 },
  tileLabel: { color: colors.textSecondary, fontSize: 12 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  segment: { flexDirection: 'row', backgroundColor: colors.inputBg, borderRadius: radius.pill, padding: 3 },
  segItem: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  segActive: { backgroundColor: colors.primary },
  segText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  segTextActive: { color: colors.text },
  chart: { marginLeft: -spacing.md, borderRadius: radius.md },
  caption: { color: colors.textSecondary, fontSize: 12, marginTop: spacing.xs },
  listCard: { gap: spacing.md },
  muted: { color: colors.textSecondary, fontSize: 13 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  topBody: { flex: 1, gap: 6 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  topName: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600' },
  topRate: { color: colors.success, fontSize: 14, fontWeight: '700' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  streakVal: { color: colors.text, fontSize: 14, fontWeight: '800' },
  footnote: { color: colors.textSecondary, fontSize: 11 },
});
