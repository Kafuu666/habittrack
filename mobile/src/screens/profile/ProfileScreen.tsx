import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, signOut } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Keluar dari akun?', 'Kamu perlu login lagi untuk membuka datamu.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => void signOut() },
    ]);
  };

  return (
    <Screen>
      <Text style={styles.title}>Profil</Text>

      <Pressable onPress={() => navigation.navigate('EditProfile')} accessibilityRole="button" accessibilityLabel="Ubah profil">
        <Card style={styles.profile}>
          <Avatar name={user?.name} photoUrl={user?.photo_url} size={60} />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {user?.name}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
          <Ionicons name="create-outline" size={22} color={colors.secondary} />
        </Card>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Settings')} accessibilityRole="button">
        <Card style={styles.menu}>
          <Ionicons name="settings-outline" size={22} color={colors.secondary} />
          <Text style={styles.menuText}>Pengaturan & notifikasi</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Card>
      </Pressable>

      <Button title="Keluar" variant="danger" icon="log-out-outline" onPress={confirmLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  info: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 18, fontWeight: '700' },
  email: { color: colors.textSecondary, fontSize: 14 },
  menu: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuText: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
});
