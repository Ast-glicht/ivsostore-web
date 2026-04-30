// frontend/js/modules/ventas/ventas.js
const API_VENTAS = "https://ivsostore-web-production.up.railway.app/api/ventas";
let pedidosVentas = [];
let pedidoSeleccionadoId = null;

function renderVentasView() {
  return `
    <div class="ventas-module">
      <section class="ventas-card">
        <h2>Ventas y Facturación</h2>

        <div class="ventas-toolbar">
          <div class="ventas-field">
            <label for="txtBuscarPedidoVenta">Buscar pedido</label>
            <input
              type="text"
              id="txtBuscarPedidoVenta"
              placeholder="Buscar por cliente, vendedor, estado o ID"
            />
          </div>

          <div class="ventas-field">
            <label for="cmbPagoVenta">Forma de pago</label>
            <select id="cmbPagoVenta">
              <option value="">Seleccione forma de pago</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>
<div class="ventas-field">
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
          <div class="ventas-actions">
            <button type="button" class="btn-ventas btn-factura" id="btnFacturaVenta">
              Generar factura PDF
            </button>
          </div>

          <div class="ventas-actions">
            <button type="button" class="btn-ventas btn-regresar-ventas" id="btnRegresarVentas">
              Limpiar selección
            </button>
          </div>
        </div>
<button type="button" class="btn-ventas btn-factura" id="btnActualizarEstadoVenta">
  Actualizar estado
</button>
        <p id="ventasMessage" class="ventas-message"></p>

        <div class="ventas-table-wrapper">
          <table class="ventas-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Fecha Pedido</th>
                <th>Estado</th>
                <th>Monto Total</th>
              </tr>
            </thead>
            <tbody id="ventasPedidosBody">
              <tr>
                <td colspan="6" class="ventas-empty">Cargando pedidos...</td>
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
                <th>Nombre Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody id="ventasProductosBody">
              <tr>
                <td colspan="5" class="ventas-empty">Seleccione un pedido para ver sus productos.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function mostrarMensajeVentas(texto, tipo = "") {
  const el = document.getElementById("ventasMessage");
  if (!el) return;
  el.textContent = texto;
  el.className = "ventas-message";
  if (tipo) {
    el.classList.add(tipo);
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
async function actualizarEstadoPedidoVenta() {
  if (!pedidoSeleccionadoId) {
    mostrarMensajeVentas("Seleccione un pedido primero.", "error");
    return;
  }

  const cmbEstadoVenta = document.getElementById("cmbEstadoVenta");
  const estado = cmbEstadoVenta.value;

  if (!estado) {
    mostrarMensajeVentas("Seleccione un estado para actualizar el pedido.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_VENTAS}/pedidos/${pedidoSeleccionadoId}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ estado })
    });

    const resultado = await response.json();

    if (!resultado.ok) {
      mostrarMensajeVentas(resultado.mensaje || "No se pudo actualizar el estado.", "error");
      return;
    }

    mostrarMensajeVentas(resultado.mensaje || "Estado actualizado correctamente.", "ok");

    await cargarPedidosVentas();

    pedidoSeleccionadoId = null;
    document.getElementById("ventasProductosBody").innerHTML = `
      <tr>
        <td colspan="5" class="ventas-empty">Seleccione un pedido para ver sus productos.</td>
      </tr>
    `;
    cmbEstadoVenta.value = "";
  } catch (error) {
    mostrarMensajeVentas("Error al actualizar el estado del pedido.", "error");
  }
}
function formatearMoneda(valor) {
  return `C$ ${Number(valor || 0).toFixed(2)}`;
}

async function cargarPedidosVentas() {
  const body = document.getElementById("ventasPedidosBody");

  body.innerHTML = `
    <tr>
      <td colspan="6" class="ventas-empty">Cargando pedidos...</td>
    </tr>
  `;

  const response = await fetch(`${API_VENTAS}/pedidos`);
  const resultado = await response.json();

  if (!resultado.ok) {
    throw new Error(resultado.mensaje || "Error cargando pedidos.");
  }

  pedidosVentas = resultado.data || [];
  renderTablaPedidosVentas(pedidosVentas);
}

function renderTablaPedidosVentas(data) {
  const body = document.getElementById("ventasPedidosBody");

  if (!data.length) {
    body.innerHTML = `
      <tr>
        <td colspan="6" class="ventas-empty">No hay pedidos disponibles.</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = data.map((pedido) => `
    <tr data-id="${pedido.idPedido}">
      <td>${pedido.idPedido}</td>
      <td>${pedido.cliente ?? ""}</td>
      <td>${pedido.vendedor ?? ""}</td>
      <td>${formatearFecha(pedido.fechaPedido)}</td>
      <td>${pedido.estado ?? ""}</td>
      <td>${formatearMoneda(pedido.montoTotal)}</td>
    </tr>
  `).join("");

  body.querySelectorAll("tr").forEach((fila) => {
    fila.addEventListener("click", async () => {
      document.querySelectorAll("#ventasPedidosBody tr").forEach((tr) => {
        tr.classList.remove("selected");
      });
      fila.classList.add("selected");

      pedidoSeleccionadoId = Number(fila.dataset.id);
      const pedido = pedidosVentas.find((p) => Number(p.idPedido) === pedidoSeleccionadoId);
if (pedido) {
  document.getElementById("cmbEstadoVenta").value = pedido.estado || "";
}
      mostrarMensajeVentas(`Pedido seleccionado: ${pedidoSeleccionadoId}`, "ok");

      await cargarProductosPedidoVenta(pedidoSeleccionadoId);
    });
  });
}

