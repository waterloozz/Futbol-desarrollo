# Perfil con obtenerPerfil() y actualizarPerfil() en la capa de datos

- **Fecha:** 2026-11-11
- **Integrante:** Roberto Sánchez (@waterloozz)
- **Herramienta y modelo:** Claude Code (Claude Sonnet 5.5)
- **Enlace a la conversación:** no aplica (Claude Code no permite compartir la conversación; el texto completo va abajo, exportado de la sesión)
- **Archivos afectados:** comun/api.js (funciones `obtenerPerfil()` y `actualizarPerfil()` al final del archivo); usuario/perfil.html (carga de `api.js`, componente Alpine `perfil` y estados de cargando y error). En esta conversación la IA solo me dio el código y yo lo implementé; no editó los archivos.

## Objetivo

La revisión de la Entrega 2 indicó que el Perfil muestra el email como "Nombre de usuario" (A1), porque el login guarda el email en `localStorage` y el Perfil lo mostraba tal cual. Pide resolverlo con `obtenerPerfil()` y `actualizarPerfil()` en `api.js`. Carlos me dijo que lo hiciera yo, dentro de mi punto B2. Le pedí a la IA que me explicara cómo hacerlo y me diera el código completo.

## Conversación (texto completo, sin editar)

Esta conversación fue en mi computador. Aquí va el texto de cada respuesta. Los títulos dentro de las respuestas se bajaron de nivel para no romper la estructura de este archivo; el texto no se cambió.

### Prompt 1

```text
[Captura de WhatsApp con un mensaje de Carlos udp]

Carlos udp: @robertiño me dice esto mi claude

#: 3
Qué: El Perfil muestra el email como "Nombre de usuario" (A1). Lo causó tu cambio en el login
Archivos: usuario/perfil.html + comun/api.js
Tamaño: Mediano

Sobre el punto 3: la revisión pide resolverlo con obtenerPerfil() y actualizarPerfil() en api.js, y esa es una tarea de Roberto dentro de su punto B2, junto con la latencia y obtenerEquipos(). Si él va a hacer obtenerPerfil(), el Perfil se arregla solo y conviene no hacerlo dos veces. Pregúntale si lo va a hacer él.

lo haces tu o yo?
me avisas, por mientras modificar esto #: 1
Qué: Las 6 marcas [IA] pendientes. Hoy el patch aplica limpio, así que es casi automático
Archivos: comun/api.js (3), comun/menu.js (1), index.html (2)
Tamaño: Muy chico

#: 2
Qué: README: - La fila "Crear cuenta" (login/registro.html) en la tabla de Vistas y un paso en "Cómo probar" (E1) - @waterloozz junto a Roberto en Integrantes (E1) - En Funcionalidades, cambiar la lista de componentes: la revisión no contó el "menú desplegable" (README línea 98) y ahora existen las pestañas del acta
Archivos: README.md
Tamaño: Chico

eso es lo que me dijo carlos que tengo que hacer primero
```

### Respuesta 1

Voy con el #1 (marcas [IA] pendientes) y el #2 (README). El #3 queda para que lo decidas con Carlos. Primero reviso el repo.

*Claude ejecutó en la terminal (buscar las marcas [IA] y ver los últimos commits):*

```bash
git log --stat -3; grep -rn "\[IA" --include=*.js --include=*.html --include=*.md .
git show 91507ef
git fetch; git status -sb; grep -n "waterloozz\|Crear cuenta\|menú desplegable\|pestañas" README.md
```

### Prompt 2

```text
[Request interrupted by user]
acuerdate de no hacer commits sin que te lo pida, solo para que me guies
```

### Respuesta 2

Anotado: no hago commits ni push si no me lo pides, y por ahora solo te guío.

Lo que Carlos te pasó como #1 y #2 **ya está hecho**. Entró en el commit `91507ef` ("Agrega marcas [IA] en archivos compartidos y actualiza README…"), que ya está en `origin/main`. Tu repo está limpio y no cambié nada.

