import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { assetUrl } from '../constants/config';
import { colors } from '../constants/theme';

interface Props {
  name?: string | null;
  photoUrl?: string | null;
  size?: number;
}

// Foto profil bulat; bila belum ada foto (atau gagal dimuat) tampil huruf pertama nama
export function Avatar({ name, photoUrl, size = 60 }: Props) {
  const uri = assetUrl(photoUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const box = { width: size, height: size, borderRadius: size / 2 };

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, box]}
        onError={() => setFailed(true)}
        accessibilityLabel="Foto profil"
      />
    );
  }

  const initial = (name ?? '').trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={[styles.fallback, box]}>
      <Text style={[styles.initial, { fontSize: size * 0.43 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.border },
  fallback: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.text, fontWeight: '800' },
});
