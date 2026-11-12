# Sistema de Acta Digital Arbitral

Aplicación web para que los **árbitros de fútbol registren lo que ocurre en un partido** y para que el administrador gestione a los árbitros. Reemplaza la libreta tradicional del árbitro por una herramienta digital sencilla: programación de partidos, acta oficial con goles y tarjetas por minuto, y cuentas propias para cada árbitro.

Es la Entrega 2 de Desarrollo Web y Móvil (CIT2008, UDP): frontend completo con datos simulados (mocks) detrás de una capa de servicios que imita una API REST y que en la Entrega 3 se reemplazará por el backend real.

**Integrantes:**

- Carlos Benavides (@CBenavidesP)
- Roberto Sánchez (@waterloozz)
- Josefa Solís (@josefasolis1-hue)

---

## Tecnologías

| Tecnología | Uso | Cómo se incluye |
|---|---|---|
| HTML, CSS y JavaScript | Base del proyecto | Archivos del repositorio |
| [Alpine.js 3.14.9](https://alpinejs.dev) | Interactividad: `x-data`, `x-show`, `x-for`, `x-model`, `@click`, `Alpine.data`, `$watch`, `$nextTick` | CDN (jsDelivr) |
| [Tailwind CSS 4](https://tailwindcss.com) | Estilos de las vistas internas con clases utilitarias y prefijos responsivos (`sm:`, `md:`, `lg:`) | CDN (`@tailwindcss/browser@4.1.13`) |
| [Vite 8](https://vite.dev) | Servidor local de desarrollo y página 404 (`vite.config.js`) | npm (`devDependencies`) |
| [Web Crypto API](https://developer.mozilla.org/es/docs/Web/API/Web_Crypto_API) (`crypto.subtle`) | Hash SHA-256 con sal para las contraseñas (`comun/seguridad.js`) | Nativa del navegador (no se instala) |

El login y la página de crear cuenta usan su propio archivo de estilos (`login/login.css`); las vistas internas usan Tailwind, y los toasts y el modal de confirmación tienen sus estilos en `comun/componentes.css`.

> **Sobre las contraseñas:** la Web Crypto API es parte del navegador, no una librería externa. Los navegadores solo la habilitan en **localhost** o en sitios **https**, por eso el login, la creación de cuentas y el registro de árbitros funcionan al levantar el proyecto con `npm run dev`, pero no en una dirección `http://` con IP. Como no hay backend, esto es una simulación: en la Entrega 3 el hash se calculará en el servidor.

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

También funciona con la extensión **Live Server** de VS Code (clic derecho en `index.html` → **Open with Live Server**), salvo la página 404, que se muestra solo con `npm run dev`.

## Credenciales de prueba

Se inicia sesión con **email y contraseña**.

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@futbolapp.cl` | `admin123` |
| Árbitro (cuenta de prueba) | `arbitro@futbolapp.cl` | `arbitro123` |

Los otros 8 árbitros de `public/mocks/usuarios.json` también pueden entrar: su contraseña es la primera parte de su email seguida de `123` (por ejemplo, `jperez@futbolapp.cl` / `jperez123`). También se puede crear una cuenta nueva con **Crear cuenta** en el login, y los árbitros que registra el administrador entran con el email y la contraseña que se les asignó.

- **Árbitro:** ve el inicio con el resumen del torneo, los partidos con su acta y su perfil.
- **Administrador:** además entra a **Usuarios**, donde registra y elimina árbitros.

> En el mock las contraseñas no están escritas: cada usuario tiene una **sal** y un **hash SHA-256** (ver *Sobre las contraseñas* en Tecnologías).

## Vistas

| Vista | Archivo | Cómo llegar | Acceso |
|---|---|---|---|
| Iniciar sesión | `index.html` | Al abrir la aplicación | Pública |
| Crear cuenta | `login/registro.html` | Enlace **Crear cuenta** en el login | Pública |
| Inicio (resumen del torneo) | `usuario/dashboard.html` | Al iniciar sesión, o menú **Inicio** | Con sesión |
| Partidos | `usuario/partidos.html` | Menú **Partidos** | Con sesión |
| Acta oficial (detalle de un partido) | Modal dentro de `usuario/partidos.html` | Botón **Acta** en cualquier partido | Con sesión |
| Perfil y configuración | `usuario/perfil.html` | Menú **Perfil** | Con sesión |
| Usuarios (registro de árbitros) | `admin/usuarios.html` | Menú **Usuarios** | Solo administrador |
| Página no encontrada | `404.html` | Abrir una dirección que no existe, por ejemplo `http://localhost:5173/no-existe.html` | Pública |

Sin sesión, cualquier vista interna redirige al login. Un árbitro que intenta entrar a **Usuarios** vuelve al inicio. **Cerrar sesión** (en el menú) borra la sesión y vuelve al login; los partidos, los árbitros y los perfiles guardados se mantienen.

## Funcionalidades

- **Login con email:** valida cada campo en tiempo real (email obligatorio y con formato, contraseña obligatoria), deshabilita el botón mientras se comprueban los datos y muestra un mensaje general si el email o la contraseña son incorrectos, sin decir cuál de los dos falló.
- **Crear cuenta:** un árbitro puede crear su propia cuenta desde el login (nombre, RUT, email, teléfono, categoría y contraseña con confirmación). Valida cada campo en tiempo real, no acepta un email o RUT ya registrado y, al terminar, entra directo al inicio.
- **Sesión simulada:** el login guarda el rol y el email en `localStorage` y las vistas internas lo revisan antes de mostrarse (`comun/sesion.js`).
- **Menú común** en todas las vistas internas: marca la vista actual, muestra **Usuarios** solo al administrador y se convierte en menú hamburguesa en móvil.
- **Inicio:** saludo por nombre, totales del torneo, próximos partidos y últimos resultados.
- **Partidos:**
  - Listado con búsqueda por equipo o estadio, filtro por estado (programado o finalizado) y orden por fecha o por equipo local.
  - CRUD completo: crear y editar en un modal (con validación por campo, foco en el primer campo y botón deshabilitado con spinner mientras guarda) y eliminar con confirmación. La tabla se actualiza al instante.
  - Los equipos y estadios de los formularios se cargan desde `equipos.json`.
- **Acta oficial:** detalle de cada partido donde se registran y eliminan acontecimientos (goles y tarjetas) por minuto; el marcador y las tarjetas se recalculan al agregar o quitar. Está organizada en pestañas (**Resumen**, **Acontecimientos** y **Observaciones**).
- **Perfil:** muestra el nombre, el usuario, el email y el rol de quien inició sesión, y permite editar la asociación y el teléfono de contacto (con validación). Los cambios se guardan por usuario y se mantienen al recargar.
- **Registro de árbitros (administrador):**
  - Formulario con nombre, RUT con guion, email, teléfono, categoría, contraseña y su confirmación.
  - Validación en tiempo real: cada campo se revisa al salir de él y, si tenía error, mientras se corrige. El email y el RUT no pueden repetirse.
  - La contraseña se guarda como **sal + hash**, nunca en texto plano.
  - Modal de confirmación antes de guardar y de eliminar, botón deshabilitado mientras guarda, y notificaciones (toasts) de éxito o error.
  - **Cada árbitro registrado puede iniciar sesión con su propio email y contraseña.**
- **Componentes de interfaz:** modales (confirmación, formulario de partido y acta), notificaciones (toasts) y pestañas (en el acta oficial, manejables con las flechas, Inicio y Fin del teclado). Aparte, el menú común se convierte en menú hamburguesa en móvil.
- **Estados de interfaz:** Inicio, Partidos, Usuarios y Perfil muestran *cargando*, *vacío* (cuando corresponde) y *error con botón Reintentar*.
- **Diseño responsive** (móvil, tablet y escritorio, sin scroll horizontal a 375 px) y **accesibilidad básica:** labels en todos los campos, `aria-invalid` y `aria-describedby` en los errores, foco visible, navegación con teclado, botones con nombre accesible y contraste suficiente.

## Cómo probar

Con `npm run dev` y la aplicación abierta en **http://localhost:5173**:

1. **Validación del login:** sin escribir nada, apretar **Entrar** (aparecen los errores y el cursor va al email). Escribir un email sin `@` y pasar al siguiente campo (aparece el error) y corregirlo (el error se quita solo).
2. **Credenciales incorrectas:** entrar con `admin@futbolapp.cl` y una contraseña cualquiera. Arriba aparece *"Email o contraseña incorrectos."* y se borra al volver a escribir.
3. **Crear cuenta:** en el login, apretar **Crear cuenta** y completar el formulario. Probar un email ya registrado (por ejemplo `jperez@futbolapp.cl`) y luego crear la cuenta con datos válidos: entra directo al inicio. Cerrar sesión y volver a entrar con ese email y contraseña.
4. **Registrar un árbitro:** entrar como administrador, ir a **Usuarios** y completar el formulario. Probar los errores (RUT sin guion, email repetido como `jperez@futbolapp.cl`, contraseña de menos de 8 caracteres o confirmación distinta) y luego registrarlo con datos válidos.
5. **Que quede guardado:** recargar la página (el árbitro sigue en la tabla) y cerrar sesión.
6. **Acceso propio del árbitro nuevo:** iniciar sesión con el email y la contraseña del árbitro registrado. El inicio lo saluda por su nombre y el menú no muestra **Usuarios**.
7. **Eliminar:** volver a entrar como administrador, eliminar ese árbitro y comprobar que ya no puede iniciar sesión.
8. **Partidos:** buscar, filtrar y ordenar; crear un partido nuevo, editarlo y eliminarlo (pide confirmación).
9. **Acta oficial:** apretar **Acta** en un partido, cambiar de pestaña con clic o con las flechas del teclado, registrar un gol en **Acontecimientos** y quitarlo: el marcador de **Resumen** vuelve al valor original.
10. **Perfil:** cambiar el teléfono, guardar y recargar: el cambio se mantiene. Un teléfono inválido muestra un aviso de error.
11. **Estado de error:** abrir cualquier vista con `?fallar` al final (por ejemplo `http://localhost:5173/usuario/dashboard.html?fallar`) y apretar **Reintentar** después de quitarlo.
12. **Página no encontrada:** abrir `http://localhost:5173/no-existe.html`. Con sesión el botón vuelve al inicio; sin sesión lleva al login.

Para volver a los datos originales de `public/mocks/`, ejecutar `localStorage.clear()` en la consola del navegador (F12) y recargar.

---

## Capa de datos (mocks como API)

### La idea

```
 Vista (HTML + Alpine)  ──►  comun/api.js  ──►  public/mocks/*.json  (la primera vez)
                           "la única puerta"  ──►  localStorage        (lecturas y cambios)
```

- Las vistas **solo** llaman funciones de `comun/api.js` (`obtenerPartidos()`, `crearArbitro()`, `iniciarSesion()`, ...). Ninguna vista usa `fetch` ni lee los JSON directamente.
- Todas las funciones son **asíncronas** y esperan una **latencia aleatoria de 300 a 800 ms** antes de responder, para imitar la red.
- La primera vez leen los archivos de `public/mocks/` y los copian a `localStorage` (`partidos_crud_data` y `usuarios_data`). Desde ahí se leen y se guardan todos los cambios, que se mantienen al recargar.
- Responden siempre con el mismo formato:

  ```js
  { ok: true,  status: 200, datos: ... }
  { ok: false, status: 409, error: "Ya existe un usuario con esos datos.", errores: { email: "..." } }
  ```

  `errores` (un mensaje por campo) aparece en las validaciones que fallan.
- Las funciones de usuarios **nunca entregan la sal ni el hash** a las vistas.
- En la Entrega 3 se reemplaza lo que hay dentro de `comun/api.js` por llamadas al backend real; las vistas no cambian.

### Forzar errores

- Agregar `?fallar` a la URL de cualquier vista (por ejemplo `http://localhost:5173/usuario/partidos.html?fallar`): las funciones responden `{ ok: false, status: 500, error }` y se ve el estado de error con el botón **Reintentar**. `?fallar=0` lo desactiva.
- Para fallas al azar: `?probabilidadFalla=0.3` (30 %) en la URL, o cambiar `PROBABILIDAD_FALLA` en `comun/api.js`.
- **Restablecer los datos de prueba:** `localStorage.clear()` en la consola del navegador y recargar.

### Endpoints simulados

Esta tabla es la base de la API real de la Entrega 3.

| Función | Método | Ruta equivalente | Descripción y respuestas |
|---|---|---|---|
| `iniciarSesion(email, password)` | POST | `/api/auth/login` | Comprueba la contraseña con su sal y hash. 200 con el usuario · 401 (email o contraseña incorrectos) |
| `obtenerResumen(usuario)` | GET | `/api/resumen` | Totales, próximos partidos, últimos resultados y nombre de quien inició sesión. 200 |
| `obtenerPartidos()` | GET | `/api/partidos` | Lista de partidos. 200 |
| `crearPartido(nuevoPartido)` | POST | `/api/partidos` | Crea un partido y lo devuelve con su `id`. 201 |
| `actualizarPartido(id, datos)` | PUT | `/api/partidos/:id` | Actualiza un partido (también sus acontecimientos). 200 · 404 |
| `eliminarPartido(id)` | DELETE | `/api/partidos/:id` | Elimina un partido. 200 · 404 |
| `obtenerEquipos()` | GET | `/api/equipos` | Equipos y estadios para los formularios de partido. 200 |
| `obtenerArbitros()` | GET | `/api/arbitros` | Usuarios con rol árbitro, sin sal ni hash. 200 |
| `crearArbitro(datos)` | POST | `/api/arbitros` | Crea un árbitro (desde Usuarios o desde Crear cuenta) y guarda su contraseña con sal y hash. 201 · 409 (email o RUT ya existen) |
| `eliminarArbitro(id)` | DELETE | `/api/arbitros/:id` | Elimina un árbitro. 200 · 404 |
| `obtenerPerfil(email)` | GET | `/api/perfil` | Datos del usuario que inició sesión, sin sal ni hash. 200 · 404 |
| `actualizarPerfil(email, datos)` | PUT | `/api/perfil` | Actualiza la asociación y el teléfono. 200 · 400 (teléfono inválido) · 404 |

Cualquier función puede responder **500** si se fuerza el error.

### Datos (`public/mocks/`)

| Archivo | Registros | Contenido |
|---|---|---|
| `partidos.json` | 12 | Recurso principal: fecha, hora, equipos, goles, tarjetas, estado, cancha, árbitro, acontecimientos y observaciones |
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
│   ├── registro.html          Crear cuenta de árbitro
│   ├── registro.js            Componente de crear cuenta: validación y alta
│   └── login.css              Estilos del login y de crear cuenta
├── comun/                     Lo que usan varias vistas
│   ├── api.js                 Capa de datos (mocks como API)
│   ├── seguridad.js           Sal y hash SHA-256 de las contraseñas
│   ├── sesion.js              Protección de rutas por sesión y rol
│   ├── menu.js                Menú común con control por rol
│   ├── componentes.js         Notificaciones (toasts) y modal de confirmación
│   ├── componentes.css        Estilos de los toasts y del modal de confirmación
│   └── partidos.js            Componente de partidos: CRUD, filtros y acta
├── usuario/                   Vistas del árbitro (y del administrador)
│   ├── dashboard.html         Inicio con el resumen del torneo
│   ├── dashboard.js
│   ├── partidos.html          Listado, CRUD y acta oficial de partidos
│   └── perfil.html            Perfil y configuración
├── admin/                     Vistas solo para el administrador
│   ├── usuarios.html          Registro de árbitros
│   └── registro-arbitros.js
├── public/
│   └── mocks/                 Un JSON por recurso
├── ia/
│   ├── README.md              Índice de uso de IA
│   └── AAAA-MM-DD_usuario_tema.md   Un registro por interacción
└── package.json
```

### Navegación

Es una aplicación de **varias páginas**: cada vista es un archivo HTML y el menú común (`comun/menu.js`) enlaza entre ellas. Cada página interna carga primero `comun/sesion.js`, que revisa la sesión y el rol antes de mostrarla. Los componentes de cada vista se registran con `Alpine.data` en su propio archivo `.js`, que se carga antes que Alpine.

---

## Uso de IA

Ver el índice en [`ia/README.md`](ia/README.md). Cada registro tiene los prompts y las respuestas, y el código que viene de la IA está marcado en los archivos con `[IA] inicio` / `[IA] fin`.
