export type UserRole = "Admin" | "User"

export interface User {
  id: number
  email: string
  role: UserRole
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  role?: UserRole
}

export type TicketStatus = "Open" | "Closed"

export interface Ticket {
  id: number
  title: string
  description: string
  status: TicketStatus
  createdAt: string
  userId: number
}

export interface CreateTicketRequest {
  title: string
  description: string
}

export interface ApiError {
  message: string
  status?: number
}
