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

Se inicia sesión con **email y contraseña**.

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@futbolapp.cl` | `admin123` |
| Árbitro (cuenta de prueba) | `arbitro@futbolapp.cl` | `arbitro123` |

Los otros 8 árbitros de `public/mocks/usuarios.json` también pueden entrar: su contraseña es la primera parte de su email seguida de `123` (por ejemplo, `jperez@futbolapp.cl` / `jperez123`). Los árbitros que registra el administrador entran con el email y la contraseña que se les asignó.

- **Árbitro:** ve el inicio con el resumen del torneo, partidos y perfil.
- **Administrador:** además entra a **Usuarios**, donde registra y elimina árbitros.

> En el mock las contraseñas no están escritas: cada usuario tiene una **sal** y un **hash SHA-256** (ver *Sobre las contraseñas* en Tecnologías).

## Vistas

| Vista | Archivo | Cómo llegar | Acceso |
|---|---|---|---|
| Iniciar sesión | `index.html` | Al abrir la aplicación | Pública |
| Inicio (resumen del torneo) | `usuario/dashboard.html` | Al iniciar sesión, o menú **Inicio** | Con sesión |
| Partidos y acta oficial | `usuario/partidos.html` | Menú **Partidos** | Con sesión |
| Perfil y configuración | `usuario/perfil.html` | Menú **Perfil** | Con sesión |
| Usuarios (registro de árbitros) | `admin/usuarios.html` | Menú **Usuarios** | Solo administrador |
| Página no encontrada | `404.html` | Abrir una dirección que no existe, por ejemplo `http://localhost:5173/no-existe.html` | Pública |

Sin sesión, cualquier vista interna redirige al login. Un árbitro que intenta entrar a **Usuarios** vuelve al inicio. **Cerrar sesión** (en el menú) borra la sesión y vuelve al login; los partidos, los árbitros y el perfil guardados se mantienen.

> La página no encontrada se muestra con `npm run dev` gracias a `vite.config.js`. Con Live Server se ve la página de error propia de la extensión.

## Funcionalidades

- **Login con email:** valida cada campo en tiempo real (email obligatorio y con formato, contraseña obligatoria), deshabilita el botón mientras se comprueban los datos y muestra un mensaje general si el email o la contraseña son incorrectos, sin decir cuál de los dos falló.
- **Sesión simulada:** el login guarda el rol y el email en `localStorage` y las vistas internas lo revisan antes de mostrarse.
- **Menú común** en todas las vistas internas: marca la vista actual, muestra **Usuarios** solo al administrador y se convierte en menú hamburguesa en móvil.
- **Inicio:** saludo por nombre, totales del torneo, próximos partidos y últimos resultados, con estados de *cargando* (skeleton), *vacío* y *error con botón Reintentar*.
- **Partidos:** listado con búsqueda por equipo o estadio, filtro por estado (programado o finalizado) y orden por fecha o por equipo local. CRUD completo (crear, editar y eliminar con confirmación), con los cambios guardados en `localStorage`.
- **Acta oficial:** detalle de cada partido donde se registran y eliminan acontecimientos (goles y tarjetas) por minuto; el marcador y las tarjetas se actualizan solos.
- **Perfil:** muestra el usuario y su rol, y permite editar la asociación y el teléfono de contacto, que se mantienen al recargar.
- **Registro de árbitros (administrador):**
  - Formulario con nombre, RUT con guion, email, teléfono, categoría, contraseña y su confirmación.
  - Validación en tiempo real: cada campo se revisa al salir de él y, si tenía error, mientras se corrige. El email y el RUT no pueden repetirse.
  - La contraseña se guarda como **sal + hash**, nunca en texto plano.
  - Modal de confirmación antes de guardar y de eliminar, botón deshabilitado mientras guarda, y notificaciones (toasts) de éxito o error.
  - La lista se carga desde la capa de datos, con estados de *cargando* y *error con Reintentar*, y se mantiene al recargar.
  - **Cada árbitro registrado puede iniciar sesión con su propio email y contraseña.**
- **Accesibilidad en los formularios:** `aria-invalid` y `aria-describedby` en los campos con error, y foco automático en el primer campo con error al enviar.
- **Componentes de interfaz:** modales (confirmación, formulario de partido y acta), notificaciones (toasts) y menú desplegable.

## Cómo probar

Con `npm run dev` y la aplicación abierta en **http://localhost:5173**:

1. **Validación del login:** sin escribir nada, apretar **Entrar** (aparecen los errores y el cursor va al email). Escribir un email sin `@` y pasar al siguiente campo (aparece el error) y corregirlo (el error se quita solo).
2. **Credenciales incorrectas:** entrar con `admin@futbolapp.cl` y una contraseña cualquiera. Arriba aparece *"Email o contraseña incorrectos."* y se borra al volver a escribir.
3. **Registrar un árbitro:** entrar como administrador, ir a **Usuarios** y completar el formulario. Probar los errores (RUT sin guion, email repetido como `jperez@futbolapp.cl`, contraseña de menos de 8 caracteres o confirmación distinta) y luego registrarlo con datos válidos.
4. **Que quede guardado:** recargar la página (el árbitro sigue en la tabla) y cerrar sesión.
5. **Acceso propio del árbitro nuevo:** iniciar sesión con el email y la contraseña del árbitro registrado. El inicio lo saluda por su nombre y el menú no muestra **Usuarios**.
6. **Eliminar:** volver a entrar como administrador, eliminar ese árbitro y comprobar que ya no puede iniciar sesión.
7. **Página no encontrada:** abrir `http://localhost:5173/no-existe.html`. Con sesión el botón vuelve al inicio; sin sesión lleva al login.

