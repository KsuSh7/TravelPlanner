import React, { useState, useEffect, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { TripsContext } from './TripsContext';
import { AuthContext } from './AuthContext';
import { API_URL } from "../utils/api.js";
import { Ionicons } from '@expo/vector-icons';

const PROFILE_RECOMMENDATIONS_URL = `${API_URL.replace(/\/api$/, '')}/profile/trip-recommendations`;

export default function FutureTrips() {
  const [userName, setUserName] = useState('');
  const [trips, setTrips] = useContext(TripsContext);
  const { token, logout } = useContext(AuthContext);
  const [weatherByTrip, setWeatherByTrip] = useState({});
  const [recommendedTrips, setRecommendedTrips] = useState([]);

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

  const loadTrips = () => {
    if (!token) return;

    fetch(`${API_URL}/trips`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setTrips)
      .catch(err => console.error('Помилка завантаження подорожей:', err));
  };

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/cities`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setAllCities)
      .catch(err => console.error('Помилка при завантаженні міст:', err));

    fetch(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setUserName(data.username))
      .catch(err => console.error('Помилка при завантаженні користувача:', err));

    fetch(PROFILE_RECOMMENDATIONS_URL, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setRecommendedTrips)
      .catch(err => console.error('Помилка при завантаженні рекомендацій:', err));

    loadTrips();
  }, [token]);

  useEffect(() => {
    if (!token || trips.length === 0) {
      setWeatherByTrip({});
      return;
    }

    const loadWeather = async () => {
      try {
        const weatherEntries = await Promise.all(
          trips.map(async (trip) => {
            if (!trip.id) {
              return [trip.id, null];
            }

            try {
              const response = await fetch(`${API_URL}/trips/${trip.id}/weather`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              const data = await response.json();
              return [trip.id, data];
            } catch (error) {
              console.error(`Помилка завантаження погоди для trip ${trip.id}:`, error);
              return [trip.id, { available: false, message: 'Не вдалося завантажити прогноз' }];
            }
          })
        );

        setWeatherByTrip(Object.fromEntries(weatherEntries.filter(([tripId]) => tripId)));
      } catch (error) {
        console.error('Помилка при завантаженні погоди:', error);
      }
    };

    loadWeather();
  }, [token, trips]);

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

    fetch(`${API_URL}/trips`, {
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
      .then(() => {
        loadTrips();
        setModalVisible(false);
        setTripName('');
        setTripDate('');
        setTripEndDate('');
        setBudget('');
        setSearchQuery('');
        setSelectedCityId(null);
        setStartDateObj(null);
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
      <View style={styles.header}>
  <Text style={styles.title}>Майбутні подорожі</Text>

  <TouchableOpacity
    onPress={() => navigation.navigate('Profile')}
  >
    <Ionicons
      name="person-circle-outline"
      size={42}
      color="#1B4965"
    />
  </TouchableOpacity>
</View>
      <Text style={styles.greeting}>Привіт, {userName}!</Text>

      <FlatList
        data={trips}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        style={styles.tripsList}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <>
            <Text style={styles.sectionTitle}>
              ✨ Рекомендовані подорожі
            </Text>

            {recommendedTrips.length === 0 ? (
              <View style={styles.recommendationCard}>
                <Text style={styles.recommendationDescription}>
                  Заповни профіль, щоб ми підібрали для тебе міста для майбутніх подорожей.
                </Text>
                <TouchableOpacity
                  style={styles.recommendationButton}
                  onPress={() => navigation.navigate('Profile')}
                >
                  <Text style={styles.recommendationButtonText}>Перейти у профіль</Text>
                </TouchableOpacity>
              </View>
            ) : recommendedTrips.map((item) => (
              <View key={item.city_id} style={styles.recommendationCard}>
                <Text style={styles.recommendationTitle}>
                  {item.city_name}
                </Text>

                <Text style={styles.recommendationDescription}>
                  {`Пояснення: ${item.reason}.`}
                </Text>

                <Text style={styles.recommendationTags}>
                  {item.tags?.length ? `Теги: ${item.tags.join(', ')}` : 'Підібрано за профілем'}
                </Text>

                <TouchableOpacity
                  style={styles.recommendationButton}
                  onPress={() => {
                    setSelectedCityId(item.city_id);
                    setSearchQuery(item.city_name);
                    setTripName(`Подорож у ${item.city_name}`);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.recommendationButtonText}>Додати як подорож</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addButtonText}>+ Додати подорож</Text>
            </TouchableOpacity>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('TripDetails', { trip: item })}>
            <View style={styles.tripItem}>
              <Text style={styles.tripText}>{item.trip_name}</Text>
              <Text style={styles.dateText}>📍 {item.city_name}</Text>
              <Text style={styles.dateText}>📅 {item.start_date} — {item.end_date}</Text>
              <Text style={styles.budgetText}>💰 ₴{item.total_budget}</Text>
              <Text style={styles.weatherText}>
                {weatherByTrip[item.id]?.available
                  ? `🌤 ${weatherByTrip[item.id].weather_label}: ${weatherByTrip[item.id].max_temp}°C / ${weatherByTrip[item.id].min_temp}°C`
                  : `🌦 ${weatherByTrip[item.id]?.message || 'Завантаження прогнозу...'}`}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

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
  tripsList: { width: '100%', flex: 1 },
  listContent: {paddingHorizontal: 20,paddingBottom: 20,width: '100%',alignItems: 'center',},
  tripItem: {width: '100%',maxWidth: 500,padding: 15,marginVertical: 8,backgroundColor: '#E0F7FF',borderRadius: 12,shadowColor: '#000',shadowOpacity: 0.1,shadowOffset: { width: 0, height: 2 },shadowRadius: 4,elevation: 3,},
  tripText: { fontSize: 18, fontWeight: 'bold', color: '#1B4965' },
  dateText: { fontSize: 14, color: '#5A5A5A', marginTop: 2 },
  budgetText: { marginTop: 5, fontSize: 16, color: '#1B4965', fontWeight: '500' },
  weatherText: { marginTop: 6, fontSize: 14, color: '#0077B6' },
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
header: {
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  marginBottom: 15,
},
sectionTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#1B4965',
  marginTop: 10,
  marginBottom: 15,
},

recommendationCard: {
  width: '90%',
  backgroundColor: '#E0F7FF',
  padding: 15,
  borderRadius: 15,
  marginBottom: 12,
},

recommendationTitle: {
  fontSize: 17,
  fontWeight: 'bold',
  color: '#1B4965',
},

recommendationDescription: {
  marginTop: 5,
  color: '#5A5A5A',
},
recommendationTags: {
  marginTop: 8,
  color: '#1B4965',
  fontSize: 13,
},
recommendationButton: {
  marginTop: 12,
  backgroundColor: '#1B4965',
  paddingVertical: 10,
  borderRadius: 12,
  alignItems: 'center',
},
recommendationButtonText: {
  color: '#FFFFFF',
  fontWeight: 'bold',
},
});
