# Registro de cuenta de árbitro

- **Fecha:** 2026-11-09
- **Integrante:** Roberto Sánchez (@waterloozz)
- **Herramienta y modelo:** Claude Code (Claude Opus 5.5)
- **Enlace a la conversación:** no aplica (Claude Code no permite compartir la conversación; el texto completo va abajo)
- **Archivos afectados:** login/registro.html (archivo nuevo, formulario completo); login/registro.js (archivo nuevo, completo); index.html (enlace "Crear cuenta"); login/login.css (estilos de `select` y `.enlace-secundario`)

## Objetivo

La sección 4.1 del PDF pide "Login y registro funcionales, con validación", y el proyecto solo tenía el registro de árbitros que hace el administrador en Usuarios. Faltaba una vista para que una persona cree su propia cuenta antes de iniciar sesión. Le pedí a la IA que me explicara paso a paso cómo hacerla, usando la capa de datos que ya existía.

## Conversación (texto completo, sin editar)

Los prompts 2 a 5 se omiten porque fueron consultas sobre cómo documentar el uso de IA en otras tareas y no aportaron código a esta vista. Se mantiene la numeración original para que se vea el salto. Las respuestas que se incluyen están completas y sin editar; los títulos dentro de ellas se bajaron de nivel para no romper la estructura de este archivo.

### Prompt 1

```text
Vista de registro de cuenta, si el profe la exige (cuando una persona crea su propia cuenta). hagamos eso dime como lo haras
```

### Respuesta 1

Sí, el profe la exige. En la revisión del PDF que hicimos en el otro computador apareció el punto **4.1: "Login y registro funcionales"**. Hoy el proyecto solo tiene el registro de árbitros que hace el administrador; nadie puede crear su propia cuenta. Ese PDF no está en este computador, así que no pude releer el detalle exacto del punto.

**Cómo lo haría:**

1. **Página nueva `login/registro.html`.** Usa el mismo estilo que el login (`login/login.css`), con encabezado azul y formulario centrado, y funciona en móvil.
2. **Campos.** Los mismos que pide el admin: nombre, RUT, email, teléfono, categoría, contraseña y confirmar contraseña. Así la cuenta queda completa y sirve en todo el sistema.
3. **Validación en tiempo real (`login/registro.js`, componente Alpine).** Igual que en el login y en el registro de árbitros: el error aparece al salir del campo y se quita al corregirlo. El cursor va al primer error, el botón se deshabilita mientras guarda y se avisa si el email o el RUT ya existen.
4. **Guardado.** Uso `crearArbitro()`, que ya está en `comun/api.js`: guarda la contraseña con sal + hash, revisa los duplicados y responde 201 o 409. Así **no tengo que tocar `api.js`, `login.js` ni `usuarios.json`**, que Carlos pidió no editar. La cuenta nueva siempre queda con rol árbitro, para que nadie pueda crearse una cuenta de administrador.
5. **Después de registrarse.** La sesión se inicia sola y la persona entra al dashboard, donde la saluda por su nombre.
6. **Enlaces.** Debajo del botón Entrar del login agrego "¿No tienes cuenta? Crear cuenta". En el registro, "¿Ya tienes cuenta? Inicia sesión".
7. **README.** Agrego la vista a la lista y un paso en "Cómo probar".
8. **Pruebas.** En el navegador con `npm run dev`, a 375 y 1280 px. Pruebo errores, duplicados, un registro exitoso y que después se pueda iniciar sesión con esa cuenta.

Lo trabajo en una rama, sin comentarios en el código, y no hago commit hasta que me confirmes.

En la lista de tareas que me pasaste, el registro estaba a cargo de Carlos ("Vista de Registro"). Él ya hizo la parte del administrador, pero conviene que le avises que tú haces esta, para que no la hagan los dos.

### Prompt 6

```text
ayudame a implementar el registro antes del login y explicame paso a paso
```

### Respuesta 6

Vamos por partes. Tú escribes los archivos y yo te explico qué hace cada paso y por qué. Al final lo revisamos juntos.

##### La idea

Una página nueva donde una persona crea su propia cuenta de árbitro antes de iniciar sesión. Son 3 archivos:

