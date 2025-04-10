## 🚖 TaxiDay - TFG de Desarrollo de Aplicaciones Multiplataforma
<<<<<<< HEAD
=======

### 📚 Descripción del Proyecto
>>>>>>> a03ff729a4c6cfaaff15fcc5eb0805d7574ef2da

**TaxiDay** es una aplicación destinada a la gestión de jornadas y carreras de taxistas, facilitando el control de sus actividades diarias. El proyecto está diseñado para ser multiplataforma, contando con aplicaciones tanto para dispositivos móviles como para acceso web.

---

<<<<<<< HEAD
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
=======
### 🌟 Objetivo principal

Crear una plataforma que permita a los taxistas registrarse y gestionar sus jornadas laborales y carreras, accediendo a la información tanto desde el móvil como desde la web.

---

### 🗂️ Estructura del Proyecto
>>>>>>> a03ff729a4c6cfaaff15fcc5eb0805d7574ef2da

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

<<<<<<< HEAD
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
=======
### 🛠️ Tecnologías Utilizadas

- **Backend:** Java con Spring Boot
- **Frontend Móvil:** React Native con Expo
- **Interfaz Web:** React
- **Base de Datos:** MariaDB
- **Contenedores:** Docker y Docker Compose

---

### 🐳 Levantar el Proyecto con Docker
>>>>>>> a03ff729a4c6cfaaff15fcc5eb0805d7574ef2da

Ver logs de un contenedor específico:

<<<<<<< HEAD
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
=======
**Comando para iniciar todos los servicios:**
```bash
sudo docker compose up --build
```

**Servicios Disponibles:**
- Interfaz Web: [http://localhost:3000](http://localhost:3000)
- Frontend Móvil (Expo Web): [http://localhost:19000](http://localhost:19000)
- Backend (Spring Boot): [http://localhost:8080](http://localhost:8080)

---

### 💡 Decisiones de Arquitectura

#### 🧩 Frontend Móvil y Web Separados
Se decidió crear dos frontends independientes (móvil y web) para facilitar el desarrollo y mantener interfaces adaptadas a cada dispositivo.
>>>>>>> a03ff729a4c6cfaaff15fcc5eb0805d7574ef2da

### 🌐 Acceder a Adminer

<<<<<<< HEAD
Abre en tu navegador:
=======
#### 🐋 Uso de Docker para el Entorno de Desarrollo
El proyecto se ejecuta completamente en contenedores para garantizar un entorno limpio y replicable.
>>>>>>> a03ff729a4c6cfaaff15fcc5eb0805d7574ef2da

```text
http://localhost:8082
```

<<<<<<< HEAD
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

=======
---

### 💻 Próximos Pasos

- Integración del backend con el frontend móvil y web.
- Implementación de la funcionalidad de registro y gestión de carreras.
- Pruebas de integración y ajustes de la interfaz.

---

### 📝 Notas Adicionales

- Todo el proyecto se gestiona desde Docker, lo que facilita el despliegue en diferentes entornos de desarrollo.
- La estructura de carpetas está pensada para mantener la independencia de cada servicio.
>>>>>>> a03ff729a4c6cfaaff15fcc5eb0805d7574ef2da

