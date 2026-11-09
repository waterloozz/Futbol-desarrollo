# Validación del login con Alpine.js

- **Fecha:** 2026-11-09
- **Integrante:** Carlos Benavides (@CBenavidesP)
- **Herramienta y modelo:** Claude Code (Claude Opus 5.5)
- **Enlace a la conversación:** no aplica (Claude Code no permite compartir la conversación; el texto completo va abajo)
- **Archivos afectados:** index.html (formulario con x-data="login", error general y campos, líneas 19-39; scripts con defer y Alpine al final, líneas 44-47); login/login.js (archivo completo, 64 líneas); login/login.css (reglas nuevas al final: [x-cloak], .input-error, .error-campo, .alerta-error y button:disabled; se avisó a Josefa antes)

## Objetivo

Terminar mi tarea de validación de formularios en el login: que no se pueda enviar vacío y que los errores aparezcan en tiempo real, igual que en el registro de árbitros. El login usaba JavaScript normal y solo revisaba si los campos estaban vacíos, así que lo pasé a Alpine para que quedara consistente con el resto del proyecto (criterio D1) y cumpliera el criterio A3 del PDF.

## Conversación (texto completo, sin editar)

### Prompt 1

```text
Lo de los comentarios lo haremos al final que terminen todos de hacer sus cosas, haremos primero la validacion del login, luego haremos las cosas que no tienen dueño para dejarlo listo. Finalizada esas 2 cosas actualizaremos el readme
```

### Respuesta 1

De acuerdo con el orden: primero la validación del login, después lo que no tiene dueño, luego el README y al final los comentarios.

##### Cómo pensaría la validación del login

###### Decisión 1: ¿JavaScript normal o Alpine?
Hoy `login/login.js` es JavaScript normal (`addEventListener`) y `index.html` no carga Alpine.

| Opción | Ventajas | Desventajas |
|---|---|---|
| **A. Pasarlo a Alpine (recomendada)** | Usa **lo mismo que el registro de árbitros**: `validarCampo`, `revalidar`, `@blur`, `@input`, `aria-invalid` y `$nextTick`. Ya lo sabes explicar. Además, el criterio D1 del PDF pide usar Alpine "de forma consistente". | Hay que agregar Alpine a `index.html`. |
| B. Seguir con JavaScript normal | No cambia la forma en que está hecho. | Hay que escribir a mano lo que Alpine hace solo (mostrar u ocultar mensajes, marcar campos), y queda distinto al resto del proyecto. |

###### Decisión 2: ¿qué se valida?
- **Email:** obligatorio y con formato válido (la misma regla del registro).
- **Contraseña:** solo obligatoria. **Recomiendo no pedir mínimo de 8 caracteres en el login.** El login no debería dar pistas sobre cómo son las claves, y si alguna cuenta tuviera una más corta, no podría entrar.

###### Decisión 3: ¿cuándo se muestran los errores?
Igual que en el registro: **al salir del campo**, y si ya tenía error, **mientras escribe**. Al apretar Entrar con errores, el foco va al primer campo malo.

###### Decisión 4: el error de la API (401)
"Email o contraseña incorrectos." no es de un campo en particular, sino del intento completo. Por eso propongo:
- Mostrarlo como **mensaje general**, arriba del botón, con `role="alert"` para que los lectores de pantalla lo anuncien.
- **Que se borre apenas el usuario vuelve a escribir.**
- No decir si lo que estaba mal era el email o la contraseña. Así no se le da pistas a alguien que intente adivinar cuentas.

###### Lo que cambiaría (cuando decidas)
| Archivo | Qué cambia |
|---|---|
| `index.html` (formulario, líneas 19-31) | Cada campo con `x-model`, `@blur`, `@input`, `aria-invalid`, `aria-describedby` y su mensaje de error debajo. El mensaje general del 401. El botón con `:disabled` y el texto "Ingresando…". |
| `index.html` (scripts, líneas 36-38) | `api.js`, `seguridad.js` y `login.js` con `defer`, y **Alpine al final**. |
| `login/login.js` | Pasa a ser un componente `Alpine.data("login")` con `form`, `errores`, `errorGeneral`, `enviando`, `mensajeDe`, `validarCampo`, `revalidar`, `validar`, `enfocarPrimerError` y `entrar()` con `try/finally`. |
| `login/login.css` (de Josefa) | Unas pocas reglas: el estilo del mensaje de error, el borde rojo del campo con error y el botón deshabilitado. El login no usa Tailwind, así que va en su CSS. |

