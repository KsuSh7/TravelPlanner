import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './screen/WelcomeScreen';
import SignUpScreen from './screen/SignUpScreen';
import LoginScreen from './screen/LoginScreen';
import MapScreen from './screen/MapScreen';
import BottomTabs from './screen/BottomTabs';
import ProfileTripsScreen from './screen/ProfileTripsScreen';
import SpentScreen from './screen/SpentScreen';
import { TripsProvider } from './screen/TripsContext';
import { AuthProvider } from './screen/AuthContext';  // імпортуємо AuthProvider
import TripDetailsScreen from './screen/TripDetailsScreen';



const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>        {/* Додаємо AuthProvider зверху */}
      <TripsProvider>     {/* Потім TripsProvider */}
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="Spent" component={SpentScreen} />
            <Stack.Screen name="MainTabs" component={BottomTabs} />
            <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </TripsProvider>
    </AuthProvider>
  );
}
