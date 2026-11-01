// Protección de rutas. Va en el <head> como primer script y sin defer,
// para que corra antes de que se dibuje la página.
//   <script src="js/sesion.js"></script>                  requiere sesión
//   <script src="js/sesion.js" data-rol="admin"></script>  requiere ese rol

const rolRequerido = document.currentScript.dataset.rol;

// A dónde mandar al usuario, o null si puede quedarse
function destinoSinAcceso() {
  const rol = localStorage.getItem("rol");
  if (!rol) return "index.html";
  if (rolRequerido && rol !== rolRequerido) return "dashboard.html";
  return null;
}

function protegerRuta() {
  const destino = destinoSinAcceso();
  if (destino) {
    document.documentElement.hidden = true;
    // replace() para que "Atrás" no vuelva a esta página
    window.location.replace(destino);
  }
  return destino !== null;
}

// Los componentes lo revisan para no pedir datos si la página va saliendo
const redirigiendo = protegerRuta();

// Al volver con "Atrás" el navegador puede mostrar la página desde caché
// sin ejecutar los scripts de nuevo
window.addEventListener("pageshow", function (event) {
  if (event.persisted) protegerRuta();
});
