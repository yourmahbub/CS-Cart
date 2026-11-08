import React from 'react';
import { mockCategories } from '../data/mockData';
import { Link } from 'react-router-dom';

export function CategoriesGrid() {
  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {mockCategories.map((category, index) => (
          <Link to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`} key={index} className="flex flex-col items-center justify-between bg-[#f4f5f6] hover:bg-[#eef0f1] transition-colors rounded-2xl p-6 group cursor-pointer overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[260px]">
            <div className="w-full flex-1 flex items-center justify-center mb-4">
               <img 
                 src={category.image || undefined} 
                 alt={category.name}
                 className="max-w-[85%] max-h-[85%] object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
               />
            </div>
            <span className="text-[16px] lg:text-[18px] font-medium text-gray-900 text-center leading-tight mb-2">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
