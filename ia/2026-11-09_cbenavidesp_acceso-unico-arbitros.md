# Árbitros en la capa de datos y login con email

- **Fecha:** 2026-11-09
- **Integrante:** Carlos Benavides (@CBenavidesP)
- **Herramienta y modelo:** Claude Code (Claude Opus 5.5)
- **Enlace a la conversación:** no aplica (Claude Code no permite compartir la conversación)
- **Archivos afectados:** public/mocks/usuarios.json (contraseñas pasadas a sal y hash; RUT, teléfono y categoría en los 9 árbitros); comun/api.js (obtenerResumen, líneas 30-31; funciones nuevas desde la línea 146: leerUsuarios, guardarUsuarios, sinClave, obtenerArbitros, crearArbitro, eliminarArbitro e iniciarSesion); admin/registro-arbitros.js (carga desde la API, líneas 18-38; email repetido, líneas 51-55 y 96-99; agregarArbitro, líneas 117-145; borrarArbitro, líneas 163-170); admin/usuarios.html (script api.js, línea 20; estados de cargando y error, líneas 126-144); index.html (campo Email, líneas 21-22; scripts, líneas 36-37); login/login.js (archivo completo); README.md (Web Crypto API en Tecnologías, líneas 23 y 27). Los cambios en api.js, usuarios.json y el login los conversé antes con Roberto.

## Objetivo

Que cada árbitro que registra el administrador tenga un acceso único con su email y su contraseña, sin quitar la cuenta de prueba del árbitro. Para eso los árbitros tenían que dejar de estar escritos en el código y guardarse a través de la capa de datos (`api.js`) en `localStorage`, como pide el PDF de la Entrega 2 (capa de servicios, persistencia y estados de carga, vacío y error). También quise entender por qué el hash no funciona en el servidor de AWS y si `crypto.subtle` estaba permitido, antes de seguir.

## Conversación (texto completo, sin editar)

### Prompt 1

```text
listo, que es lo que sigue para pensar como hacerlo?
```

### Respuesta 1

Para proponerte un plan concreto, reviso cómo están hoy `api.js`, el login y los mocks de usuarios. Solo leo.

_Claude ejecutó en la terminal (Read api.js structure, login.js, the users mock and script tags):_

```bash
cd /c/Users/carlo/Documents/Futbol-desarrollo && git fetch origin 2>&1|tail -1; git status -sb|head -1; grep -n '^const\|^async function\|^function\|localStorage\|return {' comun/api.js | head -40; echo ----; cat login/login.js; echo ----; head -4 public/mocks/usuarios.json; python -c "import json;d=json.load(open('public/mocks/usuarios.json',encoding='utf-8'));print(len(d),'usuarios',[u['rol'] for u in d])"; grep -n 'script' index.html usuario/dashboard.html | head; grep -n 'usuario' comun/api.js | head -5
```

Antes de armar el plan, revisé `usuario/dashboard.html` y **tiene comentarios otra vez** (líneas 9 y 17). Veo en qué commit volvieron.

_Claude ejecutó en la terminal (Check which commit brought comments back and which files still have them):_

```bash
git log --format='%h %an %ad %s' --date=format:'%m-%d %H:%M' -3 -- usuario/dashboard.html | cat; git show --stat --format='%h %s' 24c96b8 | cat; grep -rln '<!--\|^\s*//\|/\*' --include=*.html --include=*.js --include=*.css . | grep -v 'node_modules\|^./ia/'
```

Ya sé qué pasó con los comentarios. En tu commit `24c96b8` subiste solo `admin/`, `comun/seguridad.js` e `ia/`, y la limpieza de los demás archivos quedó sin subir y después se perdió. **5 archivos tienen comentarios otra vez:** `comun/menu.js`, `comun/partidos.js`, `comun/sesion.js`, `usuario/dashboard.html` y `usuario/dashboard.js`. Lo vemos al final; no es urgente.

##### Lo que sigue: árbitros guardados con `api.js` y login con email

Encontré tres cosas en el código que cambian el plan:

- **`public/mocks/usuarios.json` ya tiene 10 usuarios**, cada uno con email, nombre, rol y contraseña (en texto plano). Son 1 admin y 9 árbitros.
- **El login revisa el nombre de usuario** (`arbitro`), no el email, y las dos cuentas están escritas a mano en `login.js`.
- **El dashboard busca el nombre de quien entró en `usuarios.json`**, comparando por `usuario`.

###### Decisión 1: ¿dónde se guardan los árbitros?

| Opción                                          | Cómo funciona                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Un solo recurso `usuarios` (recomendada)** | Los árbitros que registra el admin son usuarios con `rol: "arbitro"`, más sus campos de RUT, teléfono y categoría. El login busca en una sola lista y los 9 árbitros del mock **también pueden entrar**. Es como funciona una base de datos real (una tabla de usuarios), así que en la E3 es más fácil. |
| B. Un `arbitros.json` aparte                    | Más simple de entender, pero el login tendría que buscar en dos listas, y los árbitros del mock no podrían entrar con su email.                                                                                                                                                                          |

###### Decisión 2: ¿quién calcula el hash?

Hoy lo calcula tu vista (`registro-arbitros.js`). **Recomiendo moverlo a `api.js`:** la vista le manda la contraseña a `crearArbitro()` y la capa de datos la hashea, como lo haría un backend. En la E3, cuando `api.js` llame al servidor real, **tu vista no cambia**.

###### Decisión 3: las contraseñas del mock

`usuarios.json` tiene `"password": "admin123"` en texto plano.

- **Pasarlas a sal + hash en el JSON (recomendada).** Las calculo una vez y las guardo. Las contraseñas siguen siendo las mismas y quedan anotadas en el README.
- **Dejarlas en texto plano.** El proyecto del profe lo hace "solo porque es un mock". Pero el login tendría que aceptar dos formatos.

###### Decisión 4: la cuenta `arbitro` / `arbitro123`

Si el login pasa a ser con email, la cuenta de prueba queda como **`arbitro@futbolapp.cl` / `arbitro123`**. ¿Te sirve así, o quieres que el campo acepte **email o nombre de usuario**, para seguir entrando con `arbitro`?

###### Un problema importante: AWS

Si **todas** las contraseñas quedan con hash, el login necesita `crypto.subtle`, y eso **no funciona en `http://54.225.62.198`**. En AWS no podría entrar nadie, ni el admin. Opciones:

- **Ponerle https al servidor**, con un certificado en Nginx.
- **Una función SHA-256 escrita en JavaScript** que funcione en cualquier lado. Son unas 40 líneas más, difíciles de explicar en una interrogación.
- **No usar AWS para la entrega.** El profe revisa con el README y `npm run dev`, y ahí funciona.

###### Lo que habría que hacer (cuando decidas)

1. **`comun/api.js`:** cinco funciones nuevas, todas con el formato `{ ok, status, datos }`:
   - `obtenerArbitros()`.
   - `crearArbitro(datos)`: responde 201, o 409 si el email o el RUT ya existen.
   - `eliminarArbitro(id)`.
   - `iniciarSesion(email, password)`: responde 200, o **401** si la contraseña es incorrecta.
   - Todas guardan en `localStorage`.
2. **`admin/registro-arbitros.js`:**
   - Se borra la lista escrita a mano y se carga con `obtenerArbitros()`.
   - Estados de **cargando** y **error con Reintentar**.
   - Validar que el **email no esté repetido**, ahora que el email sirve para entrar.
3. **`login/login.js` e `index.html`:**
   - Usa `iniciarSesion()`.
   - Guarda `rol`, `usuario` y **nombre** en la sesión.
   - Este paso tiene que cargar `api.js` y `seguridad.js`.
