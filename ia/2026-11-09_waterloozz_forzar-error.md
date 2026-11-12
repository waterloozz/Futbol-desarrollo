# Forzar errores en la capa de datos (?fallar)

- **Fecha:** 2026-11-09
- **Integrante:** Roberto Sánchez (@waterloozz)
- **Herramienta y modelo:** Claude Code (Claude Sonnet 5.5 en los Prompts 1 a 4; Claude Opus 5.5 desde el Prompt 5)
- **Enlace a la conversación:** no aplica (Claude Code no permite compartir la conversación; el texto completo va abajo, exportado de la sesión)
- **Archivos afectados:** comun/api.js (constante `PROBABILIDAD_FALLA` y funciones `debeFallar()` y `simularFallo()`, más una llamada a `simularFallo()` en `pedir()`, `obtenerResumen()`, `obtenerPartidos()` y `leerUsuarios()`); README.md (1 línea en "Capa de datos").

> **Nota:** este registro se subió el 2026-11-11, después del código. El código se subió el 2026-11-09 en el commit `c3dddcc` sin su registro y sin marcas `[IA]`; en ese momento no lo documenté.

## Objetivo

La sección 5.2 del PDF pide que sea posible forzar un error, con un parámetro o una probabilidad de falla, para mostrar cómo la interfaz lo maneja. Era lo que me faltaba en `api.js`. Le pedí a la IA el código para hacerlo en una rama y después integrarlo a `main`.

## Conversación (texto completo, sin editar)

Esta conversación fue en mi computador. Aquí va el texto de cada respuesta. Los títulos dentro de las respuestas se bajaron de nivel para no romper la estructura de este archivo; el texto no se cambió.

### Prompt 1

```text
@"/home/rober/Escritorio/session-export-1793726271342.zip"
```

### Respuesta 1

Recibí el archivo. Es la exportación de tu sesión anterior del laboratorio. Cubre:
- Dashboard responsive
- Corrección de `js/api.js`
- Accesibilidad
- `usuarios.json` a 10 usuarios
- Reglas que acordamos (español, sin firma de IA, no commit sin confirmación)

Lo pendiente de `api.js` según la rúbrica es el formato `{ ok, status, data, error }` y forzar un error.

### Prompt 2

```text
actualiza el proyecto al ultimo commit de mmis compañeros
```

### Respuesta 2

El proyecto ya está actualizado. `main` quedó al día con `origin/main`. Se trajeron los commits de tus compañeros sin conflictos. Tu trabajo previo ya está incluido.

### Prompt 3

```text
Qué decirle a Roberto de carlos

1. Vas a agregar funciones al final de api.js y a cambiar las líneas 30-31 de obtenerResumen(), para que busque por email.
2. En usuarios.json, las contraseñas pasan a sal + hash y los árbitros reciben RUT, teléfono y categoría.
3. El login pasa a ser por email y deja de tener las cuentas escritas a mano.
4. Que no edite api.js, usuarios.json ni login.js hasta que lo subas, para evitar conflictos.
```

### Respuesta 3

Mensaje corto para Carlos:

> Hola Roberto, te aviso de unos cambios que voy a subir, para que no nos pisemos:
>
> 1. **`api.js`:** voy a agregar funciones al final y a cambiar las líneas 30-31 de `obtenerResumen()`, para que busque al usuario por email.
> 2. **`usuarios.json`:** las contraseñas pasan a sal + hash, y los árbitros reciben RUT, teléfono y categoría.
> 3. **Login:** pasa a ser por email y ya no tendrá las cuentas escritas a mano en el código.
>
> Mientras no lo suba, **no edites `api.js`, `usuarios.json` ni `login.js`**, para evitar conflictos. Cuando suba mis cambios te aviso y haces `git pull`.

### Prompt 4

```text
Roberto, poder forzar un error en api.js: con ?fallar en la URL o con una probabilidad de falla. Lo pide la sección 5.2 del PDF, y es lo más importante que falta de su parte.  eso tengo que hacer trabaja en otra rama y despues la integras al main
```

### Respuesta 4

Aquí tienes el código para forzar errores:

**comun/api.js**:

```js

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
  const respuesta = await fetch(`${API_BASE}/${recurso}.json`);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar "${recurso}" (HTTP ${respuesta.status})`);
