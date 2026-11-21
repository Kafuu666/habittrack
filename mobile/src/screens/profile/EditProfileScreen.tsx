import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import { getErrorMessage } from '../../services/api';
import { authService } from '../../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  const trimmed = name.trim();
  const unchanged = trimmed === (user?.name ?? '');

  // Foto langsung diunggah begitu dipilih; nama disimpan lewat tombol Simpan
  const pickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true, // pangkas ke persegi
        aspect: [1, 1],
        quality: 0.5, // menjaga ukuran file kecil
      });
      if (result.canceled || !result.assets[0]) return;

      setPhotoBusy(true);
      updateUser(await authService.uploadPhoto(result.assets[0]));
    } catch (e) {
      Alert.alert('Gagal mengubah foto', getErrorMessage(e));
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = () => {
    Alert.alert('Hapus foto profil?', 'Foto akan diganti dengan huruf pertama namamu.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setPhotoBusy(true);
          try {
            updateUser(await authService.removePhoto());
          } catch (e) {
            Alert.alert('Gagal menghapus foto', getErrorMessage(e));
          } finally {
            setPhotoBusy(false);
          }
        },
      },
    ]);
  };

  const saveName = async () => {
    if (trimmed.length < 2) {
      setNameError('Nama minimal 2 karakter');
      return;
    }
    setSaving(true);
    try {
      updateUser(await authService.updateProfile({ name: trimmed }));
      navigation.goBack();
    } catch (e) {
      Alert.alert('Gagal menyimpan', getErrorMessage(e));
      setSaving(false);
    }
  };

  return (
    <Screen edges={['bottom']}>
      <View style={styles.photoBlock}>
        <View>
          <Avatar name={user?.name} photoUrl={user?.photo_url} size={112} />
          {photoBusy ? (
            <View style={styles.busy}>
              <ActivityIndicator color={colors.text} />
            </View>
          ) : null}
        </View>
        <Button
          title={user?.photo_url ? 'Ganti foto' : 'Pilih foto'}
          icon="image-outline"
          variant="outline"
          onPress={pickPhoto}
          disabled={photoBusy}
        />
        {user?.photo_url ? (
          <Button title="Hapus foto" icon="trash-outline" variant="danger" onPress={removePhoto} disabled={photoBusy} />
        ) : null}
        <Text style={styles.hint}>Foto dipangkas menjadi persegi. Format JPG, PNG, atau WebP, maksimal 5 MB.</Text>
      </View>

      <TextField
        label="Nama"
        value={name}
        onChangeText={(t) => {
          setName(t);
          setNameError(null);
        }}
        placeholder="Nama lengkap"
        autoCapitalize="words"
        maxLength={100}
        error={nameError}
        onSubmitEditing={saveName}
      />

      <TextField label="Email (tidak dapat diubah)" value={user?.email ?? ''} editable={false} style={styles.readonly} />

      <Button title="Simpan" icon="checkmark" onPress={saveName} loading={saving} disabled={unchanged || photoBusy} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  photoBlock: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  busy: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 56,
    backgroundColor: 'rgba(11, 16, 32, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { color: colors.textSecondary, fontSize: 12, textAlign: 'center' },
  readonly: { color: colors.textSecondary },
});
