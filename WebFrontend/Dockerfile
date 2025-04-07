# Usar una imagen base con Node.js más reciente
FROM node:20-alpine

# Crear un directorio de trabajo en el contenedor
WORKDIR /app

# Copiar el proyecto al contenedor
COPY . .

# Instalar dependencias
RUN npm install

# Construir la aplicación para producción
RUN npm run build

# Instalar el servidor estático para servir el frontend
RUN npm install -g serve

# Exponer el puerto donde se ejecutará el servidor web
EXPOSE 3000

# Ejecutar el servidor para servir la aplicación estática
CMD ["serve", "-s", "build", "-l", "3000"]