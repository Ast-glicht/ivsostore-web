const API_VENTAS = "/api/ventas";

let pedidosOriginales = [];
let pedidoSeleccionado = null;

function renderVentasView() {
  return `
    <div class="ventas-module">
      <section class="ventas-card">
        <h2>Gestión de Ventas</h2>

        <div class="ventas-grid-config">
          <div class="ventas-row">
            <label for="cmbEstadoVenta">Estado del pedido</label>
            <select id="cmbEstadoVenta">
              <option value="">Seleccione estado</option>
              <option value="Enviado">Enviado</option>
              <option value="En proceso">En proceso</option>
              <option value="Entregado">Entregado</option>
              <option value="Completado">Completado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div class="ventas-row">
            <label for="txtDescuentoVenta">Descuento (%)</label>
            <input type="number" id="txtDescuentoVenta" min="0" max="100" step="0.01" value="0" />
          </div>

          <div class="ventas-row">
            <label for="cmbMonedaVenta">Moneda</label>
            <select id="cmbMonedaVenta">
              <option value="NIO">Córdobas (C$)</option>
              <option value="USD">Dólares ($)</option>
            </select>
          </div>

          <div class="ventas-row">
            <label for="txtTipoCambioVenta">Tipo de cambio</label>
            <input type="number" id="txtTipoCambioVenta" min="1" step="0.0001" placeholder="Ej: 36.70" disabled />
          </div>

          <div class="ventas-row">
            <label for="cmbPagoVenta">Forma de pago</label>
            <select id="cmbPagoVenta">
              <option value="">Seleccione pago</option>
              <option value="Contado">Contado</option>
              <option value="Crédito">Crédito</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Efectivo">Efectivo</option>
            </select>
          </div>
        </div>

        <div class="ventas-resumen">
          <div>
            <span>Subtotal</span>
            <strong id="lblSubtotalVenta">C$ 0.00</strong>
          </div>
          <div>
            <span>Descuento</span>
            <strong id="lblDescuentoVenta">C$ 0.00</strong>
          </div>
          <div>
            <span>Total con descuento</span>
            <strong id="lblTotalDescuentoVenta">C$ 0.00</strong>
          </div>
          <div>
            <span>Total mostrado</span>
            <strong id="lblTotalMostradoVenta">C$ 0.00</strong>
          </div>
        </div>

        <div class="ventas-actions">
          <button type="button" class="btn-ventas btn-ventas-actualizar" id="btnActualizarEstadoVenta">
            Actualizar estado
          </button>
          <button type="button" class="btn-ventas btn-ventas-guardar" id="btnAplicarConfiguracionVenta">
            Aplicar descuento / moneda
          </button>
          <button type="button" class="btn-ventas btn-ventas-factura" id="btnVerFacturaVenta">
            Ver factura
          </button>
        </div>

        <p id="ventasMessage" class="ventas-message"></p>
      </section>

      <section class="ventas-card">
        <h3>Pedidos registrados</h3>

        <div class="ventas-table-wrapper">
          <table class="ventas-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Subtotal</th>
                <th>Desc. %</th>
                <th>Descuento</th>
                <th>Total Final</th>
                <th>Moneda</th>
              </tr>
            </thead>
            <tbody id="ventasPedidosBody">
              <tr>
                <td colspan="10" class="ventas-empty">Cargando pedidos...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="ventas-card">
        <h3>Productos del pedido seleccionado</h3>

        <div class="ventas-table-wrapper">
          <table class="ventas-table">
            <thead>
              <tr>
                <th>ID Producto</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Precio Venta</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody id="ventasProductosBody">
              <tr>
                <td colspan="6" class="ventas-empty">Seleccione un pedido.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function obtenerElementosVentas() {
  return {
    cmbEstadoVenta: document.getElementById("cmbEstadoVenta"),
    txtDescuentoVenta: document.getElementById("txtDescuentoVenta"),
    cmbMonedaVenta: document.getElementById("cmbMonedaVenta"),
    txtTipoCambioVenta: document.getElementById("txtTipoCambioVenta"),
    cmbPagoVenta: document.getElementById("cmbPagoVenta"),
    lblSubtotalVenta: document.getElementById("lblSubtotalVenta"),
    lblDescuentoVenta: document.getElementById("lblDescuentoVenta"),
    lblTotalDescuentoVenta: document.getElementById("lblTotalDescuentoVenta"),
    lblTotalMostradoVenta: document.getElementById("lblTotalMostradoVenta"),
    btnActualizarEstadoVenta: document.getElementById("btnActualizarEstadoVenta"),
    btnAplicarConfiguracionVenta: document.getElementById("btnAplicarConfiguracionVenta"),
    btnVerFacturaVenta: document.getElementById("btnVerFacturaVenta"),
    ventasMessage: document.getElementById("ventasMessage"),
    ventasPedidosBody: document.getElementById("ventasPedidosBody"),
    ventasProductosBody: document.getElementById("ventasProductosBody")
  };
}

function mostrarMensajeVentas(texto, tipo = "") {
  const { ventasMessage } = obtenerElementosVentas();

  ventasMessage.textContent = texto;
  ventasMessage.className = "ventas-message";

  if (tipo) {
    ventasMessage.classList.add(tipo);
  }
}

function formatearFecha(fecha) {
  if (!fecha) return "";

  const d = new Date(fecha);

  if (Number.isNaN(d.getTime())) return fecha;

  return d.toLocaleString("es-NI", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function obtenerSimbolo(moneda) {
  return moneda === "USD" ? "$" : "C$";
}

function formatearMoneda(monto, moneda = "NIO") {
  const simbolo = obtenerSimbolo(moneda);
  const numero = Number(monto || 0).toFixed(2);
  return `${simbolo} ${numero}`;
}

function calcularVistaVenta() {
  if (!pedidoSeleccionado) return null;

  const {
    txtDescuentoVenta,
    cmbMonedaVenta,
    txtTipoCambioVenta
  } = obtenerElementosVentas();

  const montoTotal = Number(pedidoSeleccionado.montoTotal || 0);
  const descuentoPorcentaje = Number(txtDescuentoVenta.value || 0);
  const moneda = cmbMonedaVenta.value || "NIO";
  const tipoCambio = Number(txtTipoCambioVenta.value || 0);

  if (descuentoPorcentaje < 0 || descuentoPorcentaje > 100) {
    return {
      error: "El descuento debe estar entre 0 y 100."
    };
  }

  if (moneda === "USD" && (!tipoCambio || tipoCambio <= 0)) {
    return {
      error: "Debe ingresar un tipo de cambio válido para mostrar dólares."
    };
  }

  const descuentoMonto = Number(((montoTotal * descuentoPorcentaje) / 100).toFixed(2));
  const totalConDescuento = Number((montoTotal - descuentoMonto).toFixed(2));
  const totalMostrado = moneda === "USD"
    ? Number((totalConDescuento / tipoCambio).toFixed(2))
    : totalConDescuento;

  return {
    montoTotal,
    descuentoPorcentaje,
    descuentoMonto,
    totalConDescuento,
    totalMostrado,
    moneda,
    tipoCambio
  };
}

function actualizarResumenVisual() {
  const {
    lblSubtotalVenta,
    lblDescuentoVenta,
    lblTotalDescuentoVenta,
    lblTotalMostradoVenta
  } = obtenerElementosVentas();

  if (!pedidoSeleccionado) {
    lblSubtotalVenta.textContent = "C$ 0.00";
    lblDescuentoVenta.textContent = "C$ 0.00";
    lblTotalDescuentoVenta.textContent = "C$ 0.00";
    lblTotalMostradoVenta.textContent = "C$ 0.00";
    return;
  }

  const calculo = calcularVistaVenta();

  if (!calculo || calculo.error) {
    lblSubtotalVenta.textContent = formatearMoneda(pedidoSeleccionado.montoTotal, "NIO");
    lblDescuentoVenta.textContent = "C$ 0.00";
    lblTotalDescuentoVenta.textContent = formatearMoneda(pedidoSeleccionado.montoTotal, "NIO");
    lblTotalMostradoVenta.textContent = "Pendiente";
    return;
  }

  lblSubtotalVenta.textContent = formatearMoneda(calculo.montoTotal, "NIO");
  lblDescuentoVenta.textContent = formatearMoneda(calculo.descuentoMonto, "NIO");
  lblTotalDescuentoVenta.textContent = formatearMoneda(calculo.totalConDescuento, "NIO");
  lblTotalMostradoVenta.textContent = formatearMoneda(calculo.totalMostrado, calculo.moneda);
}

async function cargarPedidosVentas() {
  const { ventasPedidosBody } = obtenerElementosVentas();

  ventasPedidosBody.innerHTML = `
    <tr>
      <td colspan="10" class="ventas-empty">Cargando pedidos...</td>
    </tr>
  `;

  try {
    const response = await fetch(`${API_VENTAS}/pedidos`);
    const resultado = await response.json();

    if (!resultado.ok) {
      throw new Error(resultado.mensaje || "No se pudieron cargar los pedidos.");
    }

    pedidosOriginales = resultado.data || [];
    renderTablaPedidosVentas();
  } catch (error) {
    ventasPedidosBody.innerHTML = `
      <tr>
        <td colspan="10" class="ventas-empty">Error al cargar pedidos.</td>
      </tr>
    `;
  }
}

function renderTablaPedidosVentas() {
  const { ventasPedidosBody } = obtenerElementosVentas();

  if (!pedidosOriginales.length) {
    ventasPedidosBody.innerHTML = `
      <tr>
        <td colspan="10" class="ventas-empty">No hay pedidos registrados.</td>
      </tr>
    `;
    return;
  }

  ventasPedidosBody.innerHTML = pedidosOriginales.map((pedido) => `
    <tr data-id="${pedido.idPedido}">
      <td>${pedido.idPedido ?? ""}</td>
      <td>${pedido.cliente ?? ""}</td>
      <td>${pedido.vendedor ?? ""}</td>
      <td>${formatearFecha(pedido.fechaPedido)}</td>
      <td>${pedido.estado ?? ""}</td>
      <td>${formatearMoneda(pedido.montoTotal, "NIO")}</td>
      <td>${pedido.descuentoPorcentaje ?? 0}%</td>
      <td>${formatearMoneda(pedido.descuentoMonto, "NIO")}</td>
      <td>${formatearMoneda(pedido.totalMostrado ?? pedido.totalConDescuento, pedido.moneda)}</td>
      <td>${pedido.moneda === "USD" ? "Dólares $" : "Córdobas C$"}</td>
    </tr>
  `).join("");

  ventasPedidosBody.querySelectorAll("tr").forEach((fila) => {
    fila.addEventListener("click", () => seleccionarPedidoVenta(fila));
  });
}

async function seleccionarPedidoVenta(fila) {
  const idPedido = Number(fila.dataset.id);
  const pedido = pedidosOriginales.find((p) => Number(p.idPedido) === idPedido);

  if (!pedido) return;

  document.querySelectorAll("#ventasPedidosBody tr").forEach((tr) => {
    tr.classList.remove("selected");
  });

  fila.classList.add("selected");
  pedidoSeleccionado = pedido;

  const {
    cmbEstadoVenta,
    txtDescuentoVenta,
    cmbMonedaVenta,
    txtTipoCambioVenta
  } = obtenerElementosVentas();

  cmbEstadoVenta.value = pedido.estado || "";
  txtDescuentoVenta.value = pedido.descuentoPorcentaje ?? 0;
  cmbMonedaVenta.value = pedido.moneda || "NIO";
  txtTipoCambioVenta.value = pedido.tipoCambio ?? "";
  txtTipoCambioVenta.disabled = cmbMonedaVenta.value !== "USD";

  actualizarResumenVisual();
  await cargarProductosVenta(idPedido);

  mostrarMensajeVentas("Pedido seleccionado.", "ok");
}

async function cargarProductosVenta(idPedido) {
  const { ventasProductosBody } = obtenerElementosVentas();

  ventasProductosBody.innerHTML = `
    <tr>
      <td colspan="6" class="ventas-empty">Cargando productos...</td>
    </tr>
  `;

  try {
    const response = await fetch(`${API_VENTAS}/pedidos/${idPedido}/productos`);
    const resultado = await response.json();

    if (!resultado.ok) {
      throw new Error(resultado.mensaje || "No se pudieron cargar los productos.");
    }

    const productos = resultado.data || [];

    if (!productos.length) {
      ventasProductosBody.innerHTML = `
        <tr>
          <td colspan="6" class="ventas-empty">Este pedido no tiene productos.</td>
        </tr>
      `;
      return;
    }

    ventasProductosBody.innerHTML = productos.map((p) => `
      <tr>
        <td>${p.idProducto ?? ""}</td>
        <td>${p.nombreProducto ?? ""}</td>
        <td>${p.cantidad ?? ""}</td>
        <td>${formatearMoneda(p.precioUnitario, "NIO")}</td>
        <td>${formatearMoneda(p.precioVenta, "NIO")}</td>
        <td>${formatearMoneda(p.subtotal, "NIO")}</td>
      </tr>
    `).join("");
  } catch (error) {
    ventasProductosBody.innerHTML = `
      <tr>
        <td colspan="6" class="ventas-empty">Error al cargar productos.</td>
      </tr>
    `;
  }
}

async function actualizarEstadoVenta() {
  if (!pedidoSeleccionado) {
    mostrarMensajeVentas("Seleccione un pedido primero.", "error");
    return;
  }

  const { cmbEstadoVenta } = obtenerElementosVentas();

  if (!cmbEstadoVenta.value) {
    mostrarMensajeVentas("Seleccione un estado.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_VENTAS}/pedidos/${pedidoSeleccionado.idPedido}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        estado: cmbEstadoVenta.value
      })
    });

    const resultado = await response.json();

    if (!resultado.ok) {
      mostrarMensajeVentas(resultado.mensaje || "No se pudo actualizar el estado.", "error");
      return;
    }

    mostrarMensajeVentas(resultado.mensaje || "Estado actualizado correctamente.", "ok");
    await cargarPedidosVentas();
  } catch (error) {
    mostrarMensajeVentas("Error al actualizar estado.", "error");
  }
}

async function aplicarConfiguracionVenta() {
  if (!pedidoSeleccionado) {
    mostrarMensajeVentas("Seleccione un pedido primero.", "error");
    return;
  }

  const calculo = calcularVistaVenta();

  if (!calculo || calculo.error) {
    mostrarMensajeVentas(calculo?.error || "Datos inválidos.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_VENTAS}/pedidos/${pedidoSeleccionado.idPedido}/configuracion`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        descuentoPorcentaje: calculo.descuentoPorcentaje,
        moneda: calculo.moneda,
        tipoCambio: calculo.moneda === "USD" ? calculo.tipoCambio : null
      })
    });

    const resultado = await response.json();

    if (!resultado.ok) {
      mostrarMensajeVentas(resultado.mensaje || "No se pudo aplicar configuración.", "error");
      return;
    }

    mostrarMensajeVentas(resultado.mensaje || "Configuración aplicada correctamente.", "ok");

    await cargarPedidosVentas();

    const fila = document.querySelector(`#ventasPedidosBody tr[data-id="${pedidoSeleccionado.idPedido}"]`);
    if (fila) {
      await seleccionarPedidoVenta(fila);
    }
  } catch (error) {
    mostrarMensajeVentas("Error al aplicar descuento o moneda.", "error");
  }
}

