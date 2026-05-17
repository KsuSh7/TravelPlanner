import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from "react-native";

export default function ResultScreen({ route, navigation }) {
  const { data, requestData } = route.params;
  const groupedPlan = (data.plan || []).reduce((groups, item) => {
    const dayKey = item.day || "Без дня";

    if (!groups[dayKey]) {
      groups[dayKey] = [];
    }

    groups[dayKey].push(item);
    return groups;
  }, {});

  if (data.error) {
    return (
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Не вдалося створити маршрут</Text>
          <Text style={styles.title}>Спробуй ще раз</Text>
          <Text style={styles.heroText}>
            {data.message || 'Сталася помилка під час генерації рекомендацій.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Персональна добірка</Text>
        <Text style={styles.title}>Твій маршрут</Text>
        <Text style={styles.heroText}>
          Ми зібрали місця, які найкраще пасують до твого запиту та стилю подорожі.
        </Text>
      </View>

      <Text style={styles.subtitle}>Рекомендовані місця</Text>

      <View style={styles.recommendationsGrid}>
        {data.places?.map((place, index) => (
          <View key={index} style={styles.placeCard}>
            <View style={styles.placeBadge}>
              <Text style={styles.placeBadgeText}>{index + 1}</Text>
            </View>

            <Text style={styles.placeName}>{place.name}</Text>

            <Text style={styles.tagsLabel}>Теги</Text>
            <Text style={styles.placeTags}>
              {place.tags || 'Підібрано під твої інтереси'}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.subtitle}>План подорожі</Text>

      {Object.entries(groupedPlan).map(([day, items]) => (
        <View key={day} style={styles.dayCard}>
          <Text style={styles.dayTitle}>День {day}</Text>

          {items.map((item, index) => (
            <View
              key={`${day}-${index}-${item.time}`}
              style={[
                styles.timelineRow,
                index !== items.length - 1 && styles.timelineRowBorder,
              ]}
            >
              <View style={styles.timeColumn}>
                <Text style={styles.timelineTime}>{item.time}</Text>
              </View>

              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <View style={styles.timelineDot} />
                  <Text style={styles.timelinePlace}>{item.place}</Text>
                </View>

                <Text style={styles.planText}>
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity
        style={styles.saveTripButton}
        onPress={() => navigation.navigate('CreateTripFromRoute', { requestData })}
      >
        <Text style={styles.saveTripButtonText}>Додати маршрут у майбутні подорожі</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3FDFD",
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  heroCard: {
    backgroundColor: "#1B4965",
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
  },
  eyebrow: {
    color: "#BEE9F7",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    fontWeight: "600",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  heroText: {
    marginTop: 10,
    color: "#D9F3FB",
    fontSize: 15,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B4965",
    marginBottom: 12,
  },
  recommendationsGrid: {
    marginBottom: 24,
  },
  placeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D6EEF7",
    shadowColor: "#1B4965",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  placeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E0F7FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  placeBadgeText: {
    color: "#1B4965",
    fontWeight: "700",
    fontSize: 12,
  },
  placeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B4965",
  },
  tagsLabel: {
    marginTop: 10,
    marginBottom: 4,
    color: "#5C677D",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "600",
  },
  placeTags: {
    color: "#355070",
    lineHeight: 20,
    fontSize: 14,
  },
  dayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B4965",
    marginBottom: 12,
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timelineRow: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  timelineRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E6F1F5",
  },
  timeColumn: {
    width: 72,
    paddingRight: 10,
  },
  timelineTime: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF6B6B",
  },
  timelineContent: {
    flex: 1,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B6B",
    marginRight: 10,
  },
  timelinePlace: {
    fontSize: 15,
    fontWeight: "600",
    color: "#355070",
  },
  planText: {
    color: "#1B4965",
    lineHeight: 20,
  },
  saveTripButton: {
    marginTop: 14,
    marginBottom: 24,
    backgroundColor: "#FF6B6B",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveTripButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
