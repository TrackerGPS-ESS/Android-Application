import React, { useState } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MapComponent = () => {
  const [mapType, setMapType] = useState('standard');

  const toggleMapType = () => {
    const newMapType = mapType === 'standard' ? 'satellite' : 'standard';
    setMapType(newMapType);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 51.505,
          longitude: -0.09,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        mapType={mapType}
      >
        <Marker
          coordinate={{ latitude: 51.505, longitude: -0.09 }}
          title="Marker"
          description="A marker example."
        />
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