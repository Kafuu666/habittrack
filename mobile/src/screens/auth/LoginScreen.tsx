import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { colors, radius, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { getErrorMessage } from '../../services/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = 'Masukkan email yang valid';
    if (!password) next.password = 'Password wajib diisi';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e) {
      Alert.alert('Login gagal', getErrorMessage(e));
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.content}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.form}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="checkmark-done" size={36} color={colors.text} />
          </View>
          <Text style={styles.title}>Selamat datang kembali</Text>
          <Text style={styles.subtitle}>Masuk untuk melanjutkan kebiasaan harianmu</Text>
        </View>

        <TextField
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setErrors((e) => ({ ...e, email: undefined }));
          }}
          placeholder="nama@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setErrors((e) => ({ ...e, password: undefined }));
          }}
          placeholder="Password"
          secure
          autoComplete="password"
          error={errors.password}
          onSubmitEditing={submit}
        />

        <Button title="Masuk" onPress={submit} loading={loading} />

        <Pressable onPress={() => navigation.navigate('Register')} style={styles.link} accessibilityRole="link">
          <Text style={styles.linkText}>
            Belum punya akun? <Text style={styles.linkAccent}>Daftar</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center' },
  form: { gap: spacing.md },
  header: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  link: { alignItems: 'center', paddingVertical: spacing.sm },
  linkText: { color: colors.textSecondary, fontSize: 14 },
  linkAccent: { color: colors.secondary, fontWeight: '700' },
});
