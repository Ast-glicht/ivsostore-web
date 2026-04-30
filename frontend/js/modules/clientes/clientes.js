
const API_CLIENTES = "https://ivsostore-web-production.up.railway.app/api/clientes";
const NICARAGUA = {
  "Boaco": ["Boaco", "Camoapa", "San José de los Remates", "San Lorenzo", "Santa Lucía", "Teustepe"],
  "Carazo": ["Jinotepe", "Diriamba", "Dolores", "El Rosario", "La Conquista", "La Paz de Carazo", "San Marcos", "Santa Teresa"],
  "Chinandega": ["Chinandega", "Chichigalpa", "Cinco Pinos", "San Pedro del Norte", "San Francisco del Norte", "Santo Tomás del Norte", "Somotillo", "Villanueva", "El Viejo", "Puerto Morazán", "El Realejo", "Posoltega"],
  "Chontales": ["Juigalpa", "Acoyapa", "Comalapa", "La Libertad", "San Pedro de Lóvago", "Santo Domingo", "Santo Tomás", "Villa Sandino", "San Francisco de Cuapa", "El Coral"],
  "Estelí": ["Estelí", "Condega", "Pueblo Nuevo", "San Juan de Limay", "La Trinidad", "San Nicolás"],
  "Granada": ["Granada", "Diriá", "Diriomo", "Nandaime"],
  "Jinotega": ["Jinotega", "La Concordia", "San José de Bocay", "San Rafael del Norte", "San Sebastián de Yalí", "Santa María de Pantasma", "Wiwilí de Jinotega", "El Cuá", "Muelle de los Bueyes", "Nueva Segovia", "Laguna de Perlas", "Paiwas"],
  "León": ["León", "Quezalguaque", "Telica", "Malpaisillo", "El Sauce", "Achuapa", "Santa Rosa del Peñón", "El Jicaral", "La Paz Centro", "Nagarote"],
  "Madriz": ["Somoto", "Yalaguina", "Totogalpa", "Palacagüina", "Telpaneca", "San Lucas", "Las Sabanas", "San José de Cusmapa", "San Fernando"],
  "Managua": ["Managua", "Ciudad Sandino", "Mateare", "Tipitapa", "San Francisco Libre", "Ticuantepe", "El Crucero", "Villa El Carmen", "San Rafael del Sur"],
  "Masaya": ["Masaya", "La Concepción", "Nindirí", "Tisma", "Masatepe", "Nandasmo", "Niquinohomo", "San Juan de Oriente", "Catarina"],
  "Matagalpa": ["Matagalpa", "Ciudad Darío", "Esquipulas", "Muy Muy", "Rancho Grande", "Río Blanco", "Matiguás", "San Ramón", "San Isidro", "Terrabona", "San Dionisio"],
  "Nueva Segovia": ["Ocotal", "Jalapa", "Dipilto", "Macuelizo", "San Fernando", "Santa María", "El Jícaro", "Quilalí", "Murra", "Ciudad Antigua", "San José de Cusmapa"],
  "Rivas": ["Rivas", "Tola", "San Juan del Sur", "Belén", "Cárdenas", "Moyogalpa", "Potosí", "Altagracia", "Buenos Aires"],
  "Río San Juan": ["San Carlos", "El Almendro", "Morrito", "San Juan de Nicaragua", "El Castillo", "Bocana de Sábalos"],
  "Región Autónoma Costa Caribe Norte": ["Bilwi", "Prinzapolka", "Mulukukú", "Waslala", "Siuna", "Rosita", "Bonanza"],
  "Región Autónoma Costa Caribe Sur": ["Bluefields", "Corn Island", "Desembocadura de Río Grande", "Kukrahill", "El Ayote", "El Tortuguero"]
};

let clientesOriginales = [];
let clienteIdActual = null;

