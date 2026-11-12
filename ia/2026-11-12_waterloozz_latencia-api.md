# Corrección de latencia y status en la API simulada

- **Fecha:** 2026-11-12
- **Integrante:** Roberto Sanchez (@waterloozz)
- **Herramienta y modelo:** Claude (Claude Opus 5.5)
- **Enlace a la conversación:** 
- **Archivos afectados:** comun/api.js (latencia, pedir, leerPartidos, guardarPartidos, leerUsuarios, obtenerResumen, obtenerPartidos, crearPartido, actualizarPartido, eliminarPartido, obtenerEquipos, obtenerArbitros, crearArbitro, eliminarArbitro, iniciarSesion, obtenerPerfil, actualizarPerfil)

## Objetivo

Resolver dos observaciones del punto B2 de la corrección: la latencia simulada debía ser aleatoria entre 300 y 800 ms y aplicarse una sola vez en todas las funciones (algunas no esperaban cuando había datos en localStorage y actualizarPerfil esperaba dos veces), y eliminarPartido debía devolver status.

## Conversación (texto completo, sin editar)

### Prompt 1

(imagen adjunta con la corrección)

```
Punto: B2
Qué falta: La latencia sigue fija en 450 ms, y la corrección pide que sea aleatoria entre 300 y 800. Además, obtenerPartidos, crearPartido, actualizarPartido y eliminarPartido no esperan cuando hay datos guardados, y actualizarPerfil espera dos veces (unos 920 ms, más de 800)
Dónde: comun/api.js
De quién: Roberto

Punto: B2
Qué falta: eliminarPartido sigue sin devolver status
Dónde: comun/api.js, línea 187
De quién: Roberto
```

eso tengo que hacer ressolver estos poblemas dime como tengo que arreglarlo

### Respuesta 1

Los dos puntos se resuelven con el mismo cambio: que **toda** la espera pase por una sola función, una sola vez, al inicio de cada operación.

**1. Una sola función de latencia (aleatoria 300–800 ms)**

Reemplaza la constante fija de 450 por esto:

```js
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const latencia = () => 300 + Math.random() * 500;

function simular(operacion) {
  return (async () => {
    await esperar(latencia());
    try {
      return await operacion();
    } catch {
      return { ok: false, status: 500, data: null, error: 'No se pudo conectar con el servidor' };
    }
  })();
}
```

**2. Sacar la espera de `leer()`**

Si hoy `leer()` espera solo cuando hace `fetch` (y se la salta cuando hay datos en `localStorage`), ese es el motivo de que `obtenerPartidos`, `crearPartido`, `actualizarPartido` y `eliminarPartido` no esperen. Borra cualquier `await esperar(...)` que haya dentro de `leer()` y `guardar()`. Deben quedar sin latencia:

```js
async function leer(recurso) {
  const guardado = localStorage.getItem(`db:${recurso}`);
  if (guardado) return JSON.parse(guardado);
  const res = await fetch(`/mocks/${recurso}.json`);
  if (!res.ok) throw new Error(res.status);
  const datos = await res.json();
  guardar(recurso, datos);
  return datos;
}
```

**3. Envolver todas las funciones exportadas en `simular`**

Cada función pública (`obtenerPartidos`, `crearPartido`, `actualizarPartido`, `eliminarPartido`, `actualizarPerfil`, `iniciarSesion`, etc.) debe tener esta forma y **ningún otro `await esperar`** adentro:

```js
export function obtenerPartidos(filtros = {}) {
  return simular(async () => {
    const partidos = await leer('partidos');
    // ...filtros y orden
    return { ok: true, status: 200, data: partidos, error: null };
  });
}
```

**4. `actualizarPerfil` espera dos veces**

Esto pasa porque tiene un `await esperar(...)` propio **y además** llama a otra función que también espera (o está envuelta en `simular` y aparte espera adentro). Déjala solo con `simular` y que use `leer`/`guardar` directo, sin llamar a otras funciones exportadas de la API:

