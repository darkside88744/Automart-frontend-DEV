import React, { useState } from 'react';

const BookingTab = ({ bookings, handleStatusChange, handlePaymentStatusChange }) => {
    // --- STATE ---
    const [currentView, setCurrentView] = useState('live'); 
    const [expandedId, setExpandedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- LOGIC: FILTERING & SEARCH ---
    const filteredBookings = bookings.filter(b => {
        const matchesSearch = 
            (b.vehicle_info || b.vehicle_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.user_username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.id.toString().includes(searchQuery);
        
        if (currentView === 'live') {
            return matchesSearch && b.status !== 'COMPLETED' && b.status !== 'CANCELLED';
        } else {
            return matchesSearch && (b.status === 'COMPLETED' || b.status === 'CANCELLED');
        }
    });

    const activeCount = bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length;
    const historyCount = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED').length;

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // --- SUB-COMPONENT: RECORD LIST ---
    const RenderList = ({ data, type }) => {
        if (data.length === 0) {
            return (
                <div className="py-20 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                    <div className="text-4xl mb-3 opacity-50">📁</div>
                    <p className="text-slate-500 font-medium text-sm tracking-wide">
                        {searchQuery ? `No results for "${searchQuery}"` : `No ${type} bookings found in database.`}
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {data.map(b => {
                    const isExpanded = expandedId === b.id;
                    const isPaid = b.payment_status === 'PAID';
                    
                    // Logic-based colors
                    const statusColors = {
                        'PENDING': 'bg-blue-50 text-blue-700 border-blue-100',
                        'IN_PROGRESS': 'bg-amber-50 text-amber-700 border-amber-100',
                        'COMPLETED': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                        'CANCELLED': 'bg-slate-100 text-slate-600 border-slate-200',
                    };

                    return (
                        <div 
                            key={b.id} 
                            className={`group rounded-xl border transition-all duration-300 overflow-hidden ${
                                isExpanded 
                                ? 'border-blue-500 ring-4 ring-blue-50 bg-white shadow-xl translate-y-[-2px]' 
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                            }`}
                        >
                            {/* CARD HEADER */}
                            <div 
                                className="flex flex-wrap items-center justify-between p-4 cursor-pointer"
                                onClick={() => toggleExpand(b.id)}
                            >
                                <div className="flex items-center gap-6">
                                    {/* ID / Indicator */}
                                    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg w-12 h-12 border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID</span>
                                        <span className="text-sm font-extrabold text-slate-700">#{b.id.toString().slice(-4)}</span>
                                    </div>

                                    {/* Vehicle Info */}
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-base md:text-lg tracking-tight">
                                            {b.vehicle_info || b.vehicle_name || 'Generic Vehicle Unit'}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                {b.user_username || 'Guest Customer'}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusColors[b.status] || 'bg-slate-100'}`}>
                                                {b.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    {/* Timestamp Section */}
                                    <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Appointment</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-700">
                                                    {new Date(b.appointment_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                </span>
                                                <span className="text-slate-300">|</span>
                                                <span className="text-xs font-bold text-slate-700">
                                                    {new Date(b.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Badge */}
                                    <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold ${
                                        isPaid ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                                    }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                        {b.payment_status}
                                    </div>

                                    {/* Expand Toggle */}
                                    <div className={`transition-all duration-300 p-2 rounded-full ${isExpanded ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-slate-50 text-slate-400 group-hover:text-slate-900'}`}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>

                            {/* EXPANDED CONTROL PANEL */}
                            {isExpanded && (
                                <div className="p-6 bg-slate-50/50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
                                    {/* Financial Unit */}
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 block">Invoice Settlement</label>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xs font-bold text-slate-500">₹</span>
                                            <span className="text-3xl font-black text-slate-900 tracking-tighter">
                                                {Number(b.final_amount || b.total_amount || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="mt-3 py-2 px-3 bg-slate-50 rounded-lg text-[10px] font-medium text-slate-500">
                                            Original Quote: ₹{Number(b.total_amount || 0).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Workflow Select */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block pl-1">Stage Management</label>
                                        <div className="relative">
                                            <select 
                                                value={b.status} 
                                                onChange={(e) => handleStatusChange(b.id, e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl text-sm font-bold p-3.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none transition-all cursor-pointer text-slate-700 shadow-sm"
                                            >
                                                <option value="PENDING">Queue / Pending</option>
                                                <option value="IN_PROGRESS">Workshop / Active</option>
                                                <option value="COMPLETED">Finalized / Ready</option>
                                                <option value="CANCELLED">Terminated / Cancelled</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Select */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block pl-1">Transaction Lock</label>
                                        <div className="relative">
                                            <select 
                                                value={b.payment_status} 
                                                onChange={(e) => handlePaymentStatusChange(b.id, e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl text-sm font-bold p-3.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none appearance-none transition-all cursor-pointer text-slate-700 shadow-sm"
                                            >
                                                <option value="PENDING">Pending Settlement</option>
                                                <option value="PAID">Confirmed / Paid</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
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
        <div className="w-full">
            {/* 1. TOP TOOLBAR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input 
                        type="text"
                        placeholder="Filter by vehicle, customer, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18" /></svg>
                        </button>
                    )}
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button 
                        onClick={() => setCurrentView('live')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            currentView === 'live' 
                            ? 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${currentView === 'live' ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`}></span>
                        Live Queue
                        <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${currentView === 'live' ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                            {activeCount}
                        </span>
                    </button>
                    <button 
                        onClick={() => setCurrentView('history')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            currentView === 'history' 
                            ? 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Archive
                        <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${currentView === 'history' ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                            {historyCount}
                        </span>
                    </button>
                </div>
            </div>

            {/* 2. SECTION HEADER */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-widest">
                        Data Stream: <span className="text-slate-900">{currentView === 'live' ? 'Active_Workshop' : 'Historical_Records'}</span>
                    </h3>
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    Last Synced: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* 3. DYNAMIC LIST */}
            <RenderList data={filteredBookings} type={currentView} />
        </div>
    );
};

export default BookingTab;