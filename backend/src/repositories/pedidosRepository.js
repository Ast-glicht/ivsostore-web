const { getConnection, sql } = require('../config/db');

async function obtenerClientes() {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT IDCliente AS idCliente, Nombre AS nombre
    FROM Clientes
    ORDER BY Nombre
  `);

  return result.recordset;
}

async function obtenerVendedores() {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT IDVendedor AS idVendedor, NombreVendedor AS nombreVendedor
    FROM Vendedores
    ORDER BY NombreVendedor
  `);

  return result.recordset;
}

async function obtenerInventarioDisponible() {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      IDProducto AS idProducto,
      NombreProducto AS nombreProducto,
      Stock AS stock,
      Precio AS precio
    FROM inventario
    WHERE Stock > 0
    ORDER BY NombreProducto
  `);

  return result.recordset;
}

async function obtenerNombreCliente(idCliente, transaction) {
  const request = new sql.Request(transaction);
  request.input('idCliente', sql.Int, idCliente);

  const result = await request.query(`
    SELECT Nombre
    FROM Clientes
    WHERE IDCliente = @idCliente
  `);

  return result.recordset[0]?.Nombre || null;
}

async function obtenerProductoInfo(idProducto, transaction) {
  const request = new sql.Request(transaction);
  request.input('idProducto', sql.Int, idProducto);

  const result = await request.query(`
    SELECT
      IDproducto AS idProducto,
      NombreProducto AS nombreProducto,
      Codigo AS codigoProducto,
      Precio AS precio,
      Stock AS stock
    FROM inventario
    WHERE IDproducto = @idProducto
  `);

  return result.recordset[0] || null;
}

async function registrarMovimientoTransaccion({
  transaction,
  idproducto,
  tipoMovimiento,
  cantidad,
  motivo,
  usuario = 'Sistema',
  idPedido = null,
  cliente = null,
  precioUnitario = null,
  precioVenta = null,
  stockAnterior = null,
  stockNuevo = null,
  codigoProducto = null
}) {
  const request = new sql.Request(transaction);

  request.input('idproducto', sql.Int, idproducto);
  request.input('tipoMovimiento', sql.VarChar, tipoMovimiento);
  request.input('cantidad', sql.Int, cantidad);
  request.input('motivo', sql.VarChar, motivo || null);
  request.input('usuario', sql.VarChar, usuario || 'Sistema');
  request.input('idPedido', sql.Int, idPedido);
  request.input('cliente', sql.VarChar, cliente);
  request.input('precioUnitario', sql.Decimal(18, 2), precioUnitario);
  request.input('precioVenta', sql.Decimal(18, 2), precioVenta);
  request.input('stockAnterior', sql.Int, stockAnterior);
  request.input('stockNuevo', sql.Int, stockNuevo);
  request.input('codigoProducto', sql.VarChar, codigoProducto);

  await request.query(`
    INSERT INTO historial_movimientos_productos
    (
      IDproducto,
      TipoMovimiento,
      Cantidad,
      Motivo,
      FechaMovimiento,
      Usuario,
      IDpedido,
      Cliente,
      PrecioUnitario,
      PrecioVenta,
      StockAnterior,
      StockNuevo,
      CodigoProducto
    )
    VALUES
    (
      @idproducto,
      @tipoMovimiento,
      @cantidad,
      @motivo,
      GETDATE(),
      @usuario,
      @idPedido,
      @cliente,
      @precioUnitario,
      @precioVenta,
      @stockAnterior,
      @stockNuevo,
      @codigoProducto
    )
  `);
}

async function crearPedidoConDetalle({
  idCliente,
  idVendedor,
  estado,
  fechaPedido,
  detalle,
  montoTotal,
  usuario = 'Sistema'
}) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    const cliente = await obtenerNombreCliente(idCliente, transaction);

    const requestPedido = new sql.Request(transaction);
    requestPedido.input('Clienteid', sql.Int, idCliente);
    requestPedido.input('IdVendedor', sql.Int, idVendedor);
    requestPedido.input('Estado', sql.VarChar, estado);
    requestPedido.input('FechaPedido', sql.DateTime, fechaPedido);
    requestPedido.input('MontoTotal', sql.Decimal(18, 2), montoTotal);

    const resultPedido = await requestPedido.execute('sp_crear_pedido_basico');

    const idPedido = Number(
      resultPedido.recordset?.[0]?.IDpedido ??
      resultPedido.recordset?.[0]?.idPedido ??
      resultPedido.returnValue ??
      resultPedido.output?.IDpedido
    );

    if (!idPedido) {
      throw new Error('No se pudo obtener el ID del pedido creado.');
    }

    const productosAntes = new Map();

    for (const item of detalle) {
      const productoInfo = await obtenerProductoInfo(item.idProducto, transaction);

      productosAntes.set(Number(item.idProducto), {
        stockAnterior: Number(productoInfo?.stock || 0),
        codigoProducto: productoInfo?.codigoProducto || '',
        precioUnitario: Number(item.precioUnitario ?? productoInfo?.precio ?? 0)
      });
    }

    const tvp = new sql.Table('dbo.ProductoPedido');
    tvp.columns.add('idproducto', sql.Int);
    tvp.columns.add('cantidad', sql.Int);
    tvp.columns.add('precioventa', sql.Decimal(18, 2));

    for (const item of detalle) {
      tvp.rows.add(item.idProducto, item.cantidad, item.precioVenta);
    }

    const requestDetalle = new sql.Request(transaction);
    requestDetalle.input('IDpedido', sql.Int, idPedido);
    requestDetalle.input('Productos', tvp);

    await requestDetalle.execute('sp_crear_pedido_con_detalle');

    for (const item of detalle) {
      const idProducto = Number(item.idProducto);
      const cantidad = Number(item.cantidad);
      const antes = productosAntes.get(idProducto);
      const productoDespues = await obtenerProductoInfo(idProducto, transaction);

      await registrarMovimientoTransaccion({
        transaction,
        idproducto: idProducto,
        tipoMovimiento: 'Salida',
        cantidad,
        motivo: `Se realizó esta salida al vender estos productos el ${new Date().toLocaleString('es-NI')}.`,
        usuario,
        idPedido,
        cliente,
        precioUnitario: Number(item.precioUnitario ?? antes?.precioUnitario ?? 0),
        precioVenta: Number(item.precioVenta || 0),
        stockAnterior: antes?.stockAnterior ?? null,
        stockNuevo: Number(productoDespues?.stock ?? 0),
        codigoProducto: antes?.codigoProducto || productoDespues?.codigoProducto || ''
      });
    }

    await transaction.commit();
    return idPedido;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function listarPedidos() {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      p.IDpedido AS idPedido,
      p.FechaPedido AS fechaPedido,
      p.Estado AS estado,
      p.MontoTotal AS montoTotal,
      c.IDCliente AS idCliente,
      c.Nombre AS cliente,
      v.IDVendedor AS idVendedor,
      v.NombreVendedor AS vendedor
    FROM pedidos p
    INNER JOIN Clientes c ON p.Clienteid = c.IDCliente
    INNER JOIN Vendedores v ON p.IDVendedor = v.IDVendedor
    ORDER BY p.IDpedido DESC
  `);

  return result.recordset;
}

