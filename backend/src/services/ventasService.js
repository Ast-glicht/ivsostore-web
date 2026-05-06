const ventasRepository = require('../repositories/ventasRepository');

const ESTADOS_VALIDOS = [
  'Enviado',
  'En proceso',
  'Entregado',
  'Completado',
  'Cancelado'
];

const MONEDAS_VALIDAS = [
  'NIO',
  'USD'
];

function calcularDatosVenta({ montoTotal, descuentoPorcentaje, moneda, tipoCambio }) {
  const monto = Number(montoTotal);
  const descuento = Number(descuentoPorcentaje || 0);
  const tasaCambio = tipoCambio ? Number(tipoCambio) : null;

  if (Number.isNaN(monto) || monto < 0) {
    throw new Error('El monto total del pedido es inválido.');
  }

  if (Number.isNaN(descuento) || descuento < 0 || descuento > 100) {
    throw new Error('El descuento debe estar entre 0 y 100.');
  }

  if (!MONEDAS_VALIDAS.includes(moneda)) {
    throw new Error('La moneda seleccionada no es válida.');
  }

  if (moneda === 'USD') {
    if (!tasaCambio || Number.isNaN(tasaCambio) || tasaCambio <= 0) {
      throw new Error('Debe ingresar un tipo de cambio válido para ventas en dólares.');
    }
  }

  const descuentoMonto = Number(((monto * descuento) / 100).toFixed(2));
  const totalConDescuento = Number((monto - descuentoMonto).toFixed(2));
  const totalMostrado = moneda === 'USD'
    ? Number((totalConDescuento / tasaCambio).toFixed(2))
    : totalConDescuento;

  return {
    descuentoMonto,
    totalConDescuento,
    totalMostrado,
    simbolo: moneda === 'USD' ? '$' : 'C$'
  };
}

async function listarPedidos() {
  const pedidos = await ventasRepository.listarPedidos();

  return pedidos.map((pedido) => {
    const moneda = pedido.moneda || 'NIO';
    const tipoCambio = pedido.tipoCambio ? Number(pedido.tipoCambio) : null;
    const totalConDescuento = Number(pedido.totalConDescuento ?? pedido.montoTotal ?? 0);

    return {
      ...pedido,
      simbolo: moneda === 'USD' ? '$' : 'C$',
      totalMostrado: moneda === 'USD' && tipoCambio
        ? Number((totalConDescuento / tipoCambio).toFixed(2))
        : totalConDescuento
    };
  });
}

async function obtenerProductosPedido(idPedido) {
  if (!idPedido || Number.isNaN(Number(idPedido))) {
    return {
      ok: false,
      mensaje: 'Debe seleccionar un pedido válido.'
    };
  }

  const productos = await ventasRepository.obtenerProductosPedido(Number(idPedido));

  return {
    ok: true,
    data: productos
  };
}

async function actualizarEstadoPedido(idPedido, estado) {
  if (!idPedido || Number.isNaN(Number(idPedido))) {
    return {
      ok: false,
      mensaje: 'Debe seleccionar un pedido válido.'
    };
  }

  if (!ESTADOS_VALIDOS.includes(estado)) {
    return {
      ok: false,
      mensaje: 'El estado seleccionado no es válido.'
    };
  }

  await ventasRepository.actualizarEstadoPedido(Number(idPedido), estado);

  return {
    ok: true,
    mensaje: 'Estado del pedido actualizado correctamente.'
  };
}

