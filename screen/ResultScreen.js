import { ScrollView, Text, View, StyleSheet } from "react-native";

export default function ResultScreen({ route }) {
  const { data } = route.params;

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>🌍 Твій маршрут</Text>

      <Text style={styles.subtitle}>Рекомендації</Text>

      {data.recommendations?.map((place, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeCity}>{place.city}</Text>
        </View>
      ))}

      <Text style={styles.subtitle}>Маршрут</Text>

      {data.route?.map((place, index) => (
        <View key={index} style={styles.routeItem}>
          <Text style={styles.routeText}>
            {index + 1}. {place.name}
          </Text>
        </View>
      ))}

      <Text style={styles.subtitle}>AI План подорожі</Text>

      <View style={styles.card}>
        <Text style={styles.planText}>{data.plan}</Text>
      </View>

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
  },

  subtitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#1B4965",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 3,
  },

  placeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B4965",
  },

  placeCity: {
    color: "#5C677D",
  },

  routeItem: {
    marginBottom: 5,
  },

  routeText: {
    color: "#1B4965",
  },

  planText: {
    color: "#1B4965",
    lineHeight: 20,
  },
});