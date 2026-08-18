import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useLang } from '../context/LanguageContext';

export function CategoriesGrid() {
  // Categories are managed in /admin/categories — never hard-coded here.
  const { categories } = useAdmin();
  const { tr } = useLang();

  if (!categories || categories.length === 0) return null;

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((category: any) => (
          <Link
            to={`/category/${category.id}`}
            key={category.id}
            className="flex flex-col items-center justify-between bg-[#f4f5f6] hover:bg-[#eef0f1] transition-colors rounded-2xl p-6 group cursor-pointer overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[260px]"
          >
            <div className="w-full flex-1 flex items-center justify-center mb-4">
              {category.image && (
                <img
                  src={category.image}
                  alt={tr({ en: category.name, ar: category.nameAr })}
                  loading="lazy"
                  className="max-w-[85%] max-h-[85%] object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>
            <span className="text-[16px] lg:text-[18px] font-medium text-gray-900 text-center leading-tight mb-2">
              {tr({ en: category.name, ar: category.nameAr })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
