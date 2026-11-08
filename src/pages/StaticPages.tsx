import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, CheckCircle2, HelpCircle, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function DeliveryPage() {
  return (
    <div className="max-w-[840px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">Delivery and Payment</h1>
      
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00a651]"></div> 
          Delivery Options & Timelines
        </h2>
        <ul className="space-y-4 text-gray-600 text-sm">
          <li className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start pb-4 border-b border-gray-100">
            <div className="font-bold text-gray-900 w-44 flex-shrink-0">Standard Courier</div>
            <div>3–5 business days. FREE on all orders over $50 ($5.99 for orders under $50). Ships nationally via insured courier.</div>
          </li>
          <li className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start pb-4 border-b border-gray-100">
            <div className="font-bold text-gray-900 w-44 flex-shrink-0">Express Priority</div>
            <div>1–2 business days. Priority dispatch with real-time SMS tracking updates. ($9.99 flat rate).</div>
          </li>
          <li className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
            <div className="font-bold text-gray-900 w-44 flex-shrink-0">Same-Day / Next-Day</div>
            <div>Guaranteed delivery within 24 hours for eligible metropolitan regions ($19.99).</div>
          </li>
        </ul>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00a651]"></div> 
          Payment Methods
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          We accept all major credit and debit cards including Visa, Mastercard, and American Express. We also support digital wallets like PayPal, Apple Pay, Google Pay, and Cash on Delivery (COD) across supported regions.
        </p>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100">
          <ShieldCheck className="w-4 h-4 text-[#00a651]" />
          All transactions are secured with 256-bit SSL encryption and fraud protection.
        </div>
      </div>
    </div>
  );
}

export function ReturnsPage() {
  return (
    <div className="max-w-[840px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">Returns & Refunds Policy</h1>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-sm text-gray-600 space-y-5">
        <p className="text-base text-gray-700 leading-relaxed font-medium">
          We want you to be completely satisfied with every order. Enjoy peace of mind with our straightforward 30-day return policy.
        </p>
        <h3 className="text-base font-bold text-gray-900">Return Eligibility Conditions</h3>
        <ul className="list-disc pl-5 space-y-2">
           <li>Items must be returned within 30 days of receiving your package.</li>
           <li>Items must be unused, unworn, unwashed, and in their original packaging.</li>
           <li>Electronics and accessories must have factory seals intact for a full refund.</li>
           <li>Original tags, barcodes, and receipts must accompany the return.</li>
        </ul>
        <h3 className="text-base font-bold text-gray-900">How to Initiate a Return</h3>
        <p className="leading-relaxed">
          Log into your Account dashboard, go to "My Orders", and click "Return Item". You will receive a pre-paid printable shipping label via email within minutes.
        </p>
        <h3 className="text-base font-bold text-gray-900">Refund Processing Time</h3>
        <p className="leading-relaxed">
          Once our fulfillment warehouse inspects the return (typically 24–48 hours), refunds are processed directly back to your original payment method within 3–5 business days.
        </p>
      </div>
    </div>
  );
}

export function StoresPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">Store Locations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center">
           <h2 className="text-2xl font-bold text-gray-900 mb-6">Downtown Flagship Store</h2>
           <div className="space-y-4 text-sm text-gray-600">
             <div className="flex items-start gap-4">
               <MapPin className="text-[#00a651] w-5 h-5 flex-shrink-0 mt-0.5" />
               <div>1234 E-commerce Blvd, Suite 567<br/>New York, NY 10001</div>
             </div>
             <div className="flex items-center gap-4">
               <Phone className="text-[#00a651] w-5 h-5 flex-shrink-0" />
               <div>+1 (917) 722-7425</div>
             </div>
             <div className="flex items-start gap-4">
               <Clock className="text-[#00a651] w-5 h-5 flex-shrink-0 mt-0.5" />
               <div>Mon–Sat: 9:00 AM – 9:00 PM<br/>Sun: 10:00 AM – 6:00 PM</div>
             </div>
           </div>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8 flex flex-col justify-center items-center text-center">
           <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-[#00a651] mb-4">
             <MapPin className="w-8 h-8" />
           </div>
           <h3 className="text-lg font-bold text-gray-900 mb-2">Curbside & In-Store Pickup</h3>
           <p className="text-xs text-gray-600 max-w-xs mb-4">
             Order online and select "Store Pickup" at checkout to grab your order ready in as little as 2 hours!
           </p>
           <span className="px-4 py-1.5 rounded-full bg-[#00a651] text-white text-xs font-bold shadow-sm">
             Open Today
           </span>
        </div>
      </div>
    </div>
  );
}

