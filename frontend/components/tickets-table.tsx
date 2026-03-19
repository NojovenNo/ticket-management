"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import type { Ticket } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CheckCircle, XCircle } from "lucide-react"

interface TicketsTableProps {
  tickets: Ticket[]
  onTicketClosed: (ticket: Ticket) => void
}

export function TicketsTable({ tickets, onTicketClosed }: TicketsTableProps) {
  const { isAdmin } = useAuth()
  const [closingId, setClosingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCloseTicket = async (ticketId: number) => {
    setClosingId(ticketId)
    setError(null)

    try {
      const updatedTicket = await api.closeTicket(ticketId)
      onTicketClosed(updatedTicket)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close ticket")
    } finally {
      setClosingId(null)
    }
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <XCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No tickets found</h3>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? "No tickets have been created yet." : "Create your first ticket to get started."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="hidden sm:table-cell w-[140px]">Created</TableHead>
              {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-mono text-sm">#{ticket.id}</TableCell>
                <TableCell className="font-medium">{ticket.title}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground max-w-[300px] truncate">
                  {ticket.description}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={ticket.status === "Open" ? "default" : "secondary"}
                    className={
                      ticket.status === "Open"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {ticket.status === "Open" ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                  {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    {ticket.status === "Open" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={closingId === ticket.id}
                          >
                            {closingId === ticket.id ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              "Close"
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Close this ticket?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The ticket will be marked as closed
                              and cannot be reopened.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCloseTicket(ticket.id)}
                            >
                              Close Ticket
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
