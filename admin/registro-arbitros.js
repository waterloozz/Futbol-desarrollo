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

    rutExiste(rut) {
      const limpiar = (r) => r.replace(/\./g, "").toUpperCase().trim();
      return this.arbitros.some((a) => limpiar(a.rut) === limpiar(rut));
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

    reiniciarFormulario() {
      this.form = formVacio();
      this.errores = formVacio();
    },

    solicitarEliminacion(arbitro) {
      pedirConfirmacion({
        titulo: "Eliminar árbitro",
        mensaje: `¿Confirmas la eliminación de ${arbitro.nombre}?`,
        textoConfirmar: "Eliminar",
        alConfirmar: () => this.eliminarArbitro(arbitro.id),
      });
    },

    eliminarArbitro(id) {
      this.arbitros = this.arbitros.filter((a) => a.id !== id);
      notificar("Árbitro eliminado correctamente.");
    },
  }));
});