function renderClientesView() {
  return `
    <div class="clientes-module">
      <div class="clientes-grid">
        <section class="clientes-card">
          <h2>Gestión de Clientes</h2>

          <form id="clientesForm" class="clientes-form">
            <div class="form-row">
              <label for="txtNombreCompleto">Nombre completo</label>
              <input type="text" id="txtNombreCompleto" placeholder="Ingrese el nombre completo" />
            </div>

            <div class="form-row">
              <label for="txtNoDeTelefono">No. de Teléfono</label>
              <input type="text" id="txtNoDeTelefono" value="+505" />
            </div>

            <div class="form-row">
              <label for="txtEmpresa">Empresa</label>
              <input type="text" id="txtEmpresa" placeholder="Ingrese la empresa" />
            </div>

            <div class="form-row">
              <label for="cmbDepartamento">Departamento</label>
              <select id="cmbDepartamento">
                <option value="">Seleccione un departamento</option>
              </select>
            </div>

            <div class="form-row">
              <label for="cmbMunicipio">Municipio</label>
              <select id="cmbMunicipio">
                <option value="">Seleccione un municipio</option>
              </select>
            </div>

            <div class="form-row">
              <label for="txtBarrio">Barrio</label>
              <input type="text" id="txtBarrio" placeholder="Ingrese el barrio" />
            </div>

            <div class="form-row">
              <label for="txtDetalleDireccion">Detalle dirección</label>
              <textarea id="txtDetalleDireccion" placeholder="Ingrese referencias o dirección exacta"></textarea>
            </div>

            <div class="form-row">
            <label for="cmbCobertura">Cobertura</label>
            <select id="cmbCobertura">
            <option value="">Seleccione cobertura</option>
            <option value="Tigo">Tigo</option>
            <option value="Claro">Claro</option>
            <option value="Otro">Otro</option>
            </select>
              </div>

            <div class="form-row" id="otroCoberturaRow" style="display: none;">
            <label for="txtOtraCobertura">Especifique otra cobertura</label>
            <input
            type="text"
            id="txtOtraCobertura"
            placeholder="Ingrese la cobertura"
            />
            </div>

            <div class="clientes-actions">
              <button type="submit" class="btn-clientes btn-guardar" id="btnGuardar">Guardar</button>
              <button type="button" class="btn-clientes btn-actualizar" id="btnActualizar" disabled>Actualizar</button>
              <button type="button" class="btn-clientes btn-limpiar" id="btnLimpiar">Limpiar</button>
            </div>

            <p id="clientesMessage" class="clientes-message"></p>
          </form>
        </section>

        <section class="clientes-card">
          <h3>Listado de Clientes</h3>

          <div class="clientes-toolbar">
            <div class="toolbar-field">
              <label for="txtBuscarNombre">Buscar por nombre</label>
              <input type="text" id="txtBuscarNombre" placeholder="Ej: Juan" />
            </div>

            <div class="toolbar-field">
              <label for="txtBuscarEmpresa">Buscar por empresa</label>
              <input type="text" id="txtBuscarEmpresa" placeholder="Ej: Empresa X" />
            </div>

            <div class="toolbar-field">
              <label for="txtBuscarTelefono">Buscar por teléfono</label>
              <input type="text" id="txtBuscarTelefono" placeholder="Ej: 8888" />
            </div>
          </div>

          <div class="clientes-table-wrapper">
            <table class="clientes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Empresa</th>
                  <th>Teléfono</th>
                  <th>Departamento</th>
                  <th>Municipio</th>
                  <th>Barrio</th>
                  <th>Detalle Dirección</th>
                  <th>Cobertura</th>
                </tr>
              </thead>
              <tbody id="clientesTableBody">
                <tr>
                  <td colspan="9" class="clientes-empty">Cargando clientes...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  `;
}

function obtenerElementosClientes() {
  return {
    form: document.getElementById("clientesForm"),
    txtNombreCompleto: document.getElementById("txtNombreCompleto"),
    txtNoDeTelefono: document.getElementById("txtNoDeTelefono"),
    txtEmpresa: document.getElementById("txtEmpresa"),
    cmbDepartamento: document.getElementById("cmbDepartamento"),
    cmbMunicipio: document.getElementById("cmbMunicipio"),
    txtBarrio: document.getElementById("txtBarrio"),
    txtDetalleDireccion: document.getElementById("txtDetalleDireccion"),
    cmbCobertura: document.getElementById("cmbCobertura"),
    otroCoberturaRow: document.getElementById("otroCoberturaRow"),
    txtOtraCobertura: document.getElementById("txtOtraCobertura"),
    btnGuardar: document.getElementById("btnGuardar"),
    btnActualizar: document.getElementById("btnActualizar"),
    btnLimpiar: document.getElementById("btnLimpiar"),
    clientesMessage: document.getElementById("clientesMessage"),
    txtBuscarNombre: document.getElementById("txtBuscarNombre"),
    txtBuscarEmpresa: document.getElementById("txtBuscarEmpresa"),
    txtBuscarTelefono: document.getElementById("txtBuscarTelefono"),
    clientesTableBody: document.getElementById("clientesTableBody")
  };
}

function mostrarMensajeClientes(texto, tipo = "") {
  const el = document.getElementById("clientesMessage");
  if (!el) return;
  el.textContent = texto;
  el.className = "clientes-message";
  if (tipo) {
    el.classList.add(tipo);
  }
}

