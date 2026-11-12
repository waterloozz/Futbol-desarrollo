# CRUD de Partidos, Búsqueda, Filtros y Acta Oficial

- **Fecha:** 2026-11-03
- **Integrante:** Josefa Solís (@josefasolis1-hue)
- **Herramienta y modelo:** Gemini 3.8 Flash
- **Archivos afectados:** `comun/api.js`, `comun/partidos.js`, `usuario/partidos.html`, `README.md` (originalmente en `js/api.js`, `js/partidos.js`, `partidos.html`).

## Objetivo
Implementar la interfaz completa del CRUD de partidos con filtros reactivos, búsqueda, ordenamiento, vista de detalle del acta arbitral con registro de incidencias (goles y tarjetas en tiempo real), y conectar la capa de servicios simulada para cargar equipos y estadios dinámicamente desde `equipos.json` en vez de tenerlos estáticos en el código.

## Conversación (texto completo, sin editar)

### Prompt 1
CRUD de partidos: Implementar la lógica de interfaz para listar, crear, editar y eliminar eventos del acta.
Búsqueda y filtros: Programar las herramientas para filtrar dentro de los listados de partidos.
Tailwind CSS y Responsive: Reemplazar los estilos por clases de Tailwind, garantizando diseño funcional en móviles y escritorio.
Accesibilidad: Asegurar contraste, etiquetas en formularios y soporte para navegación con teclado.
Calidad técnica y README: Limpiar archivos basura, asegurar que la consola no arroje errores y redactar las instrucciones de "Cómo ejecutar". mira, esa es mi parte del trabajo, puedes decirmq que cosas ya tengo hechas, si puedo mejorar algo o si falta algo? te entrego tambien la rubrica del trabajo para que te guies

### Respuesta 1
Revisé en detalle tanto tu lista de responsabilidades como la rúbrica oficial de la Entrega 2.

Aquí tienes el balance exacto de qué tienes listo, qué debes mejorar y qué te falta por construir para asegurar la máxima calificación:

#### Resumen de Estado de tu Parte

| Tu Tarea Asignada | Estado Actual | Qué tienes | Qué falta |
| :--- | :---: | :--- | :--- |
| **1. CRUD de partidos** | 50% | La lógica en `api.js` (`obtenerPartidos`, `crearPartido`, `actualizarPartido`, `eliminarPartido` con `localStorage`). | La interfaz en `partidos.html`. Formulario de crear/editar, botón eliminar con confirmación y vista de detalle/acta. |
| **2. Búsqueda y filtros** | 0% | Ninguno en la vista de partidos. | Input de búsqueda (por equipo/cancha), selector de filtro (por estado) y ordenamiento (por fecha/goles) según el subcriterio A2. |
| **3. Tailwind y Responsive** | 40% | Tailwind CDN importado en `partidos.html`; menú adaptable funcionando. | Maquetar el contenido con clases utilitarias de Tailwind, diseño mobile-first (375px a 1280px) sin scroll horizontal. |
| **4. Accesibilidad** | 30% | Buen contraste base y menú accesible. | Labels asociados a cada input (`for`/`id`), atributos `aria-*` y navegación fluida por teclado en formularios y modales. |
| **5. Calidad y README** | 40% | Se unificó `partidos.json`. | Resolver el error de consola de `export` en `api.js`, agregar la tabla de endpoints al README y documentar el uso de IA según la sección 10. |

Para resolverlo, debemos:
1. Arreglar la exportación en `api.js` para que no arroje errores en consola (quitar `export` y dejar funciones globales accesibles).
2. Armar la pantalla de Partidos con Tailwind: barra superior con búsqueda, filtro y ordenamiento, y la tabla/tarjetas reactivas con Alpine.js.
3. Conectar los botones de Nuevo Partido, Editar, Eliminar con confirmación modal, y el Acta oficial de partido con eventos de goles y tarjetas.

