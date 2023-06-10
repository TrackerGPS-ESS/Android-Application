import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapComponent from './MapComponent';
import * as Notifications from 'expo-notifications';
import { fetchData } from './api';

export default function App() {

  

  return <MapComponent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});