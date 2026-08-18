import React from 'react';
import * as Icons from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useLang } from '../../context/LanguageContext';

/**
 * The store benefits strip (free delivery, returns, secure payment…).
 * The home layout listed this section from the start but nothing rendered it —
 * it is now driven by the `features` setting and editable in the admin.
 */
export function FeaturesStrip() {
  const { features } = useAdmin();
  const { tr } = useLang();

  const items = features?.items ?? [];
  if (!items.length) return null;

  return (
    <section className="max-w-[1600px] mx-auto px-4 mb-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          // Icons are stored by lucide component name; an unknown or removed
          // name falls back rather than crashing the whole home page.
          const Icon = (Icons as any)[item.icon] ?? Icons.Sparkles;
          return (
            <div key={item.id} className="flex items-start gap-4 bg-[#f8f9fa] border border-gray-100 rounded-2xl p-5">
              <div className="w-11 h-11 shrink-0 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[#00a651]">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[15px] text-gray-900 mb-1">{tr(item.title)}</div>
                <p className="text-[13px] text-gray-500 leading-snug">{tr(item.text)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
