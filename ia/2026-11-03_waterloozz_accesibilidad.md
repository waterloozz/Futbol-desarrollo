# Foco visible, aria-label y contraste

- **Fecha:** 2026-11-03
- **Integrante:** Roberto Sánchez (@waterloozz)
- **Herramienta y modelo:** Claude Code (Claude Opus 5.5)
- **Enlace a la conversación:** no aplica (Claude Code no permite compartir la conversación; el texto completo va abajo, exportado de la sesión)
- **Archivos afectados:** js/menu.js; registro-arbitros.css; style.css; usuarios.html (34 líneas agregadas y 14 quitadas en total). Hoy esos archivos están en comun/menu.js, admin/registro-arbitros.css y admin/usuarios.html.

> **Nota:** este registro se subió el 2026-11-11, después del código. El código se subió el 2026-11-03 en el commit `9734f34` sin su registro y sin marcas `[IA]`; en ese momento no lo documenté. 
## Objetivo

Otro de los requisitos que tenía anotados pedía foco visible en links y botones, `aria-label` en el botón hamburguesa y buen contraste. Le pedí a la IA que me diera el código para implementarlo.

## Conversación (texto completo, sin editar)

Esta conversación fue en el PC del laboratorio. Aquí va el texto de cada respuesta. Los títulos dentro de las respuestas se bajaron de nivel para no romper la estructura de este archivo; el texto no se cambió.

### Prompt 1

```text
hace eso
Foco visible en links y botones, aria-label en el botón hamburguesa, buen contraste.
```

### Respuesta 1

Aquí tienes el código para el menú, el CSS y los botones:

**js/menu.js** (título, botón hamburguesa y links):

```js
const HTML_MENU = `
  <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 px-4 py-3">
    <a href="dashboard.html" class="rounded py-2 text-lg font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Acta Digital Arbitral</a>

    <button
      type="button"
      class="rounded p-2 hover:bg-blue-700 md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      @click="abierto = !abierto"
      :aria-expanded="abierto.toString()"
      aria-controls="menu-principal"
      aria-label="Abrir menú"
      :aria-label="abierto ? 'Cerrar menú' : 'Abrir menú'"
    >
      <svg x-show="!abierto" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
```

```js
              :href="link.href"
              x-text="link.texto"
              :aria-current="esActual(link) ? 'page' : null"
              class="block rounded px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              :class="esActual(link) ? 'bg-white font-semibold text-blue-800' : 'hover:bg-blue-700'"
            ></a>
          </li>
```

```js
          <button
            type="button"
            @click="cerrarSesion()"
            class="w-full rounded px-3 py-2 text-left hover:bg-blue-700 md:ml-2 md:border md:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >Cerrar sesión</button>
        </li>
      </ul>
```

**registro-arbitros.css** (foco en modal y toasts):

```css
  color: #0f172a;
}

.toast-cerrar:focus-visible,
.modal-boton:focus-visible {
  outline: 2px solid #1d4ed8;
  outline-offset: 2px;
}

