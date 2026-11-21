import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../constants/theme';
import { Button } from './Button';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function LoadingView({ label = 'Memuat...' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.sub}>{label}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={48} color={colors.danger} />
      <Text style={styles.title}>Gagal memuat data</Text>
      <Text style={styles.sub}>{message}</Text>
      {onRetry ? <Button title="Coba lagi" onPress={onRetry} variant="outline" /> : null}
    </View>
  );
}

interface EmptyProps {
  icon?: IconName;
  title: string;
  subtitle?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyView({ icon = 'leaf-outline', title, subtitle, actionTitle, onAction }: EmptyProps) {
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={48} color={colors.secondary} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      {actionTitle && onAction ? <Button title={actionTitle} onPress={onAction} icon="add" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm, minHeight: 220 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  sub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: spacing.sm },
});
