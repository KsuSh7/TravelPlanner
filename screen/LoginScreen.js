import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { saveToken } = useContext(AuthContext);

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
      const response = await fetch('http://192.168.1.162:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      console.log('Response text:', text);

      try {
        const data = JSON.parse(text);
        if (response.ok && data.token) {
          saveToken(data.token);
          await saveTokenToStorage(data.token);
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
      <Text style={styles.titleTop}>Ввійдіть, щоб продовжити</Text>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Вхід</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Електронна адреса" 
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        placeholderTextColor="#94D2FF"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Пароль" 
        secureTextEntry 
        placeholderTextColor="#94D2FF"
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Вхід</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.footerText}>
          Немає акаунту? <Text style={styles.linkText}>Зареєструйтесь</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#CAF0F8', alignItems: 'center', paddingTop: 60 },
  titleTop: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#1B4965', marginBottom: 10 },
  logo: { width: 250, height: 200, marginBottom: 20 },
  title: { fontFamily: 'Poppins-Bold', fontSize: 26, color: '#1B4965', marginBottom: 20 },
  input: { width: '80%', backgroundColor: '#E0F7FF', padding: 10, marginVertical: 10, borderRadius: 10 },
  button: { backgroundColor: '#1B4965', padding: 15, width: '60%', borderRadius: 20, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontFamily: 'Poppins-Bold' },
  footerText: { marginTop: 20, color: '#1B4965', fontFamily: 'Poppins-Regular' },
  linkText: { color: '#0077B6', fontWeight: 'bold' }
});
