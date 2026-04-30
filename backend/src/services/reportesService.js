const reportesRepository = require('../repositories/reportesRepository');
const excelReportService = require('./excelReportService');

function esFechaValida(valor) {
  if (!valor) return false;
  const fecha = new Date(valor);
  return !Number.isNaN(fecha.getTime());
}

function normalizarFechaSoloDia(valor) {
  return new Date(valor).toISOString().slice(0, 10);
}

function calcularResumen(filas) {
  const totalVentas = filas.reduce((acc, fila) => acc + Number(fila.ventaTotal || 0), 0);
  const costoTotal = filas.reduce((acc, fila) => acc + Number(fila.costoTotal || 0), 0);
  const gananciaTotal = filas.reduce((acc, fila) => acc + Number(fila.ganancia || 0), 0);

  return {
    totalVentas,
    costoTotal,
    gananciaTotal
  };
}

async function obtenerReporteVentas(fechaInicio, fechaFin) {
  if (!esFechaValida(fechaInicio) || !esFechaValida(fechaFin)) {
    return {
      ok: false,
      mensaje: 'Debe seleccionar un rango de fechas válido.'
    };
  }

  const inicio = normalizarFechaSoloDia(fechaInicio);
  const fin = normalizarFechaSoloDia(fechaFin);

  if (inicio > fin) {
    return {
      ok: false,
      mensaje: 'La fecha inicial no puede ser mayor que la fecha final.'
    };
  }

const filas = await reportesRepository.obtenerReporteVentasPorFechas(inicio, fin);

if (!filas || filas.length === 0) {
  return {
    ok: false,
    mensaje: 'No existen datos para generar el reporte en el rango de fechas seleccionado.'
  };
}

const resumen = calcularResumen(filas);
const proveedorMasRentable = calcularProveedorMasRentable(filas);
return {
  ok: true,
  data: filas,
  resumen,
  proveedorMasRentable,
  filtros: {
    fechaInicio: inicio,
    fechaFin: fin
  }
};
}

async function exportarReporteVentasExcel(fechaInicio, fechaFin) {
  const resultado = await obtenerReporteVentas(fechaInicio, fechaFin);

  if (!resultado.ok) {
    return resultado;
  }

  const buffer = await excelReportService.generarExcelReporteVentas({
    filas: resultado.data,
    fechaInicio: resultado.filtros.fechaInicio,
    fechaFin: resultado.filtros.fechaFin,
    resumen: resultado.resumen
  });

  return {
    ok: true,
    buffer,
    fileName: `Reporte_Ventas_${resultado.filtros.fechaInicio}_a_${resultado.filtros.fechaFin}.xlsx`
  };
}
function calcularProveedorMasRentable(filas) {
  const mapa = new Map();

  for (const fila of filas) {
    const proveedor = fila.proveedor || 'Sin proveedor';
    const ganancia = Number(fila.ganancia || 0);

    mapa.set(proveedor, (mapa.get(proveedor) || 0) + ganancia);
  }

  let proveedorMasRentable = {
    proveedor: 'Sin datos',
    ganancia: 0
  };

  for (const [proveedor, ganancia] of mapa.entries()) {
    if (ganancia > proveedorMasRentable.ganancia) {
      proveedorMasRentable = {
        proveedor,
        ganancia
      };
    }
  }

  return proveedorMasRentable;
}
module.exports = {
  obtenerReporteVentas,
  exportarReporteVentasExcel,
  calcularProveedorMasRentable
};