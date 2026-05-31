import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, type AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    })
    res.json(expenses)
  } catch (error) {
    console.error('Get expenses error:', error)
    res.status(500).json({ error: 'Failed to fetch expenses' })
  }
})

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { amount, category, priority, date, description, tags } = req.body
    const expense = await prisma.expense.create({
      data: {
        amount,
        category,
        priority: priority || 'medium',
        date: new Date(date),
        description,
        tags: Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]'),
        userId: req.userId!,
      },
    })
    res.status(201).json(expense)
  } catch (error) {
    console.error('Create expense error:', error)
    res.status(500).json({ error: 'Failed to create expense' })
  }
})

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { amount, category, priority, date, description, tags } = req.body
    const id = req.params.id as string
    const expense = await prisma.expense.updateMany({
      where: { id, userId: req.userId },
      data: {
        ...(amount !== undefined && { amount }),
        ...(category !== undefined && { category }),
        ...(priority !== undefined && { priority }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(description !== undefined && { description }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? JSON.stringify(tags) : tags }),
      },
    })
    if (expense.count === 0) {
      return res.status(404).json({ error: 'Expense not found' })
    }
    res.json({ success: true })
  } catch (error) {
    console.error('Update expense error:', error)
    res.status(500).json({ error: 'Failed to update expense' })
  }
})

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string
    await prisma.expense.deleteMany({
      where: { id, userId: req.userId },
    })
    res.json({ success: true })
  } catch (error) {
    console.error('Delete expense error:', error)
    res.status(500).json({ error: 'Failed to delete expense' })
  }
})

export { router as expensesRouter }
