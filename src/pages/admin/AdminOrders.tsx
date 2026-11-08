import React, { useState } from 'react';
import { Eye, Search, Filter, ArrowDownToLine, MoreHorizontal, CheckCircle, Clock, XCircle, Truck, Check, X, MapPin, Phone, Mail, Package, Printer, Download, CreditCard, Calendar } from 'lucide-react';
import { Tooltip } from '../../components/Tooltip';
import { useAdmin } from '../../context/AdminContext';

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'details' | 'invoice'>('details');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"><CheckCircle size={12} /> Delivered</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200"><Clock size={12} /> Processing</span>;
      case 'shipped':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><Truck size={12} /> Shipped</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    (o.customer || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-full aspect-auto h-full">
       <div className="px-8 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Orders Management</h2>
            <p className="text-sm text-gray-500 mt-1">View and manage customer orders.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00a651]/20 focus:border-[#00a651] transition-all"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </div>
             <Tooltip content="Filter" position="top">
               <button className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  <Filter size={18} />
               </button>
             </Tooltip>
             <Tooltip content="Export CSV" position="top">
               <button className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  <ArrowDownToLine size={18} />
               </button>
             </Tooltip>
          </div>
       </div>

       <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                   <th className="px-8 py-4 font-bold">Order ID</th>
                   <th className="px-6 py-4 font-bold">Date</th>
                   <th className="px-6 py-4 font-bold">Customer</th>
                   <th className="px-6 py-4 font-bold">Status</th>
                   <th className="px-6 py-4 font-bold">Total</th>
                   <th className="px-8 py-4 font-bold text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 text-sm">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                       <td className="px-8 py-4 font-mono font-medium text-[#00a651]">{order.id}</td>
                       <td className="px-6 py-4 text-gray-500">{order.date}</td>
                       <td className="px-6 py-4">
                         <div className="font-medium text-gray-900">{order.customer}</div>
                         <div className="text-xs text-gray-500 mt-0.5">{order.email}</div>
                       </td>
                       <td className="px-6 py-4">
                         {getStatusBadge(order.status)}
                       </td>
                       <td className="px-6 py-4 font-medium text-gray-900">
                         {typeof order.total === 'number' ? `$${order.total.toFixed(2)}` : order.total}
                         <div className="text-xs text-gray-500 font-normal">{Array.isArray(order.items) ? order.items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) : order.items} items</div>
                       </td>
                       <td className="px-8 py-4 text-right">
                          <div className={`flex items-center justify-end gap-2 transition-opacity ${activeDropdown === order.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                             {order.status === 'processing' && (
                               <Tooltip content="Mark as Shipped" position="top">
                                 <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="p-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm bg-white">
                                   <Truck size={16} />
                                 </button>
                               </Tooltip>
                             )}
                             {order.status === 'shipped' && (
                               <Tooltip content="Mark as Delivered" position="top">
                                 <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="p-2 border border-green-200 text-green-600 hover:bg-green-50 rounded-lg transition-colors shadow-sm bg-white">
                                   <Check size={16} />
                                 </button>
                               </Tooltip>
                             )}
                             <Tooltip content="View Details" position="top">
                               <button onClick={() => { setSelectedOrder(order); setViewMode('details'); }} className="p-2 border border-gray-200 text-gray-600 hover:text-[#00a651] hover:bg-[#00a651]/10 hover:border-[#00a651]/30 rounded-lg transition-colors shadow-sm bg-white">
                                 <Eye size={16} />
                               </button>
                             </Tooltip>
                             <Tooltip content="More actions" position="top">
                               <div className="relative">
                                 <button onClick={() => setActiveDropdown(activeDropdown === order.id ? null : order.id)} className="p-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors shadow-sm bg-white">
                                   <MoreHorizontal size={16} />
                                 </button>
                                 {activeDropdown === order.id && (
                                   <>
                                     <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)}></div>
                                     <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] z-50 py-2 text-left text-gray-700">
                                       <button onClick={() => { setSelectedOrder(order); setViewMode('invoice'); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                         <Printer size={14} /> View Invoice
                                       </button>
                                       <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                       <button onClick={() => { updateOrderStatus(order.id, 'processing'); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                         <Clock size={14} /> Mark as Processing
                                       </button>
                                       <button onClick={() => { updateOrderStatus(order.id, 'shipped'); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                         <Truck size={14} /> Mark as Shipped
                                       </button>
                                       <button onClick={() => { updateOrderStatus(order.id, 'delivered'); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                         <CheckCircle size={14} /> Mark as Delivered
                                       </button>
                                       <button onClick={() => { updateOrderStatus(order.id, 'cancelled'); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                         <XCircle size={14} /> Cancel Order
                                       </button>
                                     </div>
                                   </>
                                 )}
                               </div>
                             </Tooltip>
                          </div>
                       </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-gray-500">
                      No orders found matching "{search}"
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
       </div>
       <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
             Showing <span className="font-medium text-gray-900">{filteredOrders.length}</span> results
          </div>
          <div className="flex items-center gap-2">
             <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50">Previous</button>
             <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50">Next</button>
          </div>
       </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Order {selectedOrder.id}</h2>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                
                <div className="hidden sm:flex bg-gray-200/50 p-1 rounded-lg">
                  <button 
                    onClick={() => setViewMode('details')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'details' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Details
                  </button>
                  <button 
                    onClick={() => setViewMode('invoice')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${viewMode === 'invoice' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Printer size={14} /> Invoice
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 relative">
              {viewMode === 'details' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Order Items & Details */}
                  <div className="lg:col-span-2 space-y-8">
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                         <Package className="w-5 h-5 text-gray-400" /> Items Ordered
                      </h3>
                      <div className="bg-white border text-sm border-gray-200 rounded-2xl overflow-hidden">
                         <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                               <tr>
                                  <th className="px-5 py-3 font-medium">Product</th>
                                  <th className="px-5 py-3 font-medium">Price</th>
                                  <th className="px-5 py-3 font-medium text-center">Qty</th>
                                  <th className="px-5 py-3 font-medium text-right">Total</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                               {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                                 selectedOrder.items.map((item: any, i: number) => (
                                   <tr key={i}>
                                      <td className="px-5 py-4">
                                         <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg p-1 flex-shrink-0">
                                              {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                                              ) : (
                                                <div className="w-full h-full bg-gray-100 rounded" />
                                              )}
                                            </div>
                                            <div className="font-medium text-gray-900 line-clamp-2">{item.title || 'Unknown Product'}</div>
                                         </div>
                                      </td>
                                      <td className="px-5 py-4 text-gray-500">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</td>
                                      <td className="px-5 py-4 text-center font-medium bg-gray-50/50">{item.quantity || 1}</td>
                                      <td className="px-5 py-4 text-right font-medium text-gray-900">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                                   </tr>
                                 ))
                               ) : (
                                 <tr>
                                    <td colSpan={4} className="px-5 py-8 text-center text-gray-500">No items recorded for this order (legacy data).</td>
                                 </tr>
                               )}
                            </tbody>
                         </table>
                      </div>
                    </section>

                    <section className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                       <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                       <div className="space-y-3 text-sm">
                          <div className="flex justify-between text-gray-600">
                             <span>Subtotal</span>
                             <span>{typeof selectedOrder.total === 'number' ? `$${selectedOrder.total.toFixed(2)}` : selectedOrder.total}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                             <span>Shipping</span>
                             <span className="text-[#00a651] font-medium">Free</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                             <span>Tax</span>
                             <span>$0.00</span>
                          </div>
                          <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between font-bold text-base text-gray-900">
                             <span>Total</span>
                             <span className="text-[#00a651]">{typeof selectedOrder.total === 'number' ? `$${selectedOrder.total.toFixed(2)}` : selectedOrder.total}</span>
                          </div>
                       </div>
                    </section>
                  </div>

                  {/* Right Column - Customer Info & Actions */}
                  <div className="space-y-6">
                    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                       <h3 className="font-bold text-gray-900 mb-4">Customer Info</h3>
                       <div className="space-y-4 text-sm">
                          <div className="flex items-start gap-3">
                             <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                                {selectedOrder.customer.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                <div className="font-medium text-gray-900">{selectedOrder.customer}</div>
                                <div className="text-gray-500 mt-1 flex items-center gap-1.5"><Mail size={14}/> {selectedOrder.email}</div>
                                <div className="text-gray-500 mt-1 flex items-center gap-1.5"><Phone size={14}/> {selectedOrder.phone || '+1 (555) 000-0000'}</div>
                             </div>
                          </div>

                          {selectedOrder.shippingAddress && (
                             <>
                                <div className="h-px bg-gray-100 my-4" />
                                <div>
                                   <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</div>
                                   <div className="text-gray-700 flex gap-2">
                                      <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                      <div>
                                         {selectedOrder.shippingAddress.address}<br/>
                                         {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zip}
                                      </div>
                                   </div>
                                </div>
                             </>
                          )}
                       </div>
                    </section>

                    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                       <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><CreditCard size={16}/> Payment & Status</h3>
                       <div className="space-y-4 text-sm">
                          <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Method</div>
                            <div className="font-medium text-gray-900">{selectedOrder.paymentMethod || 'Credit Card (Stripe)'}</div>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Date</div>
                            <div className="font-medium text-gray-900 flex items-center gap-1.5"><Calendar size={14}/> {selectedOrder.date}</div>
                          </div>
                          <div className="pt-2 border-t border-gray-100">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Update Status</label>
                            <select 
                               value={selectedOrder.status}
                               onChange={(e) => {
                                  updateOrderStatus(selectedOrder.id, e.target.value);
                                  setSelectedOrder({ ...selectedOrder, status: e.target.value });
                               }}
                               className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#00a651] outline-none transition-all"
                            >
                               <option value="processing">Processing</option>
                               <option value="shipped">Shipped</option>
                               <option value="delivered">Delivered</option>
                               <option value="cancelled">Cancelled</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">Changing status may trigger customer notification emails.</p>
                          </div>
                       </div>
                    </section>

                    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                       <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock size={16}/> Order History</h3>
                       <div className="relative pl-4 space-y-5 before:absolute before:inset-y-2 before:left-[7px] before:w-px before:bg-gray-200">
                          <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-gray-300"></div>
                            <div className="text-sm font-medium text-gray-900">Order Placed</div>
                            <div className="text-xs text-gray-500">{selectedOrder.date}</div>
                          </div>
                          {(selectedOrder.status === 'processing' || selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                            <div className="relative">
                              <div className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#00a651]"></div>
                              <div className="text-sm font-medium text-gray-900">Payment Confirmed</div>
                              <div className="text-xs text-gray-500">System processed payment</div>
                            </div>
                          )}
                          {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                            <div className="relative">
                              <div className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-500"></div>
                              <div className="text-sm font-medium text-gray-900">Order Shipped</div>
                              <div className="text-xs text-gray-500">Package handed to courier</div>
                            </div>
                          )}
                          {selectedOrder.status === 'delivered' && (
                            <div className="relative">
                              <div className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-green-500"></div>
                              <div className="text-sm font-medium text-gray-900">Order Delivered</div>
                              <div className="text-xs text-gray-500">Package arrived at destination</div>
                            </div>
                          )}
                          {selectedOrder.status === 'cancelled' && (
                            <div className="relative">
                              <div className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-red-500"></div>
                              <div className="text-sm font-medium text-red-600">Order Cancelled</div>
                              <div className="text-xs text-gray-500">Order was cancelled</div>
                            </div>
                          )}
                       </div>
                    </section>
                  </div>
                </div>
              ) : (
                <div className="bg-white border text-sm border-gray-200 rounded-2xl p-10 max-w-3xl mx-auto shadow-sm" id="invoiceArea">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
                    <div>
                      <h1 className="text-3xl font-extrabold text-[#00a651] tracking-tight">INVOICE</h1>
                      <div className="mt-2 text-gray-500">Receipt / Proof of Purchase</div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="font-bold text-gray-900 mb-1">Store Name</div>
                      <div>123 Business Road</div>
                      <div>City, State 12345</div>
                      <div>support@store.com</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</div>
                      <div className="font-bold text-gray-900 text-lg">{selectedOrder.customer}</div>
                      <div className="text-gray-600 mt-1">{selectedOrder.email}</div>
                      {selectedOrder.shippingAddress && (
                         <div className="text-gray-600 mt-1">
                           {selectedOrder.shippingAddress.address}<br/>
                           {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zip}
                         </div>
                      )}
                    </div>
                    <div className="text-right">
                       <div className="flex gap-8 justify-end text-sm">
                         <div className="text-right">
                           <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Invoice No.</div>
                           <div className="font-bold text-gray-900">{selectedOrder.id}</div>
                         </div>
                         <div className="text-right">
                           <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Invoice Date</div>
                           <div className="font-bold text-gray-900">{selectedOrder.date}</div>
                         </div>
                       </div>
                    </div>
                  </div>

                  <table className="w-full text-left mb-8">
                    <thead className="border-b border-gray-200">
                      <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-3">Item Description</th>
                        <th className="py-3 text-center">Qty</th>
                        <th className="py-3 text-right">Price</th>
                        <th className="py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item: any, i: number) => (
                          <tr key={i}>
                             <td className="py-4 font-medium text-gray-900">{item.title || 'Unknown Product'}</td>
                             <td className="py-4 text-center text-gray-600">{item.quantity || 1}</td>
                             <td className="py-4 text-right text-gray-600">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</td>
                             <td className="py-4 text-right font-medium text-gray-900">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                           <td colSpan={4} className="py-4 text-center text-gray-500">No items found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="flex justify-end border-t border-gray-200 pt-6">
                    <div className="w-64 space-y-3">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{typeof selectedOrder.total === 'number' ? `$${selectedOrder.total.toFixed(2)}` : selectedOrder.total}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span>$0.00</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                        <span>Total Due</span>
                        <span>{typeof selectedOrder.total === 'number' ? `$${selectedOrder.total.toFixed(2)}` : selectedOrder.total}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-500 text-center">
                    Thank you for your business. For any questions concerning this invoice, please contact support@store.com.
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              {viewMode === 'invoice' && (
                <button 
                  onClick={() => {
                     // In a real app we'd use react-to-print or window.print with a print stylesheet
                     alert('In a real app, this would trigger window.print() focusing on the invoice element.');
                  }}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Download size={16} /> Download PDF
                </button>
              )}
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-xl font-bold text-sm hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