```

```js
async function obtenerResumen(usuario) {
  try {
    let partidos;
    simularFallo();
    const guardados = localStorage.getItem(STORAGE_KEY);
    if (guardados) {
      partidos = JSON.parse(guardados);
```

```js

async function obtenerPartidos() {
  try {
    simularFallo();
    const guardados = localStorage.getItem(STORAGE_KEY);
    if (guardados) {
      const partidos = JSON.parse(guardados);
```

```js
const USUARIOS_KEY = "usuarios_data";

async function leerUsuarios() {
  simularFallo();
  const guardados = localStorage.getItem(USUARIOS_KEY);
  if (guardados) {
    await esperar(LATENCIA);
```

**README.md** (línea de explicación):

```markdown
- La primera vez leen los archivos de `public/mocks/` y los copian a `localStorage` (`partidos_crud_data` y `usuarios_data`). Desde ahí se leen y se guardan todos los cambios, que se mantienen al recargar.
- Responden con `{ ok: true, status, datos }` si todo sale bien (200 o 201), o `{ ok: false, status, error }` con un mensaje para mostrar en pantalla (401, 404, 409 o 500). En los errores de validación (409) también envían `errores`, con un mensaje por campo.
- Las funciones de usuarios **nunca entregan la sal ni el hash** a las vistas.
- **Forzar un error (para probar el estado de error):** agregar `?fallar` a la URL de la página (por ejemplo `http://localhost:5173/usuario/dashboard.html?fallar`) y toda lectura responde `{ ok: false, status: 500, error }`, con el botón **Reintentar** visible. `?fallar=0` lo desactiva. También se puede simular una falla al azar con `?probabilidadFalla=0.3` (30 %) o cambiando `PROBABILIDAD_FALLA` en `comun/api.js`.

### Endpoints simulados
```

Aquí está. Cópialo, pruébalo con `?fallar` y avísame cómo quedó.

### Prompt 5

```text
hace el push  con el nombre de mi github
```

### Respuesta 5

El commit ya está a tu nombre (`Roberto Sánchez <roberto.sanchez1@mail.udp.cl>`) y sin firma de IA. Para subirlo ejecuta en tu terminal:

```bash
git push origin main
```

Te va a pedir usuario y token de GitHub.

### Prompt 6

```text
en mi codigo nio pongas comentarios
```

### Respuesta 6

Listo. Quité de `comun/api.js` los comentarios que había agregado. El código funciona igual.

### Prompt 7

```text
No por ahora
```

### Respuesta 7

Entendido. El commit `c3dddcc` sigue con los comentarios y todavía no se ha subido. El cambio que quita los comentarios queda sin commit.

### Prompt 8

```text
ya subi el commit anterior asique despues lo subimos
```

### Respuesta 8

Confirmado. `c3dddcc` ya está en GitHub. El único pendiente es `comun/api.js` sin los comentarios. Cuando quieras subirlo, avísame.

## Qué se incorporó al proyecto

- `comun/api.js`: `debeFallar()` revisa si la URL trae `?fallar` (se desactiva con `?fallar=0` o `?fallar=false`) o `?probabilidadFalla=<0 a 1>`, y si no usa la constante `PROBABILIDAD_FALLA` (0 por defecto). `simularFallo()` lanza un error que cada función captura y responde `{ ok: false, status: 500, error }`. Se usó tal como lo propuso la IA.
- `README.md`: una línea que explica cómo forzar el error.
- El commit lo hizo la IA a mi nombre; el push lo hice yo.

### Código final que dejó la IA

Las partes de cada archivo que la IA modificó, tal como quedaron en el commit. Los números son las líneas del archivo en ese commit.

#### Commit `c3dddcc feat(api): forzar errores con ?fallar o probabilidad de falla simulada`

`README.md`, líneas 121-127:

```markdown
- La primera vez leen los archivos de `public/mocks/` y los copian a `localStorage` (`partidos_crud_data` y `usuarios_data`). Desde ahí se leen y se guardan todos los cambios, que se mantienen al recargar.
- Responden con `{ ok: true, status, datos }` si todo sale bien (200 o 201), o `{ ok: false, status, error }` con un mensaje para mostrar en pantalla (401, 404, 409 o 500). En los errores de validación (409) también envían `errores`, con un mensaje por campo.
- Las funciones de usuarios **nunca entregan la sal ni el hash** a las vistas.
- **Forzar un error (para probar el estado de error):** agregar `?fallar` a la URL de la página (por ejemplo `http://localhost:5173/usuario/dashboard.html?fallar`) y toda lectura responde `{ ok: false, status: 500, error }`, con el botón **Reintentar** visible. `?fallar=0` lo desactiva. También se puede simular una falla al azar con `?probabilidadFalla=0.3` (30 %) o cambiando `PROBABILIDAD_FALLA` en `comun/api.js`.

### Endpoints simulados

```

`comun/api.js`, líneas 5-38:

```js

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
  const respuesta = await fetch(`${API_BASE}/${recurso}.json`);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar "${recurso}" (HTTP ${respuesta.status})`);
```

`comun/api.js`, líneas 45-51:

```js
async function obtenerResumen(usuario) {
  try {
    let partidos;
    simularFallo();
    const guardados = localStorage.getItem(STORAGE_KEY);
    if (guardados) {
      partidos = JSON.parse(guardados);
```

`comun/api.js`, líneas 103-109:

```js

async function obtenerPartidos() {
  try {
    simularFallo();
    const guardados = localStorage.getItem(STORAGE_KEY);
    if (guardados) {
      const partidos = JSON.parse(guardados);
```

`comun/api.js`, líneas 174-180:

```js
const USUARIOS_KEY = "usuarios_data";

async function leerUsuarios() {
  simularFallo();
  const guardados = localStorage.getItem(USUARIOS_KEY);
  if (guardados) {
    await esperar(LATENCIA);
```

## Verificación

- Se probó con `?fallar` y con `?probabilidadFalla=1`: las funciones respondieron `ok: false, status: 500`.
- Con `?fallar=0` y `?probabilidadFalla=0` respondieron `ok: true, status: 200`.
- En el navegador, `login/registro.html?fallar` muestra "Error de red simulado. Inténtalo de nuevo."

## Conclusión: lo que aprendí

*Aprendí a leer parámetros de la URL con URLSearchParams para cambiar el comportamiento de la página sin tocar el código, y a simular una falla con una probabilidad usando Math.random(). También entendí el flujo de errores: simularFallo() lanza un error, cada función lo captura con try/catch y responde { ok: false, status: 500, error }, y así la interfaz muestra el estado de error con el botón Reintentar. Esto sirve para probar que la página maneja bien los errores sin tener que romper nada de verdad. En Git aprendí a trabajar en una rama e integrarla a main*