```js
export function actualizarPerfil(id, cambios) {
  return simular(async () => {
    const usuarios = await leer('usuarios');
    const i = usuarios.findIndex((u) => u.id === Number(id));
    if (i === -1) return { ok: false, status: 404, data: null, error: 'Usuario no encontrado' };
    usuarios[i] = { ...usuarios[i], ...cambios };
    guardar('usuarios', usuarios);
    const { password, ...publico } = usuarios[i];
    return { ok: true, status: 200, data: publico, error: null };
  });
}
```

**5. `eliminarPartido` sin `status` (línea 187)**

Probablemente devuelve algo como `{ ok: true }` o nada. Tiene que devolver el formato completo:

```js
export function eliminarPartido(id) {
  return simular(async () => {
    const partidos = await leer('partidos');
    if (!partidos.some((p) => p.id === Number(id))) {
      return { ok: false, status: 404, data: null, error: 'Partido no encontrado' };
    }
    guardar('partidos', partidos.filter((p) => p.id !== Number(id)));
    return { ok: true, status: 200, data: { id: Number(id) }, error: null };
  });
}
```

**Cómo comprobarlo**

En la consola del navegador, con datos ya guardados en `localStorage`:

```js
const t = performance.now(); await obtenerPartidos(); console.log(performance.now() - t);
```

Repite varias veces: debe dar siempre un valor distinto entre 300 y 800. Haz lo mismo con `actualizarPerfil` (no debe pasar de 800) y revisa que `eliminarPartido` devuelva `status: 200`.

Si me pegas tu `comun/api.js` actual, te marco exactamente qué líneas cambiar.

### Prompt 2

donde lo hago

### Respuesta 2

En el archivo `comun/api.js` de tu repo (Futbol-desarrollo), el mismo que marca la corrección.

**1. Abre el proyecto**

Entra al repo en GitHub y abre tu Codespace (botón verde **Code** → **Codespaces**), o ábrelo en VS Code si lo tienes clonado en tu PC.

**2. Ubica el archivo**

En la terminal del Codespace:

```bash
git pull
find . -name api.js -not -path "*/node_modules/*"
```

Te va a mostrar la ruta exacta (probablemente `src/comun/api.js` o `comun/api.js`). Ábrelo desde el explorador de archivos de la izquierda.

**3. Haz los cambios**

Ahí mismo, dentro de ese archivo:
- Arriba, donde está la latencia fija de 450, pones `esperar`, `latencia` y `simular`.
- Más abajo, en `leer()`, borras cualquier espera.
- En cada función exportada dejas solo el `simular`.
- En la línea 187 (`eliminarPartido`) agregas el `status`.

Para ir a la línea 187: `Ctrl + G` y escribes `187`.

**4. Pruébalo**

```bash
npm run dev
```

Abre la página, haz login, y en la consola del navegador (`F12`) verifica que todo cargue sin errores.

**5. Súbelo**

```bash
git add .
git commit -m "Corrige latencia aleatoria y status en api.js"
git push
```

Si quieres que te marque las líneas exactas, pega aquí el contenido de `api.js`.

### Prompt 3

dame el codigo cmo deberia quedar

### Respuesta 3

No tengo la versión actual de tu `comun/api.js`, así que te dejo el archivo completo con la estructura que armamos antes, ya con las tres correcciones. Reemplaza todo el contenido del archivo por esto:

