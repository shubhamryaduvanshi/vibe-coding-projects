import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()
const secret = process.env.JWT_SECRET || 'secret'

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' })
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin, name: user.name }, secret, {
    expiresIn: '8h',
  })
  res.json({ user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }, token })
})

export default router
