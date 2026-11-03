# Sistema de Acta Digital Arbitral (Futbol App)

Aplicación web interactiva desarrollada para árbitros de fútbol, orientada a modernizar y digitalizar el registro oficial de partidos, goles, tarjetas, incidencias y generación de actas arbitrales.

---

## Integrantes del Equipo

- **Carlos Benavides**
- **Roberto Sánchez**
- **Josefa Solís**

---

## Tecnologías y Librerías Utilizadas

- **HTML5 Semántico:** Estructura accesible (`header`, `nav`, `main`, `section`, `footer`).
- **Tailwind CSS:** Diseño utilitario y responsivo (*mobile-first*) incluido vía CDN (`@tailwindcss/browser@4`).
- **Alpine.js:** Reactividad de interfaz, estados y componentes interactivos incluido vía CDN (`alpinejs@3.14.9`).
- **JavaScript Moderno (ES6+):** Capa de servicios asíncrona, control de rutas y gestión de eventos del DOM.
- **Node.js:** Entorno de soporte para servidor local de desarrollo (`http-server`).

---

## Requisitos de Ejecución

- Navegador web moderno (Google Chrome, Firefox, Microsoft Edge o Safari).
- Node.js (v18 o superior) y npm, o alternativamente la extensión **Live Server** de VS Code.

---

## Instalación y Ejecución Paso a Paso

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/waterloozz/Futbol-desarrollo.git
   cd Futbol-desarrollo
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor local:**
   ```bash
   npx http-server . -p 8080
   ```
   *(También se puede utilizar la extensión **Live Server** abriendo la carpeta en VS Code y haciendo clic en "Go Live" en la esquina inferior).*

4. **Abrir en el navegador:**
   ```
   http://localhost:8080
   ```

> [!NOTE]
> Debido a que las peticiones `fetch()` a los archivos JSON de datos de prueba (`mocks`) están sujetas a políticas de seguridad del navegador (CORS), no se recomienda abrir los archivos directamente con doble clic (`file:///`), sino mediante el servidor local indicado.

---

## Usuarios y Credenciales de Prueba

| Usuario | Contraseña | Rol asignado | Acceso |
| :--- | :--- | :--- | :--- |
| **admin** | `admin123` | Administrador | Acceso total a todas las vistas (incluyendo gestión de usuarios). |
| **arbitro** | `arbitro123` | Árbitro | Acceso a Dashboard, Partidos, Actas y Perfil. |

*(En `public/mocks/usuarios.json` se cuenta con 10 usuarios realistas registrados según la rúbrica).*

---

## Vistas Disponibles y Navegación

Todas las vistas internas cuentan con barra de navegación unificada adaptable a dispositivos móviles:

1. **Acceso / Login (`index.html`):** Inicio de sesión con autenticación y validación por rol.
2. **Dashboard (`dashboard.html`):** Resumen estadístico del torneo (partidos totales, programados, finalizados y tarjetas), próximos encuentros y últimos resultados con skeleton de carga.
3. **Gestión de Partidos y Actas (`partidos.html`):** 
   - Listado reactivo de encuentros.
   - Búsqueda en tiempo real por equipo o estadio.
   - Filtro por estado (Todos, Programados, Finalizados).
   - Ordenamiento por fecha y nombre.
   - CRUD completo: creación y edición de partidos mediante modal con validación, y eliminación con confirmación.
   - **Acta Oficial:** Visualización y registro de incidencias en vivo (goles y tarjetas amarillas/rojas con minuto y jugador).
4. **Registro de Árbitros (`usuarios.html`):** Vista exclusiva para administradores con validación estricta de RUT chileno, email, teléfono, categoría y confirmación modal.
5. **Perfil de Usuario (`perfil.html`):** Configuración de datos del usuario autenticado y persistencia en `localStorage`.

---

## API Simulada y Tabla de Endpoints (`js/api.js`)

No hay un backend real: `js/api.js` simula una API REST con respuestas asíncronas, retardo de red (400 a 450 ms) y persistencia en `localStorage`:

| Método | Ruta REST simulada | Función en `js/api.js` | Fuente de datos | Descripción |
| :---: | :--- | :--- | :--- | :--- |
| **GET** | `/api/dashboard/resumen` | `obtenerResumen(usuario)` | `partidos.json` + `usuarios.json` | Obtiene totales del torneo, próximos partidos y últimos resultados. |
| **GET** | `/api/partidos` | `obtenerPartidos()` | `partidos.json` / `localStorage` | Lista completa de partidos con búsqueda y filtros. |
| **POST** | `/api/partidos` | `crearPartido(nuevoPartido)` | `localStorage` | Registra un nuevo partido con ID único (código 201). |
| **PUT** | `/api/partidos/:id` | `actualizarPartido(id, datos)` | `localStorage` | Actualiza datos, marcador o incidencias del acta (código 200). |
| **DELETE** | `/api/partidos/:id` | `eliminarPartido(id)` | `localStorage` | Elimina un partido por su ID (código 200). |

Todas las funciones responden de manera uniforme con `{ ok: true, status, datos, data }` o `{ ok: false, status, error }`.

---

## Registro de Uso de Inteligencia Artificial

Siguiendo las directrices de la Sección 10 de la rúbrica de evaluación, el detalle de todas las interacciones de IA y los bloques de código asistidos están debidamente documentados:

- **Índice de consultas:** Consulta el archivo [`ia/README.md`](ia/README.md) en la raíz del proyecto.