function llenarDepartamentos(cmbDepartamento) {
  const departamentos = Object.keys(NICARAGUA);
  departamentos.forEach((dep) => {
    const option = document.createElement("option");
    option.value = dep;
    option.textContent = dep;
    cmbDepartamento.appendChild(option);
  });
}

function llenarMunicipios(departamento, cmbMunicipio) {
  cmbMunicipio.innerHTML = `<option value="">Seleccione un municipio</option>`;

  if (!departamento || !NICARAGUA[departamento]) return;

  NICARAGUA[departamento].forEach((municipio) => {
    const option = document.createElement("option");
    option.value = municipio;
    option.textContent = municipio;
    cmbMunicipio.appendChild(option);
  });
}

function toggleOtraCobertura() {
  const { cmbCobertura, otroCoberturaRow, txtOtraCobertura } = obtenerElementosClientes();

  if (cmbCobertura.value === "Otro") {
    otroCoberturaRow.style.display = "flex";
  } else {
    otroCoberturaRow.style.display = "none";
    txtOtraCobertura.value = "";
  }
}

function normalizarTelefono(telefono) {
  const valor = String(telefono || "").trim();
  if (!valor) return "+505";
  return valor.startsWith("+505") ? valor : `+505${valor}`;
}

function limpiarCamposClientes() {
  const {
    txtNombreCompleto,
    txtNoDeTelefono,
    txtEmpresa,
    cmbDepartamento,
    cmbMunicipio,
    txtBarrio,
    txtDetalleDireccion,
    cmbCobertura,
    txtOtraCobertura,
    otroCoberturaRow,
    btnActualizar,
    btnGuardar
  } = obtenerElementosClientes();

  clienteIdActual = null;

  txtNombreCompleto.value = "";
  txtNoDeTelefono.value = "+505";
  txtEmpresa.value = "";
  cmbDepartamento.value = "";
  cmbMunicipio.innerHTML = `<option value="">Seleccione un municipio</option>`;
  txtBarrio.value = "";
  txtDetalleDireccion.value = "";
  cmbCobertura.value = "";
  txtOtraCobertura.value = "";
  otroCoberturaRow.style.display = "none";

  btnActualizar.disabled = true;
  btnGuardar.disabled = false;

  mostrarMensajeClientes("");
}

function validarSoloLetrasYEspacios(texto) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(texto);
}

function validarCamposClientes(data) {
  if (!data.nombre.trim()) {
    return "El nombre es obligatorio.";
  }

  const telefonoLimpio = data.telefono.replace(/\s/g, "");
  if (!telefonoLimpio || telefonoLimpio === "+505") {
    return "El teléfono es obligatorio.";
  }

  if (!telefonoLimpio.startsWith("+505")) {
    return "El teléfono debe iniciar con +505.";
  }

  const numero = telefonoLimpio.replace("+505", "");
  if (!/^\d{8}$/.test(numero)) {
    return "El teléfono debe tener 8 dígitos después de +505.";
  }

  if (!data.departamento) {
    return "Seleccione un departamento.";
  }

  if (!data.municipio) {
    return "Seleccione un municipio.";
  }

  if (data.empresa.trim() && !validarSoloLetrasYEspacios(data.empresa.trim())) {
    return "La empresa solo puede contener letras y espacios.";
  }

  if (!data.cobertura || !data.cobertura.trim()) {
    return "Seleccione o escriba una cobertura.";
  }

  return null;
}
function obtenerDatosFormularioClientes() {
  const {
    txtNombreCompleto,
    txtNoDeTelefono,
    txtEmpresa,
    cmbDepartamento,
    cmbMunicipio,
    txtBarrio,
    txtDetalleDireccion,
    cmbCobertura,
    txtOtraCobertura
  } = obtenerElementosClientes();

  let coberturaFinal = cmbCobertura.value;

  if (cmbCobertura.value === "Otro") {
    coberturaFinal = txtOtraCobertura.value.trim();
  }

  return {
    nombre: txtNombreCompleto.value,
    telefono: txtNoDeTelefono.value,
    empresa: txtEmpresa.value,
    departamento: cmbDepartamento.value,
    municipio: cmbMunicipio.value,
    barrio: txtBarrio.value,
    detalleDireccion: txtDetalleDireccion.value,
    cobertura: coberturaFinal
  };
}