Para volver a los datos originales de `public/mocks/`, ejecutar `localStorage.clear()` en la consola del navegador (F12) y recargar.

---

## Capa de datos (mocks como API)

Todo el acceso a datos está en `comun/api.js`. Las vistas no leen los JSON directamente: llaman a funciones de esta capa.

- Las funciones son **asíncronas** y esperan **450 ms** antes de responder, para imitar la latencia de red.
- La primera vez leen los archivos de `public/mocks/` y los copian a `localStorage` (`partidos_crud_data` y `usuarios_data`). Desde ahí se leen y se guardan todos los cambios, que se mantienen al recargar.
- Responden con `{ ok: true, status, datos }` si todo sale bien (200 o 201), o `{ ok: false, status, error }` con un mensaje para mostrar en pantalla (401, 404, 409 o 500). En los errores de validación (409) también envían `errores`, con un mensaje por campo.
- Las funciones de usuarios **nunca entregan la sal ni el hash** a las vistas.
- **Forzar un error (para probar el estado de error):** agregar `?fallar` a la URL de la página (por ejemplo `http://localhost:5173/usuario/dashboard.html?fallar`) y toda lectura responde `{ ok: false, status: 500, error }`, con el botón **Reintentar** visible. `?fallar=0` lo desactiva. También se puede simular una falla al azar con `?probabilidadFalla=0.3` (30 %) o cambiando `PROBABILIDAD_FALLA` en `comun/api.js`.

### Endpoints simulados

| Función | Método | Ruta equivalente | Fuente de datos | Descripción |
|---|---|---|---|---|
| `iniciarSesion(email, password)` | POST | `/api/auth/login` | `usuarios.json` / `localStorage` | Comprueba la contraseña con su sal y hash. 200 con el usuario, o 401 si el email o la contraseña son incorrectos |
| `obtenerResumen(usuario)` | GET | `/api/resumen` | `partidos.json` + `usuarios.json` / `localStorage` | Totales, próximos partidos, últimos resultados y nombre de quien inició sesión |
| `obtenerArbitros()` | GET | `/api/arbitros` | `usuarios.json` / `localStorage` | Lista de usuarios con rol árbitro, sin sal ni hash. 200 |
| `crearArbitro(datos)` | POST | `/api/arbitros` | `localStorage` | Crea un árbitro y guarda su contraseña con sal y hash. 201, o 409 si el email o el RUT ya existen |
| `eliminarArbitro(id)` | DELETE | `/api/arbitros/:id` | `localStorage` | Elimina un árbitro. 200, o 404 si no existe |
| `obtenerPartidos()` | GET | `/api/partidos` | `partidos.json` / `localStorage` | Lista de partidos |
| `crearPartido(nuevoPartido)` | POST | `/api/partidos` | `localStorage` | Crea un partido y lo devuelve con su `id` |
| `actualizarPartido(id, datos)` | PUT | `/api/partidos/:id` | `localStorage` | Actualiza un partido, o error si no existe |
| `eliminarPartido(id)` | DELETE | `/api/partidos/:id` | `localStorage` | Elimina un partido y devuelve su `id` |

### Datos (`public/mocks/`)

| Archivo | Registros | Contenido |
|---|---|---|
| `partidos.json` | 12 | Fecha, hora, equipos, goles, tarjetas, estado, cancha, árbitro, acontecimientos y observaciones |
| `usuarios.json` | 10 | 1 administrador y 9 árbitros con nombre, email, rol, sal y hash de la contraseña; los árbitros además con RUT, teléfono y categoría |
| `equipos.json` | 10 | Nombre, iniciales, ciudad y estadio de cada equipo |

---

## Estructura del proyecto

```
Futbol-desarrollo/
├── index.html                 Login (página de entrada)
├── 404.html                   Página no encontrada
├── vite.config.js             Muestra 404.html en las direcciones que no existen (npm run dev)
├── login/
│   ├── login.js               Componente del login: validación y sesión
│   └── login.css              Estilos del login
├── comun/                     Lo que usan varias vistas
│   ├── api.js                 Capa de datos (mocks como API)
│   ├── seguridad.js           Sal y hash SHA-256 de las contraseñas
│   ├── sesion.js              Protección de rutas por sesión y rol
│   ├── menu.js                Menú común con control por rol
│   ├── componentes.js         Notificaciones (toasts) y modal de confirmación
│   └── partidos.js            Componente de partidos: CRUD, filtros y acta
├── usuario/                   Vistas del árbitro (y del administrador)
│   ├── dashboard.html         Inicio con el resumen del torneo
│   ├── dashboard.js
│   ├── partidos.html          Listado, CRUD y acta oficial de partidos
│   └── perfil.html            Perfil y configuración
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