async function obtenerPedidoCabecera(idPedido, transaction = null) {
  const pool = await getConnection();
  const request = transaction ? new sql.Request(transaction) : pool.request();

  request.input('idPedido', sql.Int, idPedido);

  const result = await request.query(`
    SELECT
      p.IDpedido AS idPedido,
      p.Clienteid AS idCliente,
      p.IDVendedor AS idVendedor,
      p.FechaPedido AS fechaPedido,
      p.Estado AS estado,
      p.MontoTotal AS montoTotal,
      c.Nombre AS cliente,
      v.NombreVendedor AS vendedor
    FROM pedidos p
    INNER JOIN Clientes c ON p.Clienteid = c.IDCliente
    INNER JOIN Vendedores v ON p.IDVendedor = v.IDVendedor
    WHERE p.IDpedido = @idPedido
  `);

  return result.recordset[0] || null;
}

async function obtenerDetallePedido(idPedido, transaction = null) {
  const pool = await getConnection();
  const request = transaction ? new sql.Request(transaction) : pool.request();

  request.input('idPedido', sql.Int, idPedido);

  const result = await request.query(`
    SELECT
      dp.IDproducto AS idProducto,
      i.NombreProducto AS producto,
      i.Codigo AS codigoProducto,
      dp.Cantidad AS cantidad,
      dp.PrecioUnitario AS precioUnitario,
      dp.precioventa AS precioVenta,
      (dp.Cantidad * dp.precioventa) AS subtotal
    FROM detalle_pedidos dp
    INNER JOIN inventario i ON dp.IDproducto = i.IDproducto
    WHERE dp.IDpedido = @idPedido
  `);

  return result.recordset;
}