- **#1, las 6 marcas `[IA]`:** están las 3 de `comun/api.js`, la 1 de `comun/menu.js` y las 2 de `index.html`. Coinciden con lo que describe Carlos.
- **#2, README:** ya incluye todo lo que pedía:
  - la fila "Crear cuenta" en la tabla de Vistas
  - el paso de "Cómo probar"
  - `@waterloozz` en Integrantes
  - la lista de componentes corregida (pestañas del acta, sin el "menú desplegable")

Ese mensaje de Carlos parece de antes de que se hiciera ese commit. Haz `git pull` por si acaso y avísale que esas dos ya están.

**#3 (Perfil muestra el email como "Nombre de usuario"):** la decisión es tuya. Lo que pasa es que la revisión pide arreglarlo con `obtenerPerfil()` y `actualizarPerfil()` en `comun/api.js`, y eso va dentro de tu punto B2, junto con la latencia aleatoria y `obtenerEquipos()`.

- Si lo haces tú, conviene hacerlo todo junto, porque el Perfil se arregla casi solo.
- Si Carlos lo hace antes, ambos van a tocar `api.js` y habrá conflicto.

Mi recomendación es responderle que lo haces tú dentro de B2, y que él no toque `api.js` ni `perfil.html`. ¿Quieres que te explique cómo hacerlo paso a paso?

### Prompt 3

```text
#: 3
Qué: El Perfil muestra el email como "Nombre de usuario" (A1). Lo causó tu cambio en el login
Archivos: usuario/perfil.html + comun/api.js
Tamaño: Mediano

Sobre el punto 3: la revisión pide resolverlo con obtenerPerfil() y actualizarPerfil() en api.js, y esa es una tarea de Roberto dentro de su punto B2, junto con la latencia y obtenerEquipos(). Si él va a hacer obtenerPerfil(), el Perfil se arregla solo y conviene no hacerlo dos veces. Pregúntale si lo va a hacer él.

 eso me dijjo que hiciera yo
```

### Respuesta 3

Reviso cómo está hoy el Perfil y `api.js` para darte pasos concretos.

*Claude ejecutó en la terminal (leer perfil.html, las funciones de api.js, usuarios.json y dónde se guarda `localStorage.usuario`):*

```bash
cat usuario/perfil.html; grep -n "^async function\|^function\|LATENCIA\|localStorage" comun/api.js; ls public/mocks
sed -n 1,50p comun/api.js; sed -n 176,215p comun/api.js; sed -n 263,280p comun/api.js; head -c 600 public/mocks/usuarios.json
grep -n "localStorage" login/*.js comun/menu.js usuario/dashboard.html
```

Nota: el Perfil ni siquiera carga `api.js` hoy, así que parte del arreglo es agregarlo. Mira ahora el formato de los datos y las funciones existentes para calzar el estilo.

Te dejo el plan para #3 sin tocar nada.

**Causa:** el login guarda el email en `localStorage.usuario`, y `perfil.html` lo muestra tal cual como "Nombre de usuario". Los usuarios ya tienen `usuario` y `nombre` en `usuarios.json`, pero el Perfil nunca los consulta. Además, `perfil.html` no carga `api.js`.

**Pasos:**

1. **`comun/api.js`, `obtenerPerfil(email)`**
   - Va junto a `iniciarSesion`, dentro del bloque `[IA]` de ese archivo o en uno nuevo.
   - Usa `leerUsuarios()` para buscar por email.
   - Devuelve el usuario sin la clave (`sinClave`), mezclado con los datos guardados en `localStorage` (asociación y teléfono).
   - Respuesta `{ ok, status, datos, data }`, igual que las demás.
   - En error devuelve `{ ok: false, status: 500, error }`.

2. **`comun/api.js`, `actualizarPerfil(email, { asociacion, telefono })`**
   - Valida el teléfono.
   - Guarda con `guardarUsuarios`, o con las claves `perfil_*`.
   - Devuelve `{ ok: true, datos }`.

