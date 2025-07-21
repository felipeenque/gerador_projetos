"use client"

import { useState, useEffect, useRef } from "react" // Adicione useRef
import { Button } from "@/components/ui/button"
import { Loader2, Target, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CollapsibleOutput } from "@/components/collapsible-output"

export function AutoOKRGenerator() {
  const [okrAnalysis, setOKRAnalysis] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasRequiredData, setHasRequiredData] = useState(false)
  const { toast } = useToast()

  // useRef para garantir que a geração automática rode apenas uma vez.
  const hasTriggeredAutoGeneration = useRef(false)

  // Efeito 1: Verificar periodicamente a disponibilidade dos dados de base.
  useEffect(() => {
    // Primeiro, checar se os OKRs já existem no localStorage
    const savedOKRs = localStorage.getItem("generated_okrs")
    if (savedOKRs) {
      setOKRAnalysis(savedOKRs)
      setHasRequiredData(true)
      return // Se já temos o resultado, não precisamos do intervalo
    }

    const checkRequiredData = () => {
      const section1Data = localStorage.getItem("strategic_analysis")
      const personasData = localStorage.getItem("generated_personas")
      const benchmarkingData = localStorage.getItem("generated_benchmarking")
      const swotData = localStorage.getItem("generated_swot")

      const hasData =
        section1Data && personasData && benchmarkingData && swotData &&
        section1Data.trim() !== "" && section1Data !== "Não analisado" &&
        personasData.trim() !== "" &&
        benchmarkingData.trim() !== "" &&
        swotData.trim() !== ""

      if (hasData) {
        setHasRequiredData(true)
      }
    }

    checkRequiredData()

    if (hasRequiredData) return;

    const interval = setInterval(checkRequiredData, 2000)
    return () => clearInterval(interval)
  }, [hasRequiredData])

  // Efeito 2: Disparar a geração automática quando os dados estiverem disponíveis.
  useEffect(() => {
    if (
      hasRequiredData &&
      !okrAnalysis &&
      !isGenerating &&
      !hasTriggeredAutoGeneration.current
    ) {
      hasTriggeredAutoGeneration.current = true
      generateOKRAnalysis()
    }
  }, [hasRequiredData, okrAnalysis, isGenerating])

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

      const result = await response.json()

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        return result.candidates[0].content.parts[0].text
      } else {
        throw new Error("Resposta inválida da API")
      }
    } catch (error) {
      console.error("Erro ao chamar a API do Gemini:", error)
      throw error
    }
  }

  const generateOKRAnalysis = async () => {
    setIsGenerating(true)
    try {
      // Obter todos os dados necessários
      const qspData =
        localStorage.getItem("qsp_analysis") || document.querySelector("[data-qsp-output]")?.textContent || ""
      const kickoffData =
        localStorage.getItem("kickoff_context") || document.querySelector("[data-kickoff-output]")?.textContent || ""

      const prompt = `Com base nas informações de contexto da [Nome da Empresa Alvo] já fornecidas no chat (incluindo seu negócio, mercado, desafios e oportunidades), elabore uma proposta de OKRs (Objetivos e Key Results), Insights & Observações e KPIs.

CONTEXTO COMPLETO DA EMPRESA:

ANÁLISE QSP (PRÉ-KICK-OFF):
${qspData}

CONTEXTUALIZAÇÃO PÓS-KICK-OFF:
${kickoffData}

Com base em todas essas informações estratégicas, sua resposta deve conter os seguintes elementos estruturados:

## **OBJETIVO**
Descreva um único Objetivo estratégico, aspiracional e com prazo definido para a [Nome da Empresa Alvo]. O objetivo deve ser:
- Inspirador e alinhado com a visão da empresa
- Específico ao contexto e desafios identificados
- Com prazo definido (ex: "até o final de 2024")
- Focado no impacto de negócio mais crítico

## **KEY RESULTS**
Defina 3 a 5 Key Results mensuráveis, específicos e ambiciosos que, se alcançados, indicarão o sucesso do Objetivo. Para cada KR, inclua:
- Um placeholder para o valor numérico a ser definido ([Ex: Aumentar X% em...], [Ex: Atingir Y em...])
- Métricas claras e mensuráveis
- Ambição realista mas desafiadora
- Conexão direta com o Objetivo principal

## **INSIGHTS E OBSERVAÇÕES**
Liste de 5 a 7 insights e observações estratégicas relevantes para o contexto da [Nome da Empresa Alvo] que apoiam ou informam a definição dos OKRs. Pense em:
- Fatores que influenciam o alcance dos Key Results
- Oportunidades a serem exploradas
- Riscos e desafios a serem considerados
- Tendências de mercado relevantes
- Capacidades internas a serem desenvolvidas

## **KPIs (KEY PERFORMANCE INDICATORS)**
Apresente uma lista de 5 a 8 KPIs essenciais que serão utilizados para monitorar o progresso em direção aos Key Results e ao Objetivo geral da [Nome da Empresa Alvo]. Inclua:
- KPIs de resultado (lagging indicators)
- KPIs de processo (leading indicators)
- Frequência de medição sugerida
- Responsável pela coleta/análise

Estruture a resposta de forma clara, acionável e em forma de tópicos, não crie tabelas isso é importante, considerando o contexto específico da empresa e as análises estratégicas já realizadas.`

      const result = await callGeminiAPI(prompt)
      setOKRAnalysis(result)

      // Salvar no localStorage para persistência
      localStorage.setItem("generated_okrs", result)

      toast({
        title: "OKRs Gerados",
        description:
          "Objetivos e Key Results foram criados automaticamente com base em todas as análises estratégicas realizadas.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar OKRs. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleManualGenerate = () => {
    if (!hasRequiredData) {
      toast({
        title: "Dados Insuficientes",
        description: "Complete primeiro todas as etapas anteriores para gerar os OKRs automaticamente.",
        variant: "destructive",
      })
      return
    }
    generateOKRAnalysis()
  }

  return (
    <div className="mt-4 space-y-4">
      {!hasRequiredData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para gerar os OKRs automaticamente, complete primeiro:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Upload e análise do PDF do QSP (Passo 01)</li>
              <li>Contextualização Pós-Kick-off (Passo 02)</li>
              <li>Geração das 3 Personas (Etapa 02)</li>
              <li>Análise de Benchmarking (Etapa 03)</li>
              <li>Análise SWOT Estratégica (Etapa 04)</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleManualGenerate}
          disabled={isGenerating || !hasRequiredData}
          className="bg-red-600 hover:bg-red-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando OKRs...
            </>
          ) : (
            <>
              <Target className="mr-2 h-4 w-4" />
              {okrAnalysis ? "Regenerar OKRs" : "Gerar OKRs Automaticamente"}
            </>
          )}
        </Button>
      </div>

      {okrAnalysis && (
        <CollapsibleOutput title="Ver OKRs Estratégicos">
          {okrAnalysis}
        </CollapsibleOutput>
      )}
    </div>
  )
}