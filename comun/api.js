
const API_BASE = new URL("../public/mocks", document.currentScript?.src ?? location.href).href;
const STORAGE_KEY = "partidos_crud_data";
const LATENCIA = 450;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pedir(recurso) {
  await esperar(LATENCIA); 
  const respuesta = await fetch(`${API_BASE}/${recurso}.json`);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar "${recurso}" (HTTP ${respuesta.status})`);
  }
  return respuesta.json();
}

const momento = (p) => `${p.fecha} ${p.hora}`;

async function obtenerResumen(usuario) {
  try {
    let partidos;
    const guardados = localStorage.getItem(STORAGE_KEY);
    if (guardados) {
      partidos = JSON.parse(guardados);
    } else {
      partidos = await pedir("partidos");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(partidos));
    }

    const usuarios = await pedir("usuarios");
    const nombre = usuarios.find((u) => u.usuario === usuario)?.nombre ?? null;
    const finalizados = partidos.filter((p) => p.estado === "finalizado");
    const programados = partidos.filter((p) => p.estado === "programado");
    const tarjetas = finalizados.reduce((total, p) => total + (p.amarillas || 0) + (p.rojas || 0), 0);

    const proximos = [...programados]
      .sort((a, b) => momento(a).localeCompare(momento(b)))
      .slice(0, 3);

    const ultimosResultados = [...finalizados]
      .sort((a, b) => momento(b).localeCompare(momento(a)))
      .slice(0, 3);

    return {
      ok: true,
      status: 200,
      datos: {
        nombre,
        totalPartidos: partidos.length,
        programados: programados.length,
        finalizados: finalizados.length,
        tarjetas,
        proximos,
        ultimosResultados,
      },
      data: {
        nombre,
        totalPartidos: partidos.length,
        programados: programados.length,
        finalizados: finalizados.length,
        tarjetas,
        proximos,
        ultimosResultados,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      status: 500,
      error: "No pudimos cargar el resumen del torneo. Revisa tu conexión e inténtalo de nuevo.",
    };
  }
}


async function obtenerPartidos() {
  try {
    const guardados = localStorage.getItem(STORAGE_KEY);
    if (guardados) {
      const partidos = JSON.parse(guardados);
      return { ok: true, status: 200, datos: partidos, data: partidos };
    }
    const partidos = await pedir("partidos");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partidos));
    return { ok: true, status: 200, datos: partidos, data: partidos };
  } catch (error) {
    return { ok: false, status: 500, error: "No se pudieron cargar los partidos." };
  }
}

async function crearPartido(nuevoPartido) {
  const resultado = await obtenerPartidos();
  if (!resultado.ok) return resultado;

  const partidos = resultado.datos;
  const partidoConId = {
    ...nuevoPartido,
    id: Date.now(),
    acontecimientos: nuevoPartido.acontecimientos || [],
    observaciones: nuevoPartido.observaciones || "",
    amarillas: Number(nuevoPartido.amarillas) || 0,
    rojas: Number(nuevoPartido.rojas) || 0,
    golesLocal: nuevoPartido.golesLocal !== null && nuevoPartido.golesLocal !== "" ? Number(nuevoPartido.golesLocal) : null,
    golesVisitante: nuevoPartido.golesVisitante !== null && nuevoPartido.golesVisitante !== "" ? Number(nuevoPartido.golesVisitante) : null,
  };

  partidos.unshift(partidoConId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(partidos));
  return { ok: true, status: 201, datos: partidoConId, data: partidoConId };
}

async function actualizarPartido(id, datosActualizados) {
  const resultado = await obtenerPartidos();
  if (!resultado.ok) return resultado;

  const partidos = resultado.datos;
  const index = partidos.findIndex((p) => p.id == id);
  if (index === -1) {
    return { ok: false, status: 404, error: "Partido no encontrado para actualizar." };
  }

  partidos[index] = {
    ...partidos[index],
    ...datosActualizados,
    id: Number(id),
    amarillas: Number(datosActualizados.amarillas) || 0,
    rojas: Number(datosActualizados.rojas) || 0,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(partidos));
  return { ok: true, status: 200, datos: partidos[index], data: partidos[index] };
}

async function eliminarPartido(id) {
  const resultado = await obtenerPartidos();
  if (!resultado.ok) return resultado;

  const partidos = resultado.datos;
  const filtrados = partidos.filter((p) => p.id != id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
  return { ok: true, datos: { id } };
}
