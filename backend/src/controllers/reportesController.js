const reportesService = require('../services/reportesService');

function enviarExcel(res, resultado) {
  if (!resultado.ok) {
    return res.status(400).json(resultado);
  }

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${resultado.filename}"`
  );

  return res.send(Buffer.from(resultado.buffer));
}

async function reporteVentas(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const resultado = await reportesService.obtenerReporteVentas(fechaInicio, fechaFin);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al generar reporte de ventas.',
      error: error.message
    });
  }
}

async function exportarVentas(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const resultado = await reportesService.generarExcelVentas(fechaInicio, fechaFin);
    return enviarExcel(res, resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al exportar reporte de ventas.',
      error: error.message
    });
  }
}

async function reporteInventario(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const resultado = await reportesService.obtenerReporteInventario(fechaInicio, fechaFin);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al generar reporte de inventario.',
      error: error.message
    });
  }
}

async function exportarInventario(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const resultado = await reportesService.generarExcelInventario(fechaInicio, fechaFin);
    return enviarExcel(res, resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al exportar reporte de inventario.',
      error: error.message
    });
  }
}

async function reporteClientes(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const resultado = await reportesService.obtenerReporteClientes(fechaInicio, fechaFin);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al generar reporte de clientes.',
      error: error.message
    });
  }
}

async function exportarClientes(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const resultado = await reportesService.generarExcelClientes(fechaInicio, fechaFin);
    return enviarExcel(res, resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al exportar reporte de clientes.',
      error: error.message
    });
  }
}

module.exports = {
  reporteVentas,
  exportarVentas,
  reporteInventario,
  exportarInventario,
  reporteClientes,
  exportarClientes
};