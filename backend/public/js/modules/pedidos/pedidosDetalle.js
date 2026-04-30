// frontend/js/modules/pedidos/pedidosEditar.js
const API_PEDIDOS = "https://ivsostore-web-production.up.railway.app/api/pedidos";
let pedidoActual = null;
let detalleActual = [];
let inventarioDetalle = [];
let idProductoSeleccionado = 0;
let precioUnitarioSeleccionado = 0;
let stockDisponibleSeleccionado = 0;

function formatearMoneda(valor) {
  return `C$ ${Number(valor || 0).toFixed(2)}`;
}

function fechaInputLocal(fecha) {
  if (!fecha) return "";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderPedidoDetalleView() {
  return `
    <div class="pedidos-module">
      <div class="pedidos-grid">
        <section class="pedidos-card">
          <h2>Detalle del Pedido</h2>

          <div class="pedidos-form">
            <div class="pedidos-row">
              <label for="dtpFechaPedidoEditar">Fecha del pedido</label>
              <input type="datetime-local" id="dtpFechaPedidoEditar" />
            </div>

            <div class="pedidos-row">
              <label for="cmbEstadoPedidoEditar">Estado</label>
              <select id="cmbEstadoPedidoEditar">
                <option value="">Seleccione estado</option>
                <option value="Enviado">Enviado</option>
                <option value="En proceso">En proceso</option>
                <option value="Entregado">Entregado</option>
                <option value="Completado">Completado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div class="pedidos-inline">
              <div class="pedidos-row">
                <label for="txtCantidadEditarPedido">Cantidad</label>
                <input type="text" id="txtCantidadEditarPedido" placeholder="Cantidad" />
              </div>

              <div class="pedidos-row">
                <label for="txtPrecioVentaEditarPedido">Precio de venta</label>
                <input type="text" id="txtPrecioVentaEditarPedido" placeholder="Precio de venta" />
              </div>
            </div>

            <div class="pedidos-actions">
              <button type="button" class="btn-pedidos btn-agregar-pedido" id="btnAgregarNuevoProductoPedido">
                Agregar nuevo producto
              </button>
              <button type="button" class="btn-pedidos btn-eliminar-pedido" id="btnEliminarProductoDetallePedido">
                Eliminar producto
              </button>
              <button type="button" class="btn-pedidos btn-guardar-pedido" id="btnGuardarCambiosPedido">
                Guardar cambios
              </button>
            </div>

            <button type="button" class="btn-pedidos btn-cancelar-pedido" id="btnVolverListaPedidos">
              Volver a lista de pedidos
            </button>

            <p id="pedidoDetalleMessage" class="pedidos-message"></p>
          </div>
        </section>

        <section class="pedidos-subgrid">
          <section class="pedidos-card">
            <h3>Inventario disponible</h3>

            <div class="pedidos-table-wrapper">
              <table class="pedidos-table">
                <thead>
                  <tr>
                    <th>IDProducto</th>
                    <th>NombreProducto</th>
                    <th>Stock</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody id="inventarioDetalleBody">
                  <tr>
                    <td colspan="4" class="pedidos-empty">Cargando inventario...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="pedidos-card">
            <h3>Detalle del pedido actual</h3>

            <div class="pedidos-table-wrapper">
              <table class="pedidos-table">
                <thead>
                  <tr>
                    <th>IDproducto</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>PrecioUnitario</th>
                    <th>PrecioVenta</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody id="detallePedidoEditarBody">
                  <tr>
                    <td colspan="6" class="pedidos-empty">Cargando detalle...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </div>
  `;
}

function mostrarMensajeDetalle(texto, tipo = "") {
  const el = document.getElementById("pedidoDetalleMessage");
  if (!el) return;
  el.textContent = texto;
  el.className = "pedidos-message";
  if (tipo) el.classList.add(tipo);
}

function renderInventarioDetalle() {
  const body = document.getElementById("inventarioDetalleBody");

  if (!inventarioDetalle.length) {
    body.innerHTML = `
      <tr>
        <td colspan="4" class="pedidos-empty">No hay inventario disponible.</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = inventarioDetalle.map((item) => `
    <tr data-id="${item.idProducto}">
      <td>${item.idProducto}</td>
      <td>${item.nombreProducto}</td>
      <td>${item.stock}</td>
      <td>${formatearMoneda(item.precio)}</td>
    </tr>
  `).join("");

  body.querySelectorAll("tr").forEach((fila) => {
    fila.addEventListener("click", () => {
      document.querySelectorAll("#inventarioDetalleBody tr").forEach((tr) => tr.classList.remove("selected"));
      fila.classList.add("selected");

      const id = Number(fila.dataset.id);
      const producto = inventarioDetalle.find((p) => Number(p.idProducto) === id);
      if (!producto) return;

      idProductoSeleccionado = producto.idProducto;
      precioUnitarioSeleccionado = Number(producto.precio);
      stockDisponibleSeleccionado = Number(producto.stock);

      mostrarMensajeDetalle(`Producto seleccionado: ${producto.nombreProducto}`, "ok");
    });
  });
}

function renderDetalleActual() {
  const body = document.getElementById("detallePedidoEditarBody");

  if (!detalleActual.length) {
    body.innerHTML = `
      <tr>
        <td colspan="6" class="pedidos-empty">Este pedido no tiene productos.</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = detalleActual.map((item) => `
    <tr data-id="${item.idProducto}">
      <td>${item.idProducto}</td>
      <td>${item.producto}</td>
      <td>${item.cantidad}</td>
      <td>${formatearMoneda(item.precioUnitario)}</td>
      <td>${formatearMoneda(item.precioVenta)}</td>
      <td>${formatearMoneda(item.subtotal)}</td>
    </tr>
  `).join("");

  body.querySelectorAll("tr").forEach((fila) => {
    fila.addEventListener("click", () => {
      document.querySelectorAll("#detallePedidoEditarBody tr").forEach((tr) => tr.classList.remove("selected"));
      fila.classList.add("selected");

      const id = Number(fila.dataset.id);
      const producto = detalleActual.find((p) => Number(p.idProducto) === id);
      if (!producto) return;

      document.getElementById("txtCantidadEditarPedido").value = producto.cantidad;
      document.getElementById("txtPrecioVentaEditarPedido").value = producto.precioVenta;

      mostrarMensajeDetalle(`Producto del pedido seleccionado: ${producto.producto}`, "ok");
    });
  });
}

async function cargarInventarioDisponible() {
  const response = await fetch(`${API_PEDIDOS}/inventario`);
  const resultado = await response.json();

  if (!resultado.ok) {
    throw new Error(resultado.mensaje || "No se pudo cargar inventario.");
  }

  inventarioDetalle = resultado.data || [];
  renderInventarioDetalle();
}

async function cargarPedido(idPedido) {
  const response = await fetch(`${API_PEDIDOS}/${idPedido}`);
  const resultado = await response.json();

  if (!resultado.ok) {
    throw new Error(resultado.mensaje || "No se pudo cargar el pedido.");
  }

  pedidoActual = resultado.data;
  detalleActual = (pedidoActual.detalle || []).map((item) => ({
    ...item,
    idProducto: Number(item.idProducto),
    cantidad: Number(item.cantidad),
    precioVenta: Number(item.precioVenta),
    precioUnitario: Number(item.precioUnitario),
    subtotal: Number(item.subtotal)
  }));

  document.getElementById("dtpFechaPedidoEditar").value = fechaInputLocal(pedidoActual.fechaPedido);
  document.getElementById("cmbEstadoPedidoEditar").value = pedidoActual.estado || "";

  renderDetalleActual();
}

function validarCantidadTexto(valor) {
  return /^\d+$/.test(valor) && Number(valor) > 0;
}

function validarPrecioTexto(valor) {
  return /^\d+(\.\d+)?$/.test(valor) && Number(valor) > 0;
}

function agregarNuevoProductoPedido() {
  if (!idProductoSeleccionado) {
    mostrarMensajeDetalle("Seleccione un producto del inventario.", "error");
    return;
  }

  const txtCantidad = document.getElementById("txtCantidadEditarPedido");
  const txtPrecioVenta = document.getElementById("txtPrecioVentaEditarPedido");

  if (!validarCantidadTexto(txtCantidad.value.trim())) {
    mostrarMensajeDetalle("Cantidad inválida. Debe ser mayor que 0 y solo números enteros.", "error");
    return;
  }

  if (!validarPrecioTexto(txtPrecioVenta.value.trim())) {
    mostrarMensajeDetalle("Precio de venta inválido. Debe ser mayor que 0 y solo números decimales.", "error");
    return;
  }

  const cantidadNueva = Number(txtCantidad.value.trim());
  const precioVentaNuevo = Number(txtPrecioVenta.value.trim());

  const existente = detalleActual.find((r) => Number(r.idProducto) === Number(idProductoSeleccionado));
  const productoInventario = inventarioDetalle.find((r) => Number(r.idProducto) === Number(idProductoSeleccionado));

  if (!productoInventario) {
    mostrarMensajeDetalle("Producto no encontrado en inventario.", "error");
    return;
  }

  if (existente) {
    existente.cantidad = Number(existente.cantidad) + cantidadNueva;
    existente.precioVenta = precioVentaNuevo;
    existente.precioUnitario = precioUnitarioSeleccionado;
    existente.subtotal = existente.cantidad * existente.precioVenta;
  } else {
    detalleActual.push({
      idProducto: Number(idProductoSeleccionado),
      producto: productoInventario.nombreProducto,
      cantidad: cantidadNueva,
      precioVenta: precioVentaNuevo,
      precioUnitario: precioUnitarioSeleccionado,
      subtotal: cantidadNueva * precioVentaNuevo
    });
  }

  renderDetalleActual();
  mostrarMensajeDetalle("Producto agregado/modificado en el detalle.", "ok");
}

function eliminarProductoDetalle() {
  const fila = document.querySelector("#detallePedidoEditarBody tr.selected");

  if (!fila) {
    mostrarMensajeDetalle("Seleccione un producto.", "error");
    return;
  }

  const id = Number(fila.dataset.id);
  detalleActual = detalleActual.filter((item) => Number(item.idProducto) !== id);

  renderDetalleActual();
  mostrarMensajeDetalle("Producto eliminado del detalle.", "ok");
}

function construirPayloadActualizarPedido() {
  return {
    fechaPedido: document.getElementById("dtpFechaPedidoEditar").value,
    estado: document.getElementById("cmbEstadoPedidoEditar").value,
    detalle: detalleActual.map((item) => ({
      idProducto: Number(item.idProducto),
      cantidad: Number(item.cantidad),
      precioVenta: Number(item.precioVenta),
      precioUnitario: Number(item.precioUnitario)
    }))
  };
}

async function guardarCambiosPedido(idPedido) {
  const estado = document.getElementById("cmbEstadoPedidoEditar").value;

  if (!estado.trim()) {
    mostrarMensajeDetalle("Seleccione un estado.", "error");
    return;
  }

  if (detalleActual.length === 0 && estado !== "Cancelado") {
    mostrarMensajeDetalle("El pedido no tiene productos. Si desea dejarlo así, márquelo como Cancelado.", "error");
    return;
  }

  const payload = construirPayloadActualizarPedido();

  const response = await fetch(`${API_PEDIDOS}/${idPedido}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const resultado = await response.json();

  if (!resultado.ok) {
    mostrarMensajeDetalle(resultado.mensaje || "Error en los cambios.", "error");
    return false;
  }

  mostrarMensajeDetalle(resultado.mensaje || "Cambios aplicados exitosamente.", "ok");
  return true;
}

function aplicarRestriccionesDetalle() {
  const txtCantidad = document.getElementById("txtCantidadEditarPedido");
  const txtPrecioVenta = document.getElementById("txtPrecioVentaEditarPedido");

  txtCantidad.addEventListener("keypress", (e) => {
    if (!/[0-9]/.test(e.key) && e.key.length === 1) {
      e.preventDefault();
    }
  });

  txtPrecioVenta.addEventListener("keypress", (e) => {
    const valor = txtPrecioVenta.value;
    if (e.key.length === 1 && !/[0-9.]/.test(e.key)) {
      e.preventDefault();
      return;
    }

    if (e.key === "." && (valor.includes(".") || valor.length === 0)) {
      e.preventDefault();
    }
  });
}

export async function initPedidosDetalleModule(panelPrincipal, idPedido, options = {}) {
  panelPrincipal.innerHTML = renderPedidoDetalleView();

  pedidoActual = null;
  detalleActual = [];
  inventarioDetalle = [];
  idProductoSeleccionado = 0;
  precioUnitarioSeleccionado = 0;
  stockDisponibleSeleccionado = 0;

  aplicarRestriccionesDetalle();

  try {
    await Promise.all([
      cargarPedido(idPedido),
      cargarInventarioDisponible()
    ]);
  } catch (error) {
    mostrarMensajeDetalle("Error al cargar el detalle del pedido.", "error");
  }

  document.getElementById("btnAgregarNuevoProductoPedido").addEventListener("click", () => {
    agregarNuevoProductoPedido();
  });

  document.getElementById("btnEliminarProductoDetallePedido").addEventListener("click", () => {
    eliminarProductoDetalle();
  });

  document.getElementById("btnGuardarCambiosPedido").addEventListener("click", async () => {
    const ok = await guardarCambiosPedido(idPedido);
    if (ok) {
      await cargarPedido(idPedido);
      await cargarInventarioDisponible();
      if (typeof options.onPedidoActualizado === "function") {
        options.onPedidoActualizado();
      }
    }
  });

  document.getElementById("btnVolverListaPedidos").addEventListener("click", () => {
    if (typeof options.onVolverLista === "function") {
      options.onVolverLista();
    }
  });
}