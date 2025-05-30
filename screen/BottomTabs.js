import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import FutureTrips from './FutureTrips';
import SpentScreen from './SpentScreen';
import ProfileTripsScreen from './ProfileTripsScreen';
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
          } else if (route.name === 'Map') {
            iconName = 'map-outline';
          } else if (route.name==='Profile'){
            iconName='person-outline';
          }else if (route.name=='Spent'){
            iconName='cash-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2f95dc',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="FutureTrips" component={FutureTrips} />
      <Tab.Screen name="ProfileTrips" component={ProfileTripsScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Spent" component={SpentScreen} />

    </Tab.Navigator>
  );
}