async function obtenerPedidoCompleto(idPedido) {
  const cabecera = await obtenerPedidoCabecera(idPedido);
  if (!cabecera) return null;

  const detalle = await obtenerDetallePedido(idPedido);

  return {
    ...cabecera,
    detalle
  };
}

async function obtenerStockProducto(idProducto, transaction) {
  const request = new sql.Request(transaction);
  request.input('idProducto', sql.Int, idProducto);

  const result = await request.query(`
    SELECT Stock
    FROM inventario
    WHERE IDproducto = @idProducto
  `);

  return Number(result.recordset[0]?.Stock ?? 0);
}

async function ajustarStockProducto(idProducto, cantidadDelta, transaction) {
  const stockAnterior = await obtenerStockProducto(idProducto, transaction);

  const request = new sql.Request(transaction);
  request.input('idProducto', sql.Int, idProducto);
  request.input('cantidadDelta', sql.Int, cantidadDelta);

  await request.query(`
    UPDATE inventario
    SET Stock = Stock + @cantidadDelta
    WHERE IDproducto = @idProducto
  `);

  const stockNuevo = await obtenerStockProducto(idProducto, transaction);

  return {
    stockAnterior,
    stockNuevo
  };
}

async function eliminarDetallePedido(idPedido, transaction) {
  const request = new sql.Request(transaction);
  request.input('idPedido', sql.Int, idPedido);

  await request.query(`
    DELETE FROM detalle_pedidos
    WHERE IDpedido = @idPedido
  `);
}

async function insertarDetallePedido(idPedido, detalle, transaction) {
  for (const item of detalle) {
    const request = new sql.Request(transaction);
    request.input('idPedido', sql.Int, idPedido);
    request.input('idProducto', sql.Int, item.idProducto);
    request.input('cantidad', sql.Int, item.cantidad);
    request.input('precioVenta', sql.Decimal(18, 2), item.precioVenta);
    request.input('precioUnitario', sql.Decimal(18, 2), item.precioUnitario);

    await request.query(`
      INSERT INTO detalle_pedidos (IDpedido, IDproducto, Cantidad, precioventa, PrecioUnitario)
      VALUES (@idPedido, @idProducto, @cantidad, @precioVenta, @precioUnitario)
    `);
  }
}

async function actualizarPedidoCabecera({ idPedido, fechaPedido, estado }, transaction) {
  const request = new sql.Request(transaction);
  request.input('idPedido', sql.Int, idPedido);
  request.input('fechaPedido', sql.DateTime, fechaPedido);
  request.input('estado', sql.VarChar, estado);

  await request.query(`
    UPDATE pedidos
    SET
      FechaPedido = @fechaPedido,
      Estado = @estado,
      MontoTotal = (
        SELECT ISNULL(SUM(Cantidad * precioventa), 0)
        FROM detalle_pedidos
        WHERE IDpedido = @idPedido
      )
    WHERE IDpedido = @idPedido
  `);
}

