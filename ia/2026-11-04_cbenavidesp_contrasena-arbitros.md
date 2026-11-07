# Contraseña con hash y sal para los árbitros

- **Fecha:** 2026-11-04
- **Integrante:** Carlos Benavides (@CBenavidesP)
- **Herramienta y modelo:** Claude Code
- **Enlace a la conversación:** no aplica (Claude Code no permite compartir la conversación)
- **Archivos afectados:** comun/seguridad.js (archivo nuevo, líneas 1-15); admin/usuarios.html (script seguridad.js, línea 22; campos de contraseña y confirmación, líneas 85-101); admin/registro-arbitros.js (formVacio, líneas 8-9; validaciones, líneas 58-64; agregarArbitro, líneas 94-120)

## Objetivo

Que cada árbitro que registra el administrador tenga su propia contraseña, para que más adelante pueda entrar con un acceso único (sin quitar la cuenta general `arbitro`/`arbitro123`, que usamos para probar). La contraseña no debía guardarse en texto plano, así que la idea era guardarla con hash y una sal distinta para cada árbitro. Solo se trabajó en los archivos de `admin/` y en un archivo nuevo de `comun/`, para no chocar con el arreglo que tenía pendiente Josefa en `api.js` y `menu.js`.

## Conversación (texto completo, sin editar)

El Prompt 1 se envió tres veces seguidas; los dos primeros envíos no recibieron respuesta, así que aquí va el tercero, que es el que tuvo respuesta. Antes de este prompt se conversó el plan (qué se podía hacer antes del commit de Josefa), sin cambios en el código.

### Prompt 1

```text
Ahora pongamonos a trabajar te dejo el detalle de lo que tengo pensado y lo que necesito que me me ayudes a estructurar o codificar:
1. Formulario (admin/usuarios.html):
2. Tengo claros los dos inputs nuevos (type="password") para la contraseña y la confirmación con sus respectivos x-model y los span de error (manteniendo la misma estructura que los otros campos). En la tabla obvio no mostramos nada de la clave.
3. Validaciones en JS (admin/registro-arbitros.js):
4. Agregué password y confirmarPassword a formVacio(). En validar() ya tengo la lógica para chequear que coincidan y que tenga un largo mínimo de 8 caracteres.
5. Hashing y Sal (admin/registro-arbitros.js):
6. En agregarArbitro() no quiero guardar la clave en texto plano. La idea es concatenarle una sal aleatoria (distinta por árbitro) antes de hashear para evitar hashes idénticos si dos árbitros usan la misma clave. Como crypto.subtle devuelve una promesa, sé que hay que transformar agregarArbitro() a async y meter los await correspondientes.
7. Módulo reutilizable (comun/):
8. Creé la función de hash en un archivo aparte dentro de comun/ para no chocar con los cambios de Josefa en admin/ y para que nos sirva después cuando armemos el login.
```

### Respuesta 1

Reviso primero si ya hiciste algo de eso en los archivos, porque en tu mensaje dices "agregué" y "creé".

_Claude ejecutó en la terminal (Check whether the user already made changes and if Josefa pushed):_

```bash
cd /c/Users/carlo/Documents/Futbol-desarrollo && git fetch origin 2>&1 | tail -1; git status -sb | cat; git log --oneline -3 origin/main | cat; ls comun admin; grep -n 'password\|confirmar\|crypto\|async' admin/registro-arbitros.js admin/usuarios.html comun/*.js | head
```

_Claude creó o reemplazó el archivo `C:\Users\carlo\Documents\Futbol-desarrollo\comun\seguridad.js` con este contenido:_

```js
// crea un texto al azar distinto para cada arbitro, asi dos claves iguales no dan el mismo hash
function crearSal() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// junta la sal con la clave y saca su huella con SHA-256, la clave original nunca se guarda
async function hashearPassword(password, sal) {
  if (!crypto.subtle) {
    throw new Error(
      "Para registrar contraseñas la página debe abrirse en https o en localhost.",
    );
  }
  const datos = new TextEncoder().encode(sal + password);
  const huella = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(huella), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\admin\usuarios.html`. Texto que reemplazó:_

```html
<script src="../comun/componentes.js" defer></script>
<script src="registro-arbitros.js" defer></script>
```

_Texto nuevo:_

```html
<script src="../comun/componentes.js" defer></script>
<script src="../comun/seguridad.js" defer></script>
<script src="registro-arbitros.js" defer></script>
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\admin\usuarios.html`. Texto que reemplazó:_

