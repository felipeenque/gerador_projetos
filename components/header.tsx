import Image from 'next/image'

export function Header() {
  return (
    <header className="flex items-center justify-center gap-6 mb-16">
      
      {}
      <Image
        src="/logo_v4.png"
        alt="Logo da V4 Company"
        width={80}
        height={80}
        className="rounded-lg"
      />

      {/* 4. Agrupe o texto em uma div para alinhá-lo à esquerda */}
      <div className="text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
          Processo Operacional Padrão
        </h1>
        <p className="mt-2 text-lg text-slate-500">
          O Guia Interativo para o Planejamento Estratégico de Clientes na V4 Company
        </p>
      </div>
      
    </header>
  )
}
