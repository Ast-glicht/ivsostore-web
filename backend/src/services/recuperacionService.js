const recuperacionRepository = require('../repositories/recuperacionRepository');

function generarCodigoRecuperacion() {
  const fecha = Date.now().toString().slice(-5);
  const aleatorio = Math.floor(1000 + Math.random() * 9000);
  return `REC-${fecha}-${aleatorio}`;
}

function validarTexto(valor) {
  return valor && String(valor).trim() !== '';
}

async function solicitarRecuperacion(data) {
  const { usuarioOCorreo } = data;

  if (!validarTexto(usuarioOCorreo)) {
    return {
      ok: false,
      mensaje: 'Debe ingresar su usuario o correo registrado.'
    };
  }

  const usuario = await recuperacionRepository.buscarUsuarioPorUsuarioOCorreo(
    usuarioOCorreo.trim()
  );

  if (!usuario) {
    return {
      ok: false,
      mensaje: 'No existe un usuario registrado con ese dato.'
    };
  }

  if (
    String(usuario.estado || '').toLowerCase() === 'inhabilitado' ||
    String(usuario.estado || '').toLowerCase() === 'inactivo'
  ) {
    return {
      ok: false,
      mensaje: 'El usuario se encuentra inhabilitado. Contacte directamente al gerente.'
    };
  }

  const gerente = await recuperacionRepository.obtenerCorreoGerente();

  if (!gerente || !gerente.correo) {
    return {
      ok: false,
      mensaje: 'No hay un gerente habilitado con correo registrado.'
    };
  }

  const codigo = generarCodigoRecuperacion();

  await recuperacionRepository.registrarSolicitudRecuperacion({
    usuarioSolicitante: usuario.usuario,
    correoSolicitante: usuario.correo,
    codigoRecuperacion: codigo,
    correoGerente: gerente.correo
  });

  const asunto = `Solicitud de recuperación de contraseña - ${usuario.usuario}`;

  const cuerpo = `
Hola, solicito recuperación de contraseña para acceder al sistema IVSOLSTORE.

Datos de la solicitud:
Usuario: ${usuario.usuario}
Correo registrado: ${usuario.correo || 'No registrado'}
Código de recuperación: ${codigo}
Fecha de solicitud: ${new Date().toLocaleString('es-NI')}

Por favor, verificar esta solicitud y asignar una nueva contraseña desde el módulo de Administración de Usuarios.

Gracias.
  `.trim();

  return {
    ok: true,
    mensaje: 'Solicitud generada correctamente.',
    data: {
      correoGerente: gerente.correo,
      usuario: usuario.usuario,
      codigo,
      asunto,
      cuerpo
    }
  };
}

module.exports = {
  solicitarRecuperacion
};