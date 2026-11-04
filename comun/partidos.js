// [IA] inicio · ia/2026-11-03_josefasolis1-hue_crud-partidos.md
// Lógica reactiva para la gestión, filtros, ordenamiento, CRUD y acta de partidos

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
    estado: "cargando", // "cargando" | "listo" | "error"
    mensajeError: "",
    partidos: [],

    // Búsqueda, filtros y ordenamiento (Rúbrica A2)
    busqueda: "",
    filtroEstado: "todos", // "todos" | "programado" | "finalizado"
    orden: "recientes", // "recientes" | "antiguos" | "local"

    // Control de modal de creación / edición
    modalFormulario: false,
    modoEdicion: false,
    guardando: false,
    form: formVacio(),
    errores: erroresVacios(),

    // Modal de Detalle / Acta Oficial del partido (Rúbrica 4.1)
    modalDetalle: false,
    partidoSeleccionado: null,
    nuevoAcontecimiento: {
      minuto: "",
      equipo: "",
      jugador: "",
      tipo: "Gol",
    },

    // Opciones para formularios
    equiposDisponibles: [
      "Colo-Colo",
      "U. de Chile",
      "U. Católica",
      "Everton",
      "Palestino",
      "Huachipato",
      "Coquimbo Unido",
      "La Serena",
      "Ñublense",
      "Deportes Limache",
    ],
    canchasDisponibles: [
      "Estadio Monumental David Arellano",
      "Estadio Nacional",
      "Claro Arena",
      "Estadio Sausalito",
      "Estadio Municipal de La Cisterna",
      "Estadio Huachipato-CAP Acero",
      "Estadio Francisco Sánchez Rumoroso",
      "Estadio La Portada",
      "Estadio Nelson Oyarzún",
      "Estadio Municipal de Limache",
    ],

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

    // Filtros combinados y ordenamiento reactivo
    get partidosFiltrados() {
      let lista = [...this.partidos];

      // 1. Filtro de búsqueda por texto
      if (this.busqueda.trim() !== "") {
        const q = this.busqueda.toLowerCase().trim();
        lista = lista.filter(
          (p) =>
            p.local.toLowerCase().includes(q) ||
            p.visitante.toLowerCase().includes(q) ||
            (p.cancha && p.cancha.toLowerCase().includes(q))
        );
      }

      // 2. Filtro por estado
      if (this.filtroEstado !== "todos") {
        lista = lista.filter((p) => p.estado === this.filtroEstado);
      }

      // 3. Ordenamiento
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

    // Modal Crear
    abrirCrear() {
      this.modoEdicion = false;
      this.form = formVacio();
      this.errores = erroresVacios();
      this.modalFormulario = true;
    },

    // Modal Editar
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
        if (typeof notificar === "function") {
          notificar("Revisa los campos marcados en el formulario.", "error");
        }
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
          if (typeof notificar === "function") {
            notificar("Partido actualizado correctamente.", "exito");
          }
        } else {
          if (typeof notificar === "function") notificar(res.error, "error");
        }
      } else {
        const res = await crearPartido(this.form);
        this.guardando = false;
        if (res.ok) {
          this.partidos.unshift(res.datos);
          this.cerrarModalFormulario();
          if (typeof notificar === "function") {
            notificar("Partido programado con éxito.", "exito");
          }
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
      } else {
        if (confirm(`¿Eliminar partido ${partido.local} vs ${partido.visitante}?`)) {
          this.eliminar(partido.id);
        }
      }
    },

    async eliminar(id) {
      const res = await eliminarPartido(id);
      if (res.ok) {
        this.partidos = this.partidos.filter((p) => p.id !== id);
        if (typeof notificar === "function") {
          notificar("Partido eliminado correctamente.", "exito");
        }
      } else {
        if (typeof notificar === "function") {
          notificar(res.error || "No se pudo eliminar el partido.", "error");
        }
      }
    },

    // Detalle del partido / Acta arbitral oficial
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
        if (typeof notificar === "function") {
          notificar("Ingresa minuto y jugador del acontecimiento.", "error");
        }
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

      // Si es gol o tarjeta, actualizamos totales del partido
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
        if (typeof notificar === "function") {
          notificar("Acontecimiento registrado en el acta.", "exito");
        }
      }
    },

    async eliminarAcontecimiento(acId) {
      const p = this.partidoSeleccionado;
      p.acontecimientos = p.acontecimientos.filter((a) => a.id !== acId);
      const res = await actualizarPartido(p.id, p);
      if (res.ok) {
        const idx = this.partidos.findIndex((x) => x.id === p.id);
        if (idx !== -1) this.partidos[idx] = JSON.parse(JSON.stringify(p));
        if (typeof notificar === "function") {
          notificar("Acontecimiento eliminado del acta.", "exito");
        }
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
// [IA] fin
