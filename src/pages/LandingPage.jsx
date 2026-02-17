import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, ShieldCheck, Cpu, Globe, Activity } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    // Mouse Tracking for Heavy Parallax Effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const moveX = clientX - window.innerWidth / 2;
        const moveY = clientY - window.innerHeight / 2;
        mouseX.set(moveX);
        mouseY.set(moveY);
    };

    // Smooth Spring Physics
    const springConfig = { damping: 30, stiffness: 100 };
    const dx = useSpring(mouseX, springConfig);
    const dy = useSpring(mouseY, springConfig);

    // Transform layers
    const bgTextMove = useTransform(dx, (value) => value / 15);

    // Animation Variants
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
        visible: { 
            opacity: 1, 
            y: 0, 
            filter: "blur(0px)",
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
        }
    };

    return (
        <div 
            onMouseMove={handleMouseMove}
            className="min-h-screen w-full bg-[#f8fafc] text-slate-950 flex flex-col relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-700 font-sans"
        >
            {/* 1. SOPHISTICATED BACKGROUND ELEMENTS */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="absolute inset-0 z-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

            {/* 2. PARALLAX BACKGROUND TEXT */}
            <motion.div 
                style={{ x: bgTextMove, y: useTransform(dy, v => v / 20) }}
                className="absolute top-[-5%] left-[-5%] text-[22vw] font-black text-slate-200/40 select-none leading-none tracking-tighter"
            >
                APEX
            </motion.div>
            
            <motion.div 
                style={{ x: useTransform(dx, v => v / -20), y: useTransform(dy, v => v / -15) }}
                className="absolute bottom-[-5%] right-[-5%] text-[18vw] font-black text-slate-200/40 select-none leading-none tracking-tighter"
            >
                v2.0
            </motion.div>

            {/* 3. MAIN CONTENT */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-24 py-20">
                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="max-w-7xl mx-auto w-full"
                >
                    {/* Dept Indicator */}
                    <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-10">
                        <div className="h-[2px] w-12 bg-indigo-600 rounded-full" />
                        <span className="text-[12px] font-bold uppercase tracking-[0.4em] text-indigo-600/80">
                            Digital Automotive Ecosystem
                        </span>
                    </motion.div>

                    {/* Hero Headline */}
                    <motion.h1 
                        variants={fadeInUp}
                        className="text-6xl md:text-[9.5rem] font-black tracking-tight uppercase leading-[0.85] mb-12"
                    >
                        Elite <br /> 
                        <span className="text-indigo-600">Performance.</span>
                    </motion.h1>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        {/* Description */}
                        <motion.div variants={fadeInUp} className="lg:col-span-6">
                            <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed mb-12 max-w-xl">
                                Engineering the next generation of <span className="text-slate-900">vehicle management.</span> 
                                High-fidelity data meeting architectural elegance and 
                                <span className="text-indigo-600 font-bold italic"> precision control.</span>
                            </p>
                            
                            {/* CTA Group */}
                            <div className="flex flex-col sm:flex-row gap-5">
                                <button 
                                    onClick={() => navigate('/register')}
                                    className="px-10 py-5 bg-slate-950 text-white text-[12px] font-bold uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center gap-4 group shadow-xl shadow-slate-200"
                                >
                                    Create Account
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                
                                <button 
                                    onClick={() => {
                                        localStorage.clear();
                                        localStorage.setItem('is_guest', 'true');
                                        navigate('/select-vehicle');
                                        window.location.reload();
                                    }}
                                    className="px-10 py-5 bg-white border border-slate-200 text-slate-950 text-[12px] font-bold uppercase tracking-widest rounded-2xl hover:border-indigo-600 hover:text-indigo-600 transition-all duration-300"
                                >
                                    Sign in as Guest 
                                </button>
                            </div>
                        </motion.div>

                        {/* Technical Specs Decor */}
                        <motion.div 
                            variants={fadeInUp}
                            className="lg:col-start-9 lg:col-span-4 hidden lg:block space-y-8"
                        >
                            <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Cpu size={60} />
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-indigo-600" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Protocol</p>
                                        </div>
                                        <p className="text-sm font-bold uppercase text-slate-900">Tier-IV Encrypted Storage</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Globe size={14} className="text-indigo-600" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment</p>
                                        </div>
                                        <p className="text-sm font-bold uppercase text-slate-900">v2.0.46 Global Edge</p>
                                    </div>
                                    <div className="pt-4">
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div 
                                                animate={{ x: ["-100%", "100%"] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent w-1/2"
                                            />
                                        </div>
                                        <div className="mt-2 flex justify-between items-center">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">System Pulse</span>
                                            <span className="text-[9px] font-bold text-indigo-600 uppercase">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* 4. FIXED SIDEBAR INFO */}
            <div className="hidden xl:flex fixed right-12 top-1/2 -translate-y-1/2 flex-col gap-12 z-20">
                <div className="rotate-90 origin-right text-[10px] font-black uppercase tracking-[0.6em] text-slate-300">
                    Proprietary Tech — 2026
                </div>
            </div>

            {/* 5. FOOTER INFO BAR */}
            <footer className="w-full p-12 z-20">
                <div className="max-w-7xl mx-auto flex justify-between items-end border-t border-slate-200 pt-10">
                    <div className="flex gap-16">
                        <div className="space-y-1">
                            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Network Node</span>
                            <span className="block text-[11px] font-bold text-slate-900">Primary_US_East</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Latency</span>
                            <div className="flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" />
                                <span className="block text-[11px] font-bold text-slate-900">14ms Optimal</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Environment Ready</span>
                        <div className="flex gap-1">
                            {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-indigo-600" />)}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;