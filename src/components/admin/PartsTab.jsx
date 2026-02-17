import React, { useState, useMemo } from 'react';

const PartsTab = ({ 
    spareParts, 
    partForm, 
    setPartForm, 
    handleAddPart, 
    handleDeleteItem, 
    brandSearchQuery, 
    setBrandSearchQuery,
    handleUpdatePart 
}) => {
    const API_BASE_URL = "http://127.0.0.1:8000";
    const [activeTab, setActiveTab] = useState('inventory');
    const [modelSearchQuery, setModelSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // --- MOCK DATA FOR SUGGESTIONS ---
    const brandData = {
        "HONDA": { "Civic": ["2018", "2019"], "City": ["2015", "2016"] },
        "TOYOTA": { "Corolla": ["2017", "2018"], "Camry": ["2018", "2019"] },
        "BREMBO": { "Universal Performance": ["ALL_YEARS"] }
    };

    // --- FILTER LOGIC ---
    const filteredParts = useMemo(() => {
        return spareParts.filter(p => {
            const matchesBrandOrName = 
                (p.brand?.toLowerCase() || "").includes(brandSearchQuery.toLowerCase()) ||
                (p.name?.toLowerCase() || "").includes(brandSearchQuery.toLowerCase());
            const matchesModel = 
                (p.model?.toLowerCase() || "").includes(modelSearchQuery.toLowerCase());
            return matchesBrandOrName && matchesModel;
        });
    }, [spareParts, brandSearchQuery, modelSearchQuery]);

    // --- EDIT HANDLER ---
    const prepareUpdate = (part) => {
        setPartForm({
            id: part.id,
            name: part.name,
            brand: part.brand,
            model: part.model || '',
            year: part.year || '',
            price: part.price,
            stock: part.stock,
            description: part.description,
            image: part.image 
        });
        setIsEditing(true);
        setActiveTab('new_entry');
    };

    // --- RESET FORM ---
    const resetForm = () => {
        setPartForm({ name: '', brand: '', model: '', year: '', price: '', stock: 0, description: '', image: null });
        setIsEditing(false);
    };

    // --- STOCK ACTION HANDLER ---
    const handleSellPart = (part) => {
        if (part.stock > 0) {
            handleUpdatePart(part.id, { ...part, stock: part.stock - 1 });
        }
    };

    return (
        <div className="w-full font-sans max-w-6xl mx-auto px-4 pb-20">
            
            {/* 1. NAVIGATION CONTROL */}
            <div className="flex justify-center mb-10">
                <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                    {[
                        { id: 'inventory', label: 'Stock Inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                        { id: 'new_entry', label: isEditing ? 'Edit Part' : 'Add New Part', icon: 'M12 4v16m8-8H4' },
                        { id: 'stats', label: 'Data Overview', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }
                    ].map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id !== 'new_entry') resetForm();
                            }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                                ${activeTab === tab.id 
                                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                                : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                            </svg>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* --- INVENTORY LIST VIEW --- */}
                {activeTab === 'inventory' && (
                    <div className="space-y-8">
                        {/* REFINED FILTER BARS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                            <div className="relative">
                                <input 
                                    type="text" placeholder="Filter by Brand or Name..."
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-semibold text-sm shadow-sm focus:ring-4 focus:ring-slate-50 focus:border-slate-400 outline-none transition-all"
                                    value={brandSearchQuery}
                                    onChange={(e) => setBrandSearchQuery(e.target.value)}
                                />
                                <svg className="w-5 h-5 absolute left-4 top-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" placeholder="Filter by Model..."
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-semibold text-sm shadow-sm focus:ring-4 focus:ring-slate-50 focus:border-slate-400 outline-none transition-all"
                                    value={modelSearchQuery}
                                    onChange={(e) => setModelSearchQuery(e.target.value)}
                                />
                                <svg className="w-5 h-5 absolute left-4 top-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                            </div>
                        </div>

                        {/* PART CARDS */}
                        <div className="grid grid-cols-1 gap-4">
                            {filteredParts.map(p => (
                                <div key={p.id} className="group bg-white border border-slate-200 hover:border-slate-900 transition-all p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-2xl hover:shadow-slate-200/50">
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className="w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
                                            {p.image ? (
                                                <img src={p.image.startsWith('http') ? p.image : `${API_BASE_URL}${p.image}`} className="w-full h-full object-cover" alt={p.name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-300">NO_IMG</div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{p.brand}</span>
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${p.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    Stock: {p.stock} units
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-xl tracking-tight uppercase">{p.name}</h4>
                                            <div className="flex items-center gap-4">
                                                <p className="text-slate-900 font-black text-lg">₹{Number(p.price).toLocaleString()}</p>
                                                <p className="text-slate-400 text-xs font-medium uppercase">{p.model || 'Universal'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <button onClick={() => handleSellPart(p)} disabled={p.stock <= 0} className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold uppercase text-[10px] rounded-xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all disabled:opacity-30 shadow-sm">Sell [-1]</button>
                                        <button onClick={() => prepareUpdate(p)} className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold uppercase text-[10px] rounded-xl hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm">Update</button>
                                        <button onClick={() => handleDeleteItem('part', p.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- REGISTER / UPDATE PART VIEW --- */}
                {activeTab === 'new_entry' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {isEditing ? 'REVISE COMPONENT' : 'INVENTORY LOG'}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium">Capture hardware details for the storage core.</p>
                            </div>
                            {isEditing && (
                                <button onClick={resetForm} className="text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition-colors">ABORT_EDIT</button>
                            )}
                        </div>

                        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl shadow-slate-100">
                            <form onSubmit={(e) => {
                                handleAddPart(e);
                                if(isEditing) setActiveTab('inventory');
                                resetForm();
                            }} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">01. Brand</label>
                                        <input list="brand-suggestions" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-slate-900 transition-all uppercase" placeholder="e.g., BREMBO" value={partForm.brand} onChange={(e) => setPartForm({ ...partForm, brand: e.target.value.toUpperCase() })} required />
                                        <datalist id="brand-suggestions">{Object.keys(brandData).map(b => <option key={b} value={b} />)}</datalist>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">02. Model</label>
                                        <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-slate-900 transition-all uppercase" placeholder="e.g., CIVIC TYPE R" value={partForm.model} onChange={(e) => setPartForm({ ...partForm, model: e.target.value.toUpperCase() })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">03. Year Range</label>
                                        <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-slate-900 transition-all" placeholder="e.g., 2020-2024" value={partForm.year} onChange={(e) => setPartForm({...partForm, year: e.target.value})} required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1 space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Component Name</label>
                                        <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-slate-900 transition-all uppercase" placeholder="e.g., FRONT CERAMIC PADS" value={partForm.name} onChange={e => setPartForm({...partForm, name: e.target.value})} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Retail Price (₹)</label>
                                        <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-slate-900 transition-all" type="number" placeholder="0.00" value={partForm.price} onChange={e => setPartForm({...partForm, price: e.target.value})} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-emerald-600 ml-1">Stock Quantity</label>
                                        <input className="w-full px-5 py-4 bg-emerald-50/50 border border-emerald-100 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 transition-all text-emerald-700" type="number" value={partForm.stock} onChange={e => setPartForm({...partForm, stock: parseInt(e.target.value)})} required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Visual Reference</label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-all group">
                                        <svg className="w-6 h-6 text-slate-300 group-hover:text-slate-500 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className="text-[10px] font-bold uppercase text-slate-400">
                                            {partForm.image ? (typeof partForm.image === 'string' ? 'Maintain Current Image' : partForm.image.name) : 'Upload Image File'}
                                        </span>
                                        <input type="file" className="hidden" accept="image/*" onChange={e => setPartForm({...partForm, image: e.target.files[0]})} />
                                    </label>
                                </div>

                                <button type="submit" className={`w-full text-white py-5 rounded-2xl font-bold uppercase text-sm tracking-widest transition-all shadow-lg ${isEditing ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-slate-900 hover:bg-emerald-600 shadow-slate-100'}`}>
                                    {isEditing ? 'Update Database Records' : 'Commit to Storage Core'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- ANALYTICS VIEW --- */}
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 relative z-10">Total SKUs</p>
                            <h4 className="text-5xl font-black text-slate-900 tracking-tighter relative z-10">{spareParts.length}</h4>
                        </div>
                        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 relative z-10">Inventory Value</p>
                            <h4 className="text-3xl font-black text-slate-900 tracking-tighter relative z-10">₹{spareParts.reduce((acc, curr) => acc + (Number(curr.price) * curr.stock), 0).toLocaleString()}</h4>
                        </div>
                        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 relative z-10">Units On Hand</p>
                            <h4 className="text-5xl font-black text-emerald-500 tracking-tighter relative z-10">{spareParts.reduce((acc, curr) => acc + curr.stock, 0)}</h4>
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER METADATA */}
            <div className="mt-20 border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center opacity-40">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Build V.2.0.4 // Last Sync: {new Date().toLocaleDateString()}
                </p>
                <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Storage Core: Connected</p>
                </div>
            </div>
        </div>
    );
};

export default PartsTab;