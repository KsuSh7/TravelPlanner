import React, { useEffect, useState, useContext } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ScrollView
} from 'react-native';
import { AuthContext } from './AuthContext';
import { API_URL } from "../utils/api.js";

const PROFILE_API_URL = `${API_URL.replace(/\/api$/, '')}/profile`;
const RECOMMEND_URL = `${API_URL.replace(/\/api$/, '')}/recommend`;
const travelTypeOptions = [
    { label: 'Наодинці', value: 'solo' },
    { label: 'Пара', value: 'couple' },
    { label: 'Сімʼя', value: 'family' },
    { label: 'Друзі', value: 'friends' },
];
const paceOptions = [
    { label: 'Повільний', value: 'slow' },
    { label: 'Збалансований', value: 'medium' },
    { label: 'Активний', value: 'fast' },
];
const budgetOptions = [
    { label: 'Мінімальний', value: 'low' },
    { label: 'Середній', value: 'medium' },
    { label: 'Високий', value: 'high' },
];
const interestOptions = [
    { label: 'Природа', value: 'nature' },
    { label: 'Культура', value: 'culture' },
    { label: 'Нічне життя', value: 'nightlife' },
    { label: 'Історія', value: 'history' },
    { label: 'Їжа', value: 'food' },
    { label: 'Музеї', value: 'museums' },
    { label: 'Шопінг', value: 'shopping' },
    { label: 'Хайкінг', value: 'hiking' },
];

