const clientesRepository = require('../repositories/clientesRepository');

function validarSoloLetrasYEspacios(texto) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(texto);
}

function validarTelefonoNicaragua(telefono) {
  if (!telefono) return false;
  const limpio = telefono.replace(/\s/g, '');

  if (!limpio.startsWith('+505')) return false;

  const numero = limpio.replace('+505', '');
  return /^\d{8}$/.test(numero);
}

function validarCamposCliente(data) {
  const errores = [];

  if (!data.nombre || data.nombre.trim() === '') {
    errores.push('El nombre es obligatorio.');
  }

  if (!data.telefono || data.telefono.trim() === '') {
    errores.push('El teléfono es obligatorio.');
  } else if (!validarTelefonoNicaragua(data.telefono.trim())) {
    errores.push('El teléfono debe iniciar con +505 y tener 8 dígitos.');
  }

  if (!data.departamento || data.departamento.trim() === '') {
    errores.push('Seleccione un departamento.');
  }

  if (!data.municipio || data.municipio.trim() === '') {
    errores.push('Seleccione un municipio.');
  }

  if (data.empresa && data.empresa.trim() !== '' && !validarSoloLetrasYEspacios(data.empresa.trim())) {
    errores.push('La empresa solo puede contener letras y espacios.');
  }

  return errores;
}

async function obtenerClientes() {
  return await clientesRepository.listarClientes();
}

async function registrarCliente(data) {
  const errores = validarCamposCliente(data);

  if (errores.length > 0) {
    return {
      ok: false,
      mensaje: errores[0],
      errores
    };
  }

  await clientesRepository.registrarCliente({
    nombre: data.nombre.trim(),
    telefono: data.telefono.trim(),
    empresa: (data.empresa || '').trim(),
    departamento: data.departamento.trim(),
    municipio: data.municipio.trim(),
    barrio: (data.barrio || '').trim(),
    detalleDireccion: (data.detalleDireccion || '').trim(),
    cobertura: (data.cobertura || '').trim()
  });

  return {
    ok: true,
    mensaje: 'Cliente guardado correctamente.'
  };
}

async function actualizarCliente(id, data) {
  if (!id || Number.isNaN(Number(id))) {
    return {
      ok: false,
      mensaje: 'ID de cliente inválido.'
    };
  }

  const errores = validarCamposCliente(data);

  if (errores.length > 0) {
    return {
      ok: false,
      mensaje: errores[0],
      errores
    };
  }

  await clientesRepository.actualizarCliente(Number(id), {
    nombre: data.nombre.trim(),
    telefono: data.telefono.trim(),
    empresa: (data.empresa || '').trim(),
    departamento: data.departamento.trim(),
    municipio: data.municipio.trim(),
    barrio: (data.barrio || '').trim(),
    detalleDireccion: (data.detalleDireccion || '').trim(),
    cobertura: (data.cobertura || '').trim()
  });

  return {
    ok: true,
    mensaje: 'Cliente actualizado correctamente.'
  };
}

module.exports = {
  obtenerClientes,
  registrarCliente,
  actualizarCliente
};