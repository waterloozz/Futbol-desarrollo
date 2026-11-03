// [IA] inicio · ia/2026-11-03_josefasolis1-hue_crud-partidos.md
// js/api.js (Versión unificada y lista para usar)
// Se carga como script clásico (<script src="js/api.js" defer>), igual que menu.js
// y sesion.js: sus funciones quedan globales. Por eso no usa "export".
// Centraliza el acceso a mocks y persistencia en localStorage.
// Imita una API REST con respuestas asíncronas y latencia simulada.

const STORAGE_KEY = "partidos_crud_data";
const LATENCIA = 450;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Carga recursos desde public/mocks/ con soporte para Vite y servidores estáticos
async function pedir(recurso) {
  await esperar(LATENCIA); // Simulación de latencia de red requerida por rúbrica
  const posiblesRutas = [
    `public/mocks/${recurso}.json`,
    `./public/mocks/${recurso}.json`,
    `mocks/${recurso}.json`,
    `/mocks/${recurso}.json`,
  ];

  let respuesta = null;
  for (const ruta of posiblesRutas) {
    try {
      const res = await fetch(ruta);
      if (res.ok) {
        respuesta = res;
        break;
      }
    } catch (_) {}
  }

  if (!respuesta) {
    throw new Error(`No se pudo cargar el recurso "${recurso}"`);
  }
  return respuesta.json();
}

const momento = (p) => `${p.fecha} ${p.hora}`;

// --- 1. Resumen para el Dashboard ---
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

// --- 2. CRUD de Partidos con soporte en localStorage ---
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
  return { ok: true, status: 200, datos: { id }, data: { id } };
}

// Exposición en el objeto global (window) para scripts tradicionales (defer)
if (typeof window !== "undefined") {
  window.obtenerResumen = obtenerResumen;
  window.obtenerPartidos = obtenerPartidos;
  window.crearPartido = crearPartido;
  window.actualizarPartido = actualizarPartido;
  window.eliminarPartido = eliminarPartido;

  window.api = {
    obtenerResumen,
    obtenerPartidos,
    crearPartido,
    actualizarPartido,
    eliminarPartido,
  };
}
// [IA] fin