3. **`usuario/perfil.html`**
   - Agrega `<script src="../comun/api.js" defer></script>` antes de Alpine.
   - Cambia `x-data` a un `init()` async que llama `obtenerPerfil(localStorage.getItem('usuario'))`.
   - Agrega estados `cargando` y `error` con botón Reintentar, como en el dashboard.
   - Muestra `perfil.usuario` en "Nombre de usuario" y `perfil.nombre` en el título de la tarjeta.
   - `guardar()` pasa a llamar `actualizarPerfil` y, según `ok`, muestra el toast de éxito o de error.

4. **B2:** la latencia aleatoria que Carlos menciona se hace en `esperar` o `LATENCIA`, por ejemplo `300 + Math.random() * 500`. `obtenerEquipos()` va con el mismo patrón que `obtenerPartidos` leyendo `equipos.json`.

5. **Marcas `[IA]`:** si usas IA para esto, envuelve lo nuevo en `api.js` y `perfil.html` con `[IA] inicio · ia/<registro>.md` y `[IA] fin`, y crea el registro en `ia/`.

¿Quieres que lo implemente yo o prefieres escribirlo tú? Si lo hago, no commiteo.

### Prompt 4

```text
dame el codigo y lo implemento yo
```

### Respuesta 4

Confirmado: `localStorage.usuario` guarda el email. Aquí está el código.

##### 1. `comun/api.js` (al final, después de `iniciarSesion`)

```js
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
```

Esto va dentro del bloque `[IA]` si usas IA, o con tu propia marca si lo escribes tú.

##### 2. `usuario/perfil.html`

**a) Agrega `api.js` antes de Alpine:**

```html
  <script src="../comun/api.js" defer></script>
  <script src="../comun/menu.js" defer></script>
  <script src="../comun/componentes.js" defer></script>
```

**b) Reemplaza el `x-data="{...}"` del `<main>` por un componente registrado en un script (poner antes de Alpine, con `defer`):**

```html
  <script defer>
    document.addEventListener("alpine:init", () => {
      Alpine.data("perfil", () => ({
        estado: "cargando",
        error: "",
        datos: null,
        asociacion: "",
        telefono: "",
        guardando: false,
        async init() {
          if (typeof redirigiendo !== "undefined" && redirigiendo) return;
          await this.cargar();
        },
        async cargar() {
          this.estado = "cargando";
          const r = await obtenerPerfil(localStorage.getItem("usuario"));
          if (!r.ok) {
            this.error = r.error;
            this.estado = "error";
            return;
          }
          this.datos = r.datos;
          this.asociacion = r.datos.asociacion;
          this.telefono = r.datos.telefono;
          this.estado = "listo";
        },
        async guardar() {
          this.guardando = true;
          const r = await actualizarPerfil(this.datos.email, {
            asociacion: this.asociacion,
            telefono: this.telefono,
          });
          this.guardando = false;
          if (r.ok) {
            this.datos = r.datos;
            notificar("Perfil actualizado con éxito.", "exito");
          } else {
            notificar(r.error, "error");
          }
        },
      }));
    });
  </script>
```

Y el `<main>` queda:

```html
  <main x-data="perfil" class="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-6">
```

**c) Estados cargando/error**, justo después del bloque del título `<div class="space-y-1">…</div>`:

```html
    <p x-show="estado === 'cargando'" x-cloak role="status" aria-live="polite" class="text-sm text-slate-600">Cargando perfil…</p>

    <div x-show="estado === 'error'" x-cloak role="alert" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p x-text="error"></p>
      <button type="button" @click="cargar()" class="mt-2 rounded-lg bg-red-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-800">Reintentar</button>
    </div>
```

Al `<div class="grid grid-cols-1 gap-6 md:grid-cols-3">` agrégale `x-show="estado === 'listo'" x-cloak`.

**d) Cambios en la tarjeta y el formulario:**

