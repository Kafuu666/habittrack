import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import AddHabitScreen from '../screens/habits/AddHabitScreen';
import EditHabitScreen from '../screens/habits/EditHabitScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import MainTabs from './MainTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  // Splash Screen: pemeriksaan sesi tersimpan
  if (loading) return <SplashScreen />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="AddHabit" component={AddHabitScreen} options={{ title: 'Tambah Kebiasaan' }} />
          <Stack.Screen name="EditHabit" component={EditHabitScreen} options={{ title: 'Ubah Kebiasaan' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Pengaturan' }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Ubah Profil' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Buat Akun' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
