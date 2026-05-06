const API_USUARIOS = "/api/usuarios";

let usuariosOriginales = [];
let usuarioOriginalActual = null;

function renderUsuariosView() {
  return `
    <div class="usuarios-module">
      <section class="usuarios-card">
        <h2>Administración de Usuarios</h2>
        <p class="usuarios-desc">
          Gestione usuarios del sistema, correos, roles, estados y cambios de contraseña.
        </p>

        <form id="usuariosForm" class="usuarios-form">
          <div class="usuarios-grid">
            <div class="usuarios-row">
              <label for="txtUsuarioAdmin">Usuario</label>
              <input type="text" id="txtUsuarioAdmin" placeholder="Nombre de usuario" />
            </div>

            <div class="usuarios-row">
              <label for="txtCorreoAdmin">Correo Gmail</label>
              <input type="email" id="txtCorreoAdmin" placeholder="usuario@gmail.com" />
            </div>

            <div class="usuarios-row">
              <label for="txtContrasenaAdmin">Contraseña</label>
              <input type="password" id="txtContrasenaAdmin" placeholder="Nueva contraseña o contraseña inicial" />
            </div>

            <div class="usuarios-row">
              <label for="cmbRolAdmin">Rol</label>
              <select id="cmbRolAdmin">
                <option value="">Seleccione rol</option>
                <option value="Gerente">Gerente</option>
                <option value="Administrador">Administrador</option>
                <option value="Administrador de Base de datos">Administrador de Base de datos</option>
                <option value="Empleado">Empleado</option>
                <option value="Vendedor">Vendedor</option>
                <option value="Cajero">Cajero</option>
              </select>
            </div>

            <div class="usuarios-row">
              <label for="cmbEstadoAdmin">Estado</label>
              <select id="cmbEstadoAdmin">
                <option value="Habilitado">Habilitado</option>
                <option value="Inhabilitado">Inhabilitado</option>
              </select>
            </div>
          </div>

          <div class="usuarios-actions">
            <button type="submit" id="btnGuardarUsuario" class="btn-usuarios btn-usuarios-guardar">
              Crear usuario
            </button>
            <button type="button" id="btnActualizarUsuario" class="btn-usuarios btn-usuarios-actualizar" disabled>
              Actualizar usuario
            </button>
            <button type="button" id="btnLimpiarUsuario" class="btn-usuarios btn-usuarios-limpiar">
              Limpiar
            </button>
          </div>

          <p id="usuariosMessage" class="usuarios-message"></p>
        </form>
      </section>

      <section class="usuarios-card">
        <h3>Usuarios registrados</h3>

        <div class="usuarios-table-wrapper">
          <table class="usuarios-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Contraseña</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody id="usuariosTableBody">
              <tr>
                <td colspan="6" class="usuarios-empty">Cargando usuarios...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function obtenerElementosUsuarios() {
  return {
    form: document.getElementById("usuariosForm"),
    txtUsuarioAdmin: document.getElementById("txtUsuarioAdmin"),
    txtCorreoAdmin: document.getElementById("txtCorreoAdmin"),
    txtContrasenaAdmin: document.getElementById("txtContrasenaAdmin"),
    cmbRolAdmin: document.getElementById("cmbRolAdmin"),
    cmbEstadoAdmin: document.getElementById("cmbEstadoAdmin"),
    btnGuardarUsuario: document.getElementById("btnGuardarUsuario"),
    btnActualizarUsuario: document.getElementById("btnActualizarUsuario"),
    btnLimpiarUsuario: document.getElementById("btnLimpiarUsuario"),
    usuariosMessage: document.getElementById("usuariosMessage"),
    usuariosTableBody: document.getElementById("usuariosTableBody")
  };
}

function mostrarMensajeUsuarios(texto, tipo = "") {
  const { usuariosMessage } = obtenerElementosUsuarios();

  usuariosMessage.textContent = texto;
  usuariosMessage.className = "usuarios-message";

  if (tipo) {
    usuariosMessage.classList.add(tipo);
  }
}

function limpiarFormularioUsuarios() {
  const {
    txtUsuarioAdmin,
    txtCorreoAdmin,
    txtContrasenaAdmin,
    cmbRolAdmin,
    cmbEstadoAdmin,
    btnGuardarUsuario,
    btnActualizarUsuario
  } = obtenerElementosUsuarios();

  usuarioOriginalActual = null;

  txtUsuarioAdmin.value = "";
  txtCorreoAdmin.value = "";
  txtContrasenaAdmin.value = "";
  cmbRolAdmin.value = "";
  cmbEstadoAdmin.value = "Habilitado";

  btnGuardarUsuario.disabled = false;
  btnActualizarUsuario.disabled = true;

  mostrarMensajeUsuarios("");
}

function validarFormularioUsuario(esActualizacion = false) {
  const {
    txtUsuarioAdmin,
    txtCorreoAdmin,
    txtContrasenaAdmin,
    cmbRolAdmin,
    cmbEstadoAdmin
  } = obtenerElementosUsuarios();

  if (!txtUsuarioAdmin.value.trim() || !cmbRolAdmin.value.trim() || !cmbEstadoAdmin.value.trim()) {
    return "Usuario, rol y estado son obligatorios.";
  }

  if (!esActualizacion && !txtContrasenaAdmin.value.trim()) {
    return "La contraseña es obligatoria al crear un usuario.";
  }

  if (txtCorreoAdmin.value.trim() && !/^[^\s@]+@gmail\.com$/i.test(txtCorreoAdmin.value.trim())) {
    return "El correo debe ser un correo Gmail válido.";
  }

  if (txtContrasenaAdmin.value.trim() && txtContrasenaAdmin.value.trim().length < 6) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }

  return null;
}

async function cargarUsuarios() {
  const { usuariosTableBody } = obtenerElementosUsuarios();

  usuariosTableBody.innerHTML = `
    <tr>
      <td colspan="6" class="usuarios-empty">Cargando usuarios...</td>
    </tr>
  `;

  try {
    const response = await fetch(API_USUARIOS);
    const resultado = await response.json();

    if (!resultado.ok) {
      throw new Error(resultado.mensaje || "No se pudieron cargar los usuarios.");
    }

    usuariosOriginales = resultado.data || [];
    renderTablaUsuarios();
  } catch (error) {
    usuariosTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="usuarios-empty">Error al cargar usuarios.</td>
      </tr>
    `;
  }
}

