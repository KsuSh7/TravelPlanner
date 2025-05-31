import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, Modal, TextInput, TouchableOpacity, StyleSheet, Button
} from 'react-native';
import { AuthContext } from './AuthContext';

const ProfileTripsScreen = () => {
    const { token } = useContext(AuthContext);

    const [trips, setTrips] = useState([]);
    const [cities, setCities] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    const loadTripsFromBackend = async () => {
        try {
            const response = await fetch('http://192.168.31.55:5001/api/trips', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
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
            const response = await fetch('http://192.168.31.55:5001/api/cities', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
            });

            if (response.ok) {
            const data = await response.json();
            setCities(data.map(c => c.name));
            } else {
            console.error('Не вдалося завантажити міста');
            }
        } catch (error) {
            console.error('Помилка при завантаженні міст:', error);
        }
        };

        useEffect(() => {
        loadTripsFromBackend();
        loadCitiesFromBackend();
        }, 
    []);

    const addTrip = async () => {
        console.log('Запит на додавання подорожі починається');
        if (!selectedCity || !startDate || !endDate) {
            alert('Вкажіть місто та дати');
            return;
        }

        const body = {
            location: selectedCity.name,
            start_date: startDate.toISOString().slice(0, 10), // або якщо це строка, переконайся, що формат правильний
            end_date: endDate.toISOString().slice(0, 10),
            latitude: selectedCity.latitude,
            longitude: selectedCity.longitude,
        };

        try {
            const response = await fetch('http://192.168.31.55:5001/api/trips', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
            });
            console.log('Отримали відповідь:', response.status);

            if (response.ok) {
            const newTrip = await response.json();
            // Оновити стейт подорожей
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
            <Text style={styles.city}>{item.city}</Text>
            <Text style={styles.date}>{item.date}</Text>
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
            <TextInput
              style={styles.input}
              placeholder="Введіть місто"
              value={selectedCity}
              onChangeText={setSelectedCity}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {cities.length > 0 && !cities.includes(selectedCity) && selectedCity !== '' && (
              <Text style={{ color: 'red', marginBottom: 5 }}>Місто не знайдено в базі</Text>
            )}
            <Text>Дата:</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={selectedDate}
              onChangeText={setSelectedDate}
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
  header: { fontSize: 24, fontWeight: 'bold', color: '#1B4965', marginBottom: 10 },
  tripItem: { fontSize: 16, paddingVertical: 5, color: '#1B4965' },
  empty: { fontStyle: 'italic', color: '#999', textAlign: 'center', marginTop: 20 },
  addButton: { backgroundColor: '#1B4965', padding: 10, borderRadius: 10, marginBottom: 10 },
  addButtonText: { color: '#fff', textAlign: 'center' },
  logoutButton: { marginTop: 20, alignSelf: 'center' },
  logoutText: { color: 'red', fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
  modalContent: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 10 },
  input: { backgroundColor: '#E0F7FF', padding: 10, borderRadius: 10, marginBottom: 10 },
});
