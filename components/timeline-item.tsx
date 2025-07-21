import type { ReactNode } from "react"

interface TimelineItemProps {
  children: ReactNode
}

export function TimelineItem({ children }: TimelineItemProps) {
  return (
    <div className="relative">
      <div className="absolute -left-2 top-0 w-4 h-4 bg-white border-4 border-red-500 rounded-full z-10"></div>
      <div className="absolute -left-0.5 top-4 w-0.5 bg-gray-200 h-full"></div>
      <div className="ml-6">{children}</div>
    </div>
  )
}
