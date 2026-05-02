import React from 'react';
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-300 pt-16 pb-8 text-[14px]">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Store Info */}
          <div>
            <div className="flex items-start mb-6">
              <span className="text-[#00a651] font-bold text-[28px] leading-none tracking-tight">Uni</span>
              <span className="text-white font-bold text-[28px] leading-none tracking-tight">theme</span>
              <span className="text-white w-[14px] h-[14px] border rounded-full text-[9px] flex items-center justify-center font-bold ml-0.5 mt-1">2</span>
            </div>
            <p className="mb-6 text-gray-400">
              The ultimate e-commerce template featuring a powerful, clean, and modern design. Build your dream store today.
            </p>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#00a651] hover:text-white transition-colors cursor-pointer">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#00a651] hover:text-white transition-colors cursor-pointer">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#00a651] hover:text-white transition-colors cursor-pointer">
                <Instagram className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#00a651] hover:text-white transition-colors cursor-pointer">
                <Youtube className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-[#00a651] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#00a651] transition-colors">Delivery Information</a></li>
              <li><a href="#" className="hover:text-[#00a651] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#00a651] transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-[#00a651] transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#00a651] flex-shrink-0 mt-0.5" />
                <span>1234 E-commerce Blvd, Suite 567<br />New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#00a651] flex-shrink-0" />
                <span>+1 (917) 722-7425</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#00a651] flex-shrink-0" />
                <span>support@unitheme.net</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Newsletter</h3>
            <p className="mb-4 text-gray-400">Subscribe to get updates on new products and special offers.</p>
            <form className="relative flex items-center">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full h-12 bg-white/10 border border-white/20 rounded-full px-5 pr-14 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00a651] transition-colors"
              />
              <button 
                type="button"
                className="absolute right-1 w-10 h-10 bg-[#00a651] hover:bg-[#008c44] text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 ml-[-2px]" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500">
          <p>© {new Date().getFullYear()} UniTheme Clone. All Rights Reserved.</p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-xs uppercase font-bold tracking-wider mr-2">We Accept:</span>
            <div className="flex gap-2">
               <div className="h-6 w-10 bg-white/80 rounded flex items-center justify-center text-[10px] font-bold text-black">VISA</div>
               <div className="h-6 w-10 bg-white/80 rounded flex items-center justify-center text-[10px] font-bold text-black">MC</div>
               <div className="h-6 w-10 bg-white/80 rounded flex items-center justify-center text-[10px] font-bold text-black">AMEX</div>
               <div className="h-6 w-10 bg-[#ffb700] rounded flex items-center justify-center text-[10px] font-bold text-[#003087]">PayPal</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