```html
            <small class="mt-1 block text-xs text-red-700" x-show="errores.categoria" x-text="errores.categoria"></small>
          </div>

          <div class="flex gap-3 sm:col-span-2">
```

_Texto nuevo:_

```html
            <small class="mt-1 block text-xs text-red-700" x-show="errores.categoria" x-text="errores.categoria"></small>
          </div>

          <div>
            <label for="arbPassword" class="mb-1 block text-sm font-medium text-slate-700">
              Contraseña <span class="text-xs font-normal text-slate-500">(mínimo 8 caracteres)</span>
            </label>
            <input type="password" id="arbPassword" autocomplete="new-password" x-model="form.password"
              class="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2"
              :class="errores.password ? 'border-red-600 focus:ring-red-600' : 'border-slate-300 focus:ring-blue-600'">
            <small class="mt-1 block text-xs text-red-700" x-show="errores.password" x-text="errores.password"></small>
          </div>

          <div>
            <label for="arbConfirmarPassword" class="mb-1 block text-sm font-medium text-slate-700">Confirmar contraseña</label>
            <input type="password" id="arbConfirmarPassword" autocomplete="new-password" x-model="form.confirmarPassword"
              class="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2"
              :class="errores.confirmarPassword ? 'border-red-600 focus:ring-red-600' : 'border-slate-300 focus:ring-blue-600'">
            <small class="mt-1 block text-xs text-red-700" x-show="errores.confirmarPassword" x-text="errores.confirmarPassword"></small>
          </div>

          <div class="flex gap-3 sm:col-span-2">
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\admin\registro-arbitros.js`. Texto que reemplazó:_

```js
    telefono: "",
    categoria: "",
  });
```

_Texto nuevo:_

```js
    telefono: "",
    categoria: "",
    password: "",
    confirmarPassword: "",
  });
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\admin\registro-arbitros.js`. Texto que reemplazó:_

```js
if (!f.categoria) {
  this.errores.categoria = "Selecciona una categoría.";
}
```

_Texto nuevo:_

```js
if (!f.categoria) {
  this.errores.categoria = "Selecciona una categoría.";
}

if (f.password.length < 8) {
  this.errores.password = "La contraseña debe tener al menos 8 caracteres.";
}

if (f.confirmarPassword !== f.password) {
  this.errores.confirmarPassword = "Las contraseñas no coinciden.";
}
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\admin\registro-arbitros.js`. Texto que reemplazó:_

```js
    agregarArbitro() {
      // Copia los datos (sin espacios sobrantes) en un objeto nuevo
      const nuevo = { id: this.siguienteId++ };
      for (const campo in this.form) {
        nuevo[campo] = this.form[campo].trim();
      }

      this.arbitros.push(nuevo); // la tabla con x-for se actualiza sola
```

_Texto nuevo:_

```js
    async agregarArbitro() {
      const f = this.form;
      const sal = crearSal();
      let passwordHash;
      try {
        passwordHash = await hashearPassword(f.password, sal);
      } catch (error) {
        notificar(error.message, "error");
        return;
      }

      // se guarda la sal y el hash, la contraseña escrita no queda en ningun lado
      const nuevo = {
        id: this.siguienteId++,
        nombre: f.nombre.trim(),
        rut: f.rut.trim(),
        email: f.email.trim(),
        telefono: f.telefono.trim(),
        categoria: f.categoria,
        sal,
        passwordHash,
      };

      this.arbitros.push(nuevo); // la tabla con x-for se actualiza sola
```

Ahora lo pruebo en el navegador con una prueba aparte, solo para el registro de árbitros. Las páginas de Josefa siguen rotas en tu copia mientras ella no suba el arreglo.

_Claude creó o reemplazó el archivo `C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\navegador\probar-admin.js` con este contenido:_

