const form = document.getElementById("formLogin");
const mensaje = document.getElementById("mensaje");
const boton = form.querySelector('button[type="submit"]');

function mostrarMensaje(texto, color) {
  mensaje.textContent = texto;
  mensaje.style.color = color;
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    mostrarMensaje("Ingresa tu email y tu contraseña.", "red");
    return;
  }

  boton.disabled = true;
  boton.textContent = "Ingresando…";
  mostrarMensaje("", "");

  const respuesta = await iniciarSesion(email, password);

  boton.disabled = false;
  boton.textContent = "Entrar";

  if (!respuesta.ok) {
    mostrarMensaje(respuesta.error, "red");
    return;
  }

  localStorage.setItem("rol", respuesta.datos.rol);
  localStorage.setItem("usuario", respuesta.datos.email);
  mostrarMensaje("Bienvenido", "green");
  window.location.href = "usuario/dashboard.html";
});
