import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState } from 'react';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const requestLocationPermission = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        // Permission granted, navigate to map screen
        router.replace('/(screens)/map-screen');
      } else {
        // Permission denied, show error or stay on same screen
        setLoading(false);
        alert('Location permission is required to use this app');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary p-6">
      <View className="flex-1 justify-between">
        <View className="items-center mt-12">
          <Text className="text-3xl font-bold text-accent mb-6">Enable Location</Text>
          
          <Text className="text-lg text-center mb-8 text-gray-700">
            We need your location to show you on the map and track your deliveries in real-time.
          </Text>
          
          <View className="items-center justify-center rounded-full bg-accent/10 w-40 h-40 mb-8">
            <MaterialIcons name="location-on" size={80} color="#631235" />
          </View>
          
          <Text className="text-base text-center mb-12 text-gray-700">
            Your location data is only used while you are actively using the app and will not be stored.
          </Text>
        </View>
        
        <Pressable 
          className={`py-4 rounded-xl border-2 border-accent ${loading ? 'opacity-70' : ''}`}
          onPress={requestLocationPermission}
          disabled={loading}
        >
          <Text className="text-accent font-semibold text-lg text-center">
            {loading ? 'Requesting Access...' : 'Grant Location Access'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}