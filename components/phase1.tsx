"use client"

import { Card } from "@/components/ui/card"
import { TimelineItem } from "@/components/timeline-item"
// Importe o novo componente que você acabou de criar
import { StrategicAnalysisStep } from "@/components/strategic-analysis-step" 

export function Phase1() {
  return (
    <section id="fase1" className="scroll-mt-24">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Fase 1: Coleta e Contextualização</h2>
        <p className="mt-2 text-slate-500">
          Faça o upload do QSP e insira o resumo da reunião de kick-off para gerar um diagnóstico estratégico completo e iniciar o planejamento.
        </p>
      </div>

      <div className="relative pl-8">
        <TimelineItem>
          <h3 className="text-xl font-semibold text-red-600">PASSO ÚNICO: Análise Estratégica Inicial</h3>
          <Card className="mt-4 p-6">
            {/* O componente importado cuida de toda a lógica complexa */}
            <StrategicAnalysisStep />
          </Card>
        </TimelineItem>
      </div>
    </section>
  )
}
