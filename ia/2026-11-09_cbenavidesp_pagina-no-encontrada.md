# Página de no encontrado (404)

- **Fecha:** 2026-11-09
- **Integrante:** Carlos Benavides (@CBenavidesP)
- **Herramienta y modelo:** Claude Code (Claude Opus 5.5)
- **Enlace a la conversación:** no aplica (Claude Code no permite compartir la conversación; el texto completo va abajo)
- **Archivos afectados:** 404.html (archivo nuevo, completo); vite.config.js (archivo nuevo, completo). El código se subió en el commit 1412fc5 y este registro en un commit aparte, porque se me olvidó incluirlo.

## Objetivo

La sección 4.1 del PDF pide un mensaje o página para contenido no encontrado, y era una de las tareas que no tenían dueño en el equipo. Con `npm run dev`, Vite mostraba el login en cualquier dirección que no existía, así que no se notaba el error, y en AWS Nginx mostraba su página genérica. Quería una página 404 con el mismo diseño que el resto del proyecto.

## Conversación (texto completo, sin editar)

Después del Prompt 3 pregunté para qué servía configurar Nginx en AWS y si era necesario para la Entrega 3; esas respuestas también van abajo. La pregunta sobre la Entrega 3 se envió dos veces porque la primera tenía un error de tipeo y no tuvo respuesta; aquí va la segunda.

### Prompt 1

```text
si, explicame. Despues que terminemos todo hay que actualizar el readme y adicionalmente agregar las cosas para la carpeta de estudio
```

### Respuesta 1

Anotado: al final actualizamos el README y agregamos a la carpeta de estudio todo lo nuevo (validación en tiempo real, árbitros en `api.js`, login con email y lo que hagamos ahora).

##### Página de "no encontrado"

###### Qué pide el PDF
La sección 4.1 pide *"Estados vacíos y un mensaje o página para contenido no encontrado"*. Los estados vacíos ya los tienen Partidos y Árbitros. Lo que falta es la página para cuando alguien abre una dirección que no existe, por ejemplo `/usuario/estadisticas.html`.

###### Qué pasa hoy
| Dónde | Qué se ve si la dirección no existe |
|---|---|
| **Vite** (`npm run dev`, donde revisa el profe) | **El login**, porque Vite muestra `index.html` para cualquier dirección que no encuentra. No parece un error, parece que la página "funciona". |
| **AWS (Nginx)** | La página de error genérica de Nginx: fondo blanco y "404 Not Found". |

###### Cómo lo haría

**1. Un archivo nuevo `404.html` en la raíz**
- Con el mismo diseño de las páginas internas: Tailwind, fondo gris y tarjeta blanca.
- Un título "Página no encontrada", un mensaje corto y un botón **"Volver al inicio"**.
- **El botón va a un lugar distinto según la sesión:** con la sesión iniciada lleva al dashboard, y sin sesión lleva al login. Lo decide un pequeño `x-data` que lee `localStorage.getItem("rol")`.
- **Los enlaces usan rutas que empiezan con `/`** (por ejemplo `/index.html`), no `../`. Esta página puede aparecer en cualquier carpeta (`/usuario/algo`, `/admin/algo`), y una ruta relativa se rompería según dónde aparezca.
- No lleva el menú común, porque quien llega puede no tener sesión.

**2. Un archivo nuevo `vite.config.js` en la raíz, para que Vite lo muestre**
- `appType: "mpa"` le dice a Vite que el proyecto tiene **varias páginas**, y que no debe mandar todo a `index.html`.
- Un plugin corto, de unas 15 líneas, que, si la dirección pedida no existe, responde con `404.html` y el código 404.
- Sin esto, el profe nunca vería la página, porque revisa con `npm run dev`.

**3. Configurar Nginx en AWS** (lo harías tú con SSH)
- Agregar `error_page 404 /404.html;` en la configuración de Nginx y reiniciarlo. Te daría los comandos exactos.
- Es opcional: lo que se evalúa es lo que se ve con el README.

