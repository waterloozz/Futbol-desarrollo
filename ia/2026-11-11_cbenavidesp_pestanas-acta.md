# Pestañas en el modal del acta (tercer componente)

- **Fecha:** 2026-11-11
- **Integrante:** Carlos Benavides (@CBenavidesP)
- **Herramienta y modelo:** Claude Code (Claude Opus 5.5)
- **Enlace a la conversación:** no aplica (Claude Code no permite compartir la conversación; el texto completo va abajo)
- **Archivos afectados:** usuario/partidos.html (x-data de las pestañas en la tarjeta del modal del acta; barra role="tablist" con los tres botones; los tres paneles role="tabpanel" de Resumen, Acontecimientos y Observaciones; overflow-x-auto en la tabla de acontecimientos). El archivo es de Josefa; se cambió mientras ella no estaba trabajando en el proyecto.

## Objetivo

La revisión preliminar de la Entrega 2 indicó que solo había dos tipos de componente de interfaz (modales y toasts) y que el criterio A4 pide al menos tres. Los componentes son parte de mi tarea, así que agregué pestañas al modal del acta de partidos, que además mostraba todo junto en un modal muy largo. Elegí las pestañas en vez de la paginación para no meter código dentro de comun/partidos.js, que está completo dentro de la marca [IA] de Josefa.

## Conversación (texto completo, sin editar)

El Prompt 2 se envió dos veces: el primer envío se interrumpió mientras la herramienta leía el archivo, sin cambios en el código, así que aquí va el segundo, que es el que tuvo respuesta completa.

### Prompt 1

```text
Explicame el punto 2 y este es algo mas complejo que el anterior?
```

### Respuesta 1

Sí, es más complejo que el anterior. El modal fue solo cambiar valores en tu CSS. Esto es **agregar un componente nuevo que funciona con Alpine**: tiene estado, botones que cambian lo que se muestra y accesibilidad con teclado. Igual es más chico que lo del login o lo de los árbitros.

##### Qué pide la revisión
El criterio A4 pide **al menos 3 tipos de componente**. Hoy tienen 2: modales y toasts. El menú hamburguesa no cuenta, porque es requisito de navegación. Con uno más se suman **+2 puntos**. La revisión propone dos opciones.

##### Opción A: pestañas en el modal del acta (recomendada)
Hoy el acta muestra todo junto, una cosa debajo de otra: el resumen del partido (marcador, fecha, estadio), la tabla de acontecimientos con el formulario para agregar, y las observaciones. Con pestañas quedaría así:
```
[ Resumen ]  [ Acontecimientos ]  [ Observaciones ]
 ─────────
  (solo se ve la sección de la pestaña elegida)
```
**Cómo se haría:**
- **Solo se toca `usuario/partidos.html`.** El estado de la pestaña elegida se guarda en un `x-data` pequeño dentro del mismo modal (`pestana: 'resumen'`), así que `comun/partidos.js` no se toca.
- **Tres botones** que cambian la pestaña, y cada sección con `x-show="pestana === '...'"`.
- **Al abrir el acta de otro partido, vuelve a "Resumen".**
- **Accesibilidad:**
  - `role="tablist"`, `role="tab"` y `role="tabpanel"`, con `aria-selected` en la pestaña activa.
  - Las flechas izquierda y derecha cambian de pestaña. La revisión pide verificar que funcione con teclado.
- **No cambia nada de lo que hace el acta:** agregar y quitar acontecimientos funciona igual, solo que dentro de su pestaña.

**Complejidad:** media. Son unas 30 a 40 líneas en un solo archivo.

##### Opción B: paginación en la tabla de partidos
5 partidos por página, con botones "Anterior", "1 2 3" y "Siguiente".

**Cómo se haría:**
- **Se tocan dos archivos de Josefa:** `comun/partidos.js` (los datos `pagina` y `porPagina`, una lista nueva `partidosPagina` y el total de páginas) y `usuario/partidos.html` (la tabla usa la lista nueva, y van los botones).
- **Hay que cubrir casos borde:**
  - Volver a la página 1 cuando cambian la búsqueda, el filtro o el orden.
  - Si borras el último partido de la última página, retroceder una página.
  - Deshabilitar "Anterior" en la primera página y "Siguiente" en la última.
- **`comun/partidos.js` está completo dentro de la marca `[IA]` de Josefa (Gemini).** Tus líneas nuevas quedarían dentro de su bloque, con una marca tuya adentro, y eso es más enredado de documentar.

**Complejidad:** media-alta. Toca dos archivos, tiene más casos que probar y mezcla tu código con el de ella.

##### Mi recomendación
**La opción A (pestañas).** Toca un solo archivo, no se mezcla con el código marcado de Josefa, es más fácil de explicar en una interrogación, y además ordena el acta, que hoy es un modal muy largo.

