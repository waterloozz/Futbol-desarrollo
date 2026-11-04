# Componentes globales de Alpine.js: toasts y modal

- **Fecha:** 2026-10-30
- **Integrante:** Carlos Benavides (@CBenavidesP)
- **Herramienta y modelo:** Claude Code (Claude Opus 5.5)
- **Enlace a la conversación:** no aplica (Claude Code no permite compartir la conversación; el texto completo va abajo)
- **Archivos afectados:** componentes.js (archivo completo, líneas 1-101); index.html (scripts del <head>, líneas 8-16, y contenedores de toasts y modal, líneas 120-160); style.css (sección "Alpine.js: componentes globales", líneas 173-295)

## Objetivo

Para la Entrega 2 había que incorporar Alpine.js. Antes de hacer los formularios necesitaba la base: cargar Alpine por CDN sin problemas con defer y tener componentes que todo el equipo pudiera reutilizar, un sistema de notificaciones (toasts) que se cierran solas y un modal de confirmación. Consulté a la IA porque no tenía claro en qué orden cargar los scripts ni cómo compartir estos componentes entre distintas partes de la página.

## Conversación (texto completo, sin editar)

### Prompt 1

```text
Hola. Para la entrega 2 de mi proyecto de página web de árbitros nos piden incorporar Alpine.js. Quiero partir por la base de la arquitectura antes de meterme a los formularios.
Necesito que me ayudes con lo siguiente:
1. Cómo importar Alpine.js por CDN en mi index.html para que no tenga problemas de carga con defer.
2. Crear un archivo JS donde registre con Alpine.data() el estado global reutilizable que necesitará el equipo:
   - Un sistema de notificaciones flotantes (toasts) para mensajes de éxito o error que se cierren automáticamente con un temporizador.
   - Un modal de confirmación con fondo oscuro que se abra y cierre usando x-show.
3. El HTML y CSS básico para que los toasts se ubiquen en una esquina de la pantalla y el modal aparezca centrado.
Por favor entrégame el código modular y bien explicado para entender cómo funciona la reactividad de Alpine en esta primera parte.
```

### Respuesta 1

*Claude ejecutó en la terminal (Read existing project HTML, JS and CSS files):*

```bash
cd "/c/Users/carlo/Documents/Futbol-desarrollo" && cat index.html; echo ----; cat login.js; echo ----; cat style.css; echo ----; cat src/main.js; echo ----; head -c 600 src/style.css; git status --short
```

*Claude creó o reemplazó el archivo `C:\Users\carlo\Documents\Futbol-desarrollo\componentes.js` con este contenido:*

