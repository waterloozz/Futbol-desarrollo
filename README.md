# Futbol App

Aplicación web creada para registrar los distintos sucesos que ocurren durante un partido de fútbol.

---

## Descripción

Futbol App es una libreta digital pensada para árbitros de fútbol.

La aplicación permite registrar información importante de un partido, como:

- Goles
- Tarjetas
- Faltas
- Jugadores
- Observaciones del encuentro

La idea es reemplazar la libreta tradicional del árbitro por una herramienta digital sencilla y fácil de utilizar.

---

## Requisitos

- Node.js v18 o superior
- npm

---

## Instalación y ejecución

1. Clonar el repositorio:

```bash
git clone https://github.com/waterloozz/Futbol-desarrollo.git
cd Futbol-desarrollo
```

2. Instalar las dependencias:

```bash
npm install
```

3. Levantar el servidor local:

```bash
npx http-server -p 8080
```

4. Abrir en el navegador:

```
http://localhost:8080
```

También se puede abrir `index.html` directamente en el navegador, pero se recomienda usar el servidor local para evitar restricciones de carga de archivos.

---

## Estructura del proyecto

```
Futbol-desarrollo/
├── index.html          Página de login
├── dashboard.html      Panel principal
├── partido.html        Registro del partido
├── style.css           Estilos generales
├── login.js            Validación de credenciales
├── partido.js          Lógica del registro del partido
├── public/             Recursos estáticos (iconos)
└── package.json
```

---

## Funcionalidades

- Inicio de sesión con validación de credenciales
- Panel principal con acceso a las secciones
- Registrar datos del partido
- Registrar jugadores
- Registrar goles
- Registrar tarjetas
- Registrar faltas
- Agregar observaciones
- Visualizar el acta del partido

---

## Tecnologías utilizadas

- HTML
- CSS
- JavaScript
- Node.js (http-server)

---

## API simulada (endpoints)

No hay un backend real: `js/api.js` simula una API REST. Cada función equivale a una ruta y lee los archivos JSON de `public/mocks/`, con un retardo de **400 ms** para imitar la latencia de red. Los cambios en partidos (crear, editar, eliminar) se guardan en `localStorage`.

| Método | Ruta REST simulada | Función en `js/api.js` | Fuente de datos | Respuesta |
|--------|--------------------|------------------------|-----------------|-----------|
| GET    | `/api/resumen`        | `obtenerResumen(usuario)`             | `partidos.json` + `usuarios.json` | Totales, próximos partidos y últimos resultados |
| GET    | `/api/partidos`       | `obtenerPartidos()`                   | `partidos.json` / `localStorage`  | Lista de partidos |
| POST   | `/api/partidos`       | `crearPartido(nuevoPartido)`          | `localStorage`                    | Partido creado con su `id` |
| PUT    | `/api/partidos/:id`   | `actualizarPartido(id, datos)`        | `localStorage`                    | Partido actualizado |
| DELETE | `/api/partidos/:id`   | `eliminarPartido(id)`                 | `localStorage`                    | `id` del partido eliminado |

Todas devuelven un objeto `{ ok: true, datos }` si salen bien, o `{ ok: false, error }` con un mensaje para mostrar en pantalla.

---

## Usuarios de prueba

| Usuario  | Contraseña   |
|----------|--------------|
| admin    | admin123     |
| arbitro  | arbitro123   |

---

## Integrantes

- Carlos Benavides
- Roberto Sanchez
- Josefa Solis

---

## Objetivo del proyecto

El objetivo de este proyecto es crear una aplicación web que permita a los árbitros registrar de forma sencilla los acontecimientos que ocurren durante un partido de fútbol.

También busca poner en práctica los conocimientos aprendidos de HTML, CSS y JavaScript.

---

## Estado del proyecto

En desarrollo.
