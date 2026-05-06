const inventarioRepository = require('../repositories/inventarioRepository');
const movimientosRepository = require('../repositories/movimientosRepository');

function validarTelefonoProveedor(numeroProveedor) {
  if (!numeroProveedor) return false;

  const limpio = numeroProveedor.replace(/\s/g, '');

  if (!limpio.startsWith('+505')) {
    return false;
  }

  const numero = limpio.substring(4);
  return /^[0-9]{8}$/.test(numero);
}

function validarCamposProducto(data) {
  if (
    !data.nombreProducto?.trim() ||
    !data.descripcion?.trim() ||
    !data.codigo?.trim() ||
    data.precio === undefined || data.precio === null || String(data.precio).trim() === '' ||
    data.stock === undefined || data.stock === null || String(data.stock).trim() === '' ||
    !data.proveedor?.trim() ||
    !data.numeroProveedor?.trim()
  ) {
    return 'Por favor, complete todos los campos.';
  }

  if (!/^[a-zA-Z0-9\s]+$/.test(data.nombreProducto.trim())) {
    return 'El nombre del producto solo puede contener letras, números y espacios.';
  }

  if (!/^[a-zA-Z0-9\s.\-]+$/.test(data.descripcion.trim())) {
    return 'La descripción contiene caracteres no permitidos.';
  }

  const precio = Number(data.precio);
  if (Number.isNaN(precio) || precio <= 0) {
    return 'Precio inválido. No se pueden poner letras o números negativos.';
  }

  const stock = Number(data.stock);
  if (!Number.isInteger(stock) || stock < 0) {
    return 'Stock inválido. No se pueden poner letras o números negativos.';
  }

  if (!validarTelefonoProveedor(String(data.numeroProveedor).trim())) {
    return 'El número de proveedor debe tener 8 dígitos después de +505.';
  }

  if (data.fechaDeCompra) {
    const fecha = new Date(data.fechaDeCompra);
    const ahora = new Date();

    if (Number.isNaN(fecha.getTime())) {
      return 'La fecha de compra es inválida.';
    }

    if (fecha > ahora) {
      return 'La fecha de compra no puede ser futura.';
    }
  }

  if (data.fechaVencimiento) {
    const fechaVencimiento = new Date(data.fechaVencimiento);

    if (Number.isNaN(fechaVencimiento.getTime())) {
      return 'La fecha de vencimiento es inválida.';
    }
  }

  return null;
}

async function obtenerProductos() {
  return await inventarioRepository.listarProductos();
}

async function registrarProducto(data) {
  const error = validarCamposProducto(data);

  if (error) {
    return {
      ok: false,
      mensaje: error
    };
  }

  const codigoExiste = await inventarioRepository.existeCodigoProducto(data.codigo.trim());

  if (codigoExiste) {
    return {
      ok: false,
      mensaje: 'Ya existe un producto registrado con este código.'
    };
  }

  const productoRegistrado = await inventarioRepository.registrarProducto({
    nombreProducto: data.nombreProducto.trim(),
    descripcion: data.descripcion.trim(),
    codigo: data.codigo.trim(),
    precio: Number(data.precio),
    stock: Number(data.stock),
    proveedor: data.proveedor.trim(),
    numeroProveedor: data.numeroProveedor.trim(),
    fechaVencimiento: data.fechaVencimiento || null
  });

  if (productoRegistrado?.idproducto) {
    await movimientosRepository.registrarMovimiento({
      idproducto: productoRegistrado.idproducto,
      tipoMovimiento: 'Entrada',
      cantidad: Number(data.stock),
      motivo: `Se realizó esta entrada al registrar el producto el ${new Date().toLocaleString('es-NI')}.`,
      usuario: data.usuario || 'Sistema',
      codigoProducto: data.codigo.trim(),
      precioUnitario: Number(data.precio),
      precioVenta: Number(data.precio),
      stockAnterior: 0,
      stockNuevo: Number(data.stock)
    });
  }

  return {
    ok: true,
    mensaje: 'Producto insertado correctamente.'
  };
}

async function actualizarProducto(id, data) {
  if (!id || Number.isNaN(Number(id))) {
    return {
      ok: false,
      mensaje: 'Debe seleccionar un producto para actualizar.'
    };
  }

  const error = validarCamposProducto(data);

  if (error) {
    return {
      ok: false,
      mensaje: error
    };
  }

  const codigoExiste = await inventarioRepository.existeCodigoProducto(
    data.codigo.trim(),
    Number(id)
  );

  if (codigoExiste) {
    return {
      ok: false,
      mensaje: 'Ya existe otro producto registrado con este código.'
    };
  }

  const resultadoStock = await inventarioRepository.actualizarProducto(Number(id), {
    nombreProducto: data.nombreProducto.trim(),
    descripcion: data.descripcion.trim(),
    codigo: data.codigo.trim(),
    precio: Number(data.precio),
    stock: Number(data.stock),
    proveedor: data.proveedor.trim(),
    numeroProveedor: data.numeroProveedor.trim(),
    fechaDeCompra: data.fechaDeCompra ? new Date(data.fechaDeCompra) : new Date(),
    fechaVencimiento: data.fechaVencimiento || null
  });

  if (resultadoStock && resultadoStock.diferencia !== 0) {
    await movimientosRepository.registrarMovimiento({
      idproducto: Number(id),
      tipoMovimiento: resultadoStock.diferencia > 0 ? 'Entrada' : 'Salida',
      cantidad: Math.abs(resultadoStock.diferencia),
      motivo: `Se actualizó el stock del producto el ${new Date().toLocaleString('es-NI')}.`,
      usuario: data.usuario || 'Sistema',
      codigoProducto: resultadoStock.codigoProducto,
      precioUnitario: resultadoStock.precio,
      precioVenta: resultadoStock.precio,
      stockAnterior: resultadoStock.stockAnterior,
      stockNuevo: resultadoStock.stockNuevo
    });
  }

  return {
    ok: true,
    mensaje: 'Producto y fecha actualizados correctamente.'
  };
}

module.exports = {
  obtenerProductos,
  registrarProducto,
  actualizarProducto
};