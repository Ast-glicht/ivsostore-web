const usuariosRepository = require('../repositories/usuariosRepository');

const ROLES_VALIDOS = [
  'Gerente',
  'Administrador',
  'Administrador de Base de datos',

  'Vendedor',

];

const ESTADOS_VALIDOS = [
  'Habilitado',
  'Inhabilitado'
];

function validarCorreoGoogle(correo) {
  if (!correo) return true;
  return /^[^\s@]+@gmail\.com$/i.test(correo);
}

function validarPermisoAdministracion(rolActual) {
  return ['Administrador de Base de datos', 'Gerente'].includes(rolActual);
}

async function obtenerUsuarios() {
  return await usuariosRepository.listarUsuarios();
}

async function crearUsuario(data) {
  const {
    usuario,
    correo,
    contrasena,
    rol,
    estado,
    rolActual
  } = data;

  if (!validarPermisoAdministracion(rolActual)) {
    return {
      ok: false,
      mensaje: 'No tiene permisos para gestionar usuarios.'
    };
  }

  if (!usuario?.trim() || !contrasena?.trim() || !rol?.trim()) {
    return {
      ok: false,
      mensaje: 'Usuario, contraseña y rol son obligatorios.'
    };
  }

  if (correo && !validarCorreoGoogle(correo.trim())) {
    return {
      ok: false,
      mensaje: 'El correo debe ser un correo válido de Google (@gmail.com).'
    };
  }

  if (contrasena.trim().length < 6) {
    return {
      ok: false,
      mensaje: 'La contraseña debe tener al menos 6 caracteres.'
    };
  }

  if (!ROLES_VALIDOS.includes(rol.trim())) {
    return {
      ok: false,
      mensaje: 'El rol seleccionado no es válido.'
    };
  }

  const estadoFinal = estado?.trim() || 'Habilitado';

  if (!ESTADOS_VALIDOS.includes(estadoFinal)) {
    return {
      ok: false,
      mensaje: 'El estado seleccionado no es válido.'
    };
  }

  const usuarioExiste = await usuariosRepository.existeUsuario(usuario.trim());

  if (usuarioExiste) {
    return {
      ok: false,
      mensaje: 'Ya existe un usuario con ese nombre.'
    };
  }

  const correoExiste = await usuariosRepository.existeCorreo(correo?.trim());

  if (correoExiste) {
    return {
      ok: false,
      mensaje: 'Ya existe un usuario con ese correo.'
    };
  }

  await usuariosRepository.crearUsuario({
    usuario: usuario.trim(),
    correo: correo?.trim() || null,
    contrasena: contrasena.trim(),
    rol: rol.trim(),
    estado: estadoFinal
  });

  return {
    ok: true,
    mensaje: 'Usuario creado correctamente.'
  };
}

async function actualizarUsuario(data) {
  const {
    usuarioOriginal,
    usuario,
    correo,
    contrasena,
    rol,
    estado,
    rolActual
  } = data;

  if (!validarPermisoAdministracion(rolActual)) {
    return {
      ok: false,
      mensaje: 'No tiene permisos para gestionar usuarios.'
    };
  }

  if (!usuarioOriginal?.trim() || !usuario?.trim() || !rol?.trim() || !estado?.trim()) {
    return {
      ok: false,
      mensaje: 'Usuario, rol y estado son obligatorios.'
    };
  }

  if (correo && !validarCorreoGoogle(correo.trim())) {
    return {
      ok: false,
      mensaje: 'El correo debe ser un correo válido de Google (@gmail.com).'
    };
  }

  if (contrasena && contrasena.trim() !== '' && contrasena.trim().length < 6) {
    return {
      ok: false,
      mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.'
    };
  }

  if (!ROLES_VALIDOS.includes(rol.trim())) {
    return {
      ok: false,
      mensaje: 'El rol seleccionado no es válido.'
    };
  }

  if (!ESTADOS_VALIDOS.includes(estado.trim())) {
    return {
      ok: false,
      mensaje: 'El estado seleccionado no es válido.'
    };
  }

  const usuarioExiste = await usuariosRepository.existeUsuario(
    usuario.trim(),
    usuarioOriginal.trim()
  );

  if (usuarioExiste) {
    return {
      ok: false,
      mensaje: 'Ya existe otro usuario con ese nombre.'
    };
  }

  const correoExiste = await usuariosRepository.existeCorreo(
    correo?.trim(),
    usuarioOriginal.trim()
  );

  if (correoExiste) {
    return {
      ok: false,
      mensaje: 'Ya existe otro usuario con ese correo.'
    };
  }

  await usuariosRepository.actualizarUsuario({
    usuarioOriginal: usuarioOriginal.trim(),
    usuario: usuario.trim(),
    correo: correo?.trim() || null,
    contrasena: contrasena?.trim() || '',
    rol: rol.trim(),
    estado: estado.trim()
  });

  return {
    ok: true,
    mensaje: 'Usuario actualizado correctamente.'
  };
}

async function cambiarEstadoUsuario(data) {
  const { usuario, estado, rolActual } = data;

  if (!validarPermisoAdministracion(rolActual)) {
    return {
      ok: false,
      mensaje: 'No tiene permisos para gestionar usuarios.'
    };
  }

  if (!usuario?.trim() || !estado?.trim()) {
    return {
      ok: false,
      mensaje: 'Usuario y estado son obligatorios.'
    };
  }

  if (!ESTADOS_VALIDOS.includes(estado.trim())) {
    return {
      ok: false,
      mensaje: 'El estado seleccionado no es válido.'
    };
  }

  await usuariosRepository.cambiarEstadoUsuario(usuario.trim(), estado.trim());

  return {
    ok: true,
    mensaje: `Usuario ${estado === 'Habilitado' ? 'habilitado' : 'inhabilitado'} correctamente.`
  };
}

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario
};