| Archivo | Qué hace |
|---|---|
| `login/registro.html` | **Nuevo.** El formulario. |
| `login/registro.js` | **Nuevo.** La lógica con Alpine: validar, guardar y redirigir. |
| `index.html` | Agregar el enlace "Crear cuenta" debajo del botón Entrar. |

**No hay que tocar `api.js`.** Ya existe `crearArbitro(datos)`, que el admin usa en Usuarios. Esa función guarda la contraseña con sal + hash, revisa si el email o el RUT ya existen (responde 409 con `errores` por campo) y responde 201 si todo sale bien. Tu página solo la llama. Así se cumple el punto 5.2: la vista no toca los datos, todo pasa por la capa de servicios.

---

##### Paso 1: `login/registro.html`

Copia la estructura de `index.html`: el mismo `<header>`, el `<main>` y el `<section>`. Así queda con el mismo estilo (C1, diseño consistente). Lo que cambia:

**Las rutas llevan `../`**, porque el archivo está dentro de `login/`:
```html
<link rel="stylesheet" href="login.css">
...
<script src="../comun/api.js" defer></script>
<script src="../comun/seguridad.js" defer></script>
<script src="registro.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js" defer></script>
```
- `seguridad.js` tiene `crearSal()` y `hashearPassword()`, que usa `crearArbitro()`. Si falta, el registro falla.
- Alpine va **al final**: tus scripts tienen que registrar el componente (`alpine:init`) antes de que Alpine arranque.

**El formulario:**
```html
<form x-data="registro" @submit.prevent="registrar()" novalidate>
  <p x-show="errorGeneral" x-cloak role="alert" class="alerta-error" x-text="errorGeneral"></p>
  ...campos...
  <button type="submit" :disabled="enviando" x-text="enviando ? 'Creando cuenta…' : 'Crear cuenta'">Crear cuenta</button>
  <p class="enlace-secundario">¿Ya tienes cuenta? <a href="../index.html">Inicia sesión</a></p>
</form>
```
- `@submit.prevent`: evita que el navegador recargue la página y llama a tu función.
- `novalidate`: apaga los globos de error del navegador, porque los mensajes los muestras tú (A3 pide algo más que "solo validación HTML").
- `:disabled="enviando"`: el botón se bloquea mientras guarda, así nadie crea la cuenta dos veces (4.2).

**Cada campo sigue este patrón.** Míralo en el email del login:
```html
<div>
  <label for="nombre">Nombre completo</label>
  <input type="text" id="nombre" autocomplete="name"
    x-model="form.nombre" @blur="validarCampo('nombre')" @input="revalidar('nombre')"
    :class="errores.nombre ? 'input-error' : ''"
    :aria-invalid="errores.nombre ? 'true' : 'false'" aria-describedby="nombre-error">
  <small id="nombre-error" class="error-campo" x-show="errores.nombre" x-text="errores.nombre"></small>
</div>
```
- `x-model`: une el input con `form.nombre`. Lo que escribes queda en el estado de Alpine.
- `@blur`: valida cuando sales del campo. `@input`: si ya había un error, lo vuelve a revisar mientras corriges.
- `aria-invalid` y `aria-describedby`: el lector de pantalla anuncia el error (C4, accesibilidad).

Repite el patrón para estos campos, cambiando `nombre` por cada uno:

| Campo | `type` | `autocomplete` |
|---|---|---|
| `nombre` | text | name |
| `rut` | text | off |
| `email` | email | email |
| `telefono` | tel | tel |
| `categoria` | `<select>` con `x-for` | — |
| `password` | password | new-password |
| `confirmarPassword` | password | new-password |

Las categorías **no se escriben a mano en el HTML** (5.1). Se generan desde el estado:
```html
<select id="categoria" x-model="form.categoria" @change="validarCampo('categoria')" ...>
  <option value="">Selecciona una categoría</option>
  <template x-for="c in categorias" :key="c">
    <option :value="c" x-text="c"></option>
  </template>
</select>
```

---

##### Paso 2: `login/registro.js`

