document.addEventListener("alpine:init", () => {
  const formVacio = () => ({
    nombre: "",
    rut: "",
    email: "",
    telefono: "",
    categoria: "",
    password: "",
    confirmarPassword: "",
  });

  Alpine.data("registroArbitros", () => ({
    form: formVacio(),
    errores: formVacio(),

    categorias: ["FIFA", "Primera División", "Primera B", "Segunda División", "Amateur"],

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
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
            return "Ingresa un email válido.";
          }
          return this.emailExiste(f.email) ? "Ya existe un usuario con este email." : "";
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

    rutExiste(rut) {
      const limpiar = (r) => r.replace(/\./g, "").toUpperCase().trim();
      return this.arbitros.some((a) => a.rut && limpiar(a.rut) === limpiar(rut));
    },

    emailExiste(email) {
      const buscado = email.trim().toLowerCase();
      return this.arbitros.some((a) => a.email.toLowerCase() === buscado);
    },

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
        notificar(error.message, "error");
      } finally {
        this.guardando = false;
      }
    },

    reiniciarFormulario() {
      this.form = formVacio();
      this.errores = formVacio();
    },

    solicitarEliminacion(arbitro) {
      pedirConfirmacion({
        titulo: "Eliminar árbitro",
        mensaje: `¿Confirmas la eliminación de ${arbitro.nombre}?`,
        textoConfirmar: "Eliminar",
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
  }));
});
