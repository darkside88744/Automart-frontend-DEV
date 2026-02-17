import React, { useState } from 'react';

const OrdersTab = ({ partOrders, handlePartOrderStatusChange }) => {
    // --- STATE ---
    const [currentView, setCurrentView] = useState('active'); // 'active' or 'archive'
    const [expandedId, setExpandedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- LOGIC: FILTERING & SEARCH ---
    const filteredOrders = partOrders.filter(o => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
            o.id.toString().includes(query) ||
            (o.user_username || '').toLowerCase().includes(query) ||
            (o.part_details?.name || o.part_name || '').toLowerCase().includes(query);

        if (currentView === 'active') {
            return matchesSearch && o.status !== 'Delivered' && o.status !== 'Cancelled';
        } else {
            return matchesSearch && (o.status === 'Delivered' || o.status === 'Cancelled');
        }
    });

    const activeCount = partOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    const historyCount = partOrders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled').length;

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Helper for Status Styles
    const getStatusStyle = (status) => {
        const s = status?.toLowerCase();
        if (s === 'delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if (s === 'processing' || s === 'shipped') return 'bg-blue-50 text-blue-700 border-blue-100';
        if (s === 'pending') return 'bg-amber-50 text-amber-700 border-amber-100';
        return 'bg-slate-50 text-slate-700 border-slate-100';
    };

    // --- PDF LOGIC (UNTOUCHED AS REQUESTED) ---
    const downloadOrderPDF = (order) => {
        const printContent = `
            <html>
                <head>
                    <title>Order_Manifest_${order.id}</title>
                    <style>
                        body { font-family: monospace; padding: 40px; color: #0f172a; }
                        .header { border-bottom: 4px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
                        .red { color: #dc2626; font-weight: bold; }
                        .section { margin-bottom: 20px; }
                        .label { font-size: 10px; text-transform: uppercase; color: #64748b; }
                        .value { font-size: 16px; font-weight: bold; text-transform: uppercase; }
                        .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; pt: 20px; font-size: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>ORDER_MANIFEST_#${order.id}</h1>
                        <p class="red">SYSTEM STATUS: ${order.status.toUpperCase()}</p>
                    </div>
                    <div class="section">
                        <div class="label">Client ID</div>
                        <div class="value">${order.user_username || 'GUEST_USER'}</div>
                    </div>
                    <div class="section">
                        <div class="label">Component Details</div>
                        <div class="value">${order.part_details?.name || order.part_name} (${order.part_details?.brand || 'PREMIUM'})</div>
                    </div>
                    <div class="section">
                        <div class="label">Shipping Destination</div>
                        <div class="value">${order.shipping_address || 'N/A'}</div>
                        <div class="value">${order.phone_number || 'NO_CONTACT'}</div>
                    </div>
                    <div class="footer">
                        GENERATED ON: ${new Date().toLocaleString()} | SECURE LOGISTICS UNIT
                    </div>
                </body>
            </html>
        `;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    // --- SUB-COMPONENT: RECORD LIST ---
    const RenderList = ({ data, type }) => {
        if (data.length === 0) {
            return (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                        {searchQuery ? `No matches found for "${searchQuery}"` : `No ${type} orders in system`}
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {data.map(o => {
                    const isExpanded = expandedId === o.id;
                    const statusStyles = getStatusStyle(o.status);
                    
                    return (
                        <div 
                            key={o.id} 
                            className={`transition-all duration-300 rounded-xl border ${
                                isExpanded 
                                ? 'border-blue-500 ring-4 ring-blue-50 shadow-lg bg-white my-4' 
                                : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                            }`}
                        >
                            {/* CARD HEADER */}
                            <div 
                                className="flex flex-wrap items-center justify-between p-4 cursor-pointer"
                                onClick={() => toggleExpand(o.id)}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${statusStyles}`}>
                                        #{o.id.toString().slice(-3)}
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm md:text-base leading-tight">
                                            {o.part_details?.name || o.part_name || 'Generic Component'}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                            Client: <span className="text-slate-700 font-bold uppercase">{o.user_username || 'Guest'}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-2 md:mt-0">
                                    <div className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${statusStyles}`}>
                                        {o.status}
                                    </div>
                                    
                                    <div className={`hidden sm:block px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase ${o.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                        {o.payment_status || 'UNPAID'}
                                    </div>

                                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-300'}`}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>

                            {/* EXPANDED CONTROL PANEL */}
                            {isExpanded && (
                                <div className="p-6 bg-slate-50/50 border-t border-slate-100 rounded-b-xl animate-in slide-in-from-top-1 duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Logistics Control</label>
                                            <select 
                                                value={o.status} 
                                                onChange={(e) => handlePartOrderStatusChange(o.id, e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="Pending">Pending Approval</option>
                                                <option value="Processing">Processing Order</option>
                                                <option value="Shipped">Dispatched / Shipped</option>
                                                <option value="Delivered">Mark Delivered</option>
                                                <option value="Cancelled">Void / Cancelled</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Shipping Details</label>
                                            <div className="bg-white border border-slate-200 rounded-lg p-2.5 min-h-[40px]">
                                                <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">
                                                    {o.shipping_address || 'Local Workshop Pickup'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Actions</label>
                                            <button 
                                                onClick={() => downloadOrderPDF(o)}
                                                className="w-full bg-slate-900 text-white rounded-lg py-2.5 px-4 text-xs font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                                Download Manifest
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
            {/* 1. SEARCH UNIT */}
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <input 
                    type="text"
                    placeholder="Search by ID, Customer, or Part..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all shadow-sm"
                />
            </div>

            {/* 2. TABS */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-8 w-fit">
                <button 
                    onClick={() => setCurrentView('active')}
                    className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        currentView === 'active' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Active Pipeline ({activeCount})
                </button>
                <button 
                    onClick={() => setCurrentView('archive')}
                    className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        currentView === 'archive' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    History ({historyCount})
                </button>
            </div>

            {/* 3. LIST */}
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.15em]">
                        Logistics Results
                    </h3>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">
                        Real-time Sync Active
                    </span>
                </div>
                <RenderList data={filteredOrders} type={currentView} />
            </div>
        </div>
    );
};

export default OrdersTab;