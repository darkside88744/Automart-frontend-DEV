import React, { useState } from 'react';

const DentingTab = ({ dentingRequests, quotePrice, setQuotePrice, handleGenerateQuote, setSelectedImg }) => {
    const API_BASE_URL = "http://127.0.0.1:8000";
    
    // --- STATE ---
    const [currentView, setCurrentView] = useState('pending'); // 'pending' or 'history'
    const [expandedId, setExpandedId] = useState(null);

    // --- LOGIC: SPLIT DATA ---
    const pendingRequests = dentingRequests.filter(req => 
        req.status?.toLowerCase() === 'pending' || !req.estimated_price || Number(req.estimated_price) <= 0
    );
    const quotedRequests = dentingRequests.filter(req => 
        req.status?.toLowerCase() !== 'pending' && req.estimated_price && Number(req.estimated_price) > 0
    );

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // --- SUB-COMPONENT: RECORD LIST ---
    const RenderList = ({ data, type }) => {
        if (data.length === 0) {
            return (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">
                        Logistics clear // No {type} items in queue
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
                {data.map(req => {
                    const isExpanded = expandedId === req.id;
                    
                    // Image URL Logic
                    const fallbackImg = "https://placehold.co/400x200/f1f5f9/94a3b8?text=Scan+Unavailable";
                    let imgUrl = fallbackImg;
                    if (req.damage_image) {
                        if (req.damage_image.startsWith('http')) {
                            imgUrl = req.damage_image;
                        } else {
                            const cleanBase = API_BASE_URL.replace(/\/$/, "");
                            const cleanPath = req.damage_image.startsWith('/') ? req.damage_image : `/${req.damage_image}`;
                            imgUrl = `${cleanBase}${cleanPath}`;
                        }
                    }

                    return (
                        <div 
                            key={req.id} 
                            className={`group transition-all duration-300 rounded-2xl border ${
                                isExpanded 
                                ? 'border-blue-500 ring-4 ring-blue-50 bg-white shadow-xl translate-x-1' 
                                : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                            }`}
                        >
                            {/* CARD HEADER */}
                            <div 
                                className="flex flex-wrap items-center justify-between p-4 md:p-6 cursor-pointer"
                                onClick={() => toggleExpand(req.id)}
                            >
                                <div className="flex items-center gap-6">
                                    {/* THUMBNAIL */}
                                    <div 
                                        className="relative w-14 h-14 md:w-20 md:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-inner group-hover:shadow-md transition-shadow"
                                        onClick={(e) => { e.stopPropagation(); setSelectedImg(imgUrl); }}
                                    >
                                        <img src={imgUrl} alt="Damage Scan" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">ID-{req.id}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${type === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {type === 'pending' ? 'Review Required' : 'Valuation Locked'}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-base md:text-xl tracking-tight leading-tight">
                                            {req.vehicle_model || "Unidentified Unit"}
                                        </h4>
                                        <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wide">
                                            Client: <span className="text-slate-800 font-bold">{req.user_username || 'Internal_Log'}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 mt-4 md:mt-0">
                                    <div className="hidden lg:flex flex-col items-end">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Valuation</p>
                                        <p className={`text-lg font-black ${type === 'pending' ? 'text-slate-300' : 'text-slate-900'}`}>
                                            {type === 'pending' ? 'Calculating...' : `₹${Number(req.estimated_price).toLocaleString()}`}
                                        </p>
                                    </div>

                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-blue-600 text-white rotate-180 shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400'}`}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>

                            {/* EXPANDED CONTROL PANEL */}
                            {isExpanded && (
                                <div className="p-6 md:p-8 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 animate-in slide-in-from-top-2">
                                    {/* REPORT */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                                            <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Damage Report Summary</label>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm min-h-[120px]">
                                            <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                                                "{req.description || 'No specific damage log provided by the client. Field inspection recommended.'}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                                            <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                                                {type === 'pending' ? 'Generate Official Quote' : 'Transaction Receipt'}
                                            </label>
                                        </div>

                                        {type === 'pending' ? (
                                            <div className="space-y-4">
                                                <div className="relative group">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-blue-600 transition-colors">₹</span>
                                                    <input 
                                                        type="number" 
                                                        placeholder="0.00" 
                                                        value={quotePrice[req.id] || ''} 
                                                        onChange={(e) => setQuotePrice({...quotePrice, [req.id]: e.target.value})} 
                                                        className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-lg font-bold shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => handleGenerateQuote(req.id)}
                                                    className="w-full bg-slate-900 text-white rounded-xl py-4 font-bold text-sm uppercase tracking-widest hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-3"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                                                    Transmit to Client
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="border border-emerald-200 bg-white rounded-xl p-6 flex items-center justify-between shadow-sm">
                                                <div>
                                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Finalized Amount</p>
                                                    <p className="text-3xl font-black text-slate-900 tracking-tight">₹{Number(req.estimated_price).toLocaleString()}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                                                </div>
                                            </div>
                                        )}
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
        <div className="w-full font-sans max-w-6xl mx-auto px-4 py-6">
            {/* 1. VIEW SWITCHER */}
            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-10 w-fit">
                <button 
                    onClick={() => setCurrentView('pending')}
                    className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3
                        ${currentView === 'pending' 
                        ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' 
                        : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <span className={`w-2 h-2 rounded-full ${currentView === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    Queue ({pendingRequests.length})
                </button>
                <button 
                    onClick={() => setCurrentView('history')}
                    className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3
                        ${currentView === 'history' 
                        ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' 
                        : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <span className={`w-2 h-2 rounded-full ${currentView === 'history' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    Quoted ({quotedRequests.length})
                </button>
            </div>

            {/* 2. HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {currentView === 'pending' ? 'Visual Damage Assessment' : 'Valuation History'}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium">Manage and transmit bodywork repair quotations.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-3">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                        Protocol Sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            {/* 3. LIST */}
            <RenderList data={currentView === 'pending' ? pendingRequests : quotedRequests} type={currentView} />

            {/* 4. FOOTER */}
            <div className="mt-12 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] inline-flex items-center gap-4 before:h-px before:w-12 before:bg-slate-200 after:h-px after:w-12 after:bg-slate-200">
                    Secure Valuation Hub Protocol
                </p>
            </div>
        </div>
    );
};

export default DentingTab;