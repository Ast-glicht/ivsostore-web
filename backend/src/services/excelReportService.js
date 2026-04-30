const ExcelJS = require('exceljs');

function formatearFecha(valor) {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha;
}

async function generarExcelReporteVentas({ filas, fechaInicio, fechaFin, resumen }) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte Ventas');

 worksheet.columns = [
  { header: 'ID Pedido', key: 'idPedido', width: 12 },
  { header: 'Fecha Pedido', key: 'fechaPedido', width: 20 },
  { header: 'Cliente', key: 'cliente', width: 28 },
  { header: 'Vendedor', key: 'vendedor', width: 28 },
  { header: 'Producto', key: 'producto', width: 28 },
  { header: 'Proveedor', key: 'proveedor', width: 28 },
  { header: 'Cantidad', key: 'cantidad', width: 12 },
  { header: 'Precio Unitario', key: 'precioUnitario', width: 16 },
  { header: 'Precio Venta', key: 'precioVenta', width: 16 },
  { header: 'Costo Total', key: 'costoTotal', width: 16 },
  { header: 'Venta Total', key: 'ventaTotal', width: 16 },
  { header: 'Ganancia', key: 'ganancia', width: 16 }
];

  worksheet.addRow([]);
  worksheet.addRow(['REPORTE DE VENTAS']);
  worksheet.addRow([`Rango: ${fechaInicio} a ${fechaFin}`]);
  worksheet.addRow([]);

  const headerRowIndex = worksheet.rowCount + 1;
 worksheet.addRow([
  'ID Pedido',
  'Fecha Pedido',
  'Cliente',
  'Vendedor',
  'Producto',
  'Proveedor',
  'Cantidad',
  'Precio Unitario',
  'Precio Venta',
  'Costo Total',
  'Venta Total',
  'Ganancia'
]);

  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  filas.forEach((fila) => {
 worksheet.addRow({
  idPedido: fila.idPedido,
  fechaPedido: formatearFecha(fila.fechaPedido),
  cliente: fila.cliente,
  vendedor: fila.vendedor,
  producto: fila.producto,
  proveedor: fila.proveedor || 'Sin proveedor',
  cantidad: Number(fila.cantidad || 0),
  precioUnitario: Number(fila.precioUnitario || 0),
  precioVenta: Number(fila.precioVenta || 0),
  costoTotal: Number(fila.costoTotal || 0),
  ventaTotal: Number(fila.ventaTotal || 0),
  ganancia: Number(fila.ganancia || 0)
});
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > headerRowIndex) {
      const fechaCell = row.getCell(2);
      fechaCell.numFmt = 'dd/mm/yyyy hh:mm';

      for (const col of [8, 9, 10, 11, 12]) {
        row.getCell(col).numFmt = '"C$"#,##0.00';
      }
    }
  });

  worksheet.addRow([]);
  worksheet.addRow(['', '', '', '', '', '', '', 'Resumen']);
  worksheet.addRow(['', '', '', '', '', '', '', 'Total Ventas', Number(resumen.totalVentas || 0)]);
  worksheet.addRow(['', '', '', '', '', '', '', 'Costo Total', Number(resumen.costoTotal || 0)]);
  worksheet.addRow(['', '', '', '', '', '', '', 'Ganancia Total', Number(resumen.gananciaTotal || 0)]);

  const startSummary = worksheet.rowCount - 2;
  for (let i = startSummary; i <= worksheet.rowCount; i++) {
    worksheet.getRow(i).getCell(9).numFmt = '"C$"#,##0.00';
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

module.exports = {
  generarExcelReporteVentas
};