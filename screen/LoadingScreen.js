import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect } from "react";


export default function LoadingScreen({ route, navigation }) {

  useEffect(() => {
    const generate = async () => {
      try {
        const response = await fetch("http://192.168.0.108:5001/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(route.params)
        });

        const data = await response.json();

        navigation.replace("Result", { data });

      } catch (error) {
        console.log("API error:", error);

        navigation.replace("Result", {
          data: {
            error: true,
            message: "Не вдалося згенерувати маршрут 😢"
          }
        });
      }
    };

    generate();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#1B4965" />
        <Text style={styles.title}>Створюємо маршрут...</Text>
        <Text style={styles.subtitle}>
          AI аналізує твої вподобання ✨
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3FDFD",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    elevation: 5,
    width: "100%",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B4965",
    marginTop: 15,
  },

  subtitle: {
    marginTop: 10,
    color: "#5C677D",
    textAlign: "center",
  },
});