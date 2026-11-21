import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '../constants/theme';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import HabitsScreen from '../screens/habits/HabitsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import StatisticsScreen from '../screens/statistics/StatisticsScreen';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<keyof MainTabParamList, [IconName, IconName]> = {
  Dashboard: ['home', 'home-outline'],
  Habits: ['list', 'list-outline'],
  Calendar: ['calendar', 'calendar-outline'],
  Statistics: ['stats-chart', 'stats-chart-outline'],
  Profile: ['person', 'person-outline'],
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Beranda' }} />
      <Tab.Screen name="Habits" component={HabitsScreen} options={{ title: 'Kebiasaan' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Kalender' }} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} options={{ title: 'Statistik' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}
