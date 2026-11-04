/*
 * Componentes globales de Alpine.js
 * ---------------------------------
 * Este archivo se carga ANTES que Alpine (ver admin/usuarios.html). Por eso no usamos
 * Alpine directamente aquí arriba: esperamos el evento "alpine:init", que
 * Alpine dispara justo antes de recorrer el HTML buscando x-data.
 *
 * Cada componente vive una sola vez en la pagina que lo usa y escucha eventos en
 * "window". Así cualquier parte de la página (otro componente Alpine o JS
 * normal como login.js) puede usarlos sin conocer su estado interno.
 */

/* =========================================================
 * Funciones de ayuda para el equipo
 * Se pueden llamar desde JS normal. Dentro de Alpine también
 * sirve $dispatch('notificar', {...}).
 * ========================================================= */

// notificar("Partido guardado")  /  notificar("Falta el equipo local", "error")
function notificar(mensaje, tipo = "exito", duracion = 3000) {
  window.dispatchEvent(
    new CustomEvent("notificar", { detail: { mensaje, tipo, duracion } })
  );
}

// pedirConfirmacion({ titulo, mensaje, textoConfirmar, alConfirmar: () => {...} })
function pedirConfirmacion(opciones) {
  window.dispatchEvent(
    new CustomEvent("pedir-confirmacion", { detail: opciones })
  );
}

document.addEventListener("alpine:init", () => {
  /* =========================================================
   * Notificaciones flotantes (toasts)
   * ========================================================= */
  Alpine.data("notificaciones", () => ({
    // Todo lo que está en este objeto es reactivo: si cambia "lista",
    // Alpine vuelve a dibujar el <template x-for> automáticamente.
    lista: [],
    siguienteId: 1,

    agregar({ mensaje = "", tipo = "exito", duracion = 3000 } = {}) {
      const id = this.siguienteId++;
      this.lista.push({ id, mensaje, tipo, visible: true });

      // Temporizador: pasado el tiempo se cierra solo
      setTimeout(() => this.cerrar(id), duracion);
    },

    cerrar(id) {
      const toast = this.lista.find((t) => t.id === id);
      if (!toast || !toast.visible) return; // ya se cerró a mano

      // 1) visible = false -> x-show ejecuta la transición de salida
      toast.visible = false;
      // 2) cuando termina la animación lo sacamos del arreglo
      setTimeout(() => {
        this.lista = this.lista.filter((t) => t.id !== id);
      }, 300);
    },
  }));

  /* =========================================================
   * Modal de confirmación
   * ========================================================= */
  Alpine.data("modalConfirmacion", () => ({
    abierto: false, // x-show="abierto" muestra u oculta el modal
    titulo: "",
    mensaje: "",
    textoConfirmar: "Confirmar",
    alConfirmar: null, // función que se ejecuta si el usuario acepta

    abrir({
      titulo = "¿Estás seguro?",
      mensaje = "",
      textoConfirmar = "Confirmar",
      alConfirmar = null,
    } = {}) {
      this.titulo = titulo;
      this.mensaje = mensaje;
      this.textoConfirmar = textoConfirmar;
      this.alConfirmar = alConfirmar;
      this.abierto = true;

      // $nextTick espera a que Alpine actualice el DOM (el modal ya visible)
      this.$nextTick(() => this.$refs.botonCancelar.focus());
    },

    cerrar() {
      this.abierto = false;
      this.alConfirmar = null;
    },

    confirmar() {
      const accion = this.alConfirmar;
      this.cerrar();
      if (typeof accion === "function") accion();
    },
  }));
});