4. **El saludo del dashboard:** `obtenerResumen()` (de Roberto) busca el nombre en el JSON original. Para que salude bien a los árbitros nuevos, habría que buscarlo en la lista guardada, o leer el nombre que guarda el login.

###### Con quién coordinar

`api.js` y el dashboard son de Roberto, y `login.js` es la entrada de todos. Conviene avisarles antes.

Dime qué eliges en las **decisiones 1 a 4** y **qué hacemos con AWS**. Con eso te digo exactamente qué líneas cambiarían, antes de tocar nada.

### Prompt 2

```text
vamos con lo que recomiendas en todas las decisiones

tiene sentido no armar otro lugar aparte para los arbitros si usuarios.json ya tiene los 10 con rol, porque si los guardo en otro lado el dashboard no los va a encontrar cuando busque el nombre de quien entro. mejor que todo salga de la misma fuente y que los nuevos se agreguen ahi (en localStorage a traves de api.js, como hace partidos con su storage key)

lo que si me preocupa es lo de las contraseñas en texto plano en el json. no tiene mucho sentido que yo guarde sal y passwordHash para los nuevos si los de los mocks quedan con la clave a la vista, y ademas el login tendria que revisar de dos formas distintas. hay que ver si pasamos los del json a hash tambien o como lo dejamos

y lo de las cuentas escritas a mano en login.js no deberia seguir asi si ya tenemos el json, pero ese archivo y el dashboard no son mios, asi que si hay que tocarlos dime que hay que cambiar y yo lo hablo con roberto antes

explicame bien el plan y en que lineas va cada cosa antes de tocar los archivos
```

### Respuesta 2

Para darte las líneas exactas, reviso los archivos que se tocarían. Solo leo, no cambio nada.

_Claude ejecutó en la terminal (Collect line numbers in api.js, registro-arbitros.js, usuarios.html, dashboard and login):_

```bash
wc -l comun/api.js | cat; awk 'NR>=1 && NR<=40 {printf "%4d  %s\n", NR, $0}' comun/api.js; echo ...; awk 'NR>=133 {printf "%4d  %s\n", NR, $0}' comun/api.js; echo ====RA; grep -n 'arbitros: \[\|siguienteId\|rutExiste\|init()\|this.arbitros\|crearSal\|hashearPassword\|async agregarArbitro\|eliminarArbitro(id)\|case "email"' admin/registro-arbitros.js; echo ====HTML; grep -n 'seguridad.js\|api.js\|x-for="arb in arbitros"\|arbitros.length === 0\|titulo-lista' admin/usuarios.html; echo ====DASH; grep -n 'obtenerResumen\|localStorage' usuario/dashboard.js; grep -n 'usuario' usuario/perfil.html | head -3; echo ====IDX; grep -n 'id="usuario"\|label for="usuario"\|login.js\|type="text"' index.html
```

Va el plan completo, ordenado por archivo, con lo que cambia y en qué líneas. No toqué nada.

Una aclaración sobre la decisión 4, donde no te di una recomendación clara: como dijiste que entren con email, **el login pasa a pedir email**, y la cuenta de prueba queda como **`arbitro@futbolapp.cl` / `arbitro123`**. La contraseña es la misma; solo cambia cómo se escribe el usuario.

##### Lo que encontré y cambia el plan

- **Los 9 árbitros de `usuarios.json` no tienen RUT, teléfono ni categoría.** Si la tabla de Árbitros los lee de ahí, esas columnas saldrían vacías. Hay que agregarles esos datos.
- **Los árbitros nuevos no tienen campo `usuario`** (el nombre corto, como `jperez`), solo email. Por eso **el email tiene que ser lo que identifica a cada persona**, también para el saludo del dashboard.
- **`admin/usuarios.html` no carga `api.js`**: hay que agregarlo.

##### 1. `public/mocks/usuarios.json` (de Roberto)

- **Contraseñas:** en los 10 usuarios, reemplazar `"password": "admin123"` por `"sal"` y `"passwordHash"`. Los calculo una vez con la misma función de `seguridad.js`. **Las contraseñas no cambian** (`admin123`, `arbitro123`, `jperez123`, etc.), solo dejan de estar a la vista.
- **Los 9 árbitros:** agregarles `rut`, `telefono` y `categoria`, con datos realistas.
- **No se borra nada:** `usuario`, `nombre`, `email` y `rol` siguen igual.

##### 2. `comun/api.js` (de Roberto)

**Todo se agrega al final, después de la línea 144.** No se toca ninguna de sus funciones, salvo dos líneas del resumen.

| Qué se agrega                              | Equivale a                 | Responde                                                                                                                |
| ------------------------------------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Constante `USUARIOS_KEY = "usuarios_data"` | —                          | —                                                                                                                       |
| `leerUsuarios()` (función interna)         | —                          | La primera vez lee `usuarios.json` y lo guarda en `localStorage`; después lee de ahí, igual que los partidos            |
| `obtenerArbitros()`                        | `GET /api/arbitros`        | 200 con los usuarios de rol árbitro, **sin sal ni hash**                                                                |
| `crearArbitro(datos)`                      | `POST /api/arbitros`       | 201 si se creó. **409** si el email o el RUT ya existen. **Aquí se calcula la sal y el hash**, como lo haría un backend |
| `eliminarArbitro(id)`                      | `DELETE /api/arbitros/:id` | 200, o 404 si no existe                                                                                                 |
| `iniciarSesion(email, password)`           | `POST /api/auth/login`     | 200 con el usuario (sin hash), o **401** "Email o contraseña incorrectos"                                               |

**Líneas 30-31 de `obtenerResumen()` (de Roberto):** hoy busca el nombre en el JSON original comparando por `usuario`. Habría que cambiarlas para que use `leerUsuarios()` y compare por **email**. Sin eso, el dashboard no saluda por su nombre a los árbitros nuevos.

##### 3. `admin/registro-arbitros.js` (tuyo)

- **Líneas 18-28:** se borra la lista escrita a mano (Roberto Tobar) y `siguienteId`. Queda `arbitros: []`, más `estado` (cargando, listo o error) y `mensajeError`.
- **Nuevo `init()` y `cargar()`:** al abrir la página, llama a `obtenerArbitros()`.
- **Líneas 41-42 (`case "email"`):** además del formato, valida que el email **no esté repetido**, porque ahora sirve para entrar.
- **Líneas 99-124, `agregarArbitro()`:** ya no calcula el hash. Llama a `crearArbitro()` con los datos y la contraseña.
  - Si responde 201, agrega el árbitro a la tabla.
  - Si responde 409, pone el error en el campo que corresponde.
  - El `try/finally` del botón se mantiene.
- **Líneas 141-144, `eliminarArbitro()`:** pasa a ser `async` y llama a la función de `api.js` antes de quitarlo de la tabla.

##### 4. `admin/usuarios.html` (tuyo)

- **Línea 20:** se agrega `<script src="../comun/api.js" defer>` antes de `seguridad.js`.
- **Líneas 122-155 (tabla):**
  - Se agregan los estados **cargando** (filas grises) y **error con botón Reintentar**, como en Partidos.
  - La tabla se muestra cuando los datos están listos.
  - Esto cumple el criterio B3 en tu vista.

##### 5. Login: `index.html` y `login/login.js` (del equipo)

- **`index.html`, líneas 21-22:** el campo pasa a ser **Email** (`type="email"`, `id="email"`).
- **`index.html`, línea 36:** se cargan `comun/api.js` y `comun/seguridad.js` antes de `login/login.js`.
- **`login/login.js`:** se reemplaza la comparación con las cuentas escritas a mano.
  - Llama a `iniciarSesion(email, password)`.
  - Si responde bien, guarda `rol`, `usuario` (el email) y `nombre` en `localStorage`, y entra.
  - Si responde 401, muestra el error.