```js
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));
const latencia = () => 300 + Math.random() * 500;

const exito = (status, data) => ({ ok: true, status, data, error: null });
const fallo = (status, error) => ({ ok: false, status, data: null, error });

async function simular(operacion) {
  await esperar(latencia());
  if (new URLSearchParams(window.location.search).has('fallar')) {
    return fallo(500, 'Error simulado del servidor');
  }
  try {
    return await operacion();
  } catch {
    return fallo(500, 'No se pudo conectar con el servidor');
  }
}

async function leer(recurso) {
  const guardado = localStorage.getItem(`db:${recurso}`);
  if (guardado) return JSON.parse(guardado);
  const res = await fetch(`/mocks/${recurso}.json`);
  if (!res.ok) throw new Error(res.status);
  const datos = await res.json();
  guardar(recurso, datos);
  return datos;
}

function guardar(recurso, datos) {
  localStorage.setItem(`db:${recurso}`, JSON.stringify(datos));
}

const siguienteId = (lista) => lista.reduce((max, item) => Math.max(max, item.id), 0) + 1;
const claveFecha = (p) => `${p.fecha}T${p.hora}`;
const sinPassword = ({ password, ...publico }) => publico;

export function iniciarSesion({ usuario, password }) {
  return simular(async () => {
    const usuarios = await leer('usuarios');
    const encontrado = usuarios.find((u) => u.usuario === usuario && u.password === password);
    if (!encontrado) return fallo(401, 'Usuario o contraseña incorrectos');
    return exito(200, sinPassword(encontrado));
  });
}

export function registrarUsuario(datos) {
  return simular(async () => {
    const usuarios = await leer('usuarios');
    if (usuarios.some((u) => u.usuario === datos.usuario)) {
      return fallo(409, 'El nombre de usuario ya existe');
    }
    const nuevo = { ...datos, id: siguienteId(usuarios), rol: 'arbitro' };
    guardar('usuarios', [...usuarios, nuevo]);
    return exito(201, sinPassword(nuevo));
  });
}

export function obtenerPerfil(id) {
  return simular(async () => {
    const usuarios = await leer('usuarios');
    const usuario = usuarios.find((u) => u.id === Number(id));
    if (!usuario) return fallo(404, 'Usuario no encontrado');
    return exito(200, sinPassword(usuario));
  });
}

export function actualizarPerfil(id, cambios) {
  return simular(async () => {
    const usuarios = await leer('usuarios');
    const i = usuarios.findIndex((u) => u.id === Number(id));
    if (i === -1) return fallo(404, 'Usuario no encontrado');
    const { id: _, rol, ...permitidos } = cambios;
    usuarios[i] = { ...usuarios[i], ...permitidos };
    guardar('usuarios', usuarios);
    return exito(200, sinPassword(usuarios[i]));
  });
}

export function obtenerPartidos({ busqueda = '', estado = '', orden = 'fecha-desc' } = {}) {
  return simular(async () => {
    const texto = busqueda.trim().toLowerCase();
    let partidos = await leer('partidos');
    if (texto) {
      partidos = partidos.filter((p) =>
        [p.local, p.visita, p.cancha].some((campo) => String(campo).toLowerCase().includes(texto))
      );
    }
    if (estado) partidos = partidos.filter((p) => p.estado === estado);
    partidos.sort((a, b) =>
      orden === 'fecha-asc'
        ? claveFecha(a).localeCompare(claveFecha(b))
        : claveFecha(b).localeCompare(claveFecha(a))
    );
    return exito(200, partidos);
  });
}

export function obtenerPartido(id) {
  return simular(async () => {
    const partidos = await leer('partidos');
    const partido = partidos.find((p) => p.id === Number(id));
    return partido ? exito(200, partido) : fallo(404, 'Partido no encontrado');
  });
}

export function crearPartido(datos) {
  return simular(async () => {
    const partidos = await leer('partidos');
    const nuevo = { ...datos, id: siguienteId(partidos) };
    guardar('partidos', [...partidos, nuevo]);
    return exito(201, nuevo);
  });
}

export function actualizarPartido(id, cambios) {
  return simular(async () => {
    const partidos = await leer('partidos');
    const i = partidos.findIndex((p) => p.id === Number(id));
    if (i === -1) return fallo(404, 'Partido no encontrado');
    partidos[i] = { ...partidos[i], ...cambios, id: Number(id) };
    guardar('partidos', partidos);
    return exito(200, partidos[i]);
  });
}

export function eliminarPartido(id) {
  return simular(async () => {
    const partidos = await leer('partidos');
    if (!partidos.some((p) => p.id === Number(id))) {
      return fallo(404, 'Partido no encontrado');
    }
    guardar('partidos', partidos.filter((p) => p.id !== Number(id)));
    return exito(200, { id: Number(id) });
  });
}
```

