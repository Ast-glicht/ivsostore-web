const pedidosRepository = require('../repositories/pedidosRepository');

function validarNumeroEnteroPositivo(valor) {
  return Number.isInteger(Number(valor)) && Number(valor) > 0;
}

function validarDecimalPositivo(valor) {
  const n = Number(valor);
  return !Number.isNaN(n) && n > 0;
}

function validarDetalle(detalle) {
  if (!Array.isArray(detalle) || detalle.length === 0) {
    return 'El pedido debe tener productos.';
  }

  const ids = new Set();

  for (const item of detalle) {
    if (!item.idProducto || Number(item.idProducto) <= 0) {
      return 'Cada producto debe tener un ID válido.';
    }

    if (ids.has(Number(item.idProducto))) {
      return 'No se permiten productos repetidos en el pedido.';
    }
    ids.add(Number(item.idProducto));

    if (!validarNumeroEnteroPositivo(item.cantidad)) {
      return 'Todos los productos deben tener cantidad mayor a 0.';
    }

    if (!validarDecimalPositivo(item.precioVenta)) {
      return 'Todos los productos deben tener precio de venta mayor a 0.';
    }

    if (item.precioUnitario !== undefined && item.precioUnitario !== null) {
      if (!validarDecimalPositivo(item.precioUnitario)) {
        return 'El precio unitario debe ser mayor a 0.';
      }
    }
  }

  return null;
}

function calcularMontoTotal(detalle) {
  return detalle.reduce((acc, item) => {
    return acc + (Number(item.cantidad) * Number(item.precioVenta));
  }, 0);
}

async function obtenerClientes() {
  return await pedidosRepository.obtenerClientes();
}

async function obtenerVendedores() {
  return await pedidosRepository.obtenerVendedores();
}

async function obtenerInventarioDisponible() {
  return await pedidosRepository.obtenerInventarioDisponible();
}

async function crearPedido(data) {
  if (!data.idCliente || !data.idVendedor) {
    return {
      ok: false,
      mensaje: 'Debe completar cliente y vendedor.'
    };
  }

  const errorDetalle = validarDetalle(data.detalle);
  if (errorDetalle) {
    return {
      ok: false,
      mensaje: errorDetalle
    };
  }

  const estado = data.estado?.trim() ? data.estado.trim() : 'En proceso';
  const montoTotal = calcularMontoTotal(data.detalle);

  if (montoTotal <= 0) {
    return {
      ok: false,
      mensaje: 'El pedido no puede tener monto total 0.'
    };
  }

  const detalleNormalizado = data.detalle.map((item) => ({
    idProducto: Number(item.idProducto),
    cantidad: Number(item.cantidad),
    precioVenta: Number(item.precioVenta),
    precioUnitario: item.precioUnitario !== undefined && item.precioUnitario !== null
      ? Number(item.precioUnitario)
      : 0
  }));

  const idPedido = await pedidosRepository.crearPedidoConDetalle({
    idCliente: Number(data.idCliente),
    idVendedor: Number(data.idVendedor),
    estado,
    fechaPedido: new Date(),
    detalle: detalleNormalizado,
    montoTotal
  });

  return {
    ok: true,
    mensaje: 'Pedido creado correctamente.',
    idPedido
  };
}

async function listarPedidos() {
  return await pedidosRepository.listarPedidos();
}

async function obtenerPedidoPorId(idPedido) {
  if (!idPedido || Number.isNaN(Number(idPedido))) {
    return {
      ok: false,
      mensaje: 'ID de pedido inválido.'
    };
  }

  const pedido = await pedidosRepository.obtenerPedidoCompleto(Number(idPedido));

  if (!pedido) {
    return {
      ok: false,
      mensaje: 'Pedido no encontrado.'
    };
  }

  return {
    ok: true,
    data: pedido
  };
}

async function actualizarPedido(idPedido, data) {
  if (!idPedido || Number.isNaN(Number(idPedido))) {
    return {
      ok: false,
      mensaje: 'ID de pedido inválido.'
    };
  }

  if (!data.estado || !String(data.estado).trim()) {
    return {
      ok: false,
      mensaje: 'Seleccione un estado.'
    };
  }

  if (!Array.isArray(data.detalle)) {
    return {
      ok: false,
      mensaje: 'El detalle del pedido es inválido.'
    };
  }

  if (data.detalle.length === 0 && String(data.estado).trim() !== 'Cancelado') {
    return {
      ok: false,
      mensaje: 'El pedido no tiene productos. Si desea dejarlo así, márquelo como Cancelado.'
    };
  }

  const errorDetalle = data.detalle.length > 0 ? validarDetalle(data.detalle) : null;
  if (errorDetalle) {
    return {
      ok: false,
      mensaje: errorDetalle
    };
  }

  const detalleNormalizado = data.detalle.map((item) => ({
    idProducto: Number(item.idProducto),
    cantidad: Number(item.cantidad),
    precioVenta: Number(item.precioVenta),
    precioUnitario: Number(item.precioUnitario)
  }));

  const fechaPedido = data.fechaPedido ? new Date(data.fechaPedido) : new Date();

  if (Number.isNaN(fechaPedido.getTime())) {
    return {
      ok: false,
      mensaje: 'La fecha del pedido es inválida.'
    };
  }

  await pedidosRepository.actualizarPedidoCompleto({
    idPedido: Number(idPedido),
    fechaPedido,
    estado: String(data.estado).trim(),
    detalle: detalleNormalizado
  });

  return {
    ok: true,
    mensaje: 'Cambios aplicados exitosamente.'
  };
}

module.exports = {
  obtenerClientes,
  obtenerVendedores,
  obtenerInventarioDisponible,
  crearPedido,
  listarPedidos,
  obtenerPedidoPorId,
  actualizarPedido
};