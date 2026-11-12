const ES_VITE = typeof window !== "undefined" && (location.port === "5173" || Boolean(document.querySelector('script[src*="@vite"]')));
const API_BASE = ES_VITE
  ? `${location.origin}/mocks`
  // [IA] inicio · ia/2026-11-04_cbenavidesp_carpetas-y-limpieza.md
  : new URL("../public/mocks", document.currentScript?.src ?? location.href).href;
// [IA] fin
const STORAGE_KEY = "partidos_crud_data";
const LATENCIA_MIN = 300;
const LATENCIA_MAX = 800;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const latencia = () => esperar(LATENCIA_MIN + Math.random() * (LATENCIA_MAX - LATENCIA_MIN));

// --- Fallos simulados (sección 5.2) ---
// Dos formas de forzar un error para probar el estado de error de la interfaz:
//  1. Poner ?fallar en la URL de la página (ej.: dashboard.html?fallar).
//     Con ?fallar=0 o ?fallar=false se desactiva.
//  2. Probabilidad de falla al azar: ?probabilidadFalla=0.3 en la URL (30 %),
//     o cambiando PROBABILIDAD_FALLA aquí (0 = nunca falla, 1 = siempre).
const PROBABILIDAD_FALLA = 0;

function debeFallar() {
  const params = new URLSearchParams(location.search);
  if (params.has("fallar")) {
    return !["0", "false"].includes(params.get("fallar"));
  }
  const deUrl = parseFloat(params.get("probabilidadFalla"));
  const probabilidad = Number.isNaN(deUrl) ? PROBABILIDAD_FALLA : deUrl;
  return Math.random() < probabilidad;
}

// Lanza un error de red simulado; las funciones lo capturan y responden { ok: false, status: 500 }.
function simularFallo() {
  if (debeFallar()) {
    throw new Error("Error de red simulado. Inténtalo de nuevo.");
  }
}

