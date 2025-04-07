# Usar una imagen base con Node.js más reciente
FROM node:20-alpine

# Crear un directorio de trabajo en el contenedor
WORKDIR /app

# Instalar Expo CLI globalmente
RUN npm install -g expo-cli

# Copiar el proyecto al contenedor
COPY . .

# Instalar dependencias
RUN npm install

# Exponer puertos para Expo
EXPOSE 19000 19001 19002

# Ejecutar el servidor de desarrollo de Expo en modo web
CMD ["npm", "run", "docker-web"]