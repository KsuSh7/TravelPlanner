import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, Modal, TextInput, TouchableOpacity, StyleSheet, Button
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from './AuthContext';

const ProfileTripsScreen = () => {
  const { token } = useContext(AuthContext);

  const [trips, setTrips] = useState([]);
  const [cities, setCities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadTripsFromBackend();
    loadCitiesFromBackend();
  }, []);

  const loadTripsFromBackend = async () => {
    try {
      const response = await fetch('http://192.168.1.162:5001/api/trips', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTrips(data);
      } else {
        console.error('Не вдалося завантажити подорожі');
      }
    } catch (error) {
      console.error('Помилка при завантаженні подорожей:', error);
    }
  };

  const loadCitiesFromBackend = async () => {
    try {
      const response = await fetch('http://192.168.1.162:5001/api/cities', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCities(data); // збереження об'єктів міст
      } else {
        console.error('Не вдалося завантажити міста');
      }
    } catch (error) {
      console.error('Помилка при завантаженні міст:', error);
    }
  };

  const addTrip = async () => {
    if (!selectedCity || !startDate || !endDate) {
      alert('Вкажіть місто та дати');
      return;
    }

    const cityObj = cities.find(c => c.name === selectedCity);
    if (!cityObj) {
      alert('Місто не знайдено');
      return;
    }

    const body = {
      location: cityObj.name,
      start_date: startDate,
      end_date: endDate,
      latitude: cityObj.latitude,
      longitude: cityObj.longitude,
    };

    try {
      const response = await fetch('http://192.168.1.162:5001/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const newTrip = await response.json();
        setTrips(prev => [...prev, newTrip]);
        setModalVisible(false);
        setSelectedCity('');
        setStartDate('');
        setEndDate('');
      } else {
        const err = await response.json();
        console.log('Помилка додавання подорожі:', err);
      }
    } catch (error) {
      console.log('Помилка при fetch:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tripItem}>
            <Text style={styles.city}>{item.location}</Text>
            <Text style={styles.date}>{item.start_date} — {item.end_date}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Подорожей ще немає</Text>}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>Додати подорож</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Місто:</Text>
            <Picker
              selectedValue={selectedCity}
              onValueChange={(itemValue) => setSelectedCity(itemValue)}
              style={styles.input}
            >
              <Picker.Item label="Оберіть місто..." value="" />
              {cities.map((city, index) => (
                <Picker.Item key={index} label={city.name} value={city.name} />
              ))}
            </Picker>

            <Text>Дата початку (YYYY-MM-DD):</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-06-01"
              value={startDate}
              onChangeText={setStartDate}
            />

            <Text>Дата завершення (YYYY-MM-DD):</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-06-10"
              value={endDate}
              onChangeText={setEndDate}
            />

            <Button title="Додати" onPress={addTrip} />
            <Button title="Скасувати" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileTripsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#CAF0F8', padding: 20 },
  tripItem: { padding: 10, marginBottom: 10, backgroundColor: '#fff', borderRadius: 10 },
  city: { fontSize: 18, fontWeight: 'bold' },
  date: { fontSize: 14, color: '#333' },
  empty: { fontStyle: 'italic', color: '#999', textAlign: 'center', marginTop: 20 },
  addButton: { backgroundColor: '#1B4965', padding: 12, borderRadius: 10, marginTop: 20 },
  addButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
  modalContent: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 10 },
  input: { backgroundColor: '#E0F7FF', padding: 10, borderRadius: 10, marginBottom: 10 },
});
