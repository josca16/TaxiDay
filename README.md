🚖 TaxiDay - TFG de Desarrollo de Aplicaciones Multiplataforma

📚 Descripción del Proyecto

TaxiDay es una aplicación destinada a la gestión de jornadas y carreras de taxistas, facilitando el control de sus actividades diarias. El proyecto está diseñado para ser multiplataforma, contando con aplicaciones tanto para dispositivos móviles como para acceso web.

🌟 Objetivo Principal

El objetivo es crear una plataforma que permita a los taxistas registrar y gestionar sus jornadas laborales y carreras, accediendo a la información tanto desde el móvil como desde la web.

🗂️ Estructura del Proyecto

TaxiDay/
├── Backend/               # Backend en Java (Spring Boot)
│   ├── taxi_day/          # Proyecto Spring Boot
│   └── Dockerfile         # Dockerfile del backend
├── MobileFrontend/        # Frontend móvil (React Native con Expo)
│   ├── src/               # Código fuente de la app móvil
│   └── Dockerfile         # Dockerfile para el móvil
├── WebFrontend/           # Frontend web (React)
│   ├── src/               # Código fuente de la app web
│   └── Dockerfile         # Dockerfile para la web
└── docker-compose.yml     # Orquestación de contenedores
Image

🛠️ Tecnologías Utilizadas

Backend: Java con Spring Boot

Frontend Móvil: React Native con Expo

Frontend Web: React

Base de Datos: MariaDB

Contenedores: Docker y Docker Compose

🐳 Levantar el Proyecto con Docker

Para ejecutar el proyecto completo, asegúrate de tener Docker y Docker Compose instalados.

Comando para iniciar todos los servicios

sudo docker compose up --build

Servicios Disponibles

Frontend Web: http://localhost:3000

Frontend Móvil (Expo Web): http://localhost:19000

Backend (Spring Boot): http://localhost:8080

💡 Decisiones de Arquitectura

Frontend Móvil y Web Separados
Se decidió crear dos frontends independientes (móvil y web) para facilitar el desarrollo y mantener interfaces adaptadas a cada dispositivo.

Ambos frontends se conectan al mismo backend en Spring Boot.

Uso de Docker para el Entorno de Desarrollo
El proyecto se ejecuta completamente en contenedores para garantizar un entorno limpio y replicable.

Los contenedores se crean automáticamente al levantar el entorno, garantizando consistencia y evitando problemas de dependencia.

💻 Próximos Pasos

Integración del backend con el frontend móvil y web.

Implementación de la funcionalidad de registro y gestión de carreras.

Pruebas de integración y ajustes de la interfaz.

📝 Notas Adicionales

Todo el proyecto se gestiona desde Docker, lo que facilita el despliegue en diferentes entornos de desarrollo.

La estructura de carpetas está pensada para mantener la independencia de cada servicio.