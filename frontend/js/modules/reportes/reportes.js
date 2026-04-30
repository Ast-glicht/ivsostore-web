const API_REPORTES = "http://localhost:3000/api/reportes";

let ultimoFiltro = {
  fechaInicio: "",
  fechaFin: ""
};
let reporteConDatos = false;
function renderReportesView() {
  return `
    <div class="reportes-module">
      <section class="reportes-card">
        <h2>Reporte de Ventas</h2>

        <div class="reportes-toolbar">
          <div class="reportes-field">
            <label for="fechaInicioReporte">Fecha inicio</label>
            <input type="date" id="fechaInicioReporte" />
          </div>

          <div class="reportes-field">
            <label for="fechaFinReporte">Fecha fin</label>
            <input type="date" id="fechaFinReporte" />
          </div>

      

          <div class="reportes-actions">
            <button type="button" class="btn-reportes btn-exportar-reporte" id="btnExportarReporte">
              Exportar Excel
            </button>
          </div>
        </div>

        <p id="reportesMessage" class="reportes-message"></p>
      </section>

      <section class="reportes-summary">
        <div class="reportes-summary-card">
          <span>Total Ventas</span>
          <strong id="totalVentasResumen">C$ 0.00</strong>
        </div>

        <div class="reportes-summary-card">
          <span>Costo Total</span>
          <strong id="costoTotalResumen">C$ 0.00</strong>
        </div>

        <div class="reportes-summary-card">
          <span>Ganancia Total</span>
          <strong id="gananciaTotalResumen">C$ 0.00</strong>
        </div>

        <div class="reportes-summary-card">
  <span>Proveedor más rentable</span>
  <strong id="proveedorRentableResumen">Sin datos</strong>
</div>
      </section>

      <section class="reportes-card">
        <h3>Detalle del Reporte</h3>

        <div class="reportes-table-wrapper">
          <table class="reportes-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Fecha Pedido</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Producto</th>
                <th>Proveedor</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Precio Venta</th>
                <th>Costo Total</th>
                <th>Venta Total</th>
                <th>Ganancia</th>
              </tr>
            </thead>
            <tbody id="reportesTableBody">
              <tr>
                <td colspan="12" class="reportes-empty">Seleccione un rango de fechas y presione Consultar.</td>
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
    fechaInicioReporte: document.getElementById("fechaInicioReporte"),
    fechaFinReporte: document.getElementById("fechaFinReporte"),
    btnExportarReporte: document.getElementById("btnExportarReporte"),
    reportesMessage: document.getElementById("reportesMessage"),
    totalVentasResumen: document.getElementById("totalVentasResumen"),
    costoTotalResumen: document.getElementById("costoTotalResumen"),
    gananciaTotalResumen: document.getElementById("gananciaTotalResumen"),
    reportesTableBody: document.getElementById("reportesTableBody"),
    proveedorRentableResumen: document.getElementById("proveedorRentableResumen")
  };
}

function mostrarMensajeReportes(texto, tipo = "") {
  const el = document.getElementById("reportesMessage");
  if (!el) return;
  el.textContent = texto;
  el.className = "reportes-message";
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

function formatearMoneda(valor) {
  return `C$ ${Number(valor || 0).toFixed(2)}`;
}
function establecerFechasPorDefecto() {
  const { fechaInicioReporte, fechaFinReporte } = obtenerElementosReportes();

  const hoy = new Date();

  const formato = (fecha) => {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  fechaInicioReporte.value = formato(hoy);
  fechaFinReporte.value = formato(hoy);

  ultimoFiltro.fechaInicio = fechaInicioReporte.value;
  ultimoFiltro.fechaFin = fechaFinReporte.value;
}

function renderResumen(resumen = {}, proveedorMasRentable = null) {
  const {
    totalVentasResumen,
    costoTotalResumen,
    gananciaTotalResumen,
    proveedorRentableResumen
  } = obtenerElementosReportes();

  totalVentasResumen.textContent = formatearMoneda(resumen.totalVentas || 0);
  costoTotalResumen.textContent = formatearMoneda(resumen.costoTotal || 0);
  gananciaTotalResumen.textContent = formatearMoneda(resumen.gananciaTotal || 0);

  if (proveedorMasRentable && proveedorMasRentable.proveedor) {
    proveedorRentableResumen.textContent =
      `${proveedorMasRentable.proveedor} (${formatearMoneda(proveedorMasRentable.ganancia)})`;
  } else {
    proveedorRentableResumen.textContent = "Sin datos";
  }
}

function renderTablaReportes(filas) {
  const { reportesTableBody } = obtenerElementosReportes();

  if (!filas || !filas.length) {
    reportesTableBody.innerHTML = `
      <tr>
        <td colspan="11" class="reportes-empty">No hay datos para el rango seleccionado.</td>
      </tr>
    `;
    return;
  }

  reportesTableBody.innerHTML = filas.map((fila) => `
    <tr>
      <td>${fila.idPedido ?? ""}</td>
      <td>${formatearFecha(fila.fechaPedido)}</td>
      <td>${fila.cliente ?? ""}</td>
      <td>${fila.vendedor ?? ""}</td>
    <td>${fila.producto ?? ""}</td>
<td>${fila.proveedor ?? "Sin proveedor"}</td>
<td>${fila.cantidad ?? ""}</td>
      <td>${formatearMoneda(fila.precioUnitario)}</td>
      <td>${formatearMoneda(fila.precioVenta)}</td>
      <td>${formatearMoneda(fila.costoTotal)}</td>
      <td>${formatearMoneda(fila.ventaTotal)}</td>
      <td>${formatearMoneda(fila.ganancia)}</td>
    </tr>
  `).join("");
}

async function consultarReporteVentas() {
  const { fechaInicioReporte, fechaFinReporte } = obtenerElementosReportes();

  const fechaInicio = fechaInicioReporte.value;
  const fechaFin = fechaFinReporte.value;

  if (!fechaInicio || !fechaFin) {
    mostrarMensajeReportes("Debe seleccionar un rango de fechas válido.", "error");
    return;
  }

  ultimoFiltro.fechaInicio = fechaInicio;
  ultimoFiltro.fechaFin = fechaFin;

  mostrarMensajeReportes("Consultando reporte...");

  try {
    const query = new URLSearchParams({
      fechaInicio,
      fechaFin
    });

    const response = await fetch(`${API_REPORTES}/ventas?${query.toString()}`);
    const resultado = await response.json();

   if (!resultado.ok) {
  reporteConDatos = false;
  document.getElementById("btnExportarReporte").disabled = true;

  mostrarMensajeReportes(resultado.mensaje || "No existen datos para el rango seleccionado.", "error");
renderResumen({}, null);
  renderTablaReportes([]);
  return;
}

renderResumen(resultado.resumen || {}, resultado.proveedorMasRentable || null);
renderTablaReportes(resultado.data || []);

reporteConDatos = Array.isArray(resultado.data) && resultado.data.length > 0;
document.getElementById("btnExportarReporte").disabled = !reporteConDatos;

mostrarMensajeReportes("Reporte generado correctamente.", "ok");
 } catch (error) {
  reporteConDatos = false;
  document.getElementById("btnExportarReporte").disabled = true;

renderResumen({}, null);
  renderTablaReportes([]);
  mostrarMensajeReportes("Error al generar el reporte.", "error");
}
}

async function exportarReporteExcel() {

  if (!reporteConDatos) {
  mostrarMensajeReportes("No se puede exportar el reporte porque no existen datos en el rango seleccionado.", "error");
  return;
}
  const { fechaInicio, fechaFin } = ultimoFiltro;

  if (!fechaInicio || !fechaFin) {
    mostrarMensajeReportes("Primero consulte un rango de fechas.", "error");
    return;
  }

  try {
    const query = new URLSearchParams({
      fechaInicio,
      fechaFin
    });

    const response = await fetch(`${API_REPORTES}/ventas/excel?${query.toString()}`);

    if (!response.ok) {
      let mensaje = "Error al exportar el reporte.";
      try {
        const errorJson = await response.json();
        mensaje = errorJson.mensaje || mensaje;
      } catch (_) {}
      mostrarMensajeReportes(mensaje, "error");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Reporte_Ventas_${fechaInicio}_a_${fechaFin}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);

    mostrarMensajeReportes("Reporte exportado correctamente.", "ok");
  } catch (error) {
    mostrarMensajeReportes("Error al exportar el reporte.", "error");
  }
}
export async function initReportesModule(panelPrincipal) {
  panelPrincipal.innerHTML = renderReportesView();

  reporteConDatos = false;

  establecerFechasPorDefecto();

  const {
    fechaInicioReporte,
    fechaFinReporte,
    btnExportarReporte
  } = obtenerElementosReportes();

  btnExportarReporte.disabled = true;

  fechaInicioReporte.addEventListener("change", async () => {
    await consultarReporteVentas();
  });

  fechaFinReporte.addEventListener("change", async () => {
    await consultarReporteVentas();
  });

  btnExportarReporte.addEventListener("click", async () => {
    await exportarReporteExcel();
  });

  await consultarReporteVentas();
}