import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titleTop}>Welcome in our App</Text>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Plan your trips easily</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#CAF0F8', alignItems: 'center', paddingTop: 60 },
  titleTop: { fontSize: 18, color: '#1B4965', marginBottom: 20 , marginTop: 30},
  logo: { width: 350, height: 200, marginBottom: 20,},
  title: { fontFamily:'Poppins-Bold', fontSize: 26, fontWeight: 'bold', color: '#1B4965', marginBottom: 20 },
  button: { backgroundColor: '#1B4965', padding: 15, width: '60%', borderRadius: 20, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
