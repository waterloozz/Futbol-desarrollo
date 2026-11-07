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

    validar() {
      this.errores = formVacio();
      const f = this.form;

      if (f.nombre.trim().length < 3) {
        this.errores.nombre = "Ingresa el nombre completo (mínimo 3 caracteres).";
      }

      if (!/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(f.rut.trim())) {
        this.errores.rut = "Formato de RUT inválido. Debe incluir guion (ej: 12.345.678-5).";
      } else if (this.rutExiste(f.rut)) {
        this.errores.rut = "Ya existe un árbitro con este RUT.";
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
        this.errores.email = "Ingresa un email válido.";
      }

      if (f.telefono.replace(/\D/g, "").length < 8) {
        this.errores.telefono = "Ingresa un teléfono válido.";
      }

      if (!f.categoria) {
        this.errores.categoria = "Selecciona una categoría.";
      }

      if (f.password.length < 8) {
        this.errores.password = "La contraseña debe tener al menos 8 caracteres.";
      }

      if (f.confirmarPassword !== f.password) {
        this.errores.confirmarPassword = "Las contraseñas no coinciden.";
      }

      return Object.values(this.errores).every((msg) => msg === "");
    },

    rutExiste(rut) {
      const limpiar = (r) => r.replace(/\./g, "").toUpperCase().trim();
      return this.arbitros.some((a) => limpiar(a.rut) === limpiar(rut));
    },

    solicitarGuardado() {
      if (!this.validar()) {
        notificar("Revisa los campos marcados en el formulario.", "error");
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
      const f = this.form;
      const sal = crearSal();
      let passwordHash;
      try {
        passwordHash = await hashearPassword(f.password, sal);
      } catch (error) {
        notificar(error.message, "error");
        return;
      }

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
