import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { API_URL } from "../utils/api.js";

export default function QuestionScreen({ navigation }) {

  const [budget, setBudget] = useState("medium");
  const [travelType, setTravelType] = useState("solo");

  const [days, setDays] = useState("");
  const [pace, setPace] = useState("medium");

  const [interests, setInterests] = useState([]);

  const [allCities, setAllCities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCityId, setSelectedCityId] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/cities`)
      .then(res => res.json())
      .then(setAllCities)
      .catch(err => console.log("cities error:", err));
  }, []);

  const toggleInterest = (value) => {
    setInterests(prev =>
      prev.includes(value)
        ? prev.filter(i => i !== value)
        : [...prev, value]
    );
  };

  const selectedCity = allCities.find(c => c.id === selectedCityId);

  const submit = () => {
    if (!selectedCityId) return Alert.alert("Помилка", "Оберіть місто");
    if (interests.length === 0) return Alert.alert("Помилка", "Оберіть інтереси");

    const payload = {
      city_id: selectedCityId,
      city_name: selectedCity?.name,
      budget,
      travel_type: travelType,
      interests,
      pace,
      days: Number(days)
    };

    console.log("PAYLOAD:", payload);
    navigation.navigate("Loading", payload);
  };

  const paceOptions = [
    { label: "Повільний 🧘", value: "slow" },
    { label: "Збалансований ⚖️", value: "medium" },
    { label: "Активний ⚡", value: "fast" }
  ];

  const budgetOptions = [
    { label: "Мінімальний 💵", value: "low" },
    { label: "Середній 💸", value: "medium" },
    { label: "Високий 💎", value: "high" }
  ];

  const travelTypeOptions = [
    { label: "Наодинці 🧍", value: "solo" },
    { label: "Пара ❤️", value: "couple" },
    { label: "Сім’я 👨‍👩‍👧", value: "family" }
  ];

  const interestOptions = [
    { label: "Природа 🌿", value: "nature" },
    { label: "Культура 🏛️", value: "culture" },
    { label: "Нічне життя 🎉", value: "nightlife" },
    { label: "Історія 📜", value: "history" }
  ];

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Обери місто та параметри для маршруту</Text>
      <Text style={styles.helperText}>
        Тут ми підберемо локації та маршрут усередині конкретного міста.
      </Text>


      <Text style={styles.subtitle}>Кількість днів</Text>
      <TextInput
        style={styles.input}
        placeholder="Наприклад: 5"
        keyboardType="numeric"
        value={days}
        onChangeText={setDays}
      />

      <Text style={styles.subtitle}>Місто</Text>

      <TextInput
        style={styles.input}
        placeholder="Пошук міста"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {selectedCity && (
        <Text style={styles.selectedCity}>
          📍 Обрано: {selectedCity.name}
        </Text>
      )}

      <View style={styles.card}>
        <Picker
          selectedValue={selectedCityId}
          onValueChange={setSelectedCityId}
        >
          <Picker.Item label="Оберіть місто" value={null} />
          {allCities
            .filter(c =>
              c.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(c => (
              <Picker.Item key={c.id} label={c.name} value={c.id} />
            ))}
        </Picker>
      </View>

      <Text style={styles.subtitle}>Темп подорожі</Text>
      <View style={styles.card}>
        {paceOptions.map(item => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.optionButton,
              pace === item.value && styles.optionButtonActive
            ]}
            onPress={() => setPace(item.value)}
          >
            <Text style={[
              styles.optionText,
              pace === item.value && styles.optionTextActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtitle}>Бюджет</Text>
      <View style={styles.card}>
        {budgetOptions.map(item => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.optionButton,
              budget === item.value && styles.optionButtonActive
            ]}
            onPress={() => setBudget(item.value)}
          >
            <Text style={[
              styles.optionText,
              budget === item.value && styles.optionTextActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtitle}>Тип подорожі</Text>
      <View style={styles.card}>
        {travelTypeOptions.map(item => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.optionButton,
              travelType === item.value && styles.optionButtonActive
            ]}
            onPress={() => setTravelType(item.value)}
          >
            <Text style={[
              styles.optionText,
              travelType === item.value && styles.optionTextActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtitle}>Інтереси</Text>
      <View style={styles.card}>
        {interestOptions.map(item => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.optionButton,
              interests.includes(item.value) && styles.optionButtonActive
            ]}
            onPress={() => toggleInterest(item.value)}
          >
            <Text style={[
              styles.optionText,
              interests.includes(item.value) && styles.optionTextActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Згенерувати маршрут 🚀</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3FDFD",
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B4965",
    marginBottom: 20,
  },
  helperText: {
    color: "#5C677D",
    marginBottom: 18,
    lineHeight: 20,
  },

  subtitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#1B4965",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#D0EFFF",
  },

  card: {
    marginBottom: 10,
  },

  optionButton: {
    backgroundColor: "#F1FAFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#D0EFFF",
  },

  optionButtonActive: {
    backgroundColor: "#1B4965",
    borderColor: "#1B4965",
  },

  optionText: {
    textAlign: "center",
    fontSize: 15,
    color: "#1B4965",
  },

  optionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#1B4965",
    padding: 16,
    borderRadius: 14,
    marginTop: 25,
  },
  selectedCity: {
  marginBottom: 10,
  color: "#1B4965",
  fontWeight: "600",
  fontSize: 14,
},

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  }
});
