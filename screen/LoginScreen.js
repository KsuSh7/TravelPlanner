import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext'; // Імпортуємо контекст

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { saveToken } = useContext(AuthContext); // Отримуємо функцію з контексту

  const saveTokenToStorage = async (token) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      console.log('Token saved to AsyncStorage');
    } catch (e) {
      console.error('Failed to save token to AsyncStorage:', e);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.31.55:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      console.log('Response text:', text);

      try {
        const data = JSON.parse(text);
        if (response.ok && data.token) {
          saveToken(data.token);                // Зберігаємо у контексті
          await saveTokenToStorage(data.token); // Зберігаємо у AsyncStorage
          navigation.navigate('MainTabs', { screen: 'FutureTrips' });
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (e) {
        alert('Server returned invalid JSON');
        console.error('JSON parse error:', e);
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleTop}>Login to continue</Text>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Log In</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        placeholderTextColor="#94D2FF"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
        placeholderTextColor="#94D2FF"
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
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