- **La validación del login** (mensajes por campo y botón deshabilitado) es tu otra tarea. Se puede hacer en este mismo cambio o después.

##### Qué decirle a Roberto

1. Vas a **agregar funciones al final de `api.js`** y a cambiar **las líneas 30-31 de `obtenerResumen()`**, para que busque por email.
2. En **`usuarios.json`**, las contraseñas pasan a sal + hash y los árbitros reciben RUT, teléfono y categoría.
3. El **login pasa a ser por email** y deja de tener las cuentas escritas a mano.
4. Que no edite `api.js`, `usuarios.json` ni `login.js` hasta que lo subas, para evitar conflictos.

##### Orden de trabajo

1. **Pasos 1 y 2:** `usuarios.json` y `api.js`, después de hablar con Roberto.
2. **Pasos 3 y 4:** tu vista, que depende de las funciones del paso 2.
3. **Paso 5:** el login.

Al terminar cada paso lo pruebo en el navegador, y después se actualizan los endpoints y las credenciales del README.

##### Ten en cuenta

- **En AWS (http), nadie podrá iniciar sesión** después del paso 5, porque el login necesita el hash. En localhost, que es donde revisa el profe, funciona.
- Los árbitros que registraste en tus pruebas no se guardaron en ningún lado, así que **no se pierde nada** al cambiar a `api.js`.

Cuando lo converses con Roberto, dime si partimos por los pasos 1 y 2.

### Prompt 3

```text
dale, ya lo hable con el, comienza
```

### Respuesta 3

Parto por los pasos 1 y 2. Primero reviso que tengas la última versión y leo el mock completo.

_Claude ejecutó en la terminal (Check for new commits and read the users mock):_

```bash
git fetch origin 2>&1|tail -1; git status -sb | cat; git log --oneline HEAD..origin/main | cat; cat public/mocks/usuarios.json
```

_Claude ejecutó en la terminal (Replace plaintext passwords with salt and hash and add referee data to the mock):_

```bash
python - <<'EOF'
import json, hashlib, secrets, pathlib
p = pathlib.Path("public/mocks/usuarios.json")
usuarios = json.loads(p.read_text(encoding="utf-8"))

def dv(n):
    s, m = 0, 2
    for d in reversed(str(n)):
        s += int(d) * m
        m = 2 if m == 7 else m + 1
    r = 11 - s % 11
    return "0" if r == 11 else "K" if r == 10 else str(r)

def rut(n):
    t = f"{n:,}".replace(",", ".")
    return f"{t}-{dv(n)}"

extra = {
    2: (15234871, "+56 9 5123 4401", "Primera División"),
    3: (13876542, "+56 9 6234 1187", "FIFA"),
    4: (19456203, "+56 9 7345 2290", "Primera B"),
    5: (20187634, "+56 9 8456 3312", "Segunda División"),
    6: (19987451, "+56 9 9567 4423", "Amateur"),
    7: (16543298, "+56 9 5678 5534", "Primera División"),
    8: (14765390, "+56 9 6789 6645", "Primera B"),
    9: (18234567, "+56 9 7890 7756", "FIFA"),
    10: (17345612, "+56 9 8901 8867", "Segunda División"),
}
orden = ["id", "usuario", "nombre", "email", "rol", "rut", "telefono", "categoria", "sal", "passwordHash"]
salida = []
for u in usuarios:
    clave = u.pop("password")
    sal = secrets.token_hex(16)
    u["sal"] = sal
    u["passwordHash"] = hashlib.sha256((sal + clave).encode("utf-8")).hexdigest()
    if u["id"] in extra:
        n, tel, cat = extra[u["id"]]
        u["rut"], u["telefono"], u["categoria"] = rut(n), tel, cat
    salida.append({k: u[k] for k in orden if k in u})

lineas = ",\n".join("  " + json.dumps(u, ensure_ascii=False, separators=(", ", ": ")) for u in salida)
p.write_text("[\n" + lineas + "\n]\n", encoding="utf-8", newline="\n")
print(p.read_text(encoding="utf-8")[:900])
EOF
```

Los símbolos raros en la salida son solo cómo la terminal muestra las tildes; el archivo quedó en UTF-8. Lo verifico, y compruebo que cada hash corresponda a su contraseña de siempre.

_Claude ejecutó en la terminal (Verify encoding, that each hash matches its usual password, and RUT format):_

```bash
python -c "
import json,hashlib
d=json.load(open('public/mocks/usuarios.json',encoding='utf-8'))
print('nombre 2:', d[1]['nombre'].encode('unicode_escape'))
ok=all(hashlib.sha256((u['sal']+u['usuario']+'123').encode()).hexdigest()==u['passwordHash'] for u in d)
print('10 hashes coinciden con <usuario>123:', ok, '| ninguno con password:', all('password' not in u for u in d))
print('arbitros con rut/telefono/categoria:', sum(all(k in u for k in ('rut','telefono','categoria')) for u in d if u['rol']=='arbitro'),'de', sum(u['rol']=='arbitro' for u in d))
"; node -e "
const d=require('./public/mocks/usuarios.json');const re=/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/;
console.log('RUT pasan la validacion del formulario:', d.filter(u=>u.rut).every(u=>re.test(u.rut)));
"
```

_Claude ejecutó en la terminal (Check how api.js ends before appending):_

```bash
tail -c 200 comun/api.js | od -c | tail -3
```

El archivo usa saltos de línea de Windows (CRLF), así que agrego el código con el mismo formato para no mezclar.

_Claude creó o reemplazó el archivo `C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\api_usuarios.js` con este contenido:_

```js
const USUARIOS_KEY = "usuarios_data";

async function leerUsuarios() {
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
    return {
      ok: false,
      status: 500,
      error: "No se pudieron cargar los árbitros.",
    };
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
    if (
      usuarios.some(
        (u) => u.rut && normalizarRut(u.rut) === normalizarRut(datos.rut),
      )
    ) {
      errores.rut = "Ya existe un árbitro con este RUT.";
    }
    if (Object.keys(errores).length > 0) {
      return {
        ok: false,
        status: 409,
        error: "Ya existe un usuario con esos datos.",
        errores,
      };
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
    return {
      ok: false,
      status: 500,
      error: error.message || "No se pudo registrar el árbitro.",
    };
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
    const usuario = usuarios.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (
      usuario &&
      (await hashearPassword(password, usuario.sal)) === usuario.passwordHash
    ) {
      const publico = sinClave(usuario);
      return { ok: true, status: 200, datos: publico, data: publico };
    }
    return { ok: false, status: 401, error: "Email o contraseña incorrectos." };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      error: error.message || "No se pudo iniciar sesión.",
    };
  }
}
```

_Claude ejecutó en la terminal (Append the user functions to api.js and update obtenerResumen):_

```bash
python - <<'EOF'
import pathlib
p = pathlib.Path("comun/api.js")
s = p.read_bytes().decode("utf-8")
viejo = '    const usuarios = await pedir("usuarios");\r\n    const nombre = usuarios.find((u) => u.usuario === usuario)?.nombre ?? null;\r\n'
nuevo = '    const usuarios = await leerUsuarios();\r\n    const nombre = usuarios.find((u) => u.email === usuario || u.usuario === usuario)?.nombre ?? null;\r\n'
assert s.count(viejo) == 1
s = s.replace(viejo, nuevo)
extra = pathlib.Path(r"C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\api_usuarios.js").read_text(encoding="utf-8")
s = s.rstrip("\r\n") + "\r\n" + extra.replace("\r\n", "\n").replace("\n", "\r\n")
p.write_bytes(s.encode("utf-8"))
print("ok")
EOF
node --check comun/api.js && echo sintaxis-ok; grep -n 'leerUsuarios();\|u.email === usuario\|^const USUARIOS_KEY\|^async function\|^function' comun/api.js; wc -l comun/api.js
```