```html
<span x-text="datos?.nombre.substring(0, 2)"></span>
```
```html
<h3 class="mt-4 text-lg font-bold text-slate-900" x-text="datos?.nombre"></h3>
```
```html
:class="datos?.rol === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'"
x-text="datos?.rol === 'admin' ? 'Administrador' : 'Árbitro Oficial'"
```
```html
<input type="text" id="pUsuario" :value="datos?.usuario" disabled ...>
```
```html
<input type="text" id="pRol" :value="datos?.rol" disabled ...>
```

Opcional: agrega un campo de email de solo lectura con `:value="datos?.email"`.

Botón de guardar:

```html
<button type="submit" :disabled="guardando" x-text="guardando ? 'Guardando…' : 'Guardar Cambios'" class="...">Guardar Cambios</button>
```

##### Notas

- `notificar(msg, 'error')` depende de que tu toast soporte el tipo `error`. Si en `comun/componentes.js` el tipo se llama distinto, ajústalo.
- El `usuario` de los árbitros creados por "Crear cuenta" puede venir vacío. Si pasa, usa `datos?.usuario || datos?.email` en el input.
- Si el teléfono de los mocks tiene otro formato, ajusta la regex.
- Prueba con `perfil.html?fallar` para ver el estado de error y Reintentar.
- No olvides el registro en `ia/` y las marcas `[IA]` si usas IA.

### Prompt 5

```text
explicame que hace cada cosa
```

### Respuesta 5

##### Qué hace cada parte

###### En `comun/api.js`

**`obtenerPerfil(email)`** busca los datos del usuario que tiene la sesión abierta.
- `leerUsuarios()` trae la lista de usuarios (de `localStorage`, o de `usuarios.json` la primera vez).
- `.find(...)` busca al que tiene ese email. Se pasa a minúsculas para que `Admin@x.cl` y `admin@x.cl` cuenten como el mismo.
- Si no existe, devuelve `404`.
- `sinClave(usuario)` quita `sal` y `passwordHash` para que la contraseña nunca llegue a la pantalla.
- `asociacion` y `telefono` llevan valores por defecto por si el usuario nunca los editó. El admin no tiene teléfono en el mock.
- Devuelve `{ ok, status, datos, data }`, el mismo formato que usan las demás funciones, así que el resto del código sabe leerlo.
- El `try/catch` convierte cualquier error (por ejemplo el fallo simulado con `?fallar`) en `{ ok: false, status: 500 }`, en vez de romper la página.

**`actualizarPerfil(email, { asociacion, telefono })`** guarda los cambios del formulario.
- `esperar(LATENCIA)` y `simularFallo()` imitan un servidor real: tarda un poco y a veces puede fallar.
- `findIndex` ubica la posición del usuario en la lista.
- La regex valida el teléfono: empieza con `+` o dígito, y sigue con 6 a 19 dígitos, espacios o guiones. Si no cumple, devuelve `400` con el mensaje de error.
- `usuarios[indice] = { ...usuarios[indice], asociacion, telefono }` copia el usuario completo y solo reemplaza esos dos campos, así no se pierde el resto de sus datos.
- `guardarUsuarios` lo escribe en `localStorage`, por eso el cambio sobrevive al recargar.

###### En `usuario/perfil.html`

**El `<script src="../comun/api.js">`** hace que la página conozca `obtenerPerfil` y `actualizarPerfil`. Sin él habrían dado "no está definida".

**`Alpine.data("perfil", ...)`** es el componente que maneja la página, y sustituye al bloque que estaba escrito dentro del HTML.
- `estado` puede ser `cargando`, `error` o `listo`. Con él la pantalla muestra lo que corresponde.
- `datos` guarda lo que devolvió la API.
- `asociacion` y `telefono` son copias editables, conectadas a los inputs con `x-model`. Se separan de `datos` para que lo que escribas no cambie la tarjeta hasta guardar.
- `init()` corre solo cuando Alpine arranca el componente. Si `redirigiendo` es verdadero (la sesión no es válida y la página va saliendo hacia el login), no pide datos.
- `cargar()` llama a `obtenerPerfil` con el email de la sesión. Si sale mal, muestra el error. Si sale bien, llena `datos` y los campos del formulario. El botón Reintentar vuelve a llamar a esta función.
- `guardar()` llama a `actualizarPerfil`. Mientras espera, `guardando` está en `true`. Después muestra el toast de éxito o el mensaje de error.

