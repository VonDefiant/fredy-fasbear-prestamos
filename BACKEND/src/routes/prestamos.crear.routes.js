import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'dpi');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `dpi-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPG, PNG)'));
    }
  }
});

router.post('/crear-desde-solicitud', 
  upload.fields([
    { name: 'dpiFrontal', maxCount: 1 },
    { name: 'dpiReverso', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        solicitudId,
        nombre,
        apellido,
        cedula,
        telefono,
        direccion,
        fechaNacimiento
      } = req.body;

      console.log('Creando préstamo desde solicitud:', {
        userId,
        solicitudId,
        nombre,
        apellido
      });

      const dpiFrontal = req.files['dpiFrontal']?.[0];
      const dpiReverso = req.files['dpiReverso']?.[0];

      if (!dpiFrontal || !dpiReverso) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren ambas fotos del DPI (frontal y reverso)'
        });
      }

      const solicitud = await prisma.solicitudPrestamo.findFirst({
        where: {
          id: parseInt(solicitudId),
          usuarioId: userId,
          estado: 'Aprobada'
        },
        include: {
          articulos: {
            include: {
              tipoArticulo: true,
              avaluo: true
            }
          },
          usuario: true
        }
      });

      if (!solicitud) {
        if (dpiFrontal?.path) await fs.unlink(dpiFrontal.path).catch(() => {});
        if (dpiReverso?.path) await fs.unlink(dpiReverso.path).catch(() => {});
        
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada o no está aprobada'
        });
      }

      await prisma.usuario.update({
        where: { id: userId },
        data: {
          nombre,
          apellido,
          cedula,
          telefono,
          direccion,
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null
        }
      });

      const resultado = await prisma.$transaction(async (prisma) => {
        const numeroContrato = await generarNumeroContrato(prisma);
        
        const contrato = await prisma.contrato.create({
          data: {
            solicitudId: solicitud.id,
            numeroContrato,
            estadoFirma: 'Pendiente',
            contenidoContrato: generarContenidoContrato(solicitud, {
              nombre,
              apellido,
              cedula,
              telefono,
              direccion,
              fechaNacimiento
            }),
            fechaCreacion: new Date()
          }
        });

        const tasaInteres = solicitud.tasaInteres || await obtenerTasaInteresActual(prisma);
        const plazoMeses = solicitud.plazoMeses || 3;
        
        let montoAprobado = 0;
        if (solicitud.montoAutorizado && solicitud.montoAutorizado > 0) {
          montoAprobado = parseFloat(solicitud.montoAutorizado);
        } else if (solicitud.montoSolicitado && solicitud.montoSolicitado > 0) {
          montoAprobado = parseFloat(solicitud.montoSolicitado);
        } else if (solicitud.articulos && solicitud.articulos.length > 0) {
          const primerArticulo = solicitud.articulos[0];
          if (primerArticulo.avaluo && primerArticulo.avaluo.montoPrestamo) {
            montoAprobado = parseFloat(primerArticulo.avaluo.montoPrestamo);
          }
        }

        if (montoAprobado <= 0) {
          throw new Error('No se pudo determinar el monto del préstamo');
        }

        const fechaInicio = new Date();
        const fechaVencimiento = new Date();
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + plazoMeses);

        const totalAPagar = calcularTotalAPagar(montoAprobado, tasaInteres, plazoMeses);

        const prestamo = await prisma.prestamo.create({
          data: {
            id_contrato: contrato.id,
            monto_prestado: montoAprobado,
            tasa_interes: tasaInteres,
            plazo_meses: plazoMeses,
            fecha_inicio: fechaInicio,
            fecha_vencimiento: fechaVencimiento,
            estado: 'Pendiente',
            saldo_pendiente: totalAPagar,
            costo_almacenamiento: 0
          }
        });

        await prisma.documentoAdjunto.createMany({
          data: [
            {
              tipoDocumento: 'Identificacion',
              nombreArchivo: dpiFrontal.filename,
              rutaArchivo: `/uploads/dpi/${dpiFrontal.filename}`,
              idRelacionado: prestamo.id_prestamo,
              tipoRelacion: 'Prestamo',
              tamanoArchivo: BigInt(dpiFrontal.size),
              tipoMime: dpiFrontal.mimetype,
              fechaSubida: new Date()
            },
            {
              tipoDocumento: 'Identificacion',
              nombreArchivo: dpiReverso.filename,
              rutaArchivo: `/uploads/dpi/${dpiReverso.filename}`,
              idRelacionado: prestamo.id_prestamo,
              tipoRelacion: 'Prestamo',
              tamanoArchivo: BigInt(dpiReverso.size),
              tipoMime: dpiReverso.mimetype,
              fechaSubida: new Date()
            }
          ]
        });

        const planPagos = generarPlanPagos(
          montoAprobado,
          tasaInteres,
          plazoMeses,
          fechaInicio,
          solicitud.modalidadPago || 'mensual'
        );

        await prisma.planPagos.createMany({
          data: planPagos.map((pago, index) => ({
            id_prestamo: prestamo.id_prestamo,
            numero_cuota: index + 1,
            fecha_vencimiento: pago.fecha,
            monto_cuota: pago.montoPago,
            monto_capital: pago.capital,
            monto_interes: pago.interes,
            estado: 'Pendiente'
          }))
        });

        await prisma.solicitudPrestamo.update({
          where: { id: solicitud.id },
          data: { 
            estado: 'Completada',
            fechaEvaluacion: new Date()
          }
        });

        return {
          prestamo,
          contrato,
          planPagos
        };
      });

      console.log('Préstamo creado exitosamente:', resultado.prestamo.id_prestamo);

      res.status(201).json({
        success: true,
        message: 'Préstamo creado exitosamente. Está pendiente de aprobación final.',
        data: {
          prestamoId: resultado.prestamo.id_prestamo,
          numeroContrato: resultado.contrato.numeroContrato,
          estado: resultado.prestamo.estado,
          monto: resultado.prestamo.monto_prestado,
          fechaVencimiento: resultado.prestamo.fecha_vencimiento,
          totalAPagar: resultado.prestamo.saldo_pendiente
        }
      });

    } catch (error) {
      console.error('Error creando préstamo:', error);
      
      if (req.files) {
        const files = Object.values(req.files).flat();
        for (const file of files) {
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('Error eliminando archivo:', unlinkError);
          }
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error al crear el préstamo',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
);

async function generarNumeroContrato(prismaClient) {
  const año = new Date().getFullYear();
  const contador = await prismaClient.contrato.count({
    where: {
      fechaCreacion: {
        gte: new Date(`${año}-01-01`),
        lt: new Date(`${año + 1}-01-01`)
      }
    }
  });
  
  return `CTR-${año}-${String(contador + 1).padStart(6, '0')}`;
}

function generarContenidoContrato(solicitud, datosCliente) {
  const monto = solicitud.montoAutorizado || solicitud.montoSolicitado || 0;
  const plazo = solicitud.plazoMeses || 3;
  const tasa = solicitud.tasaInteres || 10;
  const numArticulos = solicitud.articulos?.length || 0;

  return `
