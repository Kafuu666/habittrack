import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../../constants/theme';

// Ditampilkan selama aplikasi memeriksa sesi login yang tersimpan
export default function SplashScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.logo}>
        <Ionicons name="checkmark-done" size={48} color={colors.text} />
      </View>
      <Text style={styles.title}>HabitTrack</Text>
      <Text style={styles.tagline}>Bangun kebiasaan, jaga konsistensi</Text>
      <ActivityIndicator color={colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  logo: {
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  tagline: { color: colors.textSecondary, fontSize: 14 },
  loader: { marginTop: spacing.lg },
});
