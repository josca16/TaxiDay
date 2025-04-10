# Imagen base con Java y Maven Wrapper soporte
FROM eclipse-temurin:17-jdk-alpine

# Crear directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar configuración de Maven Wrapper y POM
COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .

# Descargar dependencias para acelerar compilación posterior
RUN ./mvnw dependency:go-offline

# Copiar el resto del código fuente
COPY src ./src

# Exponer el puerto en el que Spring Boot se ejecutará
EXPOSE 8081

# Comando para ejecutar Spring Boot
CMD ["./mvnw", "spring-boot:run"]