### Prompt 2
si porfi, como lo hago?

### Respuesta 2
Aquí tienes el código completo para cada archivo:

**1. `comun/api.js` (Funciones CRUD de partidos con formato REST y persistencia en localStorage):**

```js
const STORAGE_KEY = "partidos_crud_data";
const LATENCIA = 450;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function obtenerPartidos() {
  try {
    simularFallo();
    const guardados = localStorage.getItem(STORAGE_KEY);
    if (guardados) {
      const partidos = JSON.parse(guardados);
      return { ok: true, status: 200, datos: partidos, data: partidos };
    }
    const partidos = await pedir("partidos");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partidos));
    return { ok: true, status: 200, datos: partidos, data: partidos };
  } catch (error) {
    return { ok: false, status: 500, error: "No se pudieron cargar los partidos." };
  }
}

async function crearPartido(nuevoPartido) {
  const resultado = await obtenerPartidos();
  if (!resultado.ok) return resultado;

  const partidos = resultado.datos;
  const partidoConId = {
    ...nuevoPartido,
    id: Date.now(),
    acontecimientos: nuevoPartido.acontecimientos || [],
    observaciones: nuevoPartido.observaciones || "",
    amarillas: Number(nuevoPartido.amarillas) || 0,
    rojas: Number(nuevoPartido.rojas) || 0,
    golesLocal: nuevoPartido.golesLocal !== null && nuevoPartido.golesLocal !== "" ? Number(nuevoPartido.golesLocal) : null,
    golesVisitante: nuevoPartido.golesVisitante !== null && nuevoPartido.golesVisitante !== "" ? Number(nuevoPartido.golesVisitante) : null,
  };

  partidos.unshift(partidoConId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(partidos));
  return { ok: true, status: 201, datos: partidoConId, data: partidoConId };
}

async function actualizarPartido(id, datosActualizados) {
  const resultado = await obtenerPartidos();
  if (!resultado.ok) return resultado;

  const partidos = resultado.datos;
  const index = partidos.findIndex((p) => p.id == id);
  if (index === -1) {
    return { ok: false, status: 404, error: "Partido no encontrado para actualizar." };
  }

  partidos[index] = {
    ...partidos[index],
    ...datosActualizados,
    id: Number(id),
    amarillas: Number(datosActualizados.amarillas) || 0,
    rojas: Number(datosActualizados.rojas) || 0,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(partidos));
  return { ok: true, status: 200, datos: partidos[index], data: partidos[index] };
}

async function eliminarPartido(id) {
  const resultado = await obtenerPartidos();
  if (!resultado.ok) return resultado;

  const partidos = resultado.datos;
  const filtrados = partidos.filter((p) => p.id != id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
  return { ok: true, datos: { id } };
}
```

**2. `comun/partidos.js` (Componente reactivo Alpine.js `gestorPartidos`):**

