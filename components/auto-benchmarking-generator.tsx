"use client"

import { useState, useEffect, useRef } from "react" // Adicione useRef
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { CollapsibleOutput } from "@/components/collapsible-output"

export function AutoBenchmarkingGenerator() {
  const [benchmarking, setBenchmarking] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasRequiredData, setHasRequiredData] = useState(false)
  const { toast } = useToast()

  // Usamos useRef para garantir que a geração automática rode apenas uma vez.
  const hasTriggeredAutoGeneration = useRef(false)

  // Efeito 1: Verificar periodicamente a disponibilidade de TODOS os dados
  useEffect(() => {
    // Primeiro, verificar se já existe o benchmarking salvo no localStorage
    const savedBenchmarking = localStorage.getItem("generated_benchmarking")
    if (savedBenchmarking) {
      setBenchmarking(savedBenchmarking)
      setHasRequiredData(true) // Se temos o resultado, temos os dados
      return // Não precisamos do intervalo
    }

    const checkRequiredData = () => {
      const section1Data = localStorage.getItem("strategic_analysis")
      const personasData = localStorage.getItem("generated_personas") // <-- Nova dependência

      const hasData =
        section1Data &&
        personasData && // <-- Checagem da nova dependência
        section1Data.trim() !== "" &&
        section1Data !== "Não analisado" &&
        personasData.trim() !== ""

      if (hasData) {
        setHasRequiredData(true)
      }
    }

    // Verificar imediatamente ao carregar
    checkRequiredData()

    // Se os dados ainda não estiverem disponíveis, iniciar a verificação periódica
    const interval = setInterval(() => {
      // Usamos uma verificação interna para não depender do estado `hasRequiredData` aqui
      if (document.querySelector("[data-benchmarking-output]")?.textContent) {
           clearInterval(interval)
           return
      }

      // Parar o intervalo assim que os dados forem encontrados
      if (hasRequiredData) {
        clearInterval(interval)
        return
      }
      checkRequiredData()
    }, 2000)

    // Limpeza: parar o intervalo quando o componente for desmontado
    return () => clearInterval(interval)
  }, [hasRequiredData]) // Depende de hasRequiredData para parar o intervalo

  // Efeito 2: Disparar a geração automática QUANDO os dados estiverem disponíveis
  useEffect(() => {
    // Condições para rodar a geração automática:
    // 1. Os dados necessários existem.
    // 2. O benchmarking ainda não foi gerado.
    // 3. O processo de geração não está em andamento.
    // 4. A geração automática ainda não foi disparada nesta sessão.
    if (hasRequiredData && !benchmarking && !isGenerating && !hasTriggeredAutoGeneration.current) {
      // Marcar que a geração automática foi disparada
      hasTriggeredAutoGeneration.current = true
      generateBenchmarking()
    }
  }, [hasRequiredData, benchmarking, isGenerating]) // Dependências que controlam a execução

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

  const generateBenchmarking = async () => {
    setIsGenerating(true)
    try {
      // Obter dados necessários
      const section1Data =
        localStorage.getItem("strategic_analysis")

      const prompt = `Com base nas informações de benchmarking da [Nome da Empresa Alvo] vs. seus principais concorrentes, já detalhadas neste chat, e considerando os objetivos atuais da [Nome da Empresa Alvo] de [mencione o(s) objetivo(s) principal(is) da empresa alvo, ex: aumentar market share, otimizar custos, expandir para novos mercados, etc.]:

CONTEXTO DA EMPRESA:

ANÁLISE QSP e CONTEXTUALIZAÇÃO PÓS-KICK-OFF:
${section1Data}

Com base nessas informações, responda:

1. Quais são as 3 principais Forças da [Nome da Empresa Alvo] que podem ser alavancadas para criar diferenciais competitivos insuperáveis frente aos concorrentes?

2. Identifique as 3 maiores Fraquezas da [Nome da Empresa Alvo] que são ou podem ser exploradas pelos concorrentes, ou que eles já superaram com sucesso. Como a [Nome da Empresa Alvo] pode aprender e agir nessas áreas?

3. Aponte 2 Oportunidades de Mercado que os concorrentes estão aproveitando (ou poderiam) e que a [Nome da Empresa Alvo] ainda não capitalizou totalmente. Proponha ações para explorá-las rapidamente.

4. Descreva as 2 Ameaças mais críticas representadas pelos concorrentes para a [Nome da Empresa Alvo]. Como as Forças da [Nome da Empresa Alvo] podem ser usadas para mitigar ou neutralizar essas ameaças?

5. Quais são os 3 maiores diferenciais competitivos dos concorrentes que a [Nome da Empresa Alvo] deve analisar como 'benchmark de melhor prática' ou como pontos a serem superados?

6. Sugira 3 ações estratégicas imediatas e acionáveis para a [Nome da Empresa Alvo], focando em gerar resultados de curto prazo e fortalecer sua posição no mercado.

Forneça uma análise detalhada e estratégica, com insights práticos e aplicáveis.`

      const result = await callGeminiAPI(prompt)
      setBenchmarking(result)

      // Salvar no localStorage para persistência
      localStorage.setItem("generated_benchmarking", result)

      toast({
        title: "Benchmarking Gerado",
        description: "Análise competitiva detalhada foi criada automaticamente com base no contexto da empresa.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar análise de benchmarking. Tente novamente.",
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
        description: "Complete primeiro as etapas anteriores para gerar o benchmarking automaticamente.",
        variant: "destructive",
      })
      return
    }
    generateBenchmarking()
  }

  return (
    <div className="mt-4 space-y-4">
      {!hasRequiredData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para gerar o benchmarking automaticamente, complete primeiro:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Upload e análise do PDF do QSP (Passo 01)</li>
              <li>Contextualização Pós-Kick-off (Passo 02)</li>
              <li>Geração das 3 Personas (Etapa anterior)</li>
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
              Gerando Benchmarking...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              {benchmarking ? "Regenerar Benchmarking" : "Gerar Benchmarking Automaticamente"}
            </>
          )}
        </Button>
      </div>

      {benchmarking && (
        <CollapsibleOutput title="Ver Análise de Benchmarking">
          {benchmarking}
        </CollapsibleOutput>
      )}
    </div>
  )
}