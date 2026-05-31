#!/bin/bash

# ─────────────────────────────────────────────────────────
# FinanceFlow - Script de Configuración Automática
# ─────────────────────────────────────────────────────────
# Uso: bash scripts/setup.sh
# ─────────────────────────────────────────────────────────

set -e

echo "========================================"
echo "  🚀 FinanceFlow - Setup Automático"
echo "========================================"
echo ""

# ─── 1. Verificar Node.js ─────────────────────────────────
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js no está instalado. Instálalo desde https://nodejs.org"
  exit 1
fi
echo "   ✅ Node.js $(node -v)"

if ! command -v npm &> /dev/null; then
  echo "❌ npm no está instalado."
  exit 1
fi
echo "   ✅ npm $(npm -v)"

# ─── 2. Configurar Backend ─────────────────────────────────
echo ""
echo "🔧 Configurando Backend..."
cd backend

if [ ! -f .env ]; then
  echo "   📝 Creando .env desde .env.example..."
  cp .env.example .env
  echo "   ⚠️  EDITAR .env con tu DATABASE_URL de Neon"
fi

echo "   📦 Instalando dependencias..."
npm install

echo "   🗄️  Generando Prisma Client..."
npx prisma generate

echo "   📋 Ejecutando migraciones..."
npx prisma db push

echo "   🌱 Sembrando datos iniciales..."
npx tsx prisma/seed.ts

cd ..

# ─── 3. Configurar Frontend ────────────────────────────────
echo ""
echo "🎨 Configurando Frontend..."
cd frontend

if [ ! -f .env ]; then
  echo "   📝 Creando .env desde .env.example..."
  cp .env.example .env
fi

echo "   📦 Instalando dependencias..."
npm install

cd ..

# ─── 4. Resumen ────────────────────────────────────────────
echo ""
echo "========================================"
echo "  ✅ ¡Configuración completada!"
echo "========================================"
echo ""
echo "Para iniciar el proyecto:"
echo ""
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Credenciales demo:"
echo "  Email:    demo@financeflow.app"
echo "  Password: demo1234"
echo ""
echo "========================================"
