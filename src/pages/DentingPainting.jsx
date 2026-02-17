import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const DentingPainting = () => {
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const vehicle = JSON.parse(localStorage.getItem('user_vehicle'));

    // Handle Image Preview
    useEffect(() => {
        if (!image) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(image);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [image]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert("Please login to request a quote.");
            navigate('/login');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('description', description);
        if (image) formData.append('damage_image', image);
        formData.append('vehicle_make', vehicle?.make || 'Unknown');
        formData.append('vehicle_model', vehicle?.model || 'Vehicle');

        try {
            await api.post('/denting-requests/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Request sent! Our team will contact you with a quote.");
            navigate('/home');
        } catch (err) {
            alert("Failed to send request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-zinc-50 relative overflow-x-hidden flex flex-col items-center pt-24 pb-12">
            
            {/* 1. BACKGROUND DECORATION */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-zinc-900/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl px-6">
                
                {/* 2. HEADER */}
                <header className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-zinc-200 rounded-full mb-4 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Estimate Service</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase text-zinc-900 tracking-tighter leading-none mb-6">
                        Denting & <span className="text-red-600">Painting</span>
                    </h1>
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-zinc-500 font-medium max-w-lg">
                            Upload photos and describe the damage. Our experts will provide a digital quote within 24 hours.
                        </p>
                        {vehicle && (
                            <div className="mt-2 px-4 py-2 bg-zinc-900 text-white rounded-2xl flex items-center gap-3 shadow-xl">
                                <span className="text-lg">🚗</span>
                                <span className="text-xs font-bold uppercase tracking-widest">
                                    {vehicle.make} {vehicle.model}
                                </span>
                            </div>
                        )}
                    </div>
                </header>

                {/* 3. FORM CARD */}
                <main className="w-full flex justify-center">
                    <form 
                        onSubmit={handleSubmit} 
                        className="w-full max-w-2xl bg-white/80 backdrop-blur-2xl border border-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 md:p-12 flex flex-col gap-10"
                    >
                        {/* Damage Description */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                                    Damage Details
                                </label>
                                <span className="text-[10px] text-zinc-300 font-bold uppercase">Required</span>
                            </div>
                            <textarea 
                                rows="4" 
                                placeholder="Tell us what happened (e.g. 'Scratched rear bumper while parking...')"
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className="w-full p-8 bg-zinc-50/50 border border-zinc-100 rounded-[2rem] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] text-zinc-900 placeholder:text-zinc-300 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all outline-none resize-none text-lg font-medium"
                            />
                        </div>

                        {/* Image Upload Area */}
                        <div className="flex flex-col gap-4">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-2">
                                Visual Evidence
                            </label>
                            
                            <div className="relative group">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => setImage(e.target.files[0])} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                
                                <div className={`w-full min-h-[200px] border-2 border-dashed rounded-[2.5rem] transition-all flex flex-col items-center justify-center overflow-hidden
                                    ${preview ? 'border-red-500 bg-white' : 'border-zinc-200 bg-zinc-50/50 group-hover:border-red-400 group-hover:bg-red-50/30'}`}>
                                    
                                    {preview ? (
                                        <div className="relative w-full h-full">
                                            <img src={preview} alt="Damage preview" className="w-full h-[250px] object-cover" />
                                            <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-black uppercase tracking-widest bg-zinc-900/80 px-4 py-2 rounded-full">Change Photo</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 p-8">
                                            <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center text-2xl">
                                                📸
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-black text-zinc-900 uppercase tracking-tighter">Click to upload photo</p>
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">PNG, JPG up to 10MB</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Action */}
                        <div className="flex flex-col gap-6">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-zinc-900 hover:bg-red-600 text-white py-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-zinc-200 hover:shadow-red-200 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Generating Request...
                                        </>
                                    ) : (
                                        <>
                                            Get Free Quote
                                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </>
                                    )}
                                </span>
                            </button>
                            
                            <div className="flex items-center justify-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500 text-lg">✓</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Secure Transfer</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500 text-lg">✓</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">No Obligation</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </main>

                {/* Footer Info */}
                <p className="mt-12 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] leading-loose max-w-md mx-auto">
                    Automart uses professional paint-matching technology. 
                    Your privacy is protected under our standard service agreement.
                </p>
            </div>
        </div>
    );
};

export default DentingPainting;