CONTRATO DE PRÉSTAMO PRENDARIO

Entre:
- ${datosCliente.nombre} ${datosCliente.apellido}, identificado(a) con DPI ${datosCliente.cedula}
- Dirección: ${datosCliente.direccion}
- Teléfono: ${datosCliente.telefono}

Y Fredy Fasbear Industries

Se establece el presente contrato de préstamo prendario con las siguientes condiciones:

PRIMERA: MONTO DEL PRÉSTAMO
El prestamista otorga un préstamo por la cantidad de Q${monto.toFixed(2)} (${numeroALetras(monto)} QUETZALES).

SEGUNDA: PLAZO
El plazo del préstamo es de ${plazo} ${plazo === 1 ? 'mes' : 'meses'}.

TERCERA: TASA DE INTERÉS
La tasa de interés aplicable es del ${tasa}% mensual.

CUARTA: GARANTÍA PRENDARIA
Como garantía del préstamo, el prestatario entrega ${numArticulos} ${numArticulos === 1 ? 'artículo' : 'artículos'} en prenda.

QUINTA: OBLIGACIONES
El prestatario se compromete a pagar el préstamo en las fechas acordadas según el plan de pagos establecido.

Fecha de emisión: ${new Date().toLocaleDateString('es-GT')}
Lugar: Guatemala

