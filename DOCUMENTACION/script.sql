-- =====================================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS POSTGRESQL
-- Sistema de Préstamos
-- Fredy Fasbear Industries 
-- =====================================================================

-- Crear base de datos

CREATE DATABASE fredy_fasbear_prestamos 


-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- TIPOS ENUM
-- =====================================================================

CREATE TYPE tipo_usuario_enum AS ENUM ('Cliente', 'Administrador', 'Evaluador', 'Cobrador');
CREATE TYPE estado_enum AS ENUM ('Activo', 'Inactivo');
CREATE TYPE estado_solicitud_enum AS ENUM ('Pendiente', 'Aprobada', 'Rechazada');
CREATE TYPE estado_fisico_enum AS ENUM ('Excelente', 'Bueno', 'Regular', 'Malo');
CREATE TYPE estado_firma_enum AS ENUM ('Pendiente', 'Firmado');
CREATE TYPE estado_prestamo_enum AS ENUM ('Activo', 'Pagado', 'Vencido', 'En_Mora');
CREATE TYPE estado_cuota_enum AS ENUM ('Pendiente', 'Pagado', 'Vencido');
CREATE TYPE tipo_pago_enum AS ENUM ('Transferencia', 'Efectivo', 'Cheque', 'Digital');
CREATE TYPE estado_validacion_enum AS ENUM ('Pendiente', 'Validado', 'Rechazado');
CREATE TYPE estado_producto_enum AS ENUM ('Disponible', 'Vendido', 'Retirado');
CREATE TYPE estado_pedido_enum AS ENUM ('Procesando', 'Enviado', 'Entregado', 'Cancelado');
CREATE TYPE estado_ruta_enum AS ENUM ('Asignada', 'En_Progreso', 'Completada');
CREATE TYPE resultado_visita_enum AS ENUM ('Pago', 'Promesa', 'No_Contacto');
CREATE TYPE tipo_documento_enum AS ENUM ('Foto_Prenda', 'Especificaciones', 'Comprobante', 'Contrato', 'Identificacion');
CREATE TYPE tipo_relacion_enum AS ENUM ('Solicitud', 'Pago', 'Visita', 'Usuario');
CREATE TYPE tipo_dato_enum AS ENUM ('STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE');

-- =====================================================================
-- TABLAS
-- =====================================================================

-- Usuarios
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    direccion TEXT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_usuario tipo_usuario_enum NOT NULL,
    estado estado_enum DEFAULT 'Activo',
    cedula VARCHAR(20) NOT NULL UNIQUE,
    fecha_nacimiento DATE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tipos de artículo
