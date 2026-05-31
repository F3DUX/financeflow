import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const router = Router()

// ── Validation schemas ─────────────────────────────────────────────────
const registerSchema = z.object({
  email: z
    .string()
    .email('Correo electrónico inválido')
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es demasiado larga'),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100)
    .transform((v) => v.trim()),
})

const loginSchema = z.object({
  email: z
    .string()
    .email('Correo electrónico inválido')
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, 'La contraseña es requerida'),
})

// ── POST /api/auth/register ───────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ error: 'El correo ya está registrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    })

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })

    // Set httpOnly cookie (secure in production)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    })

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e: { message: string }) => e.message)
      return res.status(400).json({ error: messages.join('. ') })
    }

    if ((error as any)?.code === 'P2002') {
      return res.status(400).json({ error: 'El correo ya está registrado' })
    }

    console.error('Register error:', error)
    res.status(500).json({ error: 'Error del servidor. Intenta de nuevo.' })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })

    // Set httpOnly cookie (secure in production)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    })

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e: { message: string }) => e.message)
      return res.status(400).json({ error: messages.join('. ') })
    }

    console.error('Login error:', error)
    res.status(500).json({ error: 'Error del servidor. Intenta de nuevo.' })
  }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }

    res.json({ user })
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
})

// ── PUT /api/auth/me ──────────────────────────────────────────────────
const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100)
    .transform((v) => v.trim())
    .optional(),
  email: z
    .string()
    .email('Correo electrónico inválido')
    .transform((v) => v.toLowerCase().trim())
    .optional(),
})

router.put('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const data = updateProfileSchema.parse(req.body)

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' })
    }

    // If email changed, check it's not taken
    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } })
      if (existing && existing.id !== decoded.userId) {
        return res.status(400).json({ error: 'El correo ya está registrado' })
      }
    }

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data,
      select: { id: true, email: true, name: true },
    })

    res.json({ user })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e: { message: string }) => e.message)
      return res.status(400).json({ error: messages.join('. ') })
    }
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Error del servidor. Intenta de nuevo.' })
  }
})

// ── PUT /api/auth/password ───────────────────────────────────────────
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es demasiado larga'),
})

router.put('/password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    })

    res.json({ message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e: { message: string }) => e.message)
      return res.status(400).json({ error: messages.join('. ') })
    }
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Error del servidor. Intenta de nuevo.' })
  }
})

export { router as authRouter }
