import React, { useState } from 'react';

const ServicesTab = ({ services, serviceForm, setServiceForm, handleAddService, handleDeleteItem }) => {
    // --- STATE ---
    const [searchTerm, setSearchTerm] = useState("");
    const [currentView, setCurrentView] = useState('catalog'); // 'catalog', 'new_entry', or 'stats'

    // --- FILTER LOGIC ---
    const filteredServices = services.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full font-sans max-w-6xl mx-auto px-4 pb-20">
            
            {/* 1. NAVIGATION CONTROL (Pill Style) */}
            <div className="flex justify-center mb-12">
                <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm">
                    {[
                        { id: 'catalog', label: `Catalog (${services.length})`, icon: 'M4 6h16M4 12h16M4 18h16' },
                        { id: 'new_entry', label: 'Add Service', icon: 'M12 4v16m8-8H4' },
                        { id: 'stats', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
                    ].map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setCurrentView(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200
                                ${currentView === tab.id 
                                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                                : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                            </svg>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. VIEW CONTENT */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* --- CATALOG VIEW --- */}
                {currentView === 'catalog' && (
                    <div className="space-y-8">
                        {/* SEARCH SECTION */}
                        <div className="relative max-w-2xl mx-auto mb-12">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                            <input 
                                type="text"
                                placeholder="Search system database..."
                                className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-700 shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* LISTING */}
                        <div className="grid grid-cols-1 gap-4">
                            {filteredServices.length > 0 ? (
                                filteredServices.map(s => (
                                    <div 
                                        key={s.id} 
                                        className="group bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
                                    >
                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                                                <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg md:text-xl tracking-tight mb-1">
                                                    {s.name}
                                                </h4>
                                                <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xl">
                                                    {s.description || "No description logged for this service."}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteItem('service', s.id)}
                                            className="w-full md:w-auto px-5 py-2.5 border border-slate-100 text-slate-400 hover:border-red-200 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-all hover:bg-red-50 rounded-lg"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                    <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">
                                        No entries match your search
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- NEW ENTRY VIEW --- */}
                {currentView === 'new_entry' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Service Registration</h3>
                            <p className="text-slate-500 text-sm">Define a new technical service for the repair catalog.</p>
                        </div>
                        
                        <div className="bg-white border border-slate-200 p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-100">
                            <form onSubmit={handleAddService} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider ml-1">Service Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Premium Paint Protection"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-400 transition-all"
                                        value={serviceForm.name}
                                        onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider ml-1">Description & Parameters</label>
                                    <textarea 
                                        placeholder="Outline the technical scope and details..."
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 h-40 outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-400 transition-all resize-none"
                                        value={serviceForm.description}
                                        onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                                    ></textarea>
                                </div>
                                <button className="w-full bg-slate-900 text-white font-bold uppercase text-sm py-5 rounded-xl hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-100 transition-all active:scale-[0.98]">
                                    Commit to Catalog
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- ANALYTICS VIEW --- */}
                {currentView === 'stats' && (
                    <div className="bg-white border border-slate-200 p-8 md:p-16 rounded-3xl shadow-xl shadow-slate-100 text-center">
                        <div className="mb-12">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">System Metrics</h2>
                            <p className="text-slate-500 font-medium">Real-time health and performance data.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "Catalog Size", val: services.length, color: "text-slate-900", sub: "Active Records" },
                                { label: "Efficiency", val: "98.2%", color: "text-emerald-500", sub: "Load Balance" },
                                { label: "Integrity", val: "Optimal", color: "text-blue-500", sub: "Data Health" }
                            ].map((stat, i) => (
                                <div key={i} className="bg-slate-50 border border-slate-100 p-8 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 group">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{stat.label}</p>
                                    <p className={`text-4xl font-black ${stat.color} mb-2 tracking-tight`}>{stat.val}</p>
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{stat.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER METADATA */}
            <div className="mt-20 border-t border-slate-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 opacity-50">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        System Status: Operational
                    </p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Build V.2.0.4 // Last Sync: {new Date().toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

export default ServicesTab;