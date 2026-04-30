const API_INVENTARIO = "https://ivsostore-web-production.up.railway.app/api/inventario";
let productosOriginales = [];
let productoIdActual = null;

function renderInventarioView() {
  return `
    <div class="inventario-module">
      <div class="inventario-grid">
        <section class="inventario-card">
          <h2>Gestión de Inventario</h2>

          <form id="inventarioForm" class="inventario-form">
            <div class="inventario-row">
              <label for="txtNombreProducto">Nombre del producto</label>
              <input type="text" id="txtNombreProducto" placeholder="Ingrese el nombre del producto" />
            </div>

            <div class="inventario-row">
              <label for="txtDescripcion">Descripción</label>
              <textarea id="txtDescripcion" placeholder="Ingrese la descripción"></textarea>
            </div>

            <div class="inventario-row">
              <label for="txtCodigo">Código</label>
              <input type="text" id="txtCodigo" placeholder="Ingrese el código" />
            </div>

            <div class="inventario-row">
              <label for="txtPrecio">Precio</label>
              <input type="number" step="0.01" id="txtPrecio" placeholder="Ingrese el precio" />
            </div>

            <div class="inventario-row">
              <label for="txtStock">Stock</label>
              <input type="number" step="1" id="txtStock" placeholder="Ingrese el stock" />
            </div>

            <div class="inventario-row">
              <label for="dtpFechaCompra">Fecha de compra</label>
              <input type="datetime-local" id="dtpFechaCompra" />
            </div>

            <div class="inventario-row">
              <label for="txtProveedor">Proveedor</label>
              <input type="text" id="txtProveedor" placeholder="Ingrese el proveedor" />
            </div>

            <div class="inventario-row">
              <label for="txtNumeroProveedor">Número del proveedor</label>
              <input type="text" id="txtNumeroProveedor" value="+505" />
            </div>

            <div class="inventario-actions">
              <button type="submit" class="btn-inventario btn-guardar-inv" id="btnGuardarInventario">Guardar</button>
              <button type="button" class="btn-inventario btn-actualizar-inv" id="btnActualizarInventario" disabled>Actualizar</button>
              <button type="button" class="btn-inventario btn-cancelar-inv" id="btnCancelarInventario">Cancelar</button>
            </div>

            <p id="inventarioMessage" class="inventario-message"></p>
          </form>
        </section>

        <section class="inventario-card">
          <h3>Listado de Productos</h3>

          <div class="inventario-toolbar">
            <label for="txtBuscarInventario">Buscar producto</label>
            <input type="text" id="txtBuscarInventario" placeholder="Buscar por nombre, código, descripción, proveedor, precio, stock..." />
          </div>

          <div class="inventario-table-wrapper">
            <table class="inventario-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Producto</th>
                  <th>Descripción</th>
                  <th>Código</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Fecha de Compra</th>
                  <th>Proveedor</th>
                  <th>Número Proveedor</th>
                </tr>
              </thead>
              <tbody id="inventarioTableBody">
                <tr>
                  <td colspan="9" class="inventario-empty">Cargando productos...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  `;
}

function obtenerElementosInventario() {
  return {
    form: document.getElementById("inventarioForm"),
    txtNombreProducto: document.getElementById("txtNombreProducto"),
    txtDescripcion: document.getElementById("txtDescripcion"),
    txtCodigo: document.getElementById("txtCodigo"),
    txtPrecio: document.getElementById("txtPrecio"),
    txtStock: document.getElementById("txtStock"),
    dtpFechaCompra: document.getElementById("dtpFechaCompra"),
    txtProveedor: document.getElementById("txtProveedor"),
    txtNumeroProveedor: document.getElementById("txtNumeroProveedor"),
    btnGuardarInventario: document.getElementById("btnGuardarInventario"),
    btnActualizarInventario: document.getElementById("btnActualizarInventario"),
    btnCancelarInventario: document.getElementById("btnCancelarInventario"),
    inventarioMessage: document.getElementById("inventarioMessage"),
    txtBuscarInventario: document.getElementById("txtBuscarInventario"),
    inventarioTableBody: document.getElementById("inventarioTableBody")
  };
}

function mostrarMensajeInventario(texto, tipo = "") {
  const el = document.getElementById("inventarioMessage");
  if (!el) return;
  el.textContent = texto;
  el.className = "inventario-message";
  if (tipo) {
    el.classList.add(tipo);
  }
}

