"use client"

import { useMemo } from "react"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Ticket } from "@/lib/types"

interface TicketStatusChartProps {
  tickets: Ticket[]
}

const COLORS = {
  Open: "hsl(142, 71%, 45%)",
  Closed: "hsl(0, 0%, 45%)",
}

export function TicketStatusChart({ tickets }: TicketStatusChartProps) {
  const chartData = useMemo(() => {
    const openCount = tickets.filter((t) => t.status === "Open").length
    const closedCount = tickets.filter((t) => t.status === "Closed").length

    return [
      { name: "Open", value: openCount, fill: COLORS.Open },
      { name: "Closed", value: closedCount, fill: COLORS.Closed },
    ].filter((item) => item.value > 0)
  }, [tickets])

  const total = tickets.length

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ticket Status</CardTitle>
          <CardDescription>Distribution of tickets by status</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground">No tickets to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Status</CardTitle>
        <CardDescription>Distribution of {total} tickets by status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} ticket${value !== 1 ? "s" : ""}`,
                  name,
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS.Open }}
            />
            <span>
              Open: {tickets.filter((t) => t.status === "Open").length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS.Closed }}
            />
            <span>
              Closed: {tickets.filter((t) => t.status === "Closed").length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
