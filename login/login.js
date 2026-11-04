const form = document.getElementById("formLogin");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;

  if (usuario === "arbitro") {
    if (password === "arbitro123") {
      mensaje.textContent = "Bienvenido";
      mensaje.style.color = "green";
      localStorage.setItem("rol", "arbitro");
      localStorage.setItem("usuario", usuario);
      window.location.href = "usuario/dashboard.html";
    } else {
      mensaje.textContent = "Contraseña incorrecta";
      mensaje.style.color = "red";
    }
  } else if (usuario === "admin") {
    if (password === "admin123") {
      mensaje.textContent = "Bienvenido";
      mensaje.style.color = "green";
      localStorage.setItem("rol", "admin");
      localStorage.setItem("usuario", usuario);
      window.location.href = "usuario/dashboard.html";
    } else {
      mensaje.textContent = "Contraseña incorrecta";
      mensaje.style.color = "red";
    }
  } else {
    mensaje.textContent = "Usuario no reconocido.";
    mensaje.style.color = "red";
  }
});
