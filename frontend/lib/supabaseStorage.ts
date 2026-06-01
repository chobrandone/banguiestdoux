/**
 * Supabase Storage helpers — replace Firebase Storage
 *
 * Buckets (must be created in Supabase dashboard or via SQL):
 *   events | restaurants | articles | gallery | talents | products | avatars | partners
 */
import { supabase } from './supabase';

export type StorageBucket =
  | 'events'
  | 'restaurants'
  | 'articles'
  | 'gallery'
  | 'talents'
  | 'products'
  | 'avatars'
  | 'partners';

/* ─── Upload a single file ────────────────────────── */
export async function uploadFile(
  bucket: StorageBucket,
  file: File,
  path?: string
): Promise<string> {
  const ext      = file.name.split('.').pop();
  const filePath = path ?? `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return getPublicUrl(bucket, filePath);
}

/* ─── Upload multiple files ───────────────────────── */
export async function uploadFiles(
  bucket: StorageBucket,
  files: File[]
): Promise<string[]> {
  return Promise.all(files.map(f => uploadFile(bucket, f)));
}

/* ─── Get a public URL for a stored file ─────────── */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/* ─── Delete a file by its full public URL ────────── */
export async function deleteFile(bucket: StorageBucket, url: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  /* Extract path: everything after /storage/v1/object/public/<bucket>/ */
  const prefix = `${supabaseUrl}/storage/v1/object/public/${bucket}/`;
  const path   = url.startsWith(prefix) ? url.slice(prefix.length) : url;

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

/* ─── React hook: upload with progress ───────────── */
export async function uploadWithProgress(
  bucket: StorageBucket,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  // Supabase JS v2 doesn't expose upload progress natively;
  // use the XHR workaround below for progress reporting.
  if (!onProgress) return uploadFile(bucket, file);

  return new Promise((resolve, reject) => {
    const ext      = file.name.split('.').pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`);
    xhr.setRequestHeader('Authorization', `Bearer ${anonKey}`);
    xhr.setRequestHeader('x-upsert', 'false');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(getPublicUrl(bucket, filePath));
      } else {
        reject(new Error(`Upload failed: ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));

    const formData = new FormData();
    formData.append('', file);
    xhr.send(formData);
  });
}