async function pedir(recurso) {
  let respuesta = await fetch(`${API_BASE}/${recurso}.json`);
  if (!respuesta.ok) {
    const rutaAlt = API_BASE.includes("/public/")
      ? `${location.origin}/mocks/${recurso}.json`
      : new URL(`../public/mocks/${recurso}.json`, document.currentScript?.src ?? location.href).href;
    try {
      const resAlt = await fetch(rutaAlt);
      if (resAlt.ok) respuesta = resAlt;
    } catch (_) {}
  }
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar "${recurso}" (HTTP ${respuesta.status})`);
  }
  return respuesta.json();
}

// [IA] inicio · ia/2026-11-12_waterloozz_latencia-api.md
async function leerPartidos() {
  const guardados = localStorage.getItem(STORAGE_KEY);
  if (guardados) return JSON.parse(guardados);
  const partidos = await pedir("partidos");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(partidos));
  return partidos;
}

function guardarPartidos(partidos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(partidos));
}
// [IA] fin 
const momento = (p) => `${p.fecha} ${p.hora}`;

async function obtenerResumen(usuario) {
  try {
    await latencia();
    simularFallo();
    const partidos = await leerPartidos();

    // [IA] inicio · ia/2026-11-09_cbenavidesp_acceso-unico-arbitros.md
    const usuarios = await leerUsuarios();
    const nombre = usuarios.find((u) => u.email === usuario || u.usuario === usuario)?.nombre ?? null;
    // [IA] fin
    const finalizados = partidos.filter((p) => p.estado === "finalizado");
    const programados = partidos.filter((p) => p.estado === "programado");
    const tarjetas = finalizados.reduce((total, p) => total + (p.amarillas || 0) + (p.rojas || 0), 0);

    const proximos = [...programados]
      .sort((a, b) => momento(a).localeCompare(momento(b)))
      .slice(0, 3);

    const ultimosResultados = [...finalizados]
      .sort((a, b) => momento(b).localeCompare(momento(a)))
      .slice(0, 3);

    const resumen = {
      nombre,
      totalPartidos: partidos.length,
      programados: programados.length,
      finalizados: finalizados.length,
      tarjetas,
      proximos,
      ultimosResultados,
    };
    return { ok: true, status: 200, datos: resumen, data: resumen };
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
    await latencia();
    simularFallo();
    const partidos = await leerPartidos();
    return { ok: true, status: 200, datos: partidos, data: partidos };
  } catch (error) {
    return { ok: false, status: 500, error: "No se pudieron cargar los partidos." };
  }
}

async function crearPartido(nuevoPartido) {
  try {
    await latencia();
    simularFallo();
    const partidos = await leerPartidos();
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
    guardarPartidos(partidos);
    return { ok: true, status: 201, datos: partidoConId, data: partidoConId };
  } catch (error) {
    return { ok: false, status: 500, error: "No se pudo crear el partido." };
  }
}

async function actualizarPartido(id, datosActualizados) {
  try {
    await latencia();
    simularFallo();
    const partidos = await leerPartidos();
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
    guardarPartidos(partidos);
    return { ok: true, status: 200, datos: partidos[index], data: partidos[index] };
  } catch (error) {
    return { ok: false, status: 500, error: "No se pudo actualizar el partido." };
  }
}

async function eliminarPartido(id) {
  try {
    await latencia();
    simularFallo();
    const partidos = await leerPartidos();
    if (!partidos.some((p) => p.id == id)) {
      return { ok: false, status: 404, error: "Partido no encontrado para eliminar." };
    }
    guardarPartidos(partidos.filter((p) => p.id != id));
    return { ok: true, status: 200, datos: { id }, data: { id } };
  } catch (error) {
    return { ok: false, status: 500, error: "No se pudo eliminar el partido." };
  }
}

// [IA] inicio · ia/2026-11-03_josefasolis1-hue_crud-partidos.md
async function obtenerEquipos() {
  try {
    await latencia();
    simularFallo();
    const equipos = await pedir("equipos");
    return { ok: true, status: 200, datos: equipos, data: equipos };
  } catch (error) {
    return { ok: false, status: 500, error: "No se pudieron cargar los equipos." };
  }
}
// [IA] fin

// [IA] inicio · ia/2026-11-09_cbenavidesp_acceso-unico-arbitros.md · ia/2026-11-12_waterloozz_latencia-api.md
const USUARIOS_KEY = "usuarios_data";

async function leerUsuarios() {
  const guardados = localStorage.getItem(USUARIOS_KEY);
  if (guardados) return JSON.parse(guardados);
  const usuarios = await pedir("usuarios");
  localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
  return usuarios;
}

function guardarUsuarios(usuarios) {
  localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
}

function sinClave({ sal, passwordHash, ...resto }) {
  return resto;
}

const normalizarRut = (rut) => rut.replace(/\./g, "").toUpperCase().trim();

async function obtenerArbitros() {
  try {
    await latencia();
    simularFallo();
    const usuarios = await leerUsuarios();
    const arbitros = usuarios.filter((u) => u.rol === "arbitro").map(sinClave);
    return { ok: true, status: 200, datos: arbitros, data: arbitros };
  } catch (error) {
    return { ok: false, status: 500, error: "No se pudieron cargar los árbitros." };
  }
}

async function crearArbitro(datos) {
  try {
    await latencia();
    simularFallo();
    const usuarios = await leerUsuarios();
    const email = datos.email.trim().toLowerCase();
    const errores = {};
    if (usuarios.some((u) => u.email.toLowerCase() === email)) {
      errores.email = "Ya existe un usuario con este email.";
    }
    if (usuarios.some((u) => u.rut && normalizarRut(u.rut) === normalizarRut(datos.rut))) {
      errores.rut = "Ya existe un árbitro con este RUT.";
    }
    if (Object.keys(errores).length > 0) {
      return { ok: false, status: 409, error: "Ya existe un usuario con esos datos.", errores };
    }

    const sal = crearSal();
    const passwordHash = await hashearPassword(datos.password, sal);
    const nuevo = {
      id: usuarios.reduce((max, u) => Math.max(max, u.id), 0) + 1,
      nombre: datos.nombre.trim(),
      email,
      rol: "arbitro",
      rut: datos.rut.trim(),
      telefono: datos.telefono.trim(),
      categoria: datos.categoria,
      sal,
      passwordHash,
    };
    usuarios.push(nuevo);
    guardarUsuarios(usuarios);
    const publico = sinClave(nuevo);
    return { ok: true, status: 201, datos: publico, data: publico };
  } catch (error) {
    return { ok: false, status: 500, error: error.message || "No se pudo registrar el árbitro." };
  }
}

async function eliminarArbitro(id) {
  try {
    await latencia();
    simularFallo();
    const usuarios = await leerUsuarios();
    if (!usuarios.some((u) => u.id === id && u.rol === "arbitro")) {
      return { ok: false, status: 404, error: "No se encontró el árbitro." };
    }
    guardarUsuarios(usuarios.filter((u) => u.id !== id));
    return { ok: true, status: 200, datos: { id }, data: { id } };
  } catch (error) {
    return { ok: false, status: 500, error: "No se pudo eliminar el árbitro." };
  }
}

async function iniciarSesion(email, password) {
  try {
    await latencia();
    simularFallo();
    const usuarios = await leerUsuarios();
    const usuario = usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (usuario && (await hashearPassword(password, usuario.sal)) === usuario.passwordHash) {
      const publico = sinClave(usuario);
      return { ok: true, status: 200, datos: publico, data: publico };
    }
    return { ok: false, status: 401, error: "Email o contraseña incorrectos." };
  } catch (error) {
    return { ok: false, status: 500, error: error.message || "No se pudo iniciar sesión." };
  }
}
// [IA] fin

// [IA] inicio · ia/2026-11-11_waterloozz_perfil-api.md
async function obtenerPerfil(email) {
  try {
    await latencia();
    simularFallo();
    const usuarios = await leerUsuarios();
    const usuario = usuarios.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());
    if (!usuario) {
      return { ok: false, status: 404, error: "No se encontró el perfil." };
    }
    const perfil = {
      ...sinClave(usuario),
      asociacion: usuario.asociacion || "Asociación Nacional de Árbitros",
      telefono: usuario.telefono || "",
    };
    return { ok: true, status: 200, datos: perfil, data: perfil };
  } catch (error) {
    return { ok: false, status: 500, error: "No se pudo cargar el perfil." };
  }
}

async function actualizarPerfil(email, { asociacion, telefono }) {
  try {
    await latencia();
    simularFallo();
    const usuarios = await leerUsuarios();
    const indice = usuarios.findIndex((u) => u.email.toLowerCase() === (email || "").toLowerCase());
    if (indice === -1) {
      return { ok: false, status: 404, error: "No se encontró el perfil." };
    }
    if (!/^[+\d][\d\s-]{6,19}$/.test((telefono || "").trim())) {
      return { ok: false, status: 400, error: "Ingresa un teléfono válido." };
    }
    usuarios[indice] = {
      ...usuarios[indice],
      asociacion: (asociacion || "").trim(),
      telefono: telefono.trim(),
    };
    guardarUsuarios(usuarios);
    const perfil = sinClave(usuarios[indice]);
    return { ok: true, status: 200, datos: perfil, data: perfil };
  } catch (error) {
    return { ok: false, status: 500, error: "No se pudo guardar el perfil." };
  }
}
// [IA] fin