import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { TripsContext } from './TripsContext';

export default function MapScreen() {
  const [htmlContent, setHtmlContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trips] = useContext(TripsContext);

  const accessToken = 'pk.eyJ1IjoibGVyZmZmIiwiYSI6ImNtYWlncGpvaTA1N3Myb3I5cmlxazllbDUifQ.awWDk2DDm_ac6LV7hkKAqw';

  useEffect(() => {
    const validTrips = trips.filter(
      (t) => typeof t.latitude === 'number' && typeof t.longitude === 'number'
    );

    if (validTrips.length === 0) {
      setHtmlContent(null);
      setLoading(false);
      return;
    }

    const markersJS = validTrips.map(
      (trip) => `L.marker([${trip.latitude}, ${trip.longitude}]).addTo(map).bindPopup('${trip.city_name}')`
    ).join('\n');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
        <style>
          #map { height: 100vh; width: 100vw; }
          body, html { margin: 0; padding: 0; height: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([${validTrips[0].latitude}, ${validTrips[0].longitude}], 2);
          L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${accessToken}', {
            maxZoom: 18,
            tileSize: 512,
            zoomOffset: -1,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
          }).addTo(map);

          ${markersJS}
        </script>
      </body>
      </html>
    `;

    setHtmlContent(html);
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
      {htmlContent ? (
        <WebView
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          style={{ flex: 1 }}
        />
      ) : (
        <Text style={{ color: '#1B4965' }}>Немає міст з координатами</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAF0F8',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
