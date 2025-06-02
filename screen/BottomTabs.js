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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FutureTrips" component={FutureTrips} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen}  />
    </Stack.Navigator>
  );
}
export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true, 
        headerStyle: {
      backgroundColor: '#1B4965', },
      headerTintColor: '#FFFFFF',
        tabBarStyle: {
      backgroundColor: '#1B4965',  
    },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Подорожі') {
            iconName = 'airplane-outline';
          } else if (route.name === 'Карта') {
            iconName = 'map-outline';
          }else if (route.name=='Калькулятор витрат'){
            iconName='cash-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#CAF0F8',
      })}
    >
       <Tab.Screen  name="Подорожі" component={FutureTripsStack} />
     
      
      <Tab.Screen name="Карта" component={MapScreen} />
      <Tab.Screen name="Калькулятор витрат" component={SpentScreen} />

    </Tab.Navigator>
  );
}
