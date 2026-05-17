import React, { useContext, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { AuthContext } from './AuthContext';
import { TripsContext } from './TripsContext';
import { API_URL } from '../utils/api.js';

const RECOMMEND_URL = `${API_URL.replace(/\/api$/, '')}/recommend`;

export default function CreateTripFromRouteScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const [, setTrips] = useContext(TripsContext);
  const { requestData } = route.params;

  const [tripName, setTripName] = useState(
    requestData?.city_name ? `Маршрут у ${requestData.city_name}` : ''
  );
  const [budget, setBudget] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [tripEndDate, setTripEndDate] = useState('');
  const [startDateObj, setStartDateObj] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isPickingStartDate, setIsPickingStartDate] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const saveTripWithRoute = async () => {
    if (!token) {
      Alert.alert('Помилка', 'Будь ласка, увійдіть в систему');
      return;
    }

    if (!requestData?.city_id) {
      Alert.alert('Помилка', 'Не знайдено місто для цього маршруту');
      return;
    }

    if (!tripName.trim() || !tripDate || !tripEndDate || !budget.trim()) {
      Alert.alert('Помилка', 'Заповни назву, бюджет та дати подорожі');
      return;
    }

    const parsedBudget = parseFloat(budget);
    if (Number.isNaN(parsedBudget) || parsedBudget <= 0) {
      Alert.alert('Помилка', 'Введи коректний бюджет');
      return;
    }

    setSaving(true);

    try {
      const tripResponse = await fetch(`${API_URL}/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          city_id: requestData.city_id,
          trip_name: tripName.trim(),
          start_date: tripDate,
          end_date: tripEndDate,
          total_budget: parsedBudget,
        }),
      });

      const createdTrip = await tripResponse.json();

      if (!tripResponse.ok) {
        throw new Error(createdTrip.error || 'Не вдалося створити подорож');
      }

      const routeResponse = await fetch(RECOMMEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...requestData,
          trip_id: createdTrip.id,
        }),
      });

      const routeResult = await routeResponse.json();

      if (!routeResponse.ok) {
        throw new Error(routeResult.error || 'Не вдалося зберегти маршрут у подорож');
      }

      setTrips((prev) => [...prev, createdTrip]);

      Alert.alert('Успіх', 'Маршрут додано до майбутніх подорожей');
      navigation.navigate('MainTabs', { screen: 'Подорожі' });
    } catch (error) {
      console.error('Помилка при збереженні маршруту:', error);
      Alert.alert('Помилка', error.message || 'Не вдалося зберегти маршрут');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Додати маршрут у подорожі</Text>
      <Text style={styles.subtitle}>
        Збережемо цей маршрут як майбутню подорож, щоб він зʼявився у списку та на карті.
      </Text>

      <Text style={styles.label}>Місто</Text>
      <TextInput
        style={[styles.input, styles.readOnlyInput]}
        value={requestData?.city_name || ''}
        editable={false}
      />

      <Text style={styles.label}>Назва подорожі</Text>
      <TextInput
        style={styles.input}
        value={tripName}
        onChangeText={setTripName}
        placeholder="Наприклад: Вікенд у Львові"
      />

      <Text style={styles.label}>Бюджет (грн)</Text>
      <TextInput
        style={styles.input}
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
        placeholder="Наприклад: 5000"
      />

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
        textColor="#1B4965"
        minimumDate={isPickingStartDate ? undefined : startDateObj}
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveTripWithRoute} disabled={saving}>
        <Text style={styles.saveButtonText}>
          {saving ? 'Збереження...' : 'Зберегти маршрут у подорожі'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAF0F8',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1B4965',
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 20,
    color: '#4C6A7F',
    lineHeight: 22,
  },
  label: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#1B4965',
  },
  input: {
    backgroundColor: '#E0F7FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#1B4965',
    fontSize: 15,
  },
  readOnlyInput: {
    opacity: 0.8,
  },
  dateButton: {
    backgroundColor: '#1B4965',
    padding: 14,
    borderRadius: 12,
    marginTop: 14,
  },
  dateButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