```js
document.addEventListener("alpine:init", () => {
  const formVacio = () => ({
    id: null,
    local: "",
    visitante: "",
    fecha: "",
    hora: "",
    cancha: "",
    estado: "programado",
    golesLocal: null,
    golesVisitante: null,
    amarillas: 0,
    rojas: 0,
    arbitroId: 2,
    observaciones: "",
  });

  const erroresVacios = () => ({
    local: "",
    visitante: "",
    fecha: "",
    hora: "",
    cancha: "",
  });

  Alpine.data("gestorPartidos", () => ({
    estado: "cargando",
    mensajeError: "",
    partidos: [],

    busqueda: "",
    filtroEstado: "todos",
    orden: "recientes",

    modalFormulario: false,
    modoEdicion: false,
    guardando: false,
    form: formVacio(),
    errores: erroresVacios(),

    modalDetalle: false,
    partidoSeleccionado: null,
    nuevoAcontecimiento: {
      minuto: "",
      equipo: "",
      jugador: "",
      tipo: "Gol",
    },

    equiposDisponibles: [],
    canchasDisponibles: [],

    init() {
      if (typeof redirigiendo !== "undefined" && redirigiendo) return;
      this.cargar();
    },

    async cargar() {
      this.estado = "cargando";
      this.mensajeError = "";
      const res = await obtenerPartidos();
      if (res.ok) {
        this.partidos = res.datos;
        this.estado = "listo";
      } else {
        this.mensajeError = res.error || "No se pudieron cargar los partidos.";
        this.estado = "error";
      }
    },

    get partidosFiltrados() {
      let lista = [...this.partidos];
      if (this.busqueda.trim() !== "") {
        const q = this.busqueda.toLowerCase().trim();
        lista = lista.filter(
          (p) =>
            p.local.toLowerCase().includes(q) ||
            p.visitante.toLowerCase().includes(q) ||
            (p.cancha && p.cancha.toLowerCase().includes(q))
        );
      }
      if (this.filtroEstado !== "todos") {
        lista = lista.filter((p) => p.estado === this.filtroEstado);
      }
      lista.sort((a, b) => {
        const momA = `${a.fecha} ${a.hora}`;
        const momB = `${b.fecha} ${b.hora}`;
        if (this.orden === "recientes") return momB.localeCompare(momA);
        if (this.orden === "antiguos") return momA.localeCompare(momB);
        if (this.orden === "local") return a.local.localeCompare(b.local);
        return 0;
      });
      return lista;
    },

    abrirCrear() {
      this.modoEdicion = false;
      this.form = formVacio();
      this.errores = erroresVacios();
      this.modalFormulario = true;
    },

    abrirEditar(partido) {
      this.modoEdicion = true;
      this.form = {
        id: partido.id,
        local: partido.local,
        visitante: partido.visitante,
        fecha: partido.fecha,
        hora: partido.hora,
        cancha: partido.cancha,
        estado: partido.estado,
        golesLocal: partido.golesLocal,
        golesVisitante: partido.golesVisitante,
        amarillas: partido.amarillas || 0,
        rojas: partido.rojas || 0,
        arbitroId: partido.arbitroId || 2,
        observaciones: partido.observaciones || "",
        acontecimientos: partido.acontecimientos || [],
      };
      this.errores = erroresVacios();
      this.modalFormulario = true;
    },

    cerrarModalFormulario() {
      this.modalFormulario = false;
      this.form = formVacio();
      this.errores = erroresVacios();
    },

    validar() {
      this.errores = erroresVacios();
      let esValido = true;
      if (!this.form.local) {
        this.errores.local = "Selecciona el equipo local.";
        esValido = false;
      }
      if (!this.form.visitante) {
        this.errores.visitante = "Selecciona el equipo visitante.";
        esValido = false;
      }
      if (this.form.local && this.form.visitante && this.form.local === this.form.visitante) {
        this.errores.visitante = "El equipo local y el visitante no pueden ser el mismo.";
        esValido = false;
      }
      if (!this.form.fecha) {
        this.errores.fecha = "Selecciona la fecha del encuentro.";
        esValido = false;
      }
      if (!this.form.hora) {
        this.errores.hora = "Ingresa la hora del encuentro.";
        esValido = false;
      }
      if (!this.form.cancha) {
        this.errores.cancha = "Ingresa o selecciona el estadio.";
        esValido = false;
      }
      return esValido;
    },

    async guardar() {
      if (!this.validar()) {
        if (typeof notificar === "function") notificar("Revisa los campos marcados.", "error");
        return;
      }
      this.guardando = true;
      if (this.modoEdicion) {
        const res = await actualizarPartido(this.form.id, this.form);
        this.guardando = false;
        if (res.ok) {
          const idx = this.partidos.findIndex((p) => p.id === this.form.id);
          if (idx !== -1) this.partidos[idx] = res.datos;
          this.cerrarModalFormulario();
          if (typeof notificar === "function") notificar("Partido actualizado correctamente.", "exito");
        } else {
          if (typeof notificar === "function") notificar(res.error, "error");
        }
      } else {
        const res = await crearPartido(this.form);
        this.guardando = false;
        if (res.ok) {
          this.partidos.unshift(res.datos);
          this.cerrarModalFormulario();
          if (typeof notificar === "function") notificar("Partido programado con éxito.", "exito");
        } else {
          if (typeof notificar === "function") notificar(res.error, "error");
        }
      }
    },

    solicitarEliminacion(partido) {
      if (typeof pedirConfirmacion === "function") {
        pedirConfirmacion({
          titulo: "¿Eliminar partido?",
          mensaje: `¿Confirmas la eliminación del partido entre ${partido.local} y ${partido.visitante}?`,
          textoConfirmar: "Eliminar",
          alConfirmar: () => this.eliminar(partido.id),
        });
      }
    },

    async eliminar(id) {
      const res = await eliminarPartido(id);
      if (res.ok) {
        this.partidos = this.partidos.filter((p) => p.id !== id);
        if (typeof notificar === "function") notificar("Partido eliminado correctamente.", "exito");
      } else {
        if (typeof notificar === "function") notificar(res.error || "No se pudo eliminar el partido.", "error");
      }
    },

    abrirDetalle(partido) {
      this.partidoSeleccionado = JSON.parse(JSON.stringify(partido));
      if (!this.partidoSeleccionado.acontecimientos) {
        this.partidoSeleccionado.acontecimientos = [];
      }
      this.nuevoAcontecimiento = {
        minuto: "",
        equipo: partido.local,
        jugador: "",
        tipo: "Gol",
      };
      this.modalDetalle = true;
    },

    cerrarDetalle() {
      this.modalDetalle = false;
      this.partidoSeleccionado = null;
    },

    async agregarAcontecimiento() {
      const p = this.partidoSeleccionado;
      const ac = this.nuevoAcontecimiento;
      if (!ac.minuto || !ac.jugador.trim()) {
        if (typeof notificar === "function") notificar("Ingresa minuto y jugador.", "error");
        return;
      }
      const nuevo = {
        id: Date.now(),
        minuto: Number(ac.minuto),
        equipo: ac.equipo,
        jugador: ac.jugador.trim(),
        tipo: ac.tipo,
      };
      p.acontecimientos.push(nuevo);
      p.acontecimientos.sort((a, b) => a.minuto - b.minuto);
      if (ac.tipo === "Gol") {
        if (ac.equipo === p.local) p.golesLocal = (p.golesLocal || 0) + 1;
        else p.golesVisitante = (p.golesVisitante || 0) + 1;
      } else if (ac.tipo === "Tarjeta amarilla") {
        p.amarillas = (p.amarillas || 0) + 1;
      } else if (ac.tipo === "Tarjeta roja") {
        p.rojas = (p.rojas || 0) + 1;
      }
      const res = await actualizarPartido(p.id, p);
      if (res.ok) {
        const idx = this.partidos.findIndex((x) => x.id === p.id);
        if (idx !== -1) this.partidos[idx] = JSON.parse(JSON.stringify(p));
        this.nuevoAcontecimiento = {
          minuto: "",
          equipo: p.local,
          jugador: "",
          tipo: "Gol",
        };
        if (typeof notificar === "function") notificar("Acontecimiento registrado en el acta.", "exito");
      }
    },

    async eliminarAcontecimiento(acId) {
      const p = this.partidoSeleccionado;
      p.acontecimientos = p.acontecimientos.filter((a) => a.id !== acId);
      const res = await actualizarPartido(p.id, p);
      if (res.ok) {
        const idx = this.partidos.findIndex((x) => x.id === p.id);
        if (idx !== -1) this.partidos[idx] = JSON.parse(JSON.stringify(p));
        if (typeof notificar === "function") notificar("Acontecimiento eliminado del acta.", "exito");
      }
    },

    formatearFecha(fecha) {
      if (!fecha) return "";
      return new Date(`${fecha}T00:00`).toLocaleDateString("es-CL", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
  }));
});
```

