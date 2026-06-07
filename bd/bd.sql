-- =====================================
-- BASE DE DATOS MILE VIAJERA
-- =====================================

CREATE DATABASE IF NOT EXISTS mile_viajera;
USE mile_viajera;

-- =====================================
-- TABLA INICIO
-- =====================================

CREATE TABLE inicio (
id_inicio INT AUTO_INCREMENT PRIMARY KEY,
titulo_banner VARCHAR(200) NOT NULL,
subtitulo TEXT,
imagen_banner VARCHAR(255),
video_banner VARCHAR(255)
);

-- =====================================
-- TABLA DESTINOS
-- =====================================

CREATE TABLE destinos (
id_destino INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
ubicacion VARCHAR(150) NOT NULL,
descripcion TEXT NOT NULL,
imagen VARCHAR(255) NOT NULL
);

-- =====================================
-- TABLA GALERIA
-- =====================================

CREATE TABLE galeria (
id_imagen INT AUTO_INCREMENT PRIMARY KEY,
titulo VARCHAR(100) NOT NULL,
descripcion TEXT,
ruta_imagen VARCHAR(255) NOT NULL
);

-- =====================================
-- TABLA BLOG
-- =====================================

CREATE TABLE blog (
id_blog INT AUTO_INCREMENT PRIMARY KEY,
titulo VARCHAR(200) NOT NULL,
contenido TEXT NOT NULL,
imagen VARCHAR(255),
fecha_publicacion DATE
);

-- =====================================
-- TABLA CONTACTO
-- =====================================

CREATE TABLE contacto (
id_contacto INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
correo VARCHAR(150) NOT NULL,
asunto VARCHAR(200) NOT NULL,
mensaje TEXT NOT NULL,
fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- TABLA REDES SOCIALES
-- =====================================

CREATE TABLE redes_sociales (
id_red INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(50) NOT NULL,
url VARCHAR(255) NOT NULL,
icono VARCHAR(100)
);

-- =====================================
-- TABLA ADMINISTRADOR
-- =====================================

CREATE TABLE administrador (
id_admin INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
correo VARCHAR(150) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL
);

-- =====================================
-- DATOS INICIALES
-- =====================================

INSERT INTO administrador (nombre, correo, password)
VALUES
('Gisella Sanchez', '[gisellascntr@gmail.com](mailto:gisellascntr@gmail.com)', '123456');

INSERT INTO inicio
(titulo_banner, subtitulo, imagen_banner, video_banner)
VALUES
(
'Descubre Colombia con Mile Viajera',
'Explora destinos únicos, cultura, naturaleza y experiencias inolvidables.',
'banner.jpg',
'video.mp4'
);

INSERT INTO destinos
(nombre, ubicacion, descripcion, imagen)
VALUES
(
'Murillo',
'Tolima, Colombia',
'Destino rodeado de paisajes naturales y cercanía al Parque Nacional Natural Los Nevados.',
'murillo.jpg'
),
(
'Huila',
'Huila, Colombia',
'Región reconocida por el Desierto de la Tatacoa y su riqueza cultural.',
'huila.jpg'
),
(
'Valle del Cauca',
'Valle del Cauca, Colombia',
'Destino turístico destacado por su cultura, gastronomía y atractivos naturales.',
'valle.jpg'
);

INSERT INTO redes_sociales
(nombre, url, icono)
VALUES
('Facebook', 'https://facebook.com/AscSan', 'facebook'),
('Instagram', 'https://www.instagram.com/mile.viajera', 'instagram'),