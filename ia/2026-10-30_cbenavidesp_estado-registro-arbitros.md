# Estado reactivo del módulo Registro de Árbitros

- **Fecha:** 2026-10-30
- **Integrante:** Carlos Benavides (@CBenavidesP)
- **Herramienta y modelo:** Claude Code (Claude Opus 5.5)
- **Enlace a la conversación:** no aplica (Claude Code no permite compartir la conversación)
- **Archivos afectados:** registro-arbitros.js (archivo completo; hoy líneas 1-121, después de los cambios del 2026-11-02); index.html (script registro-arbitros.js en el <head>, quitado después el 2026-11-02)

## Objetivo

Necesitaba armar el estado reactivo del módulo de Registro de Árbitros en un archivo aparte: el formulario, los errores de validación, la lista de árbitros en memoria y los métodos para guardar y reiniciar, usando el modal y los toasts que ya teníamos. Consulté a la IA para estructurar el componente de forma limpia y que cargara sin errores.

## Conversación (texto completo, sin editar)

El mismo prompt se envió dos veces seguidas porque el primer envío no recibió respuesta. Aquí se registra el segundo envío, que es el que tuvo respuesta.

### Prompt 1

```text
Hola. Continuando con la Entrega E2 de la página web de arbitraje de fútbol, ya tenemos listos los componentes globales de modal y toasts. Ahora necesito construir la arquitectura del estado reactivo para el módulo de Registro de Árbitros usando Alpine.js.

Quiero crear un archivo JavaScript independiente (registro-arbitros.js) que registre el componente mediante Alpine.data('registroArbitros', ...).

El componente debe contener:
1. Un objeto 'form' con los campos del árbitro: nombre, rut, email, telefono y categoria.
2. Un objeto 'errores' con esas mismas claves para almacenar los mensajes de validación individuales.
3. Un arreglo en memoria 'arbitros' que guarde los árbitros creados (con al menos un registro inicial de prueba).
4. El método para agregar el nuevo árbitro al arreglo y reiniciar los campos del formulario.
5. La integración con las funciones globales que ya tenemos (pedirConfirmacion y notificar) para solicitar la confirmación antes de guardar y lanzar el toast de éxito.

Por favor entrégame el código de este archivo JS estructurado de forma limpia, esperando el evento alpine:init para no tener errores de carga.
```

### Respuesta 1

_Claude creó o reemplazó el archivo `C:\Users\carlo\Documents\Futbol-desarrollo\registro-arbitros.js` con este contenido:_

