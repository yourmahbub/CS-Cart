import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, ShoppingCart, LayoutTemplate, Gem, Mic, Shirt, Dumbbell, PenTool, Gamepad2, List } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useLang } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const iconMap: Record<string, React.ElementType> = {
  LayoutTemplate, Gem, Mic, Shirt, Dumbbell, PenTool, Gamepad2, List
};

export function MegaMenu({ closeMenu }: { closeMenu: () => void }) {
  const { megaMenuCategories: megaMenuData } = useAdmin();
  const { tr } = useLang();
  const [activeCategoryId, setActiveCategoryId] = useState(megaMenuData[0]?.id);
  
  // Ensure we have data
  if (!megaMenuData || megaMenuData.length === 0) return null;
  
  const activeCategory = megaMenuData.find(c => c.id === activeCategoryId);
  const [activeSubId, setActiveSubId] = useState(activeCategory?.subcategories?.[0]?.title || '');

  // Reset subcategory when main category changes
  const handleCategoryHover = (id: string) => {
    setActiveCategoryId(id);
    const category = megaMenuData.find(c => c.id === id);
    if (category?.subcategories && category.subcategories.length > 0) {
      setActiveSubId(category.subcategories[0].title);
    } else {
      setActiveSubId('');
    }
  };

  const activeSubcategory = activeCategory?.subcategories?.find(s => s.title === activeSubId);

  return (
    <div id="mega-menu" className="absolute top-full left-4 right-4 mt-1 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] z-[100] flex overflow-hidden min-h-[500px]">
      
      {/* Column 1: Main Categories */}
      <div className="w-[280px] bg-[#f9f9f9] py-3 flex-shrink-0 flex flex-col border-r border-gray-200 relative">
        {megaMenuData.map((category) => {
          const Icon = iconMap[category.icon] || LayoutTemplate;
          const isActive = activeCategoryId === category.id;
          
          return (
            <div 
              key={category.id}
              onMouseEnter={() => handleCategoryHover(category.id)}
              className={`flex items-start gap-4 p-[12px_20px] transition-colors relative ${isActive ? 'bg-white' : 'hover:bg-gray-100'}`}
            >
              {isActive && (
                 <div className="absolute top-0 bottom-0 right-[-1px] w-[2px] bg-white z-10" />
              )}
              <div className="mt-0.5 text-gray-400 flex items-center justify-center w-8 h-8 flex-shrink-0 pointer-events-none">
                <Icon className={`w-8 h-8 ${isActive ? 'text-gray-600' : 'text-gray-400'}`} strokeWidth={1} />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Link to={`/category/${category.id}`} onClick={closeMenu} className={`font-semibold text-[15px] text-gray-900 hover:text-[#00a651] transition-colors`}>{tr(category.title)}</Link>
                  {category.badge && (
                    <span className={`text-[9px] font-bold text-white px-1.5 py-[2px] rounded ${category.badgeColor || 'bg-gray-700'}`}>
                      {category.badge}
                    </span>
                  )}
                </div>
                {category.subtitle && (
                  <p className="text-[13px] text-gray-500 leading-tight pr-4">{category.subtitle}</p>
                )}
              </div>
              <div className="flex items-center h-8 pointer-events-none">
                <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#0066cc]' : 'text-gray-300'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Content Area */}
      <div className="flex-1 bg-white flex">
        {/* Categories Grid */}
        <div className="flex-1 p-8">
          {activeCategory?.subcategories && activeCategory.subcategories.length > 0 ? (
            <div className="grid grid-cols-4 gap-x-8 gap-y-10">
              {activeCategory.subcategories.map((sub, idx) => (
                <div key={idx} className="flex flex-col">
                  {sub.image && (
                    <Link to={`/category/${sub.title.toLowerCase().replace(/\s+/g, '-')}`} onClick={closeMenu} className="h-[90px] flex items-end justify-center mb-5 hover:opacity-80 transition-opacity">
                      <img src={sub.image} alt={tr(sub.title)} className="max-h-full max-w-full object-contain" />
                    </Link>
                  )}
                  <h4 className="font-bold text-[15px] text-gray-900 mb-3 flex items-center gap-2">
                    <Link to={`/category/${sub.title.toLowerCase().replace(/\s+/g, '-')}`} onClick={closeMenu} className="hover:text-[#00a651] transition-colors">{tr(sub.title)}</Link>
                    {sub.badge && (
                      <span className="bg-[#ff6200] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">{sub.badge}</span>
                    )}
                  </h4>
                  <ul className="space-y-2.5">
                    {sub.links?.map((link, lIdx) => (
                      <li key={lIdx}>
                        <Link to={`/category/${link.label.toLowerCase().replace(/\s+/g, '-')}`} onClick={closeMenu} className="text-[14px] text-gray-600 hover:text-[#0066cc] cursor-pointer inline-flex items-center gap-2">
                          {link.label}
                          {link.badge && (
                            <span className="bg-[#00a651] text-white text-[9px] font-bold px-1 py-0.5 rounded uppercase">{link.badge}</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {sub.links && sub.links.length > 0 && (
                    <div className="text-[14px] text-[#0066cc] hover:underline cursor-pointer mt-3 flex items-center">
                      More <ChevronDown className="w-4 h-4 ml-0.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
               <p>No subcategories available.</p>
             </div>
          )}
        </div>
        
        {/* Promotional Side Banner */}
        {activeCategory?.promoImage && (
          <div className="w-[300px] flex-shrink-0 relative overflow-hidden bg-black p-6">
            <img src={activeCategory.promoImage} alt="Promotion" className="absolute inset-0 w-full h-full object-cover opacity-80" />
            <div className="relative z-10 flex flex-col justify-between h-full text-white">
               <div className="flex justify-between items-start">
                  <span className="font-bold text-lg tracking-widest">SAMSUNG</span>
               </div>
               <div className="text-center mt-12">
                  <span className="border border-white/40 px-3 py-1 text-[11px] font-bold tracking-wider rounded-sm">GET THE PHONE NOW!</span>
                  <h3 className="text-[26px] font-semibold mt-4 mb-2">Galaxy S8 | S8+</h3>
                  <div className="text-center mt-32">
                     <h2 className="text-3xl font-bold">Unbox your<br/>phone</h2>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