Ojo: `login/login.css` es de Josefa. Son solo unas líneas al final, pero conviene avisarle.

Dime qué eliges en las decisiones 1, 2 y 4 (la 3 ya la definiste con el registro), y te digo las líneas exactas antes de tocar nada.

### Prompt 2

```text
vamos con lo recomendado en todo

1. alpine. si el registro ya esta hecho con alpine no tiene sentido que el login quede distinto, ademas asi reutilizo la misma logica de validarCampo, revalidar con @input despues del @blur, aria-invalid y el $nextTick para el foco. y como dices el D1 pide usarlo de forma consistente. solo hay que fijarse que en index.html alpine quede cargado al final con defer, despues de api.js, seguridad.js y login.js, porque si no el alpine:init se dispara antes de que login.js registre el componente

2. en el login email obligatorio con formato y la contraseña solo obligatoria, sin el minimo de 8. eso es para el registro, en el login si pongo el minimo estoy dando pistas de como son las claves y ademas si alguna cuenta vieja tiene menos no podria entrar

3. igual que en el registro como ya quedamos

4. el 401 como error general arriba del formulario con role="alert" para que lo lean los lectores de pantalla, que se borre apenas vuelva a escribir y con el mismo mensaje para los dos casos, sin decir si fallo el email o la contraseña, asi no sirve para averiguar que cuentas existen

el boton con enviando en un try/finally igual que guardando en el registro, para que no se quede pegado en
"Ingresando…" si falla la api

lo del login.css le aviso a josefa antes, peue faltan al final sin cambiar lo que ella ya tiene

dime las lineas exactas antes de tocar nada
```

### Respuesta 2

Reviso cómo están hoy `index.html` y `login.css`, para darte las líneas exactas. Solo leo.

*Claude ejecutó en la terminal (Read index.html and the end of login.css):*

```bash
git status -sb | head -1; awk '{printf "%4d  %s\n", NR, $0}' index.html; wc -l login/login.css login/login.js; tail -5 login/login.css; grep -n '^input\|^button\|^label\|#mensaje\|^input:focus' login/login.css
```

Te dejo el plan con el código exacto que pondría en cada archivo. No toqué nada.

##### 1. `index.html`

###### Líneas 19-32: el formulario se reemplaza completo
```html
      <form x-data="login" @submit.prevent="entrar()" novalidate>
        <p x-show="errorGeneral" x-cloak role="alert" class="alerta-error" x-text="errorGeneral"></p>
        <div>
          <label for="email">Email</label>
          <input type="email" id="email" autocomplete="email" placeholder="tu@correo.cl"
            x-model="form.email" @blur="validarCampo('email')" @input="revalidar('email')"
            :class="errores.email ? 'input-error' : ''"
            :aria-invalid="errores.email ? 'true' : 'false'" aria-describedby="email-error">
          <small id="email-error" class="error-campo" x-show="errores.email" x-text="errores.email"></small>
        </div>
        <div>
          <label for="password">Contraseña</label>
          <input type="password" id="password" autocomplete="current-password" placeholder="Tu contraseña"
            x-model="form.password" @blur="validarCampo('password')" @input="revalidar('password')"
            :class="errores.password ? 'input-error' : ''"
            :aria-invalid="errores.password ? 'true' : 'false'" aria-describedby="password-error">
          <small id="password-error" class="error-campo" x-show="errores.password" x-text="errores.password"></small>
        </div>
        <div>
          <button type="submit" :disabled="enviando" x-text="enviando ? 'Ingresando…' : 'Entrar'">Entrar</button>
        </div>
      </form>
```
- `x-data="login"` conecta el formulario con el componente.
- **El 401 va arriba**, en el `<p role="alert">`.
- Se borra el `<p id="mensaje">` de la línea 31, que ya no se usa.
- El botón dice "Entrar" desde que carga la página, antes de que arranque Alpine.

