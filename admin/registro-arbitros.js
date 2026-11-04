document.addEventListener("alpine:init", () => {
  const formVacio = () => ({
    nombre: "",
    rut: "",
    email: "",
    telefono: "",
    categoria: "",
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

      // Acepta 12.345.678-5 o 12345678-5 (dígito verificador 0-9 o K)
      if (!/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(f.rut.trim())) {
        this.errores.rut = "Formato de RUT inválido. Debe incluir guion (ej: 12.345.678-5).";
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

    solicitarEliminacion(arbitro) {
      pedirConfirmacion({
        titulo: "Eliminar árbitro",
        mensaje: `¿Confirmas la eliminación de ${arbitro.nombre}?`,
        textoConfirmar: "Eliminar",
        alConfirmar: () => this.eliminarArbitro(arbitro.id),
      });
    },

    // deja todos los arbitros menos el que tiene ese id, y la tabla se actualiza sola
    eliminarArbitro(id) {
      this.arbitros = this.arbitros.filter((a) => a.id !== id);
      notificar("Árbitro eliminado correctamente.");
    },
  }));
});
