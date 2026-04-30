const reportesService = require('../services/reportesService');

async function obtenerReporteVentas(req, res) {
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
      mensaje: 'Error al generar el reporte.',
      error: error.message
    });
  }
}

async function exportarReporteVentasExcel(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const resultado = await reportesService.exportarReporteVentasExcel(fechaInicio, fechaFin);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${resultado.fileName}"`
    );

    res.send(resultado.buffer);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al exportar el reporte a Excel.',
      error: error.message
    });
  }
}

module.exports = {
  obtenerReporteVentas,
  exportarReporteVentasExcel
};