La forma es la misma que en `login/login.js`. Ábrelo al lado y vas a ver que casi todo se repite.

```js
document.addEventListener("alpine:init", () => {
  const vacio = () => ({ nombre: "", rut: "", email: "", telefono: "", categoria: "", password: "", confirmarPassword: "" });

  Alpine.data("registro", () => ({
    form: vacio(),
    errores: vacio(),
    categorias: ["FIFA", "Primera División", "Primera B", "Segunda División", "Amateur"],
    errorGeneral: "",
    enviando: false,
```
- `vacio()` es una función, no un objeto, para que `form` y `errores` sean **dos objetos distintos**. Si fueran el mismo, escribir en uno cambiaría el otro.

**`mensajeDe(campo)`** devuelve el error de cada campo, o `""` si está bien. Copia las reglas de `admin/registro-arbitros.js` (líneas 41-66), con **un cambio**: borra las llamadas a `rutExiste` y `emailExiste`. Allá el admin tiene la lista cargada; aquí no. Los duplicados los avisa `crearArbitro()` con el 409.

**`validarCampo`, `revalidar`, `validar` y `enfocarPrimerError`:** cópialas de `login.js`. Agrégale una cosa a `revalidar`: si cambia `password`, revisa también `confirmarPassword`, como en `registro-arbitros.js` (líneas 76-78).

**`registrar()`** es lo nuevo:
```js
    async registrar() {
      if (this.enviando) return;
      this.errorGeneral = "";
      if (!this.validar()) {
        this.enfocarPrimerError();
        return;
      }

      this.enviando = true;
      try {
        const respuesta = await crearArbitro(this.form);
        if (respuesta.ok) {
          localStorage.setItem("rol", respuesta.datos.rol);
          localStorage.setItem("usuario", respuesta.datos.email);
          window.location.href = "../usuario/dashboard.html";
          return;
        }
        if (respuesta.errores) {
          Object.assign(this.errores, respuesta.errores);
          this.enfocarPrimerError();
        } else {
          this.errorGeneral = respuesta.error;
        }
      } finally {
        this.enviando = false;
      }
    },
  }));
});
```
- **`await crearArbitro(...)`**: es una promesa (clase de Promesas). Mientras espera los 450 ms, la página sigue respondiendo y el botón dice "Creando cuenta…".
- **Si responde `ok`**: guarda `rol` y `usuario` igual que el login, así la persona entra directo. `sesion.js` del dashboard ve la sesión y la deja pasar.
- **Si trae `errores` (409)**: los copia a los campos. El mensaje "Ya existe un usuario con este email" aparece bajo el email, no como un aviso general.
- **Cualquier otro error** (por ejemplo con `?fallar`): se muestra arriba en `errorGeneral`.
- **`finally`**: siempre vuelve a habilitar el botón, salga bien o mal.
- **Rol:** `crearArbitro()` siempre pone `rol: "arbitro"`, así que nadie puede registrarse como admin.

---

##### Paso 3: el enlace en `index.html`

Debajo del `<div>` del botón Entrar:
```html
<p class="enlace-secundario">¿No tienes cuenta? <a href="login/registro.html">Crear cuenta</a></p>
```
Sin esto la vista no se puede alcanzar desde la interfaz, y el punto 4.3 pide que no haya vistas inalcanzables.

##### Paso 4: CSS en `login/login.css`

Al login le faltan estilos para `select` y para el enlace. Busca la regla `input {` (línea 58) y cambia el selector a `input, select {`. Después agrega:
```css
.enlace-secundario {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
}
```

##### Paso 5: probar

Con `npm run dev`:
1. Aprieta **Crear cuenta** con todo vacío: deben aparecer los errores y el cursor ir al primero.
2. Usa el email `jperez@futbolapp.cl`: debe decir que ya existe.
3. Registra una cuenta válida: debes llegar al dashboard con tu nombre.
4. Cierra sesión y entra con esa cuenta desde el login.
5. Abre `login/registro.html?fallar`: debe aparecer el error arriba.
6. Revisa en 375 px que no haya scroll horizontal.

Después agrega la vista en el README ("Vistas disponibles" y "Cómo probar").

