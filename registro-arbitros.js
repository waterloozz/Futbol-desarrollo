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
    categorias: ["FIFA", "Primera División", "Primera B", "Segunda División", "Amateur"],

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
        this.errores.nombre = "Ingresa el nombre completo (mínimo 3 caracteres).";
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