Si te parece, te muestro el código exacto antes de tocar nada, como hicimos con el login.

### Prompt 2

```text
vamos con la A, las pestañas en el acta

me tinca mas porque queda todo en usuario/partidos.html y no me meto en partidos.js, que esta completo dentro de la marca [IA] de josefa. con la paginacion mi codigo quedaria adentro de su bloque y ademas tiene mas casos borde

el x-data chico dentro del modal con pestaña me parece bien, cuidando no pisar ningun nombre de gestorPartidos. y que vuelva a "Resumen" al abrir otro partido, dime si conviene x-effect o $watch sobre partidoSeleccionado

en accesibilidad: tablist, tab con aria-selected y tabpanel, las flechas para cambiar de pestaña y solo la activa con tabindex="0", asi con Tab entras una sola vez al grupo

los paneles con x-show y no x-if, para que no se borre lo que estaba escribiendo en el formulario de acontecimientos al cambiar de pestaña

que se vea igual que el resto de partidos y que a 375px no haya scroll horizontal

antes de tocar el archivo dime en que lineas va cada cosa
```

### Respuesta 2

Ya tengo el modal del acta leído (líneas 402-587 de `usuario/partidos.html`). Revisé que en `comun/partidos.js` no exista nada llamado `pestana` ni `tab`, así que los nombres que propongo no chocan con `gestorPartidos`. No toqué nada.

##### ¿`x-effect` o `$watch` sobre `partidoSeleccionado`?
**Ninguno de los dos. Recomiendo `$watch` sobre `modalDetalle`.**
- **`$watch('partidoSeleccionado', …)` tiene un problema:** en Alpine, `$watch` revisa el objeto **completo, por dentro**. Cuando apretas "Agregar al Acta", `agregarAcontecimiento()` cambia `partidoSeleccionado.acontecimientos` y los goles, el `$watch` lo detecta y **te devolvería a "Resumen" cada vez que agregas algo**.
- **`x-effect="partidoSeleccionado; …"`** solo reacciona cuando cambia el objeto entero (cuando `abrirDetalle` asigna uno nuevo), así que funcionaría. Pero depende de un detalle de Alpine que no es obvio al leer el código.
- **`$watch('modalDetalle', abierto => { if (abierto) pestanaActa = 'resumen' })`** es lo más claro: `modalDetalle` es un `true`/`false` que solo cambia al abrir y cerrar el acta. "Cuando se abre, vuelve a Resumen" se entiende sin conocer esos detalles.

Lo voy a comprobar en la prueba: agrego un acontecimiento estando en la pestaña "Acontecimientos" y reviso que no salte a "Resumen".

##### Dónde va cada cosa (todo en `usuario/partidos.html`)

**1. Línea 422, la tarjeta del modal:** se le agrega el `x-data` chico.
```html
x-data="{
  pestanaActa: 'resumen',
  pestanasActa: ['resumen', 'acontecimientos', 'observaciones'],
  moverPestanaActa(paso) {
    const i = this.pestanasActa.indexOf(this.pestanaActa);
    this.pestanaActa = this.pestanasActa[(i + paso + this.pestanasActa.length) % this.pestanasActa.length];
    this.$nextTick(() => this.$refs['tabActa-' + this.pestanaActa].focus());
  }
}"
x-init="$watch('modalDetalle', abierto => { if (abierto) pestanaActa = 'resumen' })"
```
- Todos los nombres terminan en `Acta`, para no pisar nada de `gestorPartidos`.
- `moverPestanaActa` usa `%`, así que pasa de la última pestaña a la primera y al revés. Después pone el foco en la pestaña nueva.

**2. Después de la línea 443 (fin del encabezado):** va la barra de pestañas.
```html
<div role="tablist" aria-label="Secciones del acta" class="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200">
  <button type="button" role="tab" id="tab-acta-resumen" x-ref="tabActa-resumen"
    aria-controls="panel-acta-resumen"
    :aria-selected="pestanaActa === 'resumen' ? 'true' : 'false'"
    :tabindex="pestanaActa === 'resumen' ? 0 : -1"
    @click="pestanaActa = 'resumen'"
    @keydown.arrow-right.prevent="moverPestanaActa(1)" @keydown.arrow-left.prevent="moverPestanaActa(-1)"
    @keydown.home.prevent="pestanaActa = 'resumen'; $nextTick(() => $refs['tabActa-resumen'].focus())"
    @keydown.end.prevent="pestanaActa = 'observaciones'; $nextTick(() => $refs['tabActa-observaciones'].focus())"
    class="-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    :class="pestanaActa === 'resumen' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'">Resumen</button>
  … (igual para "Acontecimientos" y "Observaciones")
</div>
```
- **Solo la pestaña activa tiene `tabindex="0"`.** Con Tab entras una sola vez al grupo, y con las flechas te mueves dentro de él. También agregué Inicio y Fin (ir a la primera y a la última), que es lo que se espera en unas pestañas accesibles.
- **El estilo es como el resto de Partidos:** texto `slate-600`, la pestaña activa en azul `blue-700` con una línea abajo, y el foco visible.
- **`overflow-x-auto` en la barra:** si a 375 px no cupieran las tres pestañas, se desplazan dentro de la barra y la página no se mueve hacia el lado. Con estos tres nombres sí deberían caber.