async function actualizarPedidoCompleto({
  idPedido,
  fechaPedido,
  estado,
  detalle,
  usuario = 'Sistema'
}) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    const pedidoActual = await obtenerPedidoCabecera(idPedido, transaction);
    if (!pedidoActual) {
      throw new Error('Pedido no encontrado.');
    }

    const detalleAnterior = await obtenerDetallePedido(idPedido, transaction);
    const estadoAnterior = String(pedidoActual.estado || '');

    const mapAnterior = new Map();
    for (const item of detalleAnterior) {
      mapAnterior.set(Number(item.idProducto), {
        idProducto: Number(item.idProducto),
        cantidad: Number(item.cantidad),
        precioVenta: Number(item.precioVenta),
        precioUnitario: Number(item.precioUnitario),
        codigoProducto: item.codigoProducto
      });
    }

    const mapNuevo = new Map();
    for (const item of detalle) {
      mapNuevo.set(Number(item.idProducto), {
        idProducto: Number(item.idProducto),
        cantidad: Number(item.cantidad),
        precioVenta: Number(item.precioVenta),
        precioUnitario: Number(item.precioUnitario)
      });
    }

    if (estadoAnterior !== 'Cancelado' && estado === 'Cancelado') {
      for (const item of detalleAnterior) {
        const cambio = await ajustarStockProducto(Number(item.idProducto), Number(item.cantidad), transaction);

        await registrarMovimientoTransaccion({
          transaction,
          idproducto: Number(item.idProducto),
          tipoMovimiento: 'Entrada',
          cantidad: Number(item.cantidad),
          motivo: `Se realizó esta entrada cuando se devolvió o canceló este pedido el ${new Date().toLocaleString('es-NI')}.`,
          usuario,
          idPedido,
          cliente: pedidoActual.cliente,
          precioUnitario: Number(item.precioUnitario || 0),
          precioVenta: Number(item.precioVenta || 0),
          stockAnterior: cambio.stockAnterior,
          stockNuevo: cambio.stockNuevo,
          codigoProducto: item.codigoProducto
        });
      }
    } else if (estadoAnterior === 'Cancelado' && estado !== 'Cancelado') {
      for (const item of detalle) {
        const stockReal = await obtenerStockProducto(item.idProducto, transaction);

        if (item.cantidad > stockReal) {
          throw new Error(`No hay suficiente stock para el producto ${item.idProducto}. Disponible: ${stockReal}`);
        }

        const cambio = await ajustarStockProducto(item.idProducto, -item.cantidad, transaction);
        const productoInfo = await obtenerProductoInfo(item.idProducto, transaction);

        await registrarMovimientoTransaccion({
          transaction,
          idproducto: item.idProducto,
          tipoMovimiento: 'Salida',
          cantidad: item.cantidad,
          motivo: `Se realizó esta salida al vender estos productos el ${new Date().toLocaleString('es-NI')}.`,
          usuario,
          idPedido,
          cliente: pedidoActual.cliente,
          precioUnitario: Number(item.precioUnitario || productoInfo?.precio || 0),
          precioVenta: Number(item.precioVenta || 0),
          stockAnterior: cambio.stockAnterior,
          stockNuevo: cambio.stockNuevo,
          codigoProducto: productoInfo?.codigoProducto || ''
        });
      }
    } else {
      for (const itemAnterior of detalleAnterior) {
        const id = Number(itemAnterior.idProducto);
        const cantidadAnterior = Number(itemAnterior.cantidad);
        const itemNuevo = mapNuevo.get(id);

        if (!itemNuevo) {
          const cambio = await ajustarStockProducto(id, cantidadAnterior, transaction);

          await registrarMovimientoTransaccion({
            transaction,
            idproducto: id,
            tipoMovimiento: 'Entrada',
            cantidad: cantidadAnterior,
            motivo: `Se realizó esta entrada cuando se devolvió o canceló este pedido el ${new Date().toLocaleString('es-NI')}.`,
            usuario,
            idPedido,
            cliente: pedidoActual.cliente,
            precioUnitario: Number(itemAnterior.precioUnitario || 0),
            precioVenta: Number(itemAnterior.precioVenta || 0),
            stockAnterior: cambio.stockAnterior,
            stockNuevo: cambio.stockNuevo,
            codigoProducto: itemAnterior.codigoProducto
          });
        } else {
          const cantidadNueva = Number(itemNuevo.cantidad);

          if (cantidadNueva > cantidadAnterior) {
            const diferencia = cantidadNueva - cantidadAnterior;
            const stockReal = await obtenerStockProducto(id, transaction);

            if (diferencia > stockReal) {
              throw new Error(`Stock insuficiente para el producto ${id}. Disponible: ${stockReal}`);
            }

            const cambio = await ajustarStockProducto(id, -diferencia, transaction);

            await registrarMovimientoTransaccion({
              transaction,
              idproducto: id,
              tipoMovimiento: 'Salida',
              cantidad: diferencia,
              motivo: `Se realizó esta salida al vender estos productos el ${new Date().toLocaleString('es-NI')}.`,
              usuario,
              idPedido,
              cliente: pedidoActual.cliente,
              precioUnitario: Number(itemNuevo.precioUnitario || 0),
              precioVenta: Number(itemNuevo.precioVenta || 0),
              stockAnterior: cambio.stockAnterior,
              stockNuevo: cambio.stockNuevo,
              codigoProducto: itemAnterior.codigoProducto
            });
          } else if (cantidadNueva < cantidadAnterior) {
            const diferencia = cantidadAnterior - cantidadNueva;
            const cambio = await ajustarStockProducto(id, diferencia, transaction);

            await registrarMovimientoTransaccion({
              transaction,
              idproducto: id,
              tipoMovimiento: 'Entrada',
              cantidad: diferencia,
              motivo: `Se realizó esta entrada cuando se devolvió o canceló este pedido el ${new Date().toLocaleString('es-NI')}.`,
              usuario,
              idPedido,
              cliente: pedidoActual.cliente,
              precioUnitario: Number(itemNuevo.precioUnitario || 0),
              precioVenta: Number(itemNuevo.precioVenta || 0),
              stockAnterior: cambio.stockAnterior,
              stockNuevo: cambio.stockNuevo,
              codigoProducto: itemAnterior.codigoProducto
            });
          }
        }
      }

      for (const itemNuevo of detalle) {
        const id = Number(itemNuevo.idProducto);
        const yaExistia = mapAnterior.has(id);

        if (!yaExistia) {
          const stockReal = await obtenerStockProducto(id, transaction);

          if (itemNuevo.cantidad > stockReal) {
            throw new Error(`Stock insuficiente para el producto ${id}. Disponible: ${stockReal}`);
          }

          const cambio = await ajustarStockProducto(id, -itemNuevo.cantidad, transaction);
          const productoInfo = await obtenerProductoInfo(id, transaction);

          await registrarMovimientoTransaccion({
            transaction,
            idproducto: id,
            tipoMovimiento: 'Salida',
            cantidad: Number(itemNuevo.cantidad),
            motivo: `Se realizó esta salida al vender estos productos el ${new Date().toLocaleString('es-NI')}.`,
            usuario,
            idPedido,
            cliente: pedidoActual.cliente,
            precioUnitario: Number(itemNuevo.precioUnitario || productoInfo?.precio || 0),
            precioVenta: Number(itemNuevo.precioVenta || 0),
            stockAnterior: cambio.stockAnterior,
            stockNuevo: cambio.stockNuevo,
            codigoProducto: productoInfo?.codigoProducto || ''
          });
        }
      }
    }

    await eliminarDetallePedido(idPedido, transaction);
    await insertarDetallePedido(idPedido, detalle, transaction);
    await actualizarPedidoCabecera({ idPedido, fechaPedido, estado }, transaction);

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  obtenerClientes,
  obtenerVendedores,
  obtenerInventarioDisponible,
  crearPedidoConDetalle,
  listarPedidos,
  obtenerPedidoCompleto,
  actualizarPedidoCompleto
};