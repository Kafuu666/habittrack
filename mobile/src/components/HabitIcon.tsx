import { Ionicons } from '@expo/vector-icons';

import { colors } from '../constants/theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Pilihan ikon yang ditawarkan pada form kebiasaan (nama ikon disimpan di kolom habits.icon)
export const HABIT_ICONS: IconName[] = [
  'book-outline',
  'barbell-outline',
  'water-outline',
  'sunny-outline',
  'code-slash-outline',
  'moon-outline',
  'bicycle-outline',
  'restaurant-outline',
  'musical-notes-outline',
  'heart-outline',
  'cafe-outline',
  'walk-outline',
  'create-outline',
  'bed-outline',
  'leaf-outline',
  'wallet-outline',
];

export function HabitIcon({ name, size = 22, color = colors.secondary }: { name: string | null; size?: number; color?: string }) {
  const valid = name && name in Ionicons.glyphMap ? (name as IconName) : 'checkmark-circle-outline';
  return <Ionicons name={valid} size={size} color={color} />;
}