**3. Línea 445, el resumen (marcador, estado, fecha y estadio):** se envuelve en
```html
<div role="tabpanel" id="panel-acta-resumen" aria-labelledby="tab-acta-resumen" x-show="pestanaActa === 'resumen'">
```
El contenido no cambia.

**4. Línea 464, los acontecimientos (la tabla y el formulario, líneas 464-568):** al `div` se le agregan `role="tabpanel"`, `id="panel-acta-acontecimientos"`, `aria-labelledby` y `x-show="pestanaActa === 'acontecimientos'"`. Su margen pasa de `mt-6` a `mt-4`, para quedar igual que los otros paneles. **Es `x-show` y no `x-if`, como pediste:** lo que estabas escribiendo en el formulario se mantiene al cambiar de pestaña.

**5. Línea 467, la tabla de acontecimientos:** cambiar `overflow-hidden` por `overflow-x-auto`. La revisión lo marca en C2, porque a 375 px la tabla de 5 columnas se puede cortar. Con esto se puede desplazar dentro del acta, sin mover la página. Es una sola palabra, en una línea de Josefa.

**6. Líneas 571-574, las observaciones:** al `div` se le agregan `role="tabpanel"`, su `id`, `aria-labelledby` y `x-show`. Se cambia `mt-4 pt-3 border-t` por `mt-4`, porque ya no hace falta la línea que lo separaba de la tabla.

**7. Líneas 576-584, el botón "Cerrar Acta":** queda igual y fuera de las pestañas, así que se ve siempre.

##### Lo que no se toca
- `comun/partidos.js`.
- Las funciones del acta (`agregarAcontecimiento`, `eliminarAcontecimiento`, `abrirDetalle` y `cerrarDetalle`).
- El resto de la página.

##### Qué probaría
- **Las pestañas:** se cambian con clic y con las flechas (y vuelven a la primera desde la última), y también con Inicio y Fin.
- **Accesibilidad:**
  - Con Tab se entra una sola vez al grupo.
  - `aria-selected` y `tabindex` cambian con la pestaña activa.
  - Cada panel queda asociado a su pestaña.
- **Lo que escribiste no se pierde:** escribes en el formulario, cambias de pestaña, vuelves, y lo escrito sigue ahí.
- **Agregar un acontecimiento** estando en "Acontecimientos" **no te devuelve a "Resumen".**
- **Al cerrar y abrir el acta de otro partido**, empieza en "Resumen".
- **A 375 px**, con el acta abierta en cada pestaña, no hay scroll horizontal.
- **Las 142 pruebas anteriores**, en Vite y en el servidor igual al de AWS.

¿Le doy?

### Prompt 3

```text
si
```

### Respuesta 3

*Claude ejecutó en la terminal (Check repo state and line endings of partidos.html):*

```bash
git fetch origin 2>&1|tail -1; git status -sb | head -3; file usuario/partidos.html
```

*Claude creó o reemplazó el archivo `C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\pestanas.py` con este contenido:*