```js
/*
 * Módulo: Registro de Árbitros
 * ----------------------------
 * Registra el componente Alpine "registroArbitros". Igual que componentes.js,
 * se carga ANTES que Alpine y espera "alpine:init" para registrarse.
 *
 * Usa las funciones globales de componentes.js:
 *   - pedirConfirmacion(...)  -> abre el modal antes de guardar
 *   - notificar(...)          -> muestra el toast de éxito o error
 */

document.addEventListener("alpine:init", () => {
  // Valores iniciales del formulario. Es una función para devolver siempre
  // un objeto NUEVO (si reutilizáramos el mismo objeto, reiniciar no serviría).
  const formVacio = () => ({
    nombre: "",
    rut: "",
    email: "",
    telefono: "",
    categoria: "",
  });

  Alpine.data("registroArbitros", () => ({
    /* ===================== Estado ===================== */

    // Enlazado a los inputs con x-model: lo que se escribe aquí cambia
    // el objeto, y si el objeto cambia, el input se actualiza.
    form: formVacio(),

    // Un mensaje por campo. Cadena vacía = sin error.
    errores: formVacio(),

    // Opciones del <select> de categoría
    categorias: [
      "FIFA",
      "Primera División",
      "Primera B",
      "Segunda División",
      "Amateur",
    ],

    // "Base de datos" en memoria (se pierde al recargar la página)
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

    /* ===================== Validación ===================== */

    validar() {
      this.errores = formVacio();
      const f = this.form;

      if (f.nombre.trim().length < 3) {
        this.errores.nombre =
          "Ingresa el nombre completo (mínimo 3 caracteres).";
      }

      // Acepta 12.345.678-5 o 12345678-5 (dígito verificador 0-9 o K)
      if (!/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(f.rut.trim())) {
        this.errores.rut = "Formato de RUT inválido. Ej: 12.345.678-5";
      } else if (this.rutExiste(f.rut)) {
        this.errores.rut = "Ya existe un árbitro con este RUT.";
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
        this.errores.email = "Ingresa un email válido.";
      }

      // Al menos 8 dígitos, permitiendo +, espacios y guiones
      if (f.telefono.replace(/\D/g, "").length < 8) {
        this.errores.telefono = "Ingresa un teléfono válido.";
      }

      if (!f.categoria) {
        this.errores.categoria = "Selecciona una categoría.";
      }

      // Es válido si ningún campo quedó con mensaje
      return Object.values(this.errores).every((msg) => msg === "");
    },

    // Compara RUTs ignorando puntos y mayúsculas
    rutExiste(rut) {
      const limpiar = (r) => r.replace(/\./g, "").toUpperCase().trim();
      return this.arbitros.some((a) => limpiar(a.rut) === limpiar(rut));
    },

    /* ===================== Acciones ===================== */

    // Se llama desde @submit.prevent del formulario
    solicitarGuardado() {
      if (!this.validar()) {
        notificar("Revisa los campos marcados en el formulario.", "error");
        return;
      }

      pedirConfirmacion({
        titulo: "Registrar árbitro",
        mensaje: `¿Confirmas el registro de ${this.form.nombre.trim()}?`,
        textoConfirmar: "Registrar",
        // Función flecha: mantiene "this" apuntando a este componente
        alConfirmar: () => this.agregarArbitro(),
      });
    },

    agregarArbitro() {
      // Copia los datos (sin espacios sobrantes) en un objeto nuevo
      const nuevo = { id: this.siguienteId++ };
      for (const campo in this.form) {
        nuevo[campo] = this.form[campo].trim();
      }

      this.arbitros.push(nuevo); // la tabla con x-for se actualiza sola
      notificar(`Árbitro ${nuevo.nombre} registrado correctamente.`);
      this.reiniciarFormulario();
    },

    reiniciarFormulario() {
      this.form = formVacio();
      this.errores = formVacio();
    },
  }));
});
```

_Claude editó `C:\Users\carlo\Documents\Futbol-desarrollo\index.html`. Texto que reemplazó:_

```html
<script src="componentes.js" defer></script>
```

_Texto nuevo:_

```html
<script src="componentes.js" defer></script>
<script src="registro-arbitros.js" defer></script>
```

_Claude ejecutó en la terminal (Syntax-check the new registro-arbitros.js file):_

```bash
cd "/c/Users/carlo/Documents/Futbol-desarrollo" && node --check registro-arbitros.js && echo OK
```

Creé `registro-arbitros.js` en la carpeta del proyecto y lo agregué a `index.html`. No tiene errores de sintaxis, pero **todavía no lo probé en el navegador**, porque falta el HTML del formulario.

##### Orden de carga (`index.html`)

```html
<script src="componentes.js" defer></script>
<script src="registro-arbitros.js" defer></script>
<script src="https://cdn.jsdelivr.net/.../alpinejs@3.14.9/..." defer></script>
```

Los dos archivos tuyos se registran dentro de `alpine:init`, y Alpine siempre va último. La regla para el equipo: **cada módulo nuevo va antes de la línea de Alpine**.

##### Estructura del componente

