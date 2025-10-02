import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/crear-desde-solicitud', async (req, res) => {
  let dpiFrontalPath, dpiReversoPath;
  
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

    console.log('📝 Creando préstamo desde solicitud:', {
      userId,
      solicitudId,
      nombre,
      apellido
    });

    if (!req.files || !req.files.dpiFrontal || !req.files.dpiReverso) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren ambas fotos del DPI (frontal y reverso)'
      });
    }

    const dpiFrontal = req.files.dpiFrontal;
    const dpiReverso = req.files.dpiReverso;

    const uploadDir = path.join(process.cwd(), 'uploads', 'dpi');
    await fs.mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const dpiFrontalName = `dpi-frontal-${userId}-${timestamp}${path.extname(dpiFrontal.name)}`;
    const dpiReversoName = `dpi-reverso-${userId}-${timestamp}${path.extname(dpiReverso.name)}`;
    
    dpiFrontalPath = path.join(uploadDir, dpiFrontalName);
    dpiReversoPath = path.join(uploadDir, dpiReversoName);

    await dpiFrontal.mv(dpiFrontalPath);
    await dpiReverso.mv(dpiReversoPath);

    console.log('📤 Archivos DPI guardados');

    const solicitud = await prisma.solicitudPrestamo.findFirst({
      where: {
        id: parseInt(solicitudId),
        usuarioId: userId,
        estado: 'Aprobada'
      },
      include: {
        articulos: {
          include: {
            tipoArticulo: true
          }
        },
        contrato: true
      }
    });

    console.log('🔍 Solicitud encontrada:', {
      id: solicitud?.id,
      estado: solicitud?.estado,
      tieneContrato: !!solicitud?.contrato
    });

    if (!solicitud) {
      await fs.unlink(dpiFrontalPath).catch(() => {});
      await fs.unlink(dpiReversoPath).catch(() => {});
      
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no está aprobada'
      });
    }

    if (!solicitud.contrato) {
      console.log('⚠️ Solicitud sin contrato, creando contrato...');
      
      const contrato = await prisma.contrato.create({
        data: {
          solicitudId: solicitud.id,
          numeroContrato: `CTR-${new Date().getFullYear()}-${String(solicitud.id).padStart(6, '0')}`,
          contenidoContrato: 'Contrato de préstamo prendario',
          estadoFirma: 'Pendiente'
        }
      });
      
      solicitud.contrato = contrato;
      console.log('✅ Contrato creado:', contrato.id);
    }

    console.log('💾 Iniciando transacción...');

    const resultado = await prisma.$transaction(async (tx) => {
      await tx.usuario.update({
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

      console.log('✅ Usuario actualizado');

      const fechaInicio = new Date();
      const fechaVencimiento = new Date();
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (solicitud.plazoMeses || 1));

      const prestamo = await tx.prestamo.create({
        data: {
          contratoId: solicitud.contrato.id,
          montoPrestado: parseFloat(solicitud.montoSolicitado) || 0,
          tasaInteres: parseFloat(solicitud.tasaInteres) || 0,
          plazoMeses: solicitud.plazoMeses || 1,
          fechaInicio: fechaInicio,
          fechaVencimiento: fechaVencimiento,
          estado: 'Activo',
          saldoPendiente: parseFloat(solicitud.totalAPagar) || parseFloat(solicitud.montoSolicitado) || 0
        }
      });

      console.log('✅ Préstamo creado:', prestamo.id);

      await tx.documento.create({
        data: {
          tipoDocumento: 'Identificacion',
          nombreArchivo: dpiFrontalName,
          rutaArchivo: `/uploads/dpi/${dpiFrontalName}`,
          idRelacionado: parseInt(solicitudId),
          tipoRelacion: 'Solicitud',
          tamanoArchivo: BigInt(dpiFrontal.size),
          tipoMime: dpiFrontal.mimetype
        }
      });

      await tx.documento.create({
        data: {
          tipoDocumento: 'Identificacion',
          nombreArchivo: dpiReversoName,
          rutaArchivo: `/uploads/dpi/${dpiReversoName}`,
          idRelacionado: parseInt(solicitudId),
          tipoRelacion: 'Solicitud',
          tamanoArchivo: BigInt(dpiReverso.size),
          tipoMime: dpiReverso.mimetype
        }
      });

      console.log('✅ Documentos DPI registrados');

      return prestamo;
    });

    console.log('✅ Préstamo creado exitosamente:', resultado.id);

    res.status(201).json({
      success: true,
      message: 'Préstamo creado exitosamente',
      data: {
        prestamoId: resultado.id,
        monto: resultado.montoPrestado,
        estado: resultado.estado,
        fechaInicio: resultado.fechaInicio,
        fechaVencimiento: resultado.fechaVencimiento
      }
    });

  } catch (error) {
    console.error('❌ Error creando préstamo:', error);
    
    if (dpiFrontalPath) await fs.unlink(dpiFrontalPath).catch(() => {});
    if (dpiReversoPath) await fs.unlink(dpiReversoPath).catch(() => {});
    
    res.status(500).json({
      success: false,
      message: 'Error al crear el préstamo',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

export default router;