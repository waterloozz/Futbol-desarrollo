// [IA] inicio · ia/2026-11-09_cbenavidesp_pagina-no-encontrada.md
import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";

function paginaNoEncontrada() {
  return {
    name: "pagina-no-encontrada",
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          const ruta = decodeURIComponent(req.url.split("?")[0]);
          const archivo = path.join(server.config.root, ruta);
          const pideHtml = (req.headers.accept || "").includes("text/html");
          if (!pideHtml || fs.existsSync(archivo)) return next();
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(fs.readFileSync(path.join(server.config.root, "404.html")));
        });
      };
    },
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [paginaNoEncontrada()],
});
// [IA] fin
