import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import db from '../instance/database'; // Підключення до SQLite

export default function ProfileScreen() {
  const [userName, setUserName] = useState('');
  const [pastTrips, setPastTrips] = useState([]);

  useEffect(() => {
    const userId = 1; // 👈 заміни на реальний userId, якщо є авторизація

    // Отримуємо ім'я користувача
    db.transaction(tx => {
      tx.executeSql(
        'SELECT name FROM users WHERE id = ?;',
        [userId],
        (_, { rows }) => {
          if (rows.length > 0) {
            setUserName(rows._array[0].name);
          }
        },
        (_, error) => {
          console.log('Помилка при завантаженні користувача:', error);
        }
      );
    });

    // Отримуємо подорожі з минулими датами
    db.transaction(tx => {
      const today = new Date().toISOString().split('T')[0]; // поточна дата
      tx.executeSql(
        'SELECT name, date FROM trips WHERE user_id = ? AND date < ? ORDER BY date DESC;',
        [userId, today],
        (_, { rows }) => {
          setPastTrips(rows._array);
        },
        (_, error) => {
          console.log('Помилка при завантаженні подорожей:', error);
        }
      );
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👤 Профіль користувача</Text>
      <Text style={styles.name}>Ім’я: {userName}</Text>

      <Text style={styles.subheader}>🧳 Минулі подорожі:</Text>
      <FlatList
        data={pastTrips}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.tripItem}>
            • {item.name} — {item.date}
          </Text>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Немає минулих подорожей</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1FAEE', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#1D3557' },
  name: { fontSize: 18, marginBottom: 20, color: '#457B9D' },
  subheader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#1D3557' },
  tripItem: { fontSize: 16, paddingVertical: 5, color: '#333' },
  empty: { fontSize: 16, fontStyle: 'italic', color: '#A8A8A8' },
});