**4. README:** agregar la página en la tabla de vistas, con un ejemplo de cómo llegar (escribir una dirección que no existe).

###### Lo que necesito que decidas
1. **El diseño:** ¿Tailwind, como las páginas internas (recomendado), o el CSS del login?
2. **El botón según la sesión:** ¿te parece bien?
3. **`vite.config.js` con el plugin:** ¿lo hacemos? Es un archivo nuevo en la raíz y no toca nada de tus compañeros. Sin él, en Vite la página no se ve.
4. **Nginx en AWS:** ¿lo configuramos también?

Cuando decidas, te muestro el código exacto antes de crear los archivos. Después te explico las otras dos tareas sin dueño: el registro de cuenta y Perfil a través de `api.js`.

### Prompt 2

```text
1. El diseño con tailwind ; 2. me parece bien ; 3. Hagamoslo ; 4. tambien configuremoslo
```

### Respuesta 2

Antes de mostrarte el código, pruebo que funcione en una **carpeta temporal mía**, sin tocar tu proyecto. Así no te propongo algo que no sirva.

*Claude creó o reemplazó el archivo `C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\prueba404\404.html` con este contenido:*

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Página no encontrada · Acta Digital Arbitral</title>
  <link rel="icon" href="data:,">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.13"></script>
  <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js" defer></script>
</head>
<body class="flex min-h-screen flex-col bg-slate-100 text-slate-800">

  <header class="bg-blue-800 text-white shadow">
    <div class="mx-auto max-w-5xl px-4 py-3">
      <p class="py-2 text-lg font-bold">Acta Digital Arbitral</p>
    </div>
  </header>

  <main class="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-10">
    <section aria-labelledby="titulo-404" class="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-sm"
      x-data="{ conSesion: localStorage.getItem('rol') !== null }">
      <p class="text-5xl font-bold text-blue-700">404</p>
      <h1 id="titulo-404" class="mt-3 text-2xl font-semibold">Página no encontrada</h1>
      <p class="mt-2 text-slate-600">La dirección que abriste no existe o fue movida.</p>
      <a :href="conSesion ? '/usuario/dashboard.html' : '/index.html'" href="/index.html"
        x-text="conSesion ? 'Volver al inicio' : 'Ir al login'"
        class="mt-6 inline-block rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Volver al inicio</a>
    </section>
  </main>

  <footer class="bg-slate-800 py-4 text-center text-sm text-slate-300">
    <p>Sistema de Acta Digital Arbitral</p>
  </footer>

</body>
</html>
```

*Claude creó o reemplazó el archivo `C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\prueba404\vite.config.js` con este contenido:*

```js
import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";

