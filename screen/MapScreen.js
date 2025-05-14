
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Text } from 'react-native';

const getUserCities = async () => {
  return [
    { city: 'Lviv', latitude: 49.8397, longitude: 24.0297 },
    { city: 'Kyiv', latitude: 50.4547, longitude: 30.5238 },
    { city: 'Odesa', latitude: 46.4825, longitude: 30.7233 },
  ];
};

export default function MapScreen() {
  const [cities, setCities] = useState(null);

  const accessToken = 'pk.eyJ1IjoibGVyZmZmIiwiYSI6ImNtYWlncGpvaTA1N3Myb3I5cmlxazllbDUifQ.awWDk2DDm_ac6LV7hkKAqw';
  const style = 'streets-v11';
  const zoom = 4;

  useEffect(() => {
    const loadCities = async () => {
      const data = await getUserCities();
      setCities(data);
    };
    loadCities();
  }, []);

  if (!cities) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text>Завантаження міст...</Text>
      </View>
    );
  }

  const markers = cities
    .map(city => `pin-l+ff0000(${city.longitude},${city.latitude})`)
    .join(',');

  const center = `${cities[0].longitude},${cities[0].latitude}`;

  const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${markers}/${center},${zoom}/600x400?access_token=${accessToken}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Міста майбутніх подорожей:</Text>
      {cities.map((c, i) => (
        <Text key={i}>{c.city}</Text>
      ))}
      <Image source={{ uri: staticMapUrl }} style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 40 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  map: { width: 300, height: 200, marginTop: 20 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
