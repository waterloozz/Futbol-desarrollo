// comun/api.js (Versión unificada y lista para usar)
// Se carga como script clásico (<script src="../comun/api.js" defer>), igual que menu.js
// y sesion.js: sus funciones quedan globales. Por eso no usa "export".

// la ruta a los mocks se arma desde donde esta este archivo, asi sirve desde cualquier carpeta
const API_BASE = new URL("../public/mocks", document.currentScript?.src ?? location.href).href;
const STORAGE_KEY = "partidos_crud_data";
const LATENCIA = 400;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pedir(recurso) {
  await esperar(LATENCIA); // Simula la latencia de red requerida por la rúbrica
  const respuesta = await fetch(`${API_BASE}/${recurso}.json`);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar "${recurso}" (HTTP ${respuesta.status})`);
  }
  return respuesta.json();
}

// Texto "fecha hora" para ordenar partidos cronológicamente
const momento = (p) => `${p.fecha} ${p.hora}`;

// --- 1. Funciones para el Dashboard / Resumen (de tus compañeros) ---
async function obtenerResumen(usuario) {
  let partidos, usuarios;
  try {
    [partidos, usuarios] = await Promise.all([pedir("partidos"), pedir("usuarios")]);
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: "No pudimos cargar el resumen del torneo. Revisa tu conexión e inténtalo de nuevo.",
    };
  }

  const nombre = usuarios.find((u) => u.usuario === usuario)?.nombre ?? null;
  const finalizados = partidos.filter((p) => p.estado === "finalizado");
  const programados = partidos.filter((p) => p.estado === "programado");
  const tarjetas = finalizados.reduce((total, p) => total + p.amarillas + p.rojas, 0);

  const proximos = [...programados]
    .sort((a, b) => momento(a).localeCompare(momento(b)))
    .slice(0, 3);

  const ultimosResultados = [...finalizados]
    .sort((a, b) => momento(b).localeCompare(momento(a)))
    .slice(0, 3);

  return {
    ok: true,
    datos: {
      nombre,
      totalPartidos: partidos.length,
      programados: programados.length,
      finalizados: finalizados.length,
      tarjetas,
      proximos,
      ultimosResultados,
    },
  };
}

// --- 2. Funciones para el CRUD de Partidos (con soporte en localStorage) ---

async function obtenerPartidos() {
  try {
    let guardados = localStorage.getItem(STORAGE_KEY);
    if (guardados) {
      return { ok: true, datos: JSON.parse(guardados) };
    }
    // Si no está en localStorage, cargamos el mock original mediante la función pedir
    const partidos = await pedir("partidos");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partidos));
    return { ok: true, datos: partidos };
  } catch (error) {
    return { ok: false, error: "No se pudieron cargar los partidos." };
  }
}

async function crearPartido(nuevoPartido) {
  const resultado = await obtenerPartidos();
  if (!resultado.ok) return resultado;

  let partidos = resultado.datos;
  nuevoPartido.id = Date.now(); // Asigna un ID único basado en el tiempo
  partidos.unshift(nuevoPartido);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(partidos));
  return { ok: true, datos: nuevoPartido };
}

async function actualizarPartido(id, datosActualizados) {
  const resultado = await obtenerPartidos();
  if (!resultado.ok) return resultado;

  let partidos = resultado.datos;
  const index = partidos.findIndex((p) => p.id == id);
  if (index === -1) {
    return { ok: false, error: "Partido no encontrado para actualizar." };
  }

  partidos[index] = { ...partidos[index], ...datosActualizados, id: Number(id) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(partidos));
  return { ok: true, datos: partidos[index] };
}

async function eliminarPartido(id) {
  const resultado = await obtenerPartidos();
  if (!resultado.ok) return resultado;

  let partidos = resultado.datos;
  const filtrados = partidos.filter((p) => p.id != id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
  return { ok: true, datos: { id } };
}