### Prompt 3
Sacar los equipos y estadios de equipos.json en vez de tenerlos escritos en partidos.js.

### Respuesta 3
Para desacoplar los datos y cumplir con el requisito de que ningún dato esté quemado en el código, agregamos la función `obtenerEquipos()` en `comun/api.js` y actualizamos el `cargar()` de `comun/partidos.js` para pedir los equipos y canchas con `Promise.all`:

En `comun/api.js`:
```js
async function obtenerEquipos() {
  try {
    simularFallo();
    const equipos = await pedir("equipos");
    return { ok: true, status: 200, datos: equipos, data: equipos };
  } catch (error) {
    return { ok: false, status: 500, error: "No se pudieron cargar los equipos." };
  }
}
```

En `comun/partidos.js`:
```js
    equiposDisponibles: [],
    canchasDisponibles: [],

    async cargar() {
      this.estado = "cargando";
      this.mensajeError = "";
      const [resPartidos, resEquipos] = await Promise.all([
        obtenerPartidos(),
        obtenerEquipos(),
      ]);

      if (resPartidos.ok) {
        this.partidos = resPartidos.datos;
        if (resEquipos && resEquipos.ok && Array.isArray(resEquipos.datos)) {
          this.equiposDisponibles = resEquipos.datos.map((e) => e.nombre);
          this.canchasDisponibles = [
            ...new Set(resEquipos.datos.map((e) => e.estadio).filter(Boolean)),
          ];
        }
        this.estado = "listo";
      } else {
        this.mensajeError = resPartidos.error || "No se pudieron cargar los partidos.";
        this.estado = "error";
      }
    },
```

