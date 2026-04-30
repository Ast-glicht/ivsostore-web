// frontend/js/modules/pedidos/pedidosEditar.js
const API_PEDIDOS = "/api/pedidos";
let clientes = [];
let vendedores = [];
let inventarioOriginal = [];
let inventarioVisual = [];
let productosAgregados = [];
let totalPedido = 0;
let idProductoSeleccionado = 0;
let precioUnitarioSeleccionado = 0;
let stockDisponibleSeleccionado = 0;

function renderPedidosNuevoView() {
  return `
    <div class="pedidos-module">
      <div class="pedidos-grid">
        <section class="pedidos-card">
          <h2>Nuevo Pedido</h2>

          <form id="pedidoForm" class="pedidos-form">
            <div class="pedidos-row">
              <label for="cmbClientesPedido">Cliente</label>
              <select id="cmbClientesPedido">
                <option value="">Seleccione un cliente</option>
              </select>
            </div>

            <div class="pedidos-row">
              <label for="cmbVendedoresPedido">Vendedor</label>
              <select id="cmbVendedoresPedido">
                <option value="">Seleccione un vendedor</option>
              </select>
            </div>

            <div class="pedidos-row">
              <label for="cmbEstadoPedido">Estado</label>
              <select id="cmbEstadoPedido">
                <option value="">Seleccione estado</option>
                <option value="Enviado">Enviado</option>
                <option value="En proceso">En proceso</option>
                <option value="Entregado">Entregado</option>
              </select>
            </div>

            <div class="helper-box">
              Seleccione un producto del inventario de la tabla de la derecha. Luego indique cantidad y precio de venta y presione <strong>Agregar producto</strong>.
            </div>

            <div class="pedidos-inline">
              <div class="pedidos-row">
                <label for="txtCantidadPedido">Cantidad</label>
                <input type="text" id="txtCantidadPedido" placeholder="Cantidad" />
              </div>

              <div class="pedidos-row">
                <label for="txtPrecioVentaPedido">Precio de venta</label>
                <input type="text" id="txtPrecioVentaPedido" placeholder="Precio de venta" />
              </div>
            </div>

            <div class="pedidos-actions">
              <button type="button" class="btn-pedidos btn-agregar-pedido" id="btnAgregarProductoPedido">
                Agregar producto
              </button>
              <button type="submit" class="btn-pedidos btn-guardar-pedido" id="btnGuardarPedido">
                Guardar pedido
              </button>
              <button type="button" class="btn-pedidos btn-cancelar-pedido" id="btnCancelarPedido">
                Cancelar
              </button>
            </div>

            <button type="button" class="btn-pedidos btn-editar-pedido" id="btnIrEditarPedidos">
              Ir a editar pedidos
            </button>

            <p id="pedidosMessage" class="pedidos-message"></p>
          </form>
        </section>

        <section class="pedidos-subgrid">
          <section class="pedidos-card">
            <h3>Inventario disponible</h3>

            <div class="pedidos-table-wrapper">
              <table class="pedidos-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Stock</th>
                    <th>Precio Unitario</th>
                  </tr>
                </thead>
                <tbody id="inventarioPedidoBody">
                  <tr>
                    <td colspan="4" class="pedidos-empty">Cargando inventario...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="pedidos-card">
            <h3>Detalle del pedido</h3>

            <div class="pedidos-table-wrapper">
              <table class="pedidos-table">
                <thead>
                  <tr>
                    <th>IDproducto</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Precio Venta</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody id="detallePedidoBody">
                  <tr>
                    <td colspan="6" class="pedidos-empty">No hay productos agregados.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="pedidos-detail-actions">
              <button type="button" class="btn-pedidos btn-eliminar-pedido" id="btnEliminarProductoPedido">
                Eliminar producto
              </button>
            </div>

            <div class="total-box">
              Monto Total:
              <span id="labelMontoTotal">C$ 0.00</span>
            </div>
          </section>
        </section>
      </div>
    </div>
  `;
}

