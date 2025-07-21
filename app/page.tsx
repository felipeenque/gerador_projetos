"use client" // Adicione isso no topo, pois agora o Home terá estado e efeitos

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { ProjectSelector } from "@/components/project-selector"
import { Phase1 } from "@/components/phase1"
import { Phase2 } from "@/components/phase2"
import { Phase3 } from "@/components/phase3"
import { ReportGenerator } from "@/components/report-generator"
import { useToast } from "@/hooks/use-toast"

// A interface pode ficar aqui ou em um arquivo de tipos separado
interface Project {
  id: string
  name: string
  description?: string
}

export default function Home() {
  // 1. TODA A LÓGICA E ESTADO AGORA VIVEM AQUI, NO COMPONENTE PAI (HOME)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("https://api.lab.v4kuri.com.br/webhook/charlles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_projects", timestamp: new Date().toISOString() }),
      })
      if (!response.ok) throw new Error("Erro ao buscar projetos")
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error("Erro ao buscar projetos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os projetos. Usando dados de exemplo.",
        variant: "destructive",
      })
      setProjects([
        { id: "1", name: "E-commerce Fashion", description: "Loja online de moda feminina" },
        { id: "2", name: "SaaS Analytics", description: "Plataforma de análise de dados" },
        { id: "3", name: "Marketplace B2B", description: "Marketplace para empresas" },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId)
    // Se você ainda precisa notificar a API, a lógica continua aqui
    try {
      await fetch("https://api.lab.v4kuri.com.br/webhook/charlles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "project_selected", project_id: projectId, timestamp: new Date().toISOString() }),
      })
      toast({
        title: "Projeto Selecionado",
        description: `Projeto ${projects.find((p) => p.id === projectId)?.name} foi selecionado com sucesso.`,
      })
    } catch (error) {
      console.error("Erro ao notificar seleção:", error)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  // Encontra o nome do projeto para passar para o ReportGenerator
  const selectedProjectName = projects.find((p) => p.id === selectedProjectId)?.name || "Não selecionado"

  // 2. SEU LAYOUT VISUAL PERMANECE IDÊNTICO!
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-50 min-h-screen">
      <Header />

      <div className="flex flex-col md:flex-row gap-12">
        <Navigation />

        <main className="md:w-3/4">
          <div className="space-y-12">
            
            {/* 3. OS FILHOS AGORA RECEBEM AS INFORMAÇÕES DO PAI (HOME) VIA PROPS */}
            
            <ProjectSelector
              projects={projects}
              isLoading={isLoading}
              selectedProject={selectedProjectId}
              onProjectChange={handleProjectChange}
            />
            
            <Phase1 />
            <Phase2 />
            <Phase3 />
            
            <ReportGenerator selectedProjectName={selectedProjectName} />

          </div>
        </main>
      </div>
    </div>
  )
}