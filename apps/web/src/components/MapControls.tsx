import { Plus, Minus, Compass, RotateCcw, Maximize2, Locate } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetNorth: () => void;
  onResetAntarctica: () => void;
  onLocateUser?: () => void;
  onToggleFullscreen?: () => void;
  className?: string;
}

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onResetNorth,
  onResetAntarctica,
  onLocateUser,
  onToggleFullscreen,
  className = '',
}: MapControlsProps) {
  return (
    <div
      className={`flex flex-col items-center gap-1.5 p-1.5 bg-[#080e19ee] border border-[#24344d] rounded-2xl shadow-2xl backdrop-blur-md select-none pointer-events-auto ${className}`}
    >
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#b7c5d8] hover:text-white hover:bg-[#1c2940] transition-colors"
        title="Acercar (Zoom +)"
        aria-label="Acercar"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#b7c5d8] hover:text-white hover:bg-[#1c2940] transition-colors"
        title="Alejar (Zoom -)"
        aria-label="Alejar"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="w-5 h-[1px] bg-[#1c2940] my-0.5" />

      {/* Compass / Reset North */}
      <button
        onClick={onResetNorth}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#35c3c8] hover:text-white hover:bg-[#1c2940] transition-colors"
        title="Orientar al Norte"
        aria-label="Orientar al Norte"
      >
        <Compass className="w-4 h-4" />
      </button>

      {/* Reset Antarctica View */}
      <button
        onClick={onResetAntarctica}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#72e0b5] hover:text-white hover:bg-[#1c2940] transition-colors"
        title="Centrar Antártida"
        aria-label="Centrar Antártida"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      {onLocateUser && (
        <button
          onClick={onLocateUser}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#b7c5d8] hover:text-white hover:bg-[#1c2940] transition-colors"
          title="Ubicación GPS"
          aria-label="Ubicación GPS"
        >
          <Locate className="w-3.5 h-3.5" />
        </button>
      )}

      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#b7c5d8] hover:text-white hover:bg-[#1c2940] transition-colors"
          title="Pantalla Completa"
          aria-label="Pantalla Completa"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