```js
/*
 * Componentes globales de Alpine.js
 * ---------------------------------
 * Este archivo se carga ANTES que Alpine (ver index.html). Por eso no usamos
 * Alpine directamente aquí arriba: esperamos el evento "alpine:init", que
 * Alpine dispara justo antes de recorrer el HTML buscando x-data.
 *
 * Cada componente vive una sola vez en index.html y escucha eventos en
 * "window". Así cualquier parte de la página (otro componente Alpine o JS
 * normal como login.js) puede usarlos sin conocer su estado interno.
 */

/* =========================================================
 * Funciones de ayuda para el equipo
 * Se pueden llamar desde JS normal. Dentro de Alpine también
 * sirve $dispatch('notificar', {...}).
 * ========================================================= */

// notificar("Partido guardado")  /  notificar("Falta el equipo local", "error")
function notificar(mensaje, tipo = "exito", duracion = 3000) {
  window.dispatchEvent(
    new CustomEvent("notificar", { detail: { mensaje, tipo, duracion } })
  );
}

// pedirConfirmacion({ titulo, mensaje, textoConfirmar, alConfirmar: () => {...} })
function pedirConfirmacion(opciones) {
  window.dispatchEvent(
    new CustomEvent("pedir-confirmacion", { detail: opciones })
  );
}

document.addEventListener("alpine:init", () => {
  /* =========================================================
   * Notificaciones flotantes (toasts)
   * ========================================================= */
  Alpine.data("notificaciones", () => ({
    // Todo lo que está en este objeto es reactivo: si cambia "lista",
    // Alpine vuelve a dibujar el <template x-for> automáticamente.
    lista: [],
    siguienteId: 1,

    agregar({ mensaje = "", tipo = "exito", duracion = 3000 } = {}) {
      const id = this.siguienteId++;
      this.lista.push({ id, mensaje, tipo, visible: true });

      // Temporizador: pasado el tiempo se cierra solo
      setTimeout(() => this.cerrar(id), duracion);
    },

    cerrar(id) {
      const toast = this.lista.find((t) => t.id === id);
      if (!toast || !toast.visible) return; // ya se cerró a mano

      // 1) visible = false -> x-show ejecuta la transición de salida
      toast.visible = false;
      // 2) cuando termina la animación lo sacamos del arreglo
      setTimeout(() => {
        this.lista = this.lista.filter((t) => t.id !== id);
      }, 300);
    },
  }));

  /* =========================================================
   * Modal de confirmación
   * ========================================================= */
  Alpine.data("modalConfirmacion", () => ({
    abierto: false, // x-show="abierto" muestra u oculta el modal
    titulo: "",
    mensaje: "",
    textoConfirmar: "Confirmar",
    alConfirmar: null, // función que se ejecuta si el usuario acepta

    abrir({
      titulo = "¿Estás seguro?",
      mensaje = "",
      textoConfirmar = "Confirmar",
      alConfirmar = null,
    } = {}) {
      this.titulo = titulo;
      this.mensaje = mensaje;
      this.textoConfirmar = textoConfirmar;
      this.alConfirmar = alConfirmar;
      this.abierto = true;

      // $nextTick espera a que Alpine actualice el DOM (el modal ya visible)
      this.$nextTick(() => this.$refs.botonCancelar.focus());
    },

    cerrar() {
      this.abierto = false;
      this.alConfirmar = null;
    },

    confirmar() {
      const accion = this.alConfirmar;
      this.cerrar();
      if (typeof accion === "function") accion();
    },
  }));
});
```

*Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\index.html`. Texto que reemplazó:*

```html
  <link rel="stylesheet" href="style.css">
</head>
```

*Texto nuevo:*

```html
  <link rel="stylesheet" href="style.css">

  <!--
    Orden importante: los dos scripts usan "defer", así que se ejecutan en
    este mismo orden cuando el HTML terminó de cargarse.
    1) componentes.js registra los Alpine.data() en "alpine:init".
    2) Alpine arranca, dispara "alpine:init" y luego procesa los x-data.
  -->
  <script src="componentes.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js" defer></script>
</head>
```

*Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\index.html`. Texto que reemplazó:*

```html
  </main>

  <script src="login.js"></script>
```

*Texto nuevo:*

```html
  </main>

  <!-- ===== Notificaciones flotantes (una sola vez en la página) ===== -->
  <div
    class="toast-contenedor"
    x-data="notificaciones"
    @notificar.window="agregar($event.detail)"
    aria-live="polite"
  >
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

  <!-- ===== Modal de confirmación (una sola vez en la página) ===== -->
  <div
    x-data="modalConfirmacion"
    @pedir-confirmacion.window="abrir($event.detail)"
    @keydown.escape.window="abierto && cerrar()"
  >
    <div class="modal-fondo" x-show="abierto" x-cloak x-transition.opacity @click.self="cerrar()">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <h3 id="modal-titulo" x-text="titulo"></h3>
        <p x-text="mensaje"></p>
        <div class="modal-acciones">
          <button type="button" class="boton-secundario" x-ref="botonCancelar" @click="cerrar()">Cancelar</button>
          <button type="button" @click="confirmar()" x-text="textoConfirmar"></button>
        </div>
      </div>
    </div>
  </div>

  <script src="login.js"></script>
```

*Claude ejecutó en la terminal (Append Alpine component styles and syntax-check the JS):*

