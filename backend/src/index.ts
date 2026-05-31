import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth'
import { expensesRouter } from './routes/expenses'
import { incomesRouter } from './routes/incomes'
import { servicesRouter } from './routes/services'
import { budgetsRouter } from './routes/budgets'
import { goalsRouter } from './routes/goals'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

const corsOrigin = process.env.CORS_ORIGIN || '*'

app.use(cors({
  origin: corsOrigin.split(',').map(o => o.trim()),
  credentials: true
}));
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/expenses', expensesRouter)
app.use('/api/incomes', incomesRouter)
app.use('/api/services', servicesRouter)
app.use('/api/budgets', budgetsRouter)
app.use('/api/goals', goalsRouter)

app.listen(PORT, () => {
  console.log(`FinanceFlow API running on port ${PORT}`)
})
