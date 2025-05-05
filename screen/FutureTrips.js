import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal, Button } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";  // Для вибору дати

export default function FutureTrips() {
  // Стейт для майбутніх подорожей
  const [trips, setTrips] = useState([]);
  
  // Стейт для модального вікна
  const [isModalVisible, setModalVisible] = useState(false);
  const [tripName, setTripName] = useState('');
  const [tripDate, setTripDate] = useState('');
  
  // Стейт для вибору дати
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // Функція для додавання нової подорожі
  const addTrip = () => {
    if (tripName && tripDate) {
      setTrips([...trips, { name: tripName, date: tripDate }]);
      setModalVisible(false); // Закриваємо модальне вікно
      setTripName(''); // Очищаємо поле назви подорожі
      setTripDate(''); // Очищаємо вибір дати
    } else {
      alert('Будь ласка, введіть всі дані!');
    }
  };

  // Відображення модального вікна для вибору дати
  const handleConfirmDate = (date) => {
    setTripDate(date.toLocaleDateString());  // Форматуємо дату
    setDatePickerVisible(false);  // Закриваємо DatePicker
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Майбутні подорожі</Text>

      {/* Список майбутніх подорожей */}
      <FlatList
        data={trips}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.tripItem}>
            <Text style={styles.tripText}>{item.name} - {item.date}</Text>
          </View>
        )}
      />

      {/* Кнопка для додавання нової подорожі */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Додати подорож</Text>
      </TouchableOpacity>

      {/* Модальне вікно для додавання подорожі */}
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
            
            {/* Кнопка для вибору дати */}
            <TouchableOpacity style={styles.dateButton} onPress={() => setDatePickerVisible(true)}>
              <Text style={styles.dateButtonText}>{tripDate ? `Дата: ${tripDate}` : 'Вибрати дату'}</Text>
            </TouchableOpacity>

            {/* Дата Пікер */}
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirmDate}
              onCancel={() => setDatePickerVisible(false)}
            />

            {/* Кнопка для збереження подорожі */}
            <TouchableOpacity style={styles.saveButton} onPress={addTrip}>
              <Text style={styles.saveButtonText}>Зберегти подорож</Text>
            </TouchableOpacity>

            {/* Кнопка для закриття модального вікна */}
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
  container: { flex: 1, backgroundColor: '#CAF0F8', alignItems: 'center', paddingTop: 60, },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B4965', marginBottom: 20 },
  addButton: { backgroundColor: '#1B4965', padding: 15, width: '60%', borderRadius: 20, marginBottom: 20, },
  addButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  tripItem: { padding: 15, marginBottom: 10, backgroundColor: '#E0F7FF', borderRadius: 10, width: '80%' , alignItems: 'center',},
  tripText: { fontSize: 18, color: '#1B4965' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  input: { width: '100%', backgroundColor: '#E0F7FF', padding: 10, marginVertical: 10, borderRadius: 10 },
  dateButton: { backgroundColor: '#1B4965', padding: 10, borderRadius: 10, marginVertical: 10 },
  dateButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#1B4965', padding: 15, width: '100%', borderRadius: 20, marginTop: 20 },
  saveButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  cancelButton: { marginTop: 10, padding: 10, backgroundColor: '#E0F7FF', borderRadius: 10 },
  cancelButtonText: { color: '#1B4965', textAlign: 'center' }
});
