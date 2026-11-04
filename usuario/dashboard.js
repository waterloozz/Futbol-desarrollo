// Componente Alpine del dashboard. Los datos vienen de obtenerResumen() (comun/api.js).

document.addEventListener("alpine:init", () => {
  Alpine.data("dashboard", () => ({
    estado: "cargando", // "cargando" | "listo" | "error"
    resumen: null,
    mensajeError: "",

    // Los indicadores como lista, para que el HTML los dibuje con un x-for
    get indicadores() {
      const r = this.resumen;
      return [
        { id: "total", etiqueta: "Partidos totales", valor: r.totalPartidos },
        { id: "programados", etiqueta: "Programados", valor: r.programados },
        { id: "finalizados", etiqueta: "Finalizados", valor: r.finalizados },
        { id: "tarjetas", etiqueta: "Tarjetas", valor: r.tarjetas },
      ];
    },

    init() {
      // Sin acceso la página ya va saliendo (ver comun/sesion.js): no se piden datos
      if (redirigiendo) return;
      this.cargar();
    },

    // También la usa el botón "Reintentar"
    async cargar() {
      this.estado = "cargando";
      this.mensajeError = "";
      const respuesta = await obtenerResumen(localStorage.getItem("usuario"));

      if (respuesta.ok) {
        this.resumen = respuesta.datos;
        this.estado = "listo";
      } else {
        this.mensajeError = respuesta.error;
        this.estado = "error";
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