**Los bloques de estado:**
- `x-show="estado === 'cargando'"` muestra "Cargando perfil…".
- `x-show="estado === 'error'"` muestra el error con el botón Reintentar.
- `x-show="estado === 'listo'"` en el grid muestra el perfil solo cuando ya hay datos.
- `x-cloak` evita que se vea un parpadeo antes de que Alpine arranque.

**Los cambios en la tarjeta y el formulario:** donde antes salía `usuario` (el email), ahora sale `datos.nombre` en el título y las iniciales, `datos.usuario` en "Nombre de usuario" y `datos.rol` en el rol. Este es el arreglo del bug: el campo ya no recibe el email.

**`datos?.`** es el encadenamiento opcional. Mientras `datos` es `null` (aún cargando), devuelve `undefined` en lugar de dar error.

**El botón `:disabled="guardando"`** impide hacer doble clic mientras guarda, y cambia su texto a "Guardando…".

###### El flujo completo

1. Entras al Perfil. El componente arranca y pone `estado = "cargando"`.
2. `obtenerPerfil` busca al usuario por el email de la sesión.
3. Con la respuesta llena el formulario y pasa a `listo`. Si falla, pasa a `error`.
4. Editas y guardas. `actualizarPerfil` valida, guarda y devuelve el resultado.
5. Sale el toast. Al recargar, los datos siguen ahí porque se leen de `localStorage`.

Si algún punto te queda poco claro, dime cuál y lo detallo.

### Prompt 6

```text
<script src="../comun/api.js" defer></script>
  <script src="../comun/menu.js" defer></script>
  <script src="../comun/componentes.js" defer></script> donde va??
```

### Respuesta 6

En el `<head>` de `usuario/perfil.html`, donde hoy están `menu.js` y `componentes.js`. Solo agregas la línea de `api.js` arriba de ellas:

```html
  <link rel="stylesheet" href="../comun/componentes.css">

  <script src="../comun/api.js" defer></script>
  <script src="../comun/menu.js" defer></script>
  <script src="../comun/componentes.js" defer></script>
  <script defer>
    document.addEventListener("alpine:init", () => {
      Alpine.data("perfil", () => ({
        ...
      }));
    });
  </script>
  <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js" defer></script>
</head>
```

El orden importa:
1. `api.js` va primero para que `obtenerPerfil` y `actualizarPerfil` ya existan cuando se usen.
2. Tu script `Alpine.data("perfil", ...)` va **antes** de la línea de Alpine, porque tiene que registrarse en el evento `alpine:init`, que Alpine dispara al arrancar.
3. La línea de Alpine (`cdn.min.js`) va al final, como ya estaba.

Todos llevan `defer`, así que se ejecutan en el orden en que aparecen, después de que el HTML se haya leído.

Lo único que no cambia es `<script src="../comun/sesion.js"></script>` de arriba, sin `defer`. Déjalo como está.

### Prompt 7

```text
seguro?? no encuentro nada como ves la carpeta tu?
```

### Respuesta 7

*Claude ejecutó en la terminal (ver la carpeta y los scripts del archivo):*

```bash
pwd && git status -sb | head -3 && grep -n "script" usuario/perfil.html
```

Sí, lo veo en `/home/rober/Escritorio/Futbol-desarrollo/usuario/perfil.html`. Es el archivo del **Perfil**, no el `index.html` ni otro. Las líneas son estas:

```
10:  <script src="../comun/sesion.js"></script>
12:  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.13"></script>
18:  <script src="../comun/menu.js" defer></script>
19:  <script src="../comun/componentes.js" defer></script>
20:  <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js" defer></script>
```

Las líneas 18 y 19 son las que buscas. Lo que tienes que hacer:

