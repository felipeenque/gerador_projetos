"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, GanttChart, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CollapsibleOutput } from "@/components/collapsible-output"

export function AutoGanttGenerator() {
  // --- ESTADOS ---
  const [ganttPlan, setGanttPlan] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasRequiredData, setHasRequiredData] = useState(false)
  const [clientName, setClientName] = useState("")
  const [topicKey, setTopicKey] = useState("")
  const { toast } = useToast()

  // --- LÓGICA ---

  // Efeito para verificar a disponibilidade dos dados de base.
  // Isso agora serve apenas para habilitar a UI.
  useEffect(() => {
    const savedGanttPlan = localStorage.getItem("generated_gantt_plan")
    if (savedGanttPlan) {
      setGanttPlan(savedGanttPlan)
      setHasRequiredData(true)
      return
    }

    const checkRequiredData = () => {
      const strategicAnalysisData = localStorage.getItem("strategic_analysis")
      const personasData = localStorage.getItem("generated_personas")
      const benchmarkingData = localStorage.getItem("generated_benchmarking")
      const swotData = localStorage.getItem("generated_swot")
      const okrData = localStorage.getItem("generated_okrs")

      const hasData = !!(strategicAnalysisData && personasData && benchmarkingData && swotData && okrData)

      if (hasData) {
        setHasRequiredData(true)
      }
    }
    
    checkRequiredData()
    if (hasRequiredData) return;
    
    const interval = setInterval(checkRequiredData, 2000)
    return () => clearInterval(interval)
  }, [hasRequiredData])


  const callGeminiAPI = async (prompt: string) => {
    try {
      // const apiKey = "AIzaSyDQkCsrY3WVc6VUCPMqNA8A97bsLNb8ZFA"
      const apiKey = "AIzaSyCvB2f5Q_1RvDNH0vZoo86GW0ZFmDPSta8"
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Erro na resposta da API")
      }

      const result = await response.json()
      return result.candidates[0].content.parts[0].text
    } catch (error) {
      console.error("Erro ao chamar a API do Gemini:", error)
      throw error
    }
  }

  // Função principal que é chamada pelo botão.
  const handleGenerate = async () => {
    // Validação para garantir que os campos foram preenchidos.
    if (!clientName.trim() || !topicKey.trim()) {
      toast({
        title: "Dados Faltando",
        description: "Por favor, preencha o nome do cliente e o tópico-chave.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const strategicAnalysisData = localStorage.getItem("strategic_analysis") || ""
      const personasData = localStorage.getItem("generated_personas") || ""
      const benchmarkingData = localStorage.getItem("generated_benchmarking") || ""
      const swotData = localStorage.getItem("generated_swot") || ""
      const okrData = localStorage.getItem("generated_okrs") || ""

      // O prompt agora inclui todos os dados coletados.
      const prompt = `Você é um Chief of Staff e CMO sênior, especialista em estratégia de marketing orientada a negócios. Com base em todas as informações disponíveis, sua missão é elaborar um planejamento estratégico de marketing completo para o cliente "${clientName}", com foco principal em "${topicKey}".

---
[INÍCIO DO CONTEXTO ESTRATÉGICO UNIFICADO]

${strategicAnalysisData}

${personasData}

${benchmarkingData}

${swotData}

${okrData}

[FIM DO CONTEXTO ESTRATÉGICO UNIFICADO]
---

🧠 Diretrizes Estratégicas da Análise:
• Realize um diagnóstico profundo do cenário atual.
• Traga propostas concretas e priorizadas, como se fossem tarefas organizadas no backlog estratégico do projeto.
• Destaque oportunidades não exploradas, riscos e alavancas de crescimento.
• Seja preciso, objetivo e estratégico.

🗂️ ESTRUTURA DO PLANEJAMENTO (BACKLOG ESTRATÉGICO):
Organize o planejamento em tópicos como se fossem tarefas do backlog. Sinta-se livre para incluir, ajustar ou expandir os blocos, conforme a análise exigir:

🔍 Diagnóstico e Fundamentos
• Auditoria técnica de canais, ferramentas e ativos digitais
• Avaliação de tracking e eventos (GA4, Tag Manager, APIs, CRM)
• Análise de jornada do cliente, personas, funil atual, concorrência e UX
• Revisão de dados de CRM e comportamento histórico

🎯 Planejamento Estratégico
• Definição dos KPIs críticos (CPL, CAC, LTV, ROAS, taxa de conversão etc.)
• Desenho do funil ideal orientado por Revenue Architecture
• Estruturação do plano Go-To-Market com roadmap por etapa do funil

📈 Execução e Performance
• Estruturação/reformulação de campanhas de mídia paga (Google Ads, Meta Ads)
• Planejamento e briefing para os primeiros criativos das campanhas
• Estratégias de captação, nutrição e conversão com base em dados

🚀 Crescimento e Oportunidades
• Exploração de canais alternativos (influenciadores, PR, eventos, SEO)
• Sugestões de testes e experimentos de growth
• Gatilhos de expansão com base em benchmarks setoriais`

      const result = await callGeminiAPI(prompt)
      setGanttPlan(result)
      localStorage.setItem("generated_gantt_plan", result)

      toast({
        title: "Planejamento de Marketing Gerado",
        description: "O planejamento estratégico foi criado com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao Gerar Planejamento",
        description: "Houve um problema ao contatar a IA. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // --- RENDERIZAÇÃO ---
  return (
    <div className="mt-4 space-y-4">
      {!hasRequiredData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para gerar o Planejamento de Marketing, complete primeiro todas as etapas anteriores do framework.
          </AlertDescription>
        </Alert>
      )}

      {/* Inputs para dados manuais */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="client-name" className="block text-sm font-medium text-slate-700 mb-1">
            Nome do Cliente:
          </Label>
          <Input
            id="client-name"
            placeholder="Ex: V4 Company"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            disabled={isGenerating || !hasRequiredData}
          />
        </div>
        <div>
          <Label htmlFor="topic-key" className="block text-sm font-medium text-slate-700 mb-1">
            Tópico-Chave do Planejamento:
          </Label>
          <Input
            id="topic-key"
            placeholder="Ex: aquisição de novos clientes, otimização de LTV"
            value={topicKey}
            onChange={(e) => setTopicKey(e.target.value)}
            disabled={isGenerating || !hasRequiredData}
          />
        </div>
      </div>

      {/* Botão de Geração Manual */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !hasRequiredData || !clientName.trim() || !topicKey.trim()}
          className="bg-red-600 hover:bg-red-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando Planejamento...
            </>
          ) : (
            <>
              <GanttChart className="mr-2 h-4 w-4" />
              {/* Texto do botão simplificado */}
              {ganttPlan ? "Regenerar Planejamento" : "Gerar Planejamento"}
            </>
          )}
        </Button>
      </div>

      {/* Área de Resultado */}
      {ganttPlan && (
        <CollapsibleOutput title="Ver Planejamento de Marketing Estratégico">
          {ganttPlan}
        </CollapsibleOutput>
      )}
    </div>
  )
}
