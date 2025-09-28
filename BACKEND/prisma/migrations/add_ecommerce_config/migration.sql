-- ===============================================
-- Archivo: BACKEND/prisma/migrations/add_ecommerce_config/migration.sql
-- Migración para agregar configuraciones de E-commerce
-- ===============================================

-- Insertar configuraciones predeterminadas de E-commerce
-- Solo si no existen ya (evitar duplicados)

-- ===== CONFIGURACIONES GENERALES =====

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_GENERAL_NOMBRE_TIENDA', 'STRING', 'Freddy Fasbear Store', 'Nombre que aparece en la tienda en línea', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_GENERAL_NOMBRE_TIENDA'
);

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_GENERAL_MONEDA', 'STRING', 'GTQ', 'Código de moneda para mostrar precios', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_GENERAL_MONEDA'
);

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_GENERAL_SIMBOLO_MONEDA', 'STRING', 'Q', 'Símbolo que se muestra antes del precio', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_GENERAL_SIMBOLO_MONEDA'
);

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_GENERAL_PRODUCTOS_POR_PAGINA', 'INTEGER', '12', 'Número de productos que se muestran por página en el catálogo', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_GENERAL_PRODUCTOS_POR_PAGINA'
);

-- ===== MÉTODOS DE PAGO =====

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_PAGOS_EFECTIVO', 'BOOLEAN', 'true', 'Permitir pagos en efectivo al recoger el producto', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_PAGOS_EFECTIVO'
);

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_PAGOS_TRANSFERENCIA', 'BOOLEAN', 'true', 'Permitir pagos por transferencia bancaria', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_PAGOS_TRANSFERENCIA'
);

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_PAGOS_TARJETA', 'BOOLEAN', 'false', 'Permitir pagos con tarjeta de crédito/débito', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_PAGOS_TARJETA'
);

-- ===== CONFIGURACIONES DE ENVÍO =====

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_ENVIOS_COSTO_BASE', 'DECIMAL', '25.00', 'Costo base para envíos dentro de la ciudad', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_ENVIOS_COSTO_BASE'
);

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_ENVIOS_GRATIS_MONTO', 'DECIMAL', '500.00', 'Monto mínimo de compra para envío gratuito', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_ENVIOS_GRATIS_MONTO'
);

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_ENVIOS_TIEMPO_ENTREGA', 'STRING', '2-5 días hábiles', 'Tiempo estimado de entrega para mostrar al cliente', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_ENVIOS_TIEMPO_ENTREGA'
);

-- ===== PROMOCIONES Y DESCUENTOS =====

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_PROMOCIONES_DESCUENTO_TIEMPO', 'BOOLEAN', 'true', 'Aplicar descuentos automáticos según tiempo en inventario', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_PROMOCIONES_DESCUENTO_TIEMPO'
);

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_PROMOCIONES_DIAS_DESCUENTO', 'INTEGER', '30', 'Días que debe estar un producto en inventario antes del descuento', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_PROMOCIONES_DIAS_DESCUENTO'
);

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_PROMOCIONES_PORCENTAJE_DESCUENTO', 'DECIMAL', '10.00', 'Porcentaje de descuento a aplicar tras el tiempo configurado', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_PROMOCIONES_PORCENTAJE_DESCUENTO'
);

-- ===== POLÍTICAS DE LA TIENDA =====

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_POLITICAS_DEVOLUCION', 'INTEGER', '7', 'Días que tiene el cliente para solicitar devolución', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_POLITICAS_DEVOLUCION'
);

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_POLITICAS_GARANTIA', 'INTEGER', '30', 'Días de garantía para productos electrónicos', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_POLITICAS_GARANTIA'
);

-- ===== APARIENCIA DE LA TIENDA =====

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_APARIENCIA_COLOR_PRIMARIO', 'STRING', '#2563eb', 'Color principal de la tienda en línea', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_APARIENCIA_COLOR_PRIMARIO'
);

INSERT INTO parametros_sistema (nombre_parametro, tipo_dato, valor_parametro, descripcion, usuario_modifico, fecha_modificacion, created_at, updated_at)
SELECT 'ECOMMERCE_APARIENCIA_BANNER_TEXTO', 'TEXT', 'Encuentra artículos únicos con precios increíbles', 'Texto que aparece en el banner principal de la tienda', 'admin@system', NOW(), NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM parametros_sistema WHERE nombre_parametro = 'ECOMMERCE_APARIENCIA_BANNER_TEXTO'
);

-- ===== VERIFICACIÓN DE LA MIGRACIÓN =====

-- Verificar que todas las configuraciones fueron insertadas correctamente
DO $$
DECLARE
    config_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO config_count 
    FROM parametros_sistema 
    WHERE nombre_parametro LIKE 'ECOMMERCE_%';
    
    RAISE NOTICE 'Configuraciones de E-commerce insertadas: %', config_count;
    
    IF config_count >= 17 THEN
        RAISE NOTICE '✅ Migración de E-commerce completada exitosamente';
    ELSE
        RAISE WARNING '⚠️ Algunas configuraciones pueden no haberse insertado correctamente';
    END IF;
END $$;

-- ===== ÍNDICES PARA OPTIMIZACIÓN =====

-- Crear índice para búsquedas rápidas de configuraciones E-commerce
CREATE INDEX IF NOT EXISTS idx_parametros_ecommerce 
ON parametros_sistema (nombre_parametro) 
WHERE nombre_parametro LIKE 'ECOMMERCE_%';

-- Crear índice para búsquedas por tipo de dato
CREATE INDEX IF NOT EXISTS idx_parametros_tipo_dato 
ON parametros_sistema (tipo_dato);

-- ===== COMENTARIOS EN LA TABLA =====

COMMENT ON TABLE parametros_sistema IS 'Tabla de parámetros del sistema, incluyendo configuraciones de E-commerce';

-- Agregar comentarios específicos para las configuraciones E-commerce
UPDATE parametros_sistema SET descripcion = CONCAT(descripcion, ' [E-commerce Config]')
WHERE nombre_parametro LIKE 'ECOMMERCE_%' AND descripcion NOT LIKE '%[E-commerce Config]%';