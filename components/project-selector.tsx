"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface Project { id: string; name: string; description?: string }
interface ProjectSelectorProps {
  projects: Project[]
  selectedProject: string
  onProjectChange: (projectId: string) => void
  isLoading: boolean
}

// Este componente agora é "burro": só recebe props e as exibe.
export function ProjectSelector({ projects, selectedProject, onProjectChange, isLoading }: ProjectSelectorProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Seleção de Projeto</h3>
          <p className="text-sm text-slate-500 mt-1">
            Selecione o projeto para iniciar o processo de análise estratégica
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-select">Projeto</Label>
          <Select value={selectedProject} onValueChange={onProjectChange} disabled={isLoading}>
            <SelectTrigger id="project-select">
              <SelectValue placeholder={isLoading ? "Carregando projetos..." : "Selecione um projeto"} />
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div>
                    <div className="font-medium">{project.name}</div>
                    {project.description && <div className="text-sm text-slate-500">{project.description}</div>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}