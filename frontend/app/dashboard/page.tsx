"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import type { Ticket } from "@/lib/types"
import { TicketsTable } from "@/components/tickets-table"
import { TicketStatusChart } from "@/components/ticket-status-chart"
import { CreateTicketDialog } from "@/components/create-ticket-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TicketIcon, LogOut, RefreshCw, AlertCircle, User, Shield } from "lucide-react"

export default function DashboardPage() {
  const { user, isLoading: authLoading, isAdmin, logout } = useAuth()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.getTickets()
      setTickets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tickets")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      fetchTickets()
    }
  }, [user, fetchTickets])

  const handleTicketCreated = (ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev])
  }

  const handleTicketClosed = (updatedTicket: Ticket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    )
  }

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <TicketIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Ticket Manager</h1>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? "Admin Dashboard" : "My Tickets"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                {isAdmin ? (
                  <Shield className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-muted-foreground">{user.email}</span>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  {isAdmin ? "All Tickets" : "Your Tickets"}
                </h2>
                <p className="text-muted-foreground">
                  {isAdmin
                    ? "Manage and close tickets from all users"
                    : "View and create support tickets"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchTickets}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  <span className="sr-only">Refresh</span>
                </Button>
                <CreateTicketDialog onTicketCreated={handleTicketCreated} />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : (
                  <TicketsTable
                    tickets={tickets}
                    onTicketClosed={handleTicketClosed}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <TicketStatusChart tickets={tickets} />

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Overview of ticket activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Total Tickets</span>
                    <span className="text-2xl font-semibold">{tickets.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                    <span className="text-sm text-green-700">Open</span>
                    <span className="text-2xl font-semibold text-green-700">
                      {tickets.filter((t) => t.status === "Open").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100">
                    <span className="text-sm text-gray-600">Closed</span>
                    <span className="text-2xl font-semibold text-gray-600">
                      {tickets.filter((t) => t.status === "Closed").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
