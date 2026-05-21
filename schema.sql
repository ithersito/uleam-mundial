-- Esquema de Base de Datos para Predicciones del Mundial de Fútbol 2026 (GYPS - Gana Y Pasa el Semestre)
-- Diseñado para Supabase o PostgreSQL

-- Habilitar extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo VARCHAR(255) NOT NULL,
    correo_institucional VARCHAR(255) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    nivel VARCHAR(10) NOT NULL CHECK (nivel IN ('1ro', '2do', '3ro', '4to', '5to', '6to', '7mo', '8vo')),
    carrera VARCHAR(100) NOT NULL CHECK (carrera IN ('Tecnología de la Información', 'Ingeniería en Software')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Predicciones
CREATE TABLE IF NOT EXISTS predicciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    primer_puesto VARCHAR(100) NOT NULL,
    segundo_puesto VARCHAR(100) NOT NULL,
    tercer_puesto VARCHAR(100) NOT NULL,
    ecuador_posicion INT NOT NULL CHECK (ecuador_posicion >= 1 AND ecuador_posicion <= 48),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar las consultas y búsquedas
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo_institucional);
CREATE INDEX IF NOT EXISTS idx_predicciones_usuario ON predicciones(usuario_id);
