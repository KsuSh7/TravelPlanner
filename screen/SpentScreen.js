import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, FlatList, TouchableOpacity,
  Dimensions, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';

export default function TripBudgetCalculator() {
  const [budget, setBudget] = useState('');
  const [budgetSet, setBudgetSet] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [items, setItems] = useState([]);

  const addItem = () => {
    if (!itemName || !itemCost) return;

    const newItem = {
      id: Date.now().toString(),
      name: itemName,
      cost: parseFloat(itemCost),
    };

    setItems([...items, newItem]);
    setItemName('');
    setItemCost('');
  };

  const deleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const totalCost = items.reduce((sum, i) => sum + i.cost, 0);
  const remaining = parseFloat(budget) - totalCost;
  const percentUsed = budget ? Math.min((totalCost / parseFloat(budget)) * 100, 100).toFixed(1) : 0;

  const chartData = {
    labels: items.map((i) => i.name.length > 6 ? i.name.slice(0, 6) + '…' : i.name),
    datasets: [{ data: items.map((i) => i.cost) }],
  };

  return (
    <View style={styles.container}>
      {!budgetSet ? (
        <>
          <Text style={styles.title}>✈️ Бюджет подорожі</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={budget}
            onChangeText={setBudget}
            placeholder="Введіть загальний бюджет"
            placeholderTextColor="#7B9EBF"
          />
          <TouchableOpacity
            style={styles.Addbutton}onPress={() => {const numericBudget = parseFloat(budget);if (isNaN(numericBudget) || numericBudget <= 0) {alert('Будь ласка, введіть коректний бюджет більше нуля');
              return;
              }
                setBudgetSet(true);
            }}
              >
            <Text style={styles.buttonText}>Почати розрахунок</Text>
        </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>💰 Бюджет: ₴{budget}</Text>
          <Text style={[styles.subtitle, { color: remaining >= 0 ? 'green' : 'red' }]}>
            Залишилось: ₴{remaining.toFixed(2)} ({percentUsed}% використано)
          </Text>

          

          <TextInput
            style={styles.input}
            value={itemName}
            onChangeText={setItemName}
            placeholder="Тип витрати (наприклад, Готель)"
            placeholderTextColor="#7B9EBF"
          />
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={itemCost}
            onChangeText={setItemCost}
            placeholder="Сума"
            placeholderTextColor="#7B9EBF"
          />
          <TouchableOpacity style={styles.Addbutton} onPress={addItem}>
            <Text style={styles.buttonText}>Додати витрату</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>🧾 Очікувані витрати:</Text>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.expenseItem}>
                <Text style={styles.expenseText}>
                  <Ionicons name="wallet-outline" size={18} /> {item.name}: ₴{item.cost.toFixed(2)}
                </Text>
                <TouchableOpacity onPress={() => deleteItem(item.id)}>
                  <Ionicons name="trash-outline" size={22} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />

          {items.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>📊 Діаграма витрат:</Text>
              <BarChart
                data={chartData}
                width={Dimensions.get('window').width - 40}
                height={220}
                fromZero
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#f7f7f7',
                  backgroundGradientTo: '#f7f7f7',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
                  labelColor: () => '#1B4965',
                  style: { borderRadius: 16 },
                }}
                style={{ marginVertical: 8, borderRadius: 16 }}
              />
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#CAF0F8', alignItems: 'center', paddingTop: 60 },
  Addbutton:{backgroundColor: '#1B4965', padding: 12, borderRadius: 15, marginTop: 20 },
  buttonText:{color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  title: {
    fontSize: 26,fontWeight: 'bold',color: '#1B4965', marginBottom: 15,
  },
  subtitle: { fontSize: 16, marginBottom: 10 },
  sectionTitle: { marginTop: 20, fontSize: 18, fontWeight: '600', color: '#1B4965' },
  input: {borderWidth: 1,padding: 10,marginVertical: 5,borderRadius: 8,width: '90%',color: '#000',backgroundColor: '#fff',borderColor: '#90E0EF',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    width: '90%',
  },
  expenseText: { fontSize: 16 },
});
