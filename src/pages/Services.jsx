import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, 
    ArrowRight, 
    Clock, 
    Activity, 
    ChevronRight,
    Search,
    Wrench
} from 'lucide-react';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get('/services/');
                setServices(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching services:", error);
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleBookNow = (serviceId) => {
        navigate('/book-service', { state: { selectedServiceId: serviceId } });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
                <div className="relative w-24 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ left: "-100%" }}
                        animate={{ left: "100%" }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="absolute top-0 bottom-0 w-1/2 bg-indigo-600 rounded-full"
                    />
                </div>
                <p className="mt-8 font-bold uppercase tracking-[0.4em] text-slate-400 text-[10px]">
                    Synchronizing Archives
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 pb-32">
            
            {/* AMBIENT BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-100/50 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
                
                {/* --- HEADER --- */}
                <header className="pt-24 pb-16">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-[2px] w-10 bg-indigo-600"></div>
                                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600/70">Operation Catalogue</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-slate-950 leading-[0.85]">
                                Technical <br /> 
                                <span className="text-indigo-600">Services.</span>
                            </h1>
                        </div>
                        <div className="max-w-md lg:text-right">
                            <p className="text-lg text-slate-500 leading-relaxed font-medium mb-6">
                                Precision stewardship for high-performance automotive platforms. Managed by master technicians.
                            </p>
                            <div className="flex flex-wrap lg:justify-end gap-3">
                                <span className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 shadow-sm">
                                    Direct Billing
                                </span>
                                <span className="px-4 py-2 bg-indigo-600 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-200">
                                    Certified OEM
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* --- SERVICES GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
                    {services.map((service, index) => (
                        <motion.div 
                            key={service.id} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-[2.5rem] p-10 flex flex-col justify-between border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-100 transition-all duration-500"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-10">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                        <Wrench size={24} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Active</span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight group-hover:text-indigo-600 transition-colors">
                                    {service.name}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-8 font-medium">
                                    {service.description}
                                </p>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Est: 2-4 Hours</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Activity size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Level: Expert</span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => handleBookNow(service.id)}
                                    className="w-full py-5 bg-slate-950 text-white rounded-[1.25rem] text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-200 flex items-center justify-center gap-3 group/btn"
                                >
                                    Initiate Booking
                                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* --- PROCEDURAL SECTION --- */}
                <section className="mt-32">
                    <div className="bg-slate-950 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px]" />
                        
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h4 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-8">
                                    Bespoke <br /> Requirements?
                                </h4>
                                <p className="text-slate-400 text-lg leading-relaxed font-medium mb-10 max-w-md">
                                    Our technical department handles specialized restorations, custom liveries, and vintage drivetrain overhauls.
                                </p>
                                <button 
                                    onClick={() => navigate('/denting-painting')}
                                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-3 w-fit"
                                >
                                    Request Custom Appraisal
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { title: "Digital Slots", text: "Instant reservation in our primary service bay." },
                                    { title: "Appraisal", text: "Comprehensive on-site technical inspection." },
                                    { title: "Dynamic Billing", text: "Transparent costs tied to your member archive." },
                                    { title: "Final Logs", text: "Verified service stamp in your digital logbook." }
                                ].map((step, i) => (
                                    <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                                        <div className="text-indigo-500 font-black text-xl mb-3">0{i+1}</div>
                                        <h5 className="text-white text-sm font-bold uppercase tracking-widest mb-2">{step.title}</h5>
                                        <p className="text-slate-500 text-xs leading-relaxed font-medium">{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Services;