_________________________                    _________________________
Firma del Prestatario                        Firma del Prestamista
  `.trim();
}

function numeroALetras(numero) {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  
  const num = Math.floor(numero);
  
  if (num === 0) return 'CERO';
  if (num === 1) return 'UN';
  if (num < 10) return unidades[num];
  if (num < 100) {
    const dec = Math.floor(num / 10);
    const uni = num % 10;
    return decenas[dec] + (uni > 0 ? ' Y ' + unidades[uni] : '');
  }
  if (num < 1000) {
    const cen = Math.floor(num / 100);
    const resto = num % 100;
    return centenas[cen] + (resto > 0 ? ' ' + numeroALetras(resto) : '');
  }
  if (num < 1000000) {
    const miles = Math.floor(num / 1000);
    const resto = num % 1000;
    return numeroALetras(miles) + ' MIL' + (resto > 0 ? ' ' + numeroALetras(resto) : '');
  }
  
  return num.toString();
}

async function obtenerTasaInteresActual(prismaClient) {
  try {
    const parametro = await prismaClient.parametrosSistema.findFirst({
      where: { nombreParametro: 'tasa_interes_mensual' }
    });
    
    if (parametro && parametro.valorParametro) {
      const valor = parseFloat(parametro.valorParametro);
      if (!isNaN(valor) && valor > 0) {
        return valor;
      }
    }
  } catch (error) {
    console.log('No se pudo obtener tasa de interés de parámetros, usando default');
  }
  
  return 10.0;
}

function calcularTotalAPagar(monto, tasaInteres, plazoMeses) {
  const tasaDecimal = tasaInteres / 100;
  const interes = monto * tasaDecimal * plazoMeses;
  return parseFloat((monto + interes).toFixed(2));
}

function generarPlanPagos(monto, tasaInteres, plazoMeses, fechaInicio, modalidad) {
  const plan = [];
  const tasaDecimal = tasaInteres / 100;
  const interesTotal = monto * tasaDecimal * plazoMeses;
  const totalAPagar = monto + interesTotal;
  
  let numeroPagos;
  let diasEntrePagos;
  
  switch (modalidad) {
    case 'quincenal':
      numeroPagos = plazoMeses * 2;
      diasEntrePagos = 15;
      break;
    case 'semanal':
      numeroPagos = plazoMeses * 4;
      diasEntrePagos = 7;
      break;
    case 'contado':
      numeroPagos = 1;
      diasEntrePagos = plazoMeses * 30;
      break;
    default:
      numeroPagos = plazoMeses;
      diasEntrePagos = 30;
  }
  
  const montoPorPago = totalAPagar / numeroPagos;
  const capitalPorPago = monto / numeroPagos;
  const interesPorPago = interesTotal / numeroPagos;
  
  let saldoPendiente = totalAPagar;
  
  for (let i = 0; i < numeroPagos; i++) {
    const fechaPago = new Date(fechaInicio);
    fechaPago.setDate(fechaPago.getDate() + (diasEntrePagos * (i + 1)));
    
    saldoPendiente -= montoPorPago;
    
    plan.push({
      numeroPago: i + 1,
      fecha: fechaPago,
      capital: parseFloat(capitalPorPago.toFixed(2)),
      interes: parseFloat(interesPorPago.toFixed(2)),
      montoPago: parseFloat(montoPorPago.toFixed(2)),
      saldoPendiente: parseFloat(Math.max(0, saldoPendiente).toFixed(2))
    });
  }
  
  return plan;
}

export default router;