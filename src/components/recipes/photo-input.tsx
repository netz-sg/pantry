'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Camera, Globe, ImagePlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Photo } from '@/components/ui/photo';

export interface PhotoState {
  file: File | null;
  preview: string | null;
  remove: boolean;
  importUrl: string | null;
}

const MAX = 12 * 1024 * 1024;

/** Foto wählen oder aufnehmen, mit Vorschau. Das Hochladen passiert beim Sichern. */
export function PhotoInput({
  value,
  onChange,
  existing,
  seed,
}: {
  value: PhotoState;
  onChange: (v: PhotoState) => void;
  existing: string | null;
  seed: string;
}) {
  const t = useTranslations('recipes.form');
  const pick = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);

  // Vorschau-Adresse wieder freigeben, wenn sie nicht mehr gebraucht wird
  useEffect(() => {
    const url = value.preview;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [value.preview]);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX) {
      toast.error(t('photoTooLarge'));
      return;
    }
    onChange({ file: f, preview: URL.createObjectURL(f), remove: false, importUrl: null });
  };

  const showExisting = !value.preview && !value.importUrl && !value.remove && existing;
  const has = Boolean(value.preview || value.importUrl || showExisting);

  return (
    <div className="flex items-center gap-4">
      <div className="size-24 shrink-0 overflow-hidden rounded-[18px] bg-fill sm:size-28">
        {value.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.preview} alt={t('photoPreview')} className="size-full object-cover" />
        ) : value.importUrl ? (
          <div className="grid size-full place-items-center bg-tint-soft text-tint">
            <Globe className="size-8" aria-hidden />
          </div>
        ) : showExisting ? (
          <Photo path={existing} alt={t('photoPreview')} seed={seed} className="size-full" />
        ) : (
          <div className="grid size-full place-items-center text-label-3">
            <ImagePlus className="size-8" aria-hidden />
          </div>
        )}
      </div>
      <div className="grid min-w-0 gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => pick.current?.click()}
            className="h-11"
          >
            <ImagePlus /> {has ? t('photoChange') : t('photoChoose')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            onClick={() => camera.current?.click()}
            aria-label={t('photoCamera')}
            className="md:hidden"
          >
            <Camera />
          </Button>
          {has ? (
            <Button
              type="button"
              variant="destructive"
              size="icon-lg"
              aria-label={t('photoRemove')}
              onClick={() => onChange({ file: null, preview: null, remove: true, importUrl: null })}
            >
              <Trash2 />
            </Button>
          ) : null}
        </div>
        <p className="text-footnote text-label-2">
          {value.importUrl ? t('photoFromImport') : t('photoHint')}
        </p>
      </div>
      <input
        ref={pick}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
