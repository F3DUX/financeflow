import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo1234", 12)

  const user = await prisma.user.upsert({
    where: { email: "demo@financeflow.app" },
    update: {},
    create: {
      email: "demo@financeflow.app",
      name: "Usuario Demo",
      password: hashedPassword,
    },
  })

  console.log(`✅ User created: ${user.email}`)

  // Create sample expenses
  const expenses = [
    { amount: 45000, category: "food", priority: "medium", date: new Date("2025-05-15"), description: "Supermercado mensual", tags: ["comida", "hogar"] },
    { amount: 12000, category: "transport", priority: "low", date: new Date("2025-05-14"), description: "Uber al trabajo", tags: ["transporte"] },
    { amount: 85000, category: "housing", priority: "high", date: new Date("2025-05-01"), description: "Alquiler departamento", tags: ["vivienda"] },
    { amount: 8000, category: "entertainment", priority: "low", date: new Date("2025-05-10"), description: "Cine y cena", tags: ["ocio"] },
    { amount: 15000, category: "health", priority: "high", date: new Date("2025-05-05"), description: "Farmacia", tags: ["salud"] },
    { amount: 25000, category: "shopping", priority: "medium", date: new Date("2025-05-12"), description: "Ropa nueva", tags: ["compras"] },
    { amount: 10000, category: "utilities", priority: "high", date: new Date("2025-05-03"), description: "Factura de electricidad", tags: ["servicios"] },
    { amount: 7000, category: "education", priority: "medium", date: new Date("2025-05-08"), description: "Curso online", tags: ["educacion"] },
  ]

  for (const expense of expenses) {
    await prisma.expense.create({
      data: {
        ...expense,
        tags: JSON.stringify(expense.tags),
        userId: user.id,
      },
    })
  }
  console.log(`✅ ${expenses.length} expenses created`)

  // Create sample incomes
  const incomes = [
    { amount: 350000, date: new Date("2025-05-01"), category: "salary", description: "Sueldo mensual" },
    { amount: 50000, date: new Date("2025-05-15"), category: "freelance", description: "Proyecto freelance" },
    { amount: 15000, date: new Date("2025-05-20"), category: "investment", description: "Dividendos" },
  ]

  for (const income of incomes) {
    await prisma.income.create({
      data: { ...income, userId: user.id },
    })
  }
  console.log(`✅ ${incomes.length} incomes created`)

  // Create sample services
  const services = [
    { name: "Internet Fibertel", category: "internet", amount: 8500, dueDate: 10, frequency: "monthly", status: "active" },
    { name: "Netflix", category: "netflix", amount: 4500, dueDate: 15, frequency: "monthly", status: "active" },
    { name: "Spotify", category: "spotify", amount: 2000, dueDate: 20, frequency: "monthly", status: "active" },
    { name: "Seguro Auto", category: "insurance", amount: 18000, dueDate: 5, frequency: "monthly", status: "active" },
    { name: "Gimnasio", category: "gym", amount: 7000, dueDate: 1, frequency: "monthly", status: "paused" },
  ]

  for (const service of services) {
    await prisma.service.create({
      data: { ...service, userId: user.id },
    })
  }
  console.log(`✅ ${services.length} services created`)

  // Create sample budgets
  const budgets = [
    { category: "food", amount: 60000, spent: 45000, month: "2025-05" },
    { category: "transport", amount: 20000, spent: 12000, month: "2025-05" },
    { category: "entertainment", amount: 15000, spent: 8000, month: "2025-05" },
    { category: "housing", amount: 90000, spent: 85000, month: "2025-05" },
    { category: "shopping", amount: 30000, spent: 25000, month: "2025-05" },
  ]

  for (const budget of budgets) {
    await prisma.budget.create({
      data: { ...budget, userId: user.id },
    })
  }
  console.log(`✅ ${budgets.length} budgets created`)

  // Create sample goals
  const goals = [
    { name: "Vacaciones a la playa", targetAmount: 200000, currentAmount: 75000, icon: "🏖️", deadline: new Date("2025-12-31") },
    { name: "Laptop nueva", targetAmount: 500000, currentAmount: 200000, icon: "💻", deadline: new Date("2025-08-31") },
    { name: "Fondo de emergencia", targetAmount: 1000000, currentAmount: 350000, icon: "🛡️", deadline: null },
  ]

  for (const goal of goals) {
    await prisma.savingsGoal.create({
      data: { ...goal, userId: user.id },
    })
  }
  console.log(`✅ ${goals.length} goals created`)

  console.log("🎉 Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
