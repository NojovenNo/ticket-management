import type { User, Ticket, TicketStatus } from "./types"

// Mock users for demo
export const mockUsers: (User & { password: string })[] = [
  { id: 1, email: "admin@example.com", password: "admin123", role: "Admin" },
  { id: 2, email: "user@example.com", password: "user123", role: "User" },
]

// Mock tickets for demo
export const mockTickets: Ticket[] = [
  {
    id: 1,
    title: "Login page not loading",
    description: "When I try to access the login page, it shows a blank screen on mobile devices.",
    status: "Open",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 2,
  },
  {
    id: 2,
    title: "Password reset email not received",
    description: "I requested a password reset 30 minutes ago but haven't received the email yet.",
    status: "Open",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 2,
  },
  {
    id: 3,
    title: "Dashboard charts not displaying",
    description: "The analytics charts on the dashboard show 'No data available' even though I have data.",
    status: "Closed",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 2,
  },
  {
    id: 4,
    title: "API rate limiting issue",
    description: "Getting 429 errors when making more than 10 requests per minute.",
    status: "Open",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 1,
  },
  {
    id: 5,
    title: "Export feature not working",
    description: "The CSV export button does nothing when clicked.",
    status: "Closed",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 1,
  },
]

let ticketIdCounter = mockTickets.length + 1
let userIdCounter = mockUsers.length + 1

// In-memory storage for demo
const ticketsStore = [...mockTickets]
const usersStore = [...mockUsers]

export function getMockUser(email: string, password: string): User | null {
  const user = usersStore.find((u) => u.email === email && u.password === password)
  if (!user) return null
  return { id: user.id, email: user.email, role: user.role }
}

export function createMockUser(
  email: string,
  password: string,
  role: "Admin" | "User" = "User"
): User {
  const existing = usersStore.find((u) => u.email === email)
  if (existing) {
    throw new Error("User with this email already exists")
  }
  const newUser = { id: userIdCounter++, email, password, role }
  usersStore.push(newUser)
  return { id: newUser.id, email: newUser.email, role: newUser.role }
}

export function getMockTickets(userId: number, isAdmin: boolean): Ticket[] {
  if (isAdmin) {
    return [...ticketsStore].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
  return ticketsStore
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function createMockTicket(
  title: string,
  description: string,
  userId: number
): Ticket {
  const newTicket: Ticket = {
    id: ticketIdCounter++,
    title,
    description,
    status: "Open",
    createdAt: new Date().toISOString(),
    userId,
  }
  ticketsStore.push(newTicket)
  return newTicket
}

export function closeMockTicket(ticketId: number): Ticket {
  const ticket = ticketsStore.find((t) => t.id === ticketId)
  if (!ticket) {
    throw new Error("Ticket not found")
  }
  if (ticket.status === "Closed") {
    throw new Error("Ticket is already closed")
  }
  ticket.status = "Closed"
  return ticket
}

export function generateMockToken(user: User): string {
  // Simple mock JWT structure (not a real JWT)
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = btoa(
    JSON.stringify({
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    })
  )
  const signature = btoa("mock-signature")
  return `${header}.${payload}.${signature}`
}
