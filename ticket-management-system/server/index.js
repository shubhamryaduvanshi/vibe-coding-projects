import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './src/config/db.js'
import authRoutes from './src/routes/auth.js'
import userRoutes from './src/routes/users.js'
import ticketRoutes from './src/routes/tickets.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tickets', ticketRoutes)

app.use((req, res) => res.status(404).json({ message: 'Route not found' }))
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Server error' })
})

const port = process.env.PORT || 4000
connectDB()
  .then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`))
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB.')
    console.error(`Expected MONGO_URI: ${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ticket-management'}`)
    console.error('Start MongoDB locally or set MONGO_URI in your .env to a reachable database.')
    console.error(error.message)
    process.exit(1)
  })
