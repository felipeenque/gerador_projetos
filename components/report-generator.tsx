"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Download, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

export function ReportGenerator({ selectedProjectName }: { selectedProjectName: string }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const collectAllData = () => {
    // Sua função de coleta de dados permanece a mesma
    const data = {
      timestamp: new Date().toISOString(),
      project: {
        selected: selectedProjectName || "Não selecionado",
      },
      phase1: {
        qsp_kickoff: {
          context: localStorage.getItem("strategic_analysis") || "Não gerado",
        },
      },
      phase2: {
        tam_sam_som: "Análise realizada via GPT externo",
        personas: {
          expansion: localStorage.getItem("generated_personas") || "Não expandido",
        },
        benchmarking: {
          analysis: localStorage.getItem("generated_benchmarking") || "Não analisado",
        },
        swot: {
          actions: localStorage.getItem("generated_swot") || "Não gerado",
        },
      },
      phase3: {
        okrs: {
          results: localStorage.getItem("generated_okrs") || "Não gerado",
        },
        planning: {
          strategy: localStorage.getItem("generated_gantt_plan") || "Não gerado",
        },
      },
    }
    return data
  }

  const generateDocxReport = (data: any): Document => {
    // Funções auxiliares para criar elementos do Word
    const createSubheading = (text: string) => new Paragraph({
        children: [new TextRun({ text, bold: true, size: 26 })], // 13pt
        spacing: { before: 240, after: 120 },
    });
    
    const createLabel = (text: string) => new Paragraph({
        children: [new TextRun({ text, bold: true, size: 22 })], // 11pt
    });

    const createBodyText = (text: string) => {
        const lines = text.split('\n'); // Suporta quebras de linha do texto original
        return lines.map(line => new Paragraph({
            children: [new TextRun({ text: line, size: 22 })], // 11pt
            spacing: { after: 100 },
        }));
    };
    
    const createSeparator = () => new Paragraph({
        border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
        spacing: { after: 240, before: 240 },
    });


    // Construção do documento
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
              children: [new TextRun({ text: "RELATÓRIO POP - PROCESSO OPERACIONAL PADRÃO", color: "FF0000", bold: true, size: 48 })],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER
          }),
          new Paragraph({
              children: [new TextRun({ text: "V4 Company - Planejamento Estratégico", color: "FF0000", bold: true, size: 32 })],
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER
          }),
          new Paragraph({ 
              children: [new TextRun({ text: `Gerado em: ${new Date().toLocaleString("pt-BR")}`, size: 18, italics: true })], 
              alignment: AlignmentType.CENTER 
          }),
          
          createSeparator(),
          new Paragraph({ 
              children: [new TextRun({ text: "PROJETO SELECIONADO", color: "FF0000", bold: true, size: 28 })],
              heading: HeadingLevel.HEADING_2 
          }),
          ...createBodyText(`Projeto: ${data.project.selected}`),
          
          createSeparator(),
          new Paragraph({ 
              children: [new TextRun({ text: "FASE 1: COLETA E CONTEXTUALIZAÇÃO", color: "FF0000", bold: true, size: 32 })],
              heading: HeadingLevel.HEADING_1 
          }),
          
          createSubheading("1.1 Análise de QSP e Contextualização Pós-Kick-off"),
          createLabel("Contexto Gerado:"),
          ...createBodyText(data.phase1.qsp_kickoff.context || "Não gerado"),
          
          createSeparator(),
          new Paragraph({ 
              children: [new TextRun({ text: "FASE 2: ANÁLISES ESTRATÉGICAS ESSENCIAIS", color: "FF0000", bold: true, size: 32 })],
              heading: HeadingLevel.HEADING_1
          }),
          createSubheading("2.1 TAM/SAM/SOM"),
          ...createBodyText(data.phase2.tam_sam_som || "Não gerado"), // Adicionado fallback
          createSubheading("2.2 Personas"),
          createLabel("Expansão:"),
          ...createBodyText(data.phase2.personas.expansion || "Não expandido"),
          
          createSubheading("2.3 Benchmarking"),
          createLabel("Análise:"),
          ...createBodyText(data.phase2.benchmarking.analysis || "Não analisado"),
          
          createSubheading("2.4 SWOT"),
          createLabel("Ações Estratégicas:"),
          ...createBodyText(data.phase2.swot.actions || "Não gerado"),

          createSeparator(),
          new Paragraph({ 
              children: [new TextRun({ text: "FASE 3: DEFINIÇÃO DE METAS E PLANEJAMENTO", color: "FF0000", bold: true, size: 32 })],
              heading: HeadingLevel.HEADING_1
          }),
          createSubheading("3.1 OKRs"),
          createLabel("Resultados:"),
          ...createBodyText(data.phase3.okrs.results || "Não gerado"),
          
          createSubheading("3.2 Planejamento de Marketing"),
          createLabel("Estratégia:"),
          ...createBodyText(data.phase3.planning.strategy || "Não gerado"),
        ],
      }],
    });
    
    return doc;
  }

  const clearAllDataAndReload = () => {
    toast({
      title: "Reiniciando Aplicação",
      description: "Limpando todos os dados para um novo planejamento.",
    });

    const keysToRemove = [
      "strategic_analysis",
      "generated_personas",
      "generated_benchmarking",
      "generated_swot",
      "generated_okrs",
      "generated_gantt_plan"
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Recarrega a página após um breve intervalo para o toast ser visível.
    setTimeout(() => {
      window.location.reload();
    }, 2000); 
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      // Notificar webhook (permanece igual)
      await fetch("https://api.lab.v4kuri.com.br/webhook/charlles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_report", timestamp: new Date().toISOString() }),
      })

      const data = collectAllData()
      
      // Gera o documento .docx
      const doc = generateDocxReport(data);

      // Converte o documento para um formato 'blob' e inicia o download
      const fileName = `POP_Relatorio_${new Date().toISOString().split("T")[0]}.docx`
      Packer.toBlob(doc).then(blob => {
        saveAs(blob, fileName);
        toast({
          title: "Relatório Gerado",
          description: `O relatório ${fileName} foi baixado com sucesso.`,
        })
        clearAllDataAndReload();
      });

    } catch (error) {
      console.error("Erro ao gerar relatório:", error)
      toast({
        title: "Erro",
        description: "Erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }


  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-red-100 rounded-full">
            <FileText className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-slate-800">Gerar Relatório Final</h3>
          <p className="text-sm text-slate-600 mt-2">
            Compile todas as análises e insights em um relatório PDF completo
          </p>
        </div>

        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Gerando e Reiniciando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Gerar Relatório e Reiniciar
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500">
          Esta ação irá baixar o relatório completo e limpar todos os dados da sessão atual.
        </p>
      </div>
    </Card>
  )
}
