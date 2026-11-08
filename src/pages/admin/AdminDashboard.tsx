import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { 
  Package, Menu, FileText, Image, DollarSign, Users, ShoppingCart, 
  TrendingUp, TrendingDown, MoreVertical, ArrowRight, Settings, ExternalLink, 
  Download, Eye, Printer, X, Check, Truck, Clock, CheckCircle2, 
  AlertTriangle, RefreshCw, Plus, ChevronDown, Filter, Layers, 
  ArrowUpRight, Sparkles, CreditCard, MapPin, Mail, Phone, Calendar,
  Tag, Percent, ShieldCheck, Send, Compass, BarChart2, CheckCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { Tooltip as UiTooltip } from '../../components/Tooltip';

const PIE_COLORS = ['#00a651', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

type DateRange = 'today' | '7d' | '30d' | 'quarter' | 'ytd';
type MetricView = 'sales' | 'orders' | 'aov' | 'margin';
type ChartType = 'area' | 'bar';
type SecondaryView = 'funnel' | 'payments' | 'categories';

export default function AdminDashboard() {
  const { 
    products, 
    orders, 
    updateOrderStatus, 
    restockProduct, 
    simulateNewOrder,
    coupons = [],
    addCoupon,
    toggleCoupon,
    fulfillOrder,
    addProduct,
    addOrder
  } = useAdmin();

  // Control states
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [metricView, setMetricView] = useState<MetricView>('sales');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [secondaryView, setSecondaryView] = useState<SecondaryView>('funnel');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  
  // Modals & Panels state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [invoiceMode, setInvoiceMode] = useState<boolean>(false);
  const [fulfillModalOrder, setFulfillModalOrder] = useState<any | null>(null);
  const [carrier, setCarrier] = useState<string>('FedEx Express');
  const [trackingNumber, setTrackingNumber] = useState<string>('');

  // Creation Modals
  const [showNewOrderModal, setShowNewOrderModal] = useState<boolean>(false);
  const [showNewCouponModal, setShowNewCouponModal] = useState<boolean>(false);
  const [showRestockModal, setShowRestockModal] = useState<any | null>(null);
  const [customRestockQty, setCustomRestockQty] = useState<number>(25);

  // Form states for manual order creation
  const [newOrderForm, setNewOrderForm] = useState({
    customer: 'Alexander Wright',
    email: 'a.wright@example.com',
    phone: '+1 (555) 789-4321',
    address: '500 Madison Ave, New York, NY 10022',
    productId: products[0]?.id || 1,
    quantity: 1,
    paymentMethod: 'Credit Card (Visa •••• 9821)'
  });

  // Form states for coupon creation
  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    discount: 20,
    type: 'percentage' as 'percentage' | 'fixed',
    minSpend: 50
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamic calculations based on orders and date range
  const metrics = useMemo(() => {
    let multiplier = 1;
    let label = 'vs prior 7 days';
    if (dateRange === 'today') { multiplier = 0.22; label = 'vs yesterday'; }
    else if (dateRange === '7d') { multiplier = 1; label = 'vs prior 7 days'; }
    else if (dateRange === '30d') { multiplier = 3.6; label = 'vs prior 30 days'; }
    else if (dateRange === 'quarter') multiplier = 8.5;
    else { multiplier = 14.2; label = 'vs prior year'; }

    const baseRevenue = orders.reduce((acc: number, order: any) => {
      if (typeof order.total === 'number') return acc + order.total;
      const numString = (order.total || '0').toString().replace(/[^0-9.-]+/g, "");
      return acc + (parseFloat(numString) || 0);
    }, 0);

    const calculatedRevenue = baseRevenue * (dateRange === '7d' ? 1 : multiplier);
    const calculatedOrders = Math.max(1, Math.round(orders.length * (dateRange === '7d' ? 1 : (multiplier * 0.9))));
    const aov = calculatedOrders > 0 ? (calculatedRevenue / calculatedOrders) : 0;
    const visitors = Math.round(12431 * multiplier);
    const conversionRate = calculatedOrders > 0 && visitors > 0 ? ((calculatedOrders / visitors) * 100 * 2.8).toFixed(2) : '3.42';

    // Low stock items count
    const lowStockItems = products.filter((p: any) => {
      const stock = p.stockQuantity ?? (p.inStock ? 8 : 0);
      return !p.inStock || stock <= 5;
    });

    // Unfulfilled orders
    const unfulfilledOrders = orders.filter((o: any) => o.status === 'processing');

    return {
      revenue: calculatedRevenue,
      netSales: calculatedRevenue * 0.94,
      ordersCount: calculatedOrders,
      aov: aov,
      visitors: visitors,
      conversionRate: `${conversionRate}%`,
      cartAbandonment: '64.8%',
      returningCustomerRate: '34.2%',
      grossMargin: '68.5%',
      lowStockItems: lowStockItems,
      unfulfilledOrders: unfulfilledOrders,
      activeProducts: products.length,
      timeLabel: label
    };
  }, [orders, products, dateRange]);

  // Dynamic Chart series matching date range
  const salesVelocityData = useMemo(() => {
    if (dateRange === 'today') {
      return [
        { name: '08:00', sales: 240, orders: 1, aov: 240, margin: 70 },
        { name: '10:00', sales: 580, orders: 2, aov: 290, margin: 68 },
        { name: '12:00', sales: 940, orders: 3, aov: 313, margin: 69 },
        { name: '14:00', sales: 1420, orders: 4, aov: 355, margin: 67 },
        { name: '16:00', sales: 2100, orders: 6, aov: 350, margin: 71 },
        { name: '18:00', sales: 2850, orders: 8, aov: 356, margin: 68 },
        { name: '20:00', sales: metrics.revenue > 3000 ? 3450 : 2900, orders: 9, aov: 383, margin: 69 },
      ];
    } else if (dateRange === '7d') {
      return [
        { name: 'Mon', sales: 1450, orders: 4, aov: 362, margin: 67 },
        { name: 'Tue', sales: 2320, orders: 7, aov: 331, margin: 69 },
        { name: 'Wed', sales: 1980, orders: 5, aov: 396, margin: 68 },
        { name: 'Thu', sales: 2840, orders: 8, aov: 355, margin: 70 },
        { name: 'Fri', sales: 3420, orders: 11, aov: 310, margin: 68 },
        { name: 'Sat', sales: 4190, orders: 14, aov: 299, margin: 71 },
        { name: 'Sun', sales: metrics.revenue > 6000 ? 5400 : 3940, orders: 12, aov: 328, margin: 69 },
      ];
    } else if (dateRange === '30d') {
      return [
        { name: 'Week 1', sales: 9800, orders: 28, aov: 350, margin: 68 },
        { name: 'Week 2', sales: 12400, orders: 36, aov: 344, margin: 69 },
        { name: 'Week 3', sales: 14100, orders: 42, aov: 335, margin: 67 },
        { name: 'Week 4', sales: 18250, orders: 51, aov: 357, margin: 70 },
      ];
    } else {
      return [
        { name: 'Jan', sales: 28400, orders: 82, aov: 346, margin: 68 },
        { name: 'Feb', sales: 32100, orders: 94, aov: 341, margin: 67 },
        { name: 'Mar', sales: 39800, orders: 112, aov: 355, margin: 70 },
        { name: 'Apr', sales: 44200, orders: 128, aov: 345, margin: 69 },
        { name: 'May', sales: 49800, orders: 145, aov: 343, margin: 68 },
        { name: 'Jun', sales: 54600, orders: 162, aov: 337, margin: 71 },
      ];
    }
  }, [dateRange, metrics.revenue]);

  // Payment Breakdown
  const paymentBreakdownData = [
    { name: 'Credit Cards (Visa/MC)', value: 58, amount: '$19,840' },
    { name: 'Apple Pay & Google Pay', value: 24, amount: '$8,210' },
    { name: 'PayPal Express', value: 12, amount: '$4,100' },
    { name: 'Cash on Delivery (COD)', value: 6, amount: '$2,050' },
  ];

  // Category breakdown
  const categorySalesData = [
    { name: 'Smartphones & Tech', value: 42, amount: '$14,280' },
    { name: 'Wearables & Audio', value: 28, amount: '$9,520' },
    { name: 'Gaming Consoles', value: 18, amount: '$6,120' },
    { name: 'Apparel & Style', value: 12, amount: '$4,080' },
  ];

  // E-Commerce Conversion Funnel Stages
  const conversionFunnel = [
    { stage: 'Online Store Sessions', count: metrics.visitors, pct: '100%' },
    { stage: 'Viewed Product Details', count: Math.round(metrics.visitors * 0.72), pct: '72.0%' },
    { stage: 'Added Items to Cart', count: Math.round(metrics.visitors * 0.27), pct: '27.0%' },
    { stage: 'Reached Checkout Flow', count: Math.round(metrics.visitors * 0.12), pct: '12.0%' },
    { stage: 'Orders Completed', count: metrics.ordersCount, pct: metrics.conversionRate },
  ];

  // Top selling products list
  const topProducts = useMemo(() => {
    return products.slice(0, 4).map((p: any, idx: number) => {
      const sales = [48, 36, 29, 21][idx] || 15;
      const stock = p.stockQuantity ?? (p.inStock ? (idx === 0 ? 3 : 24) : 0);
      return {
        ...p,
        unitsSold: sales,
        revenue: sales * (p.price || 99),
        stock: stock,
        isLow: stock <= 5
      };
    });
  }, [products]);

  // Filtered orders list for Recent Orders table
  const recentOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders.slice(0, 6);
    return orders.filter((o: any) => o.status === orderStatusFilter).slice(0, 6);
  }, [orders, orderStatusFilter]);

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} strokeWidth={2.5} /> Delivered
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} strokeWidth={2.5} /> Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck size={12} strokeWidth={2.5} /> Shipped
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <X size={12} strokeWidth={2.5} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  // CSV Report Generator
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Payment Method', 'Carrier', 'Tracking', 'Items Count', 'Status', 'Total ($)'];
    const rows = orders.map((o: any) => [
      o.id,
      o.date,
      `"${o.customer || ''}"`,
      `"${o.email || ''}"`,
      `"${o.paymentMethod || 'Credit Card'}"`,
      `"${o.carrier || 'Standard'}"`,
      `"${o.trackingNumber || 'N/A'}"`,
      Array.isArray(o.items) ? o.items.length : 1,
      o.status,
      typeof o.total === 'number' ? o.total.toFixed(2) : o.total
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `megastore-financial-report-${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Financial & sales CSV exported successfully!');
  };

  const handleRestockSubmit = () => {
    if (!showRestockModal) return;
    restockProduct(showRestockModal.id, customRestockQty);
    triggerToast(`Added +${customRestockQty} units to "${showRestockModal.title}" inventory!`);
    setShowRestockModal(null);
  };

  const handleFulfillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fulfillModalOrder) return;
    fulfillOrder(fulfillModalOrder.id, carrier, trackingNumber);
    triggerToast(`Order #${fulfillModalOrder.id} fulfilled via ${carrier}!`);
    setFulfillModalOrder(null);
    setTrackingNumber('');
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p: any) => p.id === Number(newOrderForm.productId)) || products[0];
    const total = (prod.price || 99) * newOrderForm.quantity;

    addOrder({
      customer: newOrderForm.customer,
      email: newOrderForm.email,
      phone: newOrderForm.phone,
      shippingAddress: newOrderForm.address,
      paymentMethod: newOrderForm.paymentMethod,
      total: total,
      status: 'processing',
      items: [
        {
          id: prod.id,
          title: prod.title,
          price: prod.price,
          quantity: newOrderForm.quantity,
          image: prod.image
        }
      ]
    });

    setShowNewOrderModal(false);
    triggerToast(`New manual order created for ${newOrderForm.customer} ($${total.toFixed(2)})!`);
  };

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponForm.code.trim()) return;

    addCoupon({
      code: newCouponForm.code.trim().toUpperCase(),
      discount: Number(newCouponForm.discount),
      type: newCouponForm.type,
      minSpend: Number(newCouponForm.minSpend),
      uses: 0,
      active: true
    });

    setShowNewCouponModal(false);
    setNewCouponForm({ code: '', discount: 20, type: 'percentage', minSpend: 50 });
    triggerToast(`Coupon "${newCouponForm.code.toUpperCase()}" published and active!`);
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto w-full font-sans pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800 animate-in fade-in duration-200">
          <div className="w-7 h-7 rounded-full bg-[#00a651] text-white flex items-center justify-center font-bold">✓</div>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Executive Command Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Executive Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Operations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Multichannel commerce analytics, live fulfillment pipeline, and inventory governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200/70 text-xs font-semibold">
            <button
              onClick={() => setDateRange('today')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${dateRange === 'today' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${dateRange === '7d' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${dateRange === '30d' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('quarter')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${dateRange === 'quarter' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Quarter
            </button>
            <button
              onClick={() => setDateRange('ytd')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${dateRange === 'ytd' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
            >
              YTD
            </button>
          </div>

          {/* Quick Action Buttons */}
          <UiTooltip content="Manually create a new customer order" position="bottom">
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="px-3.5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold text-xs hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} strokeWidth={2.5} /> Create Order
            </button>
          </UiTooltip>

          <UiTooltip content="Create a promotional discount coupon" position="bottom">
            <button
              onClick={() => setShowNewCouponModal(true)}
              className="px-3.5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold text-xs hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Tag size={15} /> Add Coupon
            </button>
          </UiTooltip>

          <UiTooltip content="Export comprehensive commercial audit CSV" position="bottom">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold text-xs hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={15} /> Export CSV
            </button>
          </UiTooltip>

          <UiTooltip content="Simulate real-time order arrival event" position="bottom">
            <button
              onClick={() => {
                simulateNewOrder();
                triggerToast('Simulated incoming order registered!');
              }}
              className="px-3.5 py-2.5 bg-[#00a651] text-white rounded-2xl font-bold text-xs hover:bg-[#008c44] transition-all shadow-xs shadow-[#00a651]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={15} /> Test Live Event
            </button>
          </UiTooltip>

          <Link
            to="/"
            target="_blank"
            className="px-3.5 py-2.5 bg-gray-900 text-white rounded-2xl font-bold text-xs hover:bg-gray-800 transition-all shadow-xs flex items-center gap-1.5"
          >
            Storefront <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* Shopify / Amazon Style "Needs Your Attention" Action Center */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <Compass size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Operations Action Center</h2>
              <p className="text-xs text-gray-300 mt-0.5">Key fulfillment and inventory tasks requiring merchant attention today.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Action 1: Unfulfilled Orders */}
            <div className="bg-white/10 px-3.5 py-2 rounded-2xl flex items-center gap-2.5 text-xs border border-white/10">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-semibold text-gray-200">
                <strong className="text-white font-black">{metrics.unfulfilledOrders.length} Orders</strong> awaiting dispatch
              </span>
              {metrics.unfulfilledOrders.length > 0 && (
                <button
                  onClick={() => {
                    const first = metrics.unfulfilledOrders[0];
                    setFulfillModalOrder(first);
                    setTrackingNumber(`FX-${Math.floor(100000000 + Math.random() * 900000000)}`);
                  }}
                  className="bg-amber-400 text-gray-900 font-bold px-2.5 py-1 rounded-xl text-[11px] hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  Fulfill Next
                </button>
              )}
            </div>

            {/* Action 2: Low Stock Alert */}
            <div className="bg-white/10 px-3.5 py-2 rounded-2xl flex items-center gap-2.5 text-xs border border-white/10">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span className="font-semibold text-gray-200">
                <strong className="text-white font-black">{metrics.lowStockItems.length} SKUs</strong> at stock risk
              </span>
              {metrics.lowStockItems.length > 0 && (
                <button
                  onClick={() => {
                    metrics.lowStockItems.forEach((p: any) => restockProduct(p.id, 20));
                    triggerToast('Replenished +20 units to all low stock SKUs!');
                  }}
                  className="bg-white text-gray-900 font-bold px-2.5 py-1 rounded-xl text-[11px] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Restock All (+20)
                </button>
              )}
            </div>

            {/* Action 3: Abandoned Carts Recovery */}
            <div className="bg-white/10 px-3.5 py-2 rounded-2xl flex items-center gap-2.5 text-xs border border-white/10">
              <span className="font-semibold text-gray-200">
                <strong className="text-white font-black">64.8%</strong> Abandonment
              </span>
              <button
                onClick={() => triggerToast('Automated abandoned cart recovery email sent to 14 customers!')}
                className="bg-blue-400 text-gray-900 font-bold px-2.5 py-1 rounded-xl text-[11px] hover:bg-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Send size={11} /> Send Recovery
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 8 World-Class E-Commerce KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Gross Sales */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00a651]/10 text-[#00a651] flex items-center justify-center">
              <DollarSign size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-green-50 text-green-700 flex items-center gap-0.5">
              <TrendingUp size={11} strokeWidth={3} /> +14.2%
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">
              ${metrics.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">Total Gross Sales</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Net Sales: ${metrics.netSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span>{metrics.timeLabel}</span>
          </div>
        </div>

        {/* Card 2: Orders Count */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 flex items-center gap-0.5">
              <TrendingUp size={11} strokeWidth={3} /> +8.6%
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">
              {metrics.ordersCount}
            </h3>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">Total Orders Placed</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span className="text-amber-600 font-semibold">{metrics.unfulfilledOrders.length} unfulfilled</span>
            <span>{orders.filter((o: any) => o.status === 'delivered').length} delivered</span>
          </div>
        </div>

        {/* Card 3: Average Order Value */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 flex items-center gap-0.5">
              <TrendingUp size={11} strokeWidth={3} /> +5.1%
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">
              ${metrics.aov.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">Average Order Value (AOV)</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>High Basket Margin</span>
            <span className="text-emerald-600 font-bold">{metrics.grossMargin} margin</span>
          </div>
        </div>

        {/* Card 4: Store Conversion Rate */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 flex items-center gap-0.5">
              <TrendingUp size={11} strokeWidth={3} /> +0.9%
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">
              {metrics.conversionRate}
            </h3>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">Checkout Conversion Rate</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>{metrics.visitors.toLocaleString()} sessions</span>
            <span className="font-bold text-gray-700">Top 10% tier</span>
          </div>
        </div>

        {/* Card 5: Cart Abandonment */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShoppingCart size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 flex items-center gap-0.5">
              <TrendingDown size={11} strokeWidth={3} /> -2.4%
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">
              {metrics.cartAbandonment}
            </h3>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">Cart Abandonment Rate</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Recovered: $1,420</span>
            <span className="text-blue-600 font-semibold cursor-pointer" onClick={() => triggerToast('Automated recovery workflows active.')}>Automated</span>
          </div>
        </div>

        {/* Card 6: Returning Customer Rate */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 flex items-center gap-0.5">
              <TrendingUp size={11} strokeWidth={3} /> +3.8%
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">
              {metrics.returningCustomerRate}
            </h3>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">Repeat Customer Rate</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Customer LTV: $840</span>
            <span className="font-semibold text-gray-700">Loyalty active</span>
          </div>
        </div>

        {/* Card 7: Low Stock Risk */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${metrics.lowStockItems.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
              <AlertTriangle size={20} strokeWidth={2.5} />
            </div>
            {metrics.lowStockItems.length > 0 ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700">
                Action required
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-green-50 text-green-700">
                Healthy
              </span>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">
              {metrics.lowStockItems.length}
            </h3>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">Low Stock Products</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-amber-600 font-medium flex items-center justify-between">
            <a href="#inventory-section" className="hover:underline">View warehouse list →</a>
            <span>&lt; 5 units</span>
          </div>
        </div>

        {/* Card 8: Active Promo Coupons */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Tag size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-orange-50 text-orange-700">
              Live
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">
              {coupons.filter((c: any) => c.active).length}
            </h3>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">Active Promotion Codes</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Redeemed: {coupons.reduce((acc: number, c: any) => acc + (c.uses || 0), 0)} times</span>
            <a href="#promotions-section" className="text-orange-600 font-bold hover:underline">Manage</a>
          </div>
        </div>
      </div>

      {/* Dual Analytics & Conversion Studio Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Sales Trend Chart */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8 flex flex-col min-h-[460px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Commercial Velocity & Sales Trend</h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600">
                  {dateRange.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Dynamic revenue timeline with granular transaction points and margin indexing.
              </p>
            </div>

            {/* Metric Switcher & Chart Type */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200/70 text-xs font-semibold">
                <button
                  onClick={() => setMetricView('sales')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${metricView === 'sales' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Sales ($)
                </button>
                <button
                  onClick={() => setMetricView('orders')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${metricView === 'orders' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Orders (#)
                </button>
                <button
                  onClick={() => setMetricView('aov')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${metricView === 'aov' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  AOV ($)
                </button>
              </div>

              <div className="flex items-center bg-gray-100 p-1 rounded-2xl text-xs font-semibold">
                <button
                  onClick={() => setChartType('area')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${chartType === 'area' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
                  title="Area chart"
                >
                  Area
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${chartType === 'bar' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
                  title="Bar chart"
                >
                  Bar
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={salesVelocityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mainVelocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metricView === 'sales' ? '#00a651' : metricView === 'orders' ? '#3b82f6' : '#8b5cf6'} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={metricView === 'sales' ? '#00a651' : metricView === 'orders' ? '#3b82f6' : '#8b5cf6'} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} 
                    tickFormatter={(val) => metricView === 'orders' ? val : `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 18px', backgroundColor: '#ffffff' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 800, fontSize: '16px' }}
                    labelStyle={{ color: '#64748b', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                    formatter={(value: any) => [
                      metricView === 'orders' ? `${value} orders` : `$${Number(value).toLocaleString()}`,
                      metricView === 'sales' ? 'Gross Revenue' : metricView === 'orders' ? 'Orders Count' : 'Average Basket'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={metricView} 
                    stroke={metricView === 'sales' ? '#00a651' : metricView === 'orders' ? '#3b82f6' : '#8b5cf6'} 
                    strokeWidth={3.5} 
                    fillOpacity={1} 
                    fill="url(#mainVelocityGrad)" 
                  />
                </AreaChart>
              ) : (
                <BarChart data={salesVelocityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(val) => metricView === 'orders' ? val : `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 18px' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 800 }}
                    formatter={(value: any) => [metricView === 'orders' ? `${value} orders` : `$${Number(value).toLocaleString()}`, 'Total']}
                  />
                  <Bar dataKey={metricView} fill={metricView === 'sales' ? '#00a651' : metricView === 'orders' ? '#3b82f6' : '#8b5cf6'} radius={[8, 8, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Studio (Conversion Funnel, Payments & Category Mix) */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8 flex flex-col min-h-[460px]">
          <div className="flex items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {secondaryView === 'funnel' ? 'Customer Conversion Funnel' : secondaryView === 'payments' ? 'Payment Gateways Mix' : 'Category Sales Share'}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Shopify-grade conversion metrics</p>
            </div>

            <div className="flex items-center bg-gray-100 p-1 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setSecondaryView('funnel')}
                className={`px-2 py-1 rounded-xl transition-all cursor-pointer ${secondaryView === 'funnel' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Funnel
              </button>
              <button
                onClick={() => setSecondaryView('payments')}
                className={`px-2 py-1 rounded-xl transition-all cursor-pointer ${secondaryView === 'payments' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Payments
              </button>
              <button
                onClick={() => setSecondaryView('categories')}
                className={`px-2 py-1 rounded-xl transition-all cursor-pointer ${secondaryView === 'categories' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Categories
              </button>
            </div>
          </div>

          {secondaryView === 'funnel' ? (
            /* Conversion Funnel */
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-3.5">
                {conversionFunnel.map((step, idx) => (
                  <div key={step.stage}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700">{step.stage}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 tabular-nums">{step.count.toLocaleString()}</span>
                        <span className="text-[11px] font-mono text-gray-400">({step.pct})</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0 ? 'bg-blue-500' :
                          idx === 1 ? 'bg-indigo-500' :
                          idx === 2 ? 'bg-purple-500' :
                          idx === 3 ? 'bg-amber-500' : 'bg-[#00a651]'
                        }`}
                        style={{ width: idx === 0 ? '100%' : idx === 1 ? '72%' : idx === 2 ? '27%' : idx === 3 ? '12%' : '4.5%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Overall visit-to-purchase: <strong className="text-gray-900">{metrics.conversionRate}</strong></span>
                <button
                  onClick={() => triggerToast('Checkout optimization guidelines applied!')}
                  className="text-[#00a651] font-bold hover:underline cursor-pointer"
                >
                  Optimize Checkout →
                </button>
              </div>
            </div>
          ) : secondaryView === 'payments' ? (
            /* Payment Breakdown */
            <div className="flex-1 flex flex-col justify-between">
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {paymentBreakdownData.map((entry, index) => (
                        <Cell key={`pay-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any, item: any) => [`${value}% (${item.payload.amount})`, name]}
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-4 pt-3 border-t border-gray-100 text-xs">
                {paymentBreakdownData.map((pay, idx) => (
                  <div key={pay.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }}></span>
                      <span className="font-semibold text-gray-700">{pay.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 tabular-nums">{pay.amount}</span>
                      <span className="text-gray-400 font-mono text-[11px]">{pay.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Category Share */
            <div className="flex-1 flex flex-col justify-between">
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySalesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categorySalesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any, item: any) => [`${value}% (${item.payload.amount})`, name]}
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-4 pt-3 border-t border-gray-100 text-xs">
                {categorySalesData.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }}></span>
                      <span className="font-semibold text-gray-700">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 tabular-nums">{cat.amount}</span>
                      <span className="text-gray-400 font-mono text-[11px]">{cat.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Operational Orders Table with Tracking & Dispatch */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Live Orders & Fulfillment Engine</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {orders.length} Active Orders
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              Fulfill, generate shipping labels & tracking IDs, inspect invoices, and track parcel dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by status */}
            <div className="flex items-center bg-gray-100 p-1 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setOrderStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${orderStatusFilter === 'all' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
              >
                All
              </button>
              <button
                onClick={() => setOrderStatusFilter('processing')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${orderStatusFilter === 'processing' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Processing ({orders.filter((o: any) => o.status === 'processing').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('shipped')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${orderStatusFilter === 'shipped' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Shipped
              </button>
              <button
                onClick={() => setOrderStatusFilter('delivered')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${orderStatusFilter === 'delivered' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Delivered
              </button>
            </div>

            <button
              onClick={() => setShowNewOrderModal(true)}
              className="px-3.5 py-2 bg-gray-900 text-white rounded-2xl font-bold text-xs hover:bg-gray-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} /> New Order
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="px-6 py-4">Order ID & Date</th>
                <th className="px-6 py-4">Customer & Destination</th>
                <th className="px-6 py-4">Items Ordered</th>
                <th className="px-6 py-4">Carrier & Tracking</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Fulfillment Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {recentOrders.length > 0 ? (
                recentOrders.map((order: any) => {
                  const itemsCount = Array.isArray(order.items) 
                    ? order.items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0)
                    : 1;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* ID & Date */}
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-gray-900 flex items-center gap-1.5">
                          <span>{order.id}</span>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={11} /> {order.date}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{order.customer || 'Guest User'}</div>
                        <div className="text-xs text-gray-500">{order.email}</div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[200px] mt-0.5">
                          {order.shippingAddress || 'Standard Shipping Address'}
                        </div>
                      </td>

                      {/* Product Preview Thumbnails */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {Array.isArray(order.items) && order.items.length > 0 ? (
                            order.items.slice(0, 2).map((item: any, i: number) => (
                              <div key={i} className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200/80 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                              </div>
                            ))
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                              <Package size={14} />
                            </div>
                          )}
                          <span className="text-xs text-gray-600 font-semibold ml-1">
                            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </td>

                      {/* Carrier & Tracking */}
                      <td className="px-6 py-4">
                        {order.trackingNumber ? (
                          <div>
                            <div className="text-xs font-bold text-gray-900 flex items-center gap-1">
                              <Truck size={12} className="text-[#00a651]" /> {order.carrier || 'FedEx'}
                            </div>
                            <span className="font-mono text-[11px] text-gray-500">{order.trackingNumber}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setFulfillModalOrder(order);
                              setTrackingNumber(`FX-${Math.floor(100000000 + Math.random() * 900000000)}`);
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            + Add Tracking
                          </button>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 font-black text-gray-900 tabular-nums">
                        ${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                        <div className="text-[10px] text-gray-400 font-normal">
                          {order.paymentMethod ? order.paymentMethod.split(' ')[0] : 'Card'}
                        </div>
                      </td>

                      {/* Status + Inline Quick Changer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          
                          <select
                            value={order.status}
                            onChange={(e) => {
                              updateOrderStatus(order.id, e.target.value);
                              triggerToast(`Order #${order.id} status changed to ${e.target.value.toUpperCase()}`);
                            }}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 font-medium hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#00a651] cursor-pointer"
                            title="Update status"
                          >
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <UiTooltip content="Inspect Order Details" position="top">
                            <button
                              onClick={() => { setSelectedOrder(order); setInvoiceMode(false); }}
                              className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:text-[#00a651] hover:border-[#00a651]/30 hover:bg-[#00a651]/10 transition-colors cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                          </UiTooltip>

                          <UiTooltip content="Print Commercial Invoice" position="top">
                            <button
                              onClick={() => { setSelectedOrder(order); setInvoiceMode(true); }}
                              className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <Printer size={15} />
                            </button>
                          </UiTooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    No orders matching the status "{orderStatusFilter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Warehouse Velocity & Active Promotions Section */}
      <div id="inventory-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts & Warehouse Restock */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Warehouse Inventory & Restock Velocity</h3>
                  <p className="text-xs text-gray-500 font-medium">Replenish catalog stock before stockout triggers</p>
                </div>
              </div>
              <Link to="/admin/products" className="text-xs font-bold text-[#00a651] hover:underline">
                Manage Products →
              </Link>
            </div>

            <div className="space-y-3 mt-4">
              {products.slice(0, 5).map((item: any) => {
                const stock = item.stockQuantity ?? (item.inStock ? 6 : 0);
                const isCritical = stock <= 5;
                const stockPct = Math.min(100, Math.round((stock / 50) * 100));

                return (
                  <div key={item.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-200/80 p-1 flex-shrink-0 flex items-center justify-center">
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isCritical ? 'bg-red-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${Math.max(5, stockPct)}%` }} 
                            />
                          </div>
                          <span className={`text-xs font-bold ${isCritical ? 'text-red-600' : 'text-emerald-700'}`}>
                            {stock === 0 ? 'Out of Stock' : `${stock} units`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowRestockModal(item);
                        setCustomRestockQty(25);
                      }}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-800 hover:border-[#00a651] hover:text-[#00a651] hover:bg-[#00a651]/5 rounded-xl font-bold text-xs transition-all shadow-xs shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} /> Restock
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Automated threshold: &lt; 5 units flagged</span>
            <span className="text-[#00a651] font-bold">Real-time inventory sync</span>
          </div>
        </div>

        {/* Promotional Discounts & Coupons Management */}
        <div id="promotions-section" className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Tag size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Promotions & Discount Campaigns</h3>
                  <p className="text-xs text-gray-500 font-medium">Live customer promo codes & redemption tracking</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewCouponModal(true)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> New Code
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {coupons.map((coupon: any) => (
                <div key={coupon.code} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100/60 text-orange-700 font-black text-sm flex items-center justify-center font-mono">
                      %
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900 text-sm tracking-wide">{coupon.code}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${coupon.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                          {coupon.active ? 'ACTIVE' : 'PAUSED'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        <strong className="text-gray-800 font-semibold">
                          {coupon.discount}{coupon.type === 'percentage' ? '%' : '$'} OFF
                        </strong>
                        <span className="mx-1.5">·</span>
                        <span>Min spend ${coupon.minSpend}</span>
                        <span className="mx-1.5">·</span>
                        <span className="text-gray-400">{coupon.uses || 0} redeemed</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      toggleCoupon(coupon.code);
                      triggerToast(`Coupon ${coupon.code} ${coupon.active ? 'paused' : 'activated'}!`);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer ${
                      coupon.active 
                        ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {coupon.active ? 'Pause' : 'Activate'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Codes automatically apply on customer checkout</span>
            <button onClick={() => setShowNewCouponModal(true)} className="text-orange-600 font-bold hover:underline cursor-pointer">
              Create New Promotion Code →
            </button>
          </div>
        </div>
      </div>

      {/* Top Performing Catalog Leaderboard */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-gray-900">Top Performing Products Leaderboard</h2>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Revenue Ranked
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              High velocity items generating the largest share of store volume.
            </p>
          </div>

          <Link to="/admin/products" className="text-xs font-bold text-[#00a651] hover:underline">
            View All {products.length} Products in Catalog →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topProducts.map((prod: any, idx: number) => (
            <div key={prod.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between hover:border-gray-200 transition-all">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-gray-200 font-black text-xs text-gray-700 flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
                <span className="text-xs font-bold text-[#00a651] bg-emerald-50 px-2 py-0.5 rounded-md">
                  {prod.unitsSold} Sold
                </span>
              </div>

              <div className="w-full aspect-[4/3] rounded-xl bg-white border border-gray-200/80 p-2 mb-3 flex items-center justify-center overflow-hidden">
                <img src={prod.image} alt={prod.title} className="w-full h-full object-contain mix-blend-multiply" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 truncate">{prod.title}</h4>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/60">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold block">Gross Revenue</span>
                    <span className="text-base font-black text-gray-900 tabular-nums">
                      ${prod.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-gray-400 font-bold block">Unit Price</span>
                    <span className="text-xs font-mono font-bold text-gray-700">${prod.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Store Control Panels / Quick Launchpad */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-5 px-1">Store Architecture & Marketing Launchpad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link to="/admin/menu" className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 flex flex-col items-start hover:shadow-md hover:border-[#00a651]/40 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Menu size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Navigation & Mega Menu</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Configure top header categories, multi-column flyouts, and custom header links.
            </p>
            <div className="mt-auto flex items-center justify-between w-full">
              <span className="text-blue-600 font-bold text-xs">Configure Menu</span>
              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>
          
          <Link to="/admin/sliders" className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 flex flex-col items-start hover:shadow-md hover:border-[#00a651]/40 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Image size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Hero Sliders & Banners</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Update marketing campaign slides, typography alignment, and CTAs.
            </p>
            <div className="mt-auto flex items-center justify-between w-full">
              <span className="text-purple-600 font-bold text-xs">Edit Sliders</span>
              <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          <Link to="/admin/pages" className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 flex flex-col items-start hover:shadow-md hover:border-[#00a651]/40 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-[#00a651]/10 text-[#00a651] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Store Policy & Content</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Manage About Us, Delivery info, Return policies, and Terms pages.
            </p>
            <div className="mt-auto flex items-center justify-between w-full">
              <span className="text-[#00a651] font-bold text-xs">Manage Pages</span>
              <div className="w-7 h-7 rounded-full bg-[#00a651]/10 text-[#00a651] flex items-center justify-center group-hover:bg-[#00a651] group-hover:text-white transition-colors">
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          <Link to="/admin/home-builder" className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 flex flex-col items-start hover:shadow-md hover:border-[#00a651]/40 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Layers size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Dynamic Home Builder</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Drag, reorder, toggle, and preview sections displayed on homepage.
            </p>
            <div className="mt-auto flex items-center justify-between w-full">
              <span className="text-orange-600 font-bold text-xs">Open Builder</span>
              <div className="w-7 h-7 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Modal 1: Order Details & Commercial Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-4">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-mono">
                  {selectedOrder.id}
                </h3>
                {getStatusBadge(selectedOrder.status)}
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-gray-200/70 p-1 rounded-xl flex text-xs font-semibold">
                  <button
                    onClick={() => setInvoiceMode(false)}
                    className={`px-3 py-1 rounded-lg transition-all ${!invoiceMode ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setInvoiceMode(true)}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${invoiceMode ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <Printer size={13} /> Invoice
                  </button>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              {!invoiceMode ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Items */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Package size={18} className="text-gray-400" /> Items in Order
                      </h4>
                      <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 text-sm">
                        {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                          selectedOrder.items.map((item: any, i: number) => (
                            <div key={i} className="p-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center">
                                  <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="font-bold text-gray-900 truncate">{item.title}</h5>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    Qty: <span className="font-semibold text-gray-800">{item.quantity || 1}</span> × ${Number(item.price).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              <div className="font-black text-gray-900 tabular-nums">
                                ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-gray-500 text-xs">
                            Standard fulfillment items recorded.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Summary box */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 space-y-2.5 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-bold text-gray-900">${typeof selectedOrder.total === 'number' ? selectedOrder.total.toFixed(2) : selectedOrder.total}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Standard Shipping</span>
                        <span className="font-bold text-[#00a651]">FREE</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Estimated Tax</span>
                        <span className="font-bold text-gray-900">$0.00</span>
                      </div>
                      <div className="pt-2.5 border-t border-gray-200 flex justify-between text-base font-black text-gray-900">
                        <span>Grand Total</span>
                        <span className="text-[#00a651] tabular-nums">
                          ${typeof selectedOrder.total === 'number' ? selectedOrder.total.toFixed(2) : selectedOrder.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Customer & Shipping Details */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Users size={16} className="text-gray-400" /> Customer Information
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="font-bold text-gray-900 text-sm">{selectedOrder.customer}</div>
                        <div className="text-gray-600 flex items-center gap-1.5"><Mail size={12} /> {selectedOrder.email}</div>
                        <div className="text-gray-600 flex items-center gap-1.5"><Phone size={12} /> {selectedOrder.phone || '+1 (555) 123-4567'}</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" /> Shipping Destination
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {selectedOrder.shippingAddress || '742 Evergreen Terrace, Springfield, OR 97477, USA'}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <CreditCard size={16} className="text-gray-400" /> Payment & Fulfillment
                      </h4>
                      <div className="text-xs font-semibold text-gray-800">
                        {selectedOrder.paymentMethod || 'Credit Card (Visa •••• 4242)'}
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div className="mt-2 text-xs text-blue-700 bg-blue-50 p-2 rounded-xl font-mono">
                          Tracking: {selectedOrder.trackingNumber} ({selectedOrder.carrier})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Printable Invoice View */
                <div className="bg-white p-6 sm:p-8 border border-gray-200 rounded-2xl shadow-sm text-sm space-y-6">
                  <div className="flex justify-between items-start pb-6 border-b border-gray-200">
                    <div>
                      <div className="text-2xl font-black text-gray-900 tracking-tight">MegaStore Inc.</div>
                      <div className="text-xs text-gray-500 mt-1">Order Invoice & Commercial Receipt</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-gray-900">{selectedOrder.id}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{selectedOrder.date}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Billed To</span>
                      <div className="font-bold text-gray-900 text-sm">{selectedOrder.customer}</div>
                      <div className="text-gray-600">{selectedOrder.email}</div>
                      <div className="text-gray-600 mt-1">{selectedOrder.shippingAddress || '742 Evergreen Terrace, Springfield, OR'}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Payment Method</span>
                      <div className="font-bold text-gray-900">{selectedOrder.paymentMethod || 'Credit Card'}</div>
                      <div className="text-green-600 font-bold mt-1">TRANSACTION CONFIRMED</div>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs border-t border-b border-gray-200 py-2">
                    <thead>
                      <tr className="text-gray-400 uppercase font-bold">
                        <th className="py-2">Item Description</th>
                        <th className="py-2 text-center">Qty</th>
                        <th className="py-2 text-right">Price</th>
                        <th className="py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item: any, i: number) => (
                          <tr key={i} className="py-2">
                            <td className="py-2 font-medium text-gray-900">{item.title}</td>
                            <td className="py-2 text-center">{item.quantity || 1}</td>
                            <td className="py-2 text-right">${Number(item.price).toFixed(2)}</td>
                            <td className="py-2 text-right font-bold">${(Number(item.price) * (item.quantity || 1)).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-2 font-medium text-gray-900">Commercial Catalog Item</td>
                          <td className="py-2 text-center">1</td>
                          <td className="py-2 text-right">${typeof selectedOrder.total === 'number' ? selectedOrder.total.toFixed(2) : selectedOrder.total}</td>
                          <td className="py-2 text-right font-bold">${typeof selectedOrder.total === 'number' ? selectedOrder.total.toFixed(2) : selectedOrder.total}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Printer size={14} /> Print Formal Receipt
                    </button>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 mr-4">Total Amount Due</span>
                      <span className="text-xl font-black text-gray-900 font-mono">
                        ${typeof selectedOrder.total === 'number' ? selectedOrder.total.toFixed(2) : selectedOrder.total}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Update status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    updateOrderStatus(selectedOrder.id, e.target.value);
                    setSelectedOrder({ ...selectedOrder, status: e.target.value });
                    triggerToast(`Order #${selectedOrder.id} status updated to ${e.target.value.toUpperCase()}`);
                  }}
                  className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#00a651] cursor-pointer"
                >
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Fulfillment & Tracking Modal */}
      {fulfillModalOrder && (
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Truck className="text-[#00a651]" size={20} />
                <h3 className="font-bold text-gray-900">Fulfill Order #{fulfillModalOrder.id}</h3>
              </div>
              <button onClick={() => setFulfillModalOrder(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFulfillSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Shipping Carrier</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00a651] focus:border-transparent"
                >
                  <option value="FedEx Express">FedEx Express</option>
                  <option value="DHL Express Worldwide">DHL Express Worldwide</option>
                  <option value="UPS Ground">UPS Ground</option>
                  <option value="USPS Priority Mail">USPS Priority Mail</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tracking Number</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. FX-982348712"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#00a651] focus:border-transparent"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 font-medium">
                Customer ({fulfillModalOrder.customer}) will be notified via email with this tracking number.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFulfillModalOrder(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00a651] text-white rounded-xl text-xs font-bold hover:bg-[#008c44] shadow-xs cursor-pointer"
                >
                  Dispatch & Fulfill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Manual Order Creation Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-[#00a651]" size={20} />
                <h3 className="font-bold text-gray-900">Create Manual Order</h3>
              </div>
              <button onClick={() => setShowNewOrderModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={newOrderForm.customer}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Customer Email</label>
                  <input
                    type="email"
                    required
                    value={newOrderForm.email}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newOrderForm.phone}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Shipping Destination Address</label>
                <textarea
                  rows={2}
                  required
                  value={newOrderForm.address}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">Select Product</label>
                  <select
                    value={newOrderForm.productId}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, productId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  >
                    {products.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.title} (${p.price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newOrderForm.quantity}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Payment Method</label>
                <select
                  value={newOrderForm.paymentMethod}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="Credit Card (Visa •••• 9821)">Credit Card (Visa •••• 9821)</option>
                  <option value="PayPal Express">PayPal Express</option>
                  <option value="Apple Pay">Apple Pay</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00a651] text-white rounded-xl text-xs font-bold hover:bg-[#008c44] shadow-xs cursor-pointer"
                >
                  Confirm & Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Promo Coupon Creation Modal */}
      {showNewCouponModal && (
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Tag className="text-orange-500" size={20} />
                <h3 className="font-bold text-gray-900">Create Promotion Coupon</h3>
              </div>
              <button onClick={() => setShowNewCouponModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCouponSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={newCouponForm.code}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono uppercase tracking-wider font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Discount Type</label>
                  <select
                    value={newCouponForm.type}
                    onChange={(e: any) => setNewCouponForm({ ...newCouponForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newCouponForm.discount}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, discount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Minimum Order Spend ($)</label>
                <input
                  type="number"
                  min="0"
                  value={newCouponForm.minSpend}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, minSpend: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewCouponModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 shadow-xs cursor-pointer"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Custom Quantity Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900 text-sm">Replenish Inventory</h3>
              <button onClick={() => setShowRestockModal(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200/80 p-1 flex-shrink-0 flex items-center justify-center">
                  <img src={showRestockModal.image} alt={showRestockModal.title} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 truncate">{showRestockModal.title}</h4>
                  <p className="text-xs text-gray-500">Current stock: {showRestockModal.stockQuantity ?? (showRestockModal.inStock ? 5 : 0)} units</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Add Units to Warehouse Stock</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={customRestockQty}
                    onChange={(e) => setCustomRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-base font-bold text-center"
                  />
                  <div className="flex gap-1">
                    <button onClick={() => setCustomRestockQty(10)} className="px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200">+10</button>
                    <button onClick={() => setCustomRestockQty(25)} className="px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200">+25</button>
                    <button onClick={() => setCustomRestockQty(50)} className="px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200">+50</button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestockSubmit}
                  className="px-5 py-2 bg-[#00a651] text-white rounded-xl text-xs font-bold hover:bg-[#008c44] shadow-xs cursor-pointer"
                >
                  Confirm Restock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
