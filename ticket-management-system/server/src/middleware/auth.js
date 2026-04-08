import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET || 'secret'

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
  if (!token) return res.status(401).json({ message: 'Authorization required' })
  jwt.verify(token, secret, (err, payload) => {
    if (err) return res.status(401).json({ message: 'Invalid token' })
    req.user = payload
    next()
  })
}

export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Forbidden' })
  next()
}