async function cargarProductosPedidoVenta(idPedido) {
  const body = document.getElementById("ventasProductosBody");

  body.innerHTML = `
    <tr>
      <td colspan="5" class="ventas-empty">Cargando productos del pedido...</td>
    </tr>
  `;

  const response = await fetch(`${API_VENTAS}/pedidos/${idPedido}/productos`);
  const resultado = await response.json();

  if (!resultado.ok) {
    body.innerHTML = `
      <tr>
        <td colspan="5" class="ventas-empty">Error cargando productos.</td>
      </tr>
    `;
    mostrarMensajeVentas(resultado.mensaje || "Error cargando productos del pedido.", "error");
    return;
  }

  const productos = resultado.data || [];

  if (!productos.length) {
    body.innerHTML = `
      <tr>
        <td colspan="5" class="ventas-empty">Este pedido no tiene productos.</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = productos.map((producto) => `
    <tr>
      <td>${producto.idProducto ?? ""}</td>
      <td>${producto.nombreProducto ?? ""}</td>
      <td>${producto.cantidad ?? ""}</td>
      <td>${formatearMoneda(producto.precioUnitario)}</td>
      <td>${formatearMoneda(producto.subtotal)}</td>
    </tr>
  `).join("");
}

function filtrarPedidosVentas() {
  const input = document.getElementById("txtBuscarPedidoVenta");
  const filtro = input.value.trim().toLowerCase();

  if (!filtro) {
    renderTablaPedidosVentas(pedidosVentas);
    return;
  }

  const filtrados = pedidosVentas.filter((pedido) => {
    return (
      String(pedido.idPedido ?? "").toLowerCase().includes(filtro) ||
      String(pedido.cliente ?? "").toLowerCase().includes(filtro) ||
      String(pedido.vendedor ?? "").toLowerCase().includes(filtro) ||
      String(pedido.estado ?? "").toLowerCase().includes(filtro) ||
      String(formatearFecha(pedido.fechaPedido) ?? "").toLowerCase().includes(filtro)
    );
  });

  renderTablaPedidosVentas(filtrados);
}

async function generarFacturaPdfVenta() {
  if (!pedidoSeleccionadoId) {
    mostrarMensajeVentas("Seleccione un pedido primero.", "error");
    return;
  }

  const cmbPagoVenta = document.getElementById("cmbPagoVenta");
  const formaPago = cmbPagoVenta.value;

  if (!formaPago) {
    mostrarMensajeVentas("Seleccione una forma de pago antes de generar la factura.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_VENTAS}/pedidos/${pedidoSeleccionadoId}/factura`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ formaPago })
    });

    if (!response.ok) {
      let mensaje = "Error al generar la factura.";
      try {
        const errorJson = await response.json();
        mensaje = errorJson.mensaje || mensaje;
      } catch (_) {}
      mostrarMensajeVentas(mensaje, "error");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Factura_${pedidoSeleccionadoId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);

    mostrarMensajeVentas("Factura generada correctamente.", "ok");
  } catch (error) {
    mostrarMensajeVentas("Error al generar la factura.", "error");
  }
}

function limpiarSeleccionVentas() {
  pedidoSeleccionadoId = null;

  document.querySelectorAll("#ventasPedidosBody tr").forEach((tr) => {
    tr.classList.remove("selected");
  });

  const bodyProductos = document.getElementById("ventasProductosBody");
  bodyProductos.innerHTML = `
    <tr>
      <td colspan="5" class="ventas-empty">Seleccione un pedido para ver sus productos.</td>
    </tr>
  `;

  document.getElementById("cmbPagoVenta").value = "";
  mostrarMensajeVentas("");
}

export async function initVentasModule(panelPrincipal) {
  panelPrincipal.innerHTML = renderVentasView();

  pedidoSeleccionadoId = null;

  try {
    await cargarPedidosVentas();
  } catch (error) {
    mostrarMensajeVentas("Error cargando pedidos.", "error");
  }

  document.getElementById("txtBuscarPedidoVenta").addEventListener("input", filtrarPedidosVentas);

  document.getElementById("btnFacturaVenta").addEventListener("click", async () => {
    await generarFacturaPdfVenta();
  });

  document.getElementById("btnRegresarVentas").addEventListener("click", () => {
    limpiarSeleccionVentas();

    document.getElementById("btnActualizarEstadoVenta").addEventListener("click", async () => {
  await actualizarEstadoPedidoVenta();
});
  });
}