async function actualizarConfiguracionVenta(idPedido, data) {
  if (!idPedido || Number.isNaN(Number(idPedido))) {
    return {
      ok: false,
      mensaje: 'Debe seleccionar un pedido válido.'
    };
  }

  const pedido = await ventasRepository.obtenerPedidoPorId(Number(idPedido));

  if (!pedido) {
    return {
      ok: false,
      mensaje: 'El pedido seleccionado no existe.'
    };
  }

  const descuentoPorcentaje = Number(data.descuentoPorcentaje || 0);
  const moneda = data.moneda || 'NIO';
  const tipoCambio = data.tipoCambio ? Number(data.tipoCambio) : null;

  let calculo;

  try {
    calculo = calcularDatosVenta({
      montoTotal: pedido.montoTotal,
      descuentoPorcentaje,
      moneda,
      tipoCambio
    });
  } catch (error) {
    return {
      ok: false,
      mensaje: error.message
    };
  }

  await ventasRepository.actualizarConfiguracionVenta({
    idPedido: Number(idPedido),
    descuentoPorcentaje,
    descuentoMonto: calculo.descuentoMonto,
    totalConDescuento: calculo.totalConDescuento,
    moneda,
    tipoCambio: moneda === 'USD' ? tipoCambio : null
  });

  return {
    ok: true,
    mensaje: 'Descuento y moneda aplicados correctamente.',
    data: {
      descuentoPorcentaje,
      descuentoMonto: calculo.descuentoMonto,
      totalConDescuento: calculo.totalConDescuento,
      totalMostrado: calculo.totalMostrado,
      moneda,
      simbolo: calculo.simbolo,
      tipoCambio: moneda === 'USD' ? tipoCambio : null
    }
  };
}

async function obtenerFactura(idPedido, formaPago = 'No especificado') {
  if (!idPedido || Number.isNaN(Number(idPedido))) {
    return {
      ok: false,
      mensaje: 'Debe seleccionar un pedido válido.'
    };
  }

  const datos = await ventasRepository.obtenerDatosFactura(Number(idPedido));

  if (!datos) {
    return {
      ok: false,
      mensaje: 'No se encontró información del pedido.'
    };
  }

  const { pedido, productos } = datos;

  const moneda = pedido.moneda || 'NIO';
  const tipoCambio = pedido.tipoCambio ? Number(pedido.tipoCambio) : null;
  const simbolo = moneda === 'USD' ? '$' : 'C$';

  const subtotalCordobas = Number(pedido.montoTotal || 0);
  const descuentoMonto = Number(pedido.descuentoMonto || 0);
  const totalConDescuento = Number(pedido.totalConDescuento ?? subtotalCordobas);
  const ivaCordobas = Number((totalConDescuento * 0.15).toFixed(2));
  const totalFinalCordobas = Number((totalConDescuento + ivaCordobas).toFixed(2));

  const convertir = (monto) => {
    if (moneda === 'USD' && tipoCambio) {
      return Number((Number(monto) / tipoCambio).toFixed(2));
    }

    return Number(Number(monto).toFixed(2));
  };

  return {
    ok: true,
    data: {
      empresa: {
        nombre: 'IVSOLSTORE',
        ruc: 'J0310001234567',
        direccion: 'Managua, Nicaragua',
        telefono: '+505 8286-4340'
      },
      pedido: {
        idPedido: pedido.idPedido,
        cliente: pedido.cliente,
        vendedor: pedido.vendedor,
        fechaPedido: pedido.fechaPedido,
        estado: pedido.estado,
        formaPago
      },
      moneda,
      simbolo,
      tipoCambio,
      resumen: {
        subtotal: convertir(subtotalCordobas),
        descuentoPorcentaje: Number(pedido.descuentoPorcentaje || 0),
        descuentoMonto: convertir(descuentoMonto),
        totalConDescuento: convertir(totalConDescuento),
        iva: convertir(ivaCordobas),
        totalFinal: convertir(totalFinalCordobas)
      },
      productos: productos.map((p) => ({
        ...p,
        precioUnitarioMostrado: convertir(p.precioUnitario),
        precioVentaMostrado: convertir(p.precioVenta),
        subtotalMostrado: convertir(p.subtotal)
      }))
    }
  };
}

module.exports = {
  listarPedidos,
  obtenerProductosPedido,
  actualizarEstadoPedido,
  actualizarConfiguracionVenta,
  obtenerFactura
};