export function ContactsPage() {
  const { showToast } = useCart();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;
    setSubmitted(true);
    showToast('Message Sent!', 'success', 'Our support team will reply within 24 hours.');
  };

  return (
    <div className="max-w-[840px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">Contact Us</h1>
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
        {submitted ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-emerald-50 text-[#00a651] rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you for reaching out!</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              We received your message and will respond to <span className="font-semibold text-gray-800">{email}</span> shortly.
            </p>
            <button 
              onClick={() => { setSubmitted(false); setMessage(''); }}
              className="text-xs font-bold text-[#00a651] hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">First Name</label>
                 <input 
                   type="text" 
                   value={firstName} 
                   onChange={(e) => setFirstName(e.target.value)} 
                   placeholder="John"
                   className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651] focus:bg-white text-sm" 
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Last Name</label>
                 <input 
                   type="text" 
                   value={lastName} 
                   onChange={(e) => setLastName(e.target.value)} 
                   placeholder="Doe"
                   className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651] focus:bg-white text-sm" 
                 />
               </div>
             </div>
             <div>
               <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Email Address *</label>
               <input 
                 required 
                 type="email" 
                 value={email} 
                 onChange={(e) => setEmail(e.target.value)} 
                 placeholder="john@example.com"
                 className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 outline-none focus:border-[#00a651] focus:bg-white text-sm" 
               />
             </div>
             <div>
               <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Your Message *</label>
               <textarea 
                 required 
                 rows={5}
                 value={message} 
                 onChange={(e) => setMessage(e.target.value)} 
                 placeholder="How can our customer support team assist you today?"
                 className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:border-[#00a651] focus:bg-white text-sm resize-none"
               ></textarea>
             </div>
             <button 
               type="submit"
               className="bg-[#00a651] hover:bg-[#008c44] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-[#00a651]/20 cursor-pointer text-sm"
             >
               Send Message
             </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="max-w-[840px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900 tracking-tight">About Our Store</h1>
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 text-sm text-gray-600 space-y-5 leading-relaxed">
        <p className="text-base text-gray-800 font-medium leading-relaxed">
          Welcome to UniTheme2 E-Commerce Store — your premier destination for authentic technology, premium fashion, lifestyle electronics, and daily essentials.
        </p>
        <p>
          Founded with a passion for quality and design, our mission is to deliver an unmatched shopping experience combining lightning-fast delivery, dedicated customer care, and guaranteed 100% genuine products with manufacturer warranties.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-center">
            <span className="text-2xl font-black text-[#00a651]">50K+</span>
            <p className="text-xs font-semibold text-gray-700 mt-1">Happy Customers</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-center">
            <span className="text-2xl font-black text-[#00a651]">100%</span>
            <p className="text-xs font-semibold text-gray-700 mt-1">Genuine Quality</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-center">
            <span className="text-2xl font-black text-[#00a651]">24/7</span>
            <p className="text-xs font-semibold text-gray-700 mt-1">Dedicated Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQPage() {
  const faqs = [
    {
      q: 'How long does delivery take?',
      a: 'Standard courier delivery takes 3 to 5 business days. Express shipping delivers within 1 to 2 business days.'
    },
    {
      q: 'Can I pay with Cash on Delivery (COD)?',
      a: 'Yes, Cash on Delivery is available across most zip codes during checkout with zero hidden fees.'
    },
    {
      q: 'How do I return an item?',
      a: 'Log into your account, find the order in "My Orders", and request a return. We provide a prepaid shipping label for eligible 30-day returns.'
    },
    {
      q: 'Are all products authentic?',
      a: 'Yes, 100% of our products are brand new, original, and sourced directly from certified authorized distributors.'
    },
    {
      q: 'How can I track my package?',
      a: 'Go to the "Track Order" link in the header or footer and enter your Order ID to see real-time updates.'
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="max-w-[840px] mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-[#00a651]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#00a651]">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-500 text-sm">Quick answers to common questions about orders, shipping, and returns.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 divide-y divide-gray-100">
        {faqs.map((faq, idx) => (
          <div key={idx} className="py-4 first:pt-0 last:pb-0">
            <button 
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full flex items-center justify-between text-left font-bold text-gray-900 text-base py-1 cursor-pointer group"
            >
              <span className="group-hover:text-[#00a651] transition-colors">{faq.q}</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openIdx === idx ? 'rotate-180 text-[#00a651]' : ''}`} />
            </button>
            {openIdx === idx && (
              <p className="text-sm text-gray-600 mt-2.5 leading-relaxed animate-in fade-in duration-200">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="max-w-[840px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900 tracking-tight">Terms and Conditions</h1>
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 text-sm text-gray-600 space-y-4 leading-relaxed">
        <p>By using this website, you agree to these standard terms of sale, privacy principles, and site usage policies.</p>
        <h3 className="text-base font-bold text-gray-900 pt-2">Pricing and Product Availability</h3>
        <p>All prices are listed in the selected storefront currency and include applicable sales taxes where noted. We reserve the right to correct pricing errors and update stock levels in real time.</p>
        <h3 className="text-base font-bold text-gray-900 pt-2">Warranty and Liability</h3>
        <p>Products are covered under their manufacturer warranty periods. UniTheme2 is committed to helping customers resolve service claims smoothly.</p>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="max-w-[840px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900 tracking-tight">Privacy Policy</h1>
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 text-sm text-gray-600 space-y-4 leading-relaxed">
        <p>Your privacy is paramount to us. We never sell, rent, or trade your personal data to third parties.</p>
        <h3 className="text-base font-bold text-gray-900 pt-2">Information We Collect</h3>
        <p>We only collect the essential information needed to fulfill your purchases: shipping address, contact phone, email for order receipts, and payment tokenization.</p>
        <h3 className="text-base font-bold text-gray-900 pt-2">Security Measures</h3>
        <p>All sensitive payment credentials are encrypted using industry-standard SSL protocols and processed through PCI-DSS compliant providers.</p>
      </div>
    </div>
  );
}