```
import pathlib

p = pathlib.Path(r"C:\Users\carlo\Documents\Futbol-desarrollo\usuario\partidos.html")
raw = p.read_bytes().decode("utf-8")
nl = "\r\n" if "\r\n" in raw else "\n"
t = raw.replace("\r\n", "\n")


def cambiar(viejo, nuevo):
    global t
    assert t.count(viejo) == 1, viejo[:80]
    t = t.replace(viejo, nuevo)


cambiar(
    """          class="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl border border-slate-200"
        >
""",
    """          class="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl border border-slate-200"
          x-data="{
            pestanaActa: 'resumen',
            pestanasActa: ['resumen', 'acontecimientos', 'observaciones'],
            irAPestanaActa(nombre) {
              this.pestanaActa = nombre;
              this.$nextTick(() => this.$refs['tabActa-' + nombre].focus());
            },
            moverPestanaActa(paso) {
              const total = this.pestanasActa.length;
              const i = this.pestanasActa.indexOf(this.pestanaActa);
              this.irAPestanaActa(this.pestanasActa[(i + paso + total) % total]);
            }
          }"
          x-init="$watch('modalDetalle', abierto => { if (abierto) pestanaActa = 'resumen' })"
        >
""",
)

pestanas = [("resumen", "Resumen"), ("acontecimientos", "Acontecimientos"), ("observaciones", "Observaciones")]
botones = ""
for clave, texto in pestanas:
    botones += f"""            <button
              type="button"
              role="tab"
              id="tab-acta-{clave}"
              x-ref="tabActa-{clave}"
              aria-controls="panel-acta-{clave}"
              :aria-selected="pestanaActa === '{clave}' ? 'true' : 'false'"
              :tabindex="pestanaActa === '{clave}' ? 0 : -1"
              @click="pestanaActa = '{clave}'"
              @keydown.arrow-right.prevent="moverPestanaActa(1)"
              @keydown.arrow-left.prevent="moverPestanaActa(-1)"
              @keydown.home.prevent="irAPestanaActa('resumen')"
              @keydown.end.prevent="irAPestanaActa('observaciones')"
              class="-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              :class="pestanaActa === '{clave}' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'"
            >{texto}</button>
"""

cambiar(
    """          </div>

          <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-slate-50 p-4 text-xs border border-slate-200">
""",
    """          </div>

          <div role="tablist" aria-label="Secciones del acta" class="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200">
""" + botones + """          </div>

          <div role="tabpanel" id="panel-acta-resumen" aria-labelledby="tab-acta-resumen" x-show="pestanaActa === 'resumen'">
          <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-slate-50 p-4 text-xs border border-slate-200">
""",
)

cambiar(
    """          </div>

          <div class="mt-6 space-y-3">
            <h4 class="text-sm font-bold text-slate-900">Acontecimientos Registrados</h4>
""",
    """          </div>
          </div>

          <div role="tabpanel" id="panel-acta-acontecimientos" aria-labelledby="tab-acta-acontecimientos" x-show="pestanaActa === 'acontecimientos'" class="mt-4 space-y-3">
            <h4 class="text-sm font-bold text-slate-900">Acontecimientos Registrados</h4>
""",
)

cambiar(
    """            <div class="overflow-hidden rounded-lg border border-slate-200">
              <table class="w-full text-left text-xs text-slate-700">""",
    """            <div class="overflow-x-auto rounded-lg border border-slate-200">
              <table class="w-full text-left text-xs text-slate-700">""",
)

cambiar(
    """          <div class="mt-4 pt-3 border-t border-slate-200">
            <h4 class="text-xs font-bold text-slate-700">Observaciones del Árbitro:</h4>""",
    """          <div role="tabpanel" id="panel-acta-observaciones" aria-labelledby="tab-acta-observaciones" x-show="pestanaActa === 'observaciones'" class="mt-4">
            <h4 class="text-xs font-bold text-slate-700">Observaciones del Árbitro:</h4>""",
)

p.write_bytes(t.replace("\n", nl).encode("utf-8"))
print("ok")
```

*Claude ejecutó en la terminal (Apply the tabs to the acta modal and locate the new parts):*

```bash
python /c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/pestanas.py && git diff --stat | cat && grep -n 'role="tablist"\|role="tabpanel"\|x-data="{$\|x-init="\$watch\|overflow-x-auto rounded-lg' usuario/partidos.html && file usuario/partidos.html
```

Apliqué las pestañas. Ahora las pruebo con todo lo que pediste.

*Claude creó o reemplazó el archivo `C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\navegador\probar-pestanas.js` con este contenido:*

