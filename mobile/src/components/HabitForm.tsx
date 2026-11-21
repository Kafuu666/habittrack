import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';
import { getErrorMessage } from '../services/api';
import { categoryService } from '../services/categoryService';
import { Category, Frequency, Habit, HabitPayload } from '../types';
import { DAY_LABELS, dateToTime, timeToDate } from '../utils/date';
import { Button } from './Button';
import { HABIT_ICONS, HabitIcon } from './HabitIcon';
import { TextField } from './TextField';

interface Props {
  initial?: Habit;
  submitLabel: string;
  showActive?: boolean;
  onSubmit: (payload: HabitPayload) => Promise<void>;
}

const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];

// Form bersama untuk Add Habit dan Edit Habit
export function HabitForm({ initial, submitLabel, showActive = false, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState<number | null>(initial?.category_id ?? null);
  const [icon, setIcon] = useState<string>(initial?.icon ?? HABIT_ICONS[0]);
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? 'DAILY');
  const [days, setDays] = useState<number[]>(
    initial?.frequency === 'WEEKLY' ? initial.schedule_days : [1, 3, 5]
  );
  const [targetCount, setTargetCount] = useState(initial?.target_count ?? 1);
  const [reminderOn, setReminderOn] = useState(Boolean(initial?.reminder_time));
  const [reminderTime, setReminderTime] = useState(initial?.reminder_time ?? '19:00');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [showPicker, setShowPicker] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);
  const [daysError, setDaysError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoryService
      .list()
      .then(setCategories)
      .catch(() => undefined); // kategori bersifat opsional
  }, []);

  const toggleDay = (day: number) => {
    setDaysError(null);
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  };

  const handleSubmit = async () => {
    let valid = true;
    if (!name.trim()) {
      setNameError('Nama kebiasaan wajib diisi');
      valid = false;
    }
    if (frequency === 'WEEKLY' && days.length === 0) {
      setDaysError('Pilih minimal satu hari aktif');
      valid = false;
    }
    if (!valid) return;

    const payload: HabitPayload = {
      name: name.trim(),
      description: description.trim() || null,
      category_id: categoryId,
      icon,
      frequency,
      target_count: targetCount,
      reminder_time: reminderOn ? reminderTime : null,
      ...(frequency === 'WEEKLY' ? { days_of_week: days } : {}),
      ...(showActive ? { is_active: isActive } : {}),
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (e) {
      Alert.alert('Gagal menyimpan', getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.form}>
      <TextField
        label="Nama kebiasaan"
        value={name}
        onChangeText={(t) => {
          setName(t);
          setNameError(null);
        }}
        placeholder="Contoh: Belajar coding"
        error={nameError}
        maxLength={150}
      />
      <TextField
        label="Deskripsi (opsional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Contoh: Belajar minimal satu sesi"
        multiline
        style={styles.multiline}
      />

      <Section title="Ikon">
        <View style={styles.wrap}>
          {HABIT_ICONS.map((name_) => (
            <Pressable
              key={name_}
              onPress={() => setIcon(name_)}
              accessibilityLabel={`Ikon ${name_}`}
              style={[styles.iconOption, icon === name_ && styles.iconSelected]}
            >
              <HabitIcon name={name_} color={icon === name_ ? colors.text : colors.secondary} />
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Kategori">
        <View style={styles.wrap}>
          <Chip label="Tanpa kategori" selected={categoryId === null} onPress={() => setCategoryId(null)} />
          {categories.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              color={c.color ?? undefined}
              selected={categoryId === c.id}
              onPress={() => setCategoryId(c.id)}
            />
          ))}
        </View>
      </Section>

      <Section title="Frekuensi">
        <View style={styles.segment}>
          {(['DAILY', 'WEEKLY'] as Frequency[]).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFrequency(f)}
              style={[styles.segmentItem, frequency === f && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, frequency === f && styles.segmentTextActive]}>
                {f === 'DAILY' ? 'Harian' : 'Mingguan'}
              </Text>
            </Pressable>
          ))}
        </View>
        {frequency === 'WEEKLY' ? (
          <>
            <View style={styles.wrap}>
              {ALL_DAYS.map((d) => (
                <Chip key={d} label={DAY_LABELS[d - 1]} selected={days.includes(d)} onPress={() => toggleDay(d)} />
              ))}
            </View>
            {daysError ? <Text style={styles.error}>{daysError}</Text> : null}
          </>
        ) : null}
      </Section>

      <Section title="Target aktivitas">
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setTargetCount((v) => Math.max(1, v - 1))}
            style={styles.stepBtn}
            accessibilityLabel="Kurangi target"
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.stepValue}>{targetCount}</Text>
          <Pressable
            onPress={() => setTargetCount((v) => Math.min(99, v + 1))}
            style={styles.stepBtn}
            accessibilityLabel="Tambah target"
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.hint}>kali per hari terjadwal</Text>
        </View>
      </Section>

      <Section title="Pengingat">
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Aktifkan pengingat</Text>
          <Switch
            value={reminderOn}
            onValueChange={setReminderOn}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
        {reminderOn ? (
          <>
            <Pressable onPress={() => setShowPicker(true)} style={styles.timeBtn} accessibilityLabel="Pilih waktu pengingat">
              <Ionicons name="time-outline" size={20} color={colors.secondary} />
              <Text style={styles.timeText}>{reminderTime}</Text>
            </Pressable>
            {showPicker ? (
              <DateTimePicker
                value={timeToDate(reminderTime)}
                mode="time"
                is24Hour
                display="default"
                onChange={(event, date) => {
                  setShowPicker(false);
                  if (event.type === 'set' && date) setReminderTime(dateToTime(date));
                }}
              />
            ) : null}
          </>
        ) : null}
      </Section>

      {showActive ? (
        <View style={styles.switchRow}>
          <View style={styles.flex}>
            <Text style={styles.switchLabel}>Kebiasaan aktif</Text>
            <Text style={styles.hint}>Nonaktifkan agar tidak muncul di checklist hari ini</Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      ) : null}

      <Button title={submitLabel} onPress={handleSubmit} loading={submitting} icon="checkmark" />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Chip({ label, selected, onPress, color }: { label: string; selected: boolean; onPress: () => void; color?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: color ?? colors.primary, borderColor: color ?? colors.primary }]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  flex: { flex: 1 },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  iconOption: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: colors.text },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { color: colors.textSecondary, fontWeight: '700' },
  segmentTextActive: { color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { color: colors.text, fontSize: 20, fontWeight: '800', minWidth: 28, textAlign: 'center' },
  hint: { color: colors.textSecondary, fontSize: 12 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  switchLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
  timeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  timeText: { color: colors.text, fontSize: 18, fontWeight: '700' },
  error: { color: colors.danger, fontSize: 12 },
});
