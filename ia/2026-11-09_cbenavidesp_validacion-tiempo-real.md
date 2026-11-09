# Validación en tiempo real y botón deshabilitado en el registro de árbitros

- **Fecha:** 2026-11-09
- **Integrante:** Carlos Benavides (@CBenavidesP)
- **Herramienta y modelo:** Claude Code
- **Enlace a la conversación:** no aplica (Claude Code no permite compartir la conversación)
- **Archivos afectados:** admin/registro-arbitros.js (guardando, línea 29; mensajeDe, validarCampo, revalidar, validar y enfocarPrimerError, líneas 31-76; solicitarGuardado, líneas 83-97; agregarArbitro con try/catch/finally, líneas 99-124); admin/usuarios.html (eventos @blur, @input o @change, aria-invalid y aria-describedby en los 7 campos, id en cada mensaje de error y botón Guardar con :disabled, línea 116)

## Objetivo

Mi tarea era la validación de formularios: evitar envíos vacíos y mostrar los errores en tiempo real. Hasta ahora el registro de árbitros solo validaba al apretar Guardar, y el PDF también pide que el botón quede deshabilitado mientras se procesa el envío (criterio A3). Primero pregunté cómo hacerlo para pensarlo, y después definí cómo quería que funcionara.

## Conversación (texto completo, sin editar)

### Prompt 1

```text
Ya hice el push, con que seguimos para pensar como lo podemos hacer
```

### Respuesta 1

_Claude ejecutó en la terminal (Confirm the push reached GitHub):_

```bash
cd /c/Users/carlo/Documents/Futbol-desarrollo && git fetch origin 2>&1 | tail -1; git status -sb | head -1; git log --format='%h %an %s' -2 origin/main | cat
```

Tu push está en GitHub: `24c96b8 Contraseña con hash y sal en registro de arbitros`. Si quieres que la página de AWS también lo tenga, repite los pasos del servidor (`ssh`, `cd /var/www/html`, `sudo git pull origin main`).

##### Lo que sigue: validación en tiempo real y botón deshabilitado

Esto cierra tu tarea "Validación de formularios" y el criterio A3 del PDF. Solo toca tus dos archivos de `admin/`. Te dejo cómo lo pensaría, para que decidas antes de escribir código.

###### 1. ¿Cuándo mostrar el error?

Hoy los errores aparecen solo al apretar Guardar. Hay tres opciones:

| Opción                                                           | Cómo se siente                                                                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **A. Mientras escribe** (`@input`)                               | Molesta: al escribir la primera letra del RUT ya dice "formato inválido".                                                |
| **B. Al salir del campo** (`@blur`)                              | Natural: terminas de escribir, pasas al siguiente campo y ahí te avisa.                                                  |
| **C. Al salir del campo y, si ya tenía error, mientras escribe** | Lo mejor de las dos: no molesta de entrada, y el error **desaparece apenas lo corriges**, sin tener que salir del campo. |

**Recomiendo la C.** Es la que usa el proyecto del profe (`validarCampo` en `@blur` y `revalidar` en `@input`).

###### 2. Cómo se ordena el código

- Hoy `validar()` revisa los 7 campos de una vez. Habría que separarla en **`validarCampo(campo)`**, que revisa uno solo.
- `validar()` seguiría existiendo para el botón Guardar, llamando a `validarCampo` con cada campo.
- **Ojo con la confirmación:** "Confirmar contraseña" depende de "Contraseña". Si cambias la contraseña después de haber escrito la confirmación, hay que volver a revisar la confirmación.

###### 3. Botón deshabilitado

- Un dato nuevo, **`guardando`**, que es `true` mientras se calcula el hash y se agrega el árbitro, y vuelve a `false` al terminar (también si falla).
- En el botón: `:disabled="guardando"` y el texto cambia a **"Guardando…"**.
- Así no se puede registrar dos veces al mismo árbitro con doble clic.

###### 4. Extras opcionales (accesibilidad, criterio C4)

- **`aria-invalid`** en el campo con error, para que los lectores de pantalla lo anuncien.
- **Al apretar Guardar con errores, el cursor salta al primer campo malo**, como en el proyecto del profe.

##### Lo que necesito que decidas

