const txtUsuario = document.getElementById("txtUsuario");
const txtContrasena = document.getElementById("txtContrasena");
const btnAcceder = document.getElementById("btnAcceder");
const btnSalir = document.getElementById("btnSalir");
const loginForm = document.getElementById("loginForm");
const mensajeEstado = document.getElementById("mensajeEstado");
const lbBloqueoVisual = document.getElementById("lbBloqueoVisual");

const API_LOGIN = "/api/auth/login";
let intentosFallidos = 0;
const LIMITE_INTENTOS = 5;
let segundosRestantes = 60;
let bloqueoInterval = null;
let parpadeoColor = false;

function limpiarEstadosCampos() {
  txtUsuario.style.borderColor = "rgba(255, 255, 255, 0.08)";
  txtContrasena.style.borderColor = "rgba(255, 255, 255, 0.08)";
}

function marcarCampoIncorrecto(campo) {
  limpiarEstadosCampos();

  if (campo === "usuario") {
    txtUsuario.style.borderColor = "#ef4444";
  }

  if (campo === "contrasena") {
    txtContrasena.style.borderColor = "#ef4444";
  }
}

function mostrarMensaje(texto = "", tipo = "info") {
  mensajeEstado.textContent = texto;

  if (tipo === "error") {
    mensajeEstado.style.color = "#fca5a5";
    return;
  }

  if (tipo === "ok") {
    mensajeEstado.style.color = "#86efac";
    return;
  }

  if (tipo === "warning") {
    mensajeEstado.style.color = "#fcd34d";
    return;
  }

  mensajeEstado.style.color = "#fbbf24";
}

function iniciarBloqueo() {
  btnAcceder.disabled = true;
  txtUsuario.disabled = true;
  txtContrasena.disabled = true;
  segundosRestantes = 60;

  lbBloqueoVisual.classList.remove("oculto");
  lbBloqueoVisual.textContent = `Demasiados intentos. Reintentar en ${segundosRestantes} segundos.`;

  bloqueoInterval = setInterval(() => {
    if (segundosRestantes > 0) {
      lbBloqueoVisual.textContent = `Demasiados intentos. Reintentar en ${segundosRestantes} segundos.`;

      parpadeoColor = !parpadeoColor;
      lbBloqueoVisual.style.backgroundColor = parpadeoColor
        ? "rgba(239, 68, 68, 0.40)"
        : "rgba(249, 115, 22, 0.40)";

      segundosRestantes--;
    } else {
      clearInterval(bloqueoInterval);
      bloqueoInterval = null;

      btnAcceder.disabled = false;
      txtUsuario.disabled = false;
      txtContrasena.disabled = false;

      lbBloqueoVisual.classList.add("oculto");
      lbBloqueoVisual.style.backgroundColor = "rgba(239, 68, 68, 0.22)";

      intentosFallidos = 0;
      limpiarEstadosCampos();
      mostrarMensaje("Ya podés intentar de nuevo.", "ok");
    }
  }, 1000);
}

async function iniciarSesion(usuario, contrasena) {
 const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      usuario,
      contrasena
    })
  });

  return await response.json();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (btnAcceder.disabled) {
    return;
  }

  limpiarEstadosCampos();

  const usuario = txtUsuario.value.trim();
  const contrasena = txtContrasena.value.trim();

  if (!usuario || !contrasena) {
    mostrarMensaje("Por favor, completá todos los campos.", "warning");

    if (!usuario) {
      txtUsuario.style.borderColor = "#ef4444";
    }

    if (!contrasena) {
      txtContrasena.style.borderColor = "#ef4444";
    }

    return;
  }

  mostrarMensaje("Validando acceso...");

  try {
    const resultado = await iniciarSesion(usuario, contrasena);

    if (resultado.valido) {
      mostrarMensaje(
        `${resultado.mensaje} Usuario: ${resultado.usuario} | Rol: ${resultado.rol}`,
        "ok"
      );

      intentosFallidos = 0;
      limpiarEstadosCampos();

      localStorage.setItem(
        "ivsostore_user",
        JSON.stringify({
          usuario: resultado.usuario,
          rol: resultado.rol
        })
      );

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);

      return;
    }

    const mensaje = resultado.mensaje || "";

    if (
      mensaje.toLowerCase().includes("conexión") ||
      mensaje.toLowerCase().includes("base de datos") ||
      mensaje.toLowerCase().includes("servidor")
    ) {
      mostrarMensaje(mensaje, "error");
      return;
    }

    marcarCampoIncorrecto(resultado.campo);

    intentosFallidos++;
    const intentosRestantes = LIMITE_INTENTOS - intentosFallidos;

    if (intentosRestantes > 0) {
      mostrarMensaje(
        `${mensaje} Intentos restantes: ${intentosRestantes}`,
        "warning"
      );
    }

    if (intentosFallidos >= LIMITE_INTENTOS) {
      mostrarMensaje("Acceso bloqueado temporalmente.", "error");
      iniciarBloqueo();
    }
  } catch (error) {
    mostrarMensaje(
      "No se pudo conectar con el servidor. Verificá que el backend esté encendido.",
      "error"
    );
  }
});

btnSalir.addEventListener("click", () => {
  const confirmar = confirm("¿Desea salir?");
  if (confirmar) {
    window.close();
  }
});

window.addEventListener("load", () => {
  lbBloqueoVisual.classList.add("oculto");
  mostrarMensaje("");
  limpiarEstadosCampos();
});