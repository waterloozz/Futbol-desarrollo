// [IA] inicio · ia/2026-11-09_waterloozz_registro-cuenta.md
document.addEventListener("alpine:init", () => {
  const vacio = () => ({
    nombre: "",
    rut: "",
    email: "",
    telefono: "",
    categoria: "",
    password: "",
    confirmarPassword: "",
  });

  Alpine.data("registro", () => ({
    form: vacio(),
    errores: vacio(),
    categorias: ["FIFA", "Primera División", "Primera B", "Segunda División", "Amateur"],
    errorGeneral: "",
    enviando: false,

    mensajeDe(campo) {
      const f = this.form;
      switch (campo) {
        case "nombre":
          return f.nombre.trim().length < 3 ? "Ingresa el nombre completo (mínimo 3 caracteres)." : "";
        case "rut":
          return /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(f.rut.trim())
            ? ""
            : "Formato de RUT inválido. Debe incluir guion (ej: 12.345.678-5).";
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
      this.errorGeneral = "";
      if (this.errores[campo]) this.validarCampo(campo);
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

    async registrar() {
      if (this.enviando) return;
      this.errorGeneral = "";
      if (!this.validar()) {
        this.enfocarPrimerError();
        return;
      }

      this.enviando = true;
      try {
        const respuesta = await crearArbitro(this.form);
        if (respuesta.ok) {
          localStorage.setItem("rol", respuesta.datos.rol);
          localStorage.setItem("usuario", respuesta.datos.email);
          window.location.href = "../usuario/dashboard.html";
          return;
        }
        if (respuesta.errores) {
          Object.assign(this.errores, respuesta.errores);
          this.enfocarPrimerError();
        } else {
          this.errorGeneral = respuesta.error;
        }
      } finally {
        this.enviando = false;
      }
    },
  }));
});
// [IA] fin
