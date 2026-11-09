# Orden por carpetas, limpieza de código y README

- **Fecha:** 2026-11-04
- **Integrante:** Carlos Benavides (@CBenavidesP)
- **Herramienta y modelo:** Claude Code
- **Enlace a la conversación:** no aplica (Claude Code no permite compartir la conversación)
- **Archivos afectados:** estructura completa del proyecto (carpetas login/, comun/, usuario/ y admin/); rutas en index.html, usuario/\*.html, admin/usuarios.html, login/login.js, comun/sesion.js, comun/menu.js y comun/api.js; index.html y login/login.css (limpieza); README.md (reescrito); se eliminaron src/main.js, src/style.css, public/favicon.svg y public/icons.svg

## Objetivo

Los archivos estaban sueltos en la raíz y mezclados entre secciones. Quería una carpeta por sección (login, común, usuario y admin) para que cada cosa quedara junto a lo suyo, y después dejar el proyecto limpio para la revisión: borrar archivos vacíos y código que no hacía nada, actualizar el README según el PDF y el proyecto de ejemplo del profesor, y revisar archivo por archivo que todo funcionara.

## Conversación (texto completo, sin editar)

El Prompt 1 se envió dos veces seguidas porque el primer envío no recibió respuesta; aquí va el segundo. En la Respuesta 1 aparece la pregunta que hizo la herramienta sobre la estructura y la opción que elegí.

### Prompt 1

```text
Necesito que ordenes los archivos en carpetas para que todo este junto a lo que tiene que estar por ejemplo una carpeta solo para la seccion de admin, otra solo para la seccion de usuarios, otra solo para el main y asi, me entiendes? Ademas no agregues esta prompt a la carpeta IA, agrega solo los promps y respuestas cuando yo te diga explicitamente que los agregues
```

### Respuesta 1

_Claude creó o reemplazó el archivo `C:\Users\carlo\.claude\projects\C--Users-carlo\memory\registro-ia-solo-cuando-pida.md` con este contenido:_

```markdown
---
name: registro-ia-solo-cuando-pida
description: En Futbol-desarrollo, agregar prompts y respuestas a la carpeta ia/ solo cuando el usuario lo pida explícitamente
metadata:
  type: feedback
---

No agregar conversaciones a la carpeta ia/ de Futbol-desarrollo por cuenta propia. Solo registrar prompts y respuestas cuando el usuario diga explícitamente que se agreguen.

**Why:** el usuario lo pidió el 2026-11-04 al encargar la reorganización de carpetas; quiere decidir él qué interacciones quedan documentadas.

**How to apply:** al terminar un cambio de código, no crear ni editar archivos en ia/ ni el índice ia/README.md salvo instrucción explícita. Se puede recordar que el PDF exige registrar el código que viene de IA, pero sin hacerlo. Relacionado: [[referencia-proyecto-docente-sazon]]
```