function obtenerElementosPedido() {
  return {
    pedidoForm: document.getElementById("pedidoForm"),
    cmbClientesPedido: document.getElementById("cmbClientesPedido"),
    cmbVendedoresPedido: document.getElementById("cmbVendedoresPedido"),
    cmbEstadoPedido: document.getElementById("cmbEstadoPedido"),
    txtCantidadPedido: document.getElementById("txtCantidadPedido"),
    txtPrecioVentaPedido: document.getElementById("txtPrecioVentaPedido"),
    btnAgregarProductoPedido: document.getElementById("btnAgregarProductoPedido"),
    btnGuardarPedido: document.getElementById("btnGuardarPedido"),
    btnCancelarPedido: document.getElementById("btnCancelarPedido"),
    btnIrEditarPedidos: document.getElementById("btnIrEditarPedidos"),
    btnEliminarProductoPedido: document.getElementById("btnEliminarProductoPedido"),
    inventarioPedidoBody: document.getElementById("inventarioPedidoBody"),
    detallePedidoBody: document.getElementById("detallePedidoBody"),
    labelMontoTotal: document.getElementById("labelMontoTotal"),
    pedidosMessage: document.getElementById("pedidosMessage")
  };
}

function mostrarMensajePedido(texto, tipo = "") {
  const el = document.getElementById("pedidosMessage");
  if (!el) return;
  el.textContent = texto;
  el.className = "pedidos-message";
  if (tipo) {
    el.classList.add(tipo);
  }
}

function formatearMoneda(valor) {
  return `C$ ${Number(valor || 0).toFixed(2)}`;
}

function resetearFormularioPedido() {
  const {
    cmbClientesPedido,
    cmbVendedoresPedido,
    cmbEstadoPedido,
    txtCantidadPedido,
    txtPrecioVentaPedido,
    labelMontoTotal
  } = obtenerElementosPedido();

  productosAgregados = [];
  totalPedido = 0;
  idProductoSeleccionado = 0;
  precioUnitarioSeleccionado = 0;
  stockDisponibleSeleccionado = 0;

  cmbClientesPedido.value = "";
  cmbVendedoresPedido.value = "";
  cmbEstadoPedido.value = "";
  txtCantidadPedido.value = "";
  txtPrecioVentaPedido.value = "";
  labelMontoTotal.textContent = "C$ 0.00";

  inventarioVisual = inventarioOriginal.map((item) => ({ ...item }));
  renderInventarioPedido();
  renderDetallePedido();
  mostrarMensajePedido("");
}

function llenarCombo(select, data, valueKey, labelKey, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  data.forEach((item) => {
    const option = document.createElement("option");
    option.value = item[valueKey];
    option.textContent = item[labelKey];
    select.appendChild(option);
  });
}

async function cargarCombosPedido() {
  const { cmbClientesPedido, cmbVendedoresPedido } = obtenerElementosPedido();

  const [resClientes, resVendedores] = await Promise.all([
    fetch(`${API_PEDIDOS}/clientes`),
    fetch(`${API_PEDIDOS}/vendedores`)
  ]);

  const dataClientes = await resClientes.json();
  const dataVendedores = await resVendedores.json();

  if (!dataClientes.ok) {
    throw new Error(dataClientes.mensaje || "No se pudieron cargar los clientes.");
  }

  if (!dataVendedores.ok) {
    throw new Error(dataVendedores.mensaje || "No se pudieron cargar los vendedores.");
  }

  clientes = dataClientes.data || [];
  vendedores = dataVendedores.data || [];

  llenarCombo(cmbClientesPedido, clientes, "idCliente", "nombre", "Seleccione un cliente");
  llenarCombo(cmbVendedoresPedido, vendedores, "idVendedor", "nombreVendedor", "Seleccione un vendedor");
}

