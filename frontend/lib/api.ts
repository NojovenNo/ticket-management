import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Ticket,
  CreateTicketRequest,
  ApiError,
} from "./types"

// Configure your ASP.NET Core API base URL here
// For production: set NEXT_PUBLIC_API_URL to your ASP.NET backend (e.g., "http://localhost:5000/api")
// For demo/development: uses the built-in Next.js API routes at /api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

class ApiService {
  private getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("token")
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error: ApiError = {
        message: "An error occurred",
        status: response.status,
      }
      try {
        const data = await response.json()
        error.message = data.message || data.error || `Error: ${response.status}`
      } catch {
        error.message = `Error: ${response.status} ${response.statusText}`
      }
      throw error
    }

    // Handle empty responses
    const text = await response.text()
    if (!text) return {} as T
    return JSON.parse(text)
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Ticket endpoints
  async getTickets(): Promise<Ticket[]> {
    return this.request<Ticket[]>("/tickets")
  }

  async createTicket(data: CreateTicketRequest): Promise<Ticket> {
    return this.request<Ticket>("/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async closeTicket(id: number): Promise<Ticket> {
    return this.request<Ticket>(`/tickets/${id}/close`, {
      method: "PATCH",
    })
  }
}

export const api = new ApiService()
