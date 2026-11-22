import { Lock, ShieldCheck, EyeOff, Server } from 'lucide-react';

export default function PassportPrivacy() {
  return (
    <div className="space-y-8 font-mono max-w-3xl mx-auto">
      <div className="border-b border-[#1b3543] pb-6 text-center space-y-2">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2.5">
          <Lock className="w-6 h-6 text-[#72e0b5]" />
          <span>Privacidad, Criptografía & Soberanía de Datos</span>
        </h1>
        <p className="text-xs text-[#8faab5]">
          Arquitectura de privacidad cero conocimiento (ZK) y protección del observador conforme al Tratado Antártico.
        </p>
      </div>

      <div className="space-y-4 text-xs text-[#b7c5d8]">
        <div className="p-5 rounded-2xl border border-[#1b3543] bg-[#0a1520] space-y-2">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <EyeOff className="w-4 h-4 text-[#00e5ff]" />
            <span>Pruebas de Conocimiento Cero (Zero Knowledge)</span>
          </div>
          <p className="leading-relaxed text-[#8faab5]">
            La integración con World ID valida que cada registro científico proviene de un ser humano único verificado sin divulgar su identidad biológica o legal real en bases de datos públicas.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[#1b3543] bg-[#0a1520] space-y-2">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Server className="w-4 h-4 text-[#72e0b5]" />
            <span>Soberanía Local y Operación Offline</span>
          </div>
          <p className="leading-relaxed text-[#8faab5]">
            Los datos de observaciones se almacenan primero en el dispositivo local (IndexedDB) y se firman criptográficamente. Ningún dato se pierde al navegar en áreas sin conectividad satelital.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[#1b3543] bg-[#0a1520] space-y-2">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
            <span>Cumplimiento con el Artículo VII del Tratado Antártico</span>
          </div>
          <p className="leading-relaxed text-[#8faab5]">
            Todas las observaciones públicas preservan el principio de ciencia abierta y pacífica establecido por el Tratado de 1959, prohibiendo usos comerciales restrictivos o censura geoespacial.
          </p>
        </div>
      </div>
    </div>
  );
}
