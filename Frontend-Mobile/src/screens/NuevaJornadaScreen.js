import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';

const NuevaJornadaScreen = ({ navigation }) => {
  const { currentJornada, carreras, loading, finalizarJornada, cargarCarreras } = useApp();

  useEffect(() => {
    if (currentJornada) {
      cargarCarreras(currentJornada.id);
    }
  }, [currentJornada]);

  const totalGanancias = carreras.reduce((sum, carrera) => sum + carrera.precio, 0);
  const totalKilometros = carreras.reduce((sum, carrera) => sum + carrera.kilometros, 0);

  const handleFinalizarJornada = () => {
    Alert.alert(
      'Finalizar Jornada',
      '¿Estás seguro de que deseas finalizar la jornada actual?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: async () => {
            const success = await finalizarJornada();
            if (success) {
              navigation.navigate('Home');
            }
          },
        },
      ]
    );
  };

  if (!currentJornada) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>No hay una jornada activa</Text>
          <Button
            title="Volver al Inicio"
            onPress={() => navigation.navigate('Home')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información de la Jornada</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="access-time" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Inicio: {new Date(currentJornada.fechaInicio).toLocaleTimeString()}
            </Text>
          </View>
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

        <Card style={styles.carrerasCard}>
          <View style={styles.carrerasHeader}>
            <Text style={styles.cardTitle}>Carreras Realizadas</Text>
            <Button
              title="Nueva Carrera"
              onPress={() => navigation.navigate('NuevaCarrera')}
              style={styles.newButton}
            />
          </View>
          
          <ScrollView style={styles.carrerasList}>
            {carreras.map((carrera) => (
              <View key={carrera.id} style={styles.carreraItem}>
                <View style={styles.carreraMain}>
                  <MaterialIcons name="location-on" size={20} color={colors.primary} />
                  <View style={styles.carreraInfo}>
                    <Text style={styles.carreraText}>
                      {carrera.origen} → {carrera.destino}
                    </Text>
                    <Text style={styles.carreraSubtext}>
                      {carrera.kilometros}km • {new Date(carrera.fecha).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.carreraPrecio}>{carrera.precio.toFixed(2)}€</Text>
              </View>
            ))}
          </ScrollView>
        </Card>

        <Button
          title="Finalizar Jornada"
          variant="danger"
          onPress={handleFinalizarJornada}
          loading={loading}
          style={styles.finalizarButton}
        />
      </ScrollView>
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
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 16,
  },
  carrerasCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
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
  carrerasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  newButton: {
    minWidth: 120,
  },
  carrerasList: {
    maxHeight: 300,
  },
  carreraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  carreraMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  carreraInfo: {
    marginLeft: 8,
    flex: 1,
  },
  carreraText: {
    fontSize: 16,
    color: colors.text,
  },
  carreraSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  carreraPrecio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 16,
  },
  finalizarButton: {
    marginTop: 8,
  },
});

export default NuevaJornadaScreen; 