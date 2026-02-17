import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Settings, 
    Paintbrush, 
    Wrench, 
    CalendarCheck, 
    ChevronRight, 
    UserPlus, 
    Car,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';

/**
 * REFINED SERVICE CARD
 * Modern card with soft transitions and clean iconography
 */
const ServiceCard = ({ icon: Icon, title, desc, onClick, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        onClick={onClick}
        className="group relative p-8 bg-white rounded-3xl border border-slate-200 transition-all duration-500 cursor-pointer flex flex-col justify-between min-h-[320px] hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-200 hover:-translate-y-1"
    >
        <div>
            <div className="mb-8 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                <Icon size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 capitalize tracking-tight">
                {title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-500 font-medium">
                {desc}
            </p>
        </div>
        
        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
                Explore Department
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ArrowRight size={14} />
            </div>
        </div>
    </motion.div>
);

const HomePage = () => {
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [isGuest, setIsGuest] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const guestFlag = localStorage.getItem('is_guest') === 'true';
        
        setIsGuest(!(token && !guestFlag));

        const savedData = localStorage.getItem('user_vehicle');
        if (savedData) {
            try {
                setVehicle(JSON.parse(savedData));
            } catch (e) {
                setVehicle(null);
            }
        } else if (!token && !guestFlag) {
            navigate('/select-vehicle');
        }

        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [navigate]);

    return (
        <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
            
            {/* GRADIENT BLOBS FOR DEPTH */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-slate-100/50 rounded-full blur-[120px] pointer-events-none z-0"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
                
                {/* HERO SECTION */}
                <header className="pt-24 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-7 space-y-8">
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isGuest ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>
                                    {isGuest ? "Guest Protocol Active" : "Authorized Member"}
                                </span>
                                <div className="h-[1px] flex-1 bg-slate-200"></div>
                            </div>
                            
                            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-slate-950 leading-[0.9]">
                                Apex <br /> 
                                <span className="text-indigo-600">Precision.</span>
                            </h1>
                            
                            <p className="max-w-xl text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
                                Professional-grade restoration and mechanical stewardship 
                                {vehicle ? (
                                    <> for your <span className="text-slate-950 font-bold decoration-indigo-500/30 underline underline-offset-4">
                                        {vehicle.year} {vehicle.make} {vehicle.model}
                                    </span>.</>
                                ) : (
                                    " for high-performance automotive platforms."
                                )}
                            </p>

                            <div className="flex items-center gap-6 pt-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <ShieldCheck size={16} className="text-indigo-500" />
                                    OEM Certified
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <ShieldCheck size={16} className="text-indigo-500" />
                                    Expert Technicians
                                </div>
                            </div>
                        </div>

                        {/* REFINED CHASSIS CARD */}
                        <div className="lg:col-span-5">
                            {vehicle ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden group"
                                >
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full transition-transform duration-700 group-hover:scale-150"></div>
                                    
                                    <div className="relative z-10 flex flex-col gap-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-600 mb-1">Active Chassis</p>
                                                <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">{vehicle.model}</h2>
                                                <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-widest">{vehicle.make} • Series {vehicle.year}</p>
                                            </div>
                                            <div className="bg-slate-950 text-white p-3 rounded-2xl">
                                                <Car size={24} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                                <p className="text-xs font-bold text-slate-900">Health Optimal</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registry</p>
                                                <p className="text-xs font-bold text-slate-900">VERIFIED</p>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => navigate('/select-vehicle')}
                                            className="w-full py-4 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 group"
                                        >
                                            Modify Configuration
                                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div 
                                    onClick={() => navigate('/select-vehicle')}
                                    className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                                >
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <Car size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">No Vehicle Selected</h3>
                                    <p className="text-sm text-slate-500 mt-2">Configure your chassis for personalized service recommendations.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* SERVICES GRID */}
                <main className="pb-32">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-950">Expert Departments</h2>
                        <div className="h-[1px] flex-1 bg-slate-100 mx-8"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ServiceCard 
                            icon={Wrench}
                            title="Services"
                            desc="Blueprint-standard engine diagnostics, fluid optimization, and drivetrain calibration for modern engines."
                            delay={0.1}
                            onClick={() => navigate('/services')}
                        />

                        <ServiceCard 
                            icon={Paintbrush}
                            title="Denting and painting"
                            desc="Concours-grade body work, laser-precision paint matching, and advanced ceramic protection."
                            delay={0.2}
                            onClick={() => navigate('/denting-painting')}
                        />

                        <ServiceCard 
                            icon={Settings}
                            title="Spare Archive"
                            desc="Sourcing verified OEM components and performance-grade hardware for legacy and premium models."
                            delay={0.3}
                            onClick={() => navigate('/parts')}
                        />

                        <ServiceCard 
                            icon={CalendarCheck}
                            title="Booking"
                            desc="Direct access to master technicians. Secure your priority slot in our specialized service bay."
                            delay={0.4}
                            onClick={() => navigate('/book-service')}
                        />
                    </div>
                </main>
            </div>

            {/* MINIMAL GUEST ACTION BAR */}
            {isGuest && (
                <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-6 left-6 right-6 z-50"
                >
                    <div className="max-w-5xl mx-auto bg-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 backdrop-blur-md">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <UserPlus size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-widest text-white">Membership Benefits</h4>
                                <p className="text-xs text-slate-400 mt-1">Unlock vehicle history, maintenance tracking, and digital service logs.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/register')}
                            className="w-full md:w-auto px-8 py-4 bg-white text-slate-950 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all transform active:scale-95"
                        >
                            Establish Membership
                        </button>
                    </div>
                </motion.div>
            )}

            {/* SCROLL PROGRESS */}
            <div className="fixed top-0 left-0 w-full h-[3px] bg-slate-100 z-[100]">
                <div 
                    className="h-full bg-indigo-600 transition-all duration-300 ease-out" 
                    style={{ width: `${scrolled ? '100%' : '0%'}` }}
                ></div>
            </div>
        </div>
    );
};

export default HomePage;