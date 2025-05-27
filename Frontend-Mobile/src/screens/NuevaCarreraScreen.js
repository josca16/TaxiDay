import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';

const NuevaCarreraScreen = ({ navigation }) => {
  const { agregarCarrera, loading } = useApp();
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    kilometros: '',
    precio: '',
    origenCoords: null,
    destinoCoords: null,
  });
  const [errors, setErrors] = useState({});
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesitan permisos de ubicación para usar esta función');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.origen) newErrors.origen = 'El origen es requerido';
    if (!formData.destino) newErrors.destino = 'El destino es requerido';
    if (!formData.kilometros) newErrors.kilometros = 'Los kilómetros son requeridos';
    if (!formData.precio) newErrors.precio = 'El precio es requerido';
    if (!formData.origenCoords) newErrors.origen = 'Selecciona el punto de origen en el mapa';
    if (!formData.destinoCoords) newErrors.destino = 'Selecciona el punto de destino en el mapa';
    
    if (isNaN(parseFloat(formData.kilometros))) {
      newErrors.kilometros = 'Debe ser un número válido';
    }
    if (isNaN(parseFloat(formData.precio))) {
      newErrors.precio = 'Debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    
    try {
      let [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      const locationName = `${address.street || ''} ${address.name || ''}, ${address.city || ''}`.trim();

      if (!formData.origen) {
        setFormData(prev => ({
          ...prev,
          origen: locationName,
          origenCoords: { latitude, longitude }
        }));
      } else if (!formData.destino) {
        setFormData(prev => ({
          ...prev,
          destino: locationName,
          destinoCoords: { latitude, longitude }
        }));

        // Calcular distancia
        if (formData.origenCoords) {
          const distance = calculateDistance(
            formData.origenCoords.latitude,
            formData.origenCoords.longitude,
            latitude,
            longitude
          );
          setFormData(prev => ({
            ...prev,
            kilometros: distance.toFixed(2)
          }));
        }
      }
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia en km
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const carreraData = {
      ...formData,
      kilometros: parseFloat(formData.kilometros),
      precio: parseFloat(formData.precio),
    };

    const result = await agregarCarrera(carreraData);
    if (result) {
      navigation.goBack();
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const resetPoints = () => {
    setFormData(prev => ({
      ...prev,
      origen: '',
      destino: '',
      origenCoords: null,
      destinoCoords: null,
      kilometros: ''
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {mapRegion && (
          <Card style={styles.mapCard}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={mapRegion}
              onPress={handleMapPress}
            >
              {formData.origenCoords && (
                <Marker
                  coordinate={formData.origenCoords}
                  title="Origen"
                  pinColor="green"
                />
              )}
              {formData.destinoCoords && (
                <Marker
                  coordinate={formData.destinoCoords}
                  title="Destino"
                  pinColor="red"
                />
              )}
            </MapView>
            <Button
              title="Resetear puntos"
              variant="secondary"
              onPress={resetPoints}
              style={styles.resetButton}
            />
          </Card>
        )}

        <Card style={styles.formCard}>
          <Text style={styles.title}>Nueva Carrera</Text>
          
          <Input
            label="Origen"
            value={formData.origen}
            onChangeText={(value) => handleChange('origen', value)}
            placeholder="Toca el mapa para seleccionar origen"
            error={errors.origen}
            editable={false}
          />

          <Input
            label="Destino"
            value={formData.destino}
            onChangeText={(value) => handleChange('destino', value)}
            placeholder="Toca el mapa para seleccionar destino"
            error={errors.destino}
            editable={false}
          />

          <Input
            label="Kilómetros"
            value={formData.kilometros}
            onChangeText={(value) => handleChange('kilometros', value)}
            placeholder="Distancia calculada automáticamente"
            keyboardType="numeric"
            error={errors.kilometros}
          />

          <Input
            label="Precio"
            value={formData.precio}
            onChangeText={(value) => handleChange('precio', value)}
            placeholder="Precio del viaje"
            keyboardType="numeric"
            error={errors.precio}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={styles.button}
            />
            <Button
              title="Guardar"
              onPress={handleSubmit}
              loading={loading}
              style={styles.button}
            />
          </View>
        </Card>
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
    padding: 16,
  },
  mapCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 300,
  },
  formCard: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  resetButton: {
    marginTop: 8,
  },
});

export default NuevaCarreraScreen; 