async function cargarClientes() {
  const { clientesTableBody } = obtenerElementosClientes();

  clientesTableBody.innerHTML = `
    <tr>
      <td colspan="9" class="clientes-empty">Cargando clientes...</td>
    </tr>
  `;

  try {
    const response = await fetch(API_CLIENTES);
    const resultado = await response.json();

    if (!resultado.ok) {
      throw new Error(resultado.mensaje || "No se pudieron cargar los clientes.");
    }

    clientesOriginales = resultado.data || [];
    renderTablaClientes(clientesOriginales);
  } catch (error) {
    clientesTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="clientes-empty">Error al cargar clientes.</td>
      </tr>
    `;
    mostrarMensajeClientes("Error al cargar clientes.", "error");
  }
}

function renderTablaClientes(clientes) {
  const { clientesTableBody } = obtenerElementosClientes();

  if (!clientes.length) {
    clientesTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="clientes-empty">No hay clientes registrados.</td>
      </tr>
    `;
    return;
  }

  clientesTableBody.innerHTML = clientes.map((cliente) => `
    <tr data-id="${cliente.idcliente}">
      <td>${cliente.idcliente ?? ""}</td>
      <td>${cliente.nombre ?? ""}</td>
      <td>${cliente.empresa ?? ""}</td>
      <td>${normalizarTelefono(cliente.telefono ?? "")}</td>
      <td>${cliente.departamento ?? ""}</td>
      <td>${cliente.municipio ?? ""}</td>
      <td>${cliente.barrio ?? ""}</td>
      <td>${cliente.detalleDireccion ?? ""}</td>
      <td>${cliente.cobertura ?? ""}</td>
    </tr>
  `).join("");

  clientesTableBody.querySelectorAll("tr").forEach((fila) => {
    fila.addEventListener("click", () => seleccionarClienteDesdeFila(fila));
  });
}

function seleccionarClienteDesdeFila(fila) {
  const id = Number(fila.dataset.id);
  const cliente = clientesOriginales.find((item) => Number(item.idcliente) === id);
  if (!cliente) return;

  document.querySelectorAll("#clientesTableBody tr").forEach((tr) => {
    tr.classList.remove("selected");
  });
  fila.classList.add("selected");

  const {
    txtNombreCompleto,
    txtNoDeTelefono,
    txtEmpresa,
    cmbDepartamento,
    cmbMunicipio,
    txtBarrio,
    txtDetalleDireccion,
    cmbCobertura,
    txtOtraCobertura,
    otroCoberturaRow,
    btnActualizar,
    btnGuardar
  } = obtenerElementosClientes();

  clienteIdActual = cliente.idcliente;

  txtNombreCompleto.value = cliente.nombre || "";
  txtEmpresa.value = cliente.empresa || "";
  txtNoDeTelefono.value = normalizarTelefono(cliente.telefono || "");
  cmbDepartamento.value = cliente.departamento || "";
  llenarMunicipios(cliente.departamento || "", cmbMunicipio);
  cmbMunicipio.value = cliente.municipio || "";
  txtBarrio.value = cliente.barrio || "";
  txtDetalleDireccion.value = cliente.detalleDireccion || "";

  const cobertura = cliente.cobertura || "";

  if (cobertura === "Tigo" || cobertura === "Claro") {
    cmbCobertura.value = cobertura;
    txtOtraCobertura.value = "";
    otroCoberturaRow.style.display = "none";
  } else if (cobertura) {
    cmbCobertura.value = "Otro";
    txtOtraCobertura.value = cobertura;
    otroCoberturaRow.style.display = "flex";
  } else {
    cmbCobertura.value = "";
    txtOtraCobertura.value = "";
    otroCoberturaRow.style.display = "none";
  }

  btnActualizar.disabled = false;
  btnGuardar.disabled = true;

  mostrarMensajeClientes("Cliente seleccionado para edición.", "ok");
}