1. ¿Opción **A, B o C** para cuándo mostrar el error?
2. ¿Agregamos los **extras de accesibilidad**?
3. Después de esto, ¿aplicamos **lo mismo al login**? Es tu otra parte de validación pendiente y se puede reutilizar la misma idea.

Cuando me respondas, te digo exactamente qué líneas cambiarían en cada archivo antes de tocar nada.

### Prompt 2

```text
ya, vamos con la C. con @input solo queda muy invasivo y con @blur solo el usuario tiene que salir del campo para ver si lo arreglo, asi que lo mejor es que valide al salir y despues revalide mientras escribe si ya tenia error

lo de separar en validarCampo(campo) me parece bien, asi validar() solo la llama con cada campo cuando se aprieta guardar y no se repite codigo. y si, cuando cambie password hay que volver a revisar confirmarPassword pero solo si ya tenia algo escrito, si no le va a saltar el error antes de que llegue a ese campo

para el boton usemos guardando, pero ponlo en un try/finally para que vuelva a false aunque falle el hash, si no el boton se queda pegado en "Guardando…"

agrega tambien los extras: aria-invalid en los campos con error y aria-describedby apuntando al small del mensaje, y que al apretar guardar con errores haga focus en el primer campo malo. eso ultimo hay que hacerlo con $nextTick porque si no alpine todavia no actualiza los errores en el html

lo del login lo vemos despues, primero cerremos esto
```

### Respuesta 2

Lo implemento tal como lo planteaste. Primero reviso el estado del repositorio, porque veo cambios recientes en archivos de tus compañeros.

_Claude ejecutó en la terminal (Check repository state and new commits):_

```bash
cd /c/Users/carlo/Documents/Futbol-desarrollo && git fetch origin 2>&1 | tail -1; git status -sb | cat; git log --format='%h %an %ad %s' --date=format:'%m-%d %H:%M' -5 | cat; git log --format='%h %an %s' HEAD..origin/main | cat
```

_Claude ejecutó en la terminal (Read the current admin JS and the form markup):_

```bash
cat -n admin/registro-arbitros.js; sed -n 30,110p admin/usuarios.html | cat -n | sed 's/^/+29 /' | head -0; awk 'NR>=30 && NR<=110 {printf "%4d  %s\n", NR, $0}' admin/usuarios.html
```

Implemento lo que definiste. Uso `mensajeDe(campo)` para calcular el mensaje de cada campo, y así `validarCampo()`, `revalidar()` y `validar()` comparten la misma regla sin repetir código.

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\admin\registro-arbitros.js`. Texto que reemplazó:_

```js
    siguienteId: 2,

    validar() {
      this.errores = formVacio();
      const f = this.form;

      if (f.nombre.trim().length < 3) {
        this.errores.nombre = "Ingresa el nombre completo (mínimo 3 caracteres).";
      }

      if (!/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(f.rut.trim())) {
        this.errores.rut = "Formato de RUT inválido. Debe incluir guion (ej: 12.345.678-5).";
      } else if (this.rutExiste(f.rut)) {
        this.errores.rut = "Ya existe un árbitro con este RUT.";
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
        this.errores.email = "Ingresa un email válido.";
      }

      if (f.telefono.replace(/\D/g, "").length < 8) {
        this.errores.telefono = "Ingresa un teléfono válido.";
      }

      if (!f.categoria) {
        this.errores.categoria = "Selecciona una categoría.";
      }

      if (f.password.length < 8) {
        this.errores.password = "La contraseña debe tener al menos 8 caracteres.";
      }

      if (f.confirmarPassword !== f.password) {
        this.errores.confirmarPassword = "Las contraseñas no coinciden.";
      }

      return Object.values(this.errores).every((msg) => msg === "");
    },
