const ExcelJS = require('exceljs');
const reportesRepository = require('../repositories/reportesRepository');

function validarFechas(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) {
    return 'Debe seleccionar fecha de inicio y fecha final.';
  }

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    return 'Las fechas seleccionadas no son válidas.';
  }

  if (inicio > fin) {
    return 'La fecha de inicio no puede ser mayor que la fecha final.';
  }

  return null;
}

function formatearFecha(fecha) {
  if (!fecha) return '';

  const d = new Date(fecha);

  if (Number.isNaN(d.getTime())) return '';

  return d.toLocaleString('es-NI', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function formatearMoneda(valor) {
  return Number(valor || 0);
}

async function obtenerReporteVentas(fechaInicio, fechaFin) {
  const error = validarFechas(fechaInicio, fechaFin);

  if (error) {
    return {
      ok: false,
      mensaje: error
    };
  }

  const data = await reportesRepository.obtenerReporteVentas(fechaInicio, fechaFin);

  return {
    ok: true,
    data
  };
}

async function obtenerReporteInventario(fechaInicio, fechaFin) {
  const error = validarFechas(fechaInicio, fechaFin);

  if (error) {
    return {
      ok: false,
      mensaje: error
    };
  }

  const data = await reportesRepository.obtenerReporteInventario(fechaInicio, fechaFin);

  return {
    ok: true,
    data
  };
}

async function obtenerReporteClientes(fechaInicio, fechaFin) {
  const error = validarFechas(fechaInicio, fechaFin);

  if (error) {
    return {
      ok: false,
      mensaje: error
    };
  }

  const data = await reportesRepository.obtenerReporteClientes(fechaInicio, fechaFin);

  return {
    ok: true,
    data
  };
}

function aplicarEstiloHoja(worksheet) {
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  worksheet.getRow(1).font = {
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };

  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' }
  };

  worksheet.getRow(1).alignment = {
    vertical: 'middle',
    horizontal: 'center'
  };

  worksheet.columns.forEach((column) => {
    column.width = Math.max(column.width || 15, 18);
  });

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
    });
  });
}

async function generarExcelVentas(fechaInicio, fechaFin) {
  const resultado = await obtenerReporteVentas(fechaInicio, fechaFin);

  if (!resultado.ok) {
    return resultado;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte de Ventas');

  worksheet.columns = [
    { header: 'ID Pedido', key: 'idPedido', width: 14 },
    { header: 'Fecha', key: 'fechaPedido', width: 18 },
    { header: 'Cliente', key: 'cliente', width: 28 },
    { header: 'Empresa', key: 'empresa', width: 24 },
    { header: 'Vendedor', key: 'vendedor', width: 24 },
    { header: 'Estado', key: 'estado', width: 18 },
    { header: 'Monto Total C$', key: 'montoTotal', width: 18 },
    { header: 'Descuento %', key: 'descuentoPorcentaje', width: 16 },
    { header: 'Descuento C$', key: 'descuentoMonto', width: 18 },
    { header: 'Total Final C$', key: 'totalConDescuento', width: 18 },
    { header: 'Moneda', key: 'moneda', width: 14 },
    { header: 'Tipo Cambio', key: 'tipoCambio', width: 16 }
  ];

  resultado.data.forEach((item) => {
    worksheet.addRow({
      ...item,
      fechaPedido: formatearFecha(item.fechaPedido),
      montoTotal: formatearMoneda(item.montoTotal),
      descuentoMonto: formatearMoneda(item.descuentoMonto),
      totalConDescuento: formatearMoneda(item.totalConDescuento)
    });
  });

  aplicarEstiloHoja(worksheet);

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    ok: true,
    buffer,
    filename: `reporte_ventas_${fechaInicio}_${fechaFin}.xlsx`
  };
}

async function generarExcelInventario(fechaInicio, fechaFin) {
  const resultado = await obtenerReporteInventario(fechaInicio, fechaFin);

  if (!resultado.ok) {
    return resultado;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte de Inventario');

  worksheet.columns = [
    { header: 'ID Producto', key: 'idProducto', width: 14 },
    { header: 'Producto', key: 'nombreProducto', width: 28 },
    { header: 'Descripción', key: 'descripcion', width: 32 },
    { header: 'Código', key: 'codigo', width: 18 },
    { header: 'Precio C$', key: 'precio', width: 16 },
    { header: 'Stock', key: 'stock', width: 12 },
    { header: 'Estado Stock', key: 'estadoStock', width: 18 },
    { header: 'Fecha Compra', key: 'fechaDeCompra', width: 18 },
    { header: 'Fecha Vencimiento', key: 'fechaVencimiento', width: 22 },
    { header: 'Proveedor', key: 'proveedor', width: 26 },
    { header: 'Número Proveedor', key: 'numeroProveedor', width: 22 },
    { header: 'Valor Inventario C$', key: 'valorInventario', width: 22 }
  ];

  resultado.data.forEach((item) => {
    worksheet.addRow({
      ...item,
      fechaDeCompra: formatearFecha(item.fechaDeCompra),
      fechaVencimiento: formatearFecha(item.fechaVencimiento),
      precio: formatearMoneda(item.precio),
      valorInventario: formatearMoneda(item.valorInventario)
    });
  });

  aplicarEstiloHoja(worksheet);

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    ok: true,
    buffer,
    filename: `reporte_inventario_${fechaInicio}_${fechaFin}.xlsx`
  };
}

async function generarExcelClientes(fechaInicio, fechaFin) {
  const resultado = await obtenerReporteClientes(fechaInicio, fechaFin);

  if (!resultado.ok) {
    return resultado;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte de Clientes');

  worksheet.columns = [
    { header: 'ID Cliente', key: 'idCliente', width: 14 },
    { header: 'Cliente', key: 'cliente', width: 32 },
    { header: 'Empresa', key: 'empresa', width: 28 },
    { header: 'Teléfono', key: 'telefono', width: 18 },
    { header: 'Departamento', key: 'departamento', width: 24 },
    { header: 'Municipio', key: 'municipio', width: 24 },
    { header: 'Barrio', key: 'barrio', width: 24 },
    { header: 'Dirección', key: 'detalleDireccion', width: 38 },
    { header: 'Cobertura', key: 'cobertura', width: 18 },
    { header: 'Cantidad Pedidos', key: 'cantidadPedidos', width: 20 },
    { header: 'Total Comprado C$', key: 'totalComprado', width: 22 },
    { header: 'Última Compra', key: 'ultimaCompra', width: 18 },
    { header: 'Frecuencia', key: 'frecuencia', width: 22 }
  ];

  resultado.data.forEach((item) => {
    worksheet.addRow({
      ...item,
      totalComprado: formatearMoneda(item.totalComprado),
      ultimaCompra: formatearFecha(item.ultimaCompra)
    });
  });

  aplicarEstiloHoja(worksheet);

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    ok: true,
    buffer,
    filename: `reporte_clientes_${fechaInicio}_${fechaFin}.xlsx`
  };
}

module.exports = {
  obtenerReporteVentas,
  obtenerReporteInventario,
  obtenerReporteClientes,
  generarExcelVentas,
  generarExcelInventario,
  generarExcelClientes
};