###### Líneas 36-38: los scripts
```html
  <script src="comun/api.js" defer></script>
  <script src="comun/seguridad.js" defer></script>
  <script src="login/login.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js" defer></script>
```
**Alpine queda al final**, con `defer`, como dijiste. Es la misma versión que usan las demás páginas.

##### 2. `login/login.js`: se reemplaza completo (unas 60 líneas)
```js
document.addEventListener("alpine:init", () => {
  Alpine.data("login", () => ({
    form: { email: "", password: "" },
    errores: { email: "", password: "" },
    errorGeneral: "",
    enviando: false,

    mensajeDe(campo) {
      const f = this.form;
      switch (campo) {
        case "email":
          if (!f.email.trim()) return "Ingresa tu email.";
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) ? "" : "Ingresa un email válido.";
        case "password":
          return f.password ? "" : "Ingresa tu contraseña.";
        default:
          return "";
      }
    },

    validarCampo(campo) {
      this.errores[campo] = this.mensajeDe(campo);
    },

    revalidar(campo) {
      this.errorGeneral = "";
      if (this.errores[campo]) this.validarCampo(campo);
    },

    validar() {
      Object.keys(this.errores).forEach((campo) => this.validarCampo(campo));
      return Object.values(this.errores).every((msg) => msg === "");
    },

    enfocarPrimerError() {
      this.$nextTick(() => this.$root.querySelector('[aria-invalid="true"]')?.focus());
    },

    async entrar() {
      if (this.enviando) return;
      this.errorGeneral = "";
      if (!this.validar()) {
        this.enfocarPrimerError();
        return;
      }

      this.enviando = true;
      try {
        const respuesta = await iniciarSesion(this.form.email, this.form.password);
        if (!respuesta.ok) {
          this.errorGeneral = respuesta.error;
          return;
        }
        localStorage.setItem("rol", respuesta.datos.rol);
        localStorage.setItem("usuario", respuesta.datos.email);
        window.location.href = "usuario/dashboard.html";
      } catch (error) {
        this.errorGeneral = "No se pudo iniciar sesión. Intenta de nuevo.";
      } finally {
        this.enviando = false;
      }
    },
  }));
});
```
- **`revalidar()` borra `errorGeneral` apenas se escribe en cualquier campo** (decisión 4).
- **El mensaje del 401 es el mismo para los dos casos**, porque ya viene así desde `iniciarSesion()` en `api.js`: "Email o contraseña incorrectos."
- **La contraseña solo es obligatoria**, sin mínimo de caracteres (decisión 2).
- **`try/catch/finally`**: `enviando` siempre vuelve a `false`, así el botón no se queda pegado en "Ingresando…".
- La estructura es la misma del registro, así que se explica igual.

##### 3. `login/login.css` (de Josefa): solo se agrega al final, después de la línea 216
```css
[x-cloak] {
  display: none !important;
}

.input-error {
  border-color: #b91c1c;
}

.input-error:focus {
  border-color: #b91c1c;
  box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.15);
}

.error-campo {
  display: block;
  margin: -12px 0 14px;
  color: #b91c1c;
  font-size: 13px;
}

.alerta-error {
  margin: 0 0 18px;
  padding: 10px 14px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background-color: #fef2f2;
  color: #b91c1c;
  font-size: 14px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

button:disabled:hover {
  background-color: #1d4ed8;
}
```
- `[x-cloak]`: el login no tiene Tailwind, así que esta regla hace falta para que el mensaje del 401 no aparezca un instante al cargar la página.
- `.error-campo` lleva `margin-top: -12px` porque en su CSS cada `input` tiene 18 px de margen abajo. Así el mensaje queda pegado a su campo.
- Lo que ya tiene Josefa no cambia nada.

##### Qué probaría después
- Errores al salir del campo, que se borran mientras escribes, y el foco en el primer campo malo.
- Email vacío y email mal escrito, cada uno con su mensaje. Contraseña vacía.
- **Que una contraseña corta no muestre error en el login.**
- El 401: aparece arriba, con `role="alert"`, y **se borra al escribir**.
- El botón dice "Ingresando…" mientras espera, y vuelve a la normalidad si la API falla.
- Que el admin, la cuenta de prueba y un árbitro nuevo sigan entrando.
- Además, correr las 118 pruebas anteriores, en Vite y en el servidor igual al de AWS.

¿Le doy?

