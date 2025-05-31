import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, FlatList, TouchableOpacity,
  Dimensions, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';

export default function SpentScreen() {
  const [budget, setBudget] = useState('');
  const [budgetSet, setBudgetSet] = useState(false);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenses, setExpenses] = useState([]);

  const addExpense = () => {
    if (!expenseName || !expenseAmount) return;

    const newExpense = {
      id: Date.now().toString(),  // унікальний id
      name: expenseName,
      amount: parseFloat(expenseAmount),
    };

    setExpenses([...expenses, newExpense]);
    setExpenseName('');
    setExpenseAmount('');
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((item) => item.id !== id));
  };

  const getTotalSpent = () =>
    expenses.reduce((total, item) => total + item.amount, 0);

  const getRemaining = () =>
    parseFloat(budget) - getTotalSpent();

  const chartData = {
    labels: expenses.map((e) => e.name.length > 6 ? e.name.slice(0, 6) + '…' : e.name),
    datasets: [
      {
        data: expenses.map((e) => e.amount),
      },
    ],
  };

  return (
    <View style={styles.container}>
      {!budgetSet ? (
        <>
          <Text style={styles.title}>🎯 Введіть свій бюджет</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={budget}
            onChangeText={setBudget}
            placeholder="Ваш бюджет ₴"
            placeholderTextColor="#7B9EBF"
          />
          <Button title="Зберегти бюджет" onPress={() => setBudgetSet(true)} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Ваш бюджет: ₴{budget}</Text>
          <Text style={[styles.subtitle, { color: getRemaining() >= 0 ? 'green' : 'red' }]}>
            Залишилось: ₴{getRemaining().toFixed(2)}
          </Text>

          <Text style={styles.sectionTitle}>➕ Додати витрату</Text>
          <TextInput
            style={styles.input}
            value={expenseName}
            onChangeText={setExpenseName}
            placeholder="Назва витрати"
            placeholderTextColor="#7B9EBF"
          />
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={expenseAmount}
            onChangeText={setExpenseAmount}
            placeholder="Сума витрати"
            placeholderTextColor="#7B9EBF"
          />
          <Button title="Додати" onPress={addExpense} />

          <Text style={styles.sectionTitle}>📋 Витрати:</Text>
          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.expenseItem}>
                <Text style={styles.expenseText}>
                  <Ionicons name="wallet-outline" size={18} /> {item.name}: ₴{item.amount.toFixed(2)}
                </Text>
                <TouchableOpacity onPress={() => deleteExpense(item.id)}>
                  <Ionicons name="trash-outline" size={22} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />

          {expenses.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>📊 Графік витрат:</Text>
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
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1B4965',
    marginBottom: 20,
  },
  subtitle: { fontSize: 18, marginBottom: 10 },
  sectionTitle: { marginTop: 20, fontSize: 18, fontWeight: '600', color: '#1B4965' },
  input: { borderWidth: 1, padding: 8, marginVertical: 5, borderRadius: 5, width: '90%', color: '#000' },
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
