import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, type AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res) => {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(goals)
})

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, targetAmount, currentAmount, icon, deadline } = req.body
    const goal = await prisma.savingsGoal.create({
      data: {
        name, targetAmount, currentAmount: currentAmount || 0,
        icon: icon || '🎯', deadline: deadline ? new Date(deadline) : null,
        userId: req.userId!,
      },
    })
    res.status(201).json(goal)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create goal' })
  }
})

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { name, targetAmount, currentAmount, icon } = req.body
    const id = req.params.id as string
    await prisma.savingsGoal.updateMany({
      where: { id, userId: req.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(targetAmount !== undefined && { targetAmount }),
        ...(currentAmount !== undefined && { currentAmount }),
        ...(icon !== undefined && { icon }),
      },
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' })
  }
})

router.delete('/:id', async (req: AuthRequest, res) => {
  const id = req.params.id as string
  await prisma.savingsGoal.deleteMany({ where: { id, userId: req.userId } })
  res.json({ success: true })
})

export { router as goalsRouter }