### Prompt 3

```text
si
```

### Respuesta 3

*Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\index.html`. Texto que reemplazó:*

```html
      <form id="formLogin">
        <div>
          <label for="email">Email</label>
          <input type="email" id="email" autocomplete="email" placeholder="tu@correo.cl">
        </div>
        <div>
          <label for="password">Contraseña</label>
          <input type="password" id="password" autocomplete="current-password" placeholder="Tu contraseña">
        </div>
        <div>
          <button type="submit">Entrar</button>
        </div>
        <p id="mensaje"></p>
      </form>
```

*Texto nuevo:*

```html
      <form x-data="login" @submit.prevent="entrar()" novalidate>
        <p x-show="errorGeneral" x-cloak role="alert" class="alerta-error" x-text="errorGeneral"></p>
        <div>
          <label for="email">Email</label>
          <input type="email" id="email" autocomplete="email" placeholder="tu@correo.cl"
            x-model="form.email" @blur="validarCampo('email')" @input="revalidar('email')"
            :class="errores.email ? 'input-error' : ''"
            :aria-invalid="errores.email ? 'true' : 'false'" aria-describedby="email-error">
          <small id="email-error" class="error-campo" x-show="errores.email" x-text="errores.email"></small>
        </div>
        <div>
          <label for="password">Contraseña</label>
          <input type="password" id="password" autocomplete="current-password" placeholder="Tu contraseña"
            x-model="form.password" @blur="validarCampo('password')" @input="revalidar('password')"
            :class="errores.password ? 'input-error' : ''"
            :aria-invalid="errores.password ? 'true' : 'false'" aria-describedby="password-error">
          <small id="password-error" class="error-campo" x-show="errores.password" x-text="errores.password"></small>
        </div>
        <div>
          <button type="submit" :disabled="enviando" x-text="enviando ? 'Ingresando…' : 'Entrar'">Entrar</button>
        </div>
      </form>
```

*Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\index.html`. Texto que reemplazó:*

```html
  <script src="comun/api.js"></script>
  <script src="comun/seguridad.js"></script>
  <script src="login/login.js"></script>
```

*Texto nuevo:*

```html
  <script src="comun/api.js" defer></script>
  <script src="comun/seguridad.js" defer></script>
  <script src="login/login.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js" defer></script>
```

*Claude creó o reemplazó el archivo `C:\Users\carlo\Documents\Futbol-desarrollo\login\login.js` con este contenido:*

```js
document.addEventListener("alpine:init", () => {
  Alpine.data("login", () => ({
    form: { email: "", password: "" },
    errores: { email: "", password: "" },
    errorGeneral: "",
    enviando: false,

    mensajeDe(campo) {
      const f = this.form;
      switch (campo) {
        case "email":
          if (!f.email.trim()) return "Ingresa tu email.";
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) ? "" : "Ingresa un email válido.";
        case "password":
          return f.password ? "" : "Ingresa tu contraseña.";
        default:
          return "";
      }
    },

    validarCampo(campo) {
      this.errores[campo] = this.mensajeDe(campo);
    },

    revalidar(campo) {
      this.errorGeneral = "";
      if (this.errores[campo]) this.validarCampo(campo);
    },

    validar() {
      Object.keys(this.errores).forEach((campo) => this.validarCampo(campo));
      return Object.values(this.errores).every((msg) => msg === "");
    },

    enfocarPrimerError() {
      this.$nextTick(() => this.$root.querySelector('[aria-invalid="true"]')?.focus());
    },

    async entrar() {
      if (this.enviando) return;
      this.errorGeneral = "";
      if (!this.validar()) {
        this.enfocarPrimerError();
        return;
      }

      this.enviando = true;
      try {
        const respuesta = await iniciarSesion(this.form.email, this.form.password);
        if (!respuesta.ok) {
          this.errorGeneral = respuesta.error;
          return;
        }
        localStorage.setItem("rol", respuesta.datos.rol);
        localStorage.setItem("usuario", respuesta.datos.email);
        window.location.href = "usuario/dashboard.html";
      } catch (error) {
        this.errorGeneral = "No se pudo iniciar sesión. Intenta de nuevo.";
      } finally {
        this.enviando = false;
      }
    },
  }));
});
```

