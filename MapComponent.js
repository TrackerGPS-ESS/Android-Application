import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Notifications from 'expo-notifications';

const MapComponent = () => {
  const mapRef = useRef(null);
  const [mapType, setMapType] = useState('satellite');
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [isPointInside, setIsPointInside] = useState(false);
  const [markerCoordinate, setMarkerCoordinate] = useState();
  const [intervalId, setIntervalId] = useState(null); // Added state variable for interval ID
  const [notificationSent, setNotificationSent] = useState(false);


  const toggleMapType = () => {
    const newMapType = mapType === 'standard' ? 'satellite' : 'standard';
    setMapType(newMapType);
  };

  useEffect(() => {
    if (markerCoordinate) {
      // Zoom into the marker using animateToRegion method
      mapRef.current.animateToRegion({
        latitude: markerCoordinate.latitude,
        longitude: markerCoordinate.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  }, [markerCoordinate]);

  useEffect(() => {
    // Fetch the position data from the HTTP request
    const fetchPositionData = () => {
      fetch('https://6480c9ccf061e6ec4d49df73.mockapi.io/position')
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
          console.log("Data: ", data);
          const { latitude, longitude } = data[0];

          const coordinates = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          };

          setMarkerCoordinate(coordinates);
        })
        .catch(error => {
          console.error('Error fetching position data:', error);
        });
    };

    // Fetch position data initially
    fetchPositionData();

    // Set interval to fetch position data every 5 seconds
    const id = setInterval(fetchPositionData, 5000);
    setIntervalId(id);

    // Clear interval on component unmount
    return () => clearInterval(id);
  }, []);

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
    if (!markerCoordinate) {
      return;
    }
    console.log("Checking coordinates");

    const { latitude, longitude } = markerCoordinate;
    const isInside = await checkPointInsidePolygon({ latitude, longitude });
    setIsPointInside(isInside);

    if (isInside) {
      setNotificationSent(false);

    } else {
      if (!notificationSent) {
        sendNotification({ latitude, longitude });
        setNotificationSent(true);
        console.log("Animal is outside");
      }
    }
  };

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

  useEffect(() => {
    // Call checkAndNotify initially
    checkAndNotify();

    // Set interval to call checkAndNotify every 5 seconds
    const id = setInterval(checkAndNotify, 5000);
    setIntervalId(id);

    // Clear interval on component unmount
    return () => clearInterval(id);
  }, [markerCoordinate, polygonCoordinates]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
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
            title="Animal"
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