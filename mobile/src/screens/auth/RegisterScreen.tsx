import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirm', string>>;

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const clear = (key: keyof Errors) => setErrors((e) => ({ ...e, [key]: undefined }));

  const submit = async () => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Nama minimal 2 karakter';
    if (!EMAIL_RE.test(email.trim())) next.email = 'Masukkan email yang valid';
    if (password.length < 6) next.password = 'Password minimal 6 karakter';
    if (confirm !== password) next.confirm = 'Konfirmasi password tidak sama';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await signUp(name, email, password);
    } catch (e) {
      Alert.alert('Registrasi gagal', getErrorMessage(e));
      setLoading(false);
    }
  };

  return (
    <Screen edges={['bottom']}>
      <Text style={styles.subtitle}>Buat akun untuk mulai melacak kebiasaan positifmu.</Text>
      <TextField
        label="Nama"
        value={name}
        onChangeText={(t) => {
          setName(t);
          clear('name');
        }}
        placeholder="Nama lengkap"
        autoCapitalize="words"
        error={errors.name}
        maxLength={100}
      />
      <TextField
        label="Email"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          clear('email');
        }}
        placeholder="nama@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          clear('password');
        }}
        placeholder="Minimal 6 karakter"
        secure
        error={errors.password}
      />
      <TextField
        label="Konfirmasi password"
        value={confirm}
        onChangeText={(t) => {
          setConfirm(t);
          clear('confirm');
        }}
        placeholder="Ulangi password"
        secure
        error={errors.confirm}
        onSubmitEditing={submit}
      />
      <Button title="Daftar" onPress={submit} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textSecondary, fontSize: 14 },
});
