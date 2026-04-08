import express from 'express'
import mongoose from 'mongoose'
import Ticket from '../models/Ticket.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()
router.use(verifyToken)

router.get('/summary', async (req, res) => {
  const matchStage = req.user.isAdmin ? {} : { createdBy: new mongoose.Types.ObjectId(req.user.id) }
  const summary = await Ticket.aggregate([
    { $match: matchStage },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ])
  const recent = await Ticket.find(req.user.isAdmin ? {} : { createdBy: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5)
  res.json({ summary, recent })
})

router.get('/', async (req, res) => {
  const { page = 1, limit = 10, status, raisedBy, search } = req.query
  const filter = {}
  if (!req.user.isAdmin) filter.createdBy = req.user.id
  if (status) filter.status = status
  if (raisedBy) filter.createdByEmail = raisedBy
  if (search) filter.$or = [
    { subject: new RegExp(search, 'i') },
    { description: new RegExp(search, 'i') },
  ]
  const skip = (Number(page) - 1) * Number(limit)
  const [tickets, total] = await Promise.all([
    Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Ticket.countDocuments(filter),
  ])
  res.json({ tickets, total, page: Number(page), limit: Number(limit) })
})

router.post('/', async (req, res) => {
  if (req.user.isAdmin) return res.status(403).json({ message: 'Admins cannot raise tickets' })
  const { subject, description, toDepartment, priority, attachment } = req.body
  if (!subject || !description || !toDepartment) return res.status(400).json({ message: 'Required fields missing' })
  const ticket = await Ticket.create({
    subject,
    description,
    toDepartment,
    priority: priority || 'medium',
    attachment,
    createdBy: req.user.id,
    createdByEmail: req.user.email,
  })
  res.status(201).json(ticket)
})

router.get('/:id', async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' })
  if (!req.user.isAdmin && ticket.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
  res.json(ticket)
})

router.put('/:id', async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' })
  if (!req.user.isAdmin && ticket.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Employees can only view tickets after creation' })
  if (ticket.status === 'closed') return res.status(403).json({ message: 'Closed tickets cannot be updated' })
  const updates = {
    status: req.body.status || ticket.status,
    comments: req.body.comment ? [...ticket.comments, { text: req.body.comment, author: req.user.name }] : ticket.comments,
  }
  Object.assign(ticket, updates)
  await ticket.save()
  res.json(ticket)
})

router.delete('/:id', async (req, res) => {
  res.status(403).json({ message: 'Tickets cannot be deleted once created' })
})

export default router