async function cargarInventarioPedido() {
  const { inventarioPedidoBody } = obtenerElementosPedido();

  inventarioPedidoBody.innerHTML = `
    <tr>
      <td colspan="4" class="pedidos-empty">Cargando inventario...</td>
    </tr>
  `;

  const response = await fetch(`${API_PEDIDOS}/inventario`);
  const resultado = await response.json();

  if (!resultado.ok) {
    throw new Error(resultado.mensaje || "No se pudo cargar el inventario.");
  }

  inventarioOriginal = (resultado.data || []).map((item) => ({ ...item }));
  inventarioVisual = inventarioOriginal.map((item) => ({ ...item }));

  renderInventarioPedido();
}

function renderInventarioPedido() {
  const { inventarioPedidoBody } = obtenerElementosPedido();

  if (!inventarioVisual.length) {
    inventarioPedidoBody.innerHTML = `
      <tr>
        <td colspan="4" class="pedidos-empty">No hay inventario disponible.</td>
      </tr>
    `;
    return;
  }

  inventarioPedidoBody.innerHTML = inventarioVisual.map((item) => `
    <tr data-id="${item.idProducto}">
      <td>${item.idProducto}</td>
      <td>${item.nombreProducto}</td>
      <td>${item.stock}</td>
      <td>${formatearMoneda(item.precio)}</td>
    </tr>
  `).join("");

  inventarioPedidoBody.querySelectorAll("tr").forEach((fila) => {
    fila.addEventListener("click", () => seleccionarProductoInventario(fila));
  });
}

function seleccionarProductoInventario(fila) {
  const id = Number(fila.dataset.id);
  const producto = inventarioVisual.find((item) => Number(item.idProducto) === id);
  if (!producto) return;

  document.querySelectorAll("#inventarioPedidoBody tr").forEach((tr) => {
    tr.classList.remove("selected");
  });
  fila.classList.add("selected");

  idProductoSeleccionado = producto.idProducto;
  precioUnitarioSeleccionado = Number(producto.precio);
  stockDisponibleSeleccionado = Number(producto.stock);

  mostrarMensajePedido(`Producto seleccionado: ${producto.nombreProducto}`, "ok");
}

function renderDetallePedido() {
  const { detallePedidoBody, labelMontoTotal } = obtenerElementosPedido();

  if (!productosAgregados.length) {
    detallePedidoBody.innerHTML = `
      <tr>
        <td colspan="6" class="pedidos-empty">No hay productos agregados.</td>
      </tr>
    `;
    labelMontoTotal.textContent = "C$ 0.00";
    return;
  }

  detallePedidoBody.innerHTML = productosAgregados.map((item) => `
    <tr data-id="${item.idProducto}">
      <td>${item.idProducto}</td>
      <td>${item.nombre}</td>
      <td>${item.cantidad}</td>
      <td>${formatearMoneda(item.precioUnitario)}</td>
      <td>${formatearMoneda(item.precioVenta)}</td>
      <td>${formatearMoneda(item.subtotal)}</td>
    </tr>
  `).join("");

  detallePedidoBody.querySelectorAll("tr").forEach((fila) => {
    fila.addEventListener("click", () => seleccionarProductoDetalle(fila));
  });

  labelMontoTotal.textContent = formatearMoneda(totalPedido);
}

function seleccionarProductoDetalle(fila) {
  document.querySelectorAll("#detallePedidoBody tr").forEach((tr) => {
    tr.classList.remove("selected");
  });
  fila.classList.add("selected");
}

function validarCantidad(cantidadTexto) {
  if (!/^\d+$/.test(cantidadTexto)) {
    return "No se pueden poner letras ni caracteres raros en la cantidad.";
  }

  const cantidad = Number(cantidadTexto);
  if (cantidad <= 0) {
    return "La cantidad debe ser mayor a 0.";
  }

  return null;
}

