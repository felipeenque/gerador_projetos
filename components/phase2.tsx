"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TimelineItem } from "@/components/timeline-item"
import { MarketChart } from "@/components/market-chart"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AutoTamSamSomGenerator } from "@/components/auto-tam-sam-som-generator"
import { AutoPersonaGenerator } from "@/components/auto-persona-generator"
import { AutoBenchmarkingGenerator } from "@/components/auto-benchmarking-generator"
import { AutoSWOTGenerator } from "@/components/auto-swot-generator"

export function Phase2() {

  return (
    <section id="fase2" className="scroll-mt-24">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Fase 2: Análises Estratégicas Essenciais</h2>
        <p className="mt-2 text-slate-500">
          Com o contexto estabelecido, mergulhamos nas análises fundamentais que guiarão a estratégia. Esta fase
          transforma dados e insights brutos em inteligência acionável, desde o dimensionamento do mercado até a
          compreensão profunda dos clientes e concorrentes.
        </p>
      </div>

      <div className="relative pl-8 space-y-10">
        <TimelineItem>
          <h3 className="text-xl font-semibold text-red-600">01: TAM - SAM - SOM</h3>
          <Card className="mt-4 p-6">
            <p>
              <strong>Objetivo:</strong> Estimar o Mercado Total, Disponível e Obtível.
            </p>
            <p className="mt-2">
              <strong>Saída:</strong> Estimativas de TAM, SAM, SOM; insights mercadológicos e recomendações práticas.
            </p>
            <p className="mt-2">
              <strong>Ferramenta de IA:</strong> <span className="font-semibold text-red-700">Gemini</span>.
            </p>
            
            <AutoTamSamSomGenerator />

          </Card>
        </TimelineItem>

        <TimelineItem>
          <h3 className="text-xl font-semibold text-red-600">02: Desenho de 03 Personas</h3>
          <Card className="mt-4 p-6">
            <p>
              <strong>Objetivo:</strong> Criar perfis detalhados dos principais clientes.
            </p>
            <p className="mt-2">
              <strong>Saída:</strong> 3 personas detalhadas (demográficas, comportamentais, psicográficas).
            </p>
            <p className="mt-2">
              <strong>Ferramenta de IA:</strong> <span className="font-semibold text-red-700">Gemini</span>.
            </p>

            <AutoPersonaGenerator />
          </Card>
        </TimelineItem>

        <TimelineItem>
          <h3 className="text-xl font-semibold text-red-600">03: Benchmarking</h3>
          <Card className="mt-4 p-6">
            <p>
              <strong>Objetivo:</strong> Analisar a concorrência e identificar diferenciais.
            </p>
            <p className="mt-2">
              <strong>Saída:</strong> Análise de Forças/Fraquezas dos concorrentes e sugestões de ações estratégicas.
            </p>
            <p className="mt-2">
              <strong>Ferramenta de IA:</strong> <span className="font-semibold text-red-700">Gemini</span>.
            </p>

            <AutoBenchmarkingGenerator />
          </Card>
        </TimelineItem>

        <TimelineItem>
          <h3 className="text-xl font-semibold text-red-600">04: SWOT</h3>
          <Card className="mt-4 p-6">
            <p>
              <strong>Objetivo:</strong> Elaborar visão estratégica da SWOT, cruzando os quadrantes.
            </p>
            <p className="mt-2">
              <strong>Saída:</strong> Recomendações estratégicas cruzadas (Forças, Fraquezas, Oportunidades, Ameaças).
            </p>
            <p className="mt-2">
              <strong>Ferramenta de IA:</strong> <span className="font-semibold text-red-700">Gemini</span>.
            </p>

            <AutoSWOTGenerator />
          </Card>
        </TimelineItem>
      </div>
    </section>
  )
}
