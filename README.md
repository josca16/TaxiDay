## 🚖 TaxiDay - TFG de Desarrollo de Aplicaciones Multiplataforma

TaxiDay es una aplicación destinada a la gestión de jornadas y carreras de taxistas, facilitando el control de sus actividades diarias. El proyecto está diseñado para ser multiplataforma, permitiendo el acceso desde la web con diseño responsive adaptado a dispositivos móviles.

---

### 🌟 Objetivo Principal

Crear una plataforma que permita a los taxistas registrar y gestionar sus jornadas laborales y carreras, accediendo a la información desde la web, con especial atención a una experiencia rápida, sencilla y segura.

---

## 🛠️ Tecnologías Utilizadas

* **Backend:** Java con Spring Boot
* **Frontend Web:** React
* **Base de Datos:** MariaDB
* **Contenedores:** Docker y Docker Compose
* **Herramientas:** Adminer para gestión visual de la base de datos

---

## 🗂️ Estructura del Proyecto

```
TaxiDay/
├── Backend/                  # Backend en Java (Spring Boot)
│   ├── src/                 # Código fuente
│   └── Dockerfile           # Dockerfile para el backend
├── WebFrontend/             # Frontend web (React)
│   ├── src/                 # Código fuente del frontend web
│   └── Dockerfile           # Dockerfile para el frontend web
├── init.sql                 # Script para inicializar la base de datos
└── docker-compose.yml       # Orquestación de contenedores
```

---

## ⚙️ Cómo levantar el proyecto

### 1. Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

* [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)

### 2. Clona el repositorio

```bash
git clone https://github.com/josca16/TaxiDay.git
cd TaxiDay
```

### 3. Configura el entorno (si aplica)

Revisa que los puertos en `docker-compose.yml` no estén ocupados. Si necesitas configurar variables de entorno, puedes añadir un archivo `.env`.

### 4. Levanta los servicios

```bash
docker-compose up -d
```

Esto iniciará:

* El backend de Spring Boot
* El frontend de React
* La base de datos MariaDB
* Adminer como interfaz para gestionar la base de datos

### 5. Accede a la aplicación

* **Frontend Web:** [http://localhost](http://localhost:3000)
* **Adminer:** [http://localhost:808](http://localhost:8080)2

### 6. Accede a la base de datos en Adminer

**Credenciales:**

* Servidor: `database`
* Usuario: `root`
* Contraseña: `root`
* Base de datos: `AppTaxiDay`

---

## 🔧 Comandos Útiles

🔄 Reconstruir todos los contenedores:

```bash
docker-compose up -d --build
```

📋 Ver logs de los servicios:

```bash
docker-compose logs
```

📋 Ver logs de un contenedor específico:

```bash
docker-compose logs <nombre_servicio>
```

⛔ Parar todos los contenedores:

```bash
docker-compose down
```

🐚 Acceder a la base de datos desde el contenedor:

```bash
docker exec -it <nombre_contenedor_db> sh
mysql -u root -p
```

---

## 💡 Decisiones de Arquitectura

* Frontend web con diseño responsive para adaptarse a distintos tamaños de pantalla.
* Todo el sistema se ejecuta en contenedores para un entorno limpio, replicable y consistente.
* Adminer está disponible para una visualización cómoda de la base de datos.
* La lógica de negocio y la autenticación están centralizadas en el backend.

---

## 🚀 Funcionalidades Implementadas

* Gestión de Jornadas: Crear, visualizar y cerrar jornadas laborales.
* Gestión de Turnos: Registrar turnos dentro de las jornadas, incluyendo kilómetros iniciales y finales.
* Registro de Carreras: Añadir carreras con detalles como origen, destino y tarifa.
* Autenticación: Sistema de login y registro de usuarios con roles.
* Estadísticas: Visualización de estadísticas diarias y mensuales.
* Soporte Web Adaptativo: Interfaz responsive adaptable a diferentes dispositivos.

---

## ✅ Estado actual

✔️ Backend completamente desarrollado con endpoints REST funcionales.
✔️ Frontend web conectado al backend.
✔️ Base de datos configurada y operativa con acceso a través de Adminer.
✔️ Contenedores Docker listos para despliegue en cualquier entorno.