| Parte                   | Qué hace                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `formVacio()`           | Función que devuelve `{nombre, rut, email, telefono, categoria}` vacío. Se usa para crear `form` y `errores` y para reiniciarlos.                                                                                                    |
| `form`                  | Datos del formulario. Se conectan a los inputs con `x-model`.                                                                                                                                                                        |
| `errores`               | Las mismas claves, con el mensaje de cada campo. `""` significa que no hay error.                                                                                                                                                    |
| `categorias`            | Opciones del `<select>`: FIFA, Primera División, Primera B, Segunda División, Amateur.                                                                                                                                               |
| `arbitros`              | Arreglo en memoria con un registro de prueba (Roberto Tobar, FIFA). Se pierde al recargar la página.                                                                                                                                 |
| `validar()`             | Llena `errores` y devuelve `true` o `false`. Revisa el nombre, el formato del RUT (`12.345.678-5` o `12345678-5`), que el RUT no esté repetido, el email, que el teléfono tenga al menos 8 dígitos y que haya una categoría elegida. |
| `solicitarGuardado()`   | El formulario llama a este método. Si algo falla, muestra un toast de error. Si todo está bien, llama a `pedirConfirmacion(...)`.                                                                                                    |
| `agregarArbitro()`      | Se ejecuta solo si el usuario confirma en el modal. Hace `push` al arreglo, muestra el toast de éxito y reinicia el formulario.                                                                                                      |
| `reiniciarFormulario()` | Vuelve `form` y `errores` a su estado vacío.                                                                                                                                                                                         |

**Por qué `formVacio()` es una función:** si `form` y `errores` partieran del mismo objeto, compartirían los datos. Al escribir el nombre, también se cambiaría el error del nombre. La función crea un objeto nuevo cada vez.

**Por qué `alConfirmar` es una función flecha (`() => this.agregarArbitro()`):** el modal es otro componente, y ejecuta esa función más tarde. La función flecha conserva el `this` del registro de árbitros. Con una `function` normal, `this` dejaría de apuntar a este componente.

##### Cómo se conecta con el HTML

Un ejemplo para el campo del RUT:

```html
<section id="registro" x-data="registroArbitros">
  <form @submit.prevent="solicitarGuardado()">
    <label for="rut">RUT</label>
    <input id="rut" x-model="form.rut" />
    <small class="error" x-show="errores.rut" x-text="errores.rut"></small>
    <!-- ...nombre, email, telefono... -->
    <select x-model="form.categoria">
      <option value="">Selecciona...</option>
      <template x-for="c in categorias"
        ><option :value="c" x-text="c"></option
      ></template>
    </select>
    <button type="submit">Registrar</button>
  </form>

  <template x-for="a in arbitros" :key="a.id">
    <tr>
      <td x-text="a.nombre"></td>
      <td x-text="a.rut"></td>
      ...
    </tr>
  </template>
</section>
```

¿Quieres que arme la sección completa en `index.html`, con el formulario, la tabla de árbitros y los estilos de los errores? Así lo podrías probar de inmediato con `npm run dev`.

## Qué se incorporó al proyecto

- registro-arbitros.js con el componente `registroArbitros`: `form`, `errores`, `categorias`, la lista `arbitros` con un árbitro de prueba, la validación de cada campo (nombre, RUT, email, teléfono y categoría), la revisión de RUT repetido y los métodos `solicitarGuardado()`, `agregarArbitro()` y `reiniciarFormulario()`.
- Después yo quité los comentarios largos que traía el archivo y lo dejé más corto.

## Verificación

- Con el formulario conectado (registro siguiente), probé guardar con campos vacíos y con datos malos: aparece el mensaje de error de cada campo.
- Con datos válidos aparece el modal de confirmación, y al confirmar el árbitro se agrega a la tabla y sale el toast de éxito.
- Probé ingresar un RUT que ya existía (con y sin puntos) y no lo deja guardar.
- Entiendo que `formVacio()` es una función para que cada vez entregue un objeto nuevo, y que la función flecha en `alConfirmar` mantiene el `this` del componente.

## Conclusión: lo que aprendí

Aprendí a separar el estado de un componente en su propio archivo con `Alpine.data()` y a esperar el evento `alpine:init` para registrarlo. Entendí la diferencia entre guardar el formulario y los errores como objetos con las mismas claves, lo que hace fácil mostrar un error debajo de cada campo. También aprendí a usar expresiones regulares para validar el RUT y el email, y por qué se usa una función flecha para no perder el `this` cuando el modal llama de vuelta a mi componente.
