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

## Tabla de Endpoints Simulados (Capa de Servicios `js/api.js`)

Todos los datos se obtienen mediante funciones asíncronas con simulación de latencia de red (300 a 800 ms) y persistencia en `localStorage`:

| Función en `js/api.js` | Método REST | Ruta Equivalente | Descripción |
| :--- | :---: | :--- | :--- |
| `obtenerResumen(usuario)` | `GET` | `/api/dashboard/resumen` | Obtiene los totales del torneo, próximos partidos y últimos resultados para el usuario actual. |
| `obtenerPartidos()` | `GET` | `/api/partidos` | Obtiene la lista completa de partidos con soporte de persistencia local. |
| `crearPartido(nuevoPartido)` | `POST` | `/api/partidos` | Registra un nuevo partido en el sistema con ID único (código 201). |
| `actualizarPartido(id, datos)` | `PUT` | `/api/partidos/:id` | Modifica la información, marcador o acontecimientos de un partido (código 200). |
| `eliminarPartido(id)` | `DELETE` | `/api/partidos/:id` | Elimina un partido por su ID (código 200). |

---

## Registro de Uso de Inteligencia Artificial

Siguiendo las directrices de la Sección 10 de la rúbrica de evaluación, el detalle de todas las interacciones de IA y los bloques de código asistidos están debidamente documentados:

- **Índice de consultas:** Consulta el archivo [`ia/README.md`](ia/README.md) en la raíz del proyecto.
