import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HabitForm } from '../../components/HabitForm';
import { Screen } from '../../components/Screen';
import { RootStackParamList } from '../../navigation/types';
import { habitService } from '../../services/habitService';
import { resyncReminders } from '../../services/notificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddHabit'>;

export default function AddHabitScreen({ navigation }: Props) {
  return (
    <Screen edges={['bottom']}>
      <HabitForm
        submitLabel="Simpan kebiasaan"
        onSubmit={async (payload) => {
          await habitService.create(payload);
          void resyncReminders(); // perubahan kebiasaan memperbarui jadwal notifikasi
          navigation.goBack();
        }}
      />
    </Screen>
  );
}
