import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; 
import { MOCK_CAR_DATA } from '../utils/carData';
import { motion } from 'framer-motion';
import { 
    Car, 
    Calendar, 
    ChevronDown, 
    Hash, 
    Zap, 
    ShieldCheck, 
    Database 
} from 'lucide-react';

const VehicleSelector = () => {
    const navigate = useNavigate();
    const [selection, setSelection] = useState({ make: '', model: '', year: '', license_plate: '' });
    const [carData, setCarData] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchCarData = async () => {
            setLoading(true);
            // Simulating network latency for a "technical" feel
            setTimeout(() => {
                setCarData(MOCK_CAR_DATA);
                setLoading(false);
            }, 1200);
        };
        fetchCarData();
    }, []);

    const handleConfirm = async () => {
        if (!selection.make || !selection.model || !selection.year) {
            alert("Please complete the chassis configuration.");
            return;
        }

        const token = localStorage.getItem('access_token');
        const isGuest = localStorage.getItem('is_guest') === 'true';

        if (!token && !isGuest) {
            navigate('/login');
            return;
        }

        setIsSaving(true);
        try {
            if (isGuest) {
                localStorage.setItem('user_vehicle', JSON.stringify({
                    ...selection,
                    id: 'guest_v_1'
                }));
                navigate('/home');
            } else {
                const response = await api.post('/vehicles/', 
                    { ...selection },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                localStorage.setItem('user_vehicle', JSON.stringify(response.data));
                navigate('/home');
            }
            window.location.reload(); 
        } catch (err) {
            console.error("Save error:", err);
            alert("Configuration sync failed.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
                <div className="relative flex items-center justify-center">
                    <div className="w-24 h-24 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Database className="absolute text-indigo-600 animate-pulse" size={24} />
                </div>
                <p className="mt-8 font-bold uppercase tracking-[0.4em] text-slate-500 text-[10px]">
                    Accessing Central Chassis Database...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] text-slate-950 relative overflow-hidden flex flex-col items-center justify-center px-6 py-20 selection:bg-indigo-100 selection:text-indigo-700">            
            
            {/* NOISE OVERLAY */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-4xl"
            >
                {/* HEADER SECTION */}
                <header className="mb-10 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-[2px] w-12 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600/80">Configuration Protocol</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                        Asset <span className="text-indigo-600">Registration.</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base max-w-md">
                        Calibrate your digital garage parameters to sync your vehicle with global service logs.
                    </p>
                </header>

                <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 md:p-12">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* BRAND SELECT */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <ShieldCheck size={14} className="text-indigo-600" />
                                01. Manufacturer
                            </label>
                            <div className="relative group">
                                <select 
                                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-950 font-bold uppercase tracking-tight text-base focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none appearance-none cursor-pointer"
                                    onChange={(e) => setSelection({...selection, make: e.target.value, model: ''})}
                                    value={selection.make}
                                >
                                    <option value="">Select Brand</option>
                                    {Object.keys(carData).sort().map(make => (
                                        <option key={make} value={make}>{make}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            </div>
                        </div>

                        {/* MODEL SELECT */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <Zap size={14} className="text-indigo-600" />
                                02. Model Series
                            </label>
                            <div className="relative group">
                                <select 
                                    disabled={!selection.make} 
                                    className={`w-full p-5 border rounded-2xl text-slate-950 font-bold uppercase tracking-tight text-base transition-all outline-none appearance-none ${!selection.make ? 'bg-slate-100 border-slate-100 text-slate-300' : 'bg-slate-50 border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 cursor-pointer'}`}
                                    onChange={(e) => setSelection({...selection, model: e.target.value})}
                                    value={selection.model}
                                >
                                    <option value="">Select Model</option>
                                    {selection.make && carData[selection.make].sort().map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            </div>
                        </div>

                        {/* YEAR INPUT */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <Calendar size={14} className="text-indigo-600" />
                                03. Production Year
                            </label>
                            <input 
                                type="number" 
                                placeholder="YYYY" 
                                min="1990"
                                max="2026"
                                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-950 font-bold uppercase tracking-tight text-base focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                                onChange={(e) => setSelection({...selection, year: e.target.value})}
                                value={selection.year}
                            />
                        </div>

                        {/* LICENSE PLATE */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <Hash size={14} className="text-indigo-600" />
                                04. Registration
                            </label>
                            <input 
                                type="text" 
                                placeholder="ABC-XXXX" 
                                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-950 font-bold uppercase tracking-tight text-base focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                                onChange={(e) => setSelection({...selection, license_plate: e.target.value})}
                                value={selection.license_plate}
                            />
                        </div>
                    </div>

                    {/* CONFIRM BUTTON */}
                    <div className="pt-10">
                        <button 
                            onClick={handleConfirm}
                            disabled={isSaving}
                            className="w-full bg-slate-950 text-white py-6 rounded-2xl text-[13px] font-bold uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50 group shadow-lg shadow-indigo-100"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <Car size={18} />
                                    <span>Initialize Digital Garage</span>
                                    <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )} 
                        </button>
                        
                        <div className="mt-10 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-slate-100 pt-8">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span>Awaiting Config</span>
                            </div>
                            <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-500">Secure Channel v2.04</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const ArrowRight = ({ className }) => (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

export default VehicleSelector;