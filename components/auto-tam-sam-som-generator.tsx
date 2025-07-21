"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, AreaChart, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CollapsibleOutput } from "@/components/collapsible-output"

export function AutoTamSamSomGenerator() {
  const [analysis, setAnalysis] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasRequiredData, setHasRequiredData] = useState(false)
  const { toast } = useToast()
  const hasTriggeredAutoGeneration = useRef(false)

  // Efeito para verificar os dados necessários (QSP e Kick-off)
  useEffect(() => {
    const savedAnalysis = localStorage.getItem("generated_tam_sam_som")
    if (savedAnalysis) {
      setAnalysis(savedAnalysis)
      setHasRequiredData(true)
      return
    }

    const checkRequiredData = () => {
      const section1Data = localStorage.getItem("strategic_analysis")

      const hasData =
        section1Data &&
        section1Data.trim() !== "" && section1Data !== "Não analisado"

      if (hasData) {
        setHasRequiredData(true)
      }
    }
    checkRequiredData()
    if (hasRequiredData) return
    const interval = setInterval(checkRequiredData, 2000)
    return () => clearInterval(interval)
  }, [hasRequiredData])

  // Efeito para disparar a geração automática
  useEffect(() => {
    if (hasRequiredData && !analysis && !isGenerating && !hasTriggeredAutoGeneration.current) {
      hasTriggeredAutoGeneration.current = true
      generateAnalysis()
    }
  }, [hasRequiredData, analysis, isGenerating])

  const callGeminiAPI = async (prompt: string) => {
    try {
      // const apiKey = "AIzaSyDQkCsrY3WVc6VUCPMqNA8A97bsLNb8ZFA"
      const apiKey = "AIzaSyCvB2f5Q_1RvDNH0vZoo86GW0ZFmDPSta8"
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
      })
      const result = await response.json()
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        return result.candidates[0].content.parts[0].text
      } else {
        throw new Error("Resposta inválida da API do Gemini")
      }
    } catch (error) {
      console.error("Erro ao chamar a API do Gemini:", error)
      throw error
    }
  }

  const generateAnalysis = async () => {
    setIsGenerating(true)
    try {
      const section1Data = localStorage.getItem("strategic_analysis") || ""

      const prompt = `Com base no contexto da empresa que será anexado a seguir, estime o TAM (Mercado Total), SAM (Mercado Endereçável) e SOM (Mercado Obtível).

CONTEXTO DA EMPRESA:
---
ANÁLISE QSP e CONTEXTUALIZAÇÃO PÓS-KICK-OFF:
${section1Data}
---

Para realizar a análise, extraia do contexto acima as seguintes informações (ou faça estimativas informadas caso não estejam explícitas):
1. Produto/Serviço principal oferecido.
2. Público-alvo (perfil demográfico, localização e comportamento).
3. Área geográfica de atuação.
4. Capacidade operacional atual (uma estimativa de faturamento ou nº de clientes).
5. Modelo de negócio (B2C, B2B, misto).
6. Concorrência direta e indireta.
7. Metas de crescimento da empresa.
8. Principais canais de aquisição.
9. Objetivo principal da empresa (atrair investidores, crescer, etc.).

Por favor, traga a visualização de TAM, SAM, SOM, em valor de mercado e número de potenciais clientes, além de me explicar a lógica de cálculo e as fontes das quais pegou as informações.`

      const result = await callGeminiAPI(prompt)
      setAnalysis(result)
      localStorage.setItem("generated_tam_sam_som", result)

      toast({
        title: "Análise TAM/SAM/SOM Gerada",
        description: "A estimativa de mercado foi criada automaticamente.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar a análise de mercado.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {!hasRequiredData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para gerar a análise de mercado, complete primeiro a Análise do QSP e a Contextualização Pós-Kick-off.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={generateAnalysis}
          disabled={isGenerating || !hasRequiredData}
          className="bg-red-600 hover:bg-red-700"
        >
          {isGenerating ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando Análise...</>
          ) : (
            <><AreaChart className="mr-2 h-4 w-4" /> {analysis ? "Regenerar Análise" : "Gerar Análise Automaticamente"}</>
          )}
        </Button>
      </div>

      {analysis && (
        <CollapsibleOutput title="Ver Análise de Mercado (TAM/SAM/SOM)">
          {analysis}
        </CollapsibleOutput>
      )}
    </div>
  )
}