function paginaNoEncontrada() {
  return {
    name: "pagina-no-encontrada",
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          const ruta = decodeURIComponent(req.url.split("?")[0]);
          const archivo = path.join(server.config.root, ruta);
          const pideHtml = (req.headers.accept || "").includes("text/html");
          if (!pideHtml || fs.existsSync(archivo)) return next();
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(fs.readFileSync(path.join(server.config.root, "404.html")));
        });
      };
    },
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [paginaNoEncontrada()],
});
```

*Claude ejecutó en la terminal (Make a temporary copy of the project with the two new files):*

```bash
S=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/prueba404; rm -rf $S/proyecto && mkdir -p $S/proyecto && cd /c/Users/carlo/Documents/Futbol-desarrollo && git archive HEAD | tar -x -C $S/proyecto && cp $S/404.html $S/vite.config.js $S/proyecto/ && ls $S/proyecto
```

*Claude ejecutó en la terminal (Link the copy to the project's installed packages):*

```powershell
New-Item -ItemType Junction -Path "C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\prueba404\proyecto\node_modules" -Target "C:\Users\carlo\Documents\Futbol-desarrollo\node_modules" | Out-Null; "enlace creado"
```

*Claude ejecutó en la terminal (Start Vite on the copy and check which URLs return the 404 page):*

```bash
S=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/prueba404/proyecto; cd $S && (./node_modules/.bin/vite --host 127.0.0.1 --port 5181 --strictPort > ../vite.log 2>&1 &); sleep 5; H='Accept: text/html'; for u in / /index.html /usuario/dashboard.html /admin/usuarios.html /no-existe.html /usuario/estadisticas /admin/nada.html "/usuario/dashboard.html?x=1"; do printf '%s  %s  %s\n' "$(curl -s -o /tmp/r.html -w '%{http_code}' -H "$H" "http://127.0.0.1:5181$u")" "$(grep -c 'Página no encontrada' /tmp/r.html)" "$u"; done; echo "--- archivos que no son HTML:"; for u in /public/mocks/usuarios.json /comun/api.js /public/mocks/nada.json; do printf '%s  %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:5181$u")" "$u"; done; cat ../vite.log | tail -3
```

*Claude ejecutó en la terminal (Test the 404 button with and without session and rerun suites on the copy):*

```bash
N=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador; cd $N && node -e '
const p=require("puppeteer-core");(async()=>{const b=await p.launch({executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true});const pg=await b.newPage();const err=[];pg.on("pageerror",e=>err.push(e.message));pg.on("console",m=>{if(m.type()==="error")err.push(m.text())});
await pg.goto("http://127.0.0.1:5181/usuario/no-existe.html",{waitUntil:"networkidle0"});
const sin=await pg.$eval("main a",a=>[a.textContent,a.getAttribute("href")]);console.log("sin sesion:",sin);
await pg.evaluate(()=>localStorage.setItem("rol","arbitro"));await pg.reload({waitUntil:"networkidle0"});
const con=await pg.$eval("main a",a=>[a.textContent,a.getAttribute("href")]);console.log("con sesion:",con);
await Promise.all([pg.waitForNavigation({waitUntil:"networkidle0"}),pg.click("main a")]);console.log("al hacer clic va a:",new URL(pg.url()).pathname);
await pg.setViewport({width:375,height:800});await pg.goto("http://127.0.0.1:5181/admin/x",{waitUntil:"networkidle0"});console.log("375px scroll extra:",await pg.evaluate(()=>document.documentElement.scrollWidth-innerWidth), "| titulo:", await pg.title());
console.log("consola:",err.filter(e=>!e.includes("404")).length?err:"solo el 404 esperado de la pagina");await b.close()})()'; for t in probar.js probar-acceso.js probar-login.js; do BASE=http://127.0.0.1:5181/ node $t > r.txt 2>&1; grep '^FALLA\|FALLO\|pageerror' r.txt; echo "  $t: $(grep -c '^OK' r.txt) OK de $(grep -c '^OK\|^FALLA' r.txt)"; done
```

Todo funciona en la copia de prueba. Apago el servidor y quito el enlace temporal a tus paquetes. Uso un comando que borra **solo el enlace**, no los paquetes de tu proyecto.

*Claude ejecutó en la terminal (Stop the test server and remove only the temporary link):*

```powershell
$c = Get-NetTCPConnection -LocalPort 5181 -State Listen -ErrorAction SilentlyContinue; if ($c) { Stop-Process -Id ($c.OwningProcess | Select-Object -First 1) -Confirm:$false; "servidor detenido" }; $j = "C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\prueba404\proyecto\node_modules"; if ((Get-Item $j).Attributes -band [IO.FileAttributes]::ReparsePoint) { cmd /c rmdir "$j"; "enlace quitado" }; "paquetes del proyecto siguen: " + (Test-Path "C:\Users\carlo\Documents\Futbol-desarrollo\node_modules\vite\package.json")
```

Probé todo en una copia temporal y funciona. **En tu proyecto todavía no creé nada.** Este es el código exacto que pondría.

##### 1. `404.html` (nuevo, en la raíz del proyecto)
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Página no encontrada · Acta Digital Arbitral</title>
  <link rel="icon" href="data:,">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.13"></script>
  <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js" defer></script>
</head>
<body class="flex min-h-screen flex-col bg-slate-100 text-slate-800">

  <header class="bg-blue-800 text-white shadow">
    <div class="mx-auto max-w-5xl px-4 py-3">
      <p class="py-2 text-lg font-bold">Acta Digital Arbitral</p>
    </div>
  </header>

  <main class="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-10">
    <section aria-labelledby="titulo-404" class="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-sm"
      x-data="{ conSesion: localStorage.getItem('rol') !== null }">
      <p class="text-5xl font-bold text-blue-700">404</p>
      <h1 id="titulo-404" class="mt-3 text-2xl font-semibold">Página no encontrada</h1>
      <p class="mt-2 text-slate-600">La dirección que abriste no existe o fue movida.</p>
      <a :href="conSesion ? '/usuario/dashboard.html' : '/index.html'" href="/index.html"
        x-text="conSesion ? 'Volver al inicio' : 'Ir al login'"
        class="mt-6 inline-block rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Volver al inicio</a>
    </section>
  </main>

  <footer class="bg-slate-800 py-4 text-center text-sm text-slate-300">
    <p>Sistema de Acta Digital Arbitral</p>
  </footer>

</body>
</html>
```
- **Mismo diseño que las páginas internas:** la barra azul, la tarjeta blanca y el pie gris.
- **El botón según la sesión:** con sesión dice "Volver al inicio" y lleva al dashboard. Sin sesión dice "Ir al login".
- **Las rutas empiezan con `/`**, así el botón funciona aunque la página aparezca dentro de `/usuario/` o `/admin/`.

