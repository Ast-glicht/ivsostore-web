import { initClientesModule } from "../clientes/clientes.js";
import { initInventarioModule } from "../inventario/inventario.js";
import { initPedidosNuevoModule } from "../pedidos/pedidosNuevo.js";
import { initPedidosEditarModule } from "../pedidos/pedidosEditar.js";
import { initPedidosDetalleModule } from "../pedidos/pedidosDetalle.js";
import { initVentasModule } from "../ventas/ventas.js";
import { initReportesModule } from "../reportes/reportes.js";
import { initUsuariosModule } from "../usuarios/usuarios.js";

const usuarioActualEl = document.getElementById("usuarioActual");
const rolActualEl = document.getElementById("rolActual");
const panelPrincipal = document.getElementById("panelPrincipal");

const btnClientes = document.getElementById("btnClientes");
const btnInventario = document.getElementById("btnInventario");
const btnPedidos = document.getElementById("btnPedidos");
const btnVentas = document.getElementById("btnVentas");
const btnInforme = document.getElementById("btnInforme");
const btnUsuarios = document.getElementById("btnUsuarios");
const cerrarSesionBtn = document.getElementById("cerrarSesion");

const rolesPermitidosInforme = [
  "Gerente",
  "Administrador",
  "Administrador de Base de datos"
];

const rolesPermitidosUsuarios = [
  "Gerente",
  "Administrador de Base de datos"
];

function obtenerUsuarioLogueado() {
  const data = localStorage.getItem("ivsostore_user");

  try {
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
}

function activarBoton(botonActivo) {
  const botones = document.querySelectorAll(".menu-btn");
  botones.forEach((btn) => btn.classList.remove("active"));

  if (botonActivo) {
    botonActivo.classList.add("active");
  }
}

async function abrirClientes() {
  activarBoton(btnClientes);
  await initClientesModule(panelPrincipal);
}

async function abrirInventario() {
  activarBoton(btnInventario);
  await initInventarioModule(panelPrincipal);
}

async function abrirPedidosNuevo() {
  activarBoton(btnPedidos);
  await initPedidosNuevoModule(panelPrincipal, {
    onOpenEditPedidos: abrirPedidosEditar
  });
}

async function abrirPedidosEditar() {
  activarBoton(btnPedidos);
  await initPedidosEditarModule(panelPrincipal, {
    onVolverNuevoPedido: abrirPedidosNuevo,
    onOpenPedidoDetalle: abrirPedidoDetalle
  });
}

async function abrirPedidoDetalle(idPedido) {
  activarBoton(btnPedidos);
  await initPedidosDetalleModule(panelPrincipal, idPedido, {
    onVolverLista: abrirPedidosEditar,
    onPedidoActualizado: abrirPedidosEditar
  });
}

async function abrirVentas() {
  activarBoton(btnVentas);
  await initVentasModule(panelPrincipal);
}

async function abrirReportes() {
  activarBoton(btnInforme);
  await initReportesModule(panelPrincipal);
}

async function abrirUsuarios() {
  activarBoton(btnUsuarios);
  await initUsuariosModule(panelPrincipal);
}

async function inicializarDashboard() {
  const usuarioLogueado = obtenerUsuarioLogueado();

  if (!usuarioLogueado) {
    window.location.href = "/pages/login.html";
    return;
  }

  usuarioActualEl.textContent = usuarioLogueado.usuario || "-";
  rolActualEl.textContent = usuarioLogueado.rol || "-";

  const rolActual = usuarioLogueado.rol || "";

  if (!rolesPermitidosInforme.includes(rolActual)) {
    btnInforme.style.display = "none";
  }

  if (rolesPermitidosUsuarios.includes(rolActual)) {
    btnUsuarios.style.display = "block";
  } else {
    btnUsuarios.style.display = "none";
  }

  btnClientes.addEventListener("click", abrirClientes);
  btnInventario.addEventListener("click", abrirInventario);
  btnPedidos.addEventListener("click", abrirPedidosNuevo);
  btnVentas.addEventListener("click", abrirVentas);
  btnInforme.addEventListener("click", abrirReportes);

  if (btnUsuarios) {
    btnUsuarios.addEventListener("click", abrirUsuarios);
  }

  cerrarSesionBtn.addEventListener("click", () => {
    const confirmar = confirm("¿Deseas cerrar la sesión actual?");

    if (confirmar) {
      localStorage.removeItem("ivsostore_user");
      window.location.href = "/pages/login.html";
    }
  });

  await abrirClientes();
}

window.addEventListener("DOMContentLoaded", inicializarDashboard);