CREATE TABLE tipo_articulo (
    id_tipo_articulo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    porcentaje_min_avaluo NUMERIC(5,2) NOT NULL CHECK (porcentaje_min_avaluo >= 0 AND porcentaje_min_avaluo <= 100),
    porcentaje_max_avaluo NUMERIC(5,2) NOT NULL CHECK (porcentaje_max_avaluo >= porcentaje_min_avaluo),
    requiere_electronico BOOLEAN DEFAULT FALSE,
    estado estado_enum DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Solicitudes de préstamo
CREATE TABLE solicitud_prestamo (
    id_solicitud SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado estado_solicitud_enum DEFAULT 'Pendiente',
    observaciones TEXT,
    fecha_evaluacion TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artículos
CREATE TABLE articulo (
    id_articulo SERIAL PRIMARY KEY,
    id_solicitud INTEGER NOT NULL REFERENCES solicitud_prestamo(id_solicitud) ON DELETE CASCADE ON UPDATE CASCADE,
    id_tipo_articulo INTEGER NOT NULL REFERENCES tipo_articulo(id_tipo_articulo) ON DELETE RESTRICT ON UPDATE CASCADE,
    descripcion TEXT NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    serie VARCHAR(100),
    color VARCHAR(50),
    estado_fisico estado_fisico_enum NOT NULL,
    valor_estimado_cliente NUMERIC(10,2) CHECK (valor_estimado_cliente >= 0),
    especificaciones_tecnicas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Avalúos
CREATE TABLE avaluo (
    id_avaluo SERIAL PRIMARY KEY,
    id_articulo INTEGER NOT NULL REFERENCES articulo(id_articulo) ON DELETE CASCADE ON UPDATE CASCADE,
    id_evaluador INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    valor_comercial NUMERIC(10,2) NOT NULL CHECK (valor_comercial > 0),
    porcentaje_aplicado NUMERIC(5,2) NOT NULL CHECK (porcentaje_aplicado >= 0 AND porcentaje_aplicado <= 100),
    monto_prestamo NUMERIC(10,2) NOT NULL CHECK (monto_prestamo > 0),
    fecha_avaluo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contratos
CREATE TABLE contrato (
    id_contrato SERIAL PRIMARY KEY,
    id_solicitud INTEGER NOT NULL REFERENCES solicitud_prestamo(id_solicitud) ON DELETE CASCADE ON UPDATE CASCADE,
    numero_contrato VARCHAR(50) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_firma TIMESTAMP,
    estado_firma estado_firma_enum DEFAULT 'Pendiente',
    contenido_contrato TEXT NOT NULL,
    hash_firma VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Préstamos
CREATE TABLE prestamo (
    id_prestamo SERIAL PRIMARY KEY,
    id_contrato INTEGER NOT NULL REFERENCES contrato(id_contrato) ON DELETE CASCADE ON UPDATE CASCADE,
    monto_prestado NUMERIC(10,2) NOT NULL CHECK (monto_prestado > 0),
    tasa_interes NUMERIC(5,2) NOT NULL CHECK (tasa_interes >= 0),
    plazo_meses INTEGER NOT NULL CHECK (plazo_meses > 0 AND plazo_meses <= 6),
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado estado_prestamo_enum DEFAULT 'Activo',
    saldo_pendiente NUMERIC(10,2) NOT NULL CHECK (saldo_pendiente >= 0),
    costo_almacenamiento NUMERIC(8,2) DEFAULT 0 CHECK (costo_almacenamiento >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plan de pagos
CREATE TABLE plan_pagos (
    id_plan_pago SERIAL PRIMARY KEY,
    id_prestamo INTEGER NOT NULL REFERENCES prestamo(id_prestamo) ON DELETE CASCADE ON UPDATE CASCADE,
    numero_cuota INTEGER NOT NULL CHECK (numero_cuota > 0),
    fecha_vencimiento DATE NOT NULL,
    monto_cuota NUMERIC(10,2) NOT NULL CHECK (monto_cuota > 0),
    monto_capital NUMERIC(10,2) NOT NULL CHECK (monto_capital >= 0),
    monto_interes NUMERIC(10,2) NOT NULL CHECK (monto_interes >= 0),
    estado estado_cuota_enum DEFAULT 'Pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pagos
CREATE TABLE pago (
    id_pago SERIAL PRIMARY KEY,
    id_prestamo INTEGER NOT NULL REFERENCES prestamo(id_prestamo) ON DELETE RESTRICT ON UPDATE CASCADE,
    monto_pago NUMERIC(10,2) NOT NULL CHECK (monto_pago > 0),
    fecha_pago TIMESTAMP NOT NULL,
    tipo_pago tipo_pago_enum NOT NULL,
    comprobante VARCHAR(255),
    estado_validacion estado_validacion_enum DEFAULT 'Pendiente',
    id_validador INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Productos de la tienda
CREATE TABLE producto_tienda (
    id_producto SERIAL PRIMARY KEY,
    id_articulo INTEGER NOT NULL REFERENCES articulo(id_articulo) ON DELETE CASCADE ON UPDATE CASCADE,
    precio_venta NUMERIC(10,2) NOT NULL CHECK (precio_venta > 0),
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado estado_producto_enum DEFAULT 'Disponible',
    descuento_aplicado NUMERIC(5,2) DEFAULT 0 CHECK (descuento_aplicado >= 0 AND descuento_aplicado <= 100),
    dias_en_inventario INTEGER DEFAULT 0,
    categoria VARCHAR(100) NOT NULL,
    valoracion_promedio NUMERIC(3,2) DEFAULT 0 CHECK (valoracion_promedio >= 0 AND valoracion_promedio <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pedidos
CREATE TABLE pedido (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario_comprador INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_pedido NUMERIC(10,2) NOT NULL CHECK (total_pedido > 0),
    estado_pedido estado_pedido_enum DEFAULT 'Procesando',
    direccion_envio TEXT NOT NULL,
    metodo_pago VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detalle de pedidos
CREATE TABLE detalle_pedido (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL REFERENCES pedido(id_pedido) ON DELETE CASCADE ON UPDATE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES producto_tienda(id_producto) ON DELETE RESTRICT ON UPDATE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario > 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carrito de compras
CREATE TABLE carrito (
    id_carrito SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES producto_tienda(id_producto) ON DELETE CASCADE ON UPDATE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_usuario, id_producto)
);

-- Rutas de cobranza
CREATE TABLE ruta_cobranza (
    id_ruta SERIAL PRIMARY KEY,
    id_cobrador INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    fecha_ruta DATE NOT NULL,
    zona_asignada VARCHAR(200) NOT NULL,
    estado estado_ruta_enum DEFAULT 'Asignada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visitas de cobranza
CREATE TABLE visita_cobranza (
    id_visita SERIAL PRIMARY KEY,
    id_ruta INTEGER NOT NULL REFERENCES ruta_cobranza(id_ruta) ON DELETE CASCADE ON UPDATE CASCADE,
    id_prestamo INTEGER NOT NULL REFERENCES prestamo(id_prestamo) ON DELETE RESTRICT ON UPDATE CASCADE,
    fecha_visita TIMESTAMP NOT NULL,
    resultado resultado_visita_enum NOT NULL,
    monto_cobrado NUMERIC(10,2) DEFAULT 0 CHECK (monto_cobrado >= 0),
    observaciones TEXT,
    ubicacion_gps VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documentos
CREATE TABLE documento (
    id_documento SERIAL PRIMARY KEY,
    tipo_documento tipo_documento_enum NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_relacionado INTEGER NOT NULL,
    tipo_relacion tipo_relacion_enum NOT NULL,
    tamano_archivo BIGINT,
    tipo_mime VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parámetros del sistema
CREATE TABLE parametros_sistema (
    id_parametro SERIAL PRIMARY KEY,
    nombre_parametro VARCHAR(100) NOT NULL UNIQUE,
    valor_parametro TEXT NOT NULL,
    descripcion TEXT,
    tipo_dato tipo_dato_enum NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario_modifico INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios de productos
CREATE TABLE comentario_producto (
    id_comentario SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES producto_tienda(id_producto) ON DELETE CASCADE ON UPDATE CASCADE,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT NOT NULL,
    fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sesiones de usuario para historial
CREATE TABLE sesion_usuario (
    id_sesion UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    ip_inicio INET,
    user_agent TEXT,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP,
    tipo_sesion VARCHAR(20) DEFAULT 'web' CHECK (tipo_sesion IN ('web', 'mobile', 'api')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- ÍNDICES
-- =====================================================================

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_cedula ON usuario(cedula);
CREATE INDEX idx_solicitud_estado ON solicitud_prestamo(estado);
CREATE INDEX idx_prestamo_estado ON prestamo(estado);
CREATE INDEX idx_prestamo_fecha_vencimiento ON prestamo(fecha_vencimiento);
CREATE INDEX idx_pago_fecha ON pago(fecha_pago);
CREATE INDEX idx_producto_estado ON producto_tienda(estado);
CREATE INDEX idx_pedido_estado ON pedido(estado_pedido);

-- =====================================================================
-- TRIGGER BÁSICO (solo uno esencial)
-- =====================================================================

-- Función para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar a las tablas principales
CREATE TRIGGER update_usuario_updated_at BEFORE UPDATE ON usuario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_solicitud_prestamo_updated_at BEFORE UPDATE ON solicitud_prestamo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articulo_updated_at BEFORE UPDATE ON articulo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prestamo_updated_at BEFORE UPDATE ON prestamo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pago_updated_at BEFORE UPDATE ON pago FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_producto_tienda_updated_at BEFORE UPDATE ON producto_tienda FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- DATOS INICIALES
-- =====================================================================

-- Tipos de artículo
INSERT INTO tipo_articulo (nombre, porcentaje_min_avaluo, porcentaje_max_avaluo, requiere_electronico) VALUES
('Autos', 30.00, 50.00, FALSE),
('Celulares', 25.00, 45.00, TRUE),
('Joyas', 40.00, 70.00, FALSE),
('Relojes', 35.00, 60.00, FALSE),
('Diamantes', 50.00, 85.00, FALSE),
('Monedas', 30.00, 55.00, FALSE),
('Electrónicos', 20.00, 40.00, TRUE),
('Herramientas', 25.00, 45.00, FALSE);

-- Usuario administrador
INSERT INTO usuario (nombre, apellido, email, telefono, direccion, tipo_usuario, cedula, password_hash) VALUES
('Fredy', 'Fasbear', 'admin@fredyfasbear.com', '502-1234-5678', 'Oficina Central Fredy Fasbear Industries', 'Administrador', '1234567890', crypt('admin123', gen_salt('bf')));

-- Parámetros básicos
INSERT INTO parametros_sistema (nombre_parametro, valor_parametro, descripcion, tipo_dato, id_usuario_modifico) VALUES
('TASA_INTERES_MENSUAL', '5.0', 'Tasa de interés mensual por defecto', 'DECIMAL', 1),
('PLAZO_MAXIMO_MESES', '6', 'Plazo máximo en meses para préstamos', 'INTEGER', 1),
('COSTO_ALMACENAMIENTO_DIARIO', '2.50', 'Costo diario de almacenamiento', 'DECIMAL', 1),
('NOMBRE_EMPRESA', 'Fredy Fasbear Industries', 'Nombre oficial de la empresa', 'STRING', 1);

-- =====================================================================
-- VISTAS 
-- =====================================================================

-- Préstamos activos
CREATE VIEW vista_prestamos_activos AS
SELECT 
    p.id_prestamo,
    p.monto_prestado,
    p.saldo_pendiente,
    p.fecha_vencimiento,
    u.nombre || ' ' || u.apellido as cliente,
    u.email,
    a.descripcion as articulo
FROM prestamo p
JOIN contrato c ON p.id_contrato = c.id_contrato
JOIN solicitud_prestamo sp ON c.id_solicitud = sp.id_solicitud
JOIN usuario u ON sp.id_usuario = u.id_usuario
JOIN articulo a ON sp.id_solicitud = a.id_solicitud
WHERE p.estado = 'Activo';

-- Productos disponibles
CREATE VIEW vista_productos_disponibles AS
SELECT 
    pt.id_producto,
    pt.precio_venta,
    a.descripcion,
    a.marca,
    a.modelo,
    pt.categoria
FROM producto_tienda pt
JOIN articulo a ON pt.id_articulo = a.id_articulo
WHERE pt.estado = 'Disponible';

-- =====================================================================
-- PERMISOS
-- =====================================================================

CREATE ROLE fasbear_app;
GRANT CONNECT ON DATABASE fredy_fasbear_prestamos TO fasbear_app;
GRANT USAGE ON SCHEMA public TO fasbear_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fasbear_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO fasbear_app;

-- =====================================================================
-- FIN
-- =====================================================================

SELECT 'Base de datos Fredy Fasbear Industries creada' AS mensaje;