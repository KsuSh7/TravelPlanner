import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions, Alert } from 'react-native';
import { registerUser, loginUser } from '../utils/api'; // тут твій файл з API-функціями

const screenWidth = Dimensions.get('window').width;

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const handleSignUp = async () => {
    if (password !== repeatPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const registerResponse = await registerUser(name, email, password);
      if (registerResponse.success) {
        // Автоматичний логін після успішної реєстрації
        const loginResponse = await loginUser(email, password);
        if (loginResponse.success) {
          // Збережи токен або інші дані, якщо потрібно (AsyncStorage тощо)
          // Перейти на головний екран або інший
          navigation.navigate('Home'); // заміни 'Home' на назву твого екрану після логіну
        } else {
          Alert.alert('Login failed', loginResponse.message || 'Unable to login');
        }
      } else {
        Alert.alert('Registration failed', registerResponse.message || 'Unable to register');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to</Text>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <View style={styles.signupcontainer}>
        <View style={styles.rowcontainer}>
          <Text style={styles.title}>Sign Up</Text>
          <Image source={require('../assets/littleplane.png')} style={styles.littleplane} />
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#94D2FF"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94D2FF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          placeholderTextColor="#94D2FF"
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Repeat Password"
          secureTextEntry
          placeholderTextColor="#94D2FF"
          value={repeatPassword}
          onChangeText={setRepeatPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={{ fontWeight: 'bold' }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Твої стилі залишаються без змін
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#CAF0F8', alignItems: 'center', paddingTop: 60 },
  signupcontainer: { flex: 1, backgroundColor: '#0077B6', alignItems: 'center', paddingTop: 60, borderRadius: 40, width: screenWidth },
  welcome: { fontSize: 20, fontFamily: 'Poppins-Bold', color: '#0077B6', marginBottom: 20, marginTop: 5 },
  logo: { width: 250, height: 200, marginBottom: 10 },
  rowcontainer: { flexDirection: 'row' },
  title: { fontFamily: 'Poppins-Bold', fontSize: 30, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, alignSelf: 'flex-start', marginRight: 70 },
  littleplane: { width: 80, height: 80, paddingBottom: 30, alignSelf: 'flex-end', marginLeft: 50 },
  input: { width: '80%', backgroundColor: '#E0F7FF', padding: 10, marginVertical: 10, borderRadius: 10 },
  button: { padding: 10, width: '40%', borderRadius: 20, marginTop: 20, borderColor: '#FFFFFF', borderWidth: 2 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  footerText: { marginTop: 20, color: '#FFFFFF' }
});