```bash
cd "/c/Users/carlo/Documents/Futbol-desarrollo" && cat >> style.css <<'EOF'

/* =========================================================
   Alpine.js: componentes globales
   ========================================================= */

/* Oculta elementos con x-cloak hasta que Alpine termine de cargar
   (evita que el modal "parpadee" visible al abrir la página) */
[x-cloak] {
  display: none !important;
}

/* ---------- Toasts: esquina inferior derecha ---------- */
.toast-contenedor {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(360px, calc(100vw - 32px));
  margin: 0;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0;
  padding: 12px 14px;
  border-radius: 6px;
  border-left: 5px solid;
  background-color: #ffffff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  animation: toast-entrada 0.25s ease-out;
}

.toast--exito {
  border-left-color: #15803d;
}

.toast--error {
  border-left-color: #b91c1c;
}

.toast-cerrar {
  background: none;
  color: #6b7280;
  padding: 0 4px;
  font-size: 20px;
  line-height: 1;
}

.toast-cerrar:hover {
  background: none;
  color: #111827;
}

@keyframes toast-entrada {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}

/* Clases que Alpine aplica al cerrar (x-transition:leave) */
.toast-salida {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-salida-fin {
  opacity: 0;
  transform: translateX(20px);
}

/* ---------- Modal: centrado con fondo oscuro ---------- */
.modal-fondo {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  margin: 0;
  background-color: rgba(17, 24, 39, 0.6);
}

.modal {
  width: 100%;
  max-width: 420px;
  margin: 0;
  padding: 22px;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.modal h3 {
  margin-top: 0;
}

.modal p {
  margin-bottom: 18px;
  font-size: 14px;
  color: #4b5563;
}

.modal-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin: 0;
}

.boton-secundario {
  background-color: #e5e7eb;
  color: #111827;
}

.boton-secundario:hover {
  background-color: #d1d5db;
}
EOF
node --check componentes.js && echo OK
```

Quedó lista la base de Alpine.js con los toasts y el modal de confirmación. Toqué tres archivos y no modifiqué el login. Revisé que `componentes.js` no tenga errores de sintaxis, pero **todavía no lo probé en el navegador**. Para probarlo, corre `npm run dev` y ejecuta los ejemplos de abajo en la consola.

##### 1. Carga por CDN (`index.html`, dentro de `<head>`)

```html
<script src="componentes.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js" defer></script>
```

**Por qué en este orden:** los scripts con `defer` se ejecutan en el mismo orden en que aparecen, cuando el HTML ya terminó de cargar.
1. `componentes.js` se ejecuta primero. Solo deja un "escuchador" para el evento `alpine:init`.
2. Después arranca Alpine. Dispara `alpine:init`, y ahí se registran tus `Alpine.data()`.
3. Recién entonces Alpine recorre el HTML buscando `x-data`.

Si invirtieras el orden, Alpine encontraría `x-data="notificaciones"` sin que ese componente exista todavía, y daría error.

##### 2. `componentes.js`: estado reutilizable

**Toasts (`Alpine.data("notificaciones")`):**
- Guarda un arreglo `lista` de mensajes.
- `agregar()` hace `push` de un mensaje y activa un `setTimeout` que lo cierra solo.
- `cerrar()` hace dos pasos:
  - pone `visible = false`, lo que hace que `x-show` corra la animación de salida;
  - a los 300 ms saca el mensaje del arreglo.

**Modal (`Alpine.data("modalConfirmacion")`):**
- `abierto` controla el `x-show`.
- `abrir()` recibe el título, el mensaje y una función `alConfirmar`.
- `confirmar()` cierra el modal y ejecuta esa función.
- También se cierra con Escape, con el botón Cancelar o haciendo clic en el fondo oscuro (`@click.self`).

**Cómo funciona la reactividad:** todo lo que devuelve la función de `Alpine.data()` queda "vigilado" por Alpine. Cuando cambias `this.abierto = true` o haces `this.lista.push(...)`, no tienes que tocar el DOM: Alpine actualiza solo los elementos que dependen de ese dato. Pasa con `x-show`, `x-text`, `x-for` y `:class`.

**Un detalle importante:** `Alpine.data()` crea una **copia nueva del estado por cada `x-data`**. Por eso cada componente está **una sola vez** en la página, y el resto del equipo se comunica con ellos mediante eventos en `window` (`@notificar.window`, `@pedir-confirmacion.window`). Así cualquier formulario puede usarlos sin compartir variables. Si más adelante necesitan un estado realmente compartido (por ejemplo, el usuario conectado), la herramienta para eso es `Alpine.store()`.

