-- ========================================
--  Tabla: taxista
-- ========================================
CREATE TABLE taxista (
    idTaxista INT AUTO_INCREMENT PRIMARY KEY,
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
    idJornada INT AUTO_INCREMENT PRIMARY KEY,
    fechaInicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaFinal DATETIME NULL,
    estado ENUM('activa','cerrada') DEFAULT 'activa',
    idTaxista INT,
    FOREIGN KEY (idTaxista) REFERENCES taxista(idTaxista)
);

-- ========================================
--  Tabla: turno
-- ========================================
CREATE TABLE turno (
    idTurno INT AUTO_INCREMENT PRIMARY KEY,
    kmInicial DOUBLE DEFAULT NULL,
    kmFinal DOUBLE DEFAULT NULL,
    fechaInicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaFinal DATETIME NULL,
    estado ENUM('abierto','cerrado') DEFAULT 'abierto',
    idJornada INT,
    FOREIGN KEY (idJornada) REFERENCES jornada(idJornada)
);

-- ========================================
--  Tabla: carrera
-- ========================================
CREATE TABLE carrera (
    idCarrera INT AUTO_INCREMENT PRIMARY KEY,
    fechaInicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    importeTotal DOUBLE NOT NULL,
    importeTaximetro DOUBLE DEFAULT 0,
    tipoPago ENUM('efectivo','tarjeta','bizum') DEFAULT 'efectivo',
    idTurno INT,
    FOREIGN KEY (idTurno) REFERENCES turno(idTurno)
);
