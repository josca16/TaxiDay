import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { colors } from './src/theme/colors';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import NuevaJornadaScreen from './src/screens/NuevaJornadaScreen';
import NuevaCarreraScreen from './src/screens/NuevaCarreraScreen';
import JornadaDetailScreen from './src/screens/JornadaDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="NuevaJornada" 
        component={NuevaJornadaScreen}
        options={{ title: 'Nueva Jornada' }}
      />
      <Stack.Screen 
        name="NuevaCarrera" 
        component={NuevaCarreraScreen}
        options={{ title: 'Nueva Carrera' }}
      />
      <Stack.Screen 
        name="JornadaDetail" 
        component={JornadaDetailScreen}
        options={{ title: 'Detalles de Jornada' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Mi Perfil' }}
      />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor={colors.primary} />
          <AppStack />
        </NavigationContainer>
      </AppProvider>
    </AuthProvider>
  );
} 