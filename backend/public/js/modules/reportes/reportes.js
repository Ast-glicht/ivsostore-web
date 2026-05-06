const API_REPORTES = "/api/reportes";

let reporteActual = "ventas";
let datosReporteActual = [];

function obtenerFechaActual() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function renderReportesView() {
  return `
    <div class="reportes-module">
      <section class="reportes-card">
        <h2>Generación de Reportes</h2>
        <p class="reportes-desc">
          Consulte y exporte reportes de ventas, inventario y clientes según el rango de fechas seleccionado.
        </p>

        <div class="reportes-filtros">
          <div class="reportes-row">
            <label for="cmbTipoReporte">Tipo de reporte</label>
            <select id="cmbTipoReporte">
              <option value="ventas">Ventas</option>
              <option value="inventario">Inventario</option>
              <option value="clientes">Clientes</option>
            </select>
          </div>

          <div class="reportes-row">
            <label for="fechaInicioReporte">Fecha inicio</label>
            <input type="date" id="fechaInicioReporte" />
          </div>

          <div class="reportes-row">
            <label for="fechaFinReporte">Fecha fin</label>
            <input type="date" id="fechaFinReporte" />
          </div>

          <div class="reportes-actions">
            <button type="button" class="btn-reportes btn-consultar" id="btnConsultarReporte">
              Consultar
            </button>

            <button type="button" class="btn-reportes btn-exportar" id="btnExportarReporte" disabled>
              Exportar Excel
            </button>
          </div>
        </div>

        <div class="reportes-resumen" id="reportesResumen">
          <div>
            <span>Registros encontrados</span>
            <strong id="lblCantidadRegistros">0</strong>
          </div>
          <div>
            <span>Reporte actual</span>
            <strong id="lblReporteActual">Ventas</strong>
          </div>
        </div>

        <p id="reportesMessage" class="reportes-message"></p>
      </section>

      <section class="reportes-card">
        <h3 id="tituloTablaReporte">Reporte de ventas</h3>

        <div class="reportes-table-wrapper">
          <table class="reportes-table">
            <thead id="reportesTableHead"></thead>
            <tbody id="reportesTableBody">
              <tr>
                <td class="reportes-empty">Seleccione un reporte y consulte.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function obtenerElementosReportes() {
  return {
    cmbTipoReporte: document.getElementById("cmbTipoReporte"),
    fechaInicioReporte: document.getElementById("fechaInicioReporte"),
    fechaFinReporte: document.getElementById("fechaFinReporte"),
    btnConsultarReporte: document.getElementById("btnConsultarReporte"),
    btnExportarReporte: document.getElementById("btnExportarReporte"),
    reportesMessage: document.getElementById("reportesMessage"),
    reportesTableHead: document.getElementById("reportesTableHead"),
    reportesTableBody: document.getElementById("reportesTableBody"),
    tituloTablaReporte: document.getElementById("tituloTablaReporte"),
    lblCantidadRegistros: document.getElementById("lblCantidadRegistros"),
    lblReporteActual: document.getElementById("lblReporteActual")
  };
}

function mostrarMensajeReporte(texto, tipo = "") {
  const { reportesMessage } = obtenerElementosReportes();

  reportesMessage.textContent = texto;
  reportesMessage.className = "reportes-message";

  if (tipo) {
    reportesMessage.classList.add(tipo);
  }
}

function formatearFecha(fecha) {
  if (!fecha) return "";

  const d = new Date(fecha);

  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString("es-NI", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

function formatearMoneda(valor) {
  return `C$ ${Number(valor || 0).toFixed(2)}`;
}

function validarFechas() {
  const { fechaInicioReporte, fechaFinReporte } = obtenerElementosReportes();

  const fechaInicio = fechaInicioReporte.value;
  const fechaFin = fechaFinReporte.value;

  if (!fechaInicio || !fechaFin) {
    return {
      ok: false,
      mensaje: "Seleccione fecha de inicio y fecha final."
    };
  }

  if (new Date(fechaInicio) > new Date(fechaFin)) {
    return {
      ok: false,
      mensaje: "La fecha de inicio no puede ser mayor que la fecha final."
    };
  }

  return {
    ok: true,
    fechaInicio,
    fechaFin
  };
}

function obtenerNombreReporte(tipo) {
  const nombres = {
    ventas: "Ventas",
    inventario: "Inventario",
    clientes: "Clientes"
  };

  return nombres[tipo] || "Reporte";
}

function configurarCabeceraTabla(tipo) {
  const { reportesTableHead, tituloTablaReporte, lblReporteActual } = obtenerElementosReportes();

  reporteActual = tipo;
  tituloTablaReporte.textContent = `Reporte de ${obtenerNombreReporte(tipo).toLowerCase()}`;
  lblReporteActual.textContent = obtenerNombreReporte(tipo);

  if (tipo === "ventas") {
    reportesTableHead.innerHTML = `
      <tr>
        <th>ID Pedido</th>
        <th>Fecha</th>
        <th>Cliente</th>
        <th>Empresa</th>
        <th>Vendedor</th>
        <th>Estado</th>
        <th>Monto Total</th>
        <th>Descuento %</th>
        <th>Descuento</th>
        <th>Total Final</th>
        <th>Moneda</th>
      </tr>
    `;
  }

  if (tipo === "inventario") {
    reportesTableHead.innerHTML = `
      <tr>
        <th>ID Producto</th>
        <th>Producto</th>
        <th>Código</th>
        <th>Precio</th>
        <th>Stock</th>
        <th>Estado Stock</th>
        <th>Fecha Compra</th>
        <th>Fecha Vencimiento</th>
        <th>Proveedor</th>
        <th>Valor Inventario</th>
      </tr>
    `;
  }

  if (tipo === "clientes") {
    reportesTableHead.innerHTML = `
      <tr>
        <th>ID Cliente</th>
        <th>Cliente</th>
        <th>Empresa</th>
        <th>Teléfono</th>
        <th>Departamento</th>
        <th>Municipio</th>
        <th>Cantidad Pedidos</th>
        <th>Total Comprado</th>
        <th>Última Compra</th>
        <th>Frecuencia</th>
      </tr>
    `;
  }
}

function renderTablaReporte(tipo, data) {
  const {
    reportesTableBody,
    btnExportarReporte,
    lblCantidadRegistros
  } = obtenerElementosReportes();

  datosReporteActual = data || [];
  lblCantidadRegistros.textContent = datosReporteActual.length;
  btnExportarReporte.disabled = datosReporteActual.length === 0;

  if (!datosReporteActual.length) {
    reportesTableBody.innerHTML = `
      <tr>
        <td class="reportes-empty" colspan="12">
          No existen registros para el rango de fechas seleccionado.
        </td>
      </tr>
    `;
    return;
  }

  if (tipo === "ventas") {
    reportesTableBody.innerHTML = datosReporteActual.map((item) => `
      <tr>
        <td>${item.idPedido ?? ""}</td>
        <td>${formatearFecha(item.fechaPedido)}</td>
        <td>${item.cliente ?? ""}</td>
        <td>${item.empresa ?? ""}</td>
        <td>${item.vendedor ?? ""}</td>
        <td>${item.estado ?? ""}</td>
        <td>${formatearMoneda(item.montoTotal)}</td>
        <td>${item.descuentoPorcentaje ?? 0}%</td>
        <td>${formatearMoneda(item.descuentoMonto)}</td>
        <td>${formatearMoneda(item.totalConDescuento)}</td>
        <td>${item.moneda ?? "NIO"}</td>
      </tr>
    `).join("");
  }

  if (tipo === "inventario") {
    reportesTableBody.innerHTML = datosReporteActual.map((item) => `
      <tr>
        <td>${item.idProducto ?? ""}</td>
        <td>${item.nombreProducto ?? ""}</td>
        <td>${item.codigo ?? ""}</td>
        <td>${formatearMoneda(item.precio)}</td>
        <td>${item.stock ?? ""}</td>
        <td>
          <span class="stock-badge ${String(item.estadoStock).toLowerCase().replace(/\s/g, "-")}">
            ${item.estadoStock ?? ""}
          </span>
        </td>
        <td>${formatearFecha(item.fechaDeCompra)}</td>
        <td>${formatearFecha(item.fechaVencimiento)}</td>
        <td>${item.proveedor ?? ""}</td>
        <td>${formatearMoneda(item.valorInventario)}</td>
      </tr>
    `).join("");
  }

  if (tipo === "clientes") {
    reportesTableBody.innerHTML = datosReporteActual.map((item) => `
      <tr>
        <td>${item.idCliente ?? ""}</td>
        <td>${item.cliente ?? ""}</td>
        <td>${item.empresa ?? ""}</td>
        <td>${item.telefono ?? ""}</td>
        <td>${item.departamento ?? ""}</td>
        <td>${item.municipio ?? ""}</td>
        <td>${item.cantidadPedidos ?? 0}</td>
        <td>${formatearMoneda(item.totalComprado)}</td>
        <td>${formatearFecha(item.ultimaCompra)}</td>
        <td>${item.frecuencia ?? ""}</td>
      </tr>
    `).join("");
  }
}

async function consultarReporte() {
  const {
    cmbTipoReporte,
    btnExportarReporte,
    reportesTableBody
  } = obtenerElementosReportes();

  const validacion = validarFechas();

  if (!validacion.ok) {
    mostrarMensajeReporte(validacion.mensaje, "error");
    return;
  }

  const tipo = cmbTipoReporte.value;
  configurarCabeceraTabla(tipo);

  btnExportarReporte.disabled = true;
  datosReporteActual = [];

  reportesTableBody.innerHTML = `
    <tr>
      <td class="reportes-empty" colspan="12">Cargando reporte...</td>
    </tr>
  `;

  try {
    const url = `${API_REPORTES}/${tipo}?fechaInicio=${validacion.fechaInicio}&fechaFin=${validacion.fechaFin}`;
    const response = await fetch(url);
    const resultado = await response.json();

    if (!resultado.ok) {
      mostrarMensajeReporte(resultado.mensaje || "No se pudo generar el reporte.", "error");
      renderTablaReporte(tipo, []);
      return;
    }

    renderTablaReporte(tipo, resultado.data || []);

    if ((resultado.data || []).length === 0) {
      mostrarMensajeReporte("No existen registros para el rango seleccionado.", "error");
      return;
    }

    mostrarMensajeReporte("Reporte generado correctamente.", "ok");
  } catch (error) {
    mostrarMensajeReporte("Error al generar el reporte.", "error");
    renderTablaReporte(tipo, []);
  }
}

function exportarReporte() {
  const { cmbTipoReporte } = obtenerElementosReportes();
  const validacion = validarFechas();

  if (!validacion.ok) {
    mostrarMensajeReporte(validacion.mensaje, "error");
    return;
  }

  if (!datosReporteActual.length) {
    mostrarMensajeReporte("No hay datos para exportar.", "error");
    return;
  }

  const tipo = cmbTipoReporte.value;

  const url = `${API_REPORTES}/${tipo}/excel?fechaInicio=${validacion.fechaInicio}&fechaFin=${validacion.fechaFin}`;

  window.open(url, "_blank");
}

export async function initReportesModule(panelPrincipal) {
  panelPrincipal.innerHTML = renderReportesView();

  const {
    cmbTipoReporte,
    fechaInicioReporte,
    fechaFinReporte,
    btnConsultarReporte,
    btnExportarReporte
  } = obtenerElementosReportes();

  const hoy = obtenerFechaActual();

  fechaInicioReporte.value = hoy;
  fechaFinReporte.value = hoy;

  configurarCabeceraTabla("ventas");

  cmbTipoReporte.addEventListener("change", () => {
    configurarCabeceraTabla(cmbTipoReporte.value);
    datosReporteActual = [];
    btnExportarReporte.disabled = true;

    const { reportesTableBody, lblCantidadRegistros } = obtenerElementosReportes();

    lblCantidadRegistros.textContent = "0";
    reportesTableBody.innerHTML = `
      <tr>
        <td class="reportes-empty" colspan="12">
          Consulte el reporte seleccionado.
        </td>
      </tr>
    `;

    mostrarMensajeReporte("");
  });

  btnConsultarReporte.addEventListener("click", consultarReporte);
  btnExportarReporte.addEventListener("click", exportarReporte);

  await consultarReporte();
}