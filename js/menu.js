// Menú común de las páginas internas. Cada página pone <header id="menu-comun"></header>
// y carga este archivo con defer ANTES que Alpine: así el HTML del menú ya
// está insertado cuando Alpine arranca y procesa su x-data.
// Para agregar una sección, súmala a LINKS_MENU.

const LINKS_MENU = [
  { texto: "Inicio", href: "dashboard.html" },
  { texto: "Partidos", href: "partidos.html" },
  { texto: "Perfil", href: "perfil.html" },
  { texto: "Usuarios", href: "usuarios.html", soloAdmin: true },
];

const HTML_MENU = `
  <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 px-4 py-3">
    <a href="dashboard.html" class="py-2 text-lg font-bold">Acta Digital Arbitral</a>

    <button
      type="button"
      class="rounded p-2 hover:bg-blue-700 md:hidden"
      @click="abierto = !abierto"
      :aria-expanded="abierto.toString()"
      aria-controls="menu-principal"
      :aria-label="abierto ? 'Cerrar menú' : 'Abrir menú'"
    >
      <svg x-show="!abierto" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      <svg x-show="abierto" x-cloak class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>

    <!-- En móvil se ve solo si está abierto; desde md siempre -->
    <nav
      id="menu-principal"
      aria-label="Menú principal"
      class="w-full md:w-auto"
      :class="abierto ? 'block' : 'hidden md:block'"
      x-cloak
    >
      <ul class="flex flex-col gap-1 pb-3 md:flex-row md:items-center md:pb-0">
        <template x-for="link in linksVisibles" :key="link.href">
          <li>
            <a
              :href="link.href"
              x-text="link.texto"
              :aria-current="esActual(link) ? 'page' : null"
              class="block rounded px-3 py-2"
              :class="esActual(link) ? 'bg-white font-semibold text-blue-800' : 'hover:bg-blue-700'"
            ></a>
          </li>
        </template>
        <li>
          <button
            type="button"
            @click="cerrarSesion()"
            class="w-full rounded px-3 py-2 text-left hover:bg-blue-700 md:ml-2 md:border md:border-white/40"
          >Cerrar sesión</button>
        </li>
      </ul>
    </nav>
  </div>
`;

const contenedorMenu = document.getElementById("menu-comun");
if (contenedorMenu) {
  contenedorMenu.className = "bg-blue-800 text-white shadow";
  contenedorMenu.setAttribute("x-data", "menu");
  contenedorMenu.setAttribute("@click.outside", "abierto = false");
  contenedorMenu.setAttribute("@keydown.escape.window", "abierto = false");
  contenedorMenu.innerHTML = HTML_MENU;
}

document.addEventListener("alpine:init", () => {
  Alpine.data("menu", () => ({
    abierto: false,
    rol: localStorage.getItem("rol"),

    get linksVisibles() {
      return LINKS_MENU.filter((link) => !link.soloAdmin || this.rol === "admin");
    },

    // Compara el archivo de la URL actual ("/dashboard.html" -> "dashboard.html") con el link
    esActual(link) {
      return window.location.pathname.split("/").pop() === link.href;
    },

    cerrarSesion() {
      localStorage.clear();
      window.location.replace("index.html");
    },
  }));
});
