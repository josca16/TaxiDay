import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.origen) newErrors.origen = 'El origen es requerido';
    if (!formData.destino) newErrors.destino = 'El destino es requerido';
    if (!formData.kilometros) newErrors.kilometros = 'Los kilómetros son requeridos';
    if (!formData.precio) newErrors.precio = 'El precio es requerido';
    
    // Validar que kilómetros y precio sean números válidos
    if (isNaN(parseFloat(formData.kilometros))) {
      newErrors.kilometros = 'Debe ser un número válido';
    }
    if (isNaN(parseFloat(formData.precio))) {
      newErrors.precio = 'Debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.formCard}>
          <Text style={styles.title}>Nueva Carrera</Text>
          
          <Input
            label="Origen"
            value={formData.origen}
            onChangeText={(value) => handleChange('origen', value)}
            placeholder="¿Dónde recogiste al cliente?"
            error={errors.origen}
          />

          <Input
            label="Destino"
            value={formData.destino}
            onChangeText={(value) => handleChange('destino', value)}
            placeholder="¿Dónde dejaste al cliente?"
            error={errors.destino}
          />

          <Input
            label="Kilómetros"
            value={formData.kilometros}
            onChangeText={(value) => handleChange('kilometros', value)}
            placeholder="Distancia recorrida"
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
});

export default NuevaCarreraScreen; 