'use client';

/**
 * Reusable image upload component for admin forms.
 * Uploads files directly to Supabase Storage and returns the public URL.
 *
 * Usage:
 *   <ImageUpload
 *     bucket="event-flyers"
 *     value={form.image}
 *     onChange={url => setForm(p => ({ ...p, image: url }))}
 *     label="Affiche de l'événement"
 *   />
 */

import { useRef, useState } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  bucket: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** Max file size in bytes (default: 5 MB) */
  maxSize?: number;
  /** Accepted MIME types (default: common images) */
  accept?: string;
  className?: string;
}

export default function ImageUpload({
  bucket,
  value,
  onChange,
  label,
  maxSize = 5 * 1024 * 1024,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  className = '',
}: ImageUploadProps) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [dragOver,  setDragOver]  = useState(false);

  const lc = 'block text-xs font-semibold text-beige/50 uppercase tracking-wider mb-1.5';

  async function uploadFile(file: File) {
    if (file.size > maxSize) {
      toast.error(`Fichier trop volumineux (max ${Math.round(maxSize / 1024 / 1024)} Mo)`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Unique filename to avoid collisions
      const ext  = file.name.split('.').pop() || 'jpg';
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // Supabase JS v2 doesn't expose upload progress natively;
      // simulate it so the UI doesn't look frozen.
      const ticker = setInterval(() => {
        setProgress(p => Math.min(p + 15, 85));
      }, 200);

      const { error } = await supabase.storage
        .from(bucket)
        .upload(name, file, { cacheControl: '3600', upsert: false });

      clearInterval(ticker);

      if (error) throw error;

      setProgress(100);

      const { data } = supabase.storage.from(bucket).getPublicUrl(name);
      onChange(data.publicUrl);
      toast.success('Image téléchargée !');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Erreur de téléchargement');
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    uploadFile(files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function clearImage() {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className={className}>
      {label && <label className={lc}>{label}</label>}

      {/* Preview mode — image already set */}
      {value && !uploading ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-full h-40 object-cover"
            onError={e => (e.currentTarget.style.display = 'none')}
          />
          {/* Overlay with replace / clear buttons */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Remplacer
            </button>
            <button
              type="button"
              onClick={clearImage}
              className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={[
            'relative flex flex-col items-center justify-center gap-2 h-40',
            'border-2 border-dashed rounded-xl cursor-pointer transition-all select-none',
            dragOver
              ? 'border-gold/70 bg-gold/5'
              : 'border-white/10 hover:border-gold/30 hover:bg-white/2',
          ].join(' ')}
        >
          {uploading ? (
            <>
              <Loader2 className="w-7 h-7 text-gold animate-spin" />
              <p className="text-xs text-beige/50">Téléchargement… {progress}%</p>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-b-xl overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <ImageIcon className="w-7 h-7 text-beige/20" />
              <div className="text-center">
                <p className="text-xs text-beige/50">
                  <span className="text-gold font-semibold">Cliquer</span> ou glisser-déposer
                </p>
                <p className="text-[10px] text-beige/30 mt-0.5">
                  PNG, JPG, WebP · max {Math.round(maxSize / 1024 / 1024)} Mo
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}