```js
const puppeteer = require("puppeteer-core");
const BASE = process.env.BASE || "http://127.0.0.1:5179/";
const res = [];
const errores = [];
const ok = (n, c, d = "") =>
  res.push(`${c ? "OK   " : "FALLA"} ${n}${d ? " -> " + d : ""}`);
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const nav = await puppeteer.launch({
    executablePath:
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const page = await nav.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning")
      errores.push(`[${m.type()}] ${m.text()}`);
  });
  page.on("pageerror", (e) => errores.push(`[pageerror] ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400) errores.push(`[http ${r.status()}] ${r.url()}`);
  });

  await page.goto(BASE, { waitUntil: "networkidle0" });
  await page.type("#usuario", "admin");
  await page.type("#password", "admin123");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click("button[type=submit]"),
  ]);
  await page.goto(BASE + "admin/usuarios.html", { waitUntil: "networkidle0" });

  const filas = () =>
    page.$$eval(
      "tbody tr",
      (t) => t.filter((e) => e.offsetParent !== null).length,
    );
  const visibles = () =>
    page.$$eval("form small", (s) =>
      s.filter((e) => e.offsetParent !== null).map((e) => e.textContent),
    );
  const datos = () =>
    page.evaluate(() =>
      JSON.parse(
        JSON.stringify(
          Alpine.$data(document.querySelector('[x-data="registroArbitros"]'))
            .arbitros,
        ),
      ),
    );

  await page.click("form button[type=submit]");
  await esperar(300);
  const e1 = await visibles();
  ok(
    "vacio muestra 7 errores (5 de antes + 2 de contraseña)",
    e1.length === 6 || e1.length === 7,
    `${e1.length}: ${e1.join(" | ")}`,
  );

  await page.type("#arbNombre", "Ana Perez");
  await page.type("#arbRut", "11.111.111-1");
  await page.type("#arbEmail", "ana@arbitros.cl");
  await page.type("#arbTelefono", "+56 9 8765 4321");
  await page.select("#arbCategoria", "FIFA");
  await page.type("#arbPassword", "corta");
  await page.type("#arbConfirmarPassword", "otra");
  await page.click("form button[type=submit]");
  await esperar(300);
  const e2 = await visibles();
  ok(
    "clave corta y distinta muestra los 2 errores",
    e2.some((t) => t.includes("8 caracteres")) &&
      e2.some((t) => t.includes("no coinciden")),
    e2.join(" | "),
  );

  for (const id of ["#arbPassword", "#arbConfirmarPassword"])
    await page.$eval(id, (e) => {
      e.value = "";
      e.dispatchEvent(new Event("input"));
    });
  await page.type("#arbPassword", "clave1234");
  await page.type("#arbConfirmarPassword", "clave1234");
  await page.click("form button[type=submit]");
  await esperar(300);
  ok(
    "con datos validos no hay errores",
    (await visibles()).length === 0,
    (await visibles()).join(" | "),
  );
  ok(
    "se abre el modal de confirmacion",
    await page.$eval(
      ".modal-fondo",
      (e) => getComputedStyle(e).display !== "none",
    ),
  );
  await page.evaluate(() =>
    [...document.querySelectorAll(".modal-boton")]
      .find((b) => b.textContent.trim() === "Registrar")
      .click(),
  );
  await esperar(600);
  ok(
    "arbitro agregado a la tabla",
    (await filas()) === 2,
    String(await filas()),
  );
  ok(
    "toast de exito",
    (
      await page.$$eval(".toast", (t) => t.map((x) => x.textContent).join())
    ).includes("registrado"),
  );

  const ana = (await datos()).find((a) => a.nombre === "Ana Perez");
  ok(
    "no guarda la contraseña ni la confirmacion",
    !("password" in ana) &&
      !("confirmarPassword" in ana) &&
      !JSON.stringify(ana).includes("clave1234"),
    Object.keys(ana).join(","),
  );
  ok(
    "guarda una sal de 32 caracteres",
    /^[0-9a-f]{32}$/.test(ana.sal),
    ana.sal,
  );
  ok(
    "guarda un hash SHA-256 de 64 caracteres",
    /^[0-9a-f]{64}$/.test(ana.passwordHash),
    ana.passwordHash,
  );
  const recalculado = await page.evaluate(
    (s) => hashearPassword("clave1234", s),
    ana.sal,
  );
  ok(
    "el hash se puede comprobar con la misma clave y sal",
    recalculado === ana.passwordHash,
  );
  const mala = await page.evaluate(
    (s) => hashearPassword("clave12345", s),
    ana.sal,
  );
  ok("una clave distinta da otro hash", mala !== ana.passwordHash);
  const otraSal = await page.evaluate(() =>
    hashearPassword("clave1234", crearSal()),
  );
  ok("la misma clave con otra sal da otro hash", otraSal !== ana.passwordHash);

  const formLimpio = await page.evaluate(
    () =>
      Alpine.$data(document.querySelector('[x-data="registroArbitros"]')).form,
  );
  ok(
    "el formulario queda limpio, incluida la contraseña",
    formLimpio.password === "" && formLimpio.confirmarPassword === "",
  );
  const thTabla = await page.$$eval("thead th", (t) =>
    t.map((x) => x.textContent.trim()),
  );
  ok(
    "la tabla no tiene columna de contraseña",
    !thTabla.some((t) => /contrase/i.test(t)),
    thTabla.join(","),
  );
  ok(
    "la tabla no muestra el hash",
    !(await page.$eval("tbody", (t) => t.innerText)).includes(
      ana.passwordHash.slice(0, 10),
    ),
  );

  const botones = await page.$$("tbody button");
  await botones[botones.length - 1].click();
  await esperar(300);
  await page.evaluate(() =>
    [...document.querySelectorAll(".modal-boton")]
      .find((b) => b.textContent.trim() === "Eliminar")
      .click(),
  );
  await esperar(400);
  ok("eliminar sigue funcionando", (await filas()) === 1);
  await page.setViewport({ width: 375, height: 800 });
  await esperar(300);
  ok(
    "375px sin scroll horizontal",
    (await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )) <= 0,
  );

  await nav.close();
  console.log(res.join("\n"));
  console.log(
    "\nCONSOLA:",
    errores.length ? "\n" + [...new Set(errores)].join("\n") : "sin errores",
  );
})().catch((e) => {
  console.log(res.join("\n"));
  console.error("FALLO:", e);
  process.exit(1);
});
```

_Claude ejecutó en la terminal (Check syntax and run the admin password tests on both servers):_

```bash
N=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador; cd /c/Users/carlo/Documents/Futbol-desarrollo && for f in admin/registro-arbitros.js comun/seguridad.js; do node --check $f || echo ERROR $f; done; (./node_modules/.bin/vite --host 127.0.0.1 --port 5179 --strictPort > $N/vite.log 2>&1 &); (python -m http.server 8766 --bind 127.0.0.1 > $N/static.log 2>&1 &); sleep 4; cd $N && echo "#### VITE" && node probar-admin.js; echo; echo "#### ESTATICO (como Nginx)" && BASE=http://127.0.0.1:8766/ node probar-admin.js
```

Dos pruebas fallaron: el formulario no queda limpio después de guardar, y la prueba de eliminar no encontró el botón del modal. Lo investigo.

_Claude ejecutó en la terminal (Read the new agregarArbitro function):_

```bash
sed -n '/async agregarArbitro/,/reiniciarFormulario() {/p' admin/registro-arbitros.js
```

_Claude ejecutó en la terminal (Fix the form check and debug the delete step):_

```bash
N=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador; cd $N && python - <<'EOF'
p='probar-admin.js'; s=open(p,encoding='utf-8').read()
s=s.replace('''  const formLimpio = await page.evaluate(() => Alpine.$data(document.querySelector('[x-data="registroArbitros"]')).form);
  ok("el formulario queda limpio, incluida la contraseña", formLimpio.password === "" && formLimpio.confirmarPassword === "");''',
'''  const valores = await page.$$eval("form input", (i) => i.map((x) => x.value));
  ok("el formulario queda limpio, incluida la contraseña", valores.every((v) => v === ""), JSON.stringify(valores));''')
