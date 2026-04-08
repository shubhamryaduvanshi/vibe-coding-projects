import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { verifyToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()
router.use(verifyToken, requireAdmin)

const serializeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
})

router.get('/', async (req, res) => {
  const { page = 1, limit = 8, search = '' } = req.query
  const filter = search
    ? {
        $or: [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
        ],
      }
    : {}
  const skip = (Number(page) - 1) * Number(limit)
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ])
  res.json({ users: users.map(serializeUser), total, page: Number(page), limit: Number(limit) })
})

router.post('/', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' })
  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) return res.status(409).json({ message: 'User already exists' })
  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email: email.toLowerCase(), password: hashed, isAdmin: false })
  res.status(201).json(serializeUser(user))
})

export default router