```

_Texto nuevo:_

```js
    siguienteId: 2,
    guardando: false,

    mensajeDe(campo) {
      const f = this.form;
      switch (campo) {
        case "nombre":
          return f.nombre.trim().length < 3 ? "Ingresa el nombre completo (mínimo 3 caracteres)." : "";
        case "rut":
          if (!/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(f.rut.trim())) {
            return "Formato de RUT inválido. Debe incluir guion (ej: 12.345.678-5).";
          }
          return this.rutExiste(f.rut) ? "Ya existe un árbitro con este RUT." : "";
        case "email":
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) ? "" : "Ingresa un email válido.";
        case "telefono":
          return f.telefono.replace(/\D/g, "").length < 8 ? "Ingresa un teléfono válido." : "";
        case "categoria":
          return f.categoria ? "" : "Selecciona una categoría.";
        case "password":
          return f.password.length < 8 ? "La contraseña debe tener al menos 8 caracteres." : "";
        case "confirmarPassword":
          return f.confirmarPassword === f.password ? "" : "Las contraseñas no coinciden.";
        default:
          return "";
      }
    },

    validarCampo(campo) {
      this.errores[campo] = this.mensajeDe(campo);
    },

    revalidar(campo) {
      if (this.errores[campo]) {
        this.validarCampo(campo);
      }
      if (campo === "password" && this.form.confirmarPassword !== "") {
        this.validarCampo("confirmarPassword");
      }
    },

    validar() {
      Object.keys(this.errores).forEach((campo) => this.validarCampo(campo));
      return Object.values(this.errores).every((msg) => msg === "");
    },

    enfocarPrimerError() {
      this.$nextTick(() => this.$root.querySelector('[aria-invalid="true"]')?.focus());
    },
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\admin\registro-arbitros.js`. Texto que reemplazó:_

```js
    solicitarGuardado() {
      if (!this.validar()) {
        notificar("Revisa los campos marcados en el formulario.", "error");
        return;
      }

      pedirConfirmacion({
        titulo: "Registrar árbitro",
        mensaje: `¿Confirmas el registro de ${this.form.nombre.trim()}?`,
        textoConfirmar: "Registrar",

        alConfirmar: () => this.agregarArbitro(),
      });
    },

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

      this.arbitros.push(nuevo);
      notificar(`Árbitro ${nuevo.nombre} registrado correctamente.`);
      this.reiniciarFormulario();
    },
```

_Texto nuevo:_

```js
    solicitarGuardado() {
      if (this.guardando) return;
      if (!this.validar()) {
        notificar("Revisa los campos marcados en el formulario.", "error");
        this.enfocarPrimerError();
        return;
      }

      pedirConfirmacion({
        titulo: "Registrar árbitro",
        mensaje: `¿Confirmas el registro de ${this.form.nombre.trim()}?`,
        textoConfirmar: "Registrar",
        alConfirmar: () => this.agregarArbitro(),
      });
    },

    async agregarArbitro() {
      this.guardando = true;
      try {
        const f = this.form;
        const sal = crearSal();
        const passwordHash = await hashearPassword(f.password, sal);

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

        this.arbitros.push(nuevo);
        notificar(`Árbitro ${nuevo.nombre} registrado correctamente.`);
        this.reiniciarFormulario();
      } catch (error) {
        notificar(error.message, "error");
      } finally {
        this.guardando = false;
      }
    },
```

_Claude ejecutó en la terminal (Add blur/input validation, aria attributes and disabled button to the form):_

```bash
python - <<'EOF'
import pathlib, re
p = pathlib.Path("admin/usuarios.html"); s = p.read_text(encoding="utf-8")
campos = {"nombre": "arbNombre", "rut": "arbRut", "email": "arbEmail", "telefono": "arbTelefono",
          "categoria": "arbCategoria", "password": "arbPassword", "confirmarPassword": "arbConfirmarPassword"}
for campo, ident in campos.items():
    modelo = f'x-model="form.{campo}"'
    assert s.count(modelo) == 1, campo
    evento = "@change" if campo == "categoria" else "@input"
    extra = (f'{modelo}\n              @blur="validarCampo(\'{campo}\')" {evento}="revalidar(\'{campo}\')"'
             f'\n              :aria-invalid="errores.{campo} ? \'true\' : \'false\'" aria-describedby="{ident}-error"')
    s = s.replace(modelo, extra)
    small = f'<small class="mt-1 block text-xs text-red-700" x-show="errores.{campo}" x-text="errores.{campo}"></small>'
    assert s.count(small) == 1, campo
    s = s.replace(small, f'<small id="{ident}-error" class="mt-1 block text-xs text-red-700" x-show="errores.{campo}" x-text="errores.{campo}"></small>')
