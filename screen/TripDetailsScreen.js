import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert
} from 'react-native';
import { AuthContext } from './AuthContext';

export default function TripDetailsScreen({ route }) {
  const { trip } = route.params;
  const { token } = useContext(AuthContext);

  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const response = await fetch(`http://192.168.31.55:5001/api/trips/${trip.id}/expenses`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) {
        throw new Error(`Помилка сервера: ${response.status}`);
      }
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Помилка при завантаженні витрат:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити витрати. Перевірте підключення до мережі.');
    }
  };

  const addExpense = async () => {
    const parsedAmount = parseFloat(amount);
    if (!title || isNaN(parsedAmount)) {
      Alert.alert('Помилка', 'Заповніть коректно назву та суму витрати');
      return;
    }

    try {
      const response = await fetch(`http://192.168.31.55:5001/api/trips/${trip.id}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title,
          amount: parsedAmount
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Помилка при додаванні витрати:', err);
        Alert.alert('Помилка', err.message || 'Не вдалося додати витрату');
        return;
      }

      setTitle('');
      setAmount('');
      loadExpenses();

    } catch (error) {
      console.error('Помилка при додаванні витрати:', error);
      Alert.alert('Помилка', 'Не вдалося додати витрату. Перевірте підключення до мережі.');
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const remaining = (trip.total_budget ?? trip.budget ?? 0) - totalSpent;

  const daysLeft = (() => {
    const today = new Date();
    const tripStart = new Date(trip.start_date || trip.date);
    const diffTime = tripStart.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0
      ? `Залишилось ${diffDays} дн. до початку подорожі`
      : diffDays === 0
        ? 'Подорож починається сьогодні!'
        : 'Подорож вже розпочалась або завершена';
  })();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✈️ {trip.name}</Text>
      <Text>📍 {trip.city?.name || trip.city}</Text>
      <Text>🗓 {trip.start_date} – {trip.end_date}</Text>
      <Text>💰 Бюджет: ₴{remaining + totalSpent}</Text>
      <Text>💸 Витрачено: ₴{totalSpent}</Text>
      <Text>💼 Залишилось: ₴{remaining}</Text>
      <Text style={styles.leftDay}>{daysLeft}</Text>

      <View style={styles.expenseForm}>
        <TextInput
          placeholder="Назва витрати"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <TextInput
          placeholder="Сума"
          value={amount}
          keyboardType="numeric"
          onChangeText={setAmount}
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={addExpense}>
          <Text style={styles.buttonText}>Додати витрату</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>📋 Список витрат:</Text>
      <FlatList
        data={expenses}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.expenseItem}>• {item.title} — ₴{item.amount}</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3FDFD', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B4965', marginBottom: 5 },
  subtitle: { marginTop: 20, fontSize: 18, fontWeight: 'bold', color: '#1B4965' },
  input: { backgroundColor: '#fff', padding: 10, marginVertical: 5, borderRadius: 8, fontSize: 16 },
  button: { backgroundColor: '#1B4965', padding: 12, borderRadius: 10, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  expenseItem: { paddingVertical: 4, fontSize: 16, color: '#1B4965' },
  expenseForm: { marginTop: 20 },
  leftDay: { marginVertical: 10, fontSize: 16, fontWeight: '600', color: '#0077b6' },
});