*Claude ejecutó en la terminal (Append the error styles to login.css and check the changes):*

```bash
python - <<'EOF'
import pathlib
p = pathlib.Path("login/login.css")
raw = p.read_bytes().decode("utf-8")
nl = "\r\n" if "\r\n" in raw else "\n"
extra = """
[x-cloak] {
  display: none !important;
}

.input-error {
  border-color: #b91c1c;
}

.input-error:focus {
  border-color: #b91c1c;
  box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.15);
}

.error-campo {
  display: block;
  margin: -12px 0 14px;
  color: #b91c1c;
  font-size: 13px;
}

.alerta-error {
  margin: 0 0 18px;
  padding: 10px 14px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background-color: #fef2f2;
  color: #b91c1c;
  font-size: 14px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

button:disabled:hover {
  background-color: #1d4ed8;
}
"""
nuevo = raw.rstrip("\r\n") + nl + extra.replace("\n", nl)
antes = raw.rstrip("\r\n")
assert nuevo.startswith(antes)
p.write_bytes(nuevo.encode("utf-8"))
print("lineas:", len(nuevo.splitlines()), "| fin de linea:", repr(nl))
EOF
node --check login/login.js && echo js-ok; git diff --stat | cat
```

*Claude ejecutó en la terminal (Point the old tests at the new login error elements):*

```bash
N=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador; cd $N && python - <<'EOF'
import pathlib
p = pathlib.Path("probar.js"); s = p.read_text(encoding="utf-8")
s = s.replace('(await page.$eval("#mensaje", (e) => e.textContent)).includes("incorrectos")', '(await page.$eval("[role=alert]", (e) => e.textContent)).includes("incorrectos")')
p.write_text(s, encoding="utf-8")
q = pathlib.Path("probar-acceso.js"); t = q.read_text(encoding="utf-8")
t = t.replace('const msg = () => page.$eval("#mensaje", (e) => e.textContent);', 'const msg = () => page.$eval("[role=alert]", (e) => (e.offsetParent !== null ? e.textContent : ""));')
t = t.replace('ok("campos vacios: avisa sin llamar a la API", (await msg()).includes("Ingresa tu email"), await msg());',
              'ok("campos vacios: avisa sin llamar a la API", (await page.$eval("#email-error", (e) => e.textContent)) === "Ingresa tu email.");')
q.write_text(t, encoding="utf-8")
print("#mensaje" in s, "#mensaje" in t)
EOF
```