boton_viejo = '<button type="submit" class="rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Guardar Árbitro</button>'
assert s.count(boton_viejo) == 1
s = s.replace(boton_viejo, '<button type="submit" :disabled="guardando" x-text="guardando ? \'Guardando…\' : \'Guardar Árbitro\'" class="rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-blue-700">Guardar Árbitro</button>')
p.write_text(s, encoding="utf-8", newline="")
print("ok")
EOF
awk 'NR>=36 && NR<=48 {printf "%4d  %s\n", NR, $0}' admin/usuarios.html; grep -n ':disabled="guardando"' admin/usuarios.html; node --check admin/registro-arbitros.js && echo js-ok
```

Ahora pruebo en el navegador todo lo que pediste, incluido el caso en que falla el hash, para comprobar que el botón no se queda pegado en "Guardando…".

_Claude creó o reemplazó el archivo `C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\navegador\probar-tiempo-real.js` con este contenido:_

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
  page.on("pageerror", (e) => errores.push(`[pageerror] ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errores.push(`[error] ${m.text()}`);
  });

  await page.goto(BASE, { waitUntil: "networkidle0" });
  await page.type("#usuario", "admin");
  await page.type("#password", "admin123");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click("button[type=submit]"),
  ]);
  await page.goto(BASE + "admin/usuarios.html", { waitUntil: "networkidle0" });

  const visible = (id) =>
    page.$eval(`#${id}-error`, (e) =>
      e.offsetParent !== null ? e.textContent : "",
    );
  const aria = (id) =>
    page.$eval(`#${id}`, (e) => e.getAttribute("aria-invalid"));
  const limpiar = (id) =>
    page.$eval(`#${id}`, (e) => {
      e.value = "";
      e.dispatchEvent(new Event("input"));
    });

  await page.click("#arbRut");
  await page.keyboard.type("12");
  await esperar(150);
  ok(
    "C: mientras escribe por primera vez NO muestra error",
    (await visible("arbRut")) === "",
  );
  await page.click("#arbEmail");
  await esperar(150);
  ok(
    "C: al salir del campo SI muestra el error",
    (await visible("arbRut")).includes("Formato de RUT"),
    await visible("arbRut"),
  );
  ok(
    "aria-invalid=true en el campo con error",
    (await aria("arbRut")) === "true",
  );
  ok(
    "aria-describedby apunta al small del mensaje",
    (await page.$eval("#arbRut", (e) => e.getAttribute("aria-describedby"))) ===
      "arbRut-error",
  );
  ok(
    "aria-invalid=false en un campo sin error",
    (await aria("arbNombre")) === "false",
  );

  await page.click("#arbRut");
  await page.keyboard.type(".111.111-1");
  await esperar(150);
  ok(
    "C: si ya tenia error, se quita mientras escribe (sin salir)",
    (await visible("arbRut")) === "" && (await aria("arbRut")) === "false",
  );

  await page.click("#arbPassword");
  await page.keyboard.type("clave1234");
  await page.click("#arbNombre");
  await esperar(150);
  ok(
    "confirmar vacio: cambiar password NO le pone error todavia",
    (await visible("arbConfirmarPassword")) === "",
  );
  await page.click("#arbConfirmarPassword");
  await page.keyboard.type("clave1234");
  await page.click("#arbNombre");
  await esperar(150);
  ok(
    "confirmar igual: sin error",
    (await visible("arbConfirmarPassword")) === "",
  );
  await page.click("#arbPassword");
  await page.keyboard.type("X");
  await esperar(150);
  ok(
    "confirmar con texto: al cambiar password se revisa y marca que no coinciden",
    (await visible("arbConfirmarPassword")).includes("no coinciden"),
  );
  await page.keyboard.press("Backspace");
  await esperar(150);
  ok(
    "al volver a igualar la password, el error de confirmar se quita solo",
    (await visible("arbConfirmarPassword")) === "",
  );

  await page.select("#arbCategoria", "");
  await page.$eval("#arbCategoria", (e) => e.focus());
  await page.click("#arbNombre");
  await esperar(150);
  ok(
    "select: al salir vacio muestra error",
    (await visible("arbCategoria")).includes("categoría"),
  );
  await page.select("#arbCategoria", "FIFA");
  await esperar(150);
  ok(
    "select: con @change se quita al elegir",
    (await visible("arbCategoria")) === "",
  );

  await page.click("#arbConfirmarPassword");
  await page.click("form button[type=submit]");
  await esperar(400);
  const foco = await page.evaluate(
    () => document.activeElement && document.activeElement.id,
  );
  ok(
    "guardar con errores enfoca el primer campo malo (nombre)",
    foco === "arbNombre",
    foco,
  );
  ok(
    "guardar con errores muestra los que faltan",
    (await visible("arbNombre")) !== "" &&
      (await visible("arbEmail")) !== "" &&
      (await visible("arbTelefono")) !== "",
  );

  await page.type("#arbNombre", "Ana Perez");
  await page.type("#arbEmail", "ana@arbitros.cl");
  await page.type("#arbTelefono", "+56 9 8765 4321");
  await esperar(150);
  ok(
    "los errores se van quitando mientras se corrige",
    (await visible("arbNombre")) === "" &&
      (await visible("arbEmail")) === "" &&
      (await visible("arbTelefono")) === "",
  );

  await page.evaluate(() => {
    window.hashOriginal = window.hashearPassword;
    window.hashearPassword = async (p, s) => {
      await new Promise((r) => setTimeout(r, 1200));
      return window.hashOriginal(p, s);
    };
  });
  await page.click("form button[type=submit]");
  await esperar(300);
  await page.evaluate(() =>
    [...document.querySelectorAll(".modal-boton")]
      .find((b) => b.textContent.trim() === "Registrar")
      .click(),
  );
  await esperar(300);
  const durante = await page.$eval("form button[type=submit]", (b) => ({
    dis: b.disabled,
    txt: b.textContent.trim(),
  }));
  ok(
    "mientras guarda: boton deshabilitado y dice Guardando…",
    durante.dis && durante.txt === "Guardando…",
    JSON.stringify(durante),
  );
  await esperar(1500);
  const despues = await page.$eval("form button[type=submit]", (b) => ({
    dis: b.disabled,
    txt: b.textContent.trim(),
  }));
  ok(
    "al terminar: boton habilitado otra vez",
    !despues.dis && despues.txt === "Guardar Árbitro",
    JSON.stringify(despues),
  );
  ok(
    "el arbitro se registro",
    (await page.$$eval(
      "tbody tr",
      (t) => t.filter((e) => e.offsetParent !== null).length,
    )) === 2,
  );

  await page.evaluate(() => {
    window.hashearPassword = async () => {
      await new Promise((r) => setTimeout(r, 300));
      throw new Error("Fallo simulado del hash");
    };
  });
  await page.type("#arbNombre", "Luis Rojas");
  await page.type("#arbRut", "22.222.222-2");
  await page.type("#arbEmail", "luis@arbitros.cl");
  await page.type("#arbTelefono", "+56 9 1111 2222");
  await page.select("#arbCategoria", "Amateur");
  await page.type("#arbPassword", "clave5678");
  await page.type("#arbConfirmarPassword", "clave5678");
  await page.waitForFunction(
    () => document.querySelectorAll(".toast").length === 0,
    { timeout: 6000 },
  );
  await page.click("form button[type=submit]");
  await esperar(300);
  await page.evaluate(() =>
    [...document.querySelectorAll(".modal-boton")]
      .find((b) => b.textContent.trim() === "Registrar")
      .click(),
  );
  await esperar(800);
  const trasFallo = await page.$eval("form button[type=submit]", (b) => ({
    dis: b.disabled,
    txt: b.textContent.trim(),
  }));
  ok(
    "si el hash falla: el boton NO se queda pegado (finally)",
    !trasFallo.dis && trasFallo.txt === "Guardar Árbitro",
    JSON.stringify(trasFallo),
  );
  ok(
    "si el hash falla: muestra toast de error",
    (
      await page.$$eval(".toast", (t) => t.map((x) => x.textContent).join())
    ).includes("Fallo simulado"),
  );
  ok(
    "si el hash falla: no agrega el arbitro",
    (await page.$$eval(
      "tbody tr",
      (t) => t.filter((e) => e.offsetParent !== null).length,
    )) === 2,
  );

  await page.evaluate(() => {
    window.hashearPassword = window.hashOriginal;
  });
  await page.click("form button[type=button]");
  await esperar(200);
  const tras = await page.$$eval(
    "form small",
    (s) => s.filter((e) => e.offsetParent !== null).length,
  );
  ok("Limpiar deja el formulario sin errores", tras === 0, String(tras));

  await nav.close();
  console.log(res.join("\n"));
  console.log(
    "\nCONSOLA:",
    errores.length ? "\n" + [...new Set(errores)].join("\n") : "sin errores",
  );
})().catch((e) => {
  console.log(res.join("\n"));
  console.error("FALLO:", e.message);
  process.exit(1);
});
```

_Claude ejecutó en la terminal (Start test servers and run the new real-time validation tests):_

```bash
N=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador; cd /c/Users/carlo/Documents/Futbol-desarrollo && (./node_modules/.bin/vite --host 127.0.0.1 --port 5179 --strictPort > $N/vite.log 2>&1 &); (python -m http.server 8766 --bind 127.0.0.1 > $N/static.log 2>&1 &); sleep 4; cd $N && echo "#### nuevas (tiempo real)"; node probar-tiempo-real.js
```

Pasan las 22 pruebas nuevas. Ahora corro las anteriores en los dos servidores, para confirmar que no se rompió nada.

_Claude ejecutó en la terminal (Run all three browser test suites on both servers):_

```bash
for B in http://127.0.0.1:5179/ http://127.0.0.1:8766/; do echo "######## $B"; for t in probar.js probar-admin.js probar-tiempo-real.js; do BASE=$B node $t > r.txt 2>&1; grep '^FALLA\|FALLO\|pageerror\|\[error\]\|http 4' r.txt; echo "  $t: $(grep -c '^OK' r.txt) OK de $(grep -c '^OK\|^FALLA' r.txt)"; done; done
```

_Claude ejecutó en la terminal (Stop both test servers):_

```powershell
foreach ($p in 5179, 8766) { $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue; if ($c) { foreach ($id in ($c.OwningProcess | Sort-Object -Unique)) { try { Stop-Process -Id $id -Confirm:$false -ErrorAction Stop; "detenido $p" } catch { "no se pudo $p" } } } }
```

_Claude ejecutó en la terminal (List the changed files and line numbers of the new functions):_

```bash
cd /c/Users/carlo/Documents/Futbol-desarrollo && git status --short | cat; git diff --stat | cat; grep -n 'guardando: false\|mensajeDe(campo) {\|validarCampo(campo) {\|revalidar(campo) {\|validar() {\|enfocarPrimerError() {\|solicitarGuardado() {\|async agregarArbitro() {\|finally' admin/registro-arbitros.js
```

Listo, quedó implementado tal como lo planteaste. Pasaron todas las pruebas, también las anteriores: **80 de 80 en Vite y 80 de 80 en un servidor como el de AWS, sin errores en la consola.** No hice commit.

##### `admin/registro-arbitros.js`

- **Línea 29:** `guardando: false`.
- **Líneas 31-54, `mensajeDe(campo)`:** tiene la regla de cada campo y devuelve el mensaje, o `""` si está bien. Las reglas son las mismas de antes; solo las separé por campo.
- **Líneas 56-58, `validarCampo(campo)`:** guarda en `errores` el mensaje de ese campo. Se llama en `@blur`.
- **Líneas 60-67, `revalidar(campo)`:**
  - Si el campo ya tenía error, lo vuelve a revisar mientras escribes.
  - Si el campo es `password` y la confirmación **ya tiene texto**, revisa también `confirmarPassword`.
- **Líneas 69-72, `validar()`:** llama a `validarCampo` con cada campo. No repite ninguna regla.
- **Líneas 74-76, `enfocarPrimerError()`:** con `$nextTick`, pone el foco en el primer campo con `aria-invalid="true"`.
- **Líneas 83-97, `solicitarGuardado()`:**
  - Si ya está guardando, no hace nada.
  - Si hay errores, muestra el aviso y llama a `enfocarPrimerError()`.
- **Líneas 99-124, `agregarArbitro()`:** pone `guardando = true` y todo va dentro de `try / catch / finally`. Si el hash falla, muestra el error, y el `finally` siempre devuelve `guardando` a `false`.

##### `admin/usuarios.html`

- **En los 7 campos:**
  - `@blur="validarCampo('...')"`.
  - `@input="revalidar('...')"`. En Categoría es `@change`, porque es un select.
  - `:aria-invalid` y `aria-describedby="arb...-error"`.
- **Cada mensaje de error** tiene ahora su `id` (por ejemplo, `arbRut-error`), que es al que apunta `aria-describedby`.
- **Línea 116, botón Guardar:**
  - `:disabled="guardando"`.
  - El texto cambia a **"Guardando…"**.
  - Mientras está deshabilitado se ve más claro y el cursor no deja hacer clic.

##### Qué probé (22 pruebas nuevas)

- **Validación en tiempo real:**
  - Al escribir por primera vez **no** aparece error.
  - Al salir del campo **sí** aparece.
  - Si el campo ya tenía error, se quita **mientras corriges**, sin tener que salir.
- **Contraseña:**
  - Cambiar la contraseña **no** marca error en la confirmación si esta sigue vacía.
  - Si la confirmación ya tiene texto, la revisa: marca que no coinciden y el error se quita solo al volver a igualarlas.
- **Accesibilidad:**
  - `aria-invalid` cambia entre `true` y `false`.
  - `aria-describedby` apunta al mensaje correcto.
  - Al guardar con errores, el foco salta a **Nombre**, que es el primer campo malo.
- **Botón:**
  - Mientras guarda, está deshabilitado y dice "Guardando…", y al terminar vuelve a la normalidad.
  - **Simulé que el hash fallara:** salió el aviso de error, no se agregó el árbitro y el botón **no se quedó pegado**.
- **Limpiar:** deja el formulario sin errores.

Para que se notara el "Guardando…", en la prueba hice que el hash tardara 1,2 segundos. En el uso real casi no se alcanza a ver, porque el hash es instantáneo. Cuando los árbitros pasen por `api.js` (con su demora de 450 ms), ahí sí se va a notar.

Con esto queda completa tu tarea de **validación de formularios** en el registro de árbitros. Lo siguiente es la validación del login, como dijiste.

## Qué se incorporó al proyecto

- La opción C: cada campo se valida al salir de él (`@blur`) y, si ya tenía error, se vuelve a revisar mientras se escribe (`@input`; en el select de categoría, `@change`). Así no molesta mientras se escribe por primera vez y el error se quita apenas se corrige.
- `mensajeDe(campo)` con la regla de cada campo, `validarCampo(campo)` que guarda el mensaje, `revalidar(campo)` y `validar()` que llama a `validarCampo` con todos los campos, para no repetir las reglas.
- Al cambiar la contraseña se revisa también la confirmación, pero solo si la confirmación ya tiene algo escrito.
- `guardando` con `try`/`catch`/`finally`: el botón queda deshabilitado y dice "Guardando…" mientras se calcula el hash, y siempre vuelve a la normalidad, aunque el hash falle.
- `aria-invalid` en los campos con error, `aria-describedby` apuntando al mensaje de cada campo, y al guardar con errores el foco salta al primer campo malo usando `$nextTick`.
- Se usaron los nombres y la estructura que yo había propuesto. No se agregaron comentarios en el código.

## Verificación

- Se probó en el navegador (Edge automatizado) con Vite y con un servidor estático como Nginx: 22 pruebas nuevas, más las 41 generales y las 17 de contraseñas, todas bien (80 de 80 en cada servidor) y sin errores en la consola.
- Al escribir por primera vez no aparece error; al salir del campo sí; y si ya tenía error, se quita mientras se corrige.
- Cambiar la contraseña no marca la confirmación si está vacía; si tiene texto, marca que no coinciden y el error se quita al igualarlas.
- Al guardar con errores el foco queda en Nombre (el primer campo malo).
- Con un hash lento, el botón queda deshabilitado con "Guardando…" y después vuelve a la normalidad; con un hash que falla, sale el aviso de error, no se agrega el árbitro y el botón no se queda pegado.

## Conclusión: lo que aprendí

Aprendí que validar "en tiempo real" no significa mostrar errores con cada tecla: si se valida al salir del campo y solo se revalida mientras se escribe cuando ya había un error, el formulario avisa sin molestar y el mensaje desaparece apenas se corrige. Separar la regla de cada campo en una sola función me permitió usarla en el `@blur`, en el `@input` y al apretar Guardar sin repetir código. También entendí para qué sirve `finally`: se ejecuta siempre, falle o no lo que está en el `try`, por eso el botón nunca se queda pegado en "Guardando…". Por último, vi que `$nextTick` espera a que Alpine actualice el HTML, y que sin eso el foco buscaría los campos con error antes de que existan los `aria-invalid`.
