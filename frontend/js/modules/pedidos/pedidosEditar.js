// frontend/js/modules/pedidos/pedidosEditar.js
const API_PEDIDOS = "https://ivsostore-web-production.up.railway.app/api/pedidos";
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

function formatearMoneda(valor) {
  return `C$ ${Number(valor || 0).toFixed(2)}`;
}

function renderPedidosEditarView() {
  return `
    <div class="pedidos-module">
      <div class="pedidos-card">
        <h2>Editar Pedidos</h2>

        <div class="pedidos-row" style="margin-bottom: 18px;">
          <label for="txtBuscarPedidos">Buscar pedido</label>
          <input
            type="text"
            id="txtBuscarPedidos"
            placeholder="Buscar por cliente, vendedor, estado, monto o ID"
          />
        </div>

        <div class="pedidos-table-wrapper">
          <table class="pedidos-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Estado</th>
                <th>Monto Total</th>
              </tr>
            </thead>
            <tbody id="pedidosListadoBody">
              <tr>
                <td colspan="6" class="pedidos-empty">Cargando pedidos...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pedidos-actions" style="margin-top: 18px;">
          <button type="button" class="btn-pedidos btn-agregar-pedido" id="btnAbrirDetallePedido">
            Abrir pedido seleccionado
          </button>
          <button type="button" class="btn-pedidos btn-cancelar-pedido" id="btnVolverNuevoPedido">
            Volver a nuevo pedido
          </button>
        </div>

        <p id="pedidosEditarMessage" class="pedidos-message"></p>
      </div>
    </div>
  `;
}

function mostrarMensajeEditar(texto, tipo = "") {
  const el = document.getElementById("pedidosEditarMessage");
  if (!el) return;
  el.textContent = texto;
  el.className = "pedidos-message";
  if (tipo) el.classList.add(tipo);
}

let pedidosListado = [];
let pedidoSeleccionadoId = null;

function renderTablaPedidos(data) {
  const body = document.getElementById("pedidosListadoBody");

  if (!data.length) {
    body.innerHTML = `
      <tr>
        <td colspan="6" class="pedidos-empty">No hay pedidos registrados.</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = data.map((pedido) => `
    <tr data-id="${pedido.idPedido}">
      <td>${pedido.idPedido}</td>
      <td>${formatearFecha(pedido.fechaPedido)}</td>
      <td>${pedido.cliente ?? ""}</td>
      <td>${pedido.vendedor ?? ""}</td>
      <td>${pedido.estado ?? ""}</td>
      <td>${formatearMoneda(pedido.montoTotal)}</td>
    </tr>
  `).join("");

  body.querySelectorAll("tr").forEach((fila) => {
    fila.addEventListener("click", () => {
      document.querySelectorAll("#pedidosListadoBody tr").forEach((tr) => {
        tr.classList.remove("selected");
      });
      fila.classList.add("selected");
      pedidoSeleccionadoId = Number(fila.dataset.id);
      mostrarMensajeEditar(`Pedido seleccionado: ${pedidoSeleccionadoId}`, "ok");
    });
  });
}

async function cargarPedidos() {
  const response = await fetch(API_PEDIDOS);
  const resultado = await response.json();

  if (!resultado.ok) {
    throw new Error(resultado.mensaje || "No se pudieron cargar los pedidos.");
  }

  pedidosListado = resultado.data || [];
  renderTablaPedidos(pedidosListado);
}

function filtrarPedidos() {
  const input = document.getElementById("txtBuscarPedidos");
  const filtro = input.value.trim().toLowerCase();

  if (!filtro) {
    renderTablaPedidos(pedidosListado);
    return;
  }

  const filtrados = pedidosListado.filter((pedido) => {
    return (
      String(pedido.idPedido ?? "").toLowerCase().includes(filtro) ||
      String(pedido.cliente ?? "").toLowerCase().includes(filtro) ||
      String(pedido.vendedor ?? "").toLowerCase().includes(filtro) ||
      String(pedido.estado ?? "").toLowerCase().includes(filtro) ||
      String(pedido.montoTotal ?? "").toLowerCase().includes(filtro) ||
      String(formatearFecha(pedido.fechaPedido) ?? "").toLowerCase().includes(filtro)
    );
  });

  renderTablaPedidos(filtrados);
}

export async function initPedidosEditarModule(panelPrincipal, options = {}) {
  panelPrincipal.innerHTML = renderPedidosEditarView();

  pedidoSeleccionadoId = null;

  try {
    await cargarPedidos();
  } catch (error) {
    mostrarMensajeEditar("Error al cargar pedidos.", "error");
  }

  document.getElementById("txtBuscarPedidos").addEventListener("input", filtrarPedidos);

  document.getElementById("btnAbrirDetallePedido").addEventListener("click", () => {
    if (!pedidoSeleccionadoId) {
      mostrarMensajeEditar("Seleccione un pedido primero.", "error");
      return;
    }

    if (typeof options.onOpenPedidoDetalle === "function") {
      options.onOpenPedidoDetalle(pedidoSeleccionadoId);
    }
  });

  document.getElementById("btnVolverNuevoPedido").addEventListener("click", () => {
    if (typeof options.onVolverNuevoPedido === "function") {
      options.onVolverNuevoPedido();
    }
  });
}