export default function TripDetailsScreen({ route }) {
    const { trip } = route.params;
    const { token } = useContext(AuthContext);

    const [expenses, setExpenses] = useState([]);
    const [tripRoute, setTripRoute] = useState([]);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [showRouteGenerator, setShowRouteGenerator] = useState(false);
    const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);
    const [routeDays, setRouteDays] = useState('3');
    const [routeTravelType, setRouteTravelType] = useState('solo');
    const [routePace, setRoutePace] = useState('medium');
    const [routeBudget, setRouteBudget] = useState('medium');
    const [routeInterests, setRouteInterests] = useState([]);

    useEffect(() => {
        if (token) {
        loadExpenses();
        loadRoute();
        loadProfileDefaults();
        }
    }, [token]);

    const loadExpenses = async () => {
        if (!token) return;

        try {
        const response = await fetch(`${API_URL}/trips/${trip.id}/expenses`, {
        headers: { 'Authorization': `Bearer ${token}` }
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

    const loadRoute = async () => {
        if (!token) return;

        try {
        const response = await fetch(`${API_URL}/trips/${trip.id}/route`, {
        headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error(`Помилка сервера: ${response.status}`);
        }
        const data = await response.json();
        setTripRoute(data);
        } catch (error) {
        console.error('Помилка при завантаженні маршруту:', error);
        }
    };

    const loadProfileDefaults = async () => {
        if (!token) return;

        try {
        const response = await fetch(PROFILE_API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error(`Помилка сервера: ${response.status}`);
        }
        const data = await response.json();
        setRouteTravelType(data.travel_type || 'solo');
        setRoutePace(data.pace || 'medium');
        setRouteBudget(data.budget || 'medium');
        setRouteInterests(data.interests || []);
        } catch (error) {
        console.error('Помилка при завантаженні профілю для маршруту:', error);
        }
    };

    const addExpense = async () => {
        const parsedAmount = parseFloat(amount);
        if (!title || isNaN(parsedAmount)) {
        Alert.alert('Помилка', 'Заповніть коректно назву та суму витрати');
        return;
        }

        try {
        const response = await fetch(`${API_URL}/trips/${trip.id}/expenses`, {
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

    const toggleRouteInterest = (value) => {
        setRouteInterests((prev) =>
        prev.includes(value)
            ? prev.filter((item) => item !== value)
            : [...prev, value]
        );
    };

    const generateRouteForTrip = async () => {
        if (!token) return;

        if (!routeDays.trim() || Number(routeDays) <= 0) {
        Alert.alert('Помилка', 'Вкажи коректну кількість днів');
        return;
        }

        if (routeInterests.length === 0) {
        Alert.alert('Помилка', 'Оберіть хоча б один інтерес для маршруту');
        return;
        }

        setIsGeneratingRoute(true);

        try {
        const response = await fetch(RECOMMEND_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            city_id: trip.city_id,
            city_name: trip.city_name,
            trip_id: trip.id,
            budget: routeBudget,
            travel_type: routeTravelType,
            interests: routeInterests,
            pace: routePace,
            days: Number(routeDays)
        })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Не вдалося згенерувати маршрут');
        }

        await loadRoute();
        setShowRouteGenerator(false);
        Alert.alert('Успіх', 'Маршрут згенеровано та збережено до подорожі');
        } catch (error) {
        console.error('Помилка при генерації маршруту:', error);
        Alert.alert('Помилка', error.message || 'Не вдалося згенерувати маршрут');
        } finally {
        setIsGeneratingRoute(false);
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

    const groupedRoute = tripRoute.reduce((groups, item) => {
        const dayKey = item.day || 1;
        if (!groups[dayKey]) {
            groups[dayKey] = [];
        }
        groups[dayKey].push(item);
        return groups;
    }, {});

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>✈️ {trip.trip_name}</Text>
        <Text>📍 {trip.city_name}</Text>
        <Text>🗓 {trip.start_date} – {trip.end_date}</Text>
        <Text>💰 Бюджет: ₴{remaining + totalSpent}</Text>
        <Text>💸 Витрачено: ₴{totalSpent}</Text>
        <Text>💼 Залишилось: ₴{remaining}</Text>
        <Text style={styles.leftDay}>{daysLeft}</Text>

        <TouchableOpacity
        style={styles.generateRouteButton}
        onPress={() => setShowRouteGenerator((prev) => !prev)}
        >
        <Text style={styles.generateRouteButtonText}>
            {tripRoute.length > 0 ? 'Оновити рекомендований маршрут' : 'Згенерувати рекомендований маршрут'}
        </Text>
        </TouchableOpacity>

        {showRouteGenerator && (
        <View style={styles.generatorCard}>
            <Text style={styles.generatorTitle}>Налаштування маршруту</Text>

            <TextInput
            style={styles.input}
            placeholder="Кількість днів"
            value={routeDays}
            keyboardType="numeric"
            onChangeText={setRouteDays}
            />

            <Text style={styles.generatorLabel}>Тип подорожі</Text>
            <View style={styles.chipsRow}>
            {travelTypeOptions.map((option) => (
                <TouchableOpacity
                key={option.value}
                style={[styles.chip, routeTravelType === option.value && styles.chipActive]}
                onPress={() => setRouteTravelType(option.value)}
                >
                <Text style={[styles.chipText, routeTravelType === option.value && styles.chipTextActive]}>
                    {option.label}
                </Text>
                </TouchableOpacity>
            ))}
            </View>

            <Text style={styles.generatorLabel}>Темп</Text>
            <View style={styles.chipsRow}>
            {paceOptions.map((option) => (
                <TouchableOpacity
                key={option.value}
                style={[styles.chip, routePace === option.value && styles.chipActive]}
                onPress={() => setRoutePace(option.value)}
                >
                <Text style={[styles.chipText, routePace === option.value && styles.chipTextActive]}>
                    {option.label}
                </Text>
                </TouchableOpacity>
            ))}
            </View>

            <Text style={styles.generatorLabel}>Бюджет маршруту</Text>
            <View style={styles.chipsRow}>
            {budgetOptions.map((option) => (
                <TouchableOpacity
                key={option.value}
                style={[styles.chip, routeBudget === option.value && styles.chipActive]}
                onPress={() => setRouteBudget(option.value)}
                >
                <Text style={[styles.chipText, routeBudget === option.value && styles.chipTextActive]}>
                    {option.label}
                </Text>
                </TouchableOpacity>
            ))}
            </View>

            <Text style={styles.generatorLabel}>Інтереси</Text>
            <View style={styles.chipsRow}>
            {interestOptions.map((option) => (
                <TouchableOpacity
                key={option.value}
                style={[styles.chip, routeInterests.includes(option.value) && styles.chipActive]}
                onPress={() => toggleRouteInterest(option.value)}
                >
                <Text style={[styles.chipText, routeInterests.includes(option.value) && styles.chipTextActive]}>
                    {option.label}
                </Text>
                </TouchableOpacity>
            ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={generateRouteForTrip} disabled={isGeneratingRoute}>
            <Text style={styles.buttonText}>
                {isGeneratingRoute ? 'Генеруємо...' : 'Зберегти маршрут до подорожі'}
            </Text>
            </TouchableOpacity>
        </View>
        )}

        {tripRoute.length > 0 && (
        <>
        <Text style={styles.subtitle}>🗺 Маршрут подорожі</Text>
        <FlatList
            data={Object.entries(groupedRoute)}
            keyExtractor={([day]) => day.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => {
            const [day, places] = item;
            return (
                <View style={styles.routeCard}>
                <Text style={styles.routeDay}>День {day}</Text>
                {places.map((routeItem, index) => (
                    <View
                    key={`${day}-${index}-${routeItem.time}`}
                    style={[
                        styles.routeRow,
                        index !== places.length - 1 && styles.routeRowBorder
                    ]}
                    >
                    <Text style={styles.routeTime}>{routeItem.time}</Text>
                    <View style={styles.routeContent}>
                        <Text style={styles.routePlace}>{routeItem.place?.name}</Text>
                        <Text style={styles.routeDescription}>{routeItem.description}</Text>
                    </View>
                    </View>
                ))}
                </View>
            );
            }}
        />
        </>
        )}

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
        {expenses.map((item) => (
            <Text key={item.id} style={styles.expenseItem}>• {item.title} — ₴{item.amount}</Text>
        ))}
    </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E3FDFD', padding: 20 },
    content: { paddingBottom: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1B4965', marginBottom: 5 },
    subtitle: { marginTop: 20, fontSize: 18, fontWeight: 'bold', color: '#1B4965' },
    input: { backgroundColor: '#fff', padding: 10, marginVertical: 5, borderRadius: 8, fontSize: 16 },
    button: { backgroundColor: '#1B4965', padding: 12, borderRadius: 10, marginTop: 10 },
    buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
    generateRouteButton: { backgroundColor: '#FF6B6B', padding: 12, borderRadius: 10, marginTop: 12 },
    generateRouteButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
    expenseItem: { paddingVertical: 4, fontSize: 16, color: '#1B4965' },
    expenseForm: { marginTop: 20 },
    leftDay: { marginVertical: 10, fontSize: 16, fontWeight: '600', color: '#0077b6' },
    generatorCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 12 },
    generatorTitle: { fontSize: 16, fontWeight: 'bold', color: '#1B4965', marginBottom: 6 },
    generatorLabel: { marginTop: 10, marginBottom: 8, color: '#1B4965', fontWeight: '600' },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: { backgroundColor: '#E0F7FF', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
    chipActive: { backgroundColor: '#1B4965' },
    chipText: { color: '#1B4965', fontWeight: '600' },
    chipTextActive: { color: '#fff' },
    routeCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 10 },
    routeDay: { fontSize: 16, fontWeight: 'bold', color: '#1B4965', marginBottom: 8 },
    routeRow: { flexDirection: 'row', paddingVertical: 10 },
    routeRowBorder: { borderBottomWidth: 1, borderBottomColor: '#E6F1F5' },
    routeTime: { width: 70, color: '#FF6B6B', fontWeight: 'bold' },
    routeContent: { flex: 1 },
    routePlace: { color: '#1B4965', fontWeight: '600', marginBottom: 4 },
    routeDescription: { color: '#5C677D', lineHeight: 20 },
});
