import fs from 'fs';
const file = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

const regex = /\{\/\* Reviews \*\/\}[\s\S]*?(?=<\/div>\s*\{\/\* Right Sidebar: Prices & Actions \*\}|\{\/\* Right Sidebar: Prices & Actions \*\/\})/m;

const replacement = `{/* Reviews */}
      {product.reviews > 0 && (
      <div className="mb-12 px-1 lg:max-w-[70%]">
        <h2 className="text-[28px] font-extrabold text-gray-900 mb-8 font-sans">Reviews</h2>
        
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start mb-8">
          <div className="flex items-start gap-6">
            <div className="flex flex-col">
              <span className="text-[48px] font-bold text-gray-900 leading-[1] mb-1 tracking-tight">{product.rating ? ((product.rating % 1 === 0) ? product.rating.toFixed(1) : product.rating) : '0.0'}</span>
              <div className="flex items-center gap-0.5 mb-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={\`w-[14px] h-[14px] \${i <= Math.floor(product.rating || 0) ? 'fill-[#ff5c00] text-[#ff5c00]' : 'fill-[#ff5c00]/20 text-[#ff5c00]/20'} \${i === 5 ? 'w-[7px] overflow-hidden' : ''}\`} />
                ))}
              </div>
              <span className="text-[12px] text-gray-500">Reviews: {product.reviews}</span>
            </div>
            
            <div className="flex flex-col gap-1.5 min-w-[180px]">
               {[
                 {stars: 5, pct: '55%'},
                 {stars: 4, pct: '27%'},
                 {stars: 3, pct: '0%'},
                 {stars: 2, pct: '9%'},
                 {stars: 1, pct: '9%'},
               ].map(row => (
                 <div key={row.stars} className="flex items-center gap-2 text-[12px] text-gray-500">
                   <span className="w-[40px]">{row.stars} stars</span>
                   <div className="flex-1 h-[6px] bg-[#e5e7eb] rounded-full overflow-hidden">
                     <div className="h-full bg-[#ff5c00] rounded-full" style={{width: row.pct}}></div>
                   </div>
                   <span className="w-[30px]">{row.pct}</span>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="flex flex-col mt-4 md:mt-0">
             <h3 className="text-[18px] font-bold text-gray-900 mb-1.5 leading-tight">Review this product</h3>
             <p className="text-[13px] text-gray-900 mb-4">Share your thoughts with other customers</p>
             <button className="border-2 border-[#00a651] text-[#00a651] rounded-full px-5 py-1.5 text-[14px] font-bold w-fit hover:bg-green-50 transition-colors">
               Write a review
             </button>
          </div>
        </div>
      </div>
      )}
      </div>

`;

fs.writeFileSync('src/pages/ProductPage.tsx', file.replace(regex, replacement));
