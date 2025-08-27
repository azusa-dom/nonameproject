import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/student/HomeScreen';
import CalendarScreen from '../screens/student/CalendarScreen';
import InboxScreen from '../screens/student/InboxScreen';
import SettingsScreen from '../screens/student/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="主页" component={HomeScreen} />
      <Tab.Screen name="日历" component={CalendarScreen} />
      <Tab.Screen name="收件箱" component={InboxScreen} />
      <Tab.Screen name="设置" component={SettingsScreen} />
    </Tab.Navigator>
  );
}


