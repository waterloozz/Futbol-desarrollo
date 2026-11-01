// Capa de datos: es el único archivo que lee los JSON de public/mocks/.
// Las páginas siempre llaman a estas funciones (nunca hacen fetch directo),
// así que al conectar un backend real solo hay que cambiar este archivo.

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

// Datos del dashboard: totales, los 3 próximos partidos y los 3 últimos resultados
async function obtenerResumen() {
  const partidos = await pedir("partidos");

  const finalizados = partidos.filter((p) => p.estado === "finalizado");
  const programados = partidos.filter((p) => p.estado === "programado");

  const goles = finalizados.reduce(
    (total, p) => total + p.golesLocal + p.golesVisitante,
    0
  );

  const proximos = [...programados]
    .sort((a, b) => momento(a).localeCompare(momento(b)))
    .slice(0, 3);

  const ultimosResultados = [...finalizados]
    .sort((a, b) => momento(b).localeCompare(momento(a)))
    .slice(0, 3);

  return {
    totalPartidos: partidos.length,
    jugados: finalizados.length,
    programados: programados.length,
    goles,
    proximos,
    ultimosResultados,
  };
}
