"use client"

import { Card } from "@/components/ui/card"
import { TimelineItem } from "@/components/timeline-item"
import { AutoOKRGenerator } from "@/components/auto-okr-generator"
import { AutoGanttGenerator } from "@/components/auto-gantt-generator" // Importar o novo componente

export function Phase3() {
  // O prompt original do ganttPrompt não será mais usado diretamente aqui, mas sim dentro do AutoGanttGenerator
  // const ganttPrompt = (input: string) =>
  //   `Você é um Chief of Staff e CMO experiente. Com base em todas as informações, documentos e transcrições disponíveis sobre o cliente (contexto fornecido: "${input}"), elabore um planejamento estratégico de marketing completo, utilizando frameworks como Revenue Architecture e Go-To-Market Strategy. Estrutura do planejamento (modelo sugerido em 3 fases): 1. Fase de Setup e Análise Estratégica (Mês 1); 2. Fase de Execução Inicial e Testes (Mês 2); 3. Fase de Escala e Refinamento (Mês 3). Extras obrigatórios no relatório: Proposta visual de funil (Go-To-Market Map), Tabela com metas por estágio, Recomendações de stack de ferramentas, Checkpoint de entregas por fase, Sugestão de rituais de acompanhamento.`

  return (
    <section id="fase3" className="scroll-mt-24">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Fase 3: Definição de Metas e Planejamento de Ações</h2>
        <p className="mt-2 text-slate-500">
          A fase final traduz toda a análise estratégica em um plano de ação claro e mensurável. Definimos os objetivos
          e resultados-chave (OKRs) e estruturamos um cronograma de execução para garantir que a estratégia saia do
          papel e gere resultados concretos.
        </p>
      </div>

      <div className="relative pl-8 space-y-10">
        <TimelineItem>
          <h3 className="text-xl font-semibold text-red-600">05: Desenho de OKRs</h3>
          <Card className="mt-4 p-6">
            <p>
              <strong>Objetivo:</strong> Definir Objetivos e Resultados-Chave, insights e KPIs.
            </p>
            <p className="mt-2">
              <strong>Saída:</strong> Proposta de OKRs, Insights, Observações e lista de KPIs essenciais.
            </p>
            <p className="mt-2">
              <strong>Ferramenta de IA:</strong> <span className="font-semibold text-red-700">Gemini</span>.
            </p>

            <AutoOKRGenerator />
          </Card>
        </TimelineItem>

        <TimelineItem>
          <h3 className="text-xl font-semibold text-red-600">
            06: Direção para Gráfico de Gantt / Planejamento de Marketing
          </h3>
          <Card className="mt-4 p-6">
            <p>
              <strong>Objetivo:</strong> Elaborar um planejamento estratégico de marketing completo.
            </p>
            <p className="mt-2">
              <strong>Saída:</strong> Planejamento em 3 fases, funil visual, metas, stack de ferramentas e rituais.
            </p>
            <p className="mt-2">
              <strong>Ferramenta de IA:</strong> <span className="font-semibold text-red-700">Gemini</span>.
            </p>
            <AutoGanttGenerator /> {/* Usar o novo componente automatizado */}
          </Card>
        </TimelineItem>
      </div>
    </section>
  )
}
