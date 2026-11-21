import { Habit } from '../types';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  AddHabit: undefined;
  EditHabit: { habit: Habit };
  Settings: undefined;
  EditProfile: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Habits: undefined;
  Calendar: undefined;
  Statistics: undefined;
  Profile: undefined;
};
