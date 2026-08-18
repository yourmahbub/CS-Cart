import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Localized, toLocalized, isFullyTranslated } from '../../lib/i18n';

interface Props {
  label: string;
  value: Localized;
  onChange: (value: { en: string; ar: string }) => void;
  /** Render multi-line inputs instead of single-line. */
  multiline?: boolean;
  rows?: number;
  placeholderEn?: string;
  placeholderAr?: string;
  hint?: string;
  required?: boolean;
}

const base =
  'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#00a651] transition-colors';

/**
 * Paired English / Arabic input — English on the left, Arabic on the right.
 * The Arabic side renders right-to-left so it reads naturally while typing.
 */
export function BilingualField({
  label, value, onChange, multiline = false, rows = 4,
  placeholderEn, placeholderAr, hint, required,
}: Props) {
  const v = toLocalized(value);
  const complete = isFullyTranslated(value);
  const started = !!(v.en.trim() || v.ar.trim());

  const set = (side: 'en' | 'ar', next: string) => onChange({ ...v, [side]: next });

  const Input = multiline ? 'textarea' : 'input';

  return (
    <div className="flex flex-col gap-1.5">
      {/* Skip the header row entirely when there is nothing to put in it. */}
      <div className={`items-center gap-2 ${label || started ? 'flex' : 'hidden'}`}>
        {label && (
          <span className="text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </span>
        )}
        {started && (
          complete ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-1.5 py-0.5">
              <Check size={9} /> BOTH
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5">
              <AlertCircle size={9} /> {v.en.trim() ? 'MISSING AR' : 'MISSING EN'}
            </span>
          )
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* English */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">English</span>
          <Input
            {...(multiline ? { rows } : { type: 'text' })}
            dir="ltr"
            lang="en"
            value={v.en}
            placeholder={placeholderEn}
            onChange={(e: any) => set('en', e.target.value)}
            className={`${base} ${multiline ? 'resize-y leading-relaxed' : ''}`}
          />
        </div>

        {/* Arabic */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">العربية · Arabic</span>
          <Input
            {...(multiline ? { rows } : { type: 'text' })}
            dir="rtl"
            lang="ar"
            value={v.ar}
            placeholder={placeholderAr}
            onChange={(e: any) => set('ar', e.target.value)}
            className={`${base} text-right ${multiline ? 'resize-y leading-relaxed' : ''}`}
          />
        </div>
      </div>

      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </div>
  );
}

/**
 * Paired list editor — one item per line, English beside Arabic.
 * Used for key features and other simple string lists.
 */
export function BilingualList({
  label, en, ar, onChange, rows = 6, hint,
}: {
  label: string;
  en: string[];
  ar: string[];
  onChange: (next: { en: string[]; ar: string[] }) => void;
  rows?: number;
  hint?: string;
}) {
  const toLines = (v: string) => v.split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        {(en.length > 0 || ar.length > 0) && en.length !== ar.length && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5">
            <AlertCircle size={9} /> {en.length} EN / {ar.length} AR
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">English</span>
          <textarea
            dir="ltr"
            rows={rows}
            value={en.join('\n')}
            onChange={(e) => onChange({ en: toLines(e.target.value), ar })}
            className={`${base} resize-y leading-relaxed`}
            placeholder="One item per line"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">العربية · Arabic</span>
          <textarea
            dir="rtl"
            rows={rows}
            value={ar.join('\n')}
            onChange={(e) => onChange({ en, ar: toLines(e.target.value) })}
            className={`${base} resize-y leading-relaxed text-right`}
            placeholder="عنصر واحد في كل سطر"
          />
        </div>
      </div>

      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </div>
  );
}
