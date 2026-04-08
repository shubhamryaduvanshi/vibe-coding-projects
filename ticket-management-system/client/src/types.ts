export interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

export interface TicketComment {
  text: string
  author: string
  createdAt: string
}

export interface Ticket {
  _id: string
  subject: string
  description: string
  toDepartment: string
  priority: string
  status: string
  createdBy: string
  createdByEmail: string
  attachment?: string
  comments?: TicketComment[]
  createdAt: string
}

export interface TicketSummaryItem {
  _id: string
  count: number
}
