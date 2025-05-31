import React, { useState, useEffect, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { TripsContext } from './TripsContext';
import { AuthContext } from './AuthContext';

export default function FutureTrips() {
  const [userName, setUserName] = useState('');
  const [trips, setTrips] = useContext(TripsContext);
  const { token } = useContext(AuthContext);
  const navigation = useNavigation();

  const [isModalVisible, setModalVisible] = useState(false);
  const [tripName, setTripName] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [tripEndDate, setTripEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [allCities, setAllCities] = useState([]);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isPickingStartDate, setIsPickingStartDate] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch('http://192.168.31.55:5001/api/cities', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setAllCities)
      .catch(err => console.error('Помилка при завантаженні міст:', err));

    fetch('http://192.168.31.55:5001/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setUserName(data.name))
      .catch(err => console.error('Помилка при завантаженні користувача:', err));

    fetch('http://192.168.31.55:5001/api/trips', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setTrips)
      .catch(err => console.error('Помилка завантаження подорожей:', err));
  }, [token]);

  const addTrip = () => {
    if (!token) {
      alert('Будь ласка, увійдіть в систему');
      return;
    }

    const newTripData = {
      city_id: selectedCityId,
      start_date: tripDate,
      end_date: tripEndDate,
      total_budget: parseFloat(budget),
      trip_name: tripName
    };

    fetch('http://192.168.31.55:5001/api/trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTripData),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Server error: ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then((createdTrip) => {
        setTrips([...trips, createdTrip]);
        setModalVisible(false);
        setTripName('');
        setTripDate('');
        setTripEndDate('');
        setBudget('');
        setSelectedCityId(null);
      })
      .catch((err) => {
        console.error(err);
        alert('Не вдалося зберегти подорож. Спробуйте пізніше.');
      });
  };

  const handleConfirmDate = (date) => {
    const formatted = date.toISOString().split('T')[0];
    if (isPickingStartDate) setTripDate(formatted);
    else setTripEndDate(formatted);
    setDatePickerVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Майбутні подорожі</Text>
      <Text style={styles.greeting}>Привіт, {userName}!</Text>

      <FlatList
        data={trips}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('TripDetails', { trip: item })}>
            <View style={styles.tripItem}>
              <Text style={styles.tripText}>
                {item.city_name} — {item.start_date} - {item.end_date}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Додати подорож</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Назва подорожі"
              value={tripName}
              onChangeText={setTripName}
            />
            <TextInput
              style={styles.input}
              placeholder="Бюджет (грн)"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />
            <Picker
              selectedValue={selectedCityId}
              onValueChange={(value) => setSelectedCityId(value)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Оберіть місто" value={null} />
              {allCities.map(city => (
                <Picker.Item key={city.id} label={city.name} value={city.id} />
              ))}
            </Picker>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                setIsPickingStartDate(true);
                setDatePickerVisible(true);
              }}
            >
              <Text style={styles.dateButtonText}>
                {tripDate ? `Дата початку: ${tripDate}` : 'Оберіть дату початку'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                setIsPickingStartDate(false);
                setDatePickerVisible(true);
              }}
            >
              <Text style={styles.dateButtonText}>
                {tripEndDate ? `Дата завершення: ${tripEndDate}` : 'Оберіть дату завершення'}
              </Text>
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirmDate}
              onCancel={() => setDatePickerVisible(false)}
            />

            <TouchableOpacity style={styles.saveButton} onPress={addTrip}>
              <Text style={styles.saveButtonText}>Зберегти подорож</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#CAF0F8', alignItems: 'center', paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B4965', marginBottom: 20 },
  greeting: { fontSize: 18, marginBottom: 10, color: '#1B4965' },
  addButton: { backgroundColor: '#1B4965', padding: 15, width: '60%', borderRadius: 20, marginBottom: 20 },
  addButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  tripItem: { padding: 15, marginBottom: 10, backgroundColor: '#E0F7FF', borderRadius: 10, width: '80%', alignItems: 'center' },
  tripText: { fontSize: 18, color: '#1B4965' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '85%', backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  input: { width: '100%', backgroundColor: '#E0F7FF', padding: 10, marginVertical: 10, borderRadius: 10 },
  picker: { width: '100%', backgroundColor: '#E0F7FF', borderRadius: 10, marginVertical: 10, color: '#1B4965' },
  pickerItem: { color: '#1B4965' },
  dateButton: { backgroundColor: '#1B4965', padding: 10, borderRadius: 10, marginVertical: 10 },
  dateButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#1B4965', padding: 15, width: '100%', borderRadius: 20, marginTop: 20 },
  saveButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  cancelButton: { marginTop: 10, padding: 10, backgroundColor: '#E0F7FF', borderRadius: 10 },
  cancelButtonText: { color: '#1B4965', textAlign: 'center' }
});
