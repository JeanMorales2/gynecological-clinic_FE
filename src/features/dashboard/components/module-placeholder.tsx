import { Card } from "@/components/ui";

export function ModulePlaceholder({ title }: Readonly<{ title: string }>) {
  return <section className="space-y-6"><div><h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">{title}</h1><p className="mt-2 text-text-secondary">Próximamente podrás gestionar este módulo desde aquí.</p></div><Card title={title}><p className="text-text-secondary">Módulo en construcción</p></Card></section>;
}