async function verFacturaVenta() {
  if (!pedidoSeleccionado) {
    mostrarMensajeVentas("Seleccione un pedido primero.", "error");
    return;
  }

  const { cmbPagoVenta } = obtenerElementosVentas();

  if (!cmbPagoVenta.value) {
    mostrarMensajeVentas("Seleccione una forma de pago.", "error");
    return;
  }

  try {
    const response = await fetch(
      `${API_VENTAS}/factura/${pedidoSeleccionado.idPedido}?formaPago=${encodeURIComponent(cmbPagoVenta.value)}`
    );

    const resultado = await response.json();

    if (!resultado.ok) {
      mostrarMensajeVentas(resultado.mensaje || "No se pudo obtener la factura.", "error");
      return;
    }

    abrirModalFactura(resultado.data);
  } catch (error) {
    mostrarMensajeVentas("Error al obtener factura.", "error");
  }
}

function abrirModalFactura(data) {
  const modalAnterior = document.getElementById("facturaVentaOverlay");
  if (modalAnterior) modalAnterior.remove();

  const overlay = document.createElement("div");
  overlay.className = "factura-overlay";
  overlay.id = "facturaVentaOverlay";

  overlay.innerHTML = `
    <div class="factura-modal">
      <div class="factura-header">
        <h3>Factura del pedido #${data.pedido.idPedido}</h3>
        <button type="button" class="factura-close" id="cerrarFacturaVenta">×</button>
      </div>

      <div class="factura-info">
        <p><strong>Cliente:</strong> ${data.pedido.cliente}</p>
        <p><strong>Vendedor:</strong> ${data.pedido.vendedor}</p>
        <p><strong>Forma de pago:</strong> ${data.pedido.formaPago}</p>
        <p><strong>Moneda:</strong> ${data.moneda === "USD" ? "Dólares $" : "Córdobas C$"}</p>
        ${data.moneda === "USD" ? `<p><strong>Tipo de cambio:</strong> C$ ${Number(data.tipoCambio).toFixed(4)}</p>` : ""}
      </div>

      <div class="ventas-table-wrapper">
        <table class="ventas-table">
          <thead>
            <tr>
              <th>Cantidad</th>
              <th>Producto</th>
              <th>Precio venta</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${data.productos.map((p) => `
              <tr>
                <td>${p.cantidad}</td>
                <td>${p.nombreProducto}</td>
                <td>${formatearMoneda(p.precioVentaMostrado, data.moneda)}</td>
                <td>${formatearMoneda(p.subtotalMostrado, data.moneda)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div class="factura-totales">
        <p><span>Subtotal:</span> <strong>${formatearMoneda(data.resumen.subtotal, data.moneda)}</strong></p>
        <p><span>Descuento (${data.resumen.descuentoPorcentaje}%):</span> <strong>${formatearMoneda(data.resumen.descuentoMonto, data.moneda)}</strong></p>
        <p><span>Total con descuento:</span> <strong>${formatearMoneda(data.resumen.totalConDescuento, data.moneda)}</strong></p>
        <p><span>IVA 15%:</span> <strong>${formatearMoneda(data.resumen.iva, data.moneda)}</strong></p>
        <p class="factura-total-final"><span>Total a pagar:</span> <strong>${formatearMoneda(data.resumen.totalFinal, data.moneda)}</strong></p>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("cerrarFacturaVenta").addEventListener("click", () => {
    overlay.remove();
  });
}

export async function initVentasModule(panelPrincipal) {
  panelPrincipal.innerHTML = renderVentasView();

  const {
    cmbMonedaVenta,
    txtTipoCambioVenta,
    txtDescuentoVenta,
    btnActualizarEstadoVenta,
    btnAplicarConfiguracionVenta,
    btnVerFacturaVenta
  } = obtenerElementosVentas();

  cmbMonedaVenta.addEventListener("change", () => {
    txtTipoCambioVenta.disabled = cmbMonedaVenta.value !== "USD";

    if (cmbMonedaVenta.value !== "USD") {
      txtTipoCambioVenta.value = "";
    }

    actualizarResumenVisual();
  });

  txtTipoCambioVenta.addEventListener("input", actualizarResumenVisual);
  txtDescuentoVenta.addEventListener("input", actualizarResumenVisual);

  btnActualizarEstadoVenta.addEventListener("click", actualizarEstadoVenta);
  btnAplicarConfiguracionVenta.addEventListener("click", aplicarConfiguracionVenta);
  btnVerFacturaVenta.addEventListener("click", verFacturaVenta);

  await cargarPedidosVentas();
}