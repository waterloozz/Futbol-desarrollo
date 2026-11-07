function crearSal() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashearPassword(password, sal) {
  if (!crypto.subtle) {
    throw new Error("Para registrar contraseñas la página debe abrirse en https o en localhost.");
  }
  const datos = new TextEncoder().encode(sal + password);
  const huella = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(huella), (b) => b.toString(16).padStart(2, "0")).join("");
}
