import { useEffect, useRef, useState } from 'react';
import type { GuidedPhotoLabel } from '../lib/pb124-media';
import { currentPB124PhotoDraftId, preservePB124Photo, recoverPB124PhotoDraft } from '../lib/pb124-photo-draft-v8';

export interface GuidedPhotoSelection {
  label: GuidedPhotoLabel;
  file: File;
}

const slots: Array<{ label: GuidedPhotoLabel; title: string; help: string }> = [
  { label: 'HORIZON', title: 'Horizon', help: 'Required. Photograph the horizon only when safe.' },
  { label: 'SEA_SURFACE', title: 'Sea Surface', help: 'Required. Photograph the nearby water; avoid identifiable people.' },
  { label: 'CONTEXT', title: 'Context', help: 'Required. Capture environmental context without identifiable people.' },
];

export default function PB124GuidedPhotos({ value, onChange }: {
  value: GuidedPhotoSelection[];
  onChange: (value: GuidedPhotoSelection[]) => void;
}) {
  const refs = {
    HORIZON: useRef<HTMLInputElement>(null),
    SEA_SURFACE: useRef<HTMLInputElement>(null),
    CONTEXT: useRef<HTMLInputElement>(null),
  };
  const [saving, setSaving] = useState<GuidedPhotoLabel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const changedRef = useRef(false);

  useEffect(() => {
    let live = true;
    const draftId = currentPB124PhotoDraftId();
    void recoverPB124PhotoDraft(draftId).then((items) => {
      if (live && !changedRef.current && items.length && valueRef.current.length === 0) onChange(items);
    }).catch(() => {
      if (live) setError('Could not restore preserved photos. Do not clear this browser.');
    });
    return () => { live = false; };
  }, [onChange]);

  const saveSelection = async (label: GuidedPhotoLabel, file: File) => {
    changedRef.current = true;
    setSaving(label);
    setError(null);
    try {
      // The UI does not report "3/3 ready" until the ORIGINAL is durably stored.
      await preservePB124Photo(label, file, currentPB124PhotoDraftId());
      onChange([...valueRef.current.filter(item => item.label !== label), { label, file }]);
    } catch (err) {
      setError(`Original NOT saved: ${err instanceof Error ? err.message : 'storage error'}. Keep the photo in your camera/gallery.`);
    } finally { setSaving(null); }
  };

  const removeSelection = (label: GuidedPhotoLabel) => {
    changedRef.current = true;
    // Intentionally keep a private offline archival copy to prevent accidental loss.
    onChange(valueRef.current.filter(item => item.label !== label));
  };

  return (
    <div className="rounded-xl border p-3 space-y-3" style={{ borderColor: 'var(--wod-border-grid)', background: 'var(--wod-bg-surface)' }}>
      <div className="text-sm font-semibold">Required guided evidence · 3 original photos</div>
      <div className="text-[10px] opacity-75">Each original is saved in this browser immediately after selection. Cloud sync remains separate. Never clear site data before confirmation.</div>
      {error && <p role="alert" className="text-red-400 text-xs">{error}</p>}
      <div className="grid grid-cols-1 gap-2">
        {slots.map(slot => {
          const selected = value.find(item => item.label === slot.label);
          const ref = refs[slot.label];
          return (
            <div key={slot.label} className="rounded-lg border p-3" style={{ borderColor: 'var(--wod-border-grid)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-bold">{slot.title}</div>
                  <div className="text-[10px] opacity-60">{slot.help}</div>
                  {selected && <div className="text-[10px] mt-1 opacity-80">Original saved on device · {selected.file.name} ({selected.file.size} bytes)</div>}
                  {saving === slot.label && <div role="status" className="text-[10px]">Saving original to device…</div>}
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={Boolean(saving)} onClick={() => ref.current?.click()} className="rounded-lg px-3 py-2 text-[10px] font-bold border" style={{ borderColor: 'var(--wod-accent-cyan)', color: 'var(--wod-accent-cyan)' }}>
                    {selected ? 'REPLACE' : 'ADD'}
                  </button>
                  {selected && <button type="button" disabled={Boolean(saving)} onClick={() => removeSelection(slot.label)} className="rounded-lg px-3 py-2 text-[10px] font-bold border">REMOVE</button>}
                </div>
              </div>
              <input ref={ref} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) void saveSelection(slot.label, file);
                e.currentTarget.value = '';
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