_Claude ejecutó en la terminal (Save feedback memory and inspect the project's current state):_

```bash
cd /c/Users/carlo/.claude/projects/C--Users-carlo/memory && printf -- '- [Registro IA solo cuando lo pida](registro-ia-solo-cuando-pida.md) — no agregar a ia/ sin instrucción explícita\n' >> MEMORY.md; cd /c/Users/carlo/Documents/Futbol-desarrollo && git status -sb | head; git fetch origin 2>&1 | tail -1; git log --oneline HEAD..origin/main; git log --oneline -5; find . -path ./.git -prune -o -path ./node_modules -prune -o -type f -print | sort
```

_Claude ejecutó en la terminal (Find every file reference that a move would break):_

```bash
cd /c/Users/carlo/Documents/Futbol-desarrollo; grep -n 'src=\|href=\|location\|\.html\|mocks\|fetch(' *.html js/*.js login.js componentes.js registro-arbitros.js src/main.js | grep -v 'https://\|href="#' ; echo ----; cat src/main.js | head -20; head -15 src/style.css; echo ----; sed -n 1,80p README.md
```

_Claude preguntó:_ ¿Cómo quieres ordenar Futbol-desarrollo? En las dos opciones index.html (el login) queda en la raíz, porque es la página que abre el servidor.

- **Carpeta por sección:** Cada sección tiene su carpeta con su HTML, JS y CSS. Es lo que pediste. Hay que cambiar rutas en todas las páginas, en menu.js, sesion.js, login.js y api.js (los mocks pasan a ../public/mocks).
- **Páginas en la raíz:** Los HTML quedan donde están y solo se agrupan JS y CSS por sección. Es la estructura que sugiere el PDF (css/, js/, mocks/). Cambian menos rutas y hay menos riesgo de romper algo de tus compañeros.

_Respuesta del integrante:_

```text
Your questions have been answered: "¿Cómo quieres ordenar Futbol-desarrollo? En las dos opciones index.html (el login) queda en la raíz, porque es la página que abre el servidor."="Carpeta por sección" selected preview:
Futbol-desarrollo/
├── index.html            login
├── login/
│   ├── login.js
│   └── login.css         (hoy style.css)
├── comun/                lo que usan todas
│   ├── api.js
│   ├── sesion.js
│   ├── menu.js
│   └── componentes.js
├── usuario/              árbitro y admin
│   ├── dashboard.html
│   ├── dashboard.js
│   ├── partidos.html
│   └── perfil.html
├── admin/                solo admin
│   ├── usuarios.html
│   ├── registro-arbitros.js
│   └── registro-arbitros.css
├── public/mocks/
└── ia/. You can now continue with these answers in mind.
```

Primero traigo los 5 commits nuevos de tus compañeros, para mover la versión actual.

_Claude ejecutó en la terminal (Pull teammates' commits and re-list files):_

```bash
git pull --ff-only origin main 2>&1 | tail -3 && git status -sb | head -3 && find . -path ./.git -prune -o -path ./node_modules -prune -o -type f -print | sort && cat js/api.js | sed -n 1,20p && grep -n 'API_BASE\|fetch\|mocks' js/*.js
```

Ya estaba al día. Ahora muevo los archivos con `git mv`, para que Git los reconozca como movidos y no como borrados y creados de nuevo.

_Claude ejecutó en la terminal (Create section folders and move files with git mv):_

```bash
mkdir -p login comun usuario admin && git mv login.js login/login.js && git mv style.css login/login.css && git mv js/api.js comun/api.js && git mv js/sesion.js comun/sesion.js && git mv js/menu.js comun/menu.js && git mv componentes.js comun/componentes.js && git mv dashboard.html usuario/dashboard.html && git mv js/dashboard.js usuario/dashboard.js && git mv partidos.html usuario/partidos.html && git mv perfil.html usuario/perfil.html && git mv usuarios.html admin/usuarios.html && git mv registro-arbitros.js admin/registro-arbitros.js && git mv registro-arbitros.css admin/registro-arbitros.css && ls js 2>&1; git status --short
```

Ahora actualizo las rutas dentro de los archivos.

_Claude ejecutó en la terminal (List every line that mentions a path):_

```bash
grep -n 'js/\|\.html\|\.css\|componentes.js\|login.js\|registro-arbitros' index.html usuario/*.html admin/usuarios.html login/login.js comun/*.js usuario/dashboard.js admin/registro-arbitros.js | grep -v 'https://'
```

_Claude ejecutó en la terminal (Update script, link and redirect paths for the new folders):_

```bash
python - <<'EOF'
import pathlib
cambios = {
 "index.html": [('href="style.css"','href="login/login.css"'),('<script src="componentes.js" defer>','<script src="comun/componentes.js" defer>'),('<script src="login.js">','<script src="login/login.js">'),('<script src="js/api.js" type="module">','<script src="comun/api.js" type="module">')],
 "usuario/dashboard.html": [('(ver js/sesion.js)','(ver comun/sesion.js)'),('src="js/sesion.js"','src="../comun/sesion.js"'),('src="js/api.js"','src="../comun/api.js"'),('src="js/menu.js"','src="../comun/menu.js"'),('src="js/dashboard.js"','src="dashboard.js"')],
 "usuario/partidos.html": [('(ver js/sesion.js)','(ver comun/sesion.js)'),('src="js/sesion.js"','src="../comun/sesion.js"'),('(ver js/menu.js)','(ver comun/menu.js)'),('src="js/menu.js"','src="../comun/menu.js"')],
 "usuario/perfil.html": [('(ver js/sesion.js)','(ver comun/sesion.js)'),('src="js/sesion.js"','src="../comun/sesion.js"'),('(ver js/menu.js)','(ver comun/menu.js)'),('src="js/menu.js"','src="../comun/menu.js"')],
 "admin/usuarios.html": [('(ver js/sesion.js)','(ver comun/sesion.js)'),('src="js/sesion.js"','src="../comun/sesion.js"'),('(ver js/menu.js)','(ver comun/menu.js)'),('src="js/menu.js"','src="../comun/menu.js"'),('src="componentes.js"','src="../comun/componentes.js"')],
 "login/login.js": [('"dashboard.html"','"usuario/dashboard.html"')],
 "comun/sesion.js": [('src="js/sesion.js"></script>                  requiere','src="../comun/sesion.js"></script>                  requiere'),('src="js/sesion.js" data-rol="admin"></script>  requiere','src="../comun/sesion.js" data-rol="admin"></script>  requiere'),('return "index.html";','return "../index.html";'),('return "dashboard.html";','return "../usuario/dashboard.html";')],
 "comun/menu.js": [('href: "dashboard.html"','href: "../usuario/dashboard.html"'),('href: "partidos.html"','href: "../usuario/partidos.html"'),('href: "perfil.html"','href: "../usuario/perfil.html"'),('href: "usuarios.html"','href: "../admin/usuarios.html"'),('<a href="dashboard.html"','<a href="../usuario/dashboard.html"'),('window.location.replace("index.html")','window.location.replace("../index.html")'),('return window.location.pathname.split("/").pop() === link.href;','return window.location.pathname.split("/").pop() === link.href.split("/").pop();')],
 "comun/api.js": [('// js/api.js (Versión','// comun/api.js (Versión'),('(<script src="js/api.js" defer>)','(<script src="../comun/api.js" defer>)'),
   ('const API_BASE = "public/mocks"; // O "./public/mocks" según cómo lo cargues','// la ruta a los mocks se arma desde donde esta este archivo, asi sirve desde cualquier carpeta\nconst API_BASE = new URL("../public/mocks", document.currentScript?.src ?? location.href).href;')],
 "usuario/dashboard.js": [('(js/api.js)','(comun/api.js)'),('(ver js/sesion.js)','(ver comun/sesion.js)')],
}
for f, pares in cambios.items():
    p = pathlib.Path(f); s = p.read_text(encoding="utf-8")
    for a, b in pares:
        n = s.count(a)
        if n == 0: raise SystemExit(f"NO ENCONTRADO en {f}: {a}")
        s = s.replace(a, b)
    p.write_text(s, encoding="utf-8", newline="")
print("ok")
EOF
grep -rn 'js/\|"index.html"\|"dashboard.html"' --include=*.html --include=*.js index.html login comun usuario admin | grep -v https://; git diff -M --stat | cat
```

Reviso que cada archivo referenciado exista con el nombre exacto, como pide el PDF para la revisión en Linux.

_Claude ejecutó en la terminal (Verify every referenced file exists with exact case):_

```bash
rmdir js 2>/dev/null; python - <<'EOF'
import re, pathlib, posixpath
raiz = pathlib.Path('.').resolve()
real = {p.relative_to(raiz).as_posix() for p in raiz.rglob('*') if p.is_file() and '.git' not in p.parts and 'node_modules' not in p.parts}
mal = 0
def check(origen, ref):
    global mal
    dest = posixpath.normpath(posixpath.join(posixpath.dirname(origen), ref))
    ok = dest in real
    if not ok: mal += 1
    print(('OK  ' if ok else 'FALTA'), origen, '->', ref, '=', dest)
for html in sorted(p for p in real if p.endswith('.html')):
    s = (raiz/html).read_text(encoding='utf-8')
    for ref in re.findall(r'(?:src|href)="([^"#:]+)"', s):
        check(html, ref)
menu = (raiz/'comun/menu.js').read_text(encoding='utf-8')
for ref in re.findall(r'href(?::|=) ?"([^"]+\.html)"', menu):
    for pagina in ['usuario/dashboard.html', 'admin/usuarios.html']:
        check(pagina, ref)
for ref in re.findall(r'replace\("([^"]+)"\)', menu): check('usuario/dashboard.html', ref)
ses = (raiz/'comun/sesion.js').read_text(encoding='utf-8')
for ref in re.findall(r'return "([^"]+\.html)"', ses): check('admin/usuarios.html', ref)
for ref in re.findall(r'href = "([^"]+)"', (raiz/'login/login.js').read_text(encoding='utf-8')): check('index.html', ref)
for m in ['equipos','partidos','usuarios']: check('comun/api.js', f'../public/mocks/{m}.json')
print('PROBLEMAS:', mal)
EOF
```

_Claude ejecutó en la terminal (Check JS syntax and that a local server serves the moved files):_

```bash
for f in comun/*.js login/login.js usuario/dashboard.js admin/registro-arbitros.js; do node --check "$f" || echo "ERROR $f"; done; echo sintaxis-ok; (python -m http.server 8765 >/dev/null 2>&1 &) ; sleep 1; for u in index.html login/login.css comun/api.js usuario/dashboard.html admin/usuarios.html public/mocks/partidos.json; do printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8765/$u)" "$u"; done; pkill -f 'http.server 8765' 2>/dev/null || taskkill //F //IM python.exe //FI "WINDOWTITLE eq *8765*" >/dev/null 2>&1; git status --short | cat
```

_Claude ejecutó en la terminal (Stop the temporary test server on port 8765):_

```powershell
$c = Get-NetTCPConnection -LocalPort 8765 -State Listen -ErrorAction SilentlyContinue; if ($c) { Stop-Process -Id $c.OwningProcess -Confirm:$false; "detenido $($c.OwningProcess)" } else { "no habia servidor" }
```

_Claude ejecutó en la terminal (Check the ia index and possible leftover template files):_

```bash
cat ia/README.md; wc -c src/main.js src/style.css; grep -rn 'icons.svg\|favicon' --include=*.html --include=*.js . | grep -v node_modules | head
```

Ya reorganicé el proyecto por secciones, con la estructura que elegiste. Todavía no hice commit ni push.

##### Cómo quedó

```
Futbol-desarrollo/
├── index.html              login (queda en la raíz porque es la entrada)
├── login/      login.js, login.css (antes style.css)
├── comun/      api.js, sesion.js, menu.js, componentes.js
├── usuario/    dashboard.html, dashboard.js, partidos.html, perfil.html
├── admin/      usuarios.html, registro-arbitros.js, registro-arbitros.css
├── public/mocks/
└── ia/
```

Moví todo con `git mv`, así Git lo marca como "movido" y no se pierde el historial de cada archivo. La carpeta `js/` quedó vacía y la borré.

##### Rutas que cambié

- **`index.html`:**
  - Línea 6: `login/login.css`.
  - Línea 14: `comun/componentes.js`.
  - Línea 160: `login/login.js`.
  - Línea 161: `comun/api.js`.
- **Páginas de `usuario/` y `admin/`:** los scripts compartidos ahora se cargan con `../comun/...`.
- **`login/login.js`, líneas 16 y 27:** después de iniciar sesión, redirige a `usuario/dashboard.html`.
- **`comun/sesion.js`, líneas 11 y 12:** si no hay sesión manda a `../index.html`. Si no eres admin, manda a `../usuario/dashboard.html`.
- **`comun/menu.js`:**
  - Líneas 7 a 10 y 15: los enlaces del menú y del logo ahora incluyen la carpeta, para que funcionen desde `usuario/` y desde `admin/`.
  - Línea 86: la marca de "página actual" compara solo el nombre del archivo.
  - Línea 91: cerrar sesión vuelve a `../index.html`.
- **`comun/api.js`, líneas 5 y 6:** la ruta a los mocks se arma desde la ubicación de `api.js`, así funciona desde cualquier carpeta. Le dejé un comentario corto.
- **Comentarios:** también actualicé los que mencionaban las rutas viejas (`js/sesion.js`, `js/menu.js`).

##### Lo que revisé

- Todos los archivos que se cargan existen con el nombre exacto, incluidas mayúsculas. Revisé 35 rutas y no encontré problemas.
- Ningún archivo JS tiene errores de sintaxis.
- Un servidor local entrega bien las páginas, los scripts y los mocks.

**No lo probé en el navegador.** Antes de subirlo:

1. Abre `index.html` con Live Server.
2. Entra como `admin` y como `arbitro`.
3. Recorre todas las páginas del menú y prueba cerrar sesión.
4. Fíjate que el dashboard cargue los datos.

##### Lo que tienes que saber

1. **Esto cambia archivos de tus compañeros** (`menu.js`, `sesion.js`, `api.js`, `dashboard`). Avísales antes de subirlo. Si alguno tiene cambios sin subir en los archivos movidos, va a tener conflictos al hacer `git pull`.
2. **El `README.md` todavía muestra la estructura vieja.** No lo cambié porque no lo pediste.
3. **`src/main.js` y `src/style.css` están vacíos.** Parecen sobras de la plantilla de Vite, y el PDF descuenta por archivos sobrantes. No los borré.
4. **Falta un registro en `ia/`.** El índice `ia/README.md` enlaza `2026-11-02_cbenavidesp_rut-y-eliminar-arbitros.md`, pero ese archivo ya no está en la carpeta, así que el enlace está roto. Como pediste, no agregué nada a `ia/`.

Cuando lo pruebes, el commit sería:

```
git add -A
git commit -m "Ordena archivos en carpetas por seccion"
git push origin main
```

`git add -A` también incluye la carpeta `ia/`. Si no quieres subirla todavía, usa `git add login comun usuario admin index.html` y agrega `-u` para que se registren los archivos movidos.

### Prompt 2

```text
Actualiza el readme como la pagina que te mande. Ademas elimina todo lo que este vacio y no entregue nada o codigo muerto que haya entre medio de las lineas. Antes de finalizar realiza una revision profunda, archivo por archivo para confirmar que todo se encuentre en orden
```

### Respuesta 2

Primero leo todos los archivos completos, para no borrar nada que se use.

_Claude ejecutó en la terminal (Read README, package.json, gitignore and public assets):_

```bash
git status --short | cat; cat README.md; echo =====; cat package.json .gitignore; ls -la public; cat public/favicon.svg | head -c 300; echo; head -c 300 public/icons.svg
```

_Claude ejecutó en la terminal (Read index.html and login.js with line numbers):_

```bash
cat -n index.html login/login.js
```

_Claude ejecutó en la terminal (Read comun/api.js with line numbers):_

```bash
cat -n comun/api.js
```

_Claude ejecutó en la terminal (Read sesion.js and menu.js with line numbers):_

```bash
cat -n comun/sesion.js comun/menu.js
```

_Claude ejecutó en la terminal (Read the usuario section files with line numbers):_

```bash
cat -n usuario/dashboard.html usuario/dashboard.js usuario/partidos.html usuario/perfil.html
```

_Claude ejecutó en la terminal (Read the admin JS, componentes.js and usuarios.html head/foot):_

```bash
cat -n admin/registro-arbitros.js comun/componentes.js; sed -n 1,30p admin/usuarios.html; sed -n 120,160p admin/usuarios.html
```

_Claude ejecutó en la terminal (Read login.css and summarize the mock files):_

```bash
cat -n login/login.css | sed -n 1,175p; for f in public/mocks/*.json; do python -c "import json,sys;d=json.load(open('$f',encoding='utf-8'));print('$f',len(d),list(d[0].keys()))"; done
```

Ya leí todos los archivos. Antes de escribir el README reviso cómo levanta realmente el proyecto, para que las instrucciones funcionen tal cual.

_Claude ejecutó en la terminal (Check whether Vite is installed and Node versions):_

```bash
ls node_modules/.bin/vite* 2>&1 | head -2; node -v; npm -v; ls vite.config.* 2>&1
```

_Claude ejecutó en la terminal (Install dependencies like a fresh clone would):_

```bash
npm install 2>&1 | tail -3
```

_Claude ejecutó en la terminal (Start Vite on localhost only and check which paths it serves):_

```bash
./node_modules/.bin/vite --host 127.0.0.1 --port 5179 --strictPort > /c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/vite.log 2>&1 &
sleep 4; for u in "" index.html login/login.css comun/api.js usuario/dashboard.html admin/usuarios.html public/mocks/partidos.json mocks/partidos.json; do printf '%s /%s\n' "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5179/$u)" "$u"; done; curl -s http://127.0.0.1:5179/public/mocks/partidos.json | head -c 80; echo; cat /c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/vite.log
```

Vite sirve todo bien. Para una revisión real voy a abrir las páginas en un navegador automatizado (Edge, sin ventana) y revisar errores de consola en cada vista.

_Claude ejecutó en la terminal (Find a local browser and install puppeteer-core in the scratchpad):_

```bash
ls "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" "/c/Program Files/Google/Chrome/Application/chrome.exe" 2>&1; D=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador; mkdir -p $D && cd $D && npm init -y >/dev/null && PUPPETEER_SKIP_DOWNLOAD=1 npm install puppeteer-core@23.11.1 2>&1 | tail -1
```

_Claude creó o reemplazó el archivo `C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\navegador\probar.js` con este contenido:_

```js
const puppeteer = require("puppeteer-core");

const BASE = "http://127.0.0.1:5179/";
const errores = [];
const resultados = [];
const ok = (nombre, condicion, detalle = "") =>
  resultados.push(
    `${condicion ? "OK   " : "FALLA"} ${nombre}${detalle ? " -> " + detalle : ""}`,
  );
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const navegador = await puppeteer.launch({
    executablePath:
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
    args: ["--no-first-run"],
  });
  const page = await navegador.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning")
      errores.push(`[${m.type()}] ${page.url()} :: ${m.text()}`);
  });
  page.on("pageerror", (e) =>
    errores.push(`[pageerror] ${page.url()} :: ${e.message}`),
  );
  page.on("requestfailed", (r) => errores.push(`[requestfailed] ${r.url()}`));
  page.on("response", (r) => {
    if (r.status() >= 400) errores.push(`[http ${r.status()}] ${r.url()}`);
  });

  const ruta = () => new URL(page.url()).pathname;

  await page.goto(BASE + "usuario/dashboard.html", {
    waitUntil: "networkidle0",
  });
  ok(
    "sin sesion, dashboard redirige al login",
    ruta() === "/index.html" || ruta() === "/",
    ruta(),
  );

  await page.goto(BASE, { waitUntil: "networkidle0" });
  await page.type("#usuario", "nadie");
  await page.type("#password", "x");
  await page.click("button[type=submit]");
  ok(
    "usuario desconocido muestra mensaje",
    (await page.$eval("#mensaje", (e) => e.textContent)).includes(
      "no reconocido",
    ),
  );

  await page.evaluate(() => {
    document.querySelector("#usuario").value = "";
    document.querySelector("#password").value = "";
  });
  await page.type("#usuario", "admin");
  await page.type("#password", "admin123");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click("button[type=submit]"),
  ]);
  ok(
    "login admin lleva al dashboard",
    ruta() === "/usuario/dashboard.html",
    ruta(),
  );

  await page
    .waitForFunction(
      () => document.body.innerText.includes("Partidos totales"),
      { timeout: 5000 },
    )
    .catch(() => {});
  const textoDash = await page.evaluate(() => document.body.innerText);
  ok(
    "dashboard carga datos de los mocks",
    textoDash.includes("Partidos totales") &&
      textoDash.includes("Próximos partidos"),
  );
  const links = await page.$$eval("#menu-principal a", (as) =>
    as.map((a) => [
      a.textContent.trim(),
      a.getAttribute("href"),
      a.getAttribute("aria-current"),
    ]),
  );
  ok("menu admin tiene 4 enlaces", links.length === 4, JSON.stringify(links));
  ok(
    "menu marca Inicio como actual",
    links.find((l) => l[0] === "Inicio")?.[2] === "page",
  );

  for (const [texto, destino] of [
    ["Partidos", "/usuario/partidos.html"],
    ["Perfil", "/usuario/perfil.html"],
    ["Usuarios", "/admin/usuarios.html"],
    ["Inicio", "/usuario/dashboard.html"],
  ]) {
    const enlace = (await page.$$("#menu-principal a")).find(async () => true);
    const todos = await page.$$("#menu-principal a");
    let objetivo = null;
    for (const a of todos)
      if ((await a.evaluate((e) => e.textContent.trim())) === texto)
        objetivo = a;
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      objetivo.click(),
    ]);
    const actual = await page.$$eval(
      "#menu-principal a[aria-current=page]",
      (as) => as.map((a) => a.textContent.trim()),
    );
    ok(
      `menu -> ${texto}`,
      ruta() === destino && actual[0] === texto,
      `${ruta()} actual=${actual}`,
    );
  }

  await page.goto(BASE + "admin/usuarios.html", { waitUntil: "networkidle0" });
  const filas = () =>
    page.$$eval(
      "tbody tr",
      (trs) => trs.filter((t) => t.offsetParent !== null).length,
    );
  ok("tabla parte con 1 arbitro", (await filas()) === 1, String(await filas()));
  await page.click("form button[type=submit]");
  await esperar(300);
  const erroresVisibles = await page.$$eval(
    "small",
    (s) => s.filter((e) => e.offsetParent !== null).length,
  );
  ok(
    "guardar vacio muestra 5 errores",
    erroresVisibles === 5,
    String(erroresVisibles),
  );
  await page.type("#arbNombre", "Ana Perez");
  await page.type("#arbRut", "11.111.111-1");
  await page.type("#arbEmail", "ana@arbitros.cl");
  await page.type("#arbTelefono", "+56 9 8765 4321");
  await page.select("#arbCategoria", "FIFA");
  await page.click("form button[type=submit]");
  await esperar(400);
  ok(
    "modal de confirmacion se abre",
    await page.$eval(
      ".modal-fondo",
      (e) => e.offsetParent !== null || getComputedStyle(e).display !== "none",
    ),
  );
  await page.evaluate(() =>
    [...document.querySelectorAll(".modal-boton")]
      .find((b) => b.textContent.trim() === "Registrar")
      .click(),
  );
  await esperar(400);
  ok(
    "arbitro agregado a la tabla",
    (await filas()) === 2,
    String(await filas()),
  );
  ok(
    "toast de exito visible",
    (await page.$$eval(".toast", (t) => t.length)) > 0,
  );
  const botones = await page.$$("tbody button");
  await botones[botones.length - 1].click();
  await esperar(400);
  await page.evaluate(() =>
    [...document.querySelectorAll(".modal-boton")]
      .find((b) => b.textContent.trim() === "Eliminar")
      .click(),
  );
  await esperar(400);
  ok(
    "arbitro eliminado de la tabla",
    (await filas()) === 1,
    String(await filas()),
  );

  await page.setViewport({ width: 375, height: 800 });
  for (const p of [
    "usuario/dashboard.html",
    "admin/usuarios.html",
    "usuario/partidos.html",
    "usuario/perfil.html",
  ]) {
    await page.goto(BASE + p, { waitUntil: "networkidle0" });
    await esperar(300);
    const anchoExtra = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    ok(
      `375px sin scroll horizontal: ${p}`,
      anchoExtra <= 0,
      String(anchoExtra),
    );
  }
  const hamburguesa = await page.$(
    "#menu-comun button[aria-controls=menu-principal]",
  );
  await hamburguesa.click();
  await esperar(200);
  ok(
    "menu hamburguesa se abre en movil",
    await page.$eval("#menu-principal", (n) => n.offsetParent !== null),
  );
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto(BASE + "usuario/dashboard.html", {
    waitUntil: "networkidle0",
  });
  const salir = await page.evaluateHandle(() =>
    [...document.querySelectorAll("#menu-principal button")].find((b) =>
      b.textContent.includes("Cerrar"),
    ),
  );
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    salir.click(),
  ]);
  ok("cerrar sesion vuelve al login", ruta() === "/index.html", ruta());
  ok(
    "cerrar sesion limpia localStorage",
    (await page.evaluate(() => localStorage.length)) === 0,
  );

  await page.type("#usuario", "arbitro");
  await page.type("#password", "arbitro123");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click("button[type=submit]"),
  ]);
  const linksArb = await page.$$eval("#menu-principal a", (as) =>
    as.map((a) => a.textContent.trim()),
  );
  ok(
    "arbitro no ve Usuarios en el menu",
    !linksArb.includes("Usuarios"),
    JSON.stringify(linksArb),
  );
  await page.goto(BASE + "admin/usuarios.html", { waitUntil: "networkidle0" });
  ok(
    "arbitro en admin/usuarios redirige al dashboard",
    ruta() === "/usuario/dashboard.html",
    ruta(),
  );

  await navegador.close();
  console.log(resultados.join("\n"));
  console.log(
    "\nERRORES/AVISOS DE CONSOLA:",
    errores.length ? "\n" + [...new Set(errores)].join("\n") : "ninguno",
  );
})().catch((e) => {
  console.log(resultados.join("\n"));
  console.error("SCRIPT FALLO:", e);
  process.exit(1);
});
```

_Claude ejecutó en la terminal (Run the browser test against the current (pre-cleanup) project):_

```bash
node probar.js
```

Todo funciona. El único error de consola es que el navegador pide un `favicon.ico` que no existe. Ahora hago la limpieza.

_Claude creó o reemplazó el archivo `C:\Users\carlo\Documents\Futbol-desarrollo\index.html` con este contenido:_

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sistema de Acta Digital Arbitral</title>
    <link rel="icon" href="data:," />
    <link rel="stylesheet" href="login/login.css" />
  </head>
  <body>
    <header>
      <h1>Sistema de Acta Digital Arbitral</h1>
    </header>

    <main>
      <section id="login">
        <h2>Acceso al Sistema</h2>
        <form id="formLogin">
          <div>
            <label for="usuario">Usuario</label>
            <input type="text" id="usuario" placeholder="Tu usuario" />
          </div>
          <div>
            <label for="password">Contraseña</label>
            <input type="password" id="password" placeholder="Tu contraseña" />
          </div>
          <div>
            <button type="submit">Entrar</button>
          </div>
          <p id="mensaje"></p>
        </form>
      </section>
    </main>

    <script src="login/login.js"></script>
  </body>
</html>
```

_Claude creó o reemplazó el archivo `C:\Users\carlo\Documents\Futbol-desarrollo\login\login.css` con este contenido:_

```css
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #eeeeee;
  margin: 0;
  color: #222;
}

header {
  background-color: #1e09df;
  color: white;
  padding: 15px 25px;
  border-bottom: 4px solid rgb(223, 66, 215);
}

header h1 {
  margin: 0;
  font-size: 22px;
}

button:focus-visible {
  outline: 3px solid #111;
  outline-offset: 2px;
}

main {
  width: 80%;
  max-width: 800px;
  margin: 20px auto;
}

section {
  background-color: rgb(247, 127, 203);
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #cccccc;
}

h2 {
  color: #4d1dde;
  border-bottom: 2px solid rgb(161, 23, 192);
  padding-bottom: 5px;
}

label {
  display: block;
  margin-top: 15px;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #1724d5;
  font-family: Arial, sans-serif;
}

input:focus {
  outline: 2px solid #111;
}

button {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #1d4ed8;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #a21caf;
}
```

_Claude ejecutó en la terminal (Clean blank lines, fix stale comments, add favicon tag and delete leftovers):_

```bash
cd /c/Users/carlo/Documents/Futbol-desarrollo && python - <<'EOF'
import pathlib, re
p = pathlib.Path("admin/registro-arbitros.js")
s = p.read_text(encoding="utf-8")
s = re.sub(r"^[ \t]+$", "", s, flags=re.M)
s = s.lstrip("\n")
s = s.replace('document.addEventListener("alpine:init", () => {\n\n  const formVacio', 'document.addEventListener("alpine:init", () => {\n  const formVacio')
s = s.replace('Alpine.data("registroArbitros", () => ({\n\n    form:', 'Alpine.data("registroArbitros", () => ({\n    form:')
s = s.replace('errores: formVacio(),\n\n\n    categorias', 'errores: formVacio(),\n\n    categorias')
s = s.replace('siguienteId: 2,\n\n\n    validar', 'siguienteId: 2,\n\n    validar')
p.write_text(s, encoding="utf-8", newline="\n")

c = pathlib.Path("comun/componentes.js")
t = c.read_text(encoding="utf-8")
a = " * Este archivo se carga ANTES que Alpine (ver index.html). Por eso no usamos"
b = " * Cada componente vive una sola vez en index.html y escucha eventos en"
assert a in t and b in t
t = t.replace(a, " * Este archivo se carga ANTES que Alpine (ver admin/usuarios.html). Por eso no usamos")
t = t.replace(b, " * Cada componente vive una sola vez en la pagina que lo usa y escucha eventos en")
c.write_text(t, encoding="utf-8", newline="\n")

for f in ["usuario/dashboard.html", "usuario/partidos.html", "usuario/perfil.html", "admin/usuarios.html"]:
    h = pathlib.Path(f); x = h.read_text(encoding="utf-8")
    m = re.search(r"  <title>.*</title>\n", x)
    x = x[:m.end()] + '  <link rel="icon" href="data:,">\n' + x[m.end():]
    h.write_text(x, encoding="utf-8", newline="")
print("ok")
EOF
git rm -q src/main.js src/style.css public/favicon.svg public/icons.svg && rmdir src 2>/dev/null; sed -n 1,35p admin/registro-arbitros.js; grep -rn 'favicon\|icons.svg\|src/main\|src/style' --include=*.html --include=*.js --include=*.json --include=*.md . | grep -v node_modules | grep -v '^./ia/'
```

Ahora reviso cada archivo buscando restos: líneas en blanco con espacios, líneas vacías repetidas, clases CSS que nadie usa y funciones que nadie llama.

_Claude ejecutó en la terminal (Scan all files for blank-line junk, unused CSS classes and unused functions):_

```bash
cd /c/Users/carlo/Documents/Futbol-desarrollo && python - <<'EOF'
import re, pathlib
archivos = ["index.html","login/login.js","login/login.css","comun/api.js","comun/sesion.js","comun/menu.js","comun/componentes.js","usuario/dashboard.html","usuario/dashboard.js","usuario/partidos.html","usuario/perfil.html","admin/usuarios.html","admin/registro-arbitros.js","admin/registro-arbitros.css"]
html = "".join(pathlib.Path(f).read_text(encoding="utf-8") for f in archivos if f.endswith((".html",".js")))
for f in archivos:
    s = pathlib.Path(f).read_text(encoding="utf-8")
    for i, l in enumerate(s.splitlines(), 1):
        if l.strip()=="" and l!="": print(f"{f}:{i} linea con solo espacios")
        if l != l.rstrip(): print(f"{f}:{i} espacios al final")
    for m in re.finditer(r"\n\n\n+", s): print(f"{f}:{s[:m.start()].count(chr(10))+2} lineas vacias repetidas")
    if not s.endswith("\n"): print(f"{f}: no termina en salto de linea")
for css in ["login/login.css","admin/registro-arbitros.css"]:
    s = pathlib.Path(css).read_text(encoding="utf-8")
    for clase in sorted(set(re.findall(r"\.([a-zA-Z][\w-]*)", re.sub(r"\{[^}]*\}", "{}", s)))):
        if clase not in html: print(f"{css}: clase sin uso .{clase}")
js = {f: pathlib.Path(f).read_text(encoding="utf-8") for f in archivos if f.endswith(".js")}
for f, s in js.items():
    for n in re.findall(r"(?:function\s+(\w+)|^\s{4}(\w+)\s*\([^)]*\)\s*\{|const\s+(\w+)\s*=)", s, flags=re.M):
        nombre = next(x for x in n if x)
        usos = len(re.findall(r"\b%s\b" % nombre, html))
        if usos < 2: print(f"{f}: '{nombre}' se define pero no se usa")
EOF
```

_Claude ejecutó en la terminal (Check Vite's Node requirement and mock users):_

```bash
printf '\n' >> comun/api.js && grep -o '"node": "[^"]*"' node_modules/vite/package.json; grep -n '"usuario"\|"rol"' public/mocks/usuarios.json | head -6; git log --format='%an' | sort -u
```

_Claude creó o reemplazó el archivo `C:\Users\carlo\Documents\Futbol-desarrollo\README.md` con este contenido:_

````markdown
# Sistema de Acta Digital Arbitral

Aplicación web para que los **árbitros de fútbol registren lo que ocurre en un partido** y para que el administrador gestione a los árbitros. Reemplaza la libreta tradicional del árbitro por una herramienta digital sencilla.

Es la Entrega 2 de Desarrollo Web y Móvil (CIT2008, UDP): frontend con datos simulados (mocks) detrás de una capa de servicios que imita una API REST y que en la Entrega 3 se reemplazará por el backend real.

**Integrantes:**

- Carlos Benavides (@CBenavidesP)
- Roberto Sánchez
- Josefa Solís (@josefasolis1-hue)

---

## Tecnologías

| Tecnología                                | Uso                                                                             | Cómo se incluye                     |
| ----------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------- |
| HTML, CSS y JavaScript                    | Base del proyecto                                                               | Archivos del repositorio            |
| [Alpine.js 3.14.9](https://alpinejs.dev)  | Interactividad: `x-data`, `x-show`, `x-for`, `x-model`, `@click`, `Alpine.data` | CDN (jsDelivr)                      |
| [Tailwind CSS 4](https://tailwindcss.com) | Estilos de las vistas internas con clases utilitarias y prefijos responsivos    | CDN (`@tailwindcss/browser@4.1.13`) |
| [Vite 8](https://vite.dev)                | Servidor local de desarrollo                                                    | npm (`devDependencies`)             |

La pantalla de login usa su propio archivo de estilos (`login/login.css`).

## Requisitos

- **Node.js 20.19 o superior** (o 22.12+). Comprobar con `node -v`.
- npm (viene con Node).
- Un navegador moderno (Chrome, Firefox, Edge o Safari actualizados).

> **Importante:** la aplicación carga los mocks con `fetch`, así que **no funciona abriendo `index.html` con doble clic** (`file://`). Siempre hay que levantarla con un servidor local.

## Instalación y ejecución

```bash
git clone https://github.com/waterloozz/Futbol-desarrollo.git
cd Futbol-desarrollo
npm install
npm run dev
```

Abrir la URL que muestra la terminal (por defecto **http://localhost:5173**).

También funciona con la extensión **Live Server** de VS Code: clic derecho en `index.html` → **Open with Live Server**.

## Credenciales de prueba

| Rol           | Usuario   | Contraseña   |
| ------------- | --------- | ------------ |
| Administrador | `admin`   | `admin123`   |
| Árbitro       | `arbitro` | `arbitro123` |

- **Árbitro:** ve el inicio con el resumen del torneo, partidos y perfil.
- **Administrador:** además entra a **Usuarios**, donde registra y elimina árbitros.

## Vistas

| Vista                           | Archivo                  | Cómo llegar                          | Acceso             |
| ------------------------------- | ------------------------ | ------------------------------------ | ------------------ |
| Iniciar sesión                  | `index.html`             | Al abrir la aplicación               | Pública            |
| Inicio (resumen del torneo)     | `usuario/dashboard.html` | Al iniciar sesión, o menú **Inicio** | Con sesión         |
| Partidos                        | `usuario/partidos.html`  | Menú **Partidos**                    | Con sesión         |
| Perfil                          | `usuario/perfil.html`    | Menú **Perfil**                      | Con sesión         |
| Usuarios (registro de árbitros) | `admin/usuarios.html`    | Menú **Usuarios**                    | Solo administrador |

Sin sesión, cualquier vista interna redirige al login. Un árbitro que intenta entrar a **Usuarios** vuelve al inicio. **Cerrar sesión** (en el menú) limpia los datos guardados y vuelve al login.

## Funcionalidades

- **Sesión simulada:** el login guarda el rol en `localStorage` y las vistas internas lo revisan antes de mostrarse.
- **Menú común** en todas las vistas internas: marca la vista actual, muestra **Usuarios** solo al administrador y se convierte en menú hamburguesa en móvil.
- **Inicio:** totales del torneo, próximos partidos y últimos resultados, con estados de _cargando_ (skeleton), _vacío_ y _error con botón Reintentar_.
- **Registro de árbitros (administrador):** formulario con validación por campo (nombre, RUT con guion, email, teléfono y categoría), modal de confirmación antes de guardar y de eliminar, tabla que se actualiza al instante y notificaciones (toasts) de éxito o error.
- **Componentes de interfaz:** modal de confirmación, notificaciones (toasts) y menú desplegable.

---

## Capa de datos (mocks como API)

Todo el acceso a datos está en `comun/api.js`. Las vistas no leen los JSON directamente: llaman a funciones de esta capa.

- Las funciones son **asíncronas** y esperan **400 ms** antes de responder, para imitar la latencia de red.
- Leen los archivos de `public/mocks/`. Los cambios en partidos (crear, editar, eliminar) se guardan en `localStorage` y se mantienen al recargar.
- Responden con `{ ok: true, datos }` si todo sale bien, o `{ ok: false, error }` con un mensaje para mostrar en pantalla.

### Endpoints simulados

| Función                        | Método | Ruta equivalente    | Fuente de datos                   | Descripción                                     |
| ------------------------------ | ------ | ------------------- | --------------------------------- | ----------------------------------------------- |
| `obtenerResumen(usuario)`      | GET    | `/api/resumen`      | `partidos.json` + `usuarios.json` | Totales, próximos partidos y últimos resultados |
| `obtenerPartidos()`            | GET    | `/api/partidos`     | `partidos.json` / `localStorage`  | Lista de partidos                               |
| `crearPartido(nuevoPartido)`   | POST   | `/api/partidos`     | `localStorage`                    | Crea un partido y lo devuelve con su `id`       |
| `actualizarPartido(id, datos)` | PUT    | `/api/partidos/:id` | `localStorage`                    | Actualiza un partido, o error si no existe      |
| `eliminarPartido(id)`          | DELETE | `/api/partidos/:id` | `localStorage`                    | Elimina un partido y devuelve su `id`           |

### Datos (`public/mocks/`)

| Archivo         | Registros | Contenido                                                                                       |
| --------------- | --------- | ----------------------------------------------------------------------------------------------- |
| `partidos.json` | 12        | Fecha, hora, equipos, goles, tarjetas, estado, cancha, árbitro, acontecimientos y observaciones |
| `usuarios.json` | 10        | Usuarios con nombre, email y rol (administrador o árbitro)                                      |
| `equipos.json`  | 10        | Nombre, iniciales, ciudad y estadio de cada equipo                                              |

---

## Estructura del proyecto

```
Futbol-desarrollo/
├── index.html                 Login (página de entrada)
├── login/
│   ├── login.js               Validación de credenciales y guardado de la sesión
│   └── login.css              Estilos del login
├── comun/                     Lo que usan todas las vistas internas
│   ├── api.js                 Capa de datos (mocks como API)
│   ├── sesion.js              Protección de rutas por sesión y rol
│   ├── menu.js                Menú común con control por rol
│   └── componentes.js         Notificaciones (toasts) y modal de confirmación
├── usuario/                   Vistas del árbitro (y del administrador)
│   ├── dashboard.html         Inicio con el resumen del torneo
│   ├── dashboard.js
│   ├── partidos.html
│   └── perfil.html
├── admin/                     Vistas solo para el administrador
│   ├── usuarios.html          Registro de árbitros
│   ├── registro-arbitros.js
│   └── registro-arbitros.css  Estilos de toasts y modal
├── public/
│   └── mocks/                 Un JSON por recurso
├── ia/
│   └── README.md              Índice de uso de IA
└── package.json
```

---

## Uso de IA

Ver el índice en [`ia/README.md`](ia/README.md).

---

## Estado del proyecto

En desarrollo.
````

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\README.md`. Texto que reemplazó:_

```markdown
| Partidos | `usuario/partidos.html` | Menú **Partidos** | Con sesión |
| Perfil | `usuario/perfil.html` | Menú **Perfil** | Con sesión |
```

_Texto nuevo:_

```markdown
| Partidos (en construcción) | `usuario/partidos.html` | Menú **Partidos** | Con sesión |
| Perfil (en construcción) | `usuario/perfil.html` | Menú **Perfil** | Con sesión |
```

_Claude ejecutó en la terminal (Re-run the full browser test after the cleanup):_

```bash
cd /c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador && curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5179/ && node probar.js
```

Las 25 pruebas pasan y la consola quedó sin errores. Hago la última revisión de rutas y apago el servidor de prueba.

_Claude ejecutó en la terminal (Recheck all file references and list pending changes):_

```bash
cd /c/Users/carlo/Documents/Futbol-desarrollo && python - <<'EOF'
import re, pathlib, posixpath
raiz = pathlib.Path('.').resolve()
real = {p.relative_to(raiz).as_posix() for p in raiz.rglob('*') if p.is_file() and '.git' not in p.parts and 'node_modules' not in p.parts}
mal = 0; total = 0
for f in sorted(x for x in real if x.endswith(('.html', '.md')) and not x.startswith('ia/2')):
    s = (raiz/f).read_text(encoding='utf-8')
    for ref in re.findall(r'(?:src|href)="([^"#:]+)"|\]\(([^)#:]+)\)', s):
        ref = ref[0] or ref[1]
        if ref.startswith(('http', 'data:')): continue
        total += 1
        dest = posixpath.normpath(posixpath.join(posixpath.dirname(f), ref))
        if dest not in real: mal += 1; print('FALTA', f, ref)
print('rutas revisadas:', total, 'problemas:', mal)
EOF
git status --short | cat
```

_Claude ejecutó en la terminal (Stop the Vite test server):_

```powershell
$c = Get-NetTCPConnection -LocalPort 5179 -State Listen -ErrorAction SilentlyContinue; if ($c) { Stop-Process -Id $c.OwningProcess -Confirm:$false; "detenido $($c.OwningProcess)" } else { "no habia servidor" }
```

Listo: actualicé el README, borré los archivos vacíos y el código muerto, y revisé el proyecto archivo por archivo. Lo probé en un navegador y todo funciona. Todavía no hice commit.

##### README

Lo armé con las mismas secciones que el del profe y lo que pide la sección 8 del PDF:

- Integrantes, tecnologías y cómo se incluyen.
- Requisitos.
- Instalación con `npm install` y `npm run dev`. Lo probé desde cero y funciona.
- Credenciales de prueba y tabla de vistas.
- Funcionalidades, capa de datos y tabla de endpoints.
- Estructura de carpetas y enlace a `ia/README.md`.

El README antiguo decía que se podía abrir `index.html` con doble clic. **Eso no funciona** (por `fetch` a los mocks), así que lo saqué.

**No sé el usuario de GitHub de Roberto**: puse solo su nombre. Si me lo dices, lo agrego.

##### Lo que eliminé

- **`src/main.js` y `src/style.css`:** estaban vacíos, eran sobras de la plantilla de Vite.
- **`public/favicon.svg` y `public/icons.svg`:** eran el logo y los íconos de la plantilla de Vite, y ninguna página los usaba.
- **En `index.html`:**
  - El menú con enlaces a secciones internas.
  - El formulario "Programación de Partido": su botón no hacía nada.
  - El "Acta Digital" con datos escritos a mano, que el PDF prohíbe.
  - El modal, los toasts, Alpine y `api.js`, que el login no usaba.
  - Ahora es solo el login. Le agregué `meta viewport` para que se vea bien en móvil.
- **`login/login.css`:** quité los estilos de todo lo anterior y dejé solo los del login.
- **`admin/registro-arbitros.js`:** quité líneas en blanco sobrantes y líneas con solo espacios.
- **`comun/componentes.js`:** arreglé dos comentarios que decían que vivía en `index.html`.
- **Las 5 páginas:** agregué `<link rel="icon" href="data:,">`. Así el navegador no busca un `favicon.ico` que no existe. Ese era el único error que aparecía en la consola.

**No borré** `crearPartido`, `actualizarPartido` ni `eliminarPartido` de `api.js`. Todavía nadie las usa, pero son la capa de datos que va a ocupar la página de Partidos, que está en construcción y documentada en el README.

##### Revisión

- **Archivo por archivo:** sin líneas basura, sin clases CSS sin uso y todas las rutas existen con el nombre exacto.
- **En el navegador (Edge automatizado), 25 pruebas, todas bien:**
  - Login correcto e incorrecto.
  - Redirección sin sesión.
  - Dashboard con datos.
  - Los 4 enlaces del menú y la página actual marcada.
  - Errores del formulario, modal, agregar y eliminar árbitro, toast.
  - Menú hamburguesa y sin scroll horizontal a 375 px.
  - Cerrar sesión.
  - El árbitro no ve ni puede entrar a Usuarios.
- **Consola:** sin errores ni avisos.

##### Lo que sigue pendiente

1. **`ia/README.md` enlaza un archivo que no existe** (`2026-11-02_cbenavidesp_rut-y-eliminar-arbitros.md`). No toqué `ia/`, como pediste. Dime si lo regenero o si quito esa fila.
2. **Faltan cosas de la rúbrica.** Son trabajo del equipo y no las cambié:
   - Las respuestas de `api.js` no traen `status`.
   - No hay forma de forzar un error.
   - Los árbitros no se guardan en `localStorage` ni pasan por `api.js`.
   - Faltan las vistas de registro, detalle y "no encontrado".
   - Faltan búsqueda, filtro y orden en algún listado.
   - El login no usa Tailwind ni Alpine como el resto.

Para subirlo:

```
git add -A
git commit -m "Ordena archivos por seccion, limpia codigo sin uso y actualiza README"
git push origin main
```

Recuerda que `git add -A` también sube la carpeta `ia/`. Avisa a tus compañeros antes del push, porque se movieron sus archivos.

## Qué se incorporó al proyecto

- La estructura por carpetas que elegí: `login/`, `comun/`, `usuario/` y `admin/`, con `index.html` en la raíz. Los archivos se movieron con `git mv` para no perder su historial.
- Todas las rutas actualizadas: scripts y estilos con `../comun/...`, enlaces del menú, redirecciones de la sesión y del login, y la ruta a los mocks en `api.js` calculada desde la ubicación del archivo (`API_BASE`).
- `index.html` quedó solo con el login: se quitaron el formulario de partido (su botón no hacía nada), el acta con datos escritos a mano y lo que el login no usaba. Se agregó `meta viewport`, y `<link rel="icon" href="data:,">` en todas las páginas para evitar el error 404 del favicon.
- Se borraron archivos vacíos o sobrantes de la plantilla de Vite y los estilos sin uso de `login.css`.
- README nuevo con lo que pide la sección 8 del PDF.
- Se quitó del índice de `ia/` una fila que apuntaba a un archivo que yo había borrado.
- No se borraron `crearPartido`, `actualizarPartido` ni `eliminarPartido` de `api.js`, porque las iba a usar la página de Partidos.

## Verificación

- Se revisó que cada archivo referenciado existiera con el nombre exacto (la revisión es en Linux).
- Se probó en el navegador (Edge automatizado) con Vite: login correcto e incorrecto, redirección sin sesión, dashboard con datos, los 4 enlaces del menú, roles, formulario de árbitros con modal y toasts, menú hamburguesa, 375 px sin scroll horizontal y cerrar sesión: 25 de 25 pruebas bien y consola sin errores.
- Probé yo mismo con `npm run dev` antes de subirlo.
- Entiendo que las rutas relativas se calculan desde la página que está abierta y que `../` sube una carpeta.

## Conclusión: lo que aprendí

Aprendí que mover archivos de carpeta rompe todas las rutas relativas, y que hay que revisar no solo los `<script>` y `<link>`, sino también los enlaces del menú y las redirecciones que se escriben en JavaScript. Entendí que esas rutas se calculan desde la página que está abierta y no desde el archivo JS, por eso `login.js` redirige sin `../` y `sesion.js` con `../`. También aprendí a usar `git mv` para que Git registre los archivos como movidos, y que un README tiene que permitir levantar el proyecto siguiendo solo sus instrucciones (por ejemplo, que no funciona abriendo el HTML con doble clic por el `fetch` a los mocks).
