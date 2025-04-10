## 🚖 TaxiDay - TFG de Desarrollo de Aplicaciones Multiplataforma

TaxiDay es una aplicación destinada a la gestión de jornadas y carreras de taxistas, facilitando el control de sus actividades diarias. El proyecto está diseñado para ser multiplataforma, contando con aplicaciones tanto para dispositivos móviles como para acceso web.

---

### 🌟 Objetivo Principal

Crear una plataforma que permita a los taxistas registrar y gestionar sus jornadas laborales y carreras, accediendo a la información tanto desde el móvil como desde la web, con especial atención a una experiencia rápida, sencilla y segura.

---

## 🛠️ Tecnologías Utilizadas

- **Backend:** Java con Spring Boot
- **Frontend Web:** React
- **Frontend Móvil:** React Native con Expo
- **Base de Datos:** MariaDB
- **Contenedores:** Docker y Docker Compose
- **Herramientas:** Adminer para gestión visual de la base de datos

---

## 🗂️ Estructura del Proyecto

```
TaxiDay/
├── Backend/               # Backend en Java (Spring Boot)
│   ├── src/               # Código fuente
│   └── Dockerfile         # Dockerfile para el backend
├── MobileFrontend/        # Frontend móvil (React Native con Expo)
│   └── Dockerfile         # (pendiente de implementación)
├── WebFrontend/           # Frontend web (React)
│   └── Dockerfile         # (pendiente de implementación)
├── init.sql               # Script para inicializar la base de datos
└── docker-compose.yml     # Orquestación de contenedores
```

---

## 🐳 Gestión de Docker para TaxiDay

### 🔄 Comando principal (modo *detached*)

```bash
docker compose up -d --build
```

- ✅ Lanza todos los contenedores en segundo plano
- 🔄 Reconstruye si hay cambios

### 📋 Ver logs de los servicios

```bash
docker compose logs -f
```

Ver logs de un contenedor específico:

```bash
docker compose logs -f spring-boot-app
```

### ⛔ Parar todos los contenedores

```bash
docker compose down
```

### 🐚 Acceder a la base de datos desde el contenedor

```bash
docker exec -it taxiday_db bash
```

Y luego:

```bash
mariadb -uroot -proot
```

---

### 🌐 Acceder a Adminer

Abre en tu navegador:

```text
http://localhost:8082
```

- **Servidor:** `database`
- **Usuario:** `root`
- **Contraseña:** `root`
- **Base de datos:** `AppTaxiDay`

---

## 💡 Decisiones de Arquitectura

- Frontend móvil y web se mantienen separados para ofrecer una mejor experiencia según el dispositivo
- Todo el sistema se ejecuta en contenedores para un entorno limpio, replicable y consistente
- Adminer está disponible para una visualización cómoda de la base de datos

---

## 🚧 Próximos Pasos

- Crear endpoints REST en el backend para iniciar la conexión
- Implementar autenticación y lógica de negocio
- Conectar los frontends al backend
- Añadir sensores de localización GPS en la app móvil

---

## ✅ Estado actual

✔️ Backend operativo y contenedor funcional con acceso a MariaDB y Adminer. Listo para el desarrollo.


