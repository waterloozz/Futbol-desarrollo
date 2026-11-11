// [IA] inicio · ia/2026-11-09_cbenavidesp_validacion-login.md
document.addEventListener("alpine:init", () => {
  Alpine.data("login", () => ({
    form: { email: "", password: "" },
    errores: { email: "", password: "" },
    errorGeneral: "",
    enviando: false,

    mensajeDe(campo) {
      const f = this.form;
      switch (campo) {
        case "email":
          if (!f.email.trim()) return "Ingresa tu email.";
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) ? "" : "Ingresa un email válido.";
        case "password":
          return f.password ? "" : "Ingresa tu contraseña.";
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
    },

    validar() {
      Object.keys(this.errores).forEach((campo) => this.validarCampo(campo));
      return Object.values(this.errores).every((msg) => msg === "");
    },

    enfocarPrimerError() {
      this.$nextTick(() => this.$root.querySelector('[aria-invalid="true"]')?.focus());
    },

    async entrar() {
      if (this.enviando) return;
      this.errorGeneral = "";
      if (!this.validar()) {
        this.enfocarPrimerError();
        return;
      }

      this.enviando = true;
      try {
        const respuesta = await iniciarSesion(this.form.email, this.form.password);
        if (!respuesta.ok) {
          this.errorGeneral = respuesta.error;
          return;
        }
        localStorage.setItem("rol", respuesta.datos.rol);
        localStorage.setItem("usuario", respuesta.datos.email);
        window.location.href = "usuario/dashboard.html";
      } catch (error) {
        this.errorGeneral = "No se pudo iniciar sesión. Intenta de nuevo.";
      } finally {
        this.enviando = false;
      }
    },
  }));
});
// [IA] fin