Antes de reemplazarlo, revisa en tu archivo actual tres cosas, porque si cambian se rompen las páginas de Carlos y Josefa:

1. **Nombres de las funciones exportadas**: si tu archivo tiene alguna que aquí no está (por ejemplo `obtenerEquipos` o `cerrarSesion`), cópiala al final y envuélvela en `simular` igual que las demás, sin otro `await esperar`.
2. **Parámetros**: si por ejemplo tu `actualizarPerfil` recibe solo `(cambios)` en vez de `(id, cambios)`, ajusta esa firma.
3. **Ruta de los mocks**: si tus JSON no están en `public/mocks/`, cambia `/mocks/` en `leer()`.

Si me pegas tu archivo actual, te lo devuelvo ajustado exactamente a lo que tienes.

### Prompt 4

(se pegó el contenido completo de comun/api.js)

```js
// [IA] inicio · ia/2026-11-04_cbenavidesp_carpetas-y-limpieza.md
const ES_VITE = typeof window !== "undefined" && (location.port === "5173" || Boolean(document.querySelector('script[src*="@vite"]')));
const API_BASE = ES_VITE
  ? `${location.origin}/mocks`
  : new URL("../public/mocks", document.currentScript?.src ?? location.href).href;
// [IA] fin
const STORAGE_KEY = "partidos_crud_data";
const LATENCIA = 450;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  await esperar(LATENCIA);
  simularFallo();
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

const momento = (p) => `${p.fecha} ${p.hora}`;

async function obtenerResumen(usuario) {
  try {
    let partidos;
    simularFallo();
    const guardados = localStorage.getItem(STORAGE_KEY);
    if (guardados) {
      partidos = JSON.parse(guardados);
    } else {
      partidos = await pedir("partidos");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(partidos));
    }

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
    simularFallo();
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

// [IA] inicio · ia/2026-11-03_josefasolis1-hue_crud-partidos.md
async function obtenerEquipos() {
  try {
    simularFallo();
    const equipos = await pedir("equipos");
    return { ok: true, status: 200, datos: equipos, data: equipos };
  } catch (error) {
    return { ok: false, status: 500, error: "No se pudieron cargar los equipos." };
  }
}
// [IA] fin

// [IA] inicio · ia/2026-11-09_cbenavidesp_acceso-unico-arbitros.md
const USUARIOS_KEY = "usuarios_data";

async function leerUsuarios() {
  simularFallo();
  const guardados = localStorage.getItem(USUARIOS_KEY);
  if (guardados) {
    await esperar(LATENCIA);
    return JSON.parse(guardados);
  }
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
    const usuarios = await leerUsuarios();
    const arbitros = usuarios.filter((u) => u.rol === "arbitro").map(sinClave);
    return { ok: true, status: 200, datos: arbitros, data: arbitros };
  } catch (error) {
    return { ok: false, status: 500, error: "No se pudieron cargar los árbitros." };
  }
}

async function crearArbitro(datos) {
  try {
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
    await esperar(LATENCIA);
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
```

### Respuesta 4

Con tu archivo real, el problema está claro: la espera está metida dentro de `pedir()` y `leerUsuarios()`, así que a veces se salta (cuando hay datos en `localStorage`) y a veces se suma dos veces. La solución es sacarla de ahí y que cada función pública espere **una sola vez al inicio**.

Reemplaza todo `comun/api.js` por esto:

