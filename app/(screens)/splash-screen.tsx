import { View, Text, Image } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Animated } from 'react-native';
import React from 'react';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Navigate to location screen after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/(screens)/location-screen');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <View className="flex-1 justify-center items-center bg-primary">
      <Animated.View style={{
        opacity: fadeAnim,
        transform: [{
          scale: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.85, 1],
          }),
        }],
      }}>
        <Image 
          source={require('../../assets/images/zuvees-logo.png')} 
          className="w-56 h-56 mb-4"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-accent text-center mt-4">
          Zuvees Delivery
        </Text>
      </Animated.View>
    </View>
  );
}