async function guardarCliente() {
  const data = obtenerDatosFormularioClientes();
  const error = validarCamposClientes(data);

  if (error) {
    mostrarMensajeClientes(error, "error");
    return;
  }

  try {
    const response = await fetch(API_CLIENTES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const resultado = await response.json();

    if (!resultado.ok) {
      mostrarMensajeClientes(resultado.mensaje || "No se pudo guardar el cliente.", "error");
      return;
    }

    mostrarMensajeClientes(resultado.mensaje || "Cliente guardado correctamente.", "ok");
    limpiarCamposClientes();
    await cargarClientes();
  } catch (error) {
    mostrarMensajeClientes("Error al registrar el cliente.", "error");
  }
}

async function actualizarCliente() {
  if (!clienteIdActual) {
    mostrarMensajeClientes("Seleccione un cliente primero.", "error");
    return;
  }

  const data = obtenerDatosFormularioClientes();
  const error = validarCamposClientes(data);

  if (error) {
    mostrarMensajeClientes(error, "error");
    return;
  }

  try {
    const response = await fetch(`${API_CLIENTES}/${clienteIdActual}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const resultado = await response.json();

    if (!resultado.ok) {
      mostrarMensajeClientes(resultado.mensaje || "No se pudo actualizar el cliente.", "error");
      return;
    }

    mostrarMensajeClientes(resultado.mensaje || "Cliente actualizado correctamente.", "ok");
    limpiarCamposClientes();
    await cargarClientes();
  } catch (error) {
    mostrarMensajeClientes("Error al actualizar el cliente.", "error");
  }
}

function filtrarClientes() {
  const {
    txtBuscarNombre,
    txtBuscarEmpresa,
    txtBuscarTelefono
  } = obtenerElementosClientes();

  const filtroNombre = txtBuscarNombre.value.trim().toLowerCase();
  const filtroEmpresa = txtBuscarEmpresa.value.trim().toLowerCase();
  const filtroTelefono = txtBuscarTelefono.value.trim().toLowerCase();

  const filtrados = clientesOriginales.filter((cliente) => {
    const nombre = String(cliente.nombre || "").toLowerCase();
    const empresa = String(cliente.empresa || "").toLowerCase();
    const telefono = String(normalizarTelefono(cliente.telefono || "")).toLowerCase();

    return (
      nombre.includes(filtroNombre) &&
      empresa.includes(filtroEmpresa) &&
      telefono.includes(filtroTelefono)
    );
  });

  renderTablaClientes(filtrados);
}

function aplicarRestriccionesInputs() {
  const { txtNombreCompleto, txtEmpresa, txtNoDeTelefono } = obtenerElementosClientes();

  txtNombreCompleto.addEventListener("keypress", (e) => {
    const key = e.key;
    if (key.length === 1 && !/[A-Za-zÁÉÍÓÚáéíóúÑñ\s]/.test(key)) {
      e.preventDefault();
    }
  });

  txtEmpresa.addEventListener("keypress", (e) => {
    const key = e.key;
    if (key.length === 1 && !/[A-Za-zÁÉÍÓÚáéíóúÑñ\s]/.test(key)) {
      e.preventDefault();
    }
  });

  txtNoDeTelefono.addEventListener("keydown", (e) => {
    const permitido =
      ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"].includes(e.key) ||
      /^\d$/.test(e.key);

    if (!permitido) {
      e.preventDefault();
      return;
    }

    if ((e.key === "Backspace" || e.key === "Delete") && txtNoDeTelefono.selectionStart <= 4) {
      e.preventDefault();
    }
  });
    const { txtOtraCobertura } = obtenerElementosClientes();

    if (txtOtraCobertura) {
      txtOtraCobertura.addEventListener("keypress", (e) => {
        const key = e.key;
        if (key.length === 1 && !/[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]/.test(key)) {
          e.preventDefault();
        }
      });
    }
  txtNoDeTelefono.addEventListener("input", () => {
    let valor = txtNoDeTelefono.value.replace(/[^\d+]/g, "");

    if (!valor.startsWith("+505")) {
      valor = "+505" + valor.replace("+", "").replace(/^505/, "");
    }

    const numero = valor.replace("+505", "").replace(/\D/g, "").slice(0, 8);
    txtNoDeTelefono.value = `+505${numero}`;
  });

  txtNoDeTelefono.addEventListener("focus", () => {
    if (!txtNoDeTelefono.value.startsWith("+505")) {
      txtNoDeTelefono.value = "+505";
    }
  });
}

export async function initClientesModule(panelPrincipal) {
  panelPrincipal.innerHTML = renderClientesView();

    const {
    form,
    cmbDepartamento,
    cmbMunicipio,
    cmbCobertura,
    btnActualizar,
    btnLimpiar,
    txtBuscarNombre,
    txtBuscarEmpresa,
    txtBuscarTelefono
  } = obtenerElementosClientes();

  llenarDepartamentos(cmbDepartamento);
  aplicarRestriccionesInputs();
  await cargarClientes();

  cmbDepartamento.addEventListener("change", () => {
    llenarMunicipios(cmbDepartamento.value, cmbMunicipio);
  });

  cmbCobertura.addEventListener("change", () => {
    toggleOtraCobertura();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await guardarCliente();
  });

  btnActualizar.addEventListener("click", async () => {
    await actualizarCliente();
  });

  btnLimpiar.addEventListener("click", () => {
    limpiarCamposClientes();
    renderTablaClientes(clientesOriginales);
  });

  txtBuscarNombre.addEventListener("input", filtrarClientes);
  txtBuscarEmpresa.addEventListener("input", filtrarClientes);
  txtBuscarTelefono.addEventListener("input", filtrarClientes);
    toggleOtraCobertura();
}