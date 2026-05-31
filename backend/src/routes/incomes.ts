import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, type AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res) => {
  const incomes = await prisma.income.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'desc' },
  })
  res.json(incomes)
})

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { amount, date, category, description } = req.body
    const income = await prisma.income.create({
      data: { amount, date: new Date(date), category, description, userId: req.userId! },
    })
    res.status(201).json(income)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create income' })
  }
})

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { amount, date, category, description } = req.body
    const id = req.params.id as string
    await prisma.income.updateMany({
      where: { id, userId: req.userId },
      data: {
        ...(amount !== undefined && { amount }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
      },
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update income' })
  }
})

router.delete('/:id', async (req: AuthRequest, res) => {
  const id = req.params.id as string
  await prisma.income.deleteMany({ where: { id, userId: req.userId } })
  res.json({ success: true })
})

export { router as incomesRouter }
