import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { useLang } from '../context/LanguageContext';

export function DeliveryPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Delivery and Payment</h1>
      
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00a651]"></div> Delivery Options</h2>
        <ul className="space-y-4 text-gray-600">
          <li className="flex gap-4 items-start pb-4 border-b border-gray-50">
            <div className="font-bold text-gray-900 w-40 flex-shrink-0">Standard Delivery</div>
            <div>3-5 business days. Ships nationally via standard carrier. ($5.99)</div>
          </li>
          <li className="flex gap-4 items-start pb-4 border-b border-gray-50">
            <div className="font-bold text-gray-900 w-40 flex-shrink-0">Express Delivery</div>
            <div>1-2 business days. Priority processing. ($14.99)</div>
          </li>
          <li className="flex gap-4 items-start">
            <div className="font-bold text-gray-900 w-40 flex-shrink-0">Next Day Air</div>
            <div>Guaranteed next day delivery by 12 PM local time. ($24.99)</div>
          </li>
        </ul>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00a651]"></div> Payment Methods</h2>
        <p className="text-gray-600 leading-relaxed">
          We accept all major credit cards including Visa, Mastercard, and American Express. We also support digital wallets like PayPal, Apple Pay, and Google Pay for secure, encrypted processing. Cash on delivery is available for eligible local ZIP codes.
        </p>
      </div>
    </div>
  );
}

export function ReturnsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Return Policy</h1>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 prose prose-gray max-w-none">
        <p className="text-gray-600 text-lg mb-6">We want you to be completely satisfied with your purchase. Enjoy peace of mind with our 30-day return guarantee.</p>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Conditions for Returns</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-8">
           <li>Item must be returned within 30 days of standard delivery.</li>
           <li>Item must be in original condition, unworn, and unwashed.</li>
           <li>Electronics must be unopened and seal intact for full refund.</li>
           <li>Original tags must remain attached.</li>
        </ul>
        <h3 className="text-lg font-bold text-gray-900 mb-3">How to Start a Return</h3>
        <p className="text-gray-600">Please navigate to your Account dashboard and select "Initiate Return" on your recent order. A printable shipping label will be generated and provided to your email instantly.</p>
      </div>
    </div>
  );
}

export function StoresPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Our Stores</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center">
           <h2 className="text-2xl font-bold text-gray-900 mb-6">New York Flagship</h2>
           <div className="space-y-4 text-gray-600">
             <div className="flex items-start gap-4">
               <MapPin className="text-[#00a651] w-6 h-6 flex-shrink-0" />
               <div>1234 E-commerce Blvd, Suite 567<br/>New York, NY 10001</div>
             </div>
             <div className="flex items-center gap-4">
               <Phone className="text-[#00a651] w-6 h-6 flex-shrink-0" />
               <div>+1 (917) 722-7425</div>
             </div>
             <div className="flex items-start gap-4">
               <Clock className="text-[#00a651] w-6 h-6 flex-shrink-0" />
               <div>Mon-Sat: 10:00 AM - 9:00 PM<br/>Sun: 11:00 AM - 6:00 PM</div>
             </div>
           </div>
        </div>
        <div className="bg-gray-200 rounded-3xl overflow-hidden min-h-[400px] relative">
           {/* Map Placeholder */}
           <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
             <div className="text-center">
               <MapPin className="w-12 h-12 text-blue-300 mx-auto mb-2" />
               <p className="text-blue-500 font-medium">Interactive Map view</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export function ContactsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Contact Us</h1>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
               <input type="text" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651]" />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
               <input type="text" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651]" />
             </div>
           </div>
           <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
             <input type="email" className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651]" />
           </div>
           <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
             <textarea className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#00a651] resize-none"></textarea>
           </div>
           <button className="bg-[#00a651] hover:bg-[#008c44] text-white px-8 py-3 rounded-full font-bold transition-colors cursor-pointer">
             Send Message
           </button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CMS page — content managed in /admin/pages                          */
/* ------------------------------------------------------------------ */

export function CmsPage() {
  const { slug } = useParams();
  const { localizePage, dir } = useLang();
  const [raw, setRaw] = useState<any>(null);
  const [error, setError] = useState('');

  // Re-localises automatically when the visitor switches language.
  const page = raw ? localizePage(raw) : null;

  useEffect(() => {
    setRaw(null);
    setError('');
    api.get<{ page: any }>(`/pages/${slug}`)
      .then((d) => setRaw(d.page))
      .catch((err) => setError(err?.message ?? 'Page not found.'));
  }, [slug]);

  useEffect(() => {
    if (page) document.title = page.title;
  }, [page]);

  if (error) {
    return (
      <main className="max-w-[760px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{error}</h1>
        <Link to="/" className="text-[#0058a3] hover:underline font-medium">Return home</Link>
      </main>
    );
  }

  if (!page) {
    return <main className="max-w-[760px] mx-auto px-4 py-20 text-center text-gray-500">Loading…</main>;
  }

  return (
    <main className="max-w-[760px] mx-auto px-4 py-10" dir={dir}>
      <h1 className="text-[28px] font-bold text-gray-900 mb-5">{page.title}</h1>
      <div className="text-[14px] text-gray-700 leading-[1.9] whitespace-pre-line">{page.content}</div>
    </main>
  );
}
