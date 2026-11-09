# Sistema de Acta Digital Arbitral

Aplicación web para que los **árbitros de fútbol registren lo que ocurre en un partido** y para que el administrador gestione a los árbitros. Reemplaza la libreta tradicional del árbitro por una herramienta digital sencilla.

Es la Entrega 2 de Desarrollo Web y Móvil (CIT2008, UDP): frontend con datos simulados (mocks) detrás de una capa de servicios que imita una API REST y que en la Entrega 3 se reemplazará por el backend real.

**Integrantes:**

- Carlos Benavides (@CBenavidesP)
- Roberto Sánchez
- Josefa Solís (@josefasolis1-hue)

---

## Tecnologías

| Tecnología | Uso | Cómo se incluye |
|---|---|---|
| HTML, CSS y JavaScript | Base del proyecto | Archivos del repositorio |
| [Alpine.js 3.14.9](https://alpinejs.dev) | Interactividad: `x-data`, `x-show`, `x-for`, `x-model`, `@click`, `Alpine.data` | CDN (jsDelivr) |
| [Tailwind CSS 4](https://tailwindcss.com) | Estilos de las vistas internas con clases utilitarias y prefijos responsivos | CDN (`@tailwindcss/browser@4.1.13`) |
| [Vite 8](https://vite.dev) | Servidor local de desarrollo | npm (`devDependencies`) |
| [Web Crypto API](https://developer.mozilla.org/es/docs/Web/API/Web_Crypto_API) (`crypto.subtle`) | Hash SHA-256 con sal para las contraseñas de los árbitros (`comun/seguridad.js`) | Nativa del navegador (no se instala) |

La pantalla de login usa su propio archivo de estilos (`login/login.css`).

> **Sobre las contraseñas:** la Web Crypto API es parte del navegador, no una librería externa. Los navegadores solo la habilitan en **localhost** o en sitios **https**, por eso el registro de árbitros con contraseña funciona al levantar el proyecto con `npm run dev`, pero no en una dirección `http://` con IP. Como no hay backend, esto es una simulación: en la Entrega 3 el hash se calculará en el servidor.

## Requisitos

- **Node.js 20.19 o superior** (o 22.12+). Comprobar con `node -v`.
- npm (viene con Node).
- Un navegador moderno (Chrome, Firefox, Edge o Safari actualizados).

> **Importante:** la aplicación carga los mocks con `fetch`, así que **no funciona abriendo `index.html` con doble clic** (`file://`). Siempre hay que levantarla con un servidor local.

## Instalación y ejecución

```bash
git clone https://github.com/waterloozz/Futbol-desarrollo.git
cd Futbol-desarrollo
npm install
npm run dev
```

Abrir la URL que muestra la terminal (por defecto **http://localhost:5173**).

También funciona con la extensión **Live Server** de VS Code: clic derecho en `index.html` → **Open with Live Server**.

## Credenciales de prueba

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `admin123` |
| Árbitro | `arbitro` | `arbitro123` |

- **Árbitro:** ve el inicio con el resumen del torneo, partidos y perfil.
- **Administrador:** además entra a **Usuarios**, donde registra y elimina árbitros.

## Vistas

| Vista | Archivo | Cómo llegar | Acceso |
|---|---|---|---|
| Iniciar sesión | `index.html` | Al abrir la aplicación | Pública |
| Inicio (resumen del torneo) | `usuario/dashboard.html` | Al iniciar sesión, o menú **Inicio** | Con sesión |
| Partidos (en construcción) | `usuario/partidos.html` | Menú **Partidos** | Con sesión |
| Perfil (en construcción) | `usuario/perfil.html` | Menú **Perfil** | Con sesión |
| Usuarios (registro de árbitros) | `admin/usuarios.html` | Menú **Usuarios** | Solo administrador |

Sin sesión, cualquier vista interna redirige al login. Un árbitro que intenta entrar a **Usuarios** vuelve al inicio. **Cerrar sesión** (en el menú) limpia los datos guardados y vuelve al login.

## Funcionalidades

- **Sesión simulada:** el login guarda el rol en `localStorage` y las vistas internas lo revisan antes de mostrarse.
- **Menú común** en todas las vistas internas: marca la vista actual, muestra **Usuarios** solo al administrador y se convierte en menú hamburguesa en móvil.
- **Inicio:** totales del torneo, próximos partidos y últimos resultados, con estados de *cargando* (skeleton), *vacío* y *error con botón Reintentar*.
- **Registro de árbitros (administrador):** formulario con validación por campo (nombre, RUT con guion, email, teléfono y categoría), modal de confirmación antes de guardar y de eliminar, tabla que se actualiza al instante y notificaciones (toasts) de éxito o error.
- **Componentes de interfaz:** modal de confirmación, notificaciones (toasts) y menú desplegable.

---

## Capa de datos (mocks como API)

Todo el acceso a datos está en `comun/api.js`. Las vistas no leen los JSON directamente: llaman a funciones de esta capa.

- Las funciones son **asíncronas** y esperan **400 ms** antes de responder, para imitar la latencia de red.
- Leen los archivos de `public/mocks/`. Los cambios en partidos (crear, editar, eliminar) se guardan en `localStorage` y se mantienen al recargar.
- Responden con `{ ok: true, datos }` si todo sale bien, o `{ ok: false, error }` con un mensaje para mostrar en pantalla.

### Endpoints simulados

| Función | Método | Ruta equivalente | Fuente de datos | Descripción |
|---|---|---|---|---|
| `obtenerResumen(usuario)` | GET | `/api/resumen` | `partidos.json` + `usuarios.json` | Totales, próximos partidos y últimos resultados |
| `obtenerPartidos()` | GET | `/api/partidos` | `partidos.json` / `localStorage` | Lista de partidos |
| `crearPartido(nuevoPartido)` | POST | `/api/partidos` | `localStorage` | Crea un partido y lo devuelve con su `id` |
| `actualizarPartido(id, datos)` | PUT | `/api/partidos/:id` | `localStorage` | Actualiza un partido, o error si no existe |
| `eliminarPartido(id)` | DELETE | `/api/partidos/:id` | `localStorage` | Elimina un partido y devuelve su `id` |

### Datos (`public/mocks/`)

| Archivo | Registros | Contenido |
|---|---|---|
| `partidos.json` | 12 | Fecha, hora, equipos, goles, tarjetas, estado, cancha, árbitro, acontecimientos y observaciones |
| `usuarios.json` | 10 | Usuarios con nombre, email y rol (administrador o árbitro) |
| `equipos.json` | 10 | Nombre, iniciales, ciudad y estadio de cada equipo |

---

## Estructura del proyecto

```
Futbol-desarrollo/
├── index.html                 Login (página de entrada)
├── login/
│   ├── login.js               Validación de credenciales y guardado de la sesión
│   └── login.css              Estilos del login
├── comun/                     Lo que usan todas las vistas internas
│   ├── api.js                 Capa de datos (mocks como API)
│   ├── sesion.js              Protección de rutas por sesión y rol
│   ├── menu.js                Menú común con control por rol
│   └── componentes.js         Notificaciones (toasts) y modal de confirmación
├── usuario/                   Vistas del árbitro (y del administrador)
│   ├── dashboard.html         Inicio con el resumen del torneo
│   ├── dashboard.js
│   ├── partidos.html
│   └── perfil.html
├── admin/                     Vistas solo para el administrador
│   ├── usuarios.html          Registro de árbitros
│   ├── registro-arbitros.js
│   └── registro-arbitros.css  Estilos de toasts y modal
├── public/
│   └── mocks/                 Un JSON por recurso
├── ia/
│   └── README.md              Índice de uso de IA
└── package.json
```

---

## Uso de IA

Ver el índice en [`ia/README.md`](ia/README.md).

---

## Estado del proyecto

En desarrollo.
