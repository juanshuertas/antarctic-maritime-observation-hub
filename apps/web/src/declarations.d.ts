/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PB124_RELAY_URL?: string;
  readonly VITE_PB124_PUBLIC_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    flat?: boolean;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: ('square' | 'circle' | 'star')[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }
  function confetti(options?: ConfettiOptions): Promise<null> | null;
  export default confetti;
}

// lerc 2.0.0 (Esri, Apache-2.0) no trae tipos. Solo usamos decode().
// Declarado para el campo de derivadores de NatGeo MapMaker
// (ver src/lib/natgeo-drifter-field.ts).
declare module 'lerc' {
  export interface LercStatistics {
    minValue: number;
    maxValue: number;
    noDataValue?: number;
  }
  export interface LercDecodeResult {
    width: number;
    height: number;
    /** Un array por banda, cada uno de width*height. */
    pixels: Array<Float64Array | Float32Array | Int32Array | Uint8Array>;
    pixelType: string;
    /** width*height, o null si todos los pixeles son validos. */
    mask: Uint8Array | null;
    statistics: LercStatistics[];
  }
  export function decode(
    input: ArrayBuffer,
    options?: { inputOffset?: number; pixelType?: string; noDataValue?: number },
  ): LercDecodeResult;
  /** El paquete es UMD: según el interop, decode puede llegar bajo default. */
  const Lerc: { decode: typeof decode };
  export default Lerc;
}
