import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors } from '../theme/colors';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigation.replace('Home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>TaxiDay</Text>
          <Text style={styles.subtitle}>Tu compañero de viaje</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Introduce tu email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Introduce tu contraseña"
            secureTextEntry
          />

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textMuted,
  },
  form: {
    marginTop: 20,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 20,
  },
});

export default LoginScreen; 