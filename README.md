# 🚀 FinanceFlow

**Aplicación de Finanzas Personales** — Gestioná tus ingresos, gastos, presupuestos y metas financieras con una interfaz moderna y elegante.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
</p>

---

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Tech Stack](#tech-stack)
- [Requisitos](#requisitos)
- [Configuración Local](#configuración-local)
- [Despliegue](#despliegue)
  - [1. Neon (Base de Datos)](#1-neon-base-de-datos)
  - [2. Render (Backend)](#2-render-backend)
  - [3. Vercel (Frontend)](#3-vercel-frontend)
- [Scripts Disponibles](#scripts-disponibles)
- [Variables de Entorno](#variables-de-entorno)
- [API Endpoints](#api-endpoints)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Solución de Problemas](#solución-de-problemas)

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    Vercel (CDN)                      │
│  ┌───────────────────────────────────────────────┐  │
│  │              Frontend (React + Vite)           │  │
│  │  localhost:3000 / financeflow.vercel.app       │  │
│  └───────────────────────┬───────────────────────┘  │
└──────────────────────────┼──────────────────────────┘
                           │ HTTP (API calls)
┌──────────────────────────┼──────────────────────────┐
│                    Render (Backend)                  │
│  ┌───────────────────────┴───────────────────────┐  │
│  │         API Express + TypeScript               │  │
│  │        localhost:4000 / .onrender.com          │  │
│  └───────────────────────┬───────────────────────┘  │
└──────────────────────────┼──────────────────────────┘
                           │ Prisma ORM
┌──────────────────────────┼──────────────────────────┐
│                    Neon (PostgreSQL)                 │
│  ┌───────────────────────┴───────────────────────┐  │
│  │              Base de Datos                     │  │
│  │         postgresql://xxxx.neon.tech            │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Capa       | Tecnología                                   |
|------------|----------------------------------------------|
| Frontend   | React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Framer Motion, Recharts, Zustand, React Query |
| Backend    | Node.js, Express 4, TypeScript 5, Zod, JWT, bcryptjs |
| ORM        | Prisma 6                                     |
| Base de Datos | PostgreSQL 16 (Neon)                      |
| Despliegue | Vercel (Frontend) + Render (Backend) + Neon (DB) |

---

## Requisitos

- **Node.js** >= 18 (recomendado 20+)
- **npm** >= 9
- **Git**
- Una cuenta gratuita en:
  - [Neon](https://console.neon.tech) (PostgreSQL serverless)
  - [Render](https://dashboard.render.com) (Backend hosting)
  - [Vercel](https://vercel.com) (Frontend hosting)
  - [GitHub](https://github.com) (Repositorio)

---

## Configuración Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/financeflow.git
cd financeflow
```

### 2. Configurar variables de entorno

**Backend** — Crear `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/financeflow?sslmode=require"
JWT_SECRET="tu-secreto-super-seguro"
PORT=4000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

**Frontend** — Crear `frontend/.env`:

```env
VITE_API_URL="http://localhost:4000/api"
```

### 3. Setup automático

```bash
bash scripts/setup.sh
```

### 4. Iniciar en desarrollo

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

### Credenciales Demo

```
Email:    demo@financeflow.app
Password: demo1234
```

---

## Despliegue

### 1. Neon (Base de Datos)

1. Ir a [Neon Console](https://console.neon.tech) y registrarse (plan Free).
2. Crear un proyecto **financeflow** (región: US East).
3. Copiar la **connection string** (se ve así):
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/financeflow?sslmode=require
   ```
4. Guardarla para usarla en Render.

### 2. Render (Backend)

#### Opción A: Usando `render.yaml` (automático)

1. En [Render Dashboard](https://dashboard.render.com), conectar repositorio de GitHub.
2. Hacer clic en **New → Blueprint**.
3. Seleccionar el repositorio.
4. Render leerá `render.yaml` y configurará automáticamente:
   - Web Service `financeflow-api`
   - PostgreSQL Database `financeflow-db`
5. Agregar la variable `JWT_SECRET` manualmente.
6. Hacer clic en **Apply**.

#### Opción B: Manual

1. **New Web Service** → Conectar repositorio.
2. Configurar:
   - **Name:** `financeflow-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command:**
     ```bash
     npm run start:prod
     ```
   - **Plan:** Free
3. Variables de entorno:
   | Variable | Valor |
   |----------|-------|
   | `DATABASE_URL` | Connection string de Neon |
   | `JWT_SECRET` | `openssl rand -hex 32` |
   | `CORS_ORIGIN` | `https://financeflow.vercel.app` |
   | `NODE_ENV` | `production` |
4. Crear el servicio.

#### Ejecutar Seed en Producción

Después del primer deploy, conectarse via terminal de Render y ejecutar:

```bash
cd backend && npx prisma db push && npx tsx prisma/seed.ts
```

> O usar **Render Cron Jobs** (plan Free de pago) o ejecutar localmente apuntando a la DB de producción.

### 3. Vercel (Frontend)

1. En [Vercel](https://vercel.com/new), **Add New → Project**.
2. Conectar repositorio de GitHub.
3. Configurar:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Variable de entorno:
   | Variable | Valor |
   |----------|-------|
   | `VITE_API_URL` | `https://financeflow-api.onrender.com/api` |
5. **Deploy**.

> ⚠️ En el plan Free de Render, el backend "duerme" después de 15 min de inactividad. El primer request puede tardar ~30-60 segundos en responder mientras "despierta".

---

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `bash scripts/setup.sh` | Configuración local completa (dependencias, DB, seed) |
| `bash scripts/build.sh` | Build de producción para backend y frontend |
| `bash scripts/deploy.sh` | Guía paso a paso para despliegue |

### Backend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor en modo desarrollo (hot reload) |
| `npm run build` | Compilar TypeScript a JavaScript |
| `npm start` | Iniciar servidor en producción |
| `npm run start:prod` | Generar Prisma Client + iniciar servidor |
| `npm run db:generate` | Generar Prisma Client |
| `npm run db:push` | Sincronizar schema con la base de datos |
| `npm run db:migrate` | Ejecutar migraciones pendientes |
| `npm run db:migrate:dev` | Crear y ejecutar migraciones en desarrollo |
| `npm run db:seed` | Ejecutar seed de datos demo |
| `npm run db:studio` | Abrir Prisma Studio (UI de base de datos) |
| `npm run setup` | Setup completo (install, generate, push, seed) |

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo (puerto 3000) |
| `npm run build` | Compilar TypeScript y build de Vite |
| `npm run preview` | Vista previa del build de producción |
| `npm run lint` | Ejecutar ESLint |

---

## Variables de Entorno

### Backend (`backend/.env`)

| Variable | Descripción | Obligatoria | Default |
|----------|-------------|-------------|---------|
| `DATABASE_URL` | URL de conexión PostgreSQL | ✅ | — |
| `JWT_SECRET` | Secreto para firmar tokens JWT | ✅ | — |
| `PORT` | Puerto del servidor | ❌ | `4000` |
| `NODE_ENV` | Entorno (`development` / `production`) | ❌ | — |
| `CORS_ORIGIN` | Origen(es) permitidos (separados por coma) | ❌ | `*` |

### Frontend (`frontend/.env`)

| Variable | Descripción | Obligatoria | Default |
|----------|-------------|-------------|---------|
| `VITE_API_URL` | URL base del backend API | ✅ | `http://localhost:4000/api` |

---

## API Endpoints

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET` | `/api/health` | ❌ | Health check |
| `POST` | `/api/auth/register` | ❌ | Registro de usuario |
| `POST` | `/api/auth/login` | ❌ | Inicio de sesión |
| `GET` | `/api/auth/me` | ✅ | Obtener perfil actual |
| `PUT` | `/api/auth/me` | ✅ | Actualizar perfil |
| `PUT` | `/api/auth/password` | ✅ | Cambiar contraseña |
| `GET` | `/api/expenses` | ✅ | Listar gastos |
| `POST` | `/api/expenses` | ✅ | Crear gasto |
| `PUT` | `/api/expenses/:id` | ✅ | Actualizar gasto |
| `DELETE` | `/api/expenses/:id` | ✅ | Eliminar gasto |
| `GET` | `/api/incomes` | ✅ | Listar ingresos |
| `POST` | `/api/incomes` | ✅ | Crear ingreso |
| `PUT` | `/api/incomes/:id` | ✅ | Actualizar ingreso |
| `DELETE` | `/api/incomes/:id` | ✅ | Eliminar ingreso |
| `GET` | `/api/services` | ✅ | Listar servicios |
| `POST` | `/api/services` | ✅ | Crear servicio |
| `PUT` | `/api/services/:id` | ✅ | Actualizar servicio |
| `DELETE` | `/api/services/:id` | ✅ | Eliminar servicio |
| `GET` | `/api/budgets` | ✅ | Listar presupuestos |
| `POST` | `/api/budgets` | ✅ | Crear presupuesto |
| `PUT` | `/api/budgets/:id` | ✅ | Actualizar presupuesto |
| `GET` | `/api/goals` | ✅ | Listar metas |
| `POST` | `/api/goals` | ✅ | Crear meta |
| `PUT` | `/api/goals/:id` | ✅ | Actualizar meta |
| `DELETE` | `/api/goals/:id` | ✅ | Eliminar meta |

---

## Estructura del Proyecto

```
financeflow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Schema de base de datos
│   │   ├── seed.ts            # Datos de ejemplo
│   │   └── generated/         # Prisma Client (generado)
│   ├── src/
│   │   ├── index.ts           # Entry point Express
│   │   ├── lib/
│   │   │   └── prisma.ts      # Cliente Prisma
│   │   ├── middleware/
│   │   │   └── auth.ts        # Middleware JWT
│   │   └── routes/
│   │       ├── auth.ts        # Autenticación
│   │       ├── expenses.ts    # Gastos
│   │       ├── incomes.ts     # Ingresos
│   │       ├── services.ts    # Servicios
│   │       ├── budgets.ts     # Presupuestos
│   │       └── goals.ts       # Metas financieras
│   ├── render.yaml            # Render Blueprint
│   ├── Procfile               # Comando de inicio Render
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Header, Sidebar, Layout
│   │   │   └── ui/            # AnimatedCounter, Modal, etc.
│   │   ├── pages/             # Dashboard, Expenses, Auth, etc.
│   │   ├── store/             # Zustand stores
│   │   ├── lib/               # API client, utils
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vercel.json            # Configuración Vercel
│   ├── .env.example
│   └── package.json
├── scripts/
│   ├── setup.sh               # Setup automático local
│   ├── build.sh               # Build de producción
│   └── deploy.sh              # Guía de despliegue
├── .gitignore
└── README.md
```

---

## Solución de Problemas

### Error: `Cannot find module '@prisma/client'`

```bash
cd backend
npx prisma generate
```

### Error: `DATABASE_URL` no configurada

Crear `backend/.env` con la connection string de Neon.

### Error de CORS en producción

Asegurarse de que `CORS_ORIGIN` en Render apunte a la URL exacta de Vercel (sin barra al final).

### El backend no responde (plan Free Render)

Render Free duerme después de 15 min de inactividad. Esperar ~30s al primer request.

### Error de migraciones Prisma

```bash
cd backend
npx prisma db push    # Para desarrollo
# O
npx prisma migrate deploy  # Para producción
```

---

## Licencia

MIT © FinanceFlow

---

<p align="center">Hecho con ❤️ para mantener tus finanzas en orden</p>
#   f i n a n c e f l o w  
 