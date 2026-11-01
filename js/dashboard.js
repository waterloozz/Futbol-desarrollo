// Componente Alpine del dashboard. Los datos vienen de obtenerResumen() (js/api.js).

document.addEventListener("alpine:init", () => {
  Alpine.data("dashboard", () => ({
    rol: localStorage.getItem("rol"),
    cargando: true,
    error: "",
    resumen: null,

    async init() {
      // Sin acceso la página ya va saliendo (ver js/sesion.js): no se piden datos
      if (redirigiendo) return;

      try {
        this.resumen = await obtenerResumen();
      } catch (error) {
        this.error = "No se pudo cargar el resumen.";
        console.error(error);
      } finally {
        this.cargando = false;
      }
    },

    // "2026-11-07" -> "sáb, 07 nov". El T00:00 evita que se lea como UTC
    // y aparezca el día anterior.
    formatearFecha(fecha) {
      return new Date(`${fecha}T00:00`).toLocaleDateString("es-CL", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      });
    },
  }));
});