##### 2. `vite.config.js` (nuevo, en la raíz del proyecto)
```js
import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";

function paginaNoEncontrada() {
  return {
    name: "pagina-no-encontrada",
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          const ruta = decodeURIComponent(req.url.split("?")[0]);
          const archivo = path.join(server.config.root, ruta);
          const pideHtml = (req.headers.accept || "").includes("text/html");
          if (!pideHtml || fs.existsSync(archivo)) return next();
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(fs.readFileSync(path.join(server.config.root, "404.html")));
        });
      };
    },
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [paginaNoEncontrada()],
});
```
- **`appType: "mpa"`** le dice a Vite que el proyecto tiene varias páginas. Así deja de mostrar el login cuando una dirección no existe.
- **El plugin** revisa cada pedido. Solo responde con `404.html` (y el código 404) si el navegador pide una **página** que no existe. Los archivos que sí existen, y los JS o JSON, siguen igual.

##### Lo que probé en la copia temporal
| Dirección | Resultado |
|---|---|
| `/`, `/index.html`, `/usuario/dashboard.html`, `/admin/usuarios.html` | 200, como siempre |
| `/usuario/dashboard.html?x=1` | 200 |
| `/no-existe.html`, `/usuario/estadisticas`, `/admin/nada.html` | **404 con la página nueva** |
| `api.js` y los JSON de los mocks | Siguen cargando igual |

- **El botón:** sin sesión dice "Ir al login" y lleva a `/index.html`. Con sesión dice "Volver al inicio" y lleva al dashboard.
- **En celular (375 px)** no hay scroll horizontal.
- **Las pruebas anteriores** (login, árbitros y validación del login) pasan con el `vite.config.js` nuevo: 103 de 103.

Hay un detalle en la consola: al abrir la página 404, el navegador muestra *"Failed to load resource: 404"*. Es normal, es la forma en que avisa que la página respondió 404, y solo pasa cuando alguien abre una dirección que no existe. El PDF pide la consola sin errores "durante el uso normal".

##### 3. Nginx en AWS (lo haces tú por SSH)
Primero, para ver cómo está configurado:
```
ssh -i "C:\Users\carlo\Downloads\desarrollo.pem" ubuntu@184.73.139.69
grep -n "server_name\|root\|error_page\|try_files" /etc/nginx/sites-enabled/default
```
Pégame lo que salga. Así te doy el comando exacto para agregar `error_page 404 /404.html;` sin romper la configuración. Antes de cambiarla hacemos un respaldo y la revisamos con `sudo nginx -t`. Esto se hace **después** de subir los archivos a GitHub y hacer `git pull` en el servidor.

