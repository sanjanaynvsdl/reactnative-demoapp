import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, Text } from 'react-native';

export default function Index() {
  // Redirect to splash screen
  return <Redirect href="/(screens)/splash-screen" />
}