function renderTablaUsuarios() {
  const { usuariosTableBody } = obtenerElementosUsuarios();

  if (!usuariosOriginales.length) {
    usuariosTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="usuarios-empty">No hay usuarios registrados.</td>
      </tr>
    `;
    return;
  }

  usuariosTableBody.innerHTML = usuariosOriginales.map((item) => `
    <tr data-usuario="${item.usuario}">
      <td>${item.usuario ?? ""}</td>
      <td>${item.correo ?? ""}</td>
      <td>********</td>
      <td>${item.rol ?? ""}</td>
      <td>
        <span class="estado-usuario ${item.estado === "Habilitado" ? "habilitado" : "inhabilitado"}">
          ${item.estado ?? ""}
        </span>
      </td>
      <td>
        <button type="button" class="btn-usuarios-tabla" data-editar="${item.usuario}">
          Editar
        </button>
      </td>
    </tr>
  `).join("");

  usuariosTableBody.querySelectorAll("[data-editar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      seleccionarUsuario(btn.dataset.editar);
    });
  });
}

function seleccionarUsuario(usuario) {
  const item = usuariosOriginales.find((u) => u.usuario === usuario);
  if (!item) return;

  const {
    txtUsuarioAdmin,
    txtCorreoAdmin,
    txtContrasenaAdmin,
    cmbRolAdmin,
    cmbEstadoAdmin,
    btnGuardarUsuario,
    btnActualizarUsuario
  } = obtenerElementosUsuarios();

  usuarioOriginalActual = item.usuario;

  txtUsuarioAdmin.value = item.usuario || "";
  txtCorreoAdmin.value = item.correo || "";
  txtContrasenaAdmin.value = "";
  cmbRolAdmin.value = item.rol || "";
  cmbEstadoAdmin.value = item.estado || "Habilitado";

  btnGuardarUsuario.disabled = true;
  btnActualizarUsuario.disabled = false;

  mostrarMensajeUsuarios("Usuario seleccionado para edición. Deje la contraseña vacía si no desea cambiarla.", "ok");
}

async function crearUsuario() {
  const error = validarFormularioUsuario(false);

  if (error) {
    mostrarMensajeUsuarios(error, "error");
    return;
  }

  const {
    txtUsuarioAdmin,
    txtCorreoAdmin,
    txtContrasenaAdmin,
    cmbRolAdmin,
    cmbEstadoAdmin
  } = obtenerElementosUsuarios();

  try {
    const response = await fetch(API_USUARIOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuario: txtUsuarioAdmin.value.trim(),
        correo: txtCorreoAdmin.value.trim(),
        contrasena: txtContrasenaAdmin.value.trim(),
        rol: cmbRolAdmin.value,
        estado: cmbEstadoAdmin.value,
        rolActual: sessionStorage.getItem("rol") || ""
      })
    });

    const resultado = await response.json();

    if (!resultado.ok) {
      mostrarMensajeUsuarios(resultado.mensaje || "No se pudo crear el usuario.", "error");
      return;
    }

    mostrarMensajeUsuarios(resultado.mensaje || "Usuario creado correctamente.", "ok");
    limpiarFormularioUsuarios();
    await cargarUsuarios();
  } catch (error) {
    mostrarMensajeUsuarios("Error al crear el usuario.", "error");
  }
}

async function actualizarUsuario() {
  if (!usuarioOriginalActual) {
    mostrarMensajeUsuarios("Seleccione un usuario primero.", "error");
    return;
  }

  const error = validarFormularioUsuario(true);

  if (error) {
    mostrarMensajeUsuarios(error, "error");
    return;
  }

  const {
    txtUsuarioAdmin,
    txtCorreoAdmin,
    txtContrasenaAdmin,
    cmbRolAdmin,
    cmbEstadoAdmin
  } = obtenerElementosUsuarios();

  try {
    const response = await fetch(API_USUARIOS, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuarioOriginal: usuarioOriginalActual,
        usuario: txtUsuarioAdmin.value.trim(),
        correo: txtCorreoAdmin.value.trim(),
        contrasena: txtContrasenaAdmin.value.trim(),
        rol: cmbRolAdmin.value,
        estado: cmbEstadoAdmin.value,
        rolActual: sessionStorage.getItem("rol") || ""
      })
    });

    const resultado = await response.json();

    if (!resultado.ok) {
      mostrarMensajeUsuarios(resultado.mensaje || "No se pudo actualizar el usuario.", "error");
      return;
    }

    mostrarMensajeUsuarios(resultado.mensaje || "Usuario actualizado correctamente.", "ok");
    limpiarFormularioUsuarios();
    await cargarUsuarios();
  } catch (error) {
    mostrarMensajeUsuarios("Error al actualizar el usuario.", "error");
  }
}

export async function initUsuariosModule(panelPrincipal) {
  panelPrincipal.innerHTML = renderUsuariosView();

  const {
    form,
    btnActualizarUsuario,
    btnLimpiarUsuario
  } = obtenerElementosUsuarios();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await crearUsuario();
  });

  btnActualizarUsuario.addEventListener("click", async () => {
    await actualizarUsuario();
  });

  btnLimpiarUsuario.addEventListener("click", () => {
    limpiarFormularioUsuarios();
  });

  await cargarUsuarios();
}