_Claude ejecutó en la terminal (Read the parts of registro-arbitros.js that change):_

```bash
awk '{printf "%4d  %s\n", NR, $0}' admin/registro-arbitros.js | sed -n '12,30p;36,45p;76,146p'; file admin/registro-arbitros.js admin/usuarios.html
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\admin\registro-arbitros.js`. Texto que reemplazó:_

```js
    arbitros: [
      {
        id: 1,
        nombre: "Roberto Tobar",
        rut: "12.345.678-5",
        email: "roberto.tobar@arbitros.cl",
        telefono: "+56 9 1234 5678",
        categoria: "FIFA",
      },
    ],
    siguienteId: 2,
    guardando: false,
```

_Texto nuevo:_

```js
    arbitros: [],
    estado: "cargando",
    mensajeError: "",
    guardando: false,

    init() {
      if (typeof redirigiendo !== "undefined" && redirigiendo) return;
      this.cargar();
    },

    async cargar() {
      this.estado = "cargando";
      this.mensajeError = "";
      const respuesta = await obtenerArbitros();
      if (respuesta.ok) {
        this.arbitros = respuesta.datos;
        this.estado = "listo";
      } else {
        this.mensajeError = respuesta.error;
        this.estado = "error";
      }
    },
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\admin\registro-arbitros.js`. Texto que reemplazó:_

```js
        case "email":
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) ? "" : "Ingresa un email válido.";
```

_Texto nuevo:_

```js
        case "email":
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
            return "Ingresa un email válido.";
          }
          return this.emailExiste(f.email) ? "Ya existe un usuario con este email." : "";
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\admin\registro-arbitros.js`. Texto que reemplazó:_

```js
      return this.arbitros.some((a) => limpiar(a.rut) === limpiar(rut));
    },
```

_Texto nuevo:_

```js
      return this.arbitros.some((a) => a.rut && limpiar(a.rut) === limpiar(rut));
    },

    emailExiste(email) {
      const buscado = email.trim().toLowerCase();
      return this.arbitros.some((a) => a.email.toLowerCase() === buscado);
    },
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\admin\registro-arbitros.js`. Texto que reemplazó:_

```js
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
```

_Texto nuevo:_

```js
      try {
        const f = this.form;
        const respuesta = await crearArbitro({
          nombre: f.nombre,
          rut: f.rut,
          email: f.email,
          telefono: f.telefono,
          categoria: f.categoria,
          password: f.password,
        });

        if (!respuesta.ok) {
          if (respuesta.errores) {
            Object.assign(this.errores, respuesta.errores);
            this.enfocarPrimerError();
          }
          notificar(respuesta.error, "error");
          return;
        }

        this.arbitros.push(respuesta.datos);
        notificar(`Árbitro ${respuesta.datos.nombre} registrado correctamente.`);
        this.reiniciarFormulario();
      } catch (error) {
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\admin\registro-arbitros.js`. Texto que reemplazó:_

```js
        alConfirmar: () => this.eliminarArbitro(arbitro.id),
      });
    },

    eliminarArbitro(id) {
      this.arbitros = this.arbitros.filter((a) => a.id !== id);
      notificar("Árbitro eliminado correctamente.");
    },
```

_Texto nuevo:_

```js
        alConfirmar: () => this.borrarArbitro(arbitro.id),
      });
    },

    async borrarArbitro(id) {
      const respuesta = await eliminarArbitro(id);
      if (!respuesta.ok) {
        notificar(respuesta.error, "error");
        return;
      }
      this.arbitros = this.arbitros.filter((a) => a.id !== id);
      notificar("Árbitro eliminado correctamente.");
    },
```

Paso 4: `usuarios.html`. Agrego `api.js` y los estados de cargando y error en la tabla. Leo la sección de la tabla.

_Claude ejecutó en la terminal (Read the scripts, table markup and the loading/error markup used in Partidos):_

```bash
awk 'NR>=14 && NR<=24 {printf "%4d  %s\n", NR, $0}' admin/usuarios.html; awk 'NR>=120 && NR<=160 {printf "%4d  %s\n", NR, $0}' admin/usuarios.html; grep -n 'estado === .cargando.' -A12 usuario/partidos.html | head -16; grep -n "estado === 'error'" -A16 usuario/partidos.html | head -18
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\admin\usuarios.html`. Texto que reemplazó:_

```html
<script src="../comun/componentes.js" defer></script>
<script src="../comun/seguridad.js" defer></script>
```

_Texto nuevo:_

```html
<script src="../comun/componentes.js" defer></script>
<script src="../comun/api.js" defer></script>
<script src="../comun/seguridad.js" defer></script>
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\admin\usuarios.html`. Texto que reemplazó:_

```html
<h2 id="titulo-lista" class="mb-3 text-lg font-semibold">
  Árbitros Registrados
</h2>
<div class="overflow-x-auto"></div>
```

_Texto nuevo:_

```html
<h2 id="titulo-lista" class="mb-3 text-lg font-semibold">
  Árbitros Registrados
</h2>

<div
  x-show="estado === 'cargando'"
  class="space-y-2"
  role="status"
  aria-live="polite"
>
  <span class="sr-only">Cargando árbitros…</span>
  <template x-for="n in 4" :key="n">
    <div
      class="flex animate-pulse gap-3 rounded-md border border-slate-100 p-3"
      aria-hidden="true"
    >
      <div class="h-4 w-1/4 rounded bg-slate-200"></div>
      <div class="h-4 w-1/3 rounded bg-slate-100"></div>
      <div class="h-4 w-1/5 rounded bg-slate-200"></div>
    </div>
  </template>
</div>

<div
  x-show="estado === 'error'"
  x-cloak
  role="alert"
  class="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-red-800 sm:flex-row sm:items-center sm:justify-between"
>
  <p x-text="mensajeError"></p>
  <button
    type="button"
    @click="cargar()"
    class="shrink-0 rounded-md bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
  >
    Reintentar
  </button>
</div>

<div x-show="estado === 'listo'" x-cloak class="overflow-x-auto"></div>
```

_Claude ejecutó en la terminal (Confirm the script order and the new state blocks in usuarios.html):_

```bash
awk 'NR<=25 {printf "%4d  %s\n", NR, $0}' admin/usuarios.html | grep -n 'script\|link'; node --check admin/registro-arbitros.js && echo js-ok; grep -n "estado === 'cargando'\|estado === 'error'\|estado === 'listo'" admin/usuarios.html
```

_Claude ejecutó en la terminal (Check line endings and read the login form):_

```bash
file index.html login/login.js; awk 'NR>=18 && NR<=37 {printf "%4d  %s\n", NR, $0}' index.html
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\index.html`. Texto que reemplazó:_

```html
          <label for="usuario">Usuario</label>
          <input type="text" id="usuario" placeholder="Tu usuario">
        </div>
        <div>
          <label for="password">Contraseña</label>
          <input type="password" id="password" placeholder="Tu contraseña">
```

_Texto nuevo:_

```html
          <label for="email">Email</label>
          <input type="email" id="email" autocomplete="email" placeholder="tu@correo.cl">
        </div>
        <div>
          <label for="password">Contraseña</label>
          <input type="password" id="password" autocomplete="current-password" placeholder="Tu contraseña">
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\index.html`. Texto que reemplazó:_

```html
<script src="login/login.js"></script>
```

_Texto nuevo:_

```html
<script src="comun/api.js"></script>
<script src="comun/seguridad.js"></script>
<script src="login/login.js"></script>
```

_Claude creó o reemplazó el archivo `C:\Users\carlo\Documents\Futbol-desarrollo\login\login.js` con este contenido:_