##### 3. HTML y CSS
- El HTML de los dos componentes está al final del `<body>`, antes de `login.js`.
- Al final de `style.css` agregué:
  - los toasts, fijos en la esquina inferior derecha y apilados;
  - el modal, centrado con flexbox sobre un fondo `rgba(...)` oscuro;
  - `[x-cloak]`, que evita que el modal aparezca un instante al cargar la página.
- Tu CSS tiene una regla global `div { margin-bottom: 12px }`. Por eso estos componentes llevan `margin: 0`, para que esa regla no los descuadre.

##### Cómo lo usa el equipo

Desde JS normal (por ejemplo `login.js`):
```js
notificar("Bienvenido");
notificar("Contraseña incorrecta", "error", 5000);

pedirConfirmacion({
  titulo: "Eliminar suceso",
  mensaje: "¿Seguro que quieres borrar la tarjeta amarilla del minuto 34'?",
  textoConfirmar: "Eliminar",
  alConfirmar: () => notificar("Suceso eliminado"),
});
```

Desde un componente Alpine:
```html
<button @click="$dispatch('notificar', { mensaje: 'Partido registrado', tipo: 'exito' })">Guardar</button>
```

Un buen primer paso para los formularios sería cambiar las líneas `mensaje.textContent = ...` de `login.js` por llamadas a `notificar(...)`.

### Prompt 2

```text
Realizaste todos los cambios en el visual studio code o donde realizaste los cambios?
```

### Respuesta 2

No los hice dentro de Visual Studio Code. Escribí los archivos **directamente en tu disco**, en la carpeta del proyecto:

`C:\Users\carlo\Documents\Futbol-desarrollo`

Los cambios fueron estos:
- **`componentes.js`**: archivo nuevo, en la raíz del proyecto.
- **`index.html`**: agregué los scripts en el `<head>` y el HTML de los toasts y del modal al final del `<body>`.
- **`style.css`**: agregué los estilos al final del archivo.

Si abres esa carpeta en VS Code (Archivo → Abrir carpeta), vas a ver los cambios. Si ya la tenías abierta, VS Code los muestra solo. Además, en la pestaña de **Control de código fuente** (el ícono de Git) aparecen los tres archivos como modificados o nuevos, y puedes ver exactamente qué se agregó.

No hice ningún commit. Los cambios están en tu copia local para que los revises primero, y tú decides cuándo subirlos al repositorio del equipo.

## Qué se incorporó al proyecto

- componentes.js completo, con los componentes `notificaciones` y `modalConfirmacion` y las funciones `notificar()` y `pedirConfirmacion()` para que el resto del equipo los use.
- Los scripts en el `<head>` de index.html con `defer`, cargando componentes.js antes que Alpine.
- El HTML de los toasts y del modal al final del `<body>` de index.html.
- Los estilos de los toasts, el modal y `[x-cloak]` al final de style.css.
- No se descartó nada de esta respuesta. Más adelante (registro del 2026-11-02 sobre usuarios.html) los estilos de toasts y modal se pasaron a registro-arbitros.css para no chocar con Tailwind.

## Verificación

- Abrí la página con Live Server y llamé `notificar("Prueba")` y `notificar("Error", "error")` desde la consola: el toast aparece abajo a la derecha y se cierra solo a los 3 segundos o con la X.
- Probé `pedirConfirmacion({...})`: el modal se abre con fondo oscuro y se cierra con Cancelar, con Escape y al hacer clic fuera.
- Entiendo que los componentes se registran en el evento `alpine:init` y que por eso componentes.js tiene que cargarse antes que Alpine, y que se comunican con eventos en `window` para que cualquier script los pueda usar.

## Conclusión: lo que aprendí

Aprendí que el orden de los scripts importa mucho cuando se usa `defer`: se ejecutan en el mismo orden en que aparecen, así que si Alpine parte antes que mis componentes, no los encuentra. También entendí cómo funciona la reactividad de Alpine: cuando cambio el arreglo de toasts, el `x-for` vuelve a dibujar la lista solo, sin que yo toque el HTML. Me sirvió ver cómo usar eventos (`dispatchEvent`) para que un componente lo pueda usar cualquier parte de la página sin conocer su código por dentro.
