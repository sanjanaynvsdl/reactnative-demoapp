import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

export default function MapScreen() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRiderDetails, setShowRiderDetails] = useState(false);
  const [isRiderAvailable, setIsRiderAvailable] = useState(true);
  const [isOnShift, setIsOnShift] = useState(false);
  const mapRef = useRef<MapView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Pulse animation for loading state
  useEffect(() => {
    if (!location) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
    
    return () => {
      pulseAnim.setValue(1);
    };
  }, [location]);

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
          (newLocation: LocationObject) => {
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
  
  // Function to toggle rider availability status
  const toggleRiderAvailability = () => {
    if (!isOnShift) {
      // Starting shift, rider becomes available
      setIsOnShift(true);
      setIsRiderAvailable(true);
    } else {
      // Toggle availability during shift
      setIsRiderAvailable(!isRiderAvailable);
    }
  };

  if (!location) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-primary">
        <Animated.View style={{
          transform: [{ scale: pulseAnim }]
        }}>
          <View className="items-center justify-center">
            <View className="bg-accent/20 rounded-full p-6 mb-4">
              <MaterialIcons name="location-searching" size={64} color="#631235" />
            </View>
            <ActivityIndicator size="large" color="#631235" style={{ marginBottom: 16 }} />
            <Text className="text-xl text-accent font-semibold text-center">
              {errorMsg || 'Finding your location...'}
            </Text>
            <Text className="text-sm text-gray-600 text-center mt-2 px-8">
              Please make sure your location services are enabled
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar with Rider Dashboard heading */}
      <View className="bg-primary px-4 py-3">
        <Text className="text-2xl font-bold text-accent text-center">
          Rider Details
        </Text>
      </View>
      
      {/* Map Section - Takes about half the screen */}
      <View style={{ height: Dimensions.get('window').height * 0.4 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          provider={PROVIDER_GOOGLE}
        >
          {/* User/Rider Location Marker */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            description="You are here"
          >
            <View className="bg-accent rounded-full p-2">
              <FontAwesome name="motorcycle" size={24} color="#fff" />
            </View>
          </Marker>
        </MapView>
      </View>
      
      {/* Bottom Section - Rider Details */}
      <View className="flex-1 bg-primary p-4 rounded-t-3xl">
        {/* Rider Profile */}
        <View className="flex-row items-center mb-5 bg-white p-4 rounded-xl shadow-sm">
          <View className="w-14 h-14 bg-accent/20 rounded-full items-center justify-center mr-4">
            <FontAwesome name="user" size={28} color="#631235" />
          </View>
          <View>
            <Text className="font-bold text-lg">John Doe</Text>
            <Text className="text-gray-600">ID: R1234 • Scooter #SC-421</Text>
          </View>
          <View className={`ml-auto px-3 py-1 rounded-full ${isRiderAvailable ? 'bg-green-100' : 'bg-amber-100'}`}>
            <Text className={`font-medium ${isRiderAvailable ? 'text-green-600' : 'text-amber-600'}`}>
              {isOnShift 
                ? (isRiderAvailable ? 'Available' : 'Busy') 
                : 'Offline'}
            </Text>
          </View>
        </View>
        
        {/* Delivery Stats */}
        <View className="flex-row justify-between mb-5">
          <View className="bg-white p-3 rounded-xl flex-1 mr-2 items-center">
            <Text className="text-accent font-bold text-xl">8</Text>
            <Text className="text-gray-600 text-xs">Today's Deliveries</Text>
          </View>
          <View className="bg-white p-3 rounded-xl flex-1 ml-2 items-center">
            <Text className="text-accent font-bold text-xl">4.8</Text>
            <Text className="text-gray-600 text-xs">Rating</Text>
          </View>
        </View>
        
        {/* Location Info */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-5">
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
                mapRef.current?.animateToRegion({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }, 1000);
              }}
            >
              <Text className="text-white text-xs">Recenter</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Action Button */}
        <TouchableOpacity 
          className={`py-3 rounded-xl items-center ${isOnShift && isRiderAvailable ? 'bg-amber-500' : (isOnShift ? 'bg-green-600' : 'bg-accent')}`}
          onPress={toggleRiderAvailability}
        >
          <Text className="text-white font-bold text-lg">
            {isOnShift 
              ? (isRiderAvailable ? 'Go Offline' : 'Go Available') 
              : 'Start Delivery Shift'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