```js
const puppeteer = require("puppeteer-core");
const BASE = process.env.BASE || "http://127.0.0.1:5179/";
const res = [];
const errores = [];
const ok = (n, c, d = "") => res.push(`${c ? "OK   " : "FALLA"} ${n}${d ? " -> " + d : ""}`);
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const nav = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true });
  const page = await nav.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  page.on("pageerror", (e) => errores.push(`[pageerror] ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errores.push(`[error] ${m.text()}`); });
  page.on("response", (r) => { if (r.status() >= 400) errores.push(`[http ${r.status()}] ${r.url()}`); });

  await page.goto(BASE, { waitUntil: "networkidle0" });
  await page.evaluate(() => { localStorage.setItem("rol", "admin"); localStorage.setItem("usuario", "admin@futbolapp.cl"); });
  await page.goto(BASE + "usuario/partidos.html", { waitUntil: "networkidle0" });
  await page.waitForFunction(() => document.querySelectorAll("main tbody tr").length > 3, { timeout: 6000 });

  const abrirActa = async (n) => {
    await page.evaluate((n) => [...document.querySelectorAll("main tbody tr")].filter((tr) => tr.offsetParent)[n].querySelector("button").click(), n);
    await esperar(500);
  };
  const estado = () => page.evaluate(() => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const panel = (id) => { const e = document.getElementById(id); return e && getComputedStyle(e).display !== "none"; };
    return {
      activa: tabs.filter((t) => t.getAttribute("aria-selected") === "true").map((t) => t.textContent.trim()),
      tabindex: tabs.map((t) => t.getAttribute("tabindex")).join(","),
      paneles: ["resumen", "acontecimientos", "observaciones"].filter((x) => panel("panel-acta-" + x)),
      foco: document.activeElement && document.activeElement.textContent.trim(),
    };
  });
  const clic = (texto) => page.evaluate((t) => [...document.querySelectorAll('[role="tab"]')].find((b) => b.textContent.trim() === t).click(), texto);

  await abrirActa(0);
  let e = await estado();
  ok("al abrir: pestaña Resumen activa", e.activa.join() === "Resumen", JSON.stringify(e));
  ok("al abrir: solo se ve el panel de resumen", e.paneles.join() === "resumen");
  ok("solo la activa tiene tabindex 0", e.tabindex === "0,-1,-1", e.tabindex);
  const roles = await page.evaluate(() => {
    const l = document.querySelector('[role="tablist"]');
    return { tablist: !!l && l.getAttribute("aria-label"), tabs: document.querySelectorAll('[role="tab"]').length,
      enlaces: [...document.querySelectorAll('[role="tab"]')].every((t) => { const p = document.getElementById(t.getAttribute("aria-controls")); return p && p.getAttribute("role") === "tabpanel" && p.getAttribute("aria-labelledby") === t.id; }) };
  });
  ok("tablist con 3 tabs y cada panel ligado a su tab", roles.tablist && roles.tabs === 3 && roles.enlaces, JSON.stringify(roles));

  await clic("Acontecimientos");
  await esperar(200);
  e = await estado();
  ok("clic en Acontecimientos cambia la pestaña y el panel", e.activa.join() === "Acontecimientos" && e.paneles.join() === "acontecimientos" && e.tabindex === "-1,0,-1", JSON.stringify(e));

  await page.focus("#tab-acta-acontecimientos");
  await page.keyboard.press("ArrowRight");
  await esperar(200);
  e = await estado();
  ok("flecha derecha: pasa a Observaciones y mueve el foco", e.activa.join() === "Observaciones" && e.foco === "Observaciones", JSON.stringify(e));
  await page.keyboard.press("ArrowRight");
  await esperar(200);
  e = await estado();
  ok("flecha derecha en la ultima: vuelve a Resumen", e.activa.join() === "Resumen" && e.foco === "Resumen");
  await page.keyboard.press("ArrowLeft");
  await esperar(200);
  e = await estado();
  ok("flecha izquierda en la primera: va a Observaciones", e.activa.join() === "Observaciones" && e.foco === "Observaciones");
  await page.keyboard.press("Home");
  await esperar(200);
  ok("Inicio: va a Resumen", (await estado()).activa.join() === "Resumen");
  await page.keyboard.press("End");
  await esperar(200);
  ok("Fin: va a Observaciones", (await estado()).activa.join() === "Observaciones");

  await page.keyboard.press("Home");
  await esperar(200);
  await page.keyboard.press("Tab");
  await esperar(150);
  const despuesTab = await page.evaluate(() => document.activeElement.getAttribute("role"));
  ok("con Tab se sale del grupo de pestañas (se entra una sola vez)", despuesTab !== "tab", String(despuesTab));

  await clic("Acontecimientos");
  await esperar(200);
  await page.type("#acMin", "77");
  await page.type("#acJug", "Escrito a medias");
  await clic("Resumen");
  await esperar(200);
  await clic("Acontecimientos");
  await esperar(200);
  const escrito = await page.evaluate(() => [document.getElementById("acMin").value, document.getElementById("acJug").value]);
  ok("x-show: lo escrito en el formulario se mantiene al cambiar de pestaña", escrito[0] === "77" && escrito[1] === "Escrito a medias", JSON.stringify(escrito));

  const filasAntes = await page.$$eval("#panel-acta-acontecimientos tbody tr", (t) => t.filter((x) => x.offsetParent).length);
  await page.evaluate(() => document.querySelector("#acJug").closest("form").requestSubmit());
  await esperar(1200);
  e = await estado();
  const filasDespues = await page.$$eval("#panel-acta-acontecimientos tbody tr", (t) => t.filter((x) => x.offsetParent).length);
  ok("agregar acontecimiento NO devuelve a Resumen", e.activa.join() === "Acontecimientos", JSON.stringify(e));
  ok("el acontecimiento se agrega igual que antes", (await page.$eval("#panel-acta-acontecimientos", (p) => p.innerText)).includes("Escrito a medias"), `${filasAntes} -> ${filasDespues}`);

  await page.evaluate(() => [...document.querySelectorAll("#panel-acta-acontecimientos tbody button")].find((b) => b.closest("tr").innerText.includes("Escrito a medias")).click());
  await esperar(1200);
  ok("quitar acontecimiento tampoco cambia de pestaña", (await estado()).activa.join() === "Acontecimientos");

  ok("Cerrar Acta se ve en cualquier pestaña", await page.evaluate(() => [...document.querySelectorAll("button")].some((b) => b.textContent.trim() === "Cerrar Acta" && b.offsetParent)));
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Cerrar Acta").click());
  await esperar(500);
  await abrirActa(2);
  e = await estado();
  ok("al abrir otro partido vuelve a Resumen", e.activa.join() === "Resumen" && e.paneles.join() === "resumen", JSON.stringify(e));
  await page.keyboard.press("Escape");
  await esperar(400);

  const estilo = await page.evaluate(() => {
    const a = getComputedStyle(document.getElementById("tab-acta-resumen"));
    return { color: a.color, borde: a.borderBottomColor };
  });
  ok("la pestaña activa usa el azul de Partidos (blue-700)", estilo.color.includes("0.488 0.243 264.376") || estilo.color === "rgb(29, 78, 216)", JSON.stringify(estilo));

  await page.setViewport({ width: 375, height: 800 });
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForFunction(() => document.querySelectorAll("main tbody tr").length > 3, { timeout: 6000 });
  await abrirActa(0);
  for (const t of ["Resumen", "Acontecimientos", "Observaciones"]) {
    await clic(t);
    await esperar(250);
    const extra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(`375px, pestaña ${t}: sin scroll horizontal de la pagina`, extra <= 0, String(extra));
  }
  const tabsCaben = await page.evaluate(() => { const l = document.querySelector('[role="tablist"]'); return l.scrollWidth <= l.clientWidth + 1; });
  ok("375px: las 3 pestañas caben sin desplazarse", tabsCaben);
  await clic("Acontecimientos");
  await esperar(250);
  await page.screenshot({ path: "acta-375.png" });
  await page.setViewport({ width: 1100, height: 760 });
  await esperar(300);
  await clic("Resumen");
  await esperar(250);
  await page.screenshot({ path: "acta-escritorio.png" });

  await nav.close();
  console.log(res.join("\n"));
  console.log("\nCONSOLA:", errores.length ? "\n" + [...new Set(errores)].join("\n") : "sin errores");
})().catch((e) => { console.log(res.join("\n")); console.error("FALLO:", e.message); process.exit(1); });
```

*Claude ejecutó en la terminal (Start servers and run the tabs tests):*

```bash
N=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador; cd /c/Users/carlo/Documents/Futbol-desarrollo && (./node_modules/.bin/vite --host 127.0.0.1 --port 5179 --strictPort > $N/vite.log 2>&1 &); (python -m http.server 8766 --bind 127.0.0.1 > $N/static.log 2>&1 &); sleep 5; cd $N && node probar-pestanas.js
```

*Claude ejecutó en la terminal (Show only the test result lines):*

```bash
grep -o '^\(OK   \|FALLA\) [^>]*' "/c/Users/carlo/.claude/projects/C--Users-carlo/3c0f7c63-81c4-46f2-8803-15e909788f15/tool-results/bucjsbc82.txt" | cut -c1-110; grep -A8 '^CONSOLA' "/c/Users/carlo/.claude/projects/C--Users-carlo/3c0f7c63-81c4-46f2-8803-15e909788f15/tool-results/bucjsbc82.txt" | cut -c1-200; grep '^FALLA\|FALLO' "/c/Users/carlo/.claude/projects/C--Users-carlo/3c0f7c63-81c4-46f2-8803-15e909788f15/tool-results/bucjsbc82.txt" | cut -c1-300
```

*Claude leyó el archivo `C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\navegador\acta-375.png`.*

*Claude ejecutó en la terminal (Make the tabs smaller on mobile and rerun the tabs tests):*

```bash
cd /c/Users/carlo/Documents/Futbol-desarrollo && python - <<'EOF'
import pathlib
p = pathlib.Path("usuario/partidos.html"); raw = p.read_bytes().decode("utf-8")
viejo = 'class="-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition'
nuevo = 'class="-mb-px whitespace-nowrap border-b-2 px-2 py-2 text-xs font-semibold transition sm:px-3 sm:text-sm'
assert raw.count(viejo) == 3
raw = raw.replace(viejo, nuevo)
v2 = '<div role="tablist" aria-label="Secciones del acta" class="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200">'
assert raw.count(v2) == 1
raw = raw.replace(v2, '<div role="tablist" aria-label="Secciones del acta" class="mt-4 flex overflow-x-auto border-b border-slate-200 sm:gap-1">')
p.write_bytes(raw.encode("utf-8"))
print("ok")
EOF
cd /c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador && node probar-pestanas.js > rp.txt 2>&1; grep -o '^\(OK   \|FALLA\) [^>]*' rp.txt | cut -c1-80 | grep -c '^OK'; grep '^FALLA\|FALLO' rp.txt | cut -c1-200; grep -A3 '^CONSOLA' rp.txt | cut -c1-200
```

*Claude leyó el archivo `C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\navegador\acta-375.png`.*

*Claude leyó el archivo `C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\navegador\acta-escritorio.png`.*

Ahora caben las tres pestañas a 375 px, y en escritorio se ven igual que el resto de Partidos. Confirmo el total de esta prueba y corro las demás en los dos servidores.

*Claude ejecutó en la terminal (Count the tabs results and run every suite on both servers):*

```bash
echo "pestañas: $(grep -c '^OK' rp.txt) OK de $(grep -c '^OK\|^FALLA' rp.txt)"; for B in http://127.0.0.1:5179/ http://127.0.0.1:8766/; do echo "######## $B"; for t in probar.js probar-admin.js probar-tiempo-real.js probar-acceso.js probar-login.js probar-pestanas.js; do BASE=$B node $t > r.txt 2>&1; grep '^FALLA\|FALLO\|pageerror\|\[error\]\|http 4' r.txt | cut -c1-150; echo "  $t: $(grep -c '^OK' r.txt) OK de $(grep -c '^OK\|^FALLA' r.txt)"; done; done
```

*Claude ejecutó en la terminal (Stop both test servers):*

```powershell
foreach ($p in 5179, 8766) { $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue; if ($c) { foreach ($id in ($c.OwningProcess | Sort-Object -Unique)) { try { Stop-Process -Id $id -Confirm:$false -ErrorAction Stop; "detenido $p" } catch { "no se pudo $p" } } } }
```

*Claude ejecutó en la terminal (List pending changes and final line numbers):*

```bash
cd /c/Users/carlo/Documents/Futbol-desarrollo && git status --short | cat; git diff --stat | cat; grep -n 'x-data="{$\|role="tablist"\|panel-acta-resumen" aria\|panel-acta-acontecimientos" aria\|panel-acta-observaciones" aria\|overflow-x-auto rounded-lg' usuario/partidos.html
```

*Claude ejecutó en la terminal (Make the old test click the Acontecimientos tab first and rerun it on both servers):*

```bash
N=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador; cd $N && python - <<'EOF'
import pathlib
p = pathlib.Path("probar.js"); s = p.read_text(encoding="utf-8")
a = '  await page.type("#acMin", "33");'
assert s.count(a) == 1
s = s.replace(a, '  await page.evaluate(() => document.getElementById("tab-acta-acontecimientos").click());\n  await esperar(200);\n' + a)
p.write_text(s, encoding="utf-8")
print("ok")
EOF
cd /c/Users/carlo/Documents/Futbol-desarrollo && (./node_modules/.bin/vite --host 127.0.0.1 --port 5179 --strictPort > $N/vite.log 2>&1 &); (python -m http.server 8766 --bind 127.0.0.1 > $N/static.log 2>&1 &); sleep 5; cd $N && for B in http://127.0.0.1:5179/ http://127.0.0.1:8766/; do BASE=$B node probar.js > r.txt 2>&1; grep '^FALLA\|FALLO\|pageerror\|\[error\]' r.txt | cut -c1-150; echo "$B probar.js: $(grep -c '^OK' r.txt) OK de $(grep -c '^OK\|^FALLA' r.txt) | consola: $(grep -A1 '^ERRORES' r.txt | tail -1)"; done
```

*Claude ejecutó en la terminal (Stop both test servers):*

```powershell
foreach ($p in 5179, 8766) { $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue; if ($c) { foreach ($id in ($c.OwningProcess | Sort-Object -Unique)) { try { Stop-Process -Id $id -Confirm:$false -ErrorAction Stop; "detenido $p" } catch { "no se pudo $p" } } } }
```

Listo, las pestañas del acta quedaron funcionando. **Pasan las 164 pruebas, tanto en Vite como en un servidor igual al de AWS, y la consola quedó sin errores.** No hice commit.

##### Qué cambió (solo `usuario/partidos.html`)
- **Líneas 423-436, el `x-data` del modal:**
  - Tiene `pestanaActa`, `pestanasActa`, `irAPestanaActa()` y `moverPestanaActa()`. Ninguno choca con `gestorPartidos`.
  - Tiene el `x-init` con `$watch('modalDetalle', …)`, que vuelve a "Resumen" al abrir el acta.
  - Agregué `irAPestanaActa()` además de lo que te mostré: es lo que comparten las flechas, Inicio y Fin para cambiar de pestaña y mover el foco, así no se repite ese código.
- **Línea 459, la barra de pestañas:** `role="tablist"` y tres botones `role="tab"`, con `aria-selected`, `aria-controls`, `tabindex` (0 solo en la activa), las flechas, Inicio y Fin.
- **Líneas 510, 531 y 638, los tres paneles:** cada uno con `role="tabpanel"`, `aria-labelledby` y `x-show` (no `x-if`).
- **Línea 534, la tabla de acontecimientos:** `overflow-hidden` pasó a `overflow-x-auto`, lo que pedía la revisión en C2.
- **"Cerrar Acta"** quedó fuera de las pestañas, así que se ve siempre.

**Un ajuste extra:** a 375 px se cortaba "Observaciones". En celular, las pestañas ahora usan letra `text-xs` y menos espacio a los lados. Desde 640 px (`sm:`) se ven como el resto de Partidos.

##### Qué probé (22 pruebas nuevas)
- **Al abrir:** está activa "Resumen" y solo se ve su panel. Cada panel está ligado a su pestaña.
- **Teclado:**
  - Las flechas cambian de pestaña y mueven el foco, y dan la vuelta en los extremos.
  - Inicio y Fin funcionan.
  - **Con Tab se entra y se sale del grupo de una sola vez.**
- **`x-show`:** escribí en el formulario, cambié de pestaña y volví, y **lo escrito seguía ahí**.
- **Agregar y quitar acontecimientos** funcionan igual que antes y **no te devuelven a "Resumen"**. Esto confirma que `$watch` sobre `modalDetalle` era la opción correcta.
- **Al abrir el acta de otro partido**, empieza en "Resumen".
- **El estilo:** la pestaña activa usa el mismo azul de Partidos (`blue-700`).
- **A 375 px:** no hay scroll horizontal en ninguna pestaña, y las tres caben.

Las pruebas antiguas también pasan. Tuve que ajustar una de mis pruebas viejas, porque escribía en el formulario del acta sin abrir antes la pestaña "Acontecimientos".

##### Para subirlo
```
git add usuario/partidos.html
git commit -m "Agrega pestañas al modal del acta (tercer componente)"
git pull --rebase origin main
git push origin main
```

Como `partidos.html` es de Josefa, avísale que haga `git pull` antes de volver a trabajar en ese archivo.

## Qué se incorporó al proyecto

- Un `x-data` chico en la tarjeta del modal del acta con `pestanaActa`, `pestanasActa`, `irAPestanaActa()` y `moverPestanaActa()`. Todos los nombres terminan en `Acta` para no pisar nada de `gestorPartidos`, y `comun/partidos.js` no se tocó.
- Volver a "Resumen" al abrir el acta con `$watch('modalDetalle', ...)`. No se usó `$watch` sobre `partidoSeleccionado` porque en Alpine revisa el objeto completo y devolvía a "Resumen" cada vez que se agregaba un acontecimiento.
- Barra `role="tablist"` con tres botones `role="tab"`: `aria-selected`, `aria-controls`, `tabindex` 0 solo en la activa, flechas izquierda y derecha (dan la vuelta), Inicio y Fin, y foco visible.
- Tres paneles `role="tabpanel"` con `aria-labelledby` y `x-show` (no `x-if`), para no perder lo escrito en el formulario de acontecimientos al cambiar de pestaña. "Cerrar Acta" quedó fuera de las pestañas.
- La tabla de acontecimientos pasó de `overflow-hidden` a `overflow-x-auto`, como pedía la revisión en C2.
- En celular las pestañas usan `text-xs` y menos espacio lateral, porque a 375 px se cortaba "Observaciones"; desde `sm:` se ven como el resto de Partidos.
- Una de las pruebas automáticas antiguas se ajustó para abrir la pestaña "Acontecimientos" antes de escribir en el formulario.

## Verificación

- Se probó en el navegador (Edge automatizado) con Vite y con un servidor estático como Nginx: 22 pruebas nuevas, más las 142 anteriores, todas bien (164 de 164 en cada servidor) y sin errores en la consola.
- Al abrir el acta está activa "Resumen"; cada panel está ligado a su pestaña; solo la pestaña activa tiene `tabindex` 0.
- Las flechas, Inicio y Fin cambian de pestaña y mueven el foco; con Tab se entra y se sale del grupo de una sola vez.
- Lo escrito en el formulario de acontecimientos se mantiene al cambiar de pestaña y volver.
- Agregar y quitar acontecimientos funcionan igual que antes y no devuelven a "Resumen"; al abrir el acta de otro partido empieza en "Resumen".
- A 375 px las tres pestañas caben y no hay scroll horizontal en ninguna pestaña.

## Conclusión: lo que aprendí

Aprendí que un componente de pestañas no es solo mostrar y ocultar secciones: para que sea accesible hay que indicar qué pestaña está activa (`aria-selected`), ligar cada pestaña con su panel y permitir moverse con las flechas, dejando solo la pestaña activa en el orden del Tab. También entendí la diferencia práctica entre `x-show` y `x-if`: con `x-show` el formulario sigue existiendo aunque esté oculto, por eso no se pierde lo escrito. Y vi que `$watch` en Alpine revisa el objeto completo por dentro, por lo que conviene vigilar un valor simple, como `modalDetalle`, cuando solo interesa saber si el modal se abrió.
