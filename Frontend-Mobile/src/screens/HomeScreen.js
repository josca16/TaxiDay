import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { currentJornada, carreras, loading, iniciarJornada } = useApp();

  const totalGanancias = carreras.reduce((sum, carrera) => sum + carrera.precio, 0);
  const totalKilometros = carreras.reduce((sum, carrera) => sum + carrera.kilometros, 0);

  const handleIniciarJornada = async () => {
    const jornada = await iniciarJornada();
    if (jornada) {
      navigation.navigate('NuevaJornada');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>TaxiDay</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <MaterialIcons name="logout" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.welcomeText}>¡Hola, {user?.nombre || 'Taxista'}!</Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.jornadaCard}>
            <Text style={styles.cardTitle}>Jornada Actual</Text>
            {currentJornada ? (
              <>
                <Text style={styles.cardText}>
                  Iniciada: {new Date(currentJornada.fechaInicio).toLocaleTimeString()}
                </Text>
                <Button
                  title="Ver Detalles"
                  onPress={() => navigation.navigate('NuevaJornada')}
                  style={styles.button}
                />
              </>
            ) : (
              <>
                <Text style={styles.cardText}>No hay ninguna jornada activa</Text>
                <Button
                  title="Iniciar Jornada"
                  onPress={handleIniciarJornada}
                  loading={loading}
                  style={styles.button}
                />
              </>
            )}
          </Card>

          <Card style={styles.statsCard}>
            <Text style={styles.cardTitle}>Resumen del Día</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="directions-car" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{carreras.length}</Text>
                <Text style={styles.statLabel}>Carreras</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="euro" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{totalGanancias.toFixed(2)}€</Text>
                <Text style={styles.statLabel}>Ganancias</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="speed" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{totalKilometros.toFixed(1)}km</Text>
                <Text style={styles.statLabel}>Recorrido</Text>
              </View>
            </View>
          </Card>

          <View style={styles.actionButtons}>
            <Button
              title="Historial"
              variant="secondary"
              onPress={() => navigation.navigate('Historial')}
              style={styles.actionButton}
              icon="history"
            />
            <Button
              title="Mi Perfil"
              variant="secondary"
              onPress={() => navigation.navigate('Profile')}
              style={styles.actionButton}
              icon="person"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  jornadaCard: {
    marginBottom: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  button: {
    marginTop: 8,
  },
});

export default HomeScreen; 