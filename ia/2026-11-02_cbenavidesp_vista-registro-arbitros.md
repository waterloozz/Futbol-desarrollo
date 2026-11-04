# Formulario y tabla del Registro de Árbitros

- **Fecha:** 2026-11-02
- **Integrante:** Carlos Benavides (@CBenavidesP)
- **Herramienta y modelo:** Claude Code (Claude Opus 5.5)
- **Enlace a la conversación:** no aplica (Claude Code no permite compartir la conversación; el texto completo va abajo)
- **Archivos afectados:** index.html (enlace en el <nav> y sección #registro-arbitros; después se movió a usuarios.html y se quitó de index.html el mismo día); style.css (clases .error-texto, .input-error, .form-acciones y .tabla-arbitros, que después se quitaron porque ya no se usaban)

## Objetivo

Ya tenía el estado del componente, pero faltaba la parte visual: el formulario con sus campos conectados con `x-model`, los mensajes de error, los botones y la tabla de árbitros generada desde los datos. Consulté a la IA para que me diera el HTML y el CSS exactos usando las directivas de Alpine correctamente.

## Conversación (texto completo, sin editar)

Entre el Prompt 1 y el Prompt 2 hubo mensajes sobre la configuración de la herramienta (instrucciones permanentes) que no aportaron código, por eso no se incluyen.

### Prompt 1

```text
Hola. Para el proyecto del ramo de desarrollo web estoy usando Alpine.js cargado por CDN.

Ya tengo listo el archivo registro-arbitros.js donde registre el componente "registroArbitros". Este componente ya tiene en su estado:
- form: con nombre, rut, email, telefono y categoria.
- errores: con los mensajes de validacion de cada campo.
- categorias: la lista de categorias ("FIFA", "Primera División", etc.).
- arbitros: el arreglo con la lista de arbitros.
- los metodos solicitarGuardado() y reiniciarFormulario().

Ahora necesito agregar la parte visual en index.html y sus estilos en style.css.

1. En index.html:
- Agregar en el <nav> el enlace al registro: <a href="#registro-arbitros">Registro de Árbitros</a>.
- Crear una seccion <section id="registro-arbitros" x-data="registroArbitros"> dentro de <main>.
- Armar el formulario con @submit.prevent="solicitarGuardado()":
  * Inputs para: nombre, rut, email y telefono con su label respectivo.
  * Un <select> para la categoria con una opcion por defecto ("Selecciona una categoría") y el resto iteradas con un <template x-for="cat in categorias" :key="cat">.
  * Todos los campos enlazados con x-model a su respectivo form.<campo>.
  * Si el campo tiene error, que agregue la clase "input-error" condicionalmente (:class="errores.<campo> ? 'input-error' : ''").
  * Debajo de cada input un <small class="error-texto" x-show="errores.<campo>" x-text="errores.<campo>"></small>.
  * Dos botones juntos: uno tipo submit para "Guardar Árbitro" y otro secundario con @click="reiniciarFormulario()" para "Limpiar".
- Debajo del formulario, una tabla que liste los arbitros registrados:
  * Columnas: ID, Nombre, RUT, Email, Teléfono, Categoría.
  * Un <tbody> con <template x-for="arb in arbitros" :key="arb.id"> mostrando cada dato con x-text.
  * Un mensaje con x-show="arbitros.length === 0" por si no hay arbitros.

2. En style.css:
- Estilos para los errores: la clase .error-texto en rojo (#b91c1c), letra chica (12px) y en bloque.
- Clase .input-error para pintar el borde del input en rojo cuando la validacion falle.
- Un contenedor flex para que los dos botones del formulario queden alineados con un espacio entre ellos.
- Estilos limpios para la tabla (espaciado en celdas y bordes ordenados).

Por favor no uses emojis ni agregues librerias externas, solo CSS puro y las etiquetas de Alpine.js. Entregame los fragmentos exactos para pegarlos en index.html y style.css.
```

### Respuesta 1

*Claude ejecutó en la terminal (Read index.html, style.css and registro-arbitros.js):*

```bash
cat index.html; echo ======; cat style.css; echo ======; cat registro-arbitros.js
```

Te dejo los fragmentos listos para pegar. **No modifiqué ningún archivo.** Los armé a partir de tu `index.html`, `style.css` y `registro-arbitros.js`, con los mismos nombres de variables que ya usa el componente.

##### 1. `index.html`

###### a) Enlace en el `<nav>`
Pégalo justo después de `<a href="#acta">Acta Oficial</a>`:

```html
      <a href="#registro-arbitros">Registro de Árbitros</a>
```

###### b) Sección de registro
Pégala dentro de `<main>`, después del cierre `</section>` de `#acta` y antes de `</main>`:

```html
    <section id="registro-arbitros" x-data="registroArbitros">
      <h2>Registro de Árbitros</h2>

      <form @submit.prevent="solicitarGuardado()" novalidate>
        <div>
          <label for="arbNombre">Nombre completo</label>
          <input type="text" id="arbNombre" placeholder="Ej: Roberto Tobar" x-model="form.nombre" :class="errores.nombre ? 'input-error' : ''">
          <small class="error-texto" x-show="errores.nombre" x-text="errores.nombre"></small>
        </div>

        <div>
          <label for="arbRut">RUT</label>
          <input type="text" id="arbRut" placeholder="Ej: 12.345.678-5" x-model="form.rut" :class="errores.rut ? 'input-error' : ''">
          <small class="error-texto" x-show="errores.rut" x-text="errores.rut"></small>
        </div>

        <div>
          <label for="arbEmail">Email</label>
          <input type="email" id="arbEmail" placeholder="Ej: nombre@arbitros.cl" x-model="form.email" :class="errores.email ? 'input-error' : ''">
          <small class="error-texto" x-show="errores.email" x-text="errores.email"></small>
        </div>

        <div>
          <label for="arbTelefono">Teléfono</label>
          <input type="tel" id="arbTelefono" placeholder="Ej: +56 9 1234 5678" x-model="form.telefono" :class="errores.telefono ? 'input-error' : ''">
          <small class="error-texto" x-show="errores.telefono" x-text="errores.telefono"></small>
        </div>

        <div>
          <label for="arbCategoria">Categoría</label>
          <select id="arbCategoria" x-model="form.categoria" :class="errores.categoria ? 'input-error' : ''">
            <option value="">Selecciona una categoría</option>
            <template x-for="cat in categorias" :key="cat">
              <option :value="cat" x-text="cat"></option>
            </template>
          </select>
          <small class="error-texto" x-show="errores.categoria" x-text="errores.categoria"></small>
        </div>

        <div class="form-acciones">
          <button type="submit">Guardar Árbitro</button>
          <button type="button" class="boton-secundario" @click="reiniciarFormulario()">Limpiar</button>
        </div>
      </form>

      <h3>Árbitros Registrados</h3>
      <table class="tabla-arbitros">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>RUT</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Categoría</th>
          </tr>
        </thead>
        <tbody>
          <template x-for="arb in arbitros" :key="arb.id">
            <tr>
              <td x-text="arb.id"></td>
              <td x-text="arb.nombre"></td>
              <td x-text="arb.rut"></td>
              <td x-text="arb.email"></td>
              <td x-text="arb.telefono"></td>
              <td x-text="arb.categoria"></td>
            </tr>
          </template>
          <tr x-show="arbitros.length === 0">
            <td colspan="6" class="tabla-vacia">No hay árbitros registrados.</td>
          </tr>
        </tbody>
      </table>
    </section>
```

##### 2. `style.css`

Pégalo al final del archivo:

```css
.error-texto {
  display: block;
  margin-top: 4px;
  color: #b91c1c;
  font-size: 12px;
}

input.input-error,
select.input-error {
  border-color: #b91c1c;
}

input.input-error:focus,
select.input-error:focus {
  outline-color: #b91c1c;
}

.form-acciones {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.form-acciones button {
  margin-top: 0;
}

.tabla-arbitros {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  background-color: #ffffff;
  font-size: 14px;
}

.tabla-arbitros th,
.tabla-arbitros td {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  text-align: left;
}

.tabla-arbitros th {
  background-color: #351be1;
  color: #ffffff;
}

.tabla-arbitros tbody tr:nth-child(even) {
  background-color: #f3f4f6;
}

.tabla-arbitros .tabla-vacia {
  text-align: center;
  color: #6b7280;
}
```

##### Cómo funciona

- **`novalidate` en el `<form>`:** desactiva la validación propia del navegador. Sin esto, el navegador mostraría su propio aviso en el campo `type="email"` y no se vería el mensaje de tu `validar()`.
- **El `<select>`:** la opción por defecto tiene `value=""`. Si nadie elige una categoría, `form.categoria` queda vacío y `validar()` muestra el error.
- **Mensaje de tabla vacía:** va como una fila dentro del `<tbody>` que ocupa las 6 columnas (`colspan="6"`). Así queda bien alineado y solo aparece cuando `arbitros` está vacío.
- **Botón Limpiar:** reutiliza `.boton-secundario`, la clase gris que ya tienes del modal. Lleva `type="button"` para que no envíe el formulario.
- **Clases propias para la tabla y los botones:** uso `.tabla-arbitros` y `.form-acciones` para no cambiar la tabla del Acta ni los botones del resto de la página. Dentro de `.form-acciones` dejo `margin-top: 0` porque tu `button` general trae 20px arriba y eso descuadraría los dos botones.
- **Color del encabezado:** en tu CSS actual el texto de `th` sale negro sobre el fondo azul `#351be1`. En esta tabla lo dejé en blanco para que se lea.

Un detalle aparte: `index.html`, `style.css` y `registro-arbitros.js` todavía tienen comentarios de la sesión anterior, de antes de tu regla de no poner comentarios. Si quieres, te digo exactamente cuáles quitaría antes de tocar algo.

### Prompt 2

```text
Ahora introduce el codigo que me diste anteriormente al archivo
```

### Respuesta 2

*Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\index.html`. Texto que reemplazó:*

```html
      <a href="#acta">Acta Oficial</a>
```

*Texto nuevo:*

```html
      <a href="#acta">Acta Oficial</a>
      <a href="#registro-arbitros">Registro de Árbitros</a>
```

*Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\index.html`. Texto que reemplazó:*

```html
        <p>Firma Arbitro Principal</p>
      </div>
    </section>
  </main>
```

*Texto nuevo:*

```html
        <p>Firma Arbitro Principal</p>
      </div>
    </section>

    <section id="registro-arbitros" x-data="registroArbitros">
      <h2>Registro de Árbitros</h2>

      <form @submit.prevent="solicitarGuardado()" novalidate>
        <div>
          <label for="arbNombre">Nombre completo</label>
          <input type="text" id="arbNombre" placeholder="Ej: Roberto Tobar" x-model="form.nombre" :class="errores.nombre ? 'input-error' : ''">
          <small class="error-texto" x-show="errores.nombre" x-text="errores.nombre"></small>
        </div>

        <div>
          <label for="arbRut">RUT</label>
          <input type="text" id="arbRut" placeholder="Ej: 12.345.678-5" x-model="form.rut" :class="errores.rut ? 'input-error' : ''">
          <small class="error-texto" x-show="errores.rut" x-text="errores.rut"></small>
        </div>

        <div>
          <label for="arbEmail">Email</label>
          <input type="email" id="arbEmail" placeholder="Ej: nombre@arbitros.cl" x-model="form.email" :class="errores.email ? 'input-error' : ''">
          <small class="error-texto" x-show="errores.email" x-text="errores.email"></small>
        </div>

        <div>
          <label for="arbTelefono">Teléfono</label>
          <input type="tel" id="arbTelefono" placeholder="Ej: +56 9 1234 5678" x-model="form.telefono" :class="errores.telefono ? 'input-error' : ''">
          <small class="error-texto" x-show="errores.telefono" x-text="errores.telefono"></small>
        </div>

        <div>
          <label for="arbCategoria">Categoría</label>
          <select id="arbCategoria" x-model="form.categoria" :class="errores.categoria ? 'input-error' : ''">
            <option value="">Selecciona una categoría</option>
            <template x-for="cat in categorias" :key="cat">
              <option :value="cat" x-text="cat"></option>
            </template>
          </select>
          <small class="error-texto" x-show="errores.categoria" x-text="errores.categoria"></small>
        </div>

        <div class="form-acciones">
          <button type="submit">Guardar Árbitro</button>
          <button type="button" class="boton-secundario" @click="reiniciarFormulario()">Limpiar</button>
        </div>
      </form>

      <h3>Árbitros Registrados</h3>
      <table class="tabla-arbitros">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>RUT</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Categoría</th>
          </tr>
        </thead>
        <tbody>
          <template x-for="arb in arbitros" :key="arb.id">
            <tr>
              <td x-text="arb.id"></td>
              <td x-text="arb.nombre"></td>
              <td x-text="arb.rut"></td>
              <td x-text="arb.email"></td>
              <td x-text="arb.telefono"></td>
              <td x-text="arb.categoria"></td>
            </tr>
          </template>
          <tr x-show="arbitros.length === 0">
            <td colspan="6" class="tabla-vacia">No hay árbitros registrados.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
```

*Claude ejecutó en la terminal (Append styles to style.css and locate inserted line numbers):*

```bash
cat >> style.css <<'EOF'

.error-texto {
  display: block;
  margin-top: 4px;
  color: #b91c1c;
  font-size: 12px;
}

input.input-error,
select.input-error {
  border-color: #b91c1c;
}

input.input-error:focus,
select.input-error:focus {
  outline-color: #b91c1c;
}

.form-acciones {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.form-acciones button {
  margin-top: 0;
}

.tabla-arbitros {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  background-color: #ffffff;
  font-size: 14px;
}

.tabla-arbitros th,
.tabla-arbitros td {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  text-align: left;
}

.tabla-arbitros th {
  background-color: #351be1;
  color: #ffffff;
}

.tabla-arbitros tbody tr:nth-child(even) {
  background-color: #f3f4f6;
}

.tabla-arbitros .tabla-vacia {
  text-align: center;
  color: #6b7280;
}
EOF
grep -n 'registro-arbitros\|</main>' index.html; grep -n '^\.error-texto\|^\.tabla-arbitros .tabla-vacia' style.css; wc -l style.css
```

Listo, el código ya está en tus archivos. No pude abrir la página en el navegador para probarla.

**`index.html`**
- **Línea 26:** enlace "Registro de Árbitros" en el menú, que lleva a la nueva sección.
- **Líneas 121 a 194:** la sección `#registro-arbitros` conectada al componente `registroArbitros`. Tiene:
  - El formulario con los 4 campos de texto y el `<select>` de categoría.
  - Los mensajes de error debajo de cada campo.
  - Los botones Guardar y Limpiar.
  - La tabla de árbitros, con el mensaje para cuando no hay ninguno.

**`style.css`** (al final, líneas 285 a 340)
- `.error-texto`: el mensaje de error en rojo y en letra chica.
- `.input-error`: pinta el borde del campo de rojo cuando tiene un error.
- `.form-acciones`: deja los dos botones uno al lado del otro con espacio entre ellos.
- `.tabla-arbitros`: ordena la tabla, con encabezado azul y letra blanca y filas alternadas en gris.

No agregué comentarios en el código porque ninguna parte lo necesitaba.

Para probarlo, abre `index.html` con Live Server y prueba guardar con los campos vacíos: se deberían marcar en rojo. Luego llénalos bien, confirma en el modal y el árbitro debería aparecer en la tabla.

## Qué se incorporó al proyecto

- La sección con `x-data="registroArbitros"`, el formulario con `@submit.prevent`, los campos con `x-model` y `:class` para el error, el `<select>` con `x-for` para las categorías y los mensajes con `x-show`/`x-text`.
- La tabla con `<template x-for>` y la fila de "No hay árbitros registrados".
- Los estilos en style.css.
- Esta versión estuvo poco tiempo en index.html: en la consulta siguiente se movió a usuarios.html y se rehízo con Tailwind, así que el CSS de esta respuesta se terminó descartando.

## Verificación

- Abrí index.html con Live Server, probé guardar con campos vacíos (se marcan en rojo) y con datos válidos (el árbitro aparece en la tabla).
- Entiendo para qué sirve `novalidate` en el formulario: deja que la validación la haga mi código y no el navegador.

## Conclusión: lo que aprendí

Aprendí a conectar un formulario completo con Alpine: `x-model` para que lo que escribo se guarde solo en el estado, `:class` para poner una clase según una condición y `x-show` para mostrar el error solo cuando existe. También entendí que una tabla no se escribe a mano, sino que se genera con `<template x-for>` desde el arreglo, y que si el arreglo cambia, la tabla se actualiza sola.