```js
// [IA] inicio · ia/2026-11-04_cbenavidesp_carpetas-y-limpieza.md
const ES_VITE = typeof window !== "undefined" && (location.port === "5173" || Boolean(document.querySelector('script[src*="@vite"]')));
const API_BASE = ES_VITE
  ? `${location.origin}/mocks`
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

// [IA] inicio · ia/2026-11-09_cbenavidesp_acceso-unico-arbitros.md
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
```

**Qué cambió**

- `LATENCIA = 450` pasó a `latencia()`, aleatoria entre 300 y 800 ms.
- `pedir()` y `leerUsuarios()` ya no esperan ni llaman a `simularFallo()`. Ahora son solo lectura de datos.
- Nueva `leerPartidos()` (sin espera). `crearPartido`, `actualizarPartido` y `eliminarPartido` la usan en vez de llamar a `obtenerPartidos()`, así no se acumulan esperas.
- Todas las funciones públicas empiezan con `await latencia(); simularFallo();`, y nada más espera. Así `actualizarPerfil` espera una sola vez.
- `eliminarPartido` devuelve `status: 200`, `404` si no existe, `500` si falla, y `data` igual que las demás.

Los nombres y parámetros de todas las funciones quedaron iguales, así que las páginas de Carlos y Josefa no se rompen.

Como la corrección la hiciste con ayuda de IA, acuérdate de marcar el cambio con `[IA] inicio/fin` y registrarlo en `ia/` según la pauta.

### Prompt 5

no me dijiste   lo que modificaste, y explicame lo que hicimos

### Respuesta 5

Tienes razón, lo resumí muy rápido. Aquí va cada cambio con el antes y el después.

**El problema de fondo**

Tu archivo tenía la espera (`await esperar(LATENCIA)`) metida **dentro de las funciones que leen datos** (`pedir` y `leerUsuarios`), no en las funciones que llama la interfaz. Eso causaba dos fallas:

- **A veces no esperaba:** `pedir()` solo se usa cuando no hay nada en `localStorage`. La primera vez esperaba, pero después los datos ya estaban guardados, `pedir()` no se llamaba y la respuesta era instantánea.
- **A veces esperaba de más:** `actualizarPerfil` esperaba por su cuenta y después llamaba a `leerUsuarios()`, que esperaba otra vez. 450 + 450 ≈ 920 ms.

La idea de la corrección: **las funciones internas solo leen datos, y cada función pública espera una sola vez al principio.**

**Cambio 1: latencia aleatoria**

Antes:
```js
const LATENCIA = 450;
```
Después:
```js
const LATENCIA_MIN = 300;
const LATENCIA_MAX = 800;
const latencia = () => esperar(LATENCIA_MIN + Math.random() * (LATENCIA_MAX - LATENCIA_MIN));
```
`Math.random()` da un número entre 0 y 1. Multiplicado por 500 queda entre 0 y 500, y sumándole 300 queda entre 300 y 800.

**Cambio 2: `pedir()` ya no espera**

Antes:
```js
async function pedir(recurso) {
  await esperar(LATENCIA);
  simularFallo();
  let respuesta = await fetch(...);
```
Después:
```js
async function pedir(recurso) {
  let respuesta = await fetch(...);
```
Ahora solo hace el `fetch` del JSON.

**Cambio 3: `leerUsuarios()` ya no espera**

Antes:
```js
async function leerUsuarios() {
  simularFallo();
  const guardados = localStorage.getItem(USUARIOS_KEY);
  if (guardados) {
    await esperar(LATENCIA);
    return JSON.parse(guardados);
  }
```
Después:
```js
async function leerUsuarios() {
  const guardados = localStorage.getItem(USUARIOS_KEY);
  if (guardados) return JSON.parse(guardados);
```
Esta era la que hacía que `actualizarPerfil` esperara dos veces.

**Cambio 4: función nueva `leerPartidos()` y `guardarPartidos()`**

