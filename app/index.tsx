import { Redirect } from 'expo-router';


export default function Index() {
  // Redirect to splash screen
  return <Redirect href="/(screens)/splash-screen" />
}
