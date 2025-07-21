"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface CollapsibleOutputProps {
  title: string
  children: React.ReactNode
}

export function CollapsibleOutput({ title, children }: CollapsibleOutputProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    // Container estilizado: Borda de destaque à esquerda e fundo vermelho claro
    <div className="mt-4 rounded-r-md border-l-4 border-red-600 bg-red-50">
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Título com cor e peso de fonte para destaque */}
        <h4 className="font-bold text-red-900">{title}</h4>
        {/* Botão e ícone com cores do tema */}
        <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-100">
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </div>

      {isOpen && (
        // Divisor e área de conteúdo com cores correspondentes
        <div className="border-t border-red-200 p-4 pt-4">
          {/* O texto agora está maior (text-base) e mais grosso (font-medium) */}
          <pre className="text-base font-medium text-red-800 whitespace-pre-wrap font-sans">
            {children}
          </pre>
        </div>
      )}
    </div>
  )
}
