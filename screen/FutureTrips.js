import React, { useState, useEffect, useContext } from 'react';
import { TripsContext } from './TripsContext';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { AuthContext } from './AuthContext';

export default function FutureTrips() {
  const [trips, setTrips] = useContext(TripsContext);
  const { token } = useContext(AuthContext);

  const [isModalVisible, setModalVisible] = useState(false);
  const [tripName, setTripName] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [selectedCityId, setSelectedCityId] = useState(null); // id міста
  const [allCities, setAllCities] = useState([]);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {

    if (!token) {
      return <Text>Loading...</Text>;
    }


    fetch('http://192.168.1.162:5001/cities', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setAllCities(data))
      .catch(err => console.error('Помилка при завантаженні міст:', err));
  }, [token]);

  const addTrip = () => {
    if (tripName && tripDate && selectedCityId !== '') {
      const cityData = allCities.find(c => c.id === selectedCityId);
      if (!cityData) {
        alert('Місто не знайдено');
        return;
      }

      const newTrip = {
        name: tripName,
        date: tripDate,
        city: cityData.name,
        latitude: cityData.latitude,
        longitude: cityData.longitude
      };

      setTrips([...trips, newTrip]);
      setModalVisible(false);
      setTripName('');
      setTripDate('');
      setSelectedCityId(null);
    } else {
      alert('Будь ласка, заповніть всі поля');
    }
  };

  const handleConfirmDate = (date) => {
    setTripDate(date.toLocaleDateString());
    setDatePickerVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Майбутні подорожі</Text>

      <FlatList
        data={trips}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.tripItem}>
            <Text style={styles.tripText}>{item.name} — {item.date} — {item.city}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Додати подорож</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Назва подорожі"
              value={tripName}
              onChangeText={setTripName}
            />

            <Picker
              selectedValue={selectedCityId ?? ''}
              onValueChange={(value) => setSelectedCityId(value)}
              style={styles.picker}
              itemStyle={styles.pickerItem} >
              <Picker.Item label="Оберіть місто" value="" />

              {allCities.map((city) => (
                <Picker.Item key={city.id} label={city.name} value={city.id} />
              ))}
            </Picker>


            <TouchableOpacity style={styles.dateButton} onPress={() => setDatePickerVisible(true)}>
              <Text style={styles.dateButtonText}>{tripDate ? `Дата: ${tripDate}` : 'Вибрати дату'}</Text>
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
  addButton: { backgroundColor: '#1B4965', padding: 15, width: '60%', borderRadius: 20, marginBottom: 20 },
  addButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  tripItem: { padding: 15, marginBottom: 10, backgroundColor: '#E0F7FF', borderRadius: 10, width: '80%', alignItems: 'center' },
  tripText: { fontSize: 18, color: '#1B4965' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  input: { width: '100%', backgroundColor: '#E0F7FF', padding: 10, marginVertical: 10, borderRadius: 10 },
  picker: { width: '100%', backgroundColor: '#E0F7FF', borderRadius: 10, marginVertical: 10 ,color: '#1B4965'},
  pickerItem:{color: '#1B4965'},
  dateButton: { backgroundColor: '#1B4965', padding: 10, borderRadius: 10, marginVertical: 10 },
  dateButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#1B4965', padding: 15, width: '100%', borderRadius: 20, marginTop: 20 },
  saveButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  cancelButton: { marginTop: 10, padding: 10, backgroundColor: '#E0F7FF', borderRadius: 10 },
  cancelButtonText: { color: '#1B4965', textAlign: 'center' }
});
