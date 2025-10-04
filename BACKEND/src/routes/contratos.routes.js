import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// Middleware para verificar roles
const verificarRol = (req, res, next) => {
  const rolesPermitidos = ['Evaluador', 'Administrador'];
  
  if (!rolesPermitidos.includes(req.user.tipoUsuario)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para realizar esta acción'
    });
  }
  
  next();
};

/**
 * GET /api/contratos/solicitud/:solicitudId
 * Obtiene el contrato de una solicitud (si existe)
 */
router.get('/solicitud/:solicitudId', async (req, res) => {
  const { solicitudId } = req.params;

  try {
    const contrato = await prisma.contrato.findFirst({
      where: { solicitudId: parseInt(solicitudId) },
      include: {
        solicitud: {
          include: {
            usuario: true,
            articulos: {
              include: {
                tipoArticulo: true
              }
            }
          }
        },
        prestamo: {
          include: {
            planPagos: {
              orderBy: { numeroCuota: 'asc' }
            }
          }
        }
      }
    });

    if (!contrato) {
      return res.status(404).json({
        success: false,
        message: 'No existe contrato para esta solicitud'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: contrato.id,
        numeroContrato: contrato.numeroContrato,
        estadoFirma: contrato.estadoFirma,
        fechaCreacion: contrato.fechaCreacion,
        fechaFirma: contrato.fechaFirma,
        contenidoContrato: contrato.contenidoContrato,
        solicitud: {
          id: contrato.solicitud.id,
          montoSolicitado: parseFloat(contrato.solicitud.montoSolicitado),
          plazoMeses: contrato.solicitud.plazoMeses,
          tasaInteres: parseFloat(contrato.solicitud.tasaInteres)
        },
        cliente: {
          nombre: `${contrato.solicitud.usuario.nombre} ${contrato.solicitud.usuario.apellido}`,
          cedula: contrato.solicitud.usuario.cedula,
          email: contrato.solicitud.usuario.email,
          telefono: contrato.solicitud.usuario.telefono
        },
        prestamo: contrato.prestamo ? {
          id: contrato.prestamo.id,
          montoPrestado: parseFloat(contrato.prestamo.montoPrestado),
          saldoPendiente: parseFloat(contrato.prestamo.saldoPendiente),
          fechaVencimiento: contrato.prestamo.fechaVencimiento,
          totalCuotas: contrato.prestamo.planPagos.length
        } : null
      }
    });

  } catch (error) {
    console.error('[CONTRATOS] Error obteniendo contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el contrato'
    });
  }
});

/**
 * POST /api/contratos/generar/:solicitudId
 * Genera un nuevo contrato (solo si no existe)
 */
