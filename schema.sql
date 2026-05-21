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
    es_admin BOOLEAN NOT NULL DEFAULT FALSE,
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

-- Deshabilitar RLS para acceso desde service_role (API del servidor)
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE predicciones DISABLE ROW LEVEL SECURITY;

-- Usuario administrador (contraseña: Admin2026)
INSERT INTO usuarios (id, nombre_completo, correo_institucional, contrasena_hash, nivel, carrera, es_admin, creado_en)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Administrador GYPS',
    'e0000000000@live.uleam.edu.ec',
    '120659bb9713c70a697927356a3cc152a269681f76f8569c4334e3a2fbf7d72e',
    '1ro',
    'Tecnología de la Información',
    TRUE,
    '2026-05-21T00:00:00.000Z'
) ON CONFLICT (correo_institucional) DO NOTHING;

-- Datos de ejemplo: estudiante Ither Caicedo con su predicción
INSERT INTO usuarios (id, nombre_completo, correo_institucional, contrasena_hash, nivel, carrera, es_admin, creado_en)
VALUES (
    'ecc98a5f-184d-43f1-affe-cc9d7755652a',
    'Ither Eugenio Caicedo rodríguez',
    'e1314031483@live.uleam.edu.ec',
    '0e09af987837310b971beb1485da0987f08ca2b2cc0c306d286b9964a5b4759e',
    '4to',
    'Tecnología de la Información',
    FALSE,
    '2026-05-21T04:31:53.012Z'
) ON CONFLICT (correo_institucional) DO NOTHING;

INSERT INTO predicciones (id, usuario_id, primer_puesto, segundo_puesto, tercer_puesto, ecuador_posicion, creado_en)
VALUES (
    '21577ea5-2efb-484c-b041-050c71985054',
    'ecc98a5f-184d-43f1-affe-cc9d7755652a',
    'Ecuador',
    'Canadá',
    'Estados Unidos',
    1,
    '2026-05-21T04:41:04.680Z'
) ON CONFLICT (usuario_id) DO NOTHING;
