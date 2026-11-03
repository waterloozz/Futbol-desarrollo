// Capa de datos: es el único archivo que lee los JSON de public/mocks/.
// Las páginas siempre llaman a estas funciones (nunca hacen fetch directo),
// así que al conectar un backend real solo hay que cambiar este archivo.
//
// Todas las funciones públicas responden con la misma forma y nunca lanzan:
//   { ok: true, datos }   si todo salió bien
//   { ok: false, error }  con un mensaje para mostrar al usuario

const API_BASE = "/mocks";

async function pedir(recurso) {
  const respuesta = await fetch(`${API_BASE}/${recurso}.json`);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar "${recurso}" (HTTP ${respuesta.status})`);
  }
  return respuesta.json();
}

// Texto "fecha hora" para ordenar partidos cronológicamente
const momento = (p) => `${p.fecha} ${p.hora}`;

// Datos del dashboard para el usuario que inició sesión: su nombre, los totales,
// los 3 próximos partidos y los 3 últimos resultados
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

  // Si no se encuentra (p. ej. una sesión iniciada antes de guardar el usuario),
  // nombre queda null y el saludo no lo muestra
  const nombre = usuarios.find((u) => u.usuario === usuario)?.nombre ?? null;

  const finalizados = partidos.filter((p) => p.estado === "finalizado");
  const programados = partidos.filter((p) => p.estado === "programado");

  const tarjetas = finalizados.reduce(
    (total, p) => total + p.amarillas + p.rojas,
    0
  );

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