function obtenerFechaActualLocalInput() {
  const ahora = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  const year = ahora.getFullYear();
  const month = pad(ahora.getMonth() + 1);
  const day = pad(ahora.getDate());
  const hours = pad(ahora.getHours());
  const minutes = pad(ahora.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function normalizarNumeroProveedor(valor) {
  const limpio = String(valor || "").trim();
  if (!limpio) return "+505";
  return limpio.startsWith("+505") ? limpio : `+505${limpio}`;
}

function formatearFechaTabla(fecha) {
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

function limpiarCamposInventario() {
  const {
    txtNombreProducto,
    txtDescripcion,
    txtCodigo,
    txtPrecio,
    txtStock,
    dtpFechaCompra,
    txtProveedor,
    txtNumeroProveedor,
    btnActualizarInventario,
    btnGuardarInventario
  } = obtenerElementosInventario();

  productoIdActual = null;

  txtNombreProducto.value = "";
  txtDescripcion.value = "";
  txtCodigo.value = "";
  txtPrecio.value = "";
  txtStock.value = "";
  dtpFechaCompra.value = obtenerFechaActualLocalInput();
  txtProveedor.value = "";
  txtNumeroProveedor.value = "+505";

  btnActualizarInventario.disabled = true;
  btnGuardarInventario.disabled = false;

  mostrarMensajeInventario("");
}

function validarCamposInventario(data) {
  if (
    !data.nombreProducto.trim() ||
    !data.descripcion.trim() ||
    !data.codigo.trim() ||
    !String(data.precio).trim() ||
    !String(data.stock).trim() ||
    !data.proveedor.trim() ||
    !data.numeroProveedor.trim()
  ) {
    return "Por favor, complete todos los campos.";
  }

  if (!/^[a-zA-Z0-9\s]+$/.test(data.nombreProducto.trim())) {
    return "El nombre del producto solo puede contener letras, números y espacios.";
  }

  if (!/^[a-zA-Z0-9\s.\-]+$/.test(data.descripcion.trim())) {
    return "La descripción contiene caracteres no permitidos.";
  }

  const precio = Number(data.precio);
  if (Number.isNaN(precio) || precio <= 0) {
    return "Precio inválido. No se pueden poner letras o números negativos.";
  }

  const stock = Number(data.stock);
  if (!Number.isInteger(stock) || stock < 0) {
    return "Stock inválido. No se pueden poner letras o números negativos.";
  }

  let numeroProveedor = String(data.numeroProveedor).trim();
  if (!numeroProveedor.startsWith("+505")) {
    numeroProveedor = "+505" + numeroProveedor.replace(/^\+/, "");
  }

  const soloNumero = numeroProveedor.substring(4);
  if (!/^[0-9]{8}$/.test(soloNumero)) {
    return "El número de proveedor debe tener 8 dígitos después de +505.";
  }

  if (data.fechaDeCompra) {
    const fecha = new Date(data.fechaDeCompra);
    const ahora = new Date();

    if (Number.isNaN(fecha.getTime())) {
      return "La fecha de compra es inválida.";
    }

    if (fecha > ahora) {
      return "La fecha de compra no puede ser futura.";
    }
  }

  return null;
}

function obtenerDatosFormularioInventario() {
  const {
    txtNombreProducto,
    txtDescripcion,
    txtCodigo,
    txtPrecio,
    txtStock,
    dtpFechaCompra,
    txtProveedor,
    txtNumeroProveedor
  } = obtenerElementosInventario();

  return {
    nombreProducto: txtNombreProducto.value,
    descripcion: txtDescripcion.value,
    codigo: txtCodigo.value,
    precio: txtPrecio.value,
    stock: txtStock.value,
    fechaDeCompra: dtpFechaCompra.value,
    proveedor: txtProveedor.value,
    numeroProveedor: txtNumeroProveedor.value
  };
}

async function cargarProductos() {
  const { inventarioTableBody } = obtenerElementosInventario();

  inventarioTableBody.innerHTML = `
    <tr>
      <td colspan="9" class="inventario-empty">Cargando productos...</td>
    </tr>
  `;

  try {
    const response = await fetch(API_INVENTARIO);
    const resultado = await response.json();

    if (!resultado.ok) {
      throw new Error(resultado.mensaje || "No se pudieron cargar los productos.");
    }

    productosOriginales = resultado.data || [];
    renderTablaInventario(productosOriginales);
  } catch (error) {
    inventarioTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="inventario-empty">Error al cargar productos.</td>
      </tr>
    `;
    mostrarMensajeInventario("Error al cargar los productos.", "error");
  }
}

function renderTablaInventario(productos) {
  const { inventarioTableBody } = obtenerElementosInventario();

  if (!productos.length) {
    inventarioTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="inventario-empty">No hay productos registrados.</td>
      </tr>
    `;
    return;
  }

  inventarioTableBody.innerHTML = productos.map((producto) => `
    <tr data-id="${producto.idproducto}">
      <td>${producto.idproducto ?? ""}</td>
      <td>${producto.nombreProducto ?? ""}</td>
      <td>${producto.descripcion ?? ""}</td>
      <td>${producto.codigo ?? ""}</td>
      <td>${producto.precio ?? ""}</td>
      <td>${producto.stock ?? ""}</td>
      <td>${formatearFechaTabla(producto.fechaDeCompra)}</td>
      <td>${producto.proveedor ?? ""}</td>
      <td>${normalizarNumeroProveedor(producto.numeroProveedor ?? "")}</td>
    </tr>
  `).join("");

  inventarioTableBody.querySelectorAll("tr").forEach((fila) => {
    fila.addEventListener("click", () => seleccionarProductoDesdeFila(fila));
  });
}

function mostrarAlertaStockBajo() {
  const productosStockBajo = productosOriginales.filter((producto) => {
    return Number(producto.stock) < 10;
  });

  if (productosStockBajo.length === 0) return;

  const alertaAnterior = document.getElementById("stockAlertOverlay");
  if (alertaAnterior) alertaAnterior.remove();

  const overlay = document.createElement("div");
  overlay.className = "stock-alert-overlay";
  overlay.id = "stockAlertOverlay";

  overlay.innerHTML = `
    <div class="stock-alert-modal">
      <div class="stock-alert-header">
        <h3>Alerta de stock bajo</h3>
        <button type="button" class="stock-alert-close" id="cerrarStockAlert">×</button>
      </div>

      <p class="stock-alert-text">
        Los siguientes productos tienen menos de 10 unidades disponibles:
      </p>

      <div class="stock-alert-list">
        ${productosStockBajo.map((producto) => `
          <div class="stock-alert-item">
            <strong>${producto.nombreProducto || "Producto sin nombre"}</strong>
            <span>Stock: ${producto.stock}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("cerrarStockAlert").addEventListener("click", () => {
    overlay.remove();
  });
}

function convertirFechaParaInput(fecha) {
  if (!fecha) return obtenerFechaActualLocalInput();

  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return obtenerFechaActualLocalInput();

  const pad = (n) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function seleccionarProductoDesdeFila(fila) {
  const id = Number(fila.dataset.id);
  const producto = productosOriginales.find((item) => Number(item.idproducto) === id);
  if (!producto) return;

  document.querySelectorAll("#inventarioTableBody tr").forEach((tr) => {
    tr.classList.remove("selected");
  });
  fila.classList.add("selected");

  const {
    txtNombreProducto,
    txtDescripcion,
    txtCodigo,
    txtPrecio,
    txtStock,
    dtpFechaCompra,
    txtProveedor,
    txtNumeroProveedor,
    btnActualizarInventario,
    btnGuardarInventario
  } = obtenerElementosInventario();

  productoIdActual = producto.idproducto;

  txtNombreProducto.value = producto.nombreProducto || "";
  txtDescripcion.value = producto.descripcion || "";
  txtCodigo.value = producto.codigo || "";
  txtPrecio.value = producto.precio ?? "";
  txtStock.value = producto.stock ?? "";
  dtpFechaCompra.value = convertirFechaParaInput(producto.fechaDeCompra);
  txtProveedor.value = producto.proveedor || "";
  txtNumeroProveedor.value = normalizarNumeroProveedor(producto.numeroProveedor || "");

  btnActualizarInventario.disabled = false;
  btnGuardarInventario.disabled = true;

  mostrarMensajeInventario("Producto seleccionado para edición.", "ok");
}

async function guardarProducto() {
  const data = obtenerDatosFormularioInventario();
  const error = validarCamposInventario(data);

  if (error) {
    mostrarMensajeInventario(error, "error");
    return;
  }

  try {
    const response = await fetch(API_INVENTARIO, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const resultado = await response.json();

    if (!resultado.ok) {
      mostrarMensajeInventario(resultado.mensaje || "No se pudo guardar el producto.", "error");
      return;
    }

    mostrarMensajeInventario(resultado.mensaje || "Producto insertado correctamente.", "ok");
 limpiarCamposInventario();
await cargarProductos();
mostrarAlertaStockBajo();
  } catch (error) {
    mostrarMensajeInventario("Error al guardar el producto.", "error");
  }
}

async function actualizarProducto() {
  if (!productoIdActual) {
    mostrarMensajeInventario("Debe seleccionar un producto para actualizar.", "error");
    return;
  }

  const data = obtenerDatosFormularioInventario();
  const error = validarCamposInventario(data);

  if (error) {
    mostrarMensajeInventario(error, "error");
    return;
  }

  try {
    const response = await fetch(`${API_INVENTARIO}/${productoIdActual}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const resultado = await response.json();

    if (!resultado.ok) {
      mostrarMensajeInventario(resultado.mensaje || "No se pudo actualizar el producto.", "error");
      return;
    }

    mostrarMensajeInventario(resultado.mensaje || "Producto y fecha actualizados correctamente.", "ok");
    limpiarCamposInventario();
await cargarProductos();
mostrarAlertaStockBajo();
  } catch (error) {
    mostrarMensajeInventario("Error al actualizar el producto.", "error");
  }
}

function filtrarInventario() {
  const { txtBuscarInventario } = obtenerElementosInventario();
  const filtro = txtBuscarInventario.value.trim().toLowerCase();

  if (!filtro) {
    renderTablaInventario(productosOriginales);
    return;
  }

  const filtrados = productosOriginales.filter((producto) => {
    const nombreProducto = String(producto.nombreProducto || "").toLowerCase();
    const codigo = String(producto.codigo || "").toLowerCase();
    const descripcion = String(producto.descripcion || "").toLowerCase();
    const proveedor = String(producto.proveedor || "").toLowerCase();
    const numeroProveedor = String(normalizarNumeroProveedor(producto.numeroProveedor || "")).toLowerCase();
    const precio = String(producto.precio ?? "").toLowerCase();
    const fecha = String(formatearFechaTabla(producto.fechaDeCompra) || "").toLowerCase();
    const stock = String(producto.stock ?? "").toLowerCase();

    return (
      nombreProducto.includes(filtro) ||
      codigo.includes(filtro) ||
      descripcion.includes(filtro) ||
      proveedor.includes(filtro) ||
      numeroProveedor.includes(filtro) ||
      precio.includes(filtro) ||
      fecha.includes(filtro) ||
      stock.includes(filtro)
    );
  });

  renderTablaInventario(filtrados);
}

function aplicarRestriccionesInventario() {
  const {
    txtNombreProducto,
    txtDescripcion,
    txtPrecio,
    txtStock,
    txtNumeroProveedor
  } = obtenerElementosInventario();

  txtNombreProducto.addEventListener("keypress", (e) => {
    const key = e.key;
    if (key.length === 1 && !/[a-zA-Z0-9\s]/.test(key)) {
      e.preventDefault();
    }
  });

  txtDescripcion.addEventListener("keypress", (e) => {
    const key = e.key;
    if (key.length === 1 && !/[a-zA-Z0-9\s.\-]/.test(key)) {
      e.preventDefault();
    }
  });

  txtPrecio.addEventListener("input", () => {
    if (txtPrecio.value && Number(txtPrecio.value) < 0) {
      txtPrecio.value = "";
    }
  });

  txtStock.addEventListener("input", () => {
    if (txtStock.value && Number(txtStock.value) < 0) {
      txtStock.value = "";
    }
  });

  txtNumeroProveedor.addEventListener("keydown", (e) => {
    const permitido =
      ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"].includes(e.key) ||
      /^\d$/.test(e.key);

    if (!permitido) {
      e.preventDefault();
      return;
    }

    if ((e.key === "Backspace" || e.key === "Delete") && txtNumeroProveedor.selectionStart <= 4) {
      e.preventDefault();
    }
  });

  txtNumeroProveedor.addEventListener("input", () => {
    let valor = txtNumeroProveedor.value.replace(/[^\d+]/g, "");

    if (!valor.startsWith("+505")) {
      valor = "+505" + valor.replace("+", "").replace(/^505/, "");
    }

    const numero = valor.replace("+505", "").replace(/\D/g, "").slice(0, 8);
    txtNumeroProveedor.value = `+505${numero}`;
  });

  txtNumeroProveedor.addEventListener("focus", () => {
    if (!txtNumeroProveedor.value.startsWith("+505")) {
      txtNumeroProveedor.value = "+505";
    }
  });
}

export async function initInventarioModule(panelPrincipal) {
  panelPrincipal.innerHTML = renderInventarioView();

  const {
    form,
    btnActualizarInventario,
    btnCancelarInventario,
    txtBuscarInventario,
    dtpFechaCompra
  } = obtenerElementosInventario();

  dtpFechaCompra.value = obtenerFechaActualLocalInput();
aplicarRestriccionesInventario();
await cargarProductos();
mostrarAlertaStockBajo();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await guardarProducto();
  });

  btnActualizarInventario.addEventListener("click", async () => {
    await actualizarProducto();
  });

  btnCancelarInventario.addEventListener("click", () => {
    limpiarCamposInventario();
    renderTablaInventario(productosOriginales);
  });

  txtBuscarInventario.addEventListener("input", filtrarInventario);
}