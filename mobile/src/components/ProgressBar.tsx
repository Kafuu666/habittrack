import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../constants/theme';

export function ProgressBar({ percent, color = colors.primary }: { percent: number; color?: string }) {
  const value = Math.min(100, Math.max(0, percent));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
