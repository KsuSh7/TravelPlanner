import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titleTop}>Login to continue</Text>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Log In</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        placeholderTextColor="#94D2FF" 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
        placeholderTextColor="#94D2FF" 
      />

      {/* Виправлення тут — закриваємо дужку правильно */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('MainTabs', { screen: 'FutureTrips' })}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.footerText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#CAF0F8', alignItems: 'center', paddingTop: 60 },
  titleTop: { fontSize: 18, color: '#1B4965', marginBottom: 10 },
  logo: { width: 250, height: 200, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1B4965', marginBottom: 20 },
  input: { width: '80%', backgroundColor: '#E0F7FF', padding: 10, marginVertical: 10, borderRadius: 10 },
  button: { backgroundColor: '#1B4965', padding: 15, width: '60%', borderRadius: 20, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  footerText: { marginTop: 20, color: '#1B4965' }
});
