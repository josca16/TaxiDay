-- ========================================
--  Tabla: taxista
-- ========================================
CREATE TABLE taxista (
    id_taxista INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    licencia VARCHAR(20) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(15)
);

-- ========================================
--  Tabla: jornada
-- ========================================
CREATE TABLE jornada (
    id_jornada INT AUTO_INCREMENT PRIMARY KEY,
    fecha_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_final DATETIME NULL,
    estado ENUM('activa','cerrada') DEFAULT 'activa',
    id_taxista INT,
    FOREIGN KEY (id_taxista) REFERENCES taxista(id_taxista)
);

-- ========================================
--  Tabla: turno
-- ========================================
CREATE TABLE turno (
    id_turno INT AUTO_INCREMENT PRIMARY KEY,
    km_inicial DOUBLE DEFAULT NULL,
    km_final DOUBLE DEFAULT NULL,
    fecha_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_final DATETIME NULL,
    estado ENUM('abierto','cerrado') DEFAULT 'abierto',
    notas TEXT,
    tiempo_pausado_segundos BIGINT DEFAULT 0,
    estado_pausa ENUM('activo', 'pausado') DEFAULT 'activo',
    inicio_ultima_pausa DATETIME NULL,
    id_jornada INT,
    FOREIGN KEY (id_jornada) REFERENCES jornada(id_jornada)
);

-- ========================================
--  Tabla: carrera
-- ========================================
CREATE TABLE carrera (
    id_carrera INT AUTO_INCREMENT PRIMARY KEY,
    fecha_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    importe_total DOUBLE NOT NULL,
    importe_taximetro DOUBLE DEFAULT 0,
    propina DOUBLE AS (importe_total - importe_taximetro) STORED,
    tipo_pago ENUM('efectivo','tarjeta','otro') DEFAULT 'efectivo',
    es_aeropuerto BOOLEAN DEFAULT FALSE,
    es_emisora BOOLEAN DEFAULT FALSE,
    notas TEXT,
    id_turno INT,
    FOREIGN KEY (id_turno) REFERENCES turno(id_turno)
);
