#!/bin/bash

# ─────────────────────────────────────────────────────────
# FinanceFlow - Script de Build para Producción
# ─────────────────────────────────────────────────────────
# Uso: bash scripts/build.sh
# ─────────────────────────────────────────────────────────

set -e

echo "========================================"
echo "  🔨 FinanceFlow - Build Producción"
echo "========================================"
echo ""

# ─── 1. Build Backend ──────────────────────────────────────
echo "🔧 Build del Backend..."
cd backend

echo "   📦 Instalando dependencias..."
npm install

echo "   🗄️  Generando Prisma Client..."
npx prisma generate

echo "   🔨 Compilando TypeScript..."
npm run build

echo "   ✅ Backend compilado en backend/dist/"
cd ..

# ─── 2. Build Frontend ─────────────────────────────────────
echo ""
echo "🎨 Build del Frontend..."
cd frontend

echo "   📦 Instalando dependencias..."
npm install

echo "   🔨 Compilando TypeScript y Vite..."
npm run build

echo "   ✅ Frontend compilado en frontend/dist/"
cd ..

# ─── 3. Resumen ────────────────────────────────────────────
echo ""
echo "========================================"
echo "  ✅ Build completado exitosamente"
echo "========================================"
echo ""
echo "Backend:  backend/dist/"
echo "Frontend: frontend/dist/"
echo ""
echo "Para desplegar:"
echo "  Frontend → Vercel (conectar repositorio)"
echo "  Backend  → Render (conectar repositorio)"
echo "  DB       → Neon (PostgreSQL)"
echo ""
echo "========================================"