1. Inserta `<script src="../comun/api.js" defer></script>` entre la línea 17 (la vacía) y la 18.
2. Inserta tu script de `Alpine.data("perfil", ...)` entre la 19 y la 20, o sea justo antes de la línea de Alpine.

Si en tu copia no aparece nada de eso:
- Estás abriendo otro archivo. Comprueba que la ruta sea `usuario/perfil.html`, y no `perfil.html` en otra carpeta.
- Tu copia está desactualizada. Haz `git pull`.
- En VS Code busca con Ctrl+F el texto `menu.js`. Debería aparecer en la línea 18.

¿Qué ruta tiene el archivo que tienes abierto, y qué ves en la zona del `<head>`?

### Prompt 8

```text
dame el codigo mejor completo
```

### Respuesta 8

*Claude ejecutó en la terminal (comprobar que el toast soporta el tipo `error`):*

```bash
grep -n "tipo\|notificar" comun/componentes.js | head; grep -n "toast--" comun/componentes.css
```

El tipo `error` existe, así que el código funciona tal cual. Aquí tienes el archivo completo: reemplaza todo `usuario/perfil.html` con esto.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Perfil de Usuario · Acta Digital Arbitral</title>
  <link rel="icon" href="data:,">


  <script src="../comun/sesion.js"></script>

  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.13"></script>
  <style>
    [x-cloak] { display: none !important; }
  </style>
  <link rel="stylesheet" href="../comun/componentes.css">

  <script src="../comun/api.js" defer></script>
  <script src="../comun/menu.js" defer></script>
  <script src="../comun/componentes.js" defer></script>
  <script defer>
    document.addEventListener("alpine:init", () => {
      Alpine.data("perfil", () => ({
        estado: "cargando",
        error: "",
        datos: null,
        asociacion: "",
        telefono: "",
        guardando: false,
        async init() {
          if (typeof redirigiendo !== "undefined" && redirigiendo) return;
          await this.cargar();
        },
        async cargar() {
          this.estado = "cargando";
          const r = await obtenerPerfil(localStorage.getItem("usuario"));
          if (!r.ok) {
            this.error = r.error;
            this.estado = "error";
            return;
          }
          this.datos = r.datos;
          this.asociacion = r.datos.asociacion;
          this.telefono = r.datos.telefono;
          this.estado = "listo";
        },
        async guardar() {
          this.guardando = true;
          const r = await actualizarPerfil(this.datos.email, {
            asociacion: this.asociacion,
            telefono: this.telefono,
          });
          this.guardando = false;
          if (r.ok) {
            this.datos = r.datos;
            notificar("Perfil actualizado con éxito.", "exito");
          } else {
            notificar(r.error, "error");
          }
        },
      }));
    });
  </script>
  <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js" defer></script>
