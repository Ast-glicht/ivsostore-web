import { initClientesModule } from "../clientes/clientes.js";
import { initInventarioModule } from "../inventario/inventario.js";
import { initPedidosNuevoModule } from "../pedidos/pedidosNuevo.js";
import { initPedidosEditarModule } from "../pedidos/pedidosEditar.js";
import { initPedidosDetalleModule } from "../pedidos/pedidosDetalle.js";
import { initVentasModule } from "../ventas/ventas.js";
import { initReportesModule } from "../reportes/reportes.js";

const usuarioActualEl = document.getElementById("usuarioActual");
const rolActualEl = document.getElementById("rolActual");
const panelPrincipal = document.getElementById("panelPrincipal");

const btnClientes = document.getElementById("btnClientes");
const btnInventario = document.getElementById("btnInventario");
const btnPedidos = document.getElementById("btnPedidos");
const btnVentas = document.getElementById("btnVentas");
const btnInforme = document.getElementById("btnInforme");
const cerrarSesionBtn = document.getElementById("cerrarSesion");

const rolesPermitidosInforme = [
  "Gerente",
  "Administrador",
  "Administrador de Base de datos"
];

function obtenerUsuarioLogueado() {
  const data = localStorage.getItem("ivsostore_user");
  return data ? JSON.parse(data) : null;
}

function activarBoton(botonActivo) {
  const botones = document.querySelectorAll(".menu-btn");
  botones.forEach((btn) => btn.classList.remove("active"));
  botonActivo.classList.add("active");
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

async function inicializarDashboard() {
  const usuarioLogueado = obtenerUsuarioLogueado();

  if (!usuarioLogueado) {
    window.location.href = "login.html";
    return;
  }

  usuarioActualEl.textContent = usuarioLogueado.usuario || "-";
  rolActualEl.textContent = usuarioLogueado.rol || "-";

  if (!rolesPermitidosInforme.includes(usuarioLogueado.rol)) {
    btnInforme.style.display = "none";
  }

  btnClientes.addEventListener("click", abrirClientes);
  btnInventario.addEventListener("click", abrirInventario);
  btnPedidos.addEventListener("click", abrirPedidosNuevo);
  btnVentas.addEventListener("click", abrirVentas);
  btnInforme.addEventListener("click", abrirReportes);

  cerrarSesionBtn.addEventListener("click", () => {
    const confirmar = confirm("¿Deseas cerrar la sesión actual?");
    if (confirmar) {
      localStorage.removeItem("ivsostore_user");
      window.location.href = "login.html";
    }
  });

  await abrirClientes();
}

window.addEventListener("DOMContentLoaded", inicializarDashboard);