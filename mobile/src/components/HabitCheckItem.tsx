import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';
import { DayHabit } from '../types';
import { HabitIcon } from './HabitIcon';

interface Props {
  item: DayHabit;
  busy?: boolean;
  onToggle: (item: DayHabit) => void;
}

// Baris checklist harian di dashboard
export function HabitCheckItem({ item, busy = false, onToggle }: Props) {
  const meta = [item.category?.name, item.reminder_time ? `Pengingat ${item.reminder_time}` : null]
    .filter(Boolean)
    .join(' • ');

  return (
    <Pressable
      onPress={() => onToggle(item)}
      disabled={busy}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.completed }}
      accessibilityLabel={item.name}
      style={({ pressed }) => [styles.row, item.completed && styles.rowDone, pressed && styles.pressed]}
    >
      <View style={styles.iconBubble}>
        <HabitIcon name={item.icon} color={item.completed ? colors.success : colors.secondary} />
      </View>
      <View style={styles.texts}>
        <Text style={[styles.name, item.completed && styles.nameDone]} numberOfLines={1}>
          {item.name}
        </Text>
        {meta ? (
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      {busy ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <View style={[styles.check, item.completed && styles.checkDone]}>
          {item.completed ? <Ionicons name="checkmark" size={18} color={colors.text} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  rowDone: { borderColor: 'rgba(34, 197, 94, 0.45)' },
  pressed: { opacity: 0.85 },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  nameDone: { color: colors.textSecondary, textDecorationLine: 'line-through' },
  meta: { color: colors.textSecondary, fontSize: 12 },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.success, borderColor: colors.success },
});
