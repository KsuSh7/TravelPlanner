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
  const { token, logout } = useContext(AuthContext);

  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [startDateObj, setStartDateObj] = useState(null); 
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
      .then(data => setUserName(data.username))
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
  if (isPickingStartDate) {
    setTripDate(formatted);
    setStartDateObj(date); 
  } else {
    setTripEndDate(formatted);
  }
  setDatePickerVisible(false);
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Майбутні подорожі</Text>
      <Text style={styles.greeting}>Привіт, {userName}!</Text>

      <FlatList
        data={trips}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('TripDetails', { trip: item })}>
            <View style={styles.tripItem}>
              <Text style={styles.tripText}>{item.trip_name}</Text>
              <Text style={styles.dateText}>📍 {item.city_name}</Text>
              <Text style={styles.dateText}>📅 {item.start_date} — {item.end_date}</Text>
              <Text style={styles.budgetText}>💰 ₴{item.total_budget}</Text>
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
              placeholderTextColor="#7B9EBF"
              value={tripName}
              onChangeText={setTripName}
            />
            <TextInput
              style={styles.input}
              placeholder="Бюджет (грн)"
              placeholderTextColor="#7B9EBF"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Пошук міста"
              placeholderTextColor="#7B9EBF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Picker
              selectedValue={selectedCityId}
              onValueChange={(value) => setSelectedCityId(value)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Оберіть місто" value={null} />
              {allCities.filter(city =>city.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)).map(city => (
              <Picker.Item key={city.id} label={city.name} value={city.id} />
                ))}
            </Picker>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => {
            setIsPickingStartDate(true);
            setDatePickerVisible(true);
          }}>
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
          textColor="#1B4965"
          minimumDate={isPickingStartDate ? undefined : startDateObj}
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
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          logout();
          navigation.navigate('Welcome');
        }}
      >
        <Text style={styles.logoutText}>🚪 Вийти з профілю</Text>
      </TouchableOpacity>


    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#CAF0F8', alignItems: 'center', paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B4965', marginBottom: 20 },
  greeting: { fontSize: 18, marginBottom: 10, color: '#1B4965' },
  listContent: {paddingHorizontal: 20,paddingBottom: 20,width: '100%',alignItems: 'center',},
  tripItem: {width: '100%',maxWidth: 500,padding: 15,marginVertical: 8,backgroundColor: '#E0F7FF',borderRadius: 12,shadowColor: '#000',shadowOpacity: 0.1,shadowOffset: { width: 0, height: 2 },shadowRadius: 4,elevation: 3,},
  tripText: { fontSize: 18, fontWeight: 'bold', color: '#1B4965' },
  dateText: { fontSize: 14, color: '#5A5A5A', marginTop: 2 },
  budgetText: { marginTop: 5, fontSize: 16, color: '#1B4965', fontWeight: '500' },
  addButton: {backgroundColor: '#1B4965',padding: 15,width: '60%',borderRadius: 20,marginBottom: 20,},
  addButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
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
  cancelButtonText: { color: '#1B4965', textAlign: 'center' },
  logoutButton: {backgroundColor: '#FF6B6B',padding: 15,borderRadius: 20,width: '60%',marginBottom: 20,alignItems: 'center',},
logoutText: {color: '#fff',fontWeight: 'bold',fontSize: 16,},
});