</head>
<body class="flex min-h-screen flex-col bg-slate-100 text-slate-800">

  <header id="menu-comun"></header>

  <main x-data="perfil" class="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-6">
    <div class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Perfil y Configuración</h1>
      <p class="text-sm text-slate-600">Revisa tus datos personales y credenciales en el sistema arbitral.</p>
    </div>

    <p x-show="estado === 'cargando'" x-cloak role="status" aria-live="polite" class="text-sm text-slate-600">Cargando perfil…</p>

    <div x-show="estado === 'error'" x-cloak role="alert" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p x-text="error"></p>
      <button type="button" @click="cargar()" class="mt-2 rounded-lg bg-red-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-800">Reintentar</button>
    </div>

    <div x-show="estado === 'listo'" x-cloak class="grid grid-cols-1 gap-6 md:grid-cols-3">

      <section aria-labelledby="titulo-resumen-perfil" class="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 text-center flex flex-col items-center">
        <h2 id="titulo-resumen-perfil" class="sr-only">Resumen de usuario</h2>
        <div class="size-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold uppercase shadow-inner">
          <span x-text="datos?.nombre.substring(0, 2)"></span>
        </div>
        <h3 class="mt-4 text-lg font-bold text-slate-900" x-text="datos?.nombre"></h3>
        <span
          class="mt-1 inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold capitalize"
          :class="datos?.rol === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'"
          x-text="datos?.rol === 'admin' ? 'Administrador' : 'Árbitro Oficial'"
        ></span>
        <p class="mt-4 text-xs text-slate-500">Sesión activa y autenticada en el sistema de actas digitales.</p>
      </section>

      <section aria-labelledby="titulo-datos-perfil" class="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 md:col-span-2">
        <h2 id="titulo-datos-perfil" class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Información de la Cuenta</h2>

        <form @submit.prevent="guardar()" class="mt-4 space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="pUsuario" class="block text-xs font-semibold text-slate-700 mb-1">Nombre de usuario</label>
              <input type="text" id="pUsuario" :value="datos?.usuario || datos?.email" disabled class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed">
            </div>
            <div>
              <label for="pRol" class="block text-xs font-semibold text-slate-700 mb-1">Rol en el sistema</label>
              <input type="text" id="pRol" :value="datos?.rol" disabled class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed capitalize">
            </div>
          </div>

          <div>
            <label for="pEmail" class="block text-xs font-semibold text-slate-700 mb-1">Correo electrónico</label>
            <input type="text" id="pEmail" :value="datos?.email" disabled class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed">
          </div>

          <div>
            <label for="pAsoc" class="block text-xs font-semibold text-slate-700 mb-1">Asociación o Colegio Arbitral</label>
            <input type="text" id="pAsoc" x-model="asociacion" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20">
          </div>

          <div>
            <label for="pTel" class="block text-xs font-semibold text-slate-700 mb-1">Teléfono de contacto</label>
            <input type="text" id="pTel" x-model="telefono" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20">
          </div>

          <div class="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              :disabled="guardando"
              x-text="guardando ? 'Guardando…' : 'Guardar Cambios'"
              class="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition disabled:opacity-60"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </section>
    </div>
  </main>

  <footer x-data class="bg-slate-800 py-4 text-center text-sm text-slate-300">
    <p>Sistema de Acta Digital Arbitral · <span x-text="new Date().getFullYear()"></span></p>
  </footer>

  <div class="toast-contenedor" x-data="notificaciones" @notificar.window="agregar($event.detail)" aria-live="polite">
    <template x-for="toast in lista" :key="toast.id">
      <div
        class="toast"
        :class="'toast--' + toast.tipo"
        x-show="toast.visible"
        x-transition:leave="toast-salida"
        x-transition:leave-end="toast-salida-fin"
        role="status"
      >
        <span x-text="toast.mensaje"></span>
        <button type="button" class="toast-cerrar" @click="cerrar(toast.id)" aria-label="Cerrar">&times;</button>
      </div>
    </template>
  </div>

</body>
</html>
```

Y esto va al **final de `comun/api.js`**, después de `iniciarSesion` y antes del `// [IA] fin`, si quieres que quede dentro de ese bloque. Si lo escribes tú, ponle tu propia marca.

```js
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
```

Para probar: `npm run dev`, entra al Perfil y comprueba que "Nombre de usuario" ya no muestra el email. Cambia el teléfono y guarda. Prueba también `perfil.html?fallar` para ver el error con Reintentar.

### Prompt 9

```text
dame el md de estee chat del registro de ia
```

### Respuesta 9

*Claude ejecutó en la terminal (leer el formato de los registros anteriores):*

```bash
cat ia/README.md; ls ia; sed -n 1,60p ia/2026-11-09_waterloozz_forzar-error.md
```

Creé el registro en `ia/2026-11-11_waterloozz_perfil-api.md`, con el formato de los otros registros y la conversación completa. No hice commit.

- **Mensajes:** la imagen de Carlos quedó transcrita como texto en el Prompt 1. Los comandos que ejecuté aparecen como "Claude ejecutó en la terminal".
- **Archivos afectados:** el registro dice que la IA solo dio el código y que tú lo implementaste. Si luego cambias algo a mano, ajusta ese punto.
- **Revisión:** el registro incluye mis respuestas sin editar, pero con los títulos bajados de nivel, como en los demás. Revisa el texto antes de subirlo.
- **Pendiente:** agrega esta fila a `ia/README.md`, justo debajo de la última:

