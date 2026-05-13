import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from './AuthContext';
import { API_URL } from '../utils/api.js';

const PROFILE_API_URL = `${API_URL.replace(/\/api$/, '')}/profile`;

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

const tagOptions = [
  { label: 'Тихий відпочинок', value: 'relax' },
  { label: 'Активності', value: 'adventure' },
  { label: 'Місцева кухня', value: 'local_food' },
  { label: 'Фотолокації', value: 'photo_spots' },
  { label: 'Архітектура', value: 'architecture' },
  { label: 'Море', value: 'sea' },
  { label: 'Гори', value: 'mountains' },
  { label: 'Міські прогулянки', value: 'city_walks' },
];

function SelectChips({ options, selectedValues, onToggle }) {
  return (
    <View style={styles.chipsRow}>
      {options.map((option) => {
        const selected = selectedValues.includes(option.value);

        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.chip, selected && styles.chipActive]}
            onPress={() => onToggle(option.value)}
          >
            <Text style={[styles.chipText, selected && styles.chipTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function OptionButtons({ options, value, onChange }) {
  return (
    <View style={styles.optionGroup}>
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.optionButton, selected && styles.optionButtonActive]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.optionText, selected && styles.optionTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    age: '',
    travel_type: 'solo',
    pace: 'medium',
    budget: 'medium',
    interests: [],
    preferred_tags: [],
    bio: '',
  });

  useEffect(() => {
    if (!token) return;

    const loadProfile = async () => {
      try {
        const response = await fetch(PROFILE_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Не вдалося завантажити профіль');
        }

        setProfile({
          username: data.username || '',
          email: data.email || '',
          age: data.age ? String(data.age) : '',
          travel_type: data.travel_type || 'solo',
          pace: data.pace || 'medium',
          budget: data.budget || 'medium',
          interests: data.interests || [],
          preferred_tags: data.preferred_tags || [],
          bio: data.bio || '',
        });
      } catch (error) {
        console.error('Помилка при завантаженні профілю:', error);
        Alert.alert('Помилка', 'Не вдалося завантажити профіль користувача');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const toggleArrayValue = (field, value) => {
    setProfile((prev) => {
      const exists = prev[field].includes(value);

      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((item) => item !== value)
          : [...prev[field], value],
      };
    });
  };

  const saveProfile = async () => {
    const ageValue = profile.age.trim();
    const parsedAge = ageValue ? Number(ageValue) : null;

    if (profile.interests.length === 0) {
      Alert.alert('Помилка', 'Оберіть хоча б один інтерес для рекомендацій');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(PROFILE_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          age: Number.isInteger(parsedAge) ? parsedAge : null,
          travel_type: profile.travel_type,
          pace: profile.pace,
          budget: profile.budget,
          interests: profile.interests,
          preferred_tags: profile.preferred_tags,
          bio: profile.bio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не вдалося оновити профіль');
      }

      Alert.alert('Успіх', 'Профіль оновлено');
    } catch (error) {
      console.error('Помилка при оновленні профілю:', error);
      Alert.alert('Помилка', 'Не вдалося зберегти зміни');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B4965" />
        <Text style={styles.loadingText}>Завантаження профілю...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Мій профіль</Text>
        <Text style={styles.subtitle}>
          Ці дані використовуються для персональних рекомендацій подорожей.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Налаштування рекомендацій</Text>

        <Text style={styles.label}>Тип подорожі</Text>
        <OptionButtons
          options={travelTypeOptions}
          value={profile.travel_type}
          onChange={(value) => setProfile((prev) => ({ ...prev, travel_type: value }))}
        />

        <Text style={styles.label}>Темп подорожі</Text>
        <OptionButtons
          options={paceOptions}
          value={profile.pace}
          onChange={(value) => setProfile((prev) => ({ ...prev, pace: value }))}
        />

        <Text style={styles.label}>Бажаний бюджет</Text>
        <OptionButtons
          options={budgetOptions}
          value={profile.budget}
          onChange={(value) => setProfile((prev) => ({ ...prev, budget: value }))}
        />

        <Text style={styles.label}>Інтереси</Text>
        <SelectChips
          options={interestOptions}
          selectedValues={profile.interests}
          onToggle={(value) => toggleArrayValue('interests', value)}
        />

        <Text style={styles.label}>Що хочеш бачити частіше в рекомендаціях</Text>
        <SelectChips
          options={tagOptions}
          selectedValues={profile.preferred_tags}
          onToggle={(value) => toggleArrayValue('preferred_tags', value)}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveProfile} disabled={saving}>
        <Text style={styles.saveButtonText}>
          {saving ? 'Збереження...' : 'Зберегти зміни'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAF0F8',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CAF0F8',
  },
  loadingText: {
    marginTop: 12,
    color: '#1B4965',
    fontSize: 16,
  },
  header: {
    marginBottom: 18,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F7FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 14,
  },
  backButtonText: {
    color: '#1B4965',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B4965',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#4C6A7F',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#F7FDFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B4965',
    marginBottom: 12,
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
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#E0F7FF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionButtonActive: {
    backgroundColor: '#1B4965',
  },
  optionText: {
    color: '#1B4965',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: '#E0F7FF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: '#FF6B6B',
  },
  chipText: {
    color: '#1B4965',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#1B4965',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
