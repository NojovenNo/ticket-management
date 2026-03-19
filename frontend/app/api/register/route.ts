import { NextRequest, NextResponse } from "next/server"
import {
  createMockUser,
  generateMockToken,
} from "@/lib/mock-data"
import type { UserRole } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role = "User" } = body as {
      email: string
      password: string
      role?: UserRole
    }

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      )
    }

    const user = createMockUser(email, password, role)
    const token = generateMockToken(user)

    return NextResponse.json({ token, user })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed"
    return NextResponse.json({ message }, { status: 400 })
  }
}
