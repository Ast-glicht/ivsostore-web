const PDFDocument = require('pdfkit');

function formatearCordobas(valor) {
  const numero = Number(valor || 0);
  return `C$ ${numero.toFixed(2)}`;
}

function construirFacturaData(rows, formaPago) {
  if (!rows || rows.length === 0) {
    return null;
  }

  const first = rows[0];

  const items = rows.map((row) => ({
    cantidad: Number(row.Cantidad || 0),
    descripcion: String(row.NombreProducto || ''),
    precioUnitario: Number(row.PrecioUnitario || 0),
    subtotal: Number(row.Subtotal || 0)
  }));

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const tasaIva = 0.15;
  const iva = subtotal * tasaIva;
  const total = subtotal + iva;

  return {
    empresa: {
      nombre: 'IVSOL STORE',
      ruc: 'J0310001234567',
      direccion: 'Managua, Nicaragua',
      telefono: '+505 8286-4340',
      numeroFactura: `001-${String(first.IDpedido).padStart(6, '0')}`,
      fechaEmision: new Date(),
      condicionVenta: formaPago || 'No especificado',
      cajero: first.NombreVendedor || ''
    },
    cliente: {
      nombreRazon: first.Cliente || ''
    },
    items,
    subtotal,
    tasaIva,
    iva,
    total,
    idPedido: Number(first.IDpedido)
  };
}

function generarFacturaPdfBuffer(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).fillColor('blue').text('FACTURA COMERCIAL – VENTA DE REGALOS', {
      align: 'center'
    });

    doc.moveDown(0.3);
    doc.fontSize(9).fillColor('gray').text('(Conforme a las disposiciones de la DGI de Nicaragua)', {
      align: 'center'
    });

    doc.moveDown(1.5);
    doc.fillColor('black');

    const leftX = 40;
    const rightX = 360;
    let y = doc.y;

    doc.fontSize(10)
      .text(`Tienda: ${data.empresa.nombre}`, leftX, y)
      .text(`RUC: ${data.empresa.ruc}`, leftX, y + 16)
      .text(`Dirección: ${data.empresa.direccion}`, leftX, y + 32)
      .text(`Teléfono: ${data.empresa.telefono}`, leftX, y + 48);

    doc.rect(rightX, y - 5, 180, 95).stroke();
    doc.fontSize(10)
      .text('FACTURA', rightX + 10, y + 5)
      .text(`No.: ${data.empresa.numeroFactura}`, rightX + 10, y + 22)
      .text(`Fecha: ${data.empresa.fechaEmision.toLocaleDateString('es-NI')}`, rightX + 10, y + 39)
      .text(`Condición: ${data.empresa.condicionVenta}`, rightX + 10, y + 56)
      .text(`Cajero: ${data.empresa.cajero}`, rightX + 10, y + 73);

    doc.moveDown(6);
    doc.text(`Nombre / Razón Social: ${data.cliente.nombreRazon}`);
    doc.moveDown(1);

    const tableTop = doc.y;
    const colX = {
      cant: 40,
      desc: 90,
      pu: 340,
      sub: 450
    };

    doc.rect(40, tableTop, 515, 22).fillAndStroke('#e5e7eb', '#cccccc');
    doc.fillColor('black').fontSize(10);
    doc.text('Cant.', colX.cant + 5, tableTop + 6);
    doc.text('Descripción del Producto', colX.desc + 5, tableTop + 6);
    doc.text('Precio Unitario', colX.pu + 5, tableTop + 6, { width: 90, align: 'right' });
    doc.text('Subtotal', colX.sub + 5, tableTop + 6, { width: 90, align: 'right' });

    let rowY = tableTop + 22;

    data.items.forEach((item) => {
      doc.rect(40, rowY, 515, 22).stroke('#dddddd');
      doc.text(String(item.cantidad), colX.cant + 5, rowY + 6);
      doc.text(item.descripcion, colX.desc + 5, rowY + 6, { width: 220 });
      doc.text(formatearCordobas(item.precioUnitario), colX.pu + 5, rowY + 6, { width: 90, align: 'right' });
      doc.text(formatearCordobas(item.subtotal), colX.sub + 5, rowY + 6, { width: 90, align: 'right' });
      rowY += 22;
    });

    rowY += 10;

    doc.text('Subtotal', 380, rowY, { width: 80, align: 'right' });
    doc.text(formatearCordobas(data.subtotal), 470, rowY, { width: 80, align: 'right' });
    rowY += 18;

    doc.text(`IVA (${data.tasaIva * 100}%)`, 380, rowY, { width: 80, align: 'right' });
    doc.text(formatearCordobas(data.iva), 470, rowY, { width: 80, align: 'right' });
    rowY += 18;

    doc.rect(360, rowY - 4, 195, 24).fillAndStroke('#e5e7eb', '#cccccc');
    doc.fillColor('black');
    doc.text('TOTAL A PAGAR', 370, rowY + 2, { width: 90, align: 'right' });
    doc.text(formatearCordobas(data.total), 470, rowY + 2, { width: 80, align: 'right' });

    rowY += 40;
    doc.text(`Forma de Pago: ${data.empresa.condicionVenta}`, 40, rowY);

    rowY += 30;
    doc.font('Helvetica-Bold').text('Notas Legales:', 40, rowY);
    doc.font('Helvetica');
    rowY += 18;
    doc.text('• Todo reclamo deberá realizarse dentro de los 3 días posteriores a la emisión.', 40, rowY);
    rowY += 16;
    doc.text('• Documento sin tachaduras ni enmiendas.', 40, rowY);

    rowY += 40;
    doc.text('Firma del Cliente: ______________________', 40, rowY);
    doc.text('Firma del Cajero: ______________________', 320, rowY);

    rowY += 30;
    doc.font('Helvetica-Oblique')
      .text('Gracias por su compra 💝 “Hacemos de cada regalo un momento especial.”', 40, rowY);

    doc.end();
  });
}

module.exports = {
  construirFacturaData,
  generarFacturaPdfBuffer
};