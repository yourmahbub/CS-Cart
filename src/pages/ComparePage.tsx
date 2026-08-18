import React from 'react';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ComparePage() {
  const { compareItems, removeFromCompare, formatPrice } = useCart();

  if (compareItems.length === 0) {
    return (
      <div className="max-w-[1600px] w-full mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Compare Products</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">You have no products to compare. Return to the shop to add products to your comparison list.</p>
        <Link to="/" className="inline-flex items-center gap-2 text-white bg-[#00a651] px-6 py-3 rounded-xl font-bold hover:bg-[#008c44] transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Shop
        </Link>
      </div>
    );
  }

  // Get all unique attributes to build rows
  const allAttributes = new Set<string>();
  compareItems.forEach(item => {
    if (item.attributes) {
      Object.keys(item.attributes).forEach(attr => allAttributes.add(attr));
    }
  });
  
  const attributeList = Array.from(allAttributes);

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 text-gray-900 border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Compare Products</h1>
        <span className="text-gray-500 font-medium">{compareItems.length} Products</span>
      </div>

      <div className="overflow-x-auto pb-8">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <tbody>
            {/* Product Header Row */}
            <tr>
              <th className="w-1/5 p-4 border-b border-r border-gray-100 align-top bg-gray-50 text-gray-500 font-medium rounded-tl-xl text-sm uppercase tracking-wider">
                Product Details
              </th>
              {compareItems.map(item => (
                <td key={item.id} className="w-1/5 p-4 border-b border-r border-gray-100 align-top bg-white relative pt-10">
                  <button 
                    onClick={() => removeFromCompare(item.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1 bg-gray-50 rounded-full"
                    title="Remove from compare"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="h-[280px]">
                    <ProductCard product={item} />
                  </div>
                </td>
              ))}
            </tr>
            
            {/* Price Row */}
            <tr className="group hover:bg-gray-50 transition-colors">
              <th className="p-4 border-b border-r border-gray-100 font-medium text-gray-700 bg-gray-50 group-hover:bg-gray-100 text-sm">
                Price
              </th>
              {compareItems.map(item => (
                <td key={item.id} className="p-4 border-b border-r border-gray-100 font-bold text-lg text-gray-900 group-hover:bg-gray-50">
                  {formatPrice(item.price)}
                </td>
              ))}
            </tr>

            {/* In Stock Row */}
            <tr className="group hover:bg-gray-50 transition-colors">
              <th className="p-4 border-b border-r border-gray-100 font-medium text-gray-700 bg-gray-50 group-hover:bg-gray-100 text-sm">
                Availability
              </th>
              {compareItems.map(item => (
                <td key={item.id} className="p-4 border-b border-r border-gray-100 group-hover:bg-gray-50">
                  <span className="text-[#00a651] font-medium text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00a651]"></span>
                    In Stock
                  </span>
                </td>
              ))}
            </tr>

            {/* Dynamic Attributes */}
            {attributeList.map(attr => (
              <tr key={attr} className="group hover:bg-gray-50 transition-colors">
                <th className="p-4 border-b border-r border-gray-100 font-medium text-gray-700 bg-gray-50 group-hover:bg-gray-100 text-sm capitalize">
                  {attr}
                </th>
                {compareItems.map(item => (
                  <td key={item.id} className="p-4 border-b border-r border-gray-100 text-gray-600 group-hover:bg-gray-50 text-sm">
                    {item.attributes?.[attr] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
