import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,  FlatList, Modal
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import db from '../instance/database'; // 👈 Підключення до SQLite

export default function ProfileTripsScreen({ navigation }) {
    const [userName, setUserName] = useState('');
    const [userId] = useState(1); 

    const [trips, setTrips] = useState([]);
    const [allCities, setAllCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [tripName, setTripName] = useState('');
    const [tripDate, setTripDate] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    useEffect(() => {
    loadUser();
    loadCities();
    loadTrips();
    }, []);

    const loadUser = () => {
    db.transaction(tx => {
        tx.executeSql(
        'SELECT name FROM users WHERE id = ?;',
        [userId],
        (_, { rows }) => {
            if (rows.length > 0) setUserName(rows._array[0].name);
        }
        );
    });
    };

    const loadCities = () => {
    fetch('http://192.168.1.162:5001/cities')
        .then(res => res.json())
        .then(data => setAllCities(data))
        .catch(err => console.error('Помилка при завантаженні міст:', err));
    };

    const loadTrips = () => {
    db.transaction(tx => {
        tx.executeSql(
        'SELECT name, date, city FROM trips WHERE user_id = ? ORDER BY date DESC;',
        [userId],
        (_, { rows }) => setTrips(rows._array)
        );
    });
    };

    const addTrip = () => {
    if (!tripName || !tripDate || !selectedCity) {
        alert('Будь ласка, заповніть всі поля');
        return;
    }

    const cityData = allCities.find(c => c.name === selectedCity);
    if (!cityData) return alert('Місто не знайдено');

    db.transaction(tx => {
        tx.executeSql(
        'INSERT INTO trips (user_id, name, date, city, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?);',
        [userId, tripName, tripDate, selectedCity, cityData.latitude, cityData.longitude],
        () => {
            loadTrips();
            setTripName('');
            setTripDate('');
            setSelectedCity('');
            setModalVisible(false);
        },
        (_, error) => {
            console.log('Помилка при додаванні подорожі:', error);
        }
        );
    });
    };

    const handleConfirmDate = (date) => {
    setTripDate(date.toISOString().split('T')[0]);
    setDatePickerVisible(false);
    };

    return (
    <View style={styles.container}>
        <Text style={styles.header}>👤 Профіль: {userName}</Text>

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+ Додати подорож</Text>
        </TouchableOpacity>

        <FlatList
            data={trips}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => navigation.navigate('TripDetails', { trip: item })}>
                <Text style={styles.tripItem}>
        • {item.name} — {item.date} до {item.end_date} — {item.city} — ₴{item.budget}
        </Text>
        </TouchableOpacity>
)}

        ListEmptyComponent={<Text style={styles.empty}>Поки немає подорожей</Text>}
        />

        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.logoutText}>Вийти</Text>
        </TouchableOpacity>

      {/* Модалка */}
        <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <TextInput
                style={styles.input}
                placeholder="Назва подорожі"
                value={tripName}
                onChangeText={setTripName}
            />

            <Picker
                selectedValue={selectedCity}
                onValueChange={(value) => setSelectedCity(value)}
                style={styles.picker}
                itemStyle={{ color: '#1B4965' }}
            >
                <Picker.Item label="Оберіть місто" value="" />
                {allCities.map((city, i) => (
                <Picker.Item key={i} label={city.name} value={city.name} />
                ))}
            </Picker>

            <TouchableOpacity style={styles.dateButton} onPress={() => setDatePickerVisible(true)}>
                <Text style={styles.dateButtonText}>{tripDate || 'Вибрати дату'}</Text>
            </TouchableOpacity>

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={() => setDatePickerVisible(false)}
            />

            <TouchableOpacity style={styles.saveButton} onPress={addTrip}>
                <Text style={styles.saveText}>Зберегти</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Скасувати</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
    </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#CAF0F8', padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', color: '#1B4965', marginBottom: 10 },
    tripItem: { fontSize: 16, paddingVertical: 5, color: '#1B4965' },
    empty: { fontStyle: 'italic', color: '#999', textAlign: 'center', marginTop: 20 },
    addButton: { backgroundColor: '#1B4965', padding: 10, borderRadius: 10, marginBottom: 10 },
    addButtonText: { color: '#fff', textAlign: 'center' },
    logoutButton: { marginTop: 20, alignSelf: 'center' },
    logoutText: { color: 'red', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
    modalContent: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 10 },
    input: { backgroundColor: '#E0F7FF', padding: 10, borderRadius: 10, marginBottom: 10 },
    picker: { backgroundColor: '#E0F7FF', marginBottom: 10, borderRadius: 10 },
    dateButton: { backgroundColor: '#1B4965', padding: 10, borderRadius: 10 },
    dateButtonText: { color: '#fff', textAlign: 'center' },
    saveButton: { backgroundColor: '#1B4965', marginTop: 10, padding: 12, borderRadius: 10 },
    saveText: { color: '#fff', textAlign: 'center' },
    cancelText: { color: '#1B4965', textAlign: 'center', marginTop: 10 },
});