```js
const form = document.getElementById("formLogin");
const mensaje = document.getElementById("mensaje");
const boton = form.querySelector('button[type="submit"]');

function mostrarMensaje(texto, color) {
  mensaje.textContent = texto;
  mensaje.style.color = color;
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    mostrarMensaje("Ingresa tu email y tu contraseña.", "red");
    return;
  }

  boton.disabled = true;
  boton.textContent = "Ingresando…";
  mostrarMensaje("", "");

  const respuesta = await iniciarSesion(email, password);

  boton.disabled = false;
  boton.textContent = "Entrar";

  if (!respuesta.ok) {
    mostrarMensaje(respuesta.error, "red");
    return;
  }

  localStorage.setItem("rol", respuesta.datos.rol);
  localStorage.setItem("usuario", respuesta.datos.email);
  mostrarMensaje("Bienvenido", "green");
  window.location.href = "usuario/dashboard.html";
});
```

Ahora actualizo mis scripts de prueba. Ya no sirven tal cual: entran con `admin` en vez de email y esperan 1 árbitro en la tabla, y ahora son 9. Además agrego pruebas nuevas para esta parte.

_Claude ejecutó en la terminal (Update the existing test scripts for email login and the 9 mock referees):_

```bash
N=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador; cd $N && python - <<'EOF'
import re, pathlib
for nombre in ["probar.js", "probar-admin.js", "probar-tiempo-real.js"]:
    p = pathlib.Path(nombre); s = p.read_text(encoding="utf-8")
    s = s.replace('page.type("#usuario", "admin")', 'page.type("#email", "admin@futbolapp.cl")')
    s = s.replace('page.type("#usuario", "arbitro")', 'page.type("#email", "arbitro@futbolapp.cl")')
    s = s.replace('page.type("#usuario", "nadie")', 'page.type("#email", "nadie@correo.cl")')
    s = s.replace('document.querySelector("#usuario").value = ""', 'document.querySelector("#email").value = ""')
    s = s.replace('includes("no reconocido")', 'includes("incorrectos")')
    if nombre == "probar.js":
        s = s.replace('ok("tabla parte con 1 arbitro", (await filas()) === 1', 'ok("tabla parte con los 9 arbitros del mock", (await filas()) === 9')
        s = s.replace('ok("arbitro agregado a la tabla", (await filas()) === 2', 'ok("arbitro agregado a la tabla", (await filas()) === 10')
        s = s.replace('ok("arbitro eliminado de la tabla", (await filas()) === 1', 'ok("arbitro eliminado de la tabla", (await filas()) === 9')
        s = s.replace('await page.goto(BASE + "admin/usuarios.html", { waitUntil: "networkidle0" });\n  const filas', 'await page.goto(BASE + "admin/usuarios.html", { waitUntil: "networkidle0" });\n  await page.waitForFunction(() => document.querySelectorAll("tbody tr").length > 1, { timeout: 5000 });\n  const filas', 1)
    if nombre == "probar-admin.js":
        s = s.replace('await page.goto(BASE + "admin/usuarios.html", { waitUntil: "networkidle0" });', 'await page.goto(BASE + "admin/usuarios.html", { waitUntil: "networkidle0" });\n  await page.waitForFunction(() => document.querySelectorAll("tbody tr").length > 1, { timeout: 5000 });')
        s = s.replace('(await filas()) === 2', '(await filas()) === 10').replace('(await filas()) === 1)', '(await filas()) === 9)')
        s = s.replace('const datos = () => page.evaluate(() => JSON.parse(JSON.stringify(Alpine.$data(document.querySelector(\'[x-data="registroArbitros"]\')).arbitros)));',
                      'const datos = () => page.evaluate(() => JSON.parse(localStorage.getItem("usuarios_data")));')
        s = s.replace('await page.waitForFunction(() => document.querySelectorAll(".toast").length === 0, { timeout: 6000 });\n  const botones', 'await page.waitForFunction(() => document.querySelectorAll(".toast").length === 0, { timeout: 6000 });\n  const botones')
    if nombre == "probar-tiempo-real.js":
        s = s.replace('await page.goto(BASE + "admin/usuarios.html", { waitUntil: "networkidle0" });', 'await page.goto(BASE + "admin/usuarios.html", { waitUntil: "networkidle0" });\n  await page.waitForFunction(() => document.querySelectorAll("tbody tr").length > 1, { timeout: 5000 });')
        s = s.replace('.length)) === 2);', '.length)) === 10);')
    p.write_text(s, encoding="utf-8")
    print(nombre, "#usuario" in s)
EOF
grep -n '=== 2\|=== 1)' probar-admin.js probar-tiempo-real.js | head
```

Ahora una prueba nueva para lo que hicimos hoy: el login con email, los árbitros guardados, que un árbitro nuevo pueda entrar con su cuenta, los duplicados, y los estados de cargando y error.