¿Creo los dos archivos en tu proyecto?

### Prompt 3

```text
si crealos
```

### Respuesta 3

*Claude ejecutó en la terminal (Check the repo, then copy the two tested files into the project):*

```bash
S=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/prueba404; cd /c/Users/carlo/Documents/Futbol-desarrollo && git fetch origin 2>&1|tail -1; git status -sb | cat; ls 404.html vite.config.js 2>&1; cp $S/404.html $S/vite.config.js . && cmp 404.html $S/404.html && cmp vite.config.js $S/vite.config.js && echo "copiados identicos a los probados"; git status --short | cat
```

Los creé, idénticos a los que probé. Ahora corro todas las pruebas **en tu proyecto real**, y reviso la 404 con Vite.

*Claude ejecutó en la terminal (Check the 404 page on Vite and run all suites on the real project):*

```bash
N=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador; cd /c/Users/carlo/Documents/Futbol-desarrollo && (./node_modules/.bin/vite --host 127.0.0.1 --port 5179 --strictPort > $N/vite.log 2>&1 &); (python -m http.server 8766 --bind 127.0.0.1 > $N/static.log 2>&1 &); sleep 5; for u in / /usuario/partidos.html /no-existe.html /usuario/estadisticas; do printf '%s %s %s\n' "$(curl -s -o /tmp/r.html -w '%{http_code}' -H 'Accept: text/html' "http://127.0.0.1:5179$u")" "$(grep -c 'Página no encontrada' /tmp/r.html)" "$u"; done; cd $N && for B in http://127.0.0.1:5179/ http://127.0.0.1:8766/; do echo "######## $B"; for t in probar.js probar-admin.js probar-tiempo-real.js probar-acceso.js probar-login.js; do BASE=$B node $t > r.txt 2>&1; grep '^FALLA\|FALLO\|pageerror\|\[error\]\|http 4' r.txt; echo "  $t: $(grep -c '^OK' r.txt) OK de $(grep -c '^OK\|^FALLA' r.txt)"; done; done
```

*Claude ejecutó en la terminal (Stop both test servers):*

```powershell
foreach ($p in 5179, 8766) { $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue; if ($c) { foreach ($id in ($c.OwningProcess | Sort-Object -Unique)) { try { Stop-Process -Id $id -Confirm:$false -ErrorAction Stop; "detenido $p" } catch { "no se pudo $p" } } } }
```

Listo. Creé los dos archivos en la raíz del proyecto, **idénticos a los que probé**: `404.html` y `vite.config.js`.

##### Pruebas en tu proyecto real
- **Con Vite:**
  - `/` y `/usuario/partidos.html` responden 200, como siempre.
  - `/no-existe.html` y `/usuario/estadisticas` responden **404 con la página nueva**.
- **Las 142 pruebas anteriores pasan**, tanto en Vite como en el servidor igual al de AWS, y la consola quedó sin errores. El `vite.config.js` nuevo no rompió nada.

No hice commit. Si quieres registro de `ia/` antes de subirlo, pídemelo como las otras veces.

##### Pasos para dejarlo arriba
**1. Subir a GitHub**, cuando tengas listo el registro de `ia/` (si lo haces):
```
git add -A
git status
git commit -m "Agrega pagina de no encontrado"
git pull --rebase origin main
git push origin main
```

**2. Actualizar AWS:**
```
ssh -i "C:\Users\carlo\Downloads\desarrollo.pem" ubuntu@184.73.139.69
cd /var/www/html
sudo git pull origin main
grep -n "server_name\|root\|error_page\|try_files" /etc/nginx/sites-enabled/default
```
Pégame lo que salga del último comando y te doy los comandos exactos para configurar Nginx, con respaldo y revisión antes de reiniciarlo.

Además, cuando actualicemos el README, hay que agregar esta página en la tabla de vistas, con un ejemplo de cómo llegar a ella.

### Prompt 4

```text
lo del nginx para que es? eso del aws
```

### Respuesta 4