---

**Sobre la IA:** el código de arriba vino de mí. Si lo copias tal cual, el registro tiene que llevar esta conversación y las marcas `[IA]`. Si lo escribes tú, adaptándolo y entendiéndolo, cuenta como consulta y queda mejor documentado.

Cuando tengas los archivos, avísame y los reviso.

### Prompt 7

```text
el profe no confirma si el registro va, lo hago en una rama para que no afecte y quede guardada?
```

### Respuesta 7

Sí, trabajar en una rama es buena idea. Pero ojo: el PDF sí lo pide. La sección **4.1** dice *"Login y registro funcionales, con validación"*, y la rúbrica **A1** nombra "registro o login" entre los flujos principales. Si después no lo integras a `main`, arriesgas puntaje.

**Para crear la rama:**

```bash
git switch -c feat/registro-cuenta
```

**Antes, ojo con un detalle:** tienes un cambio sin commit en `comun/api.js` (los comentarios que quitamos). Si creas la rama así, ese cambio se va contigo a la rama nueva. Tienes dos opciones:

- **Subirlo primero a `main`** (recomendado, porque no tiene que ver con el registro):

```bash
git add comun/api.js
```

```bash
git commit -m "refactor(api): quitar comentarios de la falla simulada"
```

```bash
git push origin main
```

- **Llevarlo a la rama**, si no te importa mezclarlo. En ese caso basta con crear la rama.

**Mientras trabajas en la rama**, haz commits seguidos. La rúbrica E2 valora los commits repartidos en el tiempo. Para que quede guardada en GitHub:

```bash
git push -u origin feat/registro-cuenta
```

**Cuando decidas integrarla:**

```bash
git switch main
```

```bash
git pull
```

```bash
git merge feat/registro-cuenta
```

```bash
git push origin main
```

Así la rama queda guardada en GitHub aunque no la integres todavía, y `main`, que es lo que evalúa el profe, no se ve afectado mientras tanto.

### Prompt 8

```text
no hice la rama pero hice lo otro, lo escribi yo guiandome de ti que hago para el tema de la ia
```

### Respuesta 8

Revisé lo que hiciste. Como `login/registro.js` quedó **prácticamente igual** al código que te pasé, para el profe cuenta como código que vino de la IA y hay que documentarlo. Que lo hayas escrito tú no cambia eso. Lo bueno es que todavía no hiciste commit, así que puedes cumplir la regla completa: código y registro en el mismo commit.

##### Qué hacer, en orden

**1. Traer lo último de `main`.** Carlos subió un commit con sus registros de IA (`d02dabb`). Solo cambia archivos de `ia/`, así que no choca con lo tuyo:
```bash
git pull
```

**2. Crear el registro:** `ia/2026-11-09_tuusuario_registro-cuenta.md`, con tu usuario de GitHub en minúsculas. Usa la plantilla de la sección 10.5:
- **Objetivo:** la sección 4.1 pide "Login y registro funcionales" y el proyecto solo tenía el registro que hace el admin.
- **Conversación completa:** desde tu mensaje *"Vista de registro de cuenta, si el profe la exige…"* hasta *"ayudame a implementar el registro antes del login y explicame paso a paso"*, con mi respuesta. Van todos los prompts y respuestas tal cual, también los de en medio.
- **Qué se incorporó:** `registro.js` casi igual a la respuesta. El HTML lo armaste tú siguiendo el patrón, el enlace en `index.html` y el CSS de `select` y `.enlace-secundario`. Si cambiaste algo, cuéntalo.
- **Verificación:** las pruebas del Paso 5 que hayas hecho de verdad, y qué entiendes del código (`async`/`await`, el 409 con `errores`, `x-model`, por qué `vacio()` es una función).

**3. Agregar la fila en `ia/README.md`**, al final, porque la tabla va ordenada por fecha.

