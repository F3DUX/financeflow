import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, type AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res) => {
  const services = await prisma.service.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(services)
})

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, category, amount, dueDate, frequency, status } = req.body
    const service = await prisma.service.create({
      data: {
        name, category, amount, dueDate, frequency: frequency || 'monthly',
        status: status || 'active', userId: req.userId!,
      },
    })
    res.status(201).json(service)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' })
  }
})

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { name, category, amount, dueDate, frequency, status } = req.body
    const id = req.params.id as string
    await prisma.service.updateMany({
      where: { id, userId: req.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(amount !== undefined && { amount }),
        ...(dueDate !== undefined && { dueDate }),
        ...(frequency !== undefined && { frequency }),
        ...(status !== undefined && { status }),
      },
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' })
  }
})

router.delete('/:id', async (req: AuthRequest, res) => {
  const id = req.params.id as string
  await prisma.service.deleteMany({ where: { id, userId: req.userId } })
  res.json({ success: true })
})

export { router as servicesRouter }
