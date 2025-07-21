"use client"

import { useState, useEffect, useRef } from "react" // Adicione useRef
import { Button } from "@/components/ui/button"
import { Loader2, Target, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CollapsibleOutput } from "@/components/collapsible-output"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AutoSWOTGenerator() {
  const [swotAnalysis, setSWOTAnalysis] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasRequiredData, setHasRequiredData] = useState(false)
  const { toast } = useToast()

  // useRef para garantir que a geração automática rode apenas uma vez.
  const hasTriggeredAutoGeneration = useRef(false)

  // Efeito 1: Verificar periodicamente a disponibilidade dos dados de base.
  useEffect(() => {
    // Primeiro, checar se a análise SWOT já existe no localStorage
    const savedSWOT = localStorage.getItem("generated_swot")
    if (savedSWOT) {
      setSWOTAnalysis(savedSWOT)
      setHasRequiredData(true)
      return // Se já temos o resultado, não precisamos do intervalo
    }

    const checkRequiredData = () => {
      const section1Data = localStorage.getItem("strategic_analysis")
      const personasData = localStorage.getItem("generated_personas")
      const benchmarkingData = localStorage.getItem("generated_benchmarking")

      const hasData =
        section1Data && personasData && benchmarkingData &&
        section1Data.trim() !== "" && section1Data !== "Não analisado" &&
        personasData.trim() !== "" &&
        benchmarkingData.trim() !== ""

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
      !swotAnalysis &&
      !isGenerating &&
      !hasTriggeredAutoGeneration.current
    ) {
      hasTriggeredAutoGeneration.current = true
      generateSWOTAnalysis()
    }
  }, [hasRequiredData, swotAnalysis, isGenerating])

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

  const generateSWOTAnalysis = async () => {
    setIsGenerating(true)
    try {
      // Obter todos os dados necessários
      const section1Data =
        localStorage.getItem("strategic_analysis") || document.querySelector("[data-qsp-output]")?.textContent || ""
      const personasData = localStorage.getItem("generated_personas") || ""
      const benchmarkingData = localStorage.getItem("generated_benchmarking") || ""

      const prompt = `Com base na análise SWOT da [Nome da Empresa Alvo] já fornecida, e considerando as informações detalhadas obtidas durante o pré-kick-off (documento inicial) e o kick-off (transcrição da reunião), elabore uma visão estratégica da SWOT, focando em:

CONTEXTO COMPLETO DA EMPRESA:

ANÁLISE QSP (PRÉ-KICK-OFF) e CONTEXTUALIZAÇÃO PÓS-KICK-OFF:
${section1Data}

Com base em todas essas informações, desenvolva uma análise SWOT estratégica estruturada da seguinte forma:

1. **Priorização de Forças para Alavancagem**: 
Identifique as 3 principais Forças que, ao serem combinadas com as Oportunidades de Mercado (Estratégias SO), podem gerar o maior impacto no curto e médio prazo para os objetivos da [Nome da Empresa Alvo]. Justifique a priorização.

2. **Mitigação de Fraquezas Críticas**: 
Aponte as 3 Fraquezas mais urgentes que precisam ser endereçadas. Quais Ameaças (Estratégias WO) elas exacerbam, e como a [Nome da Empresa Alvo] pode transformá-las em oportunidades ou minimizá-las usando recursos ou aprendizados de concorrentes?

3. **Capitalização de Oportunidades com Forças Existentes**: 
Descreva as 2 Oportunidades mais promissoras que a [Nome da Empresa Alvo] está em excelente posição para explorar, dada sua atual estrutura e pontos fortes. Quais ações concretas podem ser tomadas para aproveitar essas oportunidades?

4. **Estratégias de Defesa contra Ameaças**: 
Avalie as 2 Ameaças mais impactantes e proponha como as Forças da [Nome da Empresa Alvo] (Estratégias ST) podem ser utilizadas como barreira ou forma de diferenciação para proteger o negócio.

5. **Recomendações Estratégicas Cruzadas (SO/ST/WO/WT)**: 
Proponha 3 a 5 ações estratégicas de alto impacto que resultam da intersecção dos quadrantes da SWOT, com foco em resultados mensuráveis e alinhados aos objetivos da [Nome da Empresa Alvo].

Priorize ações que considerem as discussões sobre:
- Modelo de negócio e faturamento (B2B/B2C)
- Comportamento do cliente e suas objeções
- Marketing e canais de aquisição/relacionamento
- Experiências passadas (sucessos e falhas)
- KPIs e métricas de sucesso

Estruture a resposta de forma clara, com base nos dados e percepções dos documentos de entrada, fornecendo insights estratégicos acionáveis e priorizados.`

      const result = await callGeminiAPI(prompt)
      setSWOTAnalysis(result)

      // Salvar no localStorage para persistência
      localStorage.setItem("generated_swot", result)

      toast({
        title: "Análise SWOT Gerada",
        description:
          "Visão estratégica completa da SWOT foi criada automaticamente com base em todos os dados coletados.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar análise SWOT. Tente novamente.",
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
        description: "Complete primeiro todas as etapas anteriores para gerar a análise SWOT automaticamente.",
        variant: "destructive",
      })
      return
    }
    generateSWOTAnalysis()
  }

  return (
    <div className="mt-4 space-y-4">
      {!hasRequiredData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para gerar a análise SWOT automaticamente, complete primeiro:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Upload e análise do PDF do QSP (Passo 01)</li>
              <li>Contextualização Pós-Kick-off (Passo 02)</li>
              <li>Geração das 3 Personas (Etapa 02)</li>
              <li>Análise de Benchmarking (Etapa 03)</li>
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
              Gerando Análise SWOT...
            </>
          ) : (
            <>
              <Target className="mr-2 h-4 w-4" />
              {swotAnalysis ? "Regenerar Análise SWOT" : "Gerar Análise SWOT Automaticamente"}
            </>
          )}
        </Button>
      </div>

      {swotAnalysis && (
        <CollapsibleOutput title="Ver Análise SWOT Estratégica">
          {swotAnalysis}
        </CollapsibleOutput>
      )}
    </div>
  )
}