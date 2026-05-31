import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, type AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res) => {
  const budgets = await prisma.budget.findMany({
    where: { userId: req.userId },
  })
  res.json(budgets)
})

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { category, amount, spent, month } = req.body
    const budget = await prisma.budget.create({
      data: { category, amount, spent: spent || 0, month: month || new Date().toISOString().slice(0, 7), userId: req.userId! },
    })
    res.status(201).json(budget)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create budget' })
  }
})

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { amount, spent } = req.body
    const id = req.params.id as string
    await prisma.budget.updateMany({
      where: { id, userId: req.userId },
      data: {
        ...(amount !== undefined && { amount }),
        ...(spent !== undefined && { spent }),
      },
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update budget' })
  }
})

export { router as budgetsRouter }
