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
