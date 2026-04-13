import { getApiDocs } from '@/lib/swagger';
import ReactSwagger from '@/components/ReactSwagger';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <main className="min-h-screen bg-[#050505] p-8 md:p-16">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group transition-all">
              <BookOpen className="text-neon-cyan w-10 h-10 group-hover:scale-110 transition-transform" />
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-neon-purple leading-[normal]">
                Documentación API
              </h1>
            </Link>
            <p className="text-gray-400 text-lg max-w-2xl">
              Bienvenido a la referencia técnica de EduStream AI. Aquí encontrarás todos los detalles sobre cómo interactuar con nuestros servicios y datos.
            </p>
          </div>
          <div className="flex gap-4">
             <Link href="/dashboard" className="px-6 py-2 glass rounded-full hover:bg-white/5 transition-colors text-sm font-medium">Volver al Dashboard</Link>
          </div>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <ReactSwagger spec={spec} />
        </section>

        <footer className="text-center text-gray-500 text-sm pt-8 border-t border-white/5">
          &copy; 2024 EduStream AI. Documentación Generada con OpenAPI 3.0.
        </footer>
      </div>
    </main>
  );
}
