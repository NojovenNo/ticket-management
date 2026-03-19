import { NextRequest, NextResponse } from "next/server"
import { getMockUser, generateMockToken } from "@/lib/mock-data"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body as { email: string; password: string }

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      )
    }

    const user = getMockUser(email, password)

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }

    const token = generateMockToken(user)

    return NextResponse.json({ token, user })
  } catch (error) {
    return NextResponse.json(
      { message: "Login failed" },
      { status: 500 }
    )
  }
}
