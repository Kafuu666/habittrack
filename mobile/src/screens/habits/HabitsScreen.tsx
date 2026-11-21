import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { HabitIcon } from '../../components/HabitIcon';
import { Screen } from '../../components/Screen';
import { EmptyView, ErrorView, LoadingView } from '../../components/StateViews';
import { colors, radius, spacing } from '../../constants/theme';
import { useFocusLoad } from '../../hooks/useFocusLoad';
import { RootStackParamList } from '../../navigation/types';
import { getErrorMessage } from '../../services/api';
import { habitService } from '../../services/habitService';
import { resyncReminders } from '../../services/notificationService';
import { Habit } from '../../types';
import { scheduleLabel } from '../../utils/date';

export default function HabitsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, loading, error, refreshing, reload, refresh } = useFocusLoad(() => habitService.list());

  const confirmDelete = (habit: Habit) => {
    Alert.alert('Hapus kebiasaan?', `"${habit.name}" beserta seluruh riwayatnya akan dihapus permanen.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await habitService.remove(habit.id);
            await reload();
            void resyncReminders();
          } catch (e) {
            Alert.alert('Gagal menghapus', getErrorMessage(e));
          }
        },
      },
    ]);
  };

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View style={styles.header}>
        <Text style={styles.title}>Kebiasaanku</Text>
        <Button title="Tambah" icon="add" onPress={() => navigation.navigate('AddHabit')} style={styles.addBtn} />
      </View>

      {loading ? (
        <LoadingView />
      ) : error && !data ? (
        <ErrorView message={error} onRetry={reload} />
      ) : data && data.length === 0 ? (
        <EmptyView
          icon="leaf-outline"
          title="Belum ada kebiasaan"
          subtitle="Mulai dengan satu kebiasaan kecil, misalnya membaca 10 menit."
          actionTitle="Tambah kebiasaan"
          onAction={() => navigation.navigate('AddHabit')}
        />
      ) : (
        data?.map((habit) => (
          <Card key={habit.id} style={[styles.card, !habit.is_active && styles.cardInactive]}>
            <Pressable
              style={styles.main}
              onPress={() => navigation.navigate('EditHabit', { habit })}
              accessibilityRole="button"
              accessibilityLabel={`Ubah ${habit.name}`}
            >
              <View style={styles.iconBubble}>
                <HabitIcon name={habit.icon} />
              </View>
              <View style={styles.texts}>
                <Text style={styles.name} numberOfLines={1}>
                  {habit.name}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {[habit.category?.name, scheduleLabel(habit.schedule_days)].filter(Boolean).join(' • ')}
                </Text>
                <View style={styles.badges}>
                  {habit.reminder_time ? (
                    <View style={styles.badge}>
                      <Ionicons name="alarm-outline" size={12} color={colors.secondary} />
                      <Text style={styles.badgeText}>{habit.reminder_time}</Text>
                    </View>
                  ) : null}
                  {!habit.is_active ? (
                    <View style={[styles.badge, styles.badgeOff]}>
                      <Text style={styles.badgeText}>Nonaktif</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
            <Pressable
              onPress={() => confirmDelete(habit)}
              hitSlop={10}
              style={styles.delete}
              accessibilityRole="button"
              accessibilityLabel={`Hapus ${habit.name}`}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  addBtn: { minHeight: 40, paddingHorizontal: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardInactive: { opacity: 0.6 },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.textSecondary, fontSize: 12 },
  badges: { flexDirection: 'row', gap: spacing.xs, marginTop: 4 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.inputBg,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeOff: { backgroundColor: colors.border },
  badgeText: { color: colors.secondary, fontSize: 11, fontWeight: '600' },
  delete: { padding: spacing.xs },
});
