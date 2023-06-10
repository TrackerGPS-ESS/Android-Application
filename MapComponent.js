import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Notifications from 'expo-notifications';
import { fetchData } from './api';

const MapComponent = () => {
  const [mapType, setMapType] = useState('satellite');
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [isPointInside, setIsPointInside] = useState(false);
  const [markerCoordinate, setMarkerCoordinate] = useState(null);

  const toggleMapType = () => {
    const newMapType = mapType === 'standard' ? 'satellite' : 'standard';
    setMapType(newMapType);
  };

  useEffect(() => {
    // Fetch the polygon data from the HTTP request
    fetch('https://6480c9ccf061e6ec4d49df73.mockapi.io/polygon')
      .then(response => response.json()) // Parse the response as JSON
      .then(data => {
        const coordinates = data[0].geometry.coordinates[0].map(([longitude, latitude]) => ({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }));
        setPolygonCoordinates(coordinates);
      })
      .catch(error => {
        console.error('Error fetching polygon data:', error);
      });
  }, []);

  useEffect(() => {
    const checkPointInsidePolygon = async (point) => {
      if (polygonCoordinates.length < 3) {
        return false;
      }

      let isInside = false;
      const x = point.latitude;
      const y = point.longitude;

      for (let i = 0, j = polygonCoordinates.length - 1; i < polygonCoordinates.length; j = i++) {
        const xi = polygonCoordinates[i].latitude;
        const yi = polygonCoordinates[i].longitude;
        const xj = polygonCoordinates[j].latitude;
        const yj = polygonCoordinates[j].longitude;

        const intersect =
          yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

        if (intersect) {
          isInside = !isInside;
        }
      }

      return isInside;
    };

    const checkAndNotify = async () => {
      const point = await fetchData();
      const latitude = parseFloat(point[0].latitude);
      const longitude = parseFloat(point[0].longitude);
      const isInside = await checkPointInsidePolygon({ latitude, longitude });
      setIsPointInside(isInside);

      if (isInside) {
        setMarkerCoordinate({ latitude, longitude });
        console.log(isInside);
      } else {
        sendNotification({ latitude, longitude });
        console.log(isInside);
      }
    };

    // Only call checkAndNotify when polygonCoordinates change
    if (polygonCoordinates.length > 0) {
      checkAndNotify();
    }
  }, [polygonCoordinates]);

  const sendNotification = async (point) => {
    try {
      const { granted } = await Notifications.requestPermissionsAsync();

      if (!granted) {
        console.log('Notification permissions not granted!');
        return;
      }

      const notificationContent = {
        title: 'Animal is outside',
        body: `Latitude: ${point.latitude}, Longitude: ${point.longitude}`,
      };

      await Notifications.presentNotificationAsync(notificationContent);
    } catch (error) {
      console.log('Error sending notification:', error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 39.73545,
          longitude: -8.821832,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        mapType={mapType}
      >
        {markerCoordinate && (
          <Marker
            coordinate={markerCoordinate}
            title="Marker"
            description="A marker example."
          />
        )}

        {polygonCoordinates.length > 0 && (
          <Polygon
            coordinates={polygonCoordinates}
            fillColor={isPointInside ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)'}
            strokeColor={isPointInside ? 'green' : 'red'}
          />
        )}
      </MapView>
      <Button title="Toggle Map Type" onPress={toggleMapType} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapComponent;