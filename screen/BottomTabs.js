// BottomTabs.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import FutureTrips from './FutureTrips';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import MapScreen from './MapScreen';  

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'FutureTrips') {
            iconName = 'airplane-outline';
          } else if (route.name === 'Login') {
            iconName = 'log-in-outline';
          } else if (route.name === 'Map') {
            iconName = 'map-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2f95dc',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="FutureTrips" component={FutureTrips} />
      <Tab.Screen name="Login" component={LoginScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
    </Tab.Navigator>
  );
}