@keyframes toast-entrada {
  from {
    opacity: 0;
```

**style.css** (foco general y contraste):

```css
  color: white;
}

/* FOCO VISIBLE: marca el elemento activo al navegar con teclado */
a:focus-visible,
button:focus-visible {
  outline: 3px solid #111;
  outline-offset: 2px;
}

/* Sobre el azul del header el contorno oscuro no se ve */
header a:focus-visible {
  outline-color: white;
}

/* CONTENIDO PRINCIPAL */
main {
  width: 80%;
```

```css
input:focus,
textarea:focus,
select:focus {
  outline: 2px solid #111;
}

/* BOTONES */
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

/* TABLA */
```

```css
th {
  background-color: #351be1;
  color: white;
}

/* FICHA DEL ENCUENTRO */
```

**usuarios.html** (placeholders y botones con mejor contraste y foco):

```html
          <div>
            <label for="arbNombre" class="mb-1 block text-sm font-medium text-slate-700">Nombre completo</label>
            <input type="text" id="arbNombre" placeholder="Ej: Roberto Tobar" x-model="form.nombre"
              class="w-full rounded-md border px-3 py-2 placeholder:text-slate-500 focus:outline-none focus:ring-2"
              :class="errores.nombre ? 'border-red-600 focus:ring-red-600' : 'border-slate-300 focus:ring-blue-600'">
            <small class="mt-1 block text-xs text-red-700" x-show="errores.nombre" x-text="errores.nombre"></small>
          </div>
```

```html
              RUT <span class="text-xs font-normal text-slate-500">(con guion, ej: 12.345.678-5)</span>
            </label>
            <input type="text" id="arbRut" placeholder="Ej: 12.345.678-5" x-model="form.rut"
              class="w-full rounded-md border px-3 py-2 placeholder:text-slate-500 focus:outline-none focus:ring-2"
              :class="errores.rut ? 'border-red-600 focus:ring-red-600' : 'border-slate-300 focus:ring-blue-600'">
            <small class="mt-1 block text-xs text-red-700" x-show="errores.rut" x-text="errores.rut"></small>
          </div>
```

```html
          <div>
            <label for="arbEmail" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" id="arbEmail" placeholder="Ej: nombre@arbitros.cl" x-model="form.email"
              class="w-full rounded-md border px-3 py-2 placeholder:text-slate-500 focus:outline-none focus:ring-2"
              :class="errores.email ? 'border-red-600 focus:ring-red-600' : 'border-slate-300 focus:ring-blue-600'">
            <small class="mt-1 block text-xs text-red-700" x-show="errores.email" x-text="errores.email"></small>
          </div>
```

```html
          <div>
            <label for="arbTelefono" class="mb-1 block text-sm font-medium text-slate-700">Teléfono</label>
            <input type="tel" id="arbTelefono" placeholder="Ej: +56 9 1234 5678" x-model="form.telefono"
              class="w-full rounded-md border px-3 py-2 placeholder:text-slate-500 focus:outline-none focus:ring-2"
              :class="errores.telefono ? 'border-red-600 focus:ring-red-600' : 'border-slate-300 focus:ring-blue-600'">
            <small class="mt-1 block text-xs text-red-700" x-show="errores.telefono" x-text="errores.telefono"></small>
          </div>
```

```html
          </div>

          <div class="flex gap-3 sm:col-span-2">
            <button type="submit" class="rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Guardar Árbitro</button>
            <button type="button" @click="reiniciarFormulario()" class="rounded-md bg-slate-200 px-4 py-2 font-medium text-slate-800 hover:bg-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Limpiar</button>
          </div>
        </form>
      </section>
```

```html
                  <td class="px-3 py-2" x-text="arb.telefono"></td>
                  <td class="px-3 py-2" x-text="arb.categoria"></td>
                  <td class="px-3 py-2">
                    <button type="button" @click="solicitarEliminacion(arb)" class="rounded font-medium text-red-600 hover:text-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">Eliminar</button>
                  </td>
                </tr>
              </template>
```

Aquí está. Cópialo, pruébalo y avísame cómo quedó.

### Prompt 2

```text
claude --advisor opus --subagents haiku
```

### Respuesta 2

Ese es un comando de terminal. Aquí no lo puedo ejecutar. Si quieres usar Opus de principal y Haiku en subagentes, elige el modelo en el selector de la app y pídeme que los subagentes usen `haiku`.

Prueba lo que te pasé del foco y contraste y avísame cómo quedó.

## Qué se incorporó al proyecto

- Menú común (`js/menu.js` y `style.css`): contorno visible al enfocar con teclado el título, los links, el botón hamburguesa y "Cerrar sesión", y `aria-label` fijo en el botón hamburguesa.
- Usuarios (`usuarios.html` y `registro-arbitros.css`): contorno de foco en Guardar, Limpiar, Cancelar y Confirmar del modal y en la × de los avisos, y en rojo para "Eliminar".
- Login (`style.css`): contorno de foco en los botones, los links y los campos.
- Todo se usó tal como lo propuso la IA, y el commit lo hizo la IA a mi nombre.

### Código final que dejó la IA

Las partes de cada archivo que la IA modificó, tal como quedaron en el commit. Los números son las líneas del archivo en ese commit.

#### Commit `9734f34 feat(accesibilidad): foco visible en links y botones y mejor contraste`

`js/menu.js`, líneas 12-26:

```js

const HTML_MENU = `
  <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 px-4 py-3">
    <a href="dashboard.html" class="rounded py-2 text-lg font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Acta Digital Arbitral</a>

    <button
      type="button"
      class="rounded p-2 hover:bg-blue-700 md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      @click="abierto = !abierto"
      :aria-expanded="abierto.toString()"
      aria-controls="menu-principal"
      aria-label="Abrir menú"
      :aria-label="abierto ? 'Cerrar menú' : 'Abrir menú'"
    >
      <svg x-show="!abierto" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
```

`js/menu.js`, líneas 46-52:

```js
              :href="link.href"
              x-text="link.texto"
              :aria-current="esActual(link) ? 'page' : null"
              class="block rounded px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              :class="esActual(link) ? 'bg-white font-semibold text-blue-800' : 'hover:bg-blue-700'"
            ></a>
          </li>
```

`js/menu.js`, líneas 55-61:

```js
          <button
            type="button"
            @click="cerrarSesion()"
            class="w-full rounded px-3 py-2 text-left hover:bg-blue-700 md:ml-2 md:border md:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >Cerrar sesión</button>
        </li>
      </ul>
```

`registro-arbitros.css`, líneas 46-57:

```css
  color: #0f172a;
}

.toast-cerrar:focus-visible,
.modal-boton:focus-visible {
  outline: 2px solid #1d4ed8;
  outline-offset: 2px;
}

@keyframes toast-entrada {
  from {
    opacity: 0;
```

`style.css`, líneas 42-59:

```css
  color: white;
}

/* FOCO VISIBLE: marca el elemento activo al navegar con teclado */
a:focus-visible,
button:focus-visible {
  outline: 3px solid #111;
  outline-offset: 2px;
}

/* Sobre el azul del header el contorno oscuro no se ve */
header a:focus-visible {
  outline-color: white;
}

/* CONTENIDO PRINCIPAL */
main {
  width: 80%;
```

`style.css`, líneas 105-125:

```css
input:focus,
textarea:focus,
select:focus {
  outline: 2px solid #111;
}

/* BOTONES */
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

/* TABLA */
```

`style.css`, líneas 139-145:

```css

th {
  background-color: #351be1;
  color: white;
}

/* FICHA DEL ENCUENTRO */
```

`usuarios.html`, líneas 36-42:

```html
          <div>
            <label for="arbNombre" class="mb-1 block text-sm font-medium text-slate-700">Nombre completo</label>
            <input type="text" id="arbNombre" placeholder="Ej: Roberto Tobar" x-model="form.nombre"
              class="w-full rounded-md border px-3 py-2 placeholder:text-slate-500 focus:outline-none focus:ring-2"
              :class="errores.nombre ? 'border-red-600 focus:ring-red-600' : 'border-slate-300 focus:ring-blue-600'">
            <small class="mt-1 block text-xs text-red-700" x-show="errores.nombre" x-text="errores.nombre"></small>
          </div>
```

`usuarios.html`, líneas 46-52:

```html
              RUT <span class="text-xs font-normal text-slate-500">(con guion, ej: 12.345.678-5)</span>
            </label>
            <input type="text" id="arbRut" placeholder="Ej: 12.345.678-5" x-model="form.rut"
              class="w-full rounded-md border px-3 py-2 placeholder:text-slate-500 focus:outline-none focus:ring-2"
              :class="errores.rut ? 'border-red-600 focus:ring-red-600' : 'border-slate-300 focus:ring-blue-600'">
            <small class="mt-1 block text-xs text-red-700" x-show="errores.rut" x-text="errores.rut"></small>
          </div>
```

`usuarios.html`, líneas 54-60:

```html
          <div>
            <label for="arbEmail" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" id="arbEmail" placeholder="Ej: nombre@arbitros.cl" x-model="form.email"
              class="w-full rounded-md border px-3 py-2 placeholder:text-slate-500 focus:outline-none focus:ring-2"
              :class="errores.email ? 'border-red-600 focus:ring-red-600' : 'border-slate-300 focus:ring-blue-600'">
            <small class="mt-1 block text-xs text-red-700" x-show="errores.email" x-text="errores.email"></small>
          </div>
```

`usuarios.html`, líneas 62-68:

```html
          <div>
            <label for="arbTelefono" class="mb-1 block text-sm font-medium text-slate-700">Teléfono</label>
            <input type="tel" id="arbTelefono" placeholder="Ej: +56 9 1234 5678" x-model="form.telefono"
              class="w-full rounded-md border px-3 py-2 placeholder:text-slate-500 focus:outline-none focus:ring-2"
              :class="errores.telefono ? 'border-red-600 focus:ring-red-600' : 'border-slate-300 focus:ring-blue-600'">
            <small class="mt-1 block text-xs text-red-700" x-show="errores.telefono" x-text="errores.telefono"></small>
          </div>
```

`usuarios.html`, líneas 81-88:

```html
          </div>

          <div class="flex gap-3 sm:col-span-2">
            <button type="submit" class="rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Guardar Árbitro</button>
            <button type="button" @click="reiniciarFormulario()" class="rounded-md bg-slate-200 px-4 py-2 font-medium text-slate-800 hover:bg-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Limpiar</button>
          </div>
        </form>
      </section>
```

`usuarios.html`, líneas 112-118:

```html
                  <td class="px-3 py-2" x-text="arb.telefono"></td>
                  <td class="px-3 py-2" x-text="arb.categoria"></td>
                  <td class="px-3 py-2">
                    <button type="button" @click="solicitarEliminacion(arb)" class="rounded font-medium text-red-600 hover:text-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">Eliminar</button>
                  </td>
                </tr>
              </template>
```

## Verificación

- Se recorrieron las páginas con el teclado: todos los links y botones mostraron el contorno al enfocarlos.
- Se midió el contraste de los textos y ninguno quedó bajo el mínimo.
- Se abrió el modal de confirmación con "Eliminar" y se canceló sin borrar nada; Cancelar y Confirmar mostraron el contorno.
- En móvil (375 px) se probó el botón hamburguesa con el teclado.

## Conclusión: lo que aprendí

*(Pendiente: escríbelo con tus palabras.)*
