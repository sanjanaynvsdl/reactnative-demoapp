import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import MapboxGL from '@rnmapbox/maps';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

// Initialize Mapbox with access token
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

export default function MapScreen() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRiderDetails, setShowRiderDetails] = useState(false);
  const mapRef = useRef<MapboxGL.MapView>(null);
  
  useEffect(() => {
    let locationSubscription: any = null;

    (async () => {
      try {
        // Get initial location
        let { status } = await Location.getForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let initialLocation = await Location.getCurrentPositionAsync({});
        setLocation(initialLocation);

        // Subscribe to location updates
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5, // minimum change (in meters) between updates
            timeInterval: 2000, // minimum time (in milliseconds) between updates
          },
          (newLocation) => {
            setLocation(newLocation);
          }
        );
      } catch (error) {
        console.error('Error setting up location tracking:', error);
        setErrorMsg('Failed to get location updates');
      }
    })();

    return () => {
      // Clean up subscription when component unmounts
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const toggleRiderDetails = () => {
    setShowRiderDetails(!showRiderDetails);
  };

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <Text className="text-lg text-accent">
          {errorMsg || 'Loading map...'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Mapbox Map View */}
      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Street}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
      >
        <MapboxGL.Camera
          zoomLevel={15}
          centerCoordinate={[location.coords.longitude, location.coords.latitude]}
          animationMode={'flyTo'}
          animationDuration={2000}
        />
        
        {/* User/Rider Location Marker */}
        <MapboxGL.PointAnnotation
          id="riderLocation"
          coordinate={[location.coords.longitude, location.coords.latitude]}
        >
          <View className="bg-accent rounded-full p-2">
            <FontAwesome name="motorcycle" size={24} color="#fff" />
          </View>
        </MapboxGL.PointAnnotation>
      </MapboxGL.MapView>
      
      {/* Header Bar */}
      <View className="absolute top-0 left-0 right-0 z-10 px-4 py-3 bg-white/90 rounded-b-xl flex-row justify-between items-center">
        <Text className="text-xl font-bold text-accent">
          Rider Dashboard
        </Text>
        <TouchableOpacity 
          onPress={toggleRiderDetails}
          className="bg-accent/10 p-2 rounded-full"
        >
          <MaterialIcons name="person" size={24} color="#631235" />
        </TouchableOpacity>
      </View>
      
      {/* Rider Details Panel (conditionally rendered) */}
      {showRiderDetails && (
        <View className="absolute top-16 right-4 z-20 bg-white rounded-xl shadow-lg p-4 w-3/4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-accent">Rider Details</Text>
            <TouchableOpacity onPress={toggleRiderDetails}>
              <MaterialIcons name="close" size={24} color="#631235" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 bg-accent/20 rounded-full items-center justify-center mr-3">
              <FontAwesome name="user" size={24} color="#631235" />
            </View>
            <View>
              <Text className="font-semibold">John Doe</Text>
              <Text className="text-gray-600 text-sm">ID: R1234</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Status:</Text>
            <Text className="font-semibold text-green-600">Available</Text>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Today's Deliveries:</Text>
            <Text className="font-semibold">8</Text>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Vehicle:</Text>
            <Text className="font-semibold">Scooter #SC-421</Text>
          </View>
        </View>
      )}
      
      {/* Bottom Location Info Panel */}
      <View className="absolute bottom-6 left-4 right-4 bg-white p-4 rounded-xl shadow-lg">
        <Text className="text-base font-semibold text-accent mb-2">
          Current Location
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <Text className="text-sm text-gray-700">
            Lat: {location.coords.latitude.toFixed(6)}, Lng: {location.coords.longitude.toFixed(6)}
          </Text>
        </ScrollView>
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-gray-600">
            Updated: {new Date().toLocaleTimeString()}
          </Text>
          <TouchableOpacity
            className="bg-accent py-1 px-3 rounded-lg"
            onPress={() => {
              mapRef.current?.zoomTo(16);
              mapRef.current?.flyTo([location.coords.longitude, location.coords.latitude], 1000);
            }}
          >
            <Text className="text-white text-xs">Recenter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});