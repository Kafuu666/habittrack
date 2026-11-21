import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
  secure?: boolean;
}

export function TextField({ label, error, secure = false, style, ...rest }: Props) {
  const [hidden, setHidden] = useState(secure);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, !!error && styles.inputError]}>
        <TextInput
          {...rest}
          style={[styles.input, style]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={hidden}
          autoCapitalize={secure ? 'none' : rest.autoCapitalize}
          selectionColor={colors.primary}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel="Tampilkan atau sembunyikan password">
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  inputError: { borderColor: colors.danger },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 13 },
  error: { color: colors.danger, fontSize: 12 },
});