Antes no existían. El código de "leer de localStorage o si no pedir el JSON" estaba repetido en `obtenerPartidos` y `obtenerResumen`. Ahora está en un solo lugar:
```js
async function leerPartidos() {
  const guardados = localStorage.getItem(STORAGE_KEY);
  if (guardados) return JSON.parse(guardados);
  const partidos = await pedir("partidos");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(partidos));
  return partidos;
}
```
`guardarPartidos()` reemplaza los `localStorage.setItem(STORAGE_KEY, ...)` sueltos.

**Cambio 5: todas las funciones públicas esperan al inicio**

A `obtenerResumen`, `obtenerPartidos`, `crearPartido`, `actualizarPartido`, `eliminarPartido`, `obtenerEquipos`, `obtenerArbitros`, `crearArbitro`, `eliminarArbitro`, `iniciarSesion`, `obtenerPerfil` y `actualizarPerfil` les agregué al principio del `try`:
```js
await latencia();
simularFallo();
```
Así todas esperan exactamente una vez, haya o no datos guardados.

**Cambio 6: CRUD de partidos usa `leerPartidos()`**

Antes, `crearPartido`, `actualizarPartido` y `eliminarPartido` empezaban así:
```js
const resultado = await obtenerPartidos();
if (!resultado.ok) return resultado;
const partidos = resultado.datos;
```
Después:
```js
await latencia();
simularFallo();
const partidos = await leerPartidos();
```
Si hubieran seguido llamando a `obtenerPartidos()`, que ahora sí espera, más su propia espera, habrían esperado dos veces. También les agregué `try/catch` porque antes `crearPartido`, `actualizarPartido` y `eliminarPartido` no tenían y un error podía romper la página.

**Cambio 7: `eliminarPartido` con `status`**

Antes:
```js
const filtrados = partidos.filter((p) => p.id != id);
localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
return { ok: true, datos: { id } };
```
Después:
```js
if (!partidos.some((p) => p.id == id)) {
  return { ok: false, status: 404, error: "Partido no encontrado para eliminar." };
}
guardarPartidos(partidos.filter((p) => p.id != id));
return { ok: true, status: 200, datos: { id }, data: { id } };
```
Ahora devuelve `status` como todas las demás, y si el partido no existe responde 404 en vez de decir que lo eliminó.

**Cambio 8: `obtenerResumen` más corto**

Antes armaba el mismo objeto dos veces (en `datos` y en `data`). Ahora lo arma una vez en `resumen` y lo usa en ambos. Devuelve exactamente lo mismo.

**Lo que no cambió**

Nombres de funciones, parámetros, formato de respuesta (`ok`, `status`, `datos`, `data`, `error`), mensajes de error, `?fallar` y los comentarios `[IA]` de Carlos y Josefa. Por eso las páginas de tus compañeros siguen funcionando igual.

## Qué se incorporó al proyecto

El archivo comun/api.js completo de la Respuesta 4, sin cambios. Las respuestas 1 y 3 eran propuestas generales hechas sin conocer el archivo real y no se usaron.

## Verificación

Se levantó el proyecto con npm run dev. En la consola del navegador se midió el tiempo de respuesta de obtenerPartidos, crearPartido, actualizarPartido, eliminarPartido y actualizarPerfil con datos ya guardados en localStorage, y todas respondieron entre 300 y 800 ms. eliminarPartido devuelve status 200 al eliminar y 404 con un id inexistente.

## Conclusión

*Los dos problemas venían de que la latencia estaba en funciones internas que no siempre se ejecutaban, por lo que a veces no había espera y otras se sumaba dos veces, y de que eliminarPartido no devolvía status. Con esto aprendí que la latencia simulada debe ir al inicio de cada función pública y no en las auxiliares, que si una función que espera llama a otra que también espera los tiempos se suman, que todas las respuestas de una API deben tener el mismo formato incluyendo el status, que juntar el código repetido en una sola función evita que las demás queden distintas, y que la IA entrega mejores respuestas cuando se le da el código real, pero hay que entender y probar lo que propone antes de usarlo.*