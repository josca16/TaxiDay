# Usar imagen base con Java y Maven
FROM maven:3.9.6-eclipse-temurin-17

# Instalar curl y unzip
RUN apt-get update && \
    apt-get install -y curl unzip && \
    rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar el proyecto al contenedor
COPY . .

# Construir el proyecto
RUN mvn clean install

# Exponer el puerto
EXPOSE 8080

# Ejecutar la aplicación
CMD ["java", "-jar", "target/taxiday-0.0.1-SNAPSHOT.jar"]