```
| 2026-11-11 | @waterloozz | Claude Code | Perfil con obtenerPerfil() y actualizarPerfil() en la capa de datos | [ver](2026-11-11_waterloozz_perfil-api.md) |
```

- **Marcas:** cuando pegues el código, envuélvelo así:
  - en `comun/api.js`: `// [IA] inicio · ia/2026-11-11_waterloozz_perfil-api.md` … `// [IA] fin`
  - en `usuario/perfil.html`: `<!-- [IA] inicio · ia/2026-11-11_waterloozz_perfil-api.md -->` … `<!-- [IA] fin -->`

## Qué se incorporó al proyecto

- Dos funciones nuevas al final de `comun/api.js`: `obtenerPerfil(email)` y `actualizarPerfil(email, { asociacion, telefono })`. Devuelven `{ ok, status, datos, data }` como el resto de la capa de datos, quitan la sal y el hash con `sinClave()` y convierten los errores en `{ ok: false, status }`.
- `obtenerPerfil` busca al usuario por email (sin distinguir mayúsculas) con `leerUsuarios()` y completa `asociacion` y `telefono` con valores por defecto si no existen.
- `actualizarPerfil` simula latencia y fallo (`esperar(LATENCIA)` y `simularFallo()`), valida el teléfono con una expresión regular y guarda con `guardarUsuarios()`, así los cambios sobreviven al recargar.
- `usuario/perfil.html` ahora carga `comun/api.js` y usa un componente Alpine `perfil` (registrado con `Alpine.data` antes de la línea de Alpine) con los estados `cargando`, `error` (con botón Reintentar) y `listo`, y un botón de guardar que se deshabilita mientras guarda.
- El bug quedó resuelto en la pantalla: la tarjeta muestra `datos.nombre`, "Nombre de usuario" muestra `datos.usuario` (o el email si viene vacío) y se agregó un campo de correo de solo lectura.
- Marcas `[IA]` con este registro en `comun/api.js` y `usuario/perfil.html`, y una fila en `ia/README.md`.

## Verificación

- Lo que revisó la IA: que `localStorage.usuario` guarda el email (`login/login.js` y `login/registro.js`), que `perfil.html` no cargaba `api.js`, que `leerUsuarios()`, `guardarUsuarios()`, `sinClave()`, `esperar()` y `simularFallo()` existen en `api.js`, y que el toast de tipo `error` existe en `comun/componentes.js` y `comun/componentes.css`.
- Esta conversación no ejecutó pruebas: la IA solo dio el código y yo lo implementé. Lo que me falta comprobar en el navegador con `npm run dev`:
  - Que "Nombre de usuario" ya no muestra el email, con el admin y con un árbitro creado desde "Crear cuenta".
  - Que al cambiar asociación y teléfono, guardar y recargar, los datos siguen ahí.
  - Que un teléfono inválido muestra el toast de error y no guarda.
  - Que `perfil.html?fallar` muestra el error con el botón Reintentar, y que este vuelve a cargar los datos.
  - Que sin sesión el Perfil sigue redirigiendo al login y no pide datos.

## Conclusión: lo que aprendí

Aprendí que el bug del Perfil venía de que la pantalla leía directo de `localStorage` un valor que el login había cambiado a email, en lugar de pedir los datos a la capa de datos. Al usar `obtenerPerfil()` y `actualizarPerfil()`, el Perfil deja de depender de cómo guarda la sesión el login y sigue el mismo patrón que el resto de las vistas: una función en `api.js` que devuelve `{ ok, status, datos }` y una vista con estados de cargando, error y listo. También entendí por qué el componente Alpine se registra con `Alpine.data` en el evento `alpine:init` y por qué su script va antes de la línea de Alpine, y que `sinClave()` evita que la sal y el hash lleguen a la pantalla.
