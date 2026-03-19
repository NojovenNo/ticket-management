import { NextRequest, NextResponse } from "next/server"
import { getMockTickets, createMockTicket } from "@/lib/mock-data"

function parseToken(authHeader: string | null): { userId: number; role: string } | null {
  if (!authHeader?.startsWith("Bearer ")) return null
  try {
    const token = authHeader.substring(7)
    const payload = JSON.parse(atob(token.split(".")[1]))
    return { userId: parseInt(payload.sub), role: payload.role }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const auth = parseToken(request.headers.get("authorization"))

  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const tickets = getMockTickets(auth.userId, auth.role === "Admin")
  return NextResponse.json(tickets)
}

export async function POST(request: NextRequest) {
  const auth = parseToken(request.headers.get("authorization"))

  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description } = body as { title: string; description: string }

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      )
    }

    const ticket = createMockTicket(title, description, auth.userId)
    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create ticket" },
      { status: 500 }
    )
  }
}