router.post('/generar/:solicitudId', verificarRol, async (req, res) => {
  const { solicitudId } = req.params;

  console.log(`[CONTRATOS] Generando contrato para solicitud ${solicitudId}`);

  try {
    const solicitud = await prisma.solicitudPrestamo.findUnique({
      where: { id: parseInt(solicitudId) },
      include: {
        usuario: true,
        articulos: {
          include: {
            tipoArticulo: true,
            avaluo: true
          }
        }
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    if (solicitud.estado !== 'Aprobada') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden generar contratos para solicitudes aprobadas'
      });
    }

    const contratoExistente = await prisma.contrato.findFirst({
      where: { solicitudId: parseInt(solicitudId) }
    });

    if (contratoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un contrato para esta solicitud',
        data: {
          contratoId: contratoExistente.id,
          numeroContrato: contratoExistente.numeroContrato,
          estadoFirma: contratoExistente.estadoFirma
        }
      });
    }

    // Generar número de contrato
    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    
    const ultimoContrato = await prisma.contrato.findFirst({
      where: {
        numeroContrato: {
          startsWith: `CONT-${año}${mes}`
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    let numeroSecuencial = 1;
    if (ultimoContrato) {
      const partes = ultimoContrato.numeroContrato.split('-');
      numeroSecuencial = parseInt(partes[partes.length - 1]) + 1;
    }

    const numeroContrato = `CONT-${año}${mes}-${String(numeroSecuencial).padStart(6, '0')}`;

    // Generar contenido del contrato
    const contenidoContrato = generarContenidoContrato(solicitud, numeroContrato, fechaActual);

    // Crear contrato
    const contrato = await prisma.contrato.create({
      data: {
        solicitudId: parseInt(solicitudId),
        numeroContrato: numeroContrato,
        contenidoContrato: contenidoContrato,
        estadoFirma: 'Pendiente',
        fechaCreacion: new Date()
      }
    });

    console.log(`[CONTRATOS] Contrato ${numeroContrato} creado`);

    // Calcular fecha de vencimiento
    const calcularFechaVencimiento = (meses) => {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() + meses);
      return fecha;
    };

    // Crear préstamo
    const prestamo = await prisma.prestamo.create({
      data: {
        contratoId: contrato.id,
        montoPrestado: solicitud.montoSolicitado,
        tasaInteres: solicitud.tasaInteres || 5.0,
        plazoMeses: solicitud.plazoMeses || 3,
        saldoPendiente: solicitud.totalAPagar || solicitud.montoSolicitado,
        fechaInicio: new Date(),
        fechaVencimiento: calcularFechaVencimiento(solicitud.plazoMeses || 3),
        estado: 'Activo'
      }
    });

    console.log(`[CONTRATOS] Préstamo ${prestamo.id} creado`);

    // Generar plan de pagos
    const monto = parseFloat(solicitud.montoSolicitado);
    const tasa = parseFloat(solicitud.tasaInteres || 5.0) / 100;
    const plazoMeses = solicitud.plazoMeses || 3;
    const modalidadPago = solicitud.modalidadPago || 'Mensual';
    
    let numeroCuotas = modalidadPago === 'Semanal' ? plazoMeses * 4 : plazoMeses;
    let diasEntreCuotas = modalidadPago === 'Semanal' ? 7 : 30;
    
    const montoTotal = monto * (1 + (tasa * plazoMeses));
    const montoCuota = montoTotal / numeroCuotas;
    const montoInteresPorCuota = (monto * tasa * plazoMeses) / numeroCuotas;
    const montoCapitalPorCuota = monto / numeroCuotas;

    const cuotasCreadas = [];
    for (let i = 1; i <= numeroCuotas; i++) {
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + (diasEntreCuotas * i));

      const planPago = await prisma.planPagos.create({
        data: {
          prestamoId: prestamo.id,
          numeroCuota: i,
          montoCuota: montoCuota,
          montoCapital: montoCapitalPorCuota,
          montoInteres: montoInteresPorCuota,
          fechaVencimiento: fechaVencimiento,
          estado: 'Pendiente'
        }
      });

      cuotasCreadas.push(planPago);
    }

    console.log(`[CONTRATOS] ${cuotasCreadas.length} cuotas creadas`);

    res.status(201).json({
      success: true,
      message: 'Contrato generado exitosamente',
      data: {
        contrato: {
          id: contrato.id,
          numeroContrato: contrato.numeroContrato,
          estadoFirma: contrato.estadoFirma,
          fechaCreacion: contrato.fechaCreacion
        },
        prestamo: {
          id: prestamo.id,
          montoPrestado: parseFloat(prestamo.montoPrestado),
          tasaInteres: parseFloat(prestamo.tasaInteres),
          plazoMeses: prestamo.plazoMeses
        }
      }
    });

  } catch (error) {
    console.error('[CONTRATOS] Error generando contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el contrato',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/contratos/:contratoId/pdf
 * Genera y descarga el PDF del contrato
 */
router.get('/:contratoId/pdf', async (req, res) => {
  const { contratoId } = req.params;

  try {
    const contrato = await prisma.contrato.findUnique({
      where: { id: parseInt(contratoId) },
      include: {
        solicitud: {
          include: {
            usuario: true,
            articulos: {
              include: {
                tipoArticulo: true
              }
            }
          }
        },
        prestamo: {
          include: {
            planPagos: {
              orderBy: { numeroCuota: 'asc' }
            }
          }
        }
      }
    });

    if (!contrato) {
      return res.status(404).json({
        success: false,
        message: 'Contrato no encontrado'
      });
    }

    // Crear documento PDF
    const doc = new PDFDocument({ 
      size: 'LETTER',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contrato-${contrato.numeroContrato}.pdf`);

    // Pipe del PDF a la respuesta
    doc.pipe(res);

    // Generar contenido del PDF
    generarPDF(doc, contrato);

    // Finalizar el documento
    doc.end();

  } catch (error) {
    console.error('[CONTRATOS] Error generando PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el PDF'
    });
  }
});

// ===== FUNCIONES AUXILIARES =====

function generarContenidoContrato(solicitud, numeroContrato, fechaActual) {
  const cliente = solicitud.usuario;
  const articulos = solicitud.articulos;

  let contenido = `
CONTRATO DE PRÉSTAMO PIGNORATICIO
Número: ${numeroContrato}
Fecha: ${fechaActual.toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}

COMPARECEN:

I. FREDY FASBEAR INDUSTRIES, entidad dedicada al otorgamiento de préstamos pignoraticios.

II. ${cliente.nombre} ${cliente.apellido}, con DPI número ${cliente.cedula || '[No proporcionado]'}, 
con domicilio en ${cliente.direccion || '[No proporcionado]'}.

CLÁUSULAS:

PRIMERA: OBJETO DEL CONTRATO
Se otorga un préstamo por la cantidad de Q ${parseFloat(solicitud.montoSolicitado).toLocaleString('es-GT', { minimumFractionDigits: 2 })}.

SEGUNDA: GARANTÍA
Se entregan en prenda los siguientes artículos:

`;

  articulos.forEach((articulo, index) => {
    contenido += `${index + 1}. ${articulo.descripcion}\n`;
    if (articulo.marca) contenido += `   Marca: ${articulo.marca}\n`;
    if (articulo.modelo) contenido += `   Modelo: ${articulo.modelo}\n`;
    contenido += `   Estado: ${articulo.estadoFisico}\n`;
    contenido += `   Valor Estimado: Q ${parseFloat(articulo.valorEstimadoCliente || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}\n\n`;
  });

  contenido += `
TERCERA: PLAZO Y TASA DE INTERÉS
Plazo: ${solicitud.plazoMeses || 3} meses
Tasa de interés: ${parseFloat(solicitud.tasaInteres || 5.0)}% mensual
Modalidad de pago: ${solicitud.modalidadPago || 'Mensual'}
Monto total a pagar: Q ${parseFloat(solicitud.totalAPagar || solicitud.montoSolicitado).toLocaleString('es-GT', { minimumFractionDigits: 2 })}

CUARTA: OBLIGACIONES DEL PRESTATARIO
a) Realizar los pagos en las fechas acordadas
b) Mantener actualizada su información de contacto
c) No reclamar los artículos hasta saldar el préstamo

QUINTA: VENCIMIENTO
Si no se cumple con los pagos, los artículos empeñados podrán ser vendidos para 
recuperar el monto adeudado después de ${solicitud.plazoMeses || 3} meses.

FIRMA ELECTRÓNICA: ${fechaActual.toISOString()}
`;

  return contenido;
}

function generarPDF(doc, contrato) {
  const solicitud = contrato.solicitud;
  const cliente = solicitud.usuario;
  const prestamo = contrato.prestamo;

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 50;

  // === HEADER CON LOGO ===
  // Logo - Intenta cargar imagen, si no existe usa texto
  try {
    const logoPath = path.join(process.cwd(), 'assets', 'images', 'logo.png');
    // Verifica si existe el archivo
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, margin, margin, { width: 80, height: 50 });
    } else {
      // Fallback a texto si no existe la imagen
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#D4AF37')
         .text('FREDY', margin, margin, { continued: true })
         .fillColor('#1A1A1A')
         .text(' FASBEAR', { continued: false });
      
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#6B7280')
         .text('INDUSTRIES', margin, margin + 18);
    }
  } catch (err) {
    // Si hay error, usar texto
    console.log('[CONTRATOS] Logo no encontrado, usando texto');
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#D4AF37')
       .text('FREDY', margin, margin, { continued: true })
       .fillColor('#1A1A1A')
       .text(' FASBEAR', { continued: false });
    
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#6B7280')
       .text('INDUSTRIES', margin, margin + 18);
  }

  // Línea decorativa debajo del header
  doc.moveTo(margin, margin + 35)
     .lineTo(pageWidth - margin, margin + 35)
     .strokeColor('#D4AF37')
     .lineWidth(2)
     .stroke();

  // Título del documento (centrado)
  doc.moveDown(3);
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .fillColor('#1A1A1A')
     .text('CONTRATO DE PRÉSTAMO', margin, doc.y, { 
       align: 'center',
       width: pageWidth - (margin * 2)
     });
  
  doc.fontSize(20)
     .fillColor('#D4AF37')
     .text('PIGNORATICIO', margin, doc.y + 5, { 
       align: 'center',
       width: pageWidth - (margin * 2)
     });

  // === BOX CON INFO DEL CONTRATO ===
  doc.moveDown(2);
  const boxY = doc.y;
  doc.rect(margin, boxY, pageWidth - (margin * 2), 60)
     .fillAndStroke('#F9FAFB', '#E5E7EB');

  doc.fontSize(10)
     .fillColor('#1A1A1A')
     .font('Helvetica-Bold')
     .text(`No. Contrato: ${contrato.numeroContrato}`, margin + 20, boxY + 15, { continued: false });
  
  doc.font('Helvetica')
     .text(`Fecha de Emisión: ${new Date(contrato.fechaCreacion).toLocaleDateString('es-GT', { 
       year: 'numeric', 
       month: 'long', 
       day: 'numeric' 
     })}`, margin + 20, boxY + 30);
  
  doc.text(`Estado: ${contrato.estadoFirma === 'Firmado' ? 'FIRMADO' : 'PENDIENTE DE FIRMA'}`, 
     margin + 20, boxY + 45);

  // === COMPARECEN ===
  doc.moveDown(3);
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#1B4332')
     .text('COMPARECEN', margin, doc.y);

  doc.moveTo(margin, doc.y + 5)
     .lineTo(margin + 150, doc.y + 5)
     .strokeColor('#1B4332')
     .lineWidth(1.5)
     .stroke();

  doc.moveDown(1);
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#1A1A1A')
     .text('I. EL PRESTAMISTA:', margin, doc.y);
  
  doc.font('Helvetica')
     .text('FREDY FASBEAR INDUSTRIES, entidad dedicada al otorgamiento de préstamos pignoraticios, ' +
           'debidamente autorizada para operar en Guatemala.', margin + 20, doc.y + 5, {
       width: pageWidth - (margin * 2) - 20,
       align: 'justify'
     });

  doc.moveDown(1.5);
  doc.font('Helvetica-Bold')
     .text('II. EL PRESTATARIO:', margin, doc.y);
  
  doc.font('Helvetica')
     .text(`${cliente.nombre} ${cliente.apellido}, de nacionalidad guatemalteca, con DPI número ` +
           `${cliente.cedula || '[No proporcionado]'}, con domicilio en ${cliente.direccion || '[No proporcionado]'}.`, 
           margin + 20, doc.y + 5, {
       width: pageWidth - (margin * 2) - 20,
       align: 'justify'
     });

  // === CLÁUSULAS ===
  doc.moveDown(2);
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#1B4332')
     .text('CLÁUSULAS DEL CONTRATO', margin, doc.y);

  doc.moveTo(margin, doc.y + 5)
     .lineTo(margin + 230, doc.y + 5)
     .strokeColor('#1B4332')
     .lineWidth(1.5)
     .stroke();

  // PRIMERA
  doc.moveDown(1.5);
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#1A1A1A')
     .text('PRIMERA: OBJETO DEL CONTRATO', margin, doc.y);
  
  doc.fontSize(10)
     .font('Helvetica')
     .text(`EL PRESTAMISTA otorga a EL PRESTATARIO un préstamo por la cantidad de `, 
           margin + 20, doc.y + 5, { continued: true })
     .font('Helvetica-Bold')
     .fillColor('#D4AF37')
     .text(`Q ${parseFloat(solicitud.montoSolicitado).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, { continued: true })
     .font('Helvetica')
     .fillColor('#1A1A1A')
     .text(' (Quetzales).', { continued: false });

  // SEGUNDA - GARANTÍA
  doc.moveDown(1.5);
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('SEGUNDA: GARANTÍA', margin, doc.y);
  
  doc.fontSize(10)
     .font('Helvetica')
     .text('EL PRESTATARIO entrega en prenda los siguientes artículos como garantía del préstamo:', 
           margin + 20, doc.y + 5);

  doc.moveDown(0.5);
  
  // Box para artículos
  const articulosStartY = doc.y;
  solicitud.articulos.forEach((articulo, index) => {
    const itemY = doc.y;
    
    // Número del artículo con círculo
    doc.circle(margin + 30, itemY + 5, 8)
       .fillAndStroke('#D4AF37', '#D4AF37');
    doc.fillColor('#FFFFFF')
       .fontSize(8)
       .font('Helvetica-Bold')
       .text(`${index + 1}`, margin + 27, itemY + 2);

    // Detalles del artículo
    doc.fillColor('#1A1A1A')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(articulo.descripcion, margin + 50, itemY);
    
    let detailY = doc.y + 3;
    doc.font('Helvetica').fontSize(9);
    
    if (articulo.marca) {
      doc.fillColor('#6B7280').text(`Marca: `, margin + 50, detailY, { continued: true })
         .fillColor('#1A1A1A').text(articulo.marca);
      detailY = doc.y + 2;
    }
    
    if (articulo.modelo) {
      doc.fillColor('#6B7280').text(`Modelo: `, margin + 50, detailY, { continued: true })
         .fillColor('#1A1A1A').text(articulo.modelo);
      detailY = doc.y + 2;
    }
    
    doc.fillColor('#6B7280').text(`Estado Físico: `, margin + 50, detailY, { continued: true })
       .fillColor('#1A1A1A').text(articulo.estadoFisico);
    detailY = doc.y + 2;
    
    doc.fillColor('#6B7280').text(`Valor Estimado: `, margin + 50, detailY, { continued: true })
       .fillColor('#D4AF37').font('Helvetica-Bold')
       .text(`Q ${parseFloat(articulo.valorEstimadoCliente || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`);
    
    doc.moveDown(1);
  });

  // TERCERA - CONDICIONES
  doc.moveDown(1);
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#1A1A1A')
     .text('TERCERA: PLAZO Y CONDICIONES FINANCIERAS', margin, doc.y);

  const condicionesY = doc.y + 10;
  doc.rect(margin + 20, condicionesY, pageWidth - (margin * 2) - 20, 80)
     .fillAndStroke('#FEF3C7', '#FDE68A');

  doc.fontSize(10).font('Helvetica').fillColor('#1A1A1A');
  let condY = condicionesY + 10;
  
  doc.text(`Plazo del Préstamo: `, margin + 35, condY, { continued: true })
     .font('Helvetica-Bold').text(`${solicitud.plazoMeses || 3} meses`);
  condY += 18;
  
  doc.font('Helvetica').text(`Tasa de Interés: `, margin + 35, condY, { continued: true })
     .font('Helvetica-Bold').text(`${parseFloat(solicitud.tasaInteres || 5.0)}% mensual`);
  condY += 18;
  
  doc.font('Helvetica').text(`Modalidad de Pago: `, margin + 35, condY, { continued: true })
     .font('Helvetica-Bold').text(`${solicitud.modalidadPago || 'Mensual'}`);
  condY += 18;
  
  doc.font('Helvetica').text(`Monto Total a Pagar: `, margin + 35, condY, { continued: true })
     .font('Helvetica-Bold').fillColor('#D4AF37')
     .text(`Q ${parseFloat(solicitud.totalAPagar || solicitud.montoSolicitado).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`);

  // Verificar si necesitamos nueva página
  if (doc.y > pageHeight - 200) {
    doc.addPage();
  }

  // CUARTA - OBLIGACIONES
  doc.moveDown(2);
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#1A1A1A')
     .text('CUARTA: OBLIGACIONES DEL PRESTATARIO', margin, doc.y);

  const obligaciones = [
    'Realizar los pagos puntualmente en las fechas establecidas en el plan de pagos.',
    'Mantener actualizada su información de contacto (teléfono, dirección, email).',
    'No reclamar los artículos empeñados hasta saldar completamente el préstamo.',
    'Notificar cualquier cambio en su situación que pueda afectar el cumplimiento del contrato.'
  ];

  doc.fontSize(10).font('Helvetica').fillColor('#1A1A1A');
  obligaciones.forEach((obligacion, index) => {
    doc.moveDown(0.5);
    doc.text(`${String.fromCharCode(97 + index)}) ${obligacion}`, margin + 20, doc.y, {
      width: pageWidth - (margin * 2) - 20,
      align: 'justify'
    });
  });

  // QUINTA - VENCIMIENTO
  doc.moveDown(1.5);
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('QUINTA: VENCIMIENTO Y RECUPERACIÓN', margin, doc.y);
  
  doc.fontSize(10)
     .font('Helvetica')
     .text('En caso de incumplimiento de pago, EL PRESTAMISTA podrá proceder a la venta de los artículos ' +
           `empeñados para recuperar el monto adeudado después de ${solicitud.plazoMeses || 3} meses contados ` +
           'desde la fecha de inicio del préstamo. Los artículos no redimidos pasarán a ser propiedad de ' +
           'EL PRESTAMISTA.', margin + 20, doc.y + 5, {
       width: pageWidth - (margin * 2) - 20,
       align: 'justify'
     });

  // === PLAN DE PAGOS (NUEVA PÁGINA) ===
  if (prestamo && prestamo.planPagos && prestamo.planPagos.length > 0) {
    doc.addPage();
    
    // Título
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#1B4332')
       .text('PLAN DE PAGOS', margin, margin + 20, { align: 'center' });

    doc.moveTo(margin + 200, doc.y + 5)
       .lineTo(pageWidth - margin - 200, doc.y + 5)
       .strokeColor('#1B4332')
       .lineWidth(2)
       .stroke();

    doc.moveDown(2);

    // Definir anchos de columnas
    const tableStartX = margin;
    const tableWidth = pageWidth - (margin * 2);
    const colWidths = {
      cuota: 80,
      fecha: 140,
      capital: 120,
      interes: 120,
      total: tableWidth - 460
    };

    let tableY = doc.y;

    // HEADER de la tabla
    doc.rect(tableStartX, tableY, tableWidth, 35)
       .fillAndStroke('#1B4332', '#1B4332');

    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#FFFFFF');

    let currentX = tableStartX;
    
    doc.text('Cuota', currentX, tableY + 11, { 
      width: colWidths.cuota, 
      align: 'center' 
    });
    currentX += colWidths.cuota;

    doc.text('Fecha Vencimiento', currentX, tableY + 11, { 
      width: colWidths.fecha, 
      align: 'center' 
    });
    currentX += colWidths.fecha;

    doc.text('Capital', currentX, tableY + 11, { 
      width: colWidths.capital, 
      align: 'center' 
    });
    currentX += colWidths.capital;

    doc.text('Interés', currentX, tableY + 11, { 
      width: colWidths.interes, 
      align: 'center' 
    });
    currentX += colWidths.interes;

    doc.text('Total', currentX, tableY + 11, { 
      width: colWidths.total, 
      align: 'center' 
    });

    tableY += 35;

    // FILAS de cuotas
    doc.fontSize(10).font('Helvetica').fillColor('#1A1A1A');

    prestamo.planPagos.forEach((cuota, index) => {
      const rowHeight = 30;
      
      // Verificar si necesitamos nueva página
      if (tableY + rowHeight > pageHeight - 80) {
        doc.addPage();
        tableY = margin + 50;
        
        // Repetir header en nueva página
        doc.rect(tableStartX, tableY, tableWidth, 35)
           .fillAndStroke('#1B4332', '#1B4332');

        doc.fontSize(11).font('Helvetica-Bold').fillColor('#FFFFFF');
        currentX = tableStartX;
        doc.text('Cuota', currentX, tableY + 11, { width: colWidths.cuota, align: 'center' });
        currentX += colWidths.cuota;
        doc.text('Fecha Vencimiento', currentX, tableY + 11, { width: colWidths.fecha, align: 'center' });
        currentX += colWidths.fecha;
        doc.text('Capital', currentX, tableY + 11, { width: colWidths.capital, align: 'center' });
        currentX += colWidths.capital;
        doc.text('Interés', currentX, tableY + 11, { width: colWidths.interes, align: 'center' });
        currentX += colWidths.interes;
        doc.text('Total', currentX, tableY + 11, { width: colWidths.total, align: 'center' });
        
        tableY += 35;
        doc.fontSize(10).font('Helvetica').fillColor('#1A1A1A');
      }

      // Alternar color de fondo
      if (index % 2 === 0) {
        doc.rect(tableStartX, tableY, tableWidth, rowHeight)
           .fillAndStroke('#F9FAFB', '#E5E7EB');
      } else {
        doc.rect(tableStartX, tableY, tableWidth, rowHeight)
           .stroke('#E5E7EB');
      }

      currentX = tableStartX;
      const textY = tableY + 10;
      
      // Cuota número
      doc.fillColor('#1A1A1A')
         .font('Helvetica-Bold')
         .text(cuota.numeroCuota, currentX, textY, { 
           width: colWidths.cuota, 
           align: 'center' 
         });
      currentX += colWidths.cuota;

      // Fecha
      doc.font('Helvetica')
         .text(
           new Date(cuota.fechaVencimiento).toLocaleDateString('es-GT', {
             year: 'numeric',
             month: 'long',
             day: 'numeric'
           }), 
           currentX, 
           textY, 
           { width: colWidths.fecha, align: 'center' }
         );
      currentX += colWidths.fecha;

      // Capital
      doc.text(
        `Q ${parseFloat(cuota.montoCapital).toFixed(2)}`, 
        currentX, 
        textY, 
        { width: colWidths.capital, align: 'center' }
      );
      currentX += colWidths.capital;

      // Interés
      doc.text(
        `Q ${parseFloat(cuota.montoInteres).toFixed(2)}`, 
        currentX, 
        textY, 
        { width: colWidths.interes, align: 'center' }
      );
      currentX += colWidths.interes;

      // Total
      doc.font('Helvetica-Bold')
         .fillColor('#D4AF37')
         .text(
           `Q ${parseFloat(cuota.montoCuota).toFixed(2)}`, 
           currentX, 
           textY, 
           { width: colWidths.total, align: 'center' }
         );

      tableY += rowHeight;
      doc.font('Helvetica').fillColor('#1A1A1A');
    });

    // Total final
    tableY += 10;
    doc.rect(tableStartX, tableY, tableWidth, 40)
       .fillAndStroke('#FEF3C7', '#FDE68A');

    const totalPrestamo = prestamo.planPagos.reduce((sum, c) => sum + parseFloat(c.montoCuota), 0);
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1A1A1A')
       .text('TOTAL A PAGAR:', tableStartX + 20, tableY + 13, { continued: true })
       .fillColor('#D4AF37')
       .text(`  Q ${totalPrestamo.toFixed(2)}`);
  }

  // === PÁGINA DE FIRMA ===
  doc.addPage();

  doc.moveDown(4);
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor('#1A1A1A')
     .text('ACEPTACIÓN Y FIRMA DEL CONTRATO', margin, doc.y, { align: 'center' });

  doc.moveDown(2);
  doc.fontSize(10)
     .font('Helvetica')
     .text('Al firmar este documento, EL PRESTATARIO declara haber leído, comprendido y aceptado ' +
           'todos los términos y condiciones establecidos en el presente contrato.', margin, doc.y, {
       width: pageWidth - (margin * 2),
       align: 'justify'
     });

  doc.moveDown(4);

  // ÁREA DE FIRMA DEL CLIENTE
  const firmaY = doc.y;
  const firmaBoxWidth = 300;
  const firmaBoxHeight = 120;
  const firmaX = (pageWidth - firmaBoxWidth) / 2;

  // Box para firma
  doc.rect(firmaX, firmaY, firmaBoxWidth, firmaBoxHeight)
     .fillAndStroke('#FFFFFF', '#D4AF37');

  doc.fontSize(9)
     .fillColor('#6B7280')
     .text('FIRMA DEL PRESTATARIO', firmaX + 10, firmaY + 10);

  // Línea para firma
  const lineY = firmaY + firmaBoxHeight - 30;
  doc.moveTo(firmaX + 20, lineY)
     .lineTo(firmaX + firmaBoxWidth - 20, lineY)
     .strokeColor('#1A1A1A')
     .lineWidth(1)
     .stroke();

  // Nombre del cliente debajo de la línea
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#1A1A1A')
     .text(`${cliente.nombre} ${cliente.apellido}`, firmaX + 20, lineY + 5, {
       width: firmaBoxWidth - 40,
       align: 'center'
     });

  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#6B7280')
     .text(`DPI: ${cliente.cedula || '[No proporcionado]'}`, firmaX + 20, lineY + 22, {
       width: firmaBoxWidth - 40,
       align: 'center'
     });

  // Estado de firma
  doc.moveDown(3);
  if (contrato.estadoFirma === 'Firmado') {
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#1B4332')
       .text(`FIRMADO ELECTRÓNICAMENTE`, margin, doc.y, { align: 'center' });
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#6B7280')
       .text(`Fecha: ${new Date(contrato.fechaFirma).toLocaleDateString('es-GT', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
       })}`, margin, doc.y + 5, { align: 'center' });
  } else {
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#92400E')
       .text('PENDIENTE DE FIRMA ELECTRÓNICA', margin, doc.y, { align: 'center' });
  }

  // Footer final
  doc.moveDown(4);
  doc.moveTo(margin, doc.y)
     .lineTo(pageWidth - margin, doc.y)
     .strokeColor('#E5E7EB')
     .lineWidth(1)
     .stroke();

  doc.moveDown(0.5);
  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#6B7280')
     .text('FREDY FASBEAR INDUSTRIES', margin, doc.y, { align: 'center' });
  doc.text('Guatemala, C.A.', margin, doc.y + 2, { align: 'center' });
  doc.text(`Documento generado el ${new Date().toLocaleDateString('es-GT')}`, margin, doc.y + 2, { align: 'center' });
}

export default router;