import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CreditCard,
  Lock
} from 'lucide-react';
import PassportCover from './components/PassportCover';
import SmartCardVisual from './components/SmartCardVisual';
import PassportBook from './PassportBook';

export default function PassportShowcase() {
  const navigate = useNavigate();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  return (
    <div className="space-y-16 font-mono text-[#e8f0f3] animate-fadeIn pb-20">
      {/* =========================================================================
          HERO SHOWCASE SECTION
         ========================================================================= */}
      <section className="relative rounded-3xl border border-[#1d3c4e] bg-[#07131e] p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#35c3c8]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#35c3c8]/30 bg-[#35c3c8]/10 text-[#35c3c8] text-xs font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#35c3c8] animate-pulse" />
            <span>SISTEMA DE IDENTIDAD FÍSICA & DIGITAL POLAR</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide uppercase leading-tight">
            The Antarctic Scientific Passport
          </h1>

          <p className="text-sm sm:text-base font-serif italic text-[#8faab5] max-w-2xl mx-auto leading-relaxed">
            «Un artefacto editorial, físico y criptográfico diseñado para observadores oceanográficos, buques polares y estaciones científicas en los confines del Océano Austral.»
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="py-3.5 px-7 rounded-2xl bg-[#35c3c8] hover:bg-[#48d2d7] text-[#050e14] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_10px_25px_rgba(53,195,200,0.3)] hover:-translate-y-0.5 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Abrir Libreta Física</span>
            </button>

            <Link
              to="/passport/smart-card"
              className="py-3.5 px-6 rounded-2xl border border-[#214358] bg-[#0c1e2b] hover:bg-[#132c3f] text-[#35c3c8] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Ver Smart Card NFC</span>
            </Link>
          </div>
        </div>

        {/* 3D Visual Artifacts Showcase Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center">
          {/* Physical Booklet */}
          <div className="flex flex-col items-center space-y-3">
            <span className="text-xs text-[#35c3c8] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Libreta Oficial (Azul Antártico)</span>
            </span>
            <PassportCover onClick={() => setIsBookModalOpen(true)} />
            <span className="text-[10px] text-[#6c8a99]">
              Papel de seguridad guilloché · Foil estampado plateado
            </span>
          </div>

          {/* Smart Card NFC */}
          <div className="flex flex-col items-center space-y-3">
            <span className="text-xs text-[#72e0b5] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span>Smart Card Criptográfica</span>
            </span>
            <SmartCardVisual
              interactive
              onClick={() => navigate('/passport/smart-card')}
            />
            <span className="text-[10px] text-[#6c8a99]">
              Chip ISO 7816 · Antena NFC 13.56 MHz · Firma Ed25519
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PILLARS OF THE AMOH PASSPORT PRODUCT
         ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#091824] border border-[#1d3c4e] space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-[#35c3c8]/10 text-[#35c3c8] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Libreta Editorial Física
          </h3>
          <p className="text-xs text-[#8faab5] leading-relaxed">
            Inspirada en el Antarctica World Passport y libretas científicas históricas. Textura táctil de papel, curvas guilloché y sellos de tinta indeleble.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#091824] border border-[#1d3c4e] space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-[#72e0b5]/10 text-[#72e0b5] flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Smart Card de Campo
          </h3>
          <p className="text-xs text-[#8faab5] leading-relaxed">
            Acreditación portátil sin bandas magnéticas ni datos bancarios. Diseñada para autenticación local en laboratorios polares y estaciones remotas.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#091824] border border-[#1d3c4e] space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-[#35c3c8]/10 text-[#35c3c8] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            3. Privacidad por Defecto
          </h3>
          <p className="text-xs text-[#8faab5] leading-relaxed">
            Divulgación selectiva. El observador elige qué datos revelar al compartir su credencial mediante enlaces firmados con expiración automática.
          </p>
        </div>
      </section>

      {/* Book Spread Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <PassportBook onClose={() => setIsBookModalOpen(false)} />
        </div>
      )}
    </div>
  );
}