function validarPrecioVenta(precioTexto) {
  if (!/^\d+(\.\d+)?$/.test(precioTexto)) {
    return "No se pueden poner letras ni caracteres raros en el precio de venta.";
  }

  const precio = Number(precioTexto);
  if (precio <= 0) {
    return "El precio de venta debe ser mayor a 0.";
  }

  return null;
}

function agregarProductoAlPedido() {
  const { txtCantidadPedido, txtPrecioVentaPedido } = obtenerElementosPedido();

  if (!idProductoSeleccionado || !txtCantidadPedido.value.trim() || !txtPrecioVentaPedido.value.trim()) {
    mostrarMensajePedido("Seleccione un producto del inventario y complete cantidad y precio de venta.", "error");
    return;
  }

  const errorCantidad = validarCantidad(txtCantidadPedido.value.trim());
  if (errorCantidad) {
    mostrarMensajePedido(errorCantidad, "error");
    return;
  }

  const errorPrecio = validarPrecioVenta(txtPrecioVentaPedido.value.trim());
  if (errorPrecio) {
    mostrarMensajePedido(errorPrecio, "error");
    return;
  }

  const cantidad = Number(txtCantidadPedido.value.trim());
  const precioVenta = Number(txtPrecioVentaPedido.value.trim());

  if (cantidad > stockDisponibleSeleccionado) {
    mostrarMensajePedido(`Stock insuficiente. Solo hay ${stockDisponibleSeleccionado} unidades disponibles.`, "error");
    return;
  }

  if (productosAgregados.some((p) => Number(p.idProducto) === Number(idProductoSeleccionado))) {
    mostrarMensajePedido("Este producto ya fue agregado.", "error");
    return;
  }

  const productoInventario = inventarioVisual.find((p) => Number(p.idProducto) === Number(idProductoSeleccionado));
  if (!productoInventario) {
    mostrarMensajePedido("Producto no encontrado en inventario.", "error");
    return;
  }

  const prod = {
    idProducto: Number(idProductoSeleccionado),
    nombre: productoInventario.nombreProducto,
    cantidad,
    precioUnitario: Number(precioUnitarioSeleccionado),
    precioVenta,
    subtotal: cantidad * precioVenta
  };

  productosAgregados.push(prod);
  totalPedido += prod.subtotal;

  productoInventario.stock = Number(productoInventario.stock) - cantidad;

  renderInventarioPedido();
  renderDetallePedido();

  txtCantidadPedido.value = "";
  txtPrecioVentaPedido.value = "";

  mostrarMensajePedido("Producto agregado al pedido.", "ok");
}

function eliminarProductoDelPedido() {
  const filaSeleccionada = document.querySelector("#detallePedidoBody tr.selected");

  if (!filaSeleccionada) {
    mostrarMensajePedido("Seleccione un producto para eliminar.", "error");
    return;
  }

  const idProducto = Number(filaSeleccionada.dataset.id);
  const prodEliminar = productosAgregados.find((p) => Number(p.idProducto) === idProducto);

  if (!prodEliminar) {
    mostrarMensajePedido("No se encontró el producto a eliminar.", "error");
    return;
  }

  totalPedido -= prodEliminar.subtotal;
  productosAgregados = productosAgregados.filter((p) => Number(p.idProducto) !== idProducto);

  const productoInventario = inventarioVisual.find((p) => Number(p.idProducto) === idProducto);
  if (productoInventario) {
    productoInventario.stock = Number(productoInventario.stock) + Number(prodEliminar.cantidad);
  }

  renderInventarioPedido();
  renderDetallePedido();

  mostrarMensajePedido("Producto eliminado del pedido.", "ok");
}

