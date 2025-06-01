import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import FutureTrips from './FutureTrips';
import SpentScreen from './SpentScreen';
import TripDetailsScreen from './TripDetailsScreen';
import MapScreen from './MapScreen';  

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); 
function FutureTripsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FutureTrips" component={FutureTrips} options={{ title: 'Майбутні подорожі' }} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} options={{ title: 'Деталі подорожі' }} />
    </Stack.Navigator>
  );
}
export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Trips') {
            iconName = 'airplane-outline';
          } else if (route.name === 'Map') {
            iconName = 'map-outline';
          }else if (route.name=='Spent'){
            iconName='cash-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2f95dc',
        tabBarInactiveTintColor: 'gray',
      })}
    >
       <Tab.Screen name="Trips" component={FutureTripsStack} />
     
      
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Spent" component={SpentScreen} />

    </Tab.Navigator>
  );
}
