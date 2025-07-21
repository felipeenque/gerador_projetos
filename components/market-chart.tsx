"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const data = [
  { name: "Mercado Total (TAM)", value: 100, color: "#3b82f6" },
  { name: "Mercado Disponível (SAM)", value: 60, color: "#60a5fa" },
  { name: "Mercado Obtível (SOM)", value: 15, color: "#93c5fd" },
]

export function MarketChart() {
  return (
    <div className="mt-4 h-80">
      <ChartContainer
        config={{
          tam: { label: "TAM", color: "#3b82f6" },
          sam: { label: "SAM", color: "#60a5fa" },
          som: { label: "SOM", color: "#93c5fd" },
        }}
        className="h-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} formatter={(value, name) => [`${value}% do TAM`, name]} />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
