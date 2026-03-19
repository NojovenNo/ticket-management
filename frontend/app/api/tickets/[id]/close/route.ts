import { NextRequest, NextResponse } from "next/server"
import { closeMockTicket } from "@/lib/mock-data"

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = parseToken(request.headers.get("authorization"))

  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "Admin") {
    return NextResponse.json(
      { message: "Only admins can close tickets" },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    const ticketId = parseInt(id)

    if (isNaN(ticketId)) {
      return NextResponse.json({ message: "Invalid ticket ID" }, { status: 400 })
    }

    const ticket = closeMockTicket(ticketId)
    return NextResponse.json(ticket)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to close ticket"
    return NextResponse.json({ message }, { status: 400 })
  }
}
