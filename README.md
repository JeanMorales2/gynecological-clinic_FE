# Ginecología — Frontend

Interfaz web del software de gestión para una clínica de ginecología. Next.js + TypeScript + Tailwind, organizado por dominio en `src/features/`, con un patrón BFF: cada módulo expone sus propias rutas en `src/app/api/<modulo>/` que proxean al backend (el navegador nunca llama al backend directamente).

Este repositorio es la **fuente de despliegue** del servicio frontend en Railway (build vía `Dockerfile`). El desarrollo día a día ocurre en el monorepo original; este repo se sincroniza desde ahí.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS, con tokens de color en variables CSS (soporta tema claro/oscuro/automático)
- Patrón BFF: `src/app/api/<modulo>/` (route handlers) como única puerta de salida hacia el backend
- `src/features/<dominio>/` — un folder por módulo de negocio, con su propio `api/`, `components/`, `hooks/` e `index.ts`

## Módulos (`features/`)

auth · usuarios · pacientes · prospeccion · citas · historia-clinica · laboratorio-externo · facturacion · inventario · promociones · notificaciones · festive-theme · dashboard.

## Variables de entorno

| Variable | Dónde se usa | Descripción |
|---|---|---|
| `BACKEND_INTERNAL_URL` | Runtime, servidor | URL del backend alcanzable desde el servidor del frontend (en Railway, la red privada: `http://<servicio-backend>.railway.internal:8080`) |
| `NEXT_PUBLIC_API_URL` | Build time | Fallback si `BACKEND_INTERNAL_URL` no está seteada; no se usa desde el navegador (todas las llamadas al backend son server-side, vía los route handlers de `app/api/`) |

## Desarrollo local

```bash
npm install
NEXT_PUBLIC_API_URL=http://localhost:5122 BACKEND_INTERNAL_URL=http://localhost:5122 npm run dev
```

Requiere el backend corriendo (ver el monorepo `Ginecologia` para levantar todo el stack con `docker-compose`).

## Build

```bash
npm run build
npm run lint
```

## Docker

```bash
docker build -t ginecologia-frontend --build-arg NEXT_PUBLIC_API_URL=http://localhost:5122 .
docker run -p 3000:3000 -e BACKEND_INTERNAL_URL=http://backend:8080 ginecologia-frontend
```