## Qué se incorporó al proyecto
- Lógica completa de CRUD de partidos en `comun/partidos.js` conectada a `comun/api.js` con persistencia en `localStorage`.
- Funciones asíncronas `obtenerPartidos`, `crearPartido`, `actualizarPartido`, `eliminarPartido` y `obtenerEquipos` en `comun/api.js`.
- Búsqueda en tiempo real por texto (equipo local, visitante o cancha), filtro por estado (programado / finalizado) y ordenamiento cronológico y alfabético.
- Modal de acta oficial con registro en vivo de goles y tarjetas, que actualiza de inmediato el marcador global y la persistencia.
- Carga dinámica de equipos y recintos deportivos desde `public/mocks/equipos.json`.

## Verificación
- Se probó la creación de partidos verificando que los selectores de equipos y estadios se llenen dinámicamente desde `equipos.json`.
- Se probó que al guardar o editar un partido, los cambios se reflejen al recargar la página.
- Se probó la confirmación modal antes de eliminar un partido y la eliminación reactiva en la tabla.
- Se probó la búsqueda por texto y los filtros combinados sin errores en la consola.
- Se forzó el error con `?fallar` verificando que la interfaz muestre el estado de error y el botón de Reintentar.

## Conclusión: lo que aprendí
*Aprendí cómo manejar el estado reactivo con Alpine.js utilizando `Alpine.data` para estructurar componentes limpios con propiedades computadas (`get partidosFiltrados()`), lo que permite que el buscador y los filtros se actualicen de manera instantánea mientras el usuario escribe sin tener que manipular el DOM manualmente. También aprendí a consumir datos asíncronos mediante `Promise.all` para traer partidos y equipos en paralelo sin bloquear la interfaz, y a imitar el comportamiento de una API REST mediante Promesas, latencia de red (`setTimeout`) y almacenamiento en `localStorage`. Por último, entendí la importancia de la accesibilidad en formularios (`aria-invalid`, `aria-describedby` y foco visible) y cómo documentar cada interacción de IA de forma transparente y completa para cumplir las exigencias académicas.*
