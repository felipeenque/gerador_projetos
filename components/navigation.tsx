"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function Navigation() {

  const [progress, setProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(0)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    // Definimos todas as "respostas" que contam para o progresso
    const progressKeys = [
      "strategic_analysis",
      "generated_tam_sam_som",
      "generated_personas",
      "generated_benchmarking",
      "generated_swot",
      "generated_okrs",
      "generated_gantt_plan",
    ]
    const TOTAL_STEPS = progressKeys.length;

    const checkProgress = () => {
      let currentCompleted = 0;
      progressKeys.forEach(key => {
        const item = localStorage.getItem(key);
        // Consideramos a etapa concluída se o item existe, não está vazio e não é um placeholder de erro
        if (item && item.trim() !== "" && item !== "Não analisado" && item !== "Não gerado") {
          currentCompleted++;
        }
      });
      
      setCompletedSteps(currentCompleted);
      setProgress((currentCompleted / TOTAL_STEPS) * 100);
    };

    // Verificar imediatamente ao carregar e depois a cada 2 segundos
    checkProgress();
    const interval = setInterval(checkProgress, 2000);

    // Limpar o intervalo quando o componente for desmontado para evitar vazamento de memória
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="md:w-1/4 md:sticky top-12 self-start">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-red-600">Navegação Rápida</h3>
        <ul className="space-y-3">
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start font-medium text-slate-600 hover:text-red-600"
              onClick={() => scrollToSection("fase1")}
            >
              Fase 1: Coleta e Contextualização
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start font-medium text-slate-600 hover:text-red-600"
              onClick={() => scrollToSection("fase2")}
            >
              Fase 2: Análises Estratégicas
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className="w-full justify-start font-medium text-slate-600 hover:text-red-600"
              onClick={() => scrollToSection("fase3")}
            >
              Fase 3: Metas e Planejamento
            </Button>
          </li>
        </ul>
        <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-medium text-slate-700">Progresso Total</span>
                <span className="font-bold text-slate-800">{completedSteps} de {7} etapas</span>
            </div>
            <Progress value={progress} className="w-full" />
        </div>
      </Card>
    </nav>
  )
}
