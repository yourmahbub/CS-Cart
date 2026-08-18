import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, AlertCircle, Link2 } from 'lucide-react';
import { api } from '../../lib/api';

interface Props {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  /** Background behind the preview — useful for logos meant for dark headers. */
  previewClass?: string;
  height?: number;
}

/**
 * Uploads an image to the server and stores the returned URL.
 * The file is sent as a data URI; the server verifies the bytes and writes it
 * to disk, so the database only ever holds a short path.
 */
export function ImageUpload({
  value, onChange, label, hint,
  previewClass = 'bg-gray-50', height = 96,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const [dragging, setDragging] = useState(false);

  const MAX = 2 * 1024 * 1024;

  const upload = (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('That file is not an image.');
      return;
    }
    if (file.size > MAX) {
      setError(`Images must be under 2 MB. This one is ${(file.size / 1024 / 1024).toFixed(1)} MB.`);
      return;
    }

    setBusy(true);
    const reader = new FileReader();
    reader.onerror = () => { setError('The file could not be read.'); setBusy(false); };
    reader.onload = async () => {
      try {
        const { url } = await api.post<{ url: string }>('/admin/upload', { file: reader.result });
        onChange(url);
      } catch (err: any) {
        setError(err?.message ?? 'The upload failed.');
      } finally {
        setBusy(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2 min-w-0 w-full">
      {label && <span className="text-sm font-semibold text-gray-700">{label}</span>}

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-[12.5px]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-start gap-3">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) upload(file);
          }}
          onClick={() => !value && inputRef.current?.click()}
          role={value ? undefined : 'button'}
          title={value ? undefined : 'Click or drop an image here'}
          className={`rounded-xl border-2 flex items-center justify-center overflow-hidden shrink-0 px-4 transition-colors ${
            dragging ? 'border-[#00a651] border-dashed bg-[#00a651]/5' : 'border-gray-200 border-solid'
          } ${value ? '' : 'border-dashed cursor-pointer hover:border-gray-400'} ${previewClass}`}
          style={{ height, minWidth: Math.min(height * 1.8, 150), maxWidth: '100%' }}
        >
          {value ? (
            <img src={value} alt="" className="max-h-full max-w-[220px] object-contain" />
          ) : (
            <span className="text-[12px] text-gray-400 text-center leading-snug px-2">
              {dragging ? 'Drop to upload' : 'Click or drop an image'}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {busy ? 'Uploading…' : value ? 'Replace' : 'Upload image'}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setError(''); }}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-red-600 hover:border-red-200"
              >
                <X className="w-4 h-4" /> Remove
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowUrl(!showUrl)}
              className="p-2 text-gray-400 hover:text-gray-700"
              title="Use an external URL instead"
            >
              <Link2 className="w-4 h-4" />
            </button>
          </div>

          {showUrl && (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://… or /uploads/…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-mono outline-none focus:border-[#00a651]"
            />
          )}

          <span className="text-[11px] text-gray-400 leading-snug break-words">
            {hint || 'PNG, JPG, WEBP or GIF · up to 2 MB'}
          </span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
