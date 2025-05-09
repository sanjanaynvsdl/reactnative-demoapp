import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      duration: 2000,
      useNativeDriver: true,
    }).start();
    
    // Navigate to location screen after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/(screens)/location-screen');
      // console.log("hello")
    }, 4000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
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
          shop with zuvees💝
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}