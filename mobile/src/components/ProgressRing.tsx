import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../constants/theme';

interface Props {
  percent: number;
  size?: number;
  stroke?: number;
}

export function ProgressRing({ percent, size = 112, stroke = 11 }: Props) {
  const value = Math.min(100, Math.max(0, percent));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={value >= 100 ? colors.success : colors.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${(circumference * value) / 100} ${circumference}`}
        />
      </Svg>
      <Text style={styles.value}>{Math.round(value)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  svg: { position: 'absolute', transform: [{ rotate: '-90deg' }] },
  value: { color: colors.text, fontSize: 24, fontWeight: '800' },
});