*Claude creó o reemplazó el archivo `C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\navegador\probar-login.js` con este contenido:*

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

  const texto = (id) => page.$eval(`#${id}-error`, (e) => (e.offsetParent !== null ? e.textContent : ""));
  const aria = (id) => page.$eval(`#${id}`, (e) => e.getAttribute("aria-invalid"));
  const general = () => page.$eval("[role=alert]", (e) => (e.offsetParent !== null ? e.textContent : ""));
  const boton = () => page.$eval("button[type=submit]", (b) => ({ d: b.disabled, t: b.textContent.trim() }));
  const limpiar = (id) => page.$eval(`#${id}`, (e) => { e.value = ""; e.dispatchEvent(new Event("input")); });

  await page.goto(BASE, { waitUntil: "networkidle0" });
  ok("al cargar no se ve ningun error", (await general()) === "" && (await texto("email")) === "" && (await texto("password")) === "");
  ok("el boton dice Entrar al cargar", (await boton()).t === "Entrar");

  await page.click("#email");
  await page.keyboard.type("ana");
  await esperar(150);
  ok("C: mientras escribe por primera vez no hay error", (await texto("email")) === "");
  await page.click("#password");
  await esperar(150);
  ok("C: al salir con email mal escrito muestra error", (await texto("email")) === "Ingresa un email válido.", await texto("email"));
  ok("aria-invalid=true en el email con error", (await aria("email")) === "true");
  ok("aria-describedby apunta al mensaje", (await page.$eval("#email", (e) => e.getAttribute("aria-describedby"))) === "email-error");
  ok("el campo con error queda marcado con borde rojo", await page.$eval("#email", (e) => e.classList.contains("input-error") && getComputedStyle(e).borderTopColor === "rgb(185, 28, 28)"));
  await page.click("#email");
  await page.keyboard.type("@arbitros.cl");
  await esperar(150);
  ok("C: el error se quita mientras corrige", (await texto("email")) === "" && (await aria("email")) === "false");

  await limpiar("email");
  await page.click("#email");
  await page.click("#password");
  await esperar(150);
  ok("email vacio: Ingresa tu email.", (await texto("email")) === "Ingresa tu email.");
  await page.click("#email");
  await esperar(150);
  ok("contraseña vacia al salir: Ingresa tu contraseña.", (await texto("password")) === "Ingresa tu contraseña.");
  await page.type("#password", "abc");
  await esperar(150);
  ok("contraseña corta NO da error en el login", (await texto("password")) === "");

  await limpiar("email"); await limpiar("password");
  await page.click("button[type=submit]");
  await esperar(300);
  ok("Entrar vacio: muestra los dos errores", (await texto("email")) !== "" && (await texto("password")) !== "");
  ok("Entrar vacio: el foco va al primer campo malo (email)", (await page.evaluate(() => document.activeElement.id)) === "email");
  ok("Entrar vacio: no llama a la API ni muestra error general", (await general()) === "" && (await boton()).t === "Entrar");

  await page.type("#email", "admin@futbolapp.cl");
  await page.type("#password", "clavemala");
  await page.click("button[type=submit]");
  await esperar(100);
  const durante = await boton();
  ok("mientras espera: boton deshabilitado y dice Ingresando…", durante.d && durante.t === "Ingresando…", JSON.stringify(durante));
  await esperar(900);
  ok("401: error general arriba del formulario", (await general()) === "Email o contraseña incorrectos.", await general());
  ok("401: el mensaje va en un role=alert antes de los campos", await page.evaluate(() => { const a = document.querySelector("[role=alert]"); return a.compareDocumentPosition(document.getElementById("email")) & Node.DOCUMENT_POSITION_FOLLOWING; }));
  ok("401: el boton vuelve a la normalidad", JSON.stringify(await boton()) === JSON.stringify({ d: false, t: "Entrar" }));
  await page.type("#password", "x");
  await esperar(150);
  ok("401: el error general se borra al volver a escribir", (await general()) === "");

  await limpiar("email"); await limpiar("password");
  await page.type("#email", "noexiste@futbolapp.cl");
  await page.type("#password", "loquesea");
  await page.click("button[type=submit]");
  await esperar(1000);
  ok("email que no existe: el mismo mensaje (no revela cuentas)", (await general()) === "Email o contraseña incorrectos.");

  await page.evaluate(() => { window.iniciarSesionOriginal = window.iniciarSesion; window.iniciarSesion = async () => { await new Promise((r) => setTimeout(r, 300)); throw new Error("caida simulada"); }; });
  await page.type("#password", "y");
  await page.click("button[type=submit]");
  await esperar(700);
  ok("si la API falla: el boton no se queda pegado (finally)", JSON.stringify(await boton()) === JSON.stringify({ d: false, t: "Entrar" }), JSON.stringify(await boton()));
  ok("si la API falla: muestra un error general", (await general()).includes("No se pudo iniciar sesión"), await general());
  await page.evaluate(() => { window.iniciarSesion = window.iniciarSesionOriginal; });

  await limpiar("email"); await limpiar("password");
  await page.type("#email", "arbitro@futbolapp.cl");
  await page.type("#password", "arbitro123");
  await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click("button[type=submit]")]);
  ok("con datos correctos entra al dashboard", new URL(page.url()).pathname === "/usuario/dashboard.html");

  await page.setViewport({ width: 375, height: 800 });
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE, { waitUntil: "networkidle0" });
  await page.click("button[type=submit]");
  await esperar(300);
  ok("375px con errores visibles: sin scroll horizontal", (await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 0);

  await nav.close();
  console.log(res.join("\n"));
  console.log("\nCONSOLA:", errores.length ? "\n" + [...new Set(errores)].join("\n") : "sin errores");
})().catch((e) => { console.log(res.join("\n")); console.error("FALLO:", e.message); process.exit(1); });
```

*Claude ejecutó en la terminal (Start servers and run the new login validation tests):*

```bash
N=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador; cd /c/Users/carlo/Documents/Futbol-desarrollo && (./node_modules/.bin/vite --host 127.0.0.1 --port 5179 --strictPort > $N/vite.log 2>&1 &); (python -m http.server 8766 --bind 127.0.0.1 > $N/static.log 2>&1 &); sleep 4; cd $N && node probar-login.js
```

Falla una prueba: el borde rojo del campo con error. Lo investigo.

*Claude ejecutó en la terminal (Inspect the email field classes and computed border color):*

```bash
node -e '
const p=require("puppeteer-core");(async()=>{const b=await p.launch({executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true});const pg=await b.newPage();await pg.goto("http://127.0.0.1:5179/",{waitUntil:"networkidle0"});await pg.type("#email","ana");await pg.click("#password");await new Promise(r=>setTimeout(r,200));
console.log(await pg.$eval("#email",e=>({clase:e.className,borde:getComputedStyle(e).borderTopColor,ancho:getComputedStyle(e).borderTopWidth})));
const reglas=await pg.evaluate(()=>[...document.styleSheets].flatMap(s=>{try{return [...s.cssRules].map(r=>r.cssText)}catch(e){return []}}).filter(t=>t.includes("input-error")));console.log(reglas);await b.close()})()'
```

*Claude ejecutó en la terminal (Wait for the border transition and run all five suites on both servers):*

```bash
python - <<'EOF'
import pathlib
p = pathlib.Path("probar-login.js"); s = p.read_text(encoding="utf-8")
a = '  ok("el campo con error queda marcado con borde rojo"'
assert s.count(a) == 1
s = s.replace(a, '  await esperar(300);\n' + a)
p.write_text(s, encoding="utf-8")
EOF
for B in http://127.0.0.1:5179/ http://127.0.0.1:8766/; do echo "######## $B"; for t in probar.js probar-admin.js probar-tiempo-real.js probar-acceso.js probar-login.js; do BASE=$B node $t > r.txt 2>&1; grep '^FALLA\|FALLO\|pageerror\|\[error\]\|http 4' r.txt; echo "  $t: $(grep -c '^OK' r.txt) OK de $(grep -c '^OK\|^FALLA' r.txt)"; done; done
```

*Claude ejecutó en la terminal (Stop both test servers):*

```powershell
foreach ($p in 5179, 8766) { $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue; if ($c) { foreach ($id in ($c.OwningProcess | Sort-Object -Unique)) { try { Stop-Process -Id $id -Confirm:$false -ErrorAction Stop; "detenido $p" } catch { "no se pudo $p" } } } }
```

*Claude ejecutó en la terminal (List the changed files and key line numbers):*

```bash
cd /c/Users/carlo/Documents/Futbol-desarrollo && git status --short | cat; grep -n 'x-data="login"\|role="alert"\|alpinejs\|login.js' index.html; wc -l login/login.js | cat
```

Listo, la validación del login quedó como acordamos. **Pasan 142 de 142 pruebas, tanto en Vite como en un servidor igual al de AWS, y la consola quedó sin errores.** No hice commit.

##### Qué cambió

**`index.html`**
- **Línea 19:** el formulario tiene `x-data="login"`, `@submit.prevent="entrar()"` y `novalidate`.
- **Línea 20:** el error general (401) va arriba del formulario, en un `<p role="alert">`.
- **Líneas 21-38:** los campos Email y Contraseña tienen `x-model`, `@blur`, `@input`, el borde rojo con `:class`, `aria-invalid`, `aria-describedby` y su mensaje debajo. El botón tiene `:disabled="enviando"` y cambia el texto a "Ingresando…".
- **Líneas 44-47:** `api.js`, `seguridad.js` y `login.js` se cargan con `defer`, y **Alpine va al final**.

**`login/login.js` (64 líneas):** el componente `login` con `mensajeDe`, `validarCampo`, `revalidar` (que también borra el error general), `validar`, `enfocarPrimerError` y `entrar()` con `try/catch/finally`. Es el código que te mostré, sin cambios.

**`login/login.css` (de Josefa):** solo agregué reglas al final: `[x-cloak]`, `.input-error`, `.error-campo`, `.alerta-error` y `button:disabled`. Lo que ya tenía ella no cambió.

##### Qué probé (24 pruebas nuevas)
- **Al abrir la página:** no aparece ningún error y el botón dice "Entrar".
- **Validación en tiempo real (opción C):** mientras escribes por primera vez no hay error, al salir del campo sí aparece, y se quita mientras lo corriges.
- **Accesibilidad:** `aria-invalid` cambia de valor, `aria-describedby` apunta al mensaje correcto y el campo con error queda con borde rojo.
- **Mensajes:**
  - Email vacío: "Ingresa tu email.". Email mal escrito: "Ingresa un email válido.". Contraseña vacía: "Ingresa tu contraseña.".
  - **Una contraseña corta, como "abc", no muestra error en el login.**
- **Al apretar Entrar con los campos vacíos:** aparecen los dos errores, el foco va al email y no se llama a la API.
- **El error 401:**
  - Aparece arriba de los campos, dentro del `role="alert"`, y **se borra apenas vuelves a escribir**.
  - Con un email que no existe sale **el mismo mensaje**, así que no revela qué cuentas existen.
- **El botón:** mientras espera dice "Ingresando…" y queda deshabilitado. **Simulé una falla de la API**: el botón volvió a la normalidad y apareció el mensaje de error.
- **Con los datos correctos** se entra al dashboard.
- **En celular (375 px), con los errores visibles**, no hay scroll horizontal.

Por si notas que el borde rojo aparece con un pequeño efecto: no es un error, es la animación del CSS de Josefa (`transition` de 0,2 segundos).

Con esto **queda completa tu tarea de "Validación de formularios"** en los dos formularios: el registro de árbitros y el login.

Cuando lo revises, dime si hago el registro de `ia/` antes del commit. Después siguen las tareas sin dueño: la página de "no encontrado" y lo demás.

## Qué se incorporó al proyecto

- El login pasó a ser un componente `Alpine.data("login")` con la misma estructura del registro: `mensajeDe`, `validarCampo`, `revalidar`, `validar` y `enfocarPrimerError`.
- Email obligatorio y con formato; contraseña solo obligatoria, sin mínimo de caracteres, para no dar pistas de cómo son las claves y no dejar fuera cuentas con claves más cortas.
- Errores al salir del campo y revalidación mientras se escribe si ya tenía error; `aria-invalid`, `aria-describedby` y foco en el primer campo malo con `$nextTick`.
- El 401 se muestra como error general arriba del formulario con `role="alert"`, se borra apenas se vuelve a escribir y es el mismo mensaje para email y contraseña, para no revelar qué cuentas existen.
- `enviando` con `try`/`catch`/`finally`, para que el botón nunca se quede en "Ingresando…" si falla la API.
- En `index.html`, Alpine se carga al final con `defer`, después de `api.js`, `seguridad.js` y `login.js`, para que el componente se registre antes de `alpine:init`.
- En `login/login.css` solo se agregaron reglas al final, sin cambiar lo que había.

## Verificación

- Se probó en el navegador (Edge automatizado) con Vite y con un servidor estático como Nginx: 24 pruebas nuevas, más las 118 anteriores, todas bien (142 de 142 en cada servidor) y sin errores en la consola.
- Al cargar no se ve ningún error; al escribir por primera vez tampoco; al salir del campo aparece y se quita mientras se corrige.
- Email vacío, email mal escrito y contraseña vacía muestran su mensaje; una contraseña corta no da error.
- Al apretar Entrar vacío se muestran los dos errores, el foco va al email y no se llama a la API.
- Con una clave incorrecta o un email que no existe aparece el mismo mensaje arriba del formulario, y se borra al volver a escribir.
- Con una falla simulada de la API, el botón vuelve a la normalidad y aparece un error general.
- Con datos correctos se entra al dashboard, y en celular (375 px) no hay scroll horizontal.

## Conclusión: lo que aprendí

Aprendí que reutilizar la misma estructura de validación en dos formularios hace que el código sea más fácil de mantener y de explicar: el login y el registro funcionan igual. También entendí que un login no debería validar lo mismo que un registro: en el registro se exige un mínimo de caracteres para crear una buena clave, pero en el login eso solo daría pistas a alguien que intenta adivinar. Por la misma razón, el mensaje de error es el mismo si falla el email o la contraseña. Por último, vi que el orden de los scripts importa: Alpine tiene que cargarse al final para que los componentes ya estén registrados cuando se dispara `alpine:init`.
