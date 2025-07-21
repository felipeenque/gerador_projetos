"use client"

import { useState, useRef, useEffect } from "react"

// Importações dos seus componentes de UI
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, FileText, X } from "lucide-react"
import { CollapsibleOutput } from "@/components/collapsible-output"

export function StrategicAnalysisStep() {
  // --- ESTADOS ---
  const [pdfjs, setPdfjs] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [qspText, setQspText] = useState("") // Armazena o texto extraído do PDF
  const [kickoffText, setKickoffText] = useState("") // Armazena o texto da reunião
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Analisando...")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    import("pdfjs-dist").then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.version}/build/pdf.worker.min.mjs`
      setPdfjs(mod)
    })
  }, [])

  // --- FUNÇÕES ---

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile || !pdfjs) return

    if (selectedFile.type !== "application/pdf") {
      toast({
        title: "Tipo de Arquivo Inválido",
        description: "Por favor, selecione apenas arquivos PDF.",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    setIsLoading(true)
    setLoadingMessage("Extraindo texto do PDF...")
    toast({ title: "Processando PDF...", description: "Aguarde enquanto o texto é extraído." })

    try {
      const fileReader = new FileReader()
      fileReader.onload = async (e) => {
        if (!e.target?.result) throw new Error("Falha ao ler o arquivo.")
        const typedArray = new Uint8Array(e.target.result as ArrayBuffer)
        const pdf = await pdfjs.getDocument(typedArray).promise
        let fullText = ""
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          // A propriedade 'str' está dentro de 'items' que são do tipo 'TextItem'
          const textItems = textContent.items as import("pdfjs-dist/types/src/display/api").TextItem[]
          fullText += textItems.map((item) => item.str).join(" ") + "\n"
        }
        setQspText(fullText)
        toast({
          title: "PDF Processado!",
          description: "Texto extraído com sucesso. Preencha o resumo do Kick-off.",
        })
      }
      fileReader.readAsArrayBuffer(selectedFile)
    } catch (error) {
      console.error("Erro ao processar PDF:", error)
      toast({
        title: "Erro de Leitura",
        description: "Não foi possível extrair o texto do PDF.",
        variant: "destructive",
      })
      handleRemoveFile()
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setQspText("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getCombinedPrompt = () => {
    // O mesmo prompt poderoso de antes
    return `
Você é um Chief of Staff e CMO sênior... (seu prompt completo aqui)

---
[INÍCIO DO DOCUMENTO PRÉ KICK-OFF (QSP EXTRAÍDO DO PDF)]

${qspText}

[FIM DO DOCUMENTO PRÉ KICK-OFF (QSP EXTRAÍDO DO PDF)]
---
[INÍCIO DA TRANSCRIÇÃO DO KICK-OFF]

${kickoffText}

[FIM DA TRANSCRIÇÃO DO KICK-OFF]
---

🎯 Etapas da sua missão:
... (resto do seu prompt)
`
  }
  
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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Erro na resposta da API");
      }

      const result = await response.json();
      return result.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Erro ao chamar a API do Gemini:", error);
      throw error;
    }
  };


  const handleGenerate = async () => {
    if (!qspText || !kickoffText.trim()) {
      toast({
        title: "Informação Faltando",
        description: "É necessário ter o QSP carregado e o resumo do Kick-off preenchido.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setLoadingMessage("Gerando análise estratégica...")
    setOutput("")

    try {
      const prompt = getCombinedPrompt()
      const result = await callGeminiAPI(prompt)
      setOutput(result)
      localStorage.setItem("strategic_analysis", result)
    } catch (error) {
      toast({
        title: "Erro na Geração",
        description: "Não foi possível gerar a análise. Verifique sua chave de API e tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // --- RENDERIZAÇÃO ---
  return (
    <div className="space-y-6">
      {/* Seção de Upload de Arquivo */}
      <div>
        <Label className="block text-sm font-medium text-slate-700 mb-2">1. Upload do QSP do Cliente (PDF):</Label>
        {!file ? (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-slate-400" />
            <Label htmlFor="file-upload" className="cursor-pointer mt-4">
              <span className="block text-sm font-medium text-slate-900">Clique para fazer upload</span>
              <span className="mt-1 block text-xs text-slate-500">Apenas arquivos PDF</span>
            </Label>
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
            <div className="flex items-center space-x-3 min-w-0">
              <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">
                  {qspText ? "Texto extraído com sucesso." : "Processando..."}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Seção de Texto do Kick-off */}
      <div>
        <Label htmlFor="kickoff-input" className="block text-sm font-medium text-slate-700 mb-2">
          2. Resumo da Transcrição do Kick-off:
        </Label>
        <Textarea
          id="kickoff-input"
          rows={7}
          className="w-full"
          placeholder="Cole aqui o resumo ou os principais pontos da reunião de kick-off..."
          value={kickoffText}
          onChange={(e) => setKickoffText(e.target.value)}
        />
      </div>

      {/* Botão de Ação */}
      <div className="border-t pt-6">
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !qspText || !kickoffText.trim()}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-base py-2.5 px-5"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {loadingMessage}
            </>
          ) : (
            `✨ ${output ? "Regenerar" : "Gerar"} Análise Estratégica`
          )}
        </Button>
      </div>

      {/* Área de Resultado */}
      {output && (
        <CollapsibleOutput title="Ver Relatório de Análise Estratégica">
          {output}
        </CollapsibleOutput>
      )}
    </div>
  )
}

