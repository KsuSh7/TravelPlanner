import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput
} from "react-native";

export default function QuestionScreen({ navigation }) {
  const [budget, setBudget] = useState("medium");
  const [travelType, setTravelType] = useState("solo");
  const [destination, setDestination] = useState("");
  const [interests, setInterests] = useState([]);

  const toggleInterest = (value) => {
    setInterests((prev) =>
      prev.includes(value)
        ? prev.filter((i) => i !== value)
        : [...prev, value]
    );
  };

  const submit = () => {
    navigation.navigate("Loading", {
      budget,
      travelType,
      destination,
      interests,
      days: 5
    });
  };

  return (
    <ScrollView style={styles.container}>

      
      <Text style={styles.title}>
        Обери параметри для створення маршруту
      </Text>

      <Text style={styles.subtitle}>Бюджет</Text>

      <View style={styles.card}>
        {["low", "medium", "high"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.optionButton,
              budget === item && styles.optionButtonActive
            ]}
            onPress={() => setBudget(item)}
          >
            <Text
              style={[
                styles.optionText,
                budget === item && styles.optionTextActive
              ]}
            >
              {item === "low" && "Мінімальний 💵"}
              {item === "medium" && "Середній 💸"}
              {item === "high" && "Високий 💎"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtitle}>Тип подорожі</Text>

      <View style={styles.card}>
        {["solo", "couple", "family"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.optionButton,
              travelType === item && styles.optionButtonActive
            ]}
            onPress={() => setTravelType(item)}
          >
            <Text
              style={[
                styles.optionText,
                travelType === item && styles.optionTextActive
              ]}
            >
              {item === "solo" && "Наодинці 🧍"}
              {item === "couple" && "Пара ❤️"}
              {item === "family" && "Сімейні 👨‍👩‍👧"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtitle}>Куди їдемо?</Text>

      <View style={styles.card}>
        <TextInput
          placeholder="Наприклад: Rome, Italy"
          value={destination}
          onChangeText={setDestination}
          style={styles.input}
        />
      </View>

      <Text style={styles.subtitle}>Інтереси</Text>

      <View style={styles.card}>
        {["nature", "culture", "nightlife", "history"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.optionButton,
              interests.includes(item) && styles.optionButtonActive
            ]}
            onPress={() => toggleInterest(item)}
          >
            <Text
              style={[
                styles.optionText,
                interests.includes(item) && styles.optionTextActive
              ]}
            >
              {item === "nature" && "Природа 🌿"}
              {item === "culture" && "Культура 🏛️"}
              {item === "nightlife" && "Нічне життя 🎉"}
              {item === "history" && "Історичні памʼятки 📜"}
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

/* 🎨 СТИЛІ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3FDFD",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B4965",
    marginBottom: 5,
  },

  subtitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#1B4965",
    marginBottom: 10,
  },

  helperText: {
    fontSize: 14,
    color: "#5C677D",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
  },

  input: {
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },

  optionButton: {
    backgroundColor: "#F1FAFF",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#D0EFFF",
  },

  optionButtonActive: {
    backgroundColor: "#1B4965",
    borderColor: "#1B4965",
  },

  optionText: {
    textAlign: "center",
    fontSize: 16,
    color: "#1B4965",
    fontWeight: "500",
  },

  optionTextActive: {
    color: "#fff",
  },

  button: {
    backgroundColor: "#1B4965",
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    elevation: 4,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});