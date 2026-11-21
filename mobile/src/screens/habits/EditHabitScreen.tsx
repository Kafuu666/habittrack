import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert } from 'react-native';

import { Button } from '../../components/Button';
import { HabitForm } from '../../components/HabitForm';
import { Screen } from '../../components/Screen';
import { RootStackParamList } from '../../navigation/types';
import { getErrorMessage } from '../../services/api';
import { habitService } from '../../services/habitService';
import { resyncReminders } from '../../services/notificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'EditHabit'>;

export default function EditHabitScreen({ navigation, route }: Props) {
  const { habit } = route.params;

  const confirmDelete = () => {
    Alert.alert('Hapus kebiasaan?', `"${habit.name}" beserta seluruh riwayatnya akan dihapus permanen.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await habitService.remove(habit.id);
            void resyncReminders();
            navigation.goBack();
          } catch (e) {
            Alert.alert('Gagal menghapus', getErrorMessage(e));
          }
        },
      },
    ]);
  };

  return (
    <Screen edges={['bottom']}>
      <HabitForm
        initial={habit}
        showActive
        submitLabel="Simpan perubahan"
        onSubmit={async (payload) => {
          await habitService.update(habit.id, payload);
          void resyncReminders();
          navigation.goBack();
        }}
      />
      <Button title="Hapus kebiasaan" variant="danger" icon="trash-outline" onPress={confirmDelete} />
    </Screen>
  );
}