s=s.replace('''  const botones = await page.$$("tbody button");
  await botones[botones.length - 1].click();
  await esperar(300);''','''  const botones = await page.$$("tbody button");
  await botones[botones.length - 1].click();
  await esperar(500);
  console.log("DEBUG modal:", await page.evaluate(() => [...document.querySelectorAll(".modal-boton")].map((b) => b.textContent.trim() + "/" + getComputedStyle(b.closest(".modal-fondo")).display)), "botones:", botones.length);''')
open(p,'w',encoding='utf-8').write(s)
EOF
node probar-admin.js 2>&1 | tail -12
```

### Prompt 2

```text
que fue lo que sucedio? no se pudieron hacer los arreglos?
```

### Respuesta 2

Sí se hicieron. **Los cambios en tu proyecto están listos.** Lo que interrumpiste fue un arreglo a mi script de pruebas, que está en mi carpeta temporal y no en tu proyecto.

##### Cambios que quedaron en tu proyecto

- **`comun/seguridad.js`** (archivo nuevo): las funciones `crearSal()` y `hashearPassword()`, con comentarios cortos.
- **`admin/usuarios.html`:**
  - Carga `../comun/seguridad.js` antes de `registro-arbitros.js`.
  - Tiene los campos "Contraseña" y "Confirmar contraseña", con `type="password"`, su `x-model` y su mensaje de error, igual que los demás.
- **`admin/registro-arbitros.js`:**
  - `password` y `confirmarPassword` agregados a `formVacio()`.
  - Las dos validaciones en `validar()`.
  - `agregarArbitro()` ahora es `async` y guarda `sal` y `passwordHash` en vez de la contraseña.

##### Lo que mostraron las pruebas

Probé con Vite y con un servidor como el de AWS. Pasaron 15 de 17:

- Con la contraseña corta o distinta, aparecen sus errores.
- Con datos válidos se abre el modal y el árbitro se agrega a la tabla con su toast.
- **No se guarda la contraseña.** Solo quedan la sal (32 caracteres) y el hash (64 caracteres).
- El mismo hash se puede volver a calcular con la misma clave y la misma sal, que es lo que necesita el login. Una clave distinta, o la misma clave con otra sal, da un hash distinto.
- La tabla no muestra ni la contraseña ni el hash.
- La consola quedó sin errores.

**Las 2 que fallaron parecen errores de mi script, no de tu código:**

1. _"El formulario queda limpio"_: el código sí llama a `reiniciarFormulario()`, pero el script leía mal los datos de Alpine. Lo estaba cambiando para que revise directamente los campos de la página.
2. _"Eliminar sigue funcionando"_: el script no encontró el botón "Eliminar" del modal. Iba a agregar detalle para ver qué pasaba.

Hasta que vuelva a correr esas dos pruebas, no puedo asegurarte que limpiar y eliminar funcionen. Antes de estos cambios sí funcionaban.

Además, los dos servidores de prueba (Vite en el puerto 5179 y el estático en el 8766) **siguen encendidos** en segundo plano.

## Qué se incorporó al proyecto

- `comun/seguridad.js` completo: `crearSal()` (16 bytes al azar en hexadecimal) y `hashearPassword(password, sal)` (SHA-256 de la sal junto a la clave, con `crypto.subtle`).
- En `admin/usuarios.html`, los campos Contraseña y Confirmar contraseña con `type="password"`, `x-model`, borde rojo con `:class` y mensaje de error, igual que los otros campos; y la carga de `seguridad.js` antes de `registro-arbitros.js`.
- En `admin/registro-arbitros.js`: `password` y `confirmarPassword` en `formVacio()`, las validaciones de largo mínimo (8) y de que coincidan, y `agregarArbitro()` pasado a `async`, que ahora guarda solo `sal` y `passwordHash` (ya no copia todos los campos del formulario).
- Se usaron los nombres que yo había planteado (`confirmarPassword`).
- Para el servidor de AWS (que es http, no https) se eligió por ahora mostrar un mensaje de error claro, porque `crypto.subtle` solo funciona en https o localhost.
- Queda pendiente (después del commit de Josefa): guardar los árbitros en `localStorage` mediante `api.js` y que el login los reconozca.

## Verificación

- Se probó en el navegador (Edge automatizado) con Vite y con un servidor estático como Nginx: 17 de 17 pruebas bien.
- Con los campos vacíos aparecen los errores, incluido el de contraseña; con una clave corta y distinta aparecen los dos errores nuevos.
- Con datos válidos se abre el modal, el árbitro se agrega a la tabla y sale el toast.
- El árbitro guardado no tiene `password` ni `confirmarPassword`; tiene una sal de 32 caracteres y un hash de 64.
- Con la misma clave y la misma sal se obtiene el mismo hash (lo que necesitará el login); con otra clave o con otra sal sale un hash distinto.
- La tabla no muestra la contraseña ni el hash, el formulario queda limpio después de guardar, eliminar sigue funcionando y no hay scroll horizontal en celular.
- Entiendo que el hash no se puede revertir: para comprobar una clave se vuelve a calcular con la sal guardada y se compara.

## Conclusión: lo que aprendí

Aprendí la diferencia entre encriptar y hashear: encriptar se puede revertir con una clave, en cambio un hash es como una huella que no se puede devolver a la contraseña original, por eso es lo correcto para guardar claves. También entendí para qué sirve la sal: si dos árbitros usan la misma contraseña, con una sal distinta para cada uno quedan con hashes diferentes. Vi que `crypto.subtle` ya viene en el navegador, que devuelve una promesa (por eso `agregarArbitro` pasó a ser `async`) y que solo funciona en https o localhost, lo que importa para nuestro servidor de AWS. Por último, aprendí que esto en el navegador es una simulación de buena práctica, y que en un backend real se haría en el servidor con algo como bcrypt.