En AWS, el programa que entrega las páginas es **Nginx**, no Vite. Configurarlo sirve para que **también en AWS** se vea tu página 404 nueva.

##### Qué es Nginx
Es el programa que corre en tu servidor de AWS. Cuando alguien abre `http://184.73.139.69`, Nginx busca el archivo en la carpeta `/var/www/html` y se lo entrega al navegador. Cumple el mismo papel que `npm run dev` en tu computador.

##### Por qué hay que configurarlo aparte
El `vite.config.js` que creamos **solo lo lee Vite**, cuando haces `npm run dev`. Nginx no lo usa.

| Dónde | Quién entrega las páginas | Si la dirección no existe, se ve |
|---|---|---|
| Tu computador / revisión del profe | Vite (`npm run dev`) | **Tu página 404**, gracias a `vite.config.js` |
| AWS | Nginx | Una página blanca de Nginx que dice "404 Not Found", **no la tuya** |

Para que en AWS aparezca tu página, hay que decirle a Nginx: *"cuando no encuentres algo, muestra `404.html`"*. Eso es una sola línea en su configuración:
```
error_page 404 /404.html;
```

##### ¿Es obligatorio?
**No.** El PDF dice que se revisa siguiendo el README, y el README usa `npm run dev`, donde ya funciona. Configurar Nginx solo sirve para que la versión publicada en AWS se vea igual de completa. Tú me habías dicho que sí querías configurarlo.

##### Cuánto trabajo es
Son 4 comandos dentro del servidor:
1. Respaldar la configuración.
2. Agregar la línea.
3. Revisarla con `sudo nginx -t`, que avisa si quedó algún error.
4. Recargar Nginx.

Por eso te pedí primero el resultado del `grep`: para ver cómo está escrita tu configuración y darte el comando exacto sin riesgo de romperla.

¿Lo hacemos, o lo dejas solo con Vite?

### Prompt 5

```text
pero es necesario para la entrega 3?
```

### Respuesta 5

No lo sé con certeza: solo tengo el PDF de la Entrega 2. El de la Entrega 3 no lo he visto.

Por lo que dice el PDF de la E2 sobre la E3:
- Que la capa de datos se reemplazará **por el backend y la API propios** (sección 1).
- Que la tabla de endpoints del README será **la base de la API real** (sección 5.4).

En ningún lado menciona AWS, Nginx ni dónde se publica la página.

Lo que sí es probable es que en la E3 **Nginx cambie de rol**. Hoy solo entrega archivos, pero con un backend normalmente también reenvía las peticiones de `/api/...` al servidor de Node. Si eso pasa, la configuración de Nginx se va a modificar igual, y la línea de la 404 se puede agregar ese día junto con lo demás.

**Mi recomendación:** no configurarlo ahora. Para la E2 no hace falta, porque la 404 ya funciona donde el profe revisa (`npm run dev`), y para la E3 conviene esperar a ver qué pide el PDF. Si te pasan el documento de la E3, lo reviso y te digo qué hace falta en AWS.

Por mientras, solo falta hacer `git pull` en el servidor cuando subas los cambios, para que tenga los archivos nuevos.

### Prompt 6

```text
ok entonces lo dejaremos en stand by y esperaremos a tener el pdf de la e3 antes de hacer ese cambio en el AWS
```

### Respuesta 6

*Claude creó o reemplazó el archivo `C:\Users\carlo\.claude\projects\C--Users-carlo\memory\futbol-pendientes-aws-e3.md` con este contenido:*