**4. Poner las marcas `[IA]` en el código:**
- `login/registro.js`: `// [IA] inicio · ia/2026-11-09_tuusuario_registro-cuenta.md` en la primera línea y `// [IA] fin` en la última.
- `login/registro.html`: `<!-- [IA] inicio · ... -->` y `<!-- [IA] fin -->` alrededor del `<form>`.
- `index.html`: lo mismo alrededor de la línea del enlace.
- `login/login.css`: `/* [IA] inicio · ... */` y `/* [IA] fin */` alrededor de `.enlace-secundario`.

Esta es la excepción a lo de no poner comentarios: estas marcas las exige la rúbrica.

**5. Un solo commit, con `[IA]` en el mensaje.** Deja fuera `comun/api.js`, porque es otro tema:
```bash
git add login/registro.html login/registro.js index.html login/login.css ia/
```
```bash
git commit -m "feat(login): registro de cuenta de arbitro [IA]"
```

##### Tres cosas más

- **Todavía no probé tu `registro.html`.** Antes del commit, haz las pruebas del Paso 5 o pídeme que la revise en el navegador.
- **Para el texto de la conversación**, si quieres, te lo saco a un archivo tal como quedó, para que lo pegues sin tener que copiarlo a mano.
- **Me falta tu usuario de GitHub** para el nombre del archivo.

## Qué se incorporó al proyecto

- `login/registro.js`: escrito por mí siguiendo la Respuesta 6. Quedó prácticamente igual al código de la respuesta. Las reglas de `mensajeDe()` las copié de `admin/registro-arbitros.js` sin las revisiones de RUT y email repetidos, porque esos duplicados los avisa `crearArbitro()` con el error 409.
- `login/registro.html`: lo armé siguiendo el patrón de campo de la respuesta y la estructura de `index.html`, con los 7 campos (nombre, RUT, email, teléfono, categoría, contraseña y confirmación). Agregué los `placeholder` y el `@blur` en la categoría.
- `index.html`: el enlace "¿No tienes cuenta? Crear cuenta" debajo del botón Entrar.
- `login/login.css`: `select` comparte el estilo de `input`, y la clase nueva `.enlace-secundario`.
- No se modificó `comun/api.js`: la vista usa `crearArbitro()`, que ya existía. La cuenta nueva siempre queda con rol `arbitro`.
- Se descartó por ahora trabajar en una rama aparte (Respuesta 7).

## Verificación

Se probó con `npm run dev` en el navegador. Las pruebas las ejecutó Claude en el navegador integrado de Claude Code, a pedido mío, después de que escribí el código:

- Desde el login, el enlace "Crear cuenta" abre la vista nueva.
- Enviar el formulario vacío muestra los errores por campo y el cursor va al primer campo.
- Con el email `jperez@futbolapp.cl` aparece "Ya existe un usuario con este email." bajo el email y el foco va a ese campo.
- Mientras guarda, el botón queda deshabilitado y dice "Creando cuenta…".
- Con datos válidos se crea la cuenta y entra directo al dashboard, que saluda con el nombre registrado.
- Después de cerrar sesión, se puede iniciar sesión desde el login con el email y la contraseña de la cuenta nueva.
- Con `login/registro.html?fallar` aparece arriba "Error de red simulado. Inténtalo de nuevo." y el botón vuelve a habilitarse.
- En 375 px no hay scroll horizontal y la consola no muestra errores.

Entiendo que `crearArbitro()` devuelve una promesa y por eso se usa `await`; que si responde 409 trae `errores` por campo y se copian a `this.errores` para mostrarlos bajo cada campo; que `x-model` une cada input con `form`; y que `vacio()` es una función para que `form` y `errores` sean objetos distintos.

## Conclusión: lo que aprendí

Aprendí que, si la capa de datos está bien hecha, una vista nueva no necesita tocarla: el registro solo llama a `crearArbitro()`, que ya guardaba la contraseña con sal y hash y revisaba los duplicados. También entendí cómo la vista usa la respuesta de la API: con `ok` decide si entra al dashboard, con el 409 muestra el error bajo el campo que corresponde y con cualquier otro error muestra un aviso general. Por último, vi que reutilizar el mismo patrón del login (`x-model`, `@blur`, `aria-invalid` y el botón deshabilitado mientras se envía) hace que el formulario se comporte igual que el resto del proyecto y sea más fácil de mantener.
