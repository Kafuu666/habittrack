import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { colors, spacing } from '../../constants/theme';
import { API_URL } from '../../constants/config';
import {
  cancelAllReminders,
  ensureNotificationPermission,
  isRemindersEnabled,
  resyncReminders,
  setRemindersEnabled,
} from '../../services/notificationService';

export default function SettingsScreen() {
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    isRemindersEnabled()
      .then(setEnabled)
      .finally(() => setReady(true));
  }, []);

  const toggle = async (value: boolean) => {
    if (value && !(await ensureNotificationPermission())) {
      Alert.alert(
        'Izin notifikasi ditolak',
        'Aktifkan izin notifikasi untuk HabitTrack di pengaturan Android agar pengingat dapat muncul.'
      );
      return;
    }
    setEnabled(value);
    await setRemindersEnabled(value);
    if (value) await resyncReminders();
    else await cancelAllReminders();
  };

  return (
    <Screen edges={['bottom']}>
      <Card style={styles.row}>
        <View style={styles.texts}>
          <Text style={styles.label}>Pengingat kebiasaan</Text>
          <Text style={styles.hint}>
            Notifikasi dijadwalkan di perangkat sesuai waktu pengingat tiap kebiasaan.
          </Text>
        </View>
        <Switch
          value={enabled}
          disabled={!ready}
          onValueChange={toggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.text}
        />
      </Card>

      <Card style={styles.about}>
        <Text style={styles.label}>Tentang</Text>
        <Text style={styles.hint}>HabitTrack v1.0.0</Text>
        <Text style={styles.hint}>Server: {API_URL}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  texts: { flex: 1, gap: 4 },
  label: { color: colors.text, fontSize: 15, fontWeight: '700' },
  hint: { color: colors.textSecondary, fontSize: 12 },
  about: { gap: 4 },
});
