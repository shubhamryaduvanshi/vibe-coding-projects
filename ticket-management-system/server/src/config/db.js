import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@demo.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
  name: 'Admin User',
}

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ticket-management'
  await mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
  })
  await ensureAdminUser()
}

const ensureAdminUser = async () => {
  const exists = await User.findOne({ email: DEFAULT_ADMIN.email })
  if (exists) return
  const password = await bcrypt.hash(DEFAULT_ADMIN.password, 10)
  await User.create({
    name: DEFAULT_ADMIN.name,
    email: DEFAULT_ADMIN.email,
    password,
    isAdmin: true,
  })
}