```markdown
---
name: futbol-pendientes-aws-e3
description: Configuración de Nginx en AWS para la página 404 de Futbol-desarrollo quedó en pausa hasta tener el PDF de la Entrega 3
metadata:
  type: project
---

El 2026-11-09 se creó `404.html` y `vite.config.js` (appType "mpa" con un plugin que sirve la 404 en `npm run dev`). En AWS (Nginx en /var/www/html, IP pública 184.73.139.69 al 2026-11-09, cambia si la instancia se reinicia; llave en C:\Users\carlo\Downloads\desarrollo.pem, usuario ubuntu) falta agregar `error_page 404 /404.html;` a la configuración de Nginx.

**Why:** el usuario decidió dejarlo en pausa hasta tener el PDF de la Entrega 3, porque con el backend Nginx probablemente se reconfigure igual (proxy a /api).

**How to apply:** cuando el usuario traiga el PDF de la E3, revisar qué pide sobre despliegue y recordar este pendiente: primero `grep -n "server_name\|root\|error_page\|try_files" /etc/nginx/sites-enabled/default`, respaldo, agregar la línea, `sudo nginx -t` y recargar. Recordar también que en AWS (http) el hash con crypto.subtle no funciona; en la E3 el hash va en el servidor. Relacionado: [[referencia-proyecto-docente-sazon]]
```

*Claude ejecutó en la terminal (Add the paused AWS task to the memory index):*

```bash
cd /c/Users/carlo/.claude/projects/C--Users-carlo/memory && printf -- '- [Pendientes AWS para la E3](futbol-pendientes-aws-e3.md) — Nginx 404 en pausa hasta tener el PDF de la Entrega 3\n' >> MEMORY.md
```

Perfecto, queda en pausa. Lo anoté en mi memoria, junto con la IP actual del servidor y los pasos. Cuando me traigas el PDF de la Entrega 3, te lo recuerdo y revisamos qué pide sobre AWS.

Lo que sigue:
1. **Subir la página 404** con el `git add / commit / push`. Si quieres, antes hago el registro de `ia/`.
2. **`git pull` en AWS**, para que el servidor tenga los archivos nuevos. Sin configurar Nginx.
3. **Las otras dos tareas sin dueño:** la vista de registro de cuenta (si el profe la exige) y Perfil a través de `api.js`.
4. **Al final:** actualizar el README, agregar lo nuevo a la carpeta de estudio y quitar los comentarios de los 5 archivos.

¿Te explico la siguiente tarea sin dueño?

## Qué se incorporó al proyecto

- `404.html` en la raíz, con Tailwind y el mismo diseño de las páginas internas (barra azul, tarjeta blanca y pie gris). El botón depende de la sesión: con sesión dice "Volver al inicio" y lleva al dashboard, sin sesión dice "Ir al login". Los enlaces usan rutas que empiezan con `/` para que funcionen aunque la página aparezca dentro de `/usuario/` o `/admin/`.
- `vite.config.js` en la raíz con `appType: "mpa"` (el proyecto tiene varias páginas) y un plugin que responde con `404.html` y el código 404 solo cuando se pide una página que no existe. Los archivos que existen, los JS y los JSON no cambian.
- No se configuró Nginx en AWS: decidí dejarlo en pausa hasta tener el PDF de la Entrega 3, porque la revisión de la Entrega 2 es con `npm run dev`, donde la página ya funciona.

## Verificación

- Primero se probó en una copia temporal del proyecto y después en el proyecto real, en el navegador (Edge automatizado).
- Las páginas que existen responden 200 (también con `?x=1` al final), y `/no-existe.html`, `/usuario/estadisticas` y `/admin/nada.html` responden 404 con la página nueva.
- Sin sesión el botón dice "Ir al login" y lleva a `/index.html`; con sesión dice "Volver al inicio" y lleva al dashboard.
- En celular (375 px) no hay scroll horizontal.
- Las 142 pruebas anteriores siguen pasando con el `vite.config.js` nuevo, en Vite y en un servidor estático como Nginx.

## Conclusión: lo que aprendí

Aprendí que el servidor es el que decide qué mostrar cuando una dirección no existe: Vite, por defecto, trata el proyecto como si tuviera una sola página y devuelve el `index.html`, por eso había que decirle con `appType: "mpa"` que tenemos varias páginas. También entendí que la configuración de Vite solo sirve para `npm run dev`, y que en AWS quien entrega las páginas es Nginx, que se configura aparte. Por último, vi que en una página que puede aparecer en cualquier carpeta hay que usar rutas que empiezan con `/`, porque las rutas con `../` cambian según dónde se abra.
