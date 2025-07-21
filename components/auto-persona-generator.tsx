"use client"

import { useState, useEffect, useRef  } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Users, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CollapsibleOutput } from "@/components/collapsible-output"

export function AutoPersonaGenerator() {
  const [personas, setPersonas] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasRequiredData, setHasRequiredData] = useState(false)
  const { toast } = useToast()

  const hasTriggeredAutoGeneration = useRef(false)

  // Verificar se os dados necessários estão disponíveis
  useEffect(() => {
    // Primeiro, verificar se já existem personas salvas no localStorage
    const savedPersonas = localStorage.getItem("generated_personas")
    if (savedPersonas) {
      setPersonas(savedPersonas)
      setHasRequiredData(true) // Se temos personas, temos os dados
      return // Não precisamos do intervalo
    }

    const checkRequiredData = () => {
      const section1Data = localStorage.getItem("strategic_analysis")
      const tamSamSomData = localStorage.getItem("generated_tam_sam_som")

      const hasData =
        section1Data &&
        tamSamSomData &&
        section1Data.trim() !== "" &&
        section1Data !== "Não analisado"

      if (hasData) {
        setHasRequiredData(true)
      }
    }

    // Verificar imediatamente ao carregar
    checkRequiredData()

    // Se os dados ainda não estiverem disponíveis, iniciar a verificação periódica
    const interval = setInterval(() => {
        // Se já encontrou os dados, não precisa mais verificar
        if (hasRequiredData) {
            clearInterval(interval)
            return
        }
        checkRequiredData()
    }, 2000)

    // Limpeza: parar o intervalo quando o componente for desmontado
    return () => clearInterval(interval)
  }, [hasRequiredData])

  
  useEffect(() => {
      // Condições para rodar a geração automática:
      // 1. Os dados necessários existem.
      // 2. Nenhuma persona foi gerada ainda (nem no estado, nem no storage).
      // 3. O processo de geração não está em andamento.
      // 4. A geração automática ainda não foi disparada nesta sessão.
      if (hasRequiredData && !personas && !isGenerating && !hasTriggeredAutoGeneration.current) {
          // Marcar que a geração automática foi disparada
          hasTriggeredAutoGeneration.current = true
          generatePersonas()
      }
      // As dependências garantem que este efeito rode apenas quando relevante
  }, [hasRequiredData, personas, isGenerating])

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

  const generatePersonas = async () => {
    setIsGenerating(true)
    try {
      // Obter dados do QSP e contextualização
      const section1Data =
        localStorage.getItem("strategic_analysis")

      const prompt = `Com base no contexto da empresa que será anexado a seguir, crie 3 personas detalhadas que representem os principais perfis de clientes desse negócio.

CONTEXTO DA EMPRESA:

ANÁLISE QSP e CONTEXTUALIZAÇÃO PÓS-KICK-OFF:
${section1Data}

Cada persona deve conter as seguintes informações:

Dados demográficos e comportamentais:
• Nome
• Localização (cidade ou região)
• Idade
• Profissão
• Gênero
• Renda mensal estimada
• Dispositivo mais utilizado (celular, desktop, tablet)
• Canais de comunicação preferidos (ex: e-mail, WhatsApp, redes sociais, telefone)

Dados psicográficos:
• Dores (principais frustrações, obstáculos ou desafios que essa pessoa enfrenta em relação ao produto/serviço da empresa)
• Desejos (aspirações e objetivos que essa persona busca atingir com ajuda do produto/serviço)
• Objeções (razões pelas quais essa persona poderia hesitar ou rejeitar o produto/serviço)

Atenção: as personas devem ser realistas, com base em perfis de clientes que efetivamente se beneficiariam do que a empresa oferece. Use tom corporativo, mas com insights afiados e aplicáveis.`

      const result = await callGeminiAPI(prompt)
      setPersonas(result)

      // Salvar no localStorage para persistência
      localStorage.setItem("generated_personas", result)

      toast({
        title: "Personas Geradas",
        description: "3 personas detalhadas foram criadas automaticamente com base no contexto da empresa.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar personas. Tente novamente.",
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
        description: "Complete primeiro a Análise do QSP e a Contextualização Pós-Kick-off.",
        variant: "destructive",
      })
      return
    }
    generatePersonas()
  }

  return (
    <div className="mt-4 space-y-4">
      {!hasRequiredData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para gerar as personas automaticamente, complete primeiro:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Upload e análise do PDF do QSP (Passo 01)</li>
              <li>Contextualização Pós-Kick-off (Passo 02)</li>
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
              Gerando Personas...
            </>
          ) : (
            <>
              <Users className="mr-2 h-4 w-4" />
              {personas ? "Regenerar Personas" : "Gerar Personas Automaticamente"}
            </>
          )}
        </Button>
      </div>

      {personas && (
        <CollapsibleOutput title="Ver Personas Geradas">
          {personas}
        </CollapsibleOutput>
      )}
    </div>
  )
}
