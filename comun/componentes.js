function notificar(mensaje, tipo = "exito", duracion = 3000) {
  window.dispatchEvent(
    new CustomEvent("notificar", { detail: { mensaje, tipo, duracion } })
  );
}

function pedirConfirmacion(opciones) {
  window.dispatchEvent(
    new CustomEvent("pedir-confirmacion", { detail: opciones })
  );
}

document.addEventListener("alpine:init", () => {

  Alpine.data("notificaciones", () => ({
    
    lista: [],
    siguienteId: 1,

    agregar({ mensaje = "", tipo = "exito", duracion = 3000 } = {}) {
      const id = this.siguienteId++;
      this.lista.push({ id, mensaje, tipo, visible: true });

     
      setTimeout(() => this.cerrar(id), duracion);
    },

    cerrar(id) {
      const toast = this.lista.find((t) => t.id === id);
      if (!toast || !toast.visible) return; 
      
      toast.visible = false;
      
      setTimeout(() => {
        this.lista = this.lista.filter((t) => t.id !== id);
      }, 300);
    },
  }));

  
  Alpine.data("modalConfirmacion", () => ({
    abierto: false, 
    titulo: "",
    mensaje: "",
    textoConfirmar: "Confirmar",
    alConfirmar: null, 
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
