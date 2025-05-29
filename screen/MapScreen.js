import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Text } from 'react-native';
import { TripsContext } from './TripsContext';

export default function MapScreen() {
  const [staticMapUrl, setStaticMapUrl] = useState(null);
  const [validCities, setValidCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trips] = useContext(TripsContext);

  const accessToken = 'pk.eyJ1IjoibGVyZmZmIiwiYSI6ImNtYWlncGpvaTA1N3Myb3I5cmlxazllbDUifQ.awWDk2DDm_ac6LV7hkKAqw';
  const style = 'streets-v11';
  const zoom = 3;

  useEffect(() => {
    const filtered = trips.filter(t => t.latitude && t.longitude);
    setValidCities(filtered);

    if (filtered.length === 0) {
      setStaticMapUrl(null);
      setLoading(false);
      return;
    }

    const markers = filtered
      .map(t => `pin-l+ff0000(${t.longitude},${t.latitude})`)
      .join(',');

    const center = `${filtered[0].longitude},${filtered[0].latitude}`;

    const url = `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${markers}/${center},${zoom}/600x400?access_token=${accessToken}`;

    setStaticMapUrl(url);
    setLoading(false);
  }, [trips]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text>Завантаження карти...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Міста майбутніх подорожей:</Text>
      {validCities.length === 0 ? (
        <Text style={{color: '#1B4965'}}>Немає міст з координатами</Text>
      ) : (
        <>
          {validCities.map((trip, index) => (
            <Text key={index}>{trip.city}</Text>
          ))}
          <Image source={{ uri: staticMapUrl }} style={styles.map} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,backgroundColor: '#CAF0F8', alignItems: 'center', paddingTop: 40 },
  title: { fontSize: 20,color: '#1B4965', fontWeight: 'bold', marginBottom: 10 },
  map: { width: 300, height: 200, marginTop: 20, borderRadius: 10 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

  
  