_Claude creó o reemplazó el archivo `C:\Users\carlo\AppData\Local\Temp\claude\36b359e89e990fab\3c0f7c63-81c4-46f2-8803-15e909788f15\scratchpad\navegador\probar-acceso.js` con este contenido:_

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
  let bloquearMock = false;
  await page.setRequestInterception(true);
  page.on("request", (r) =>
    bloquearMock && r.url().includes("usuarios.json")
      ? r.respond({ status: 500, body: "" })
      : r.continue(),
  );
  page.on("pageerror", (e) => errores.push(`[pageerror] ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !bloquearMock)
      errores.push(`[error] ${page.url()} ${m.text()}`);
  });

  const ruta = () => new URL(page.url()).pathname;
  const msg = () => page.$eval("#mensaje", (e) => e.textContent);
  async function entrar(email, clave, navega = true) {
    await page.goto(BASE, { waitUntil: "networkidle0" });
    await page.type("#email", email);
    await page.type("#password", clave);
    if (navega)
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        page.click("button[type=submit]"),
      ]);
    else {
      await page.click("button[type=submit]");
      await esperar(900);
    }
  }
  async function salir() {
    const b = await page.evaluateHandle(() =>
      [...document.querySelectorAll("#menu-principal button")].find((x) =>
        x.textContent.includes("Cerrar"),
      ),
    );
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      b.click(),
    ]);
  }
  const saludo = async () => {
    await page
      .waitForFunction(
        () => document.body.innerText.includes("Partidos totales"),
        { timeout: 6000 },
      )
      .catch(() => {});
    return page.$eval("h1", (h) => h.textContent.trim());
  };
  const filas = () =>
    page.$$eval(
      "tbody tr",
      (t) => t.filter((e) => e.offsetParent !== null).length,
    );

  await page.goto(BASE, { waitUntil: "networkidle0" });
  ok(
    "el login pide Email",
    (await page.$eval("label[for=email]", (l) => l.textContent)) === "Email" &&
      (await page.$eval("#email", (i) => i.type)) === "email",
  );
  await page.click("button[type=submit]");
  await esperar(200);
  ok(
    "campos vacios: avisa sin llamar a la API",
    (await msg()).includes("Ingresa tu email"),
    await msg(),
  );

  await page.type("#email", "admin@futbolapp.cl");
  await page.type("#password", "malaclave");
  await page.click("button[type=submit]");
  await esperar(100);
  const durante = await page.$eval("button[type=submit]", (b) => ({
    d: b.disabled,
    t: b.textContent,
  }));
  ok(
    "mientras valida: boton deshabilitado y dice Ingresando…",
    durante.d && durante.t === "Ingresando…",
    JSON.stringify(durante),
  );
  await esperar(900);
  ok(
    "clave incorrecta: 401 con mensaje claro",
    (await msg()) === "Email o contraseña incorrectos.",
    await msg(),
  );
  ok(
    "despues del error el boton vuelve a la normalidad",
    await page.$eval(
      "button[type=submit]",
      (b) => !b.disabled && b.textContent === "Entrar",
    ),
  );
  ok(
    "clave incorrecta: no guarda sesion",
    await page.evaluate(() => localStorage.getItem("rol") === null),
  );

  await entrar("noexiste@futbolapp.cl", "algo1234", false);
  ok(
    "email que no existe: mismo mensaje 401",
    (await msg()) === "Email o contraseña incorrectos.",
  );

  await entrar("ADMIN@futbolapp.cl", "admin123");
  ok(
    "admin entra con email (sin importar mayusculas)",
    ruta() === "/usuario/dashboard.html",
    ruta(),
  );
  ok(
    "sesion guarda rol admin y el email",
    await page.evaluate(
      () =>
        localStorage.getItem("rol") === "admin" &&
        localStorage.getItem("usuario") === "admin@futbolapp.cl",
    ),
  );
  ok(
    "dashboard saluda al admin por su nombre",
    (await saludo()) === "Bienvenido, Administrador",
    await saludo(),
  );
  ok(
    "la sesion no guarda la sal ni el hash",
    await page.evaluate(
      () =>
        !Object.values(localStorage).some((v) => false) &&
        localStorage.getItem("usuario").indexOf("{") === -1,
    ),
  );

  await page.goto(BASE + "admin/usuarios.html", { waitUntil: "networkidle0" });
  await page.waitForFunction(
    () => document.querySelectorAll("tbody tr").length > 1,
    { timeout: 5000 },
  );
  ok(
    "la tabla carga los 9 arbitros del mock",
    (await filas()) === 9,
    String(await filas()),
  );
  const celdas = await page.$$eval("tbody tr", (t) =>
    t
      .filter((e) => e.offsetParent !== null)
      .map((tr) => [...tr.children].map((c) => c.textContent.trim())),
  );
  ok(
    "ningun arbitro tiene RUT, telefono o categoria vacio",
    celdas.every((c) => c[2] && c[4] && c[5]),
  );
  ok(
    "el admin no aparece en la tabla de arbitros",
    !celdas.some((c) => c[3] === "admin@futbolapp.cl"),
  );
  const vista = await page.evaluate(() =>
    JSON.parse(
      JSON.stringify(
        Alpine.$data(document.querySelector('[x-data="registroArbitros"]'))
          .arbitros,
      ),
    ),
  );
  ok(
    "la vista no recibe sal ni passwordHash",
    vista.every((a) => !("sal" in a) && !("passwordHash" in a)),
  );

  await page.type("#arbEmail", "jperez@futbolapp.cl");
  await page.click("#arbNombre");
  await esperar(150);
  ok(
    "email repetido de un arbitro: error al salir del campo",
    (await page.$eval("#arbEmail-error", (e) => e.textContent)).includes(
      "Ya existe",
    ),
  );
  await page.$eval("#arbEmail", (e) => {
    e.value = "";
    e.dispatchEvent(new Event("input"));
  });

  const llenar = async (nombre, rut, email, clave) => {
    for (const id of [
      "arbNombre",
      "arbRut",
      "arbEmail",
      "arbTelefono",
      "arbPassword",
      "arbConfirmarPassword",
    ]) {
      await page.$eval("#" + id, (e) => {
        e.value = "";
        e.dispatchEvent(new Event("input"));
      });
    }
    await page.type("#arbNombre", nombre);
    await page.type("#arbRut", rut);
    await page.type("#arbEmail", email);
    await page.type("#arbTelefono", "+56 9 4444 5555");
    await page.select("#arbCategoria", "FIFA");
    await page.type("#arbPassword", clave);
    await page.type("#arbConfirmarPassword", clave);
  };
  const confirmar = async () => {
    await page.click("form button[type=submit]");
    await esperar(300);
    await page.evaluate(() =>
      [...document.querySelectorAll(".modal-boton")]
        .find((b) => b.textContent.trim() === "Registrar")
        .click(),
    );
    await esperar(1000);
  };

  await llenar(
    "Usuario Duplicado",
    "21.111.111-1",
    "admin@futbolapp.cl",
    "clave1234",
  );
  await confirmar();
  ok(
    "email del admin: la API responde 409 y marca el campo",
    (await page.$eval("#arbEmail-error", (e) => e.textContent)).includes(
      "Ya existe",
    ),
  );
  ok("con 409 no se agrega a la tabla", (await filas()) === 9);

  await llenar("Ana Perez", "11.111.111-1", "ana@arbitros.cl", "clave1234");
  await confirmar();
  ok(
    "registrar arbitro nuevo: aparece en la tabla",
    (await filas()) === 10,
    String(await filas()),
  );
  const guardada = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("usuarios_data")).find(
      (u) => u.email === "ana@arbitros.cl",
    ),
  );
  ok(
    "en localStorage tiene sal y hash, y no la clave",
    guardada &&
      /^[0-9a-f]{32}$/.test(guardada.sal) &&
      /^[0-9a-f]{64}$/.test(guardada.passwordHash) &&
      !JSON.stringify(guardada).includes("clave1234"),
  );
  ok(
    "se guarda con rol arbitro e id nuevo",
    guardada.rol === "arbitro" && guardada.id === 11,
    `rol=${guardada.rol} id=${guardada.id}`,
  );

  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForFunction(
    () => document.querySelectorAll("tbody tr").length > 1,
    { timeout: 5000 },
  );
  ok("al recargar la pagina el arbitro sigue ahi", (await filas()) === 10);

  await salir();
  ok(
    "cerrar sesion no borra los arbitros",
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("usuarios_data")).length === 11,
    ),
  );

  await entrar("ana@arbitros.cl", "clave1234");
  ok(
    "el arbitro nuevo entra con su propio email y clave",
    ruta() === "/usuario/dashboard.html",
    ruta(),
  );
  ok(
    "el arbitro nuevo entra con rol arbitro",
    await page.evaluate(() => localStorage.getItem("rol") === "arbitro"),
  );
  ok(
    "el dashboard lo saluda por su nombre",
    (await saludo()) === "Bienvenido, Ana Perez",
    await saludo(),
  );
  const links = await page.$$eval("#menu-principal a", (as) =>
    as.map((a) => a.textContent.trim()),
  );
  ok(
    "el arbitro nuevo no ve Usuarios en el menu",
    !links.includes("Usuarios"),
    links.join(","),
  );
  await page.goto(BASE + "admin/usuarios.html", { waitUntil: "networkidle0" });
  ok(
    "el arbitro nuevo no puede entrar a admin",
    ruta() === "/usuario/dashboard.html",
  );
  await salir();

  await entrar("ana@arbitros.cl", "otraclave", false);
  ok(
    "el arbitro nuevo con clave mala no entra",
    (await msg()) === "Email o contraseña incorrectos.",
  );

  await entrar("arbitro@futbolapp.cl", "arbitro123");
  ok(
    "la cuenta de prueba arbitro sigue funcionando",
    ruta() === "/usuario/dashboard.html",
  );
  ok(
    "saluda a la cuenta de prueba",
    (await saludo()) === "Bienvenido, Árbitro de prueba",
    await saludo(),
  );
  await salir();
  await entrar("jperez@futbolapp.cl", "jperez123");
  ok(
    "un arbitro del mock tambien puede entrar",
    ruta() === "/usuario/dashboard.html",
  );
  await salir();

  await entrar("admin@futbolapp.cl", "admin123");
  await page.goto(BASE + "admin/usuarios.html", { waitUntil: "networkidle0" });
  await page.waitForFunction(
    () => document.querySelectorAll("tbody tr").length > 1,
    { timeout: 5000 },
  );
  const fila = await page.evaluateHandle(() =>
    [...document.querySelectorAll("tbody tr")]
      .find((tr) => tr.textContent.includes("ana@arbitros.cl"))
      .querySelector("button"),
  );
  await page.waitForFunction(
    () => document.querySelectorAll(".toast").length === 0,
    { timeout: 6000 },
  );
  await fila.click();
  await esperar(300);
  await page.evaluate(() =>
    [...document.querySelectorAll(".modal-boton")]
      .find((b) => b.textContent.trim() === "Eliminar")
      .click(),
  );
  await esperar(1000);
  ok("eliminar arbitro: sale de la tabla", (await filas()) === 9);
  ok(
    "eliminar arbitro: sale de localStorage",
    await page.evaluate(
      () =>
        !JSON.parse(localStorage.getItem("usuarios_data")).some(
          (u) => u.email === "ana@arbitros.cl",
        ),
    ),
  );
  await salir();
  await entrar("ana@arbitros.cl", "clave1234", false);
  ok(
    "un arbitro eliminado ya no puede entrar",
    (await msg()) === "Email o contraseña incorrectos.",
  );

  await entrar("admin@futbolapp.cl", "admin123");
  await page.evaluate(() => localStorage.removeItem("usuarios_data"));
  bloquearMock = true;
  await page.goto(BASE + "admin/usuarios.html", {
    waitUntil: "domcontentloaded",
  });
  await esperar(150);
  ok(
    "estado cargando visible mientras espera",
    await page.evaluate(() =>
      [...document.querySelectorAll('[role="status"]')].some(
        (e) =>
          e.offsetParent !== null &&
          e.textContent.includes("Cargando árbitros"),
      ),
    ),
  );
  await esperar(1200);
  ok(
    "si falla la carga: estado de error con Reintentar",
    await page.evaluate(() => {
      const a = document.querySelector('[role="alert"]');
      return (
        a && a.offsetParent !== null && a.textContent.includes("Reintentar")
      );
    }),
  );
  bloquearMock = false;
  await page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .find((b) => b.textContent.trim() === "Reintentar")
      .click(),
  );
  await page
    .waitForFunction(() => document.querySelectorAll("tbody tr").length > 1, {
      timeout: 5000,
    })
    .catch(() => {});
  ok(
    "Reintentar vuelve a cargar los arbitros",
    (await filas()) === 9,
    String(await filas()),
  );

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

_Claude ejecutó en la terminal (Check JS syntax, start servers and run the new access tests):_

```bash
N=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador; cd /c/Users/carlo/Documents/Futbol-desarrollo && for f in comun/*.js admin/*.js login/*.js usuario/*.js; do node --check $f || echo "ERROR $f"; done; (./node_modules/.bin/vite --host 127.0.0.1 --port 5179 --strictPort > $N/vite.log 2>&1 &); (python -m http.server 8766 --bind 127.0.0.1 > $N/static.log 2>&1 &); sleep 4; cd $N && node probar-acceso.js
```

Pasan las 38 pruebas nuevas. Ahora corro todas las suites en los dos servidores, para confirmar que no se rompió nada de lo anterior.

_Claude ejecutó en la terminal (Run all four browser test suites on both servers):_

```bash
for B in http://127.0.0.1:5179/ http://127.0.0.1:8766/; do echo "######## $B"; for t in probar.js probar-admin.js probar-tiempo-real.js probar-acceso.js; do BASE=$B node $t > r.txt 2>&1; grep '^FALLA\|FALLO\|pageerror\|\[error\]\|http 4' r.txt; echo "  $t: $(grep -c '^OK' r.txt) OK de $(grep -c '^OK\|^FALLA' r.txt)"; done; done
```

_Claude ejecutó en la terminal (Add waits for the API latency in old tests and rerun all suites):_

```bash
N=/c/Users/carlo/AppData/Local/Temp/claude/36b359e89e990fab/3c0f7c63-81c4-46f2-8803-15e909788f15/scratchpad/navegador; cd $N && python - <<'EOF'
import pathlib
p = pathlib.Path("probar.js"); s = p.read_text(encoding="utf-8")
a = '  await page.type("#password", "x");\n  await page.click("button[type=submit]");\n'
assert s.count(a) == 1
s = s.replace(a, a + '  await esperar(900);\n')
s = s.replace('await page.evaluate(() => [...document.querySelectorAll(".modal-boton")].find((b) => b.textContent.trim() === "Registrar").click());\n  await esperar(400);',
              'await page.evaluate(() => [...document.querySelectorAll(".modal-boton")].find((b) => b.textContent.trim() === "Registrar").click());\n  await esperar(1000);')
s = s.replace('.find((b) => b.textContent.trim() === "Eliminar").click());\n  await esperar(400);\n  ok("arbitro eliminado',
              '.find((b) => b.textContent.trim() === "Eliminar").click());\n  await esperar(1000);\n  ok("arbitro eliminado')
p.write_text(s, encoding="utf-8")
q = pathlib.Path("probar-admin.js"); t = q.read_text(encoding="utf-8")
t = t.replace('.find((b) => b.textContent.trim() === "Eliminar").click());\n  await esperar(400);', '.find((b) => b.textContent.trim() === "Eliminar").click());\n  await esperar(1000);')
q.write_text(t, encoding="utf-8")
print("ok")
EOF
for B in http://127.0.0.1:5179/ http://127.0.0.1:8766/; do echo "######## $B"; for t in probar.js probar-admin.js probar-tiempo-real.js probar-acceso.js; do BASE=$B node $t > r.txt 2>&1; grep '^FALLA\|FALLO\|pageerror\|\[error\]\|http 4' r.txt; echo "  $t: $(grep -c '^OK' r.txt) OK de $(grep -c '^OK\|^FALLA' r.txt)"; done; done
```

Pasan las 118 pruebas en los dos servidores. Apago los servidores y saco las líneas exactas para explicarte los cambios.

_Claude ejecutó en la terminal (Stop both test servers):_

```powershell
foreach ($p in 5179, 8766) { $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue; if ($c) { foreach ($id in ($c.OwningProcess | Sort-Object -Unique)) { try { Stop-Process -Id $id -Confirm:$false -ErrorAction Stop; "detenido $p" } catch { "no se pudo $p" } } } }
```

_Claude ejecutó en la terminal (List changed files and line numbers of each change):_

```bash
cd /c/Users/carlo/Documents/Futbol-desarrollo && git status --short | cat; git diff --stat | cat; grep -n 'arbitros: \[\],\|init() {\|async cargar() {\|case "email"\|emailExiste(email) {\|async agregarArbitro() {\|crearArbitro({\|respuesta.errores\|async borrarArbitro\|await eliminarArbitro' admin/registro-arbitros.js; grep -n "estado === \|api.js" admin/usuarios.html; grep -n 'for="email"\|id="email"\|api.js\|seguridad.js\|login.js' index.html; wc -l login/login.js
```

Terminé los 5 pasos. **Pasan las 118 pruebas, tanto en Vite como en un servidor igual al de AWS, y la consola quedó sin errores.** No hice commit.

##### Qué cambió en cada archivo

**1. `public/mocks/usuarios.json` (de Roberto)**

- En los 10 usuarios, `password` se reemplazó por `sal` y `passwordHash`. **Las contraseñas son las mismas de siempre** (`admin123`, `arbitro123`, `jperez123`…). Lo comprobé recalculando los 10 hashes.
- Los 9 árbitros ahora tienen `rut` (con dígito verificador válido), `telefono` y `categoria`.

**2. `comun/api.js` (de Roberto)**

- **Líneas 30-31, `obtenerResumen()`:** busca el nombre en la lista guardada y compara por email o por nombre de usuario. Así el dashboard saluda también a los árbitros nuevos.
- **Desde la línea 146:** todo esto es nuevo y no toca nada de lo anterior.
  - `USUARIOS_KEY`.
  - `leerUsuarios()`: la primera vez lee el JSON, y después lee de `localStorage`, siempre con su demora de 450 ms.
  - `guardarUsuarios()`.
  - `sinClave()`: quita la sal y el hash antes de entregarle un usuario a una vista.
  - `obtenerArbitros()`: responde 200.
  - `crearArbitro()`: responde 201, o **409** si el email o el RUT ya existen. **Aquí se calcula el hash.**
  - `eliminarArbitro()`: responde 200 o 404.
  - `iniciarSesion()`: responde 200, o **401** con "Email o contraseña incorrectos.".

**3. `admin/registro-arbitros.js` (tuyo)**

- **Líneas 18-38:** se borró la lista escrita a mano. Ahora hay `arbitros: []`, `estado` y `mensajeError`, y `init()` y `cargar()` llaman a `obtenerArbitros()` al abrir la página.
- **Líneas 51-55:** el email, además del formato, se revisa para que no esté repetido (`emailExiste`, líneas 96-99).
- **Líneas 117-145, `agregarArbitro()`:**
  - Ya no calcula el hash: llama a `crearArbitro()`.
  - Si la API responde 409, pone el error en el campo que corresponde y enfoca ese campo.
  - El `try/finally` del botón se mantiene.
- **Líneas 163-170, `borrarArbitro()`:** antes se llamaba `eliminarArbitro`. Lo renombré para que no se confunda con la función de `api.js`, a la que ahora llama antes de quitar el árbitro de la tabla.

**4. `admin/usuarios.html` (tuyo)**

- **Línea 20:** carga `../comun/api.js`.
- **Líneas 126-144:** los estados **cargando** (filas grises) y **error con Reintentar**. La tabla se muestra cuando los datos están listos.

**5. Login: `index.html` y `login/login.js` (del equipo)**

- **`index.html`, líneas 21-22:** el campo ahora es **Email**.
- **`index.html`, líneas 36-37:** carga `api.js` y `seguridad.js` antes de `login.js`.
- **`login/login.js` (39 líneas):** ya no tiene cuentas escritas a mano.
  - Si hay campos vacíos, avisa.
  - Llama a `iniciarSesion()`. Mientras espera, el botón queda deshabilitado y dice "Ingresando…".
  - Si entra bien, guarda `rol` y `usuario` (el email).

`README.md` también aparece modificado: es el cambio de la Web Crypto API que hicimos antes.

##### Qué probé (38 pruebas nuevas)

- **Login:**
  - Pide Email y avisa si hay campos vacíos.
  - Con clave mala responde 401, no guarda la sesión y el botón vuelve a la normalidad.
  - El email funciona sin importar mayúsculas.
- **Cuentas:** el admin, la cuenta de prueba `arbitro@futbolapp.cl` / `arbitro123` y un árbitro del mock (`jperez`) entran, y el dashboard **saluda a cada uno por su nombre**.
- **Tabla de árbitros:**
  - Carga los 9 del mock, con todos sus datos, y sin el admin.
  - La vista **nunca recibe la sal ni el hash**.
- **Duplicados:**
  - Un email repetido de un árbitro se detecta al salir del campo.
  - El email del admin lo detiene la API con 409.
- **Árbitro nuevo, de principio a fin:**
  - Se registra y se guarda con hash en `localStorage`, **sigue ahí al recargar y al cerrar sesión**.
  - **Entra con su propio email y clave**, el dashboard lo saluda por su nombre, no ve Usuarios en el menú y no puede entrar a la página de admin.
  - Con clave mala no entra.
- **Eliminar:** sale de la tabla y de `localStorage`, y después **ya no puede entrar**.
- **Estados:** se ve el de cargando, y al fallar la carga del mock aparece el error; **Reintentar** vuelve a cargar.

##### Para tener en cuenta

- **Las credenciales cambian:** ahora se entra con `admin@futbolapp.cl` / `admin123` y `arbitro@futbolapp.cl` / `arbitro123`. **Avísale al equipo.** El README hay que actualizarlo cuando lo terminemos.
- **Si alguien ya había abierto la página antes**, su `localStorage` no tiene usuarios guardados, así que se cargan del JSON nuevo sin problema.
- **En AWS (http) no se va a poder iniciar sesión** después de subir esto, como vimos.
- **Validación del login:** por ahora solo revisa campos vacíos y deshabilita el botón. Los mensajes por campo quedaron para después, como dijiste.

Para ver los cambios: **Ctrl + Shift + G** en VS Code. Cuando lo revises, dime si hago el registro de `ia/` antes del commit, como la vez anterior.

## Qué se incorporó al proyecto

- Un solo recurso de usuarios: los árbitros nuevos se agregan a la misma lista de `usuarios.json`, guardada en `localStorage` con la clave `usuarios_data`, igual que los partidos. Así el dashboard encuentra el nombre de quien entra.
- Las contraseñas de los 10 usuarios del mock pasaron a sal y hash (las claves son las mismas), para que el login revise todo de una sola forma.
- El hash se calcula en `api.js` (`crearArbitro` e `iniciarSesion`) y no en la vista, como lo haría un backend. Las respuestas siguen el formato de la capa (`ok`, `status`, `datos`), con 201, 409, 404 y 401.
- La vista de árbitros carga la lista con `obtenerArbitros()`, muestra los estados de cargando y de error con Reintentar, valida que el email no esté repetido y muestra en el campo los errores 409 de la API.
- El login pide email, usa `iniciarSesion()`, deshabilita el botón mientras espera y guarda `rol` y `usuario` (el email). La cuenta de prueba quedó como `arbitro@futbolapp.cl` / `arbitro123`.
- `obtenerResumen()` busca el nombre en la lista guardada, por email o por nombre de usuario.
- En el README se agregó la Web Crypto API en Tecnologías, con la nota de que solo funciona en localhost o https.
- El método del componente que elimina pasó a llamarse `borrarArbitro()`, para no confundirse con la función `eliminarArbitro()` de `api.js`.
- Queda pendiente: los mensajes de validación por campo del login y actualizar las credenciales y los endpoints del README.

## Verificación

- Se probó en el navegador (Edge automatizado) con Vite y con un servidor estático como Nginx: 38 pruebas nuevas, más las 80 anteriores, todas bien (118 de 118 en cada servidor) y sin errores en la consola.
- Se comprobó que los 10 hashes del mock corresponden a sus contraseñas de siempre y que los RUT pasan la validación del formulario.
- El admin, la cuenta de prueba y un árbitro del mock entran con email, y el dashboard saluda a cada uno por su nombre. Con una clave incorrecta responde 401 y no guarda la sesión.
- Un árbitro registrado por el admin queda guardado al recargar y al cerrar sesión, entra con su propio email y clave, no ve Usuarios ni puede entrar a la página de admin; al eliminarlo, ya no puede entrar.
- La vista nunca recibe la sal ni el hash. Los emails repetidos se detectan al salir del campo o con el 409 de la API.
- Al fallar la carga del mock aparece el error, y Reintentar vuelve a cargar la lista.
- Entiendo que en AWS (http) el login no va a funcionar porque `crypto.subtle` solo existe en localhost o https, y que en la Entrega 3 el hash se hará en el servidor.

## Conclusión: lo que aprendí

Aprendí que conviene que los datos salgan de una sola fuente: si los árbitros estuvieran en un archivo aparte, el login y el dashboard tendrían que buscar en dos lugares. También entendí que la capa de datos simula ser un backend, por eso el hash quedó en `api.js` y no en la vista: en la Entrega 3 solo hay que cambiar lo que hay dentro de `api.js` y las vistas siguen iguales. Vi la diferencia entre los códigos que responde la API (201 al crear, 409 si ya existe, 401 si la clave es incorrecta) y cómo usarlos en la interfaz.