function construirPayloadPedido() {
  const { cmbClientesPedido, cmbVendedoresPedido, cmbEstadoPedido } = obtenerElementosPedido();

  return {
    idCliente: Number(cmbClientesPedido.value),
    idVendedor: Number(cmbVendedoresPedido.value),
    estado: cmbEstadoPedido.value?.trim() ? cmbEstadoPedido.value.trim() : "En proceso",
    detalle: productosAgregados.map((item) => ({
      idProducto: Number(item.idProducto),
      cantidad: Number(item.cantidad),
      precioVenta: Number(item.precioVenta)
    }))
  };
}

async function guardarPedido() {
  const { cmbClientesPedido, cmbVendedoresPedido } = obtenerElementosPedido();

  if (!cmbClientesPedido.value || !cmbVendedoresPedido.value || productosAgregados.length === 0) {
    mostrarMensajePedido("Debe completar cliente, vendedor y agregar al menos un producto.", "error");
    return;
  }

  if (totalPedido <= 0) {
    mostrarMensajePedido("El pedido no puede tener monto total 0.", "error");
    return;
  }

  if (productosAgregados.some((p) => Number(p.cantidad) <= 0)) {
    mostrarMensajePedido("Todos los productos deben tener cantidad mayor a 0.", "error");
    return;
  }

  try {
    const payload = construirPayloadPedido();

    const response = await fetch(API_PEDIDOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const resultado = await response.json();

    if (!resultado.ok) {
      mostrarMensajePedido(resultado.mensaje || "Error al guardar el pedido.", "error");
      return;
    }

    mostrarMensajePedido(`Pedido creado correctamente (ID: ${resultado.idPedido})`, "ok");
    resetearFormularioPedido();
    await cargarInventarioPedido();
  } catch (error) {
    mostrarMensajePedido("Error al guardar el pedido.", "error");
  }
}

function aplicarRestriccionesPedidos() {
  const { txtCantidadPedido, txtPrecioVentaPedido } = obtenerElementosPedido();

  txtCantidadPedido.addEventListener("keypress", (e) => {
    if (!/[0-9]/.test(e.key) && e.key.length === 1) {
      e.preventDefault();
    }
  });

  txtPrecioVentaPedido.addEventListener("keypress", (e) => {
    const valor = txtPrecioVentaPedido.value;

    if (!charPermitidoPrecio(e.key, valor)) {
      e.preventDefault();
    }
  });
}

function charPermitidoPrecio(key, valorActual) {
  if (key.length !== 1) return true;
  if (/[0-9]/.test(key)) return true;
  if (key === "." && !valorActual.includes(".") && valorActual.length > 0) return true;
  return false;
}

export async function initPedidosNuevoModule(panelPrincipal, options = {}) {
  panelPrincipal.innerHTML = renderPedidosNuevoView();

  const {
    pedidoForm,
    btnAgregarProductoPedido,
    btnCancelarPedido,
    btnEliminarProductoPedido,
    btnIrEditarPedidos
  } = obtenerElementosPedido();

  productosAgregados = [];
  totalPedido = 0;
  idProductoSeleccionado = 0;
  precioUnitarioSeleccionado = 0;
  stockDisponibleSeleccionado = 0;

  aplicarRestriccionesPedidos();

  try {
    await Promise.all([
      cargarCombosPedido(),
      cargarInventarioPedido()
    ]);

    renderDetallePedido();
  } catch (error) {
    mostrarMensajePedido("Error al cargar datos para pedidos.", "error");
  }

  btnAgregarProductoPedido.addEventListener("click", () => {
    agregarProductoAlPedido();
  });

  btnEliminarProductoPedido.addEventListener("click", () => {
    eliminarProductoDelPedido();
  });

  btnCancelarPedido.addEventListener("click", () => {
    resetearFormularioPedido();
  });

  pedidoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await guardarPedido();
  });

  btnIrEditarPedidos.addEventListener("click", () => {
    if (typeof options.onOpenEditPedidos === "function") {
      options.onOpenEditPedidos();
      return;
    }

    mostrarMensajePedido("La vista de edición de pedidos la conectaremos en el siguiente paso.", "ok");
  });
}