import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    UserPlus, 
    User, 
    Mail, 
    Lock, 
    ShieldCheck, 
    ArrowRight, 
    CheckCircle2,
    Activity
} from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            const outData = {
                username: formData.username.trim(),
                email: formData.email.toLowerCase().trim(),
                password: formData.password,
                is_staff: false 
            };

            await api.post('/register/', outData);
            alert("Registration successful! Redirecting to login...");
            navigate('/login');
        } catch (err) {
            const serverMessage = err.response?.data;
            console.error("SERVER REJECTED DATA:", serverMessage);
            alert("REGISTRY ERROR: " + JSON.stringify(serverMessage));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 flex flex-col items-center justify-center p-4 py-12">
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-xl"
            >
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 text-indigo-600">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 mb-2">
                        Create Account
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Join the platform to unlock full vehicle management tools
                    </p>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    {/* Subtle Top Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-blue-500" />

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Username */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="username" 
                                        placeholder="johndoe" 
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        placeholder="user@apex.com" 
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        placeholder="••••••••" 
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Confirm</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <input 
                                        type="password" 
                                        name="confirmPassword" 
                                        placeholder="••••••••" 
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-slate-950 text-white py-5 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 group"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        <span>Provisioning ID...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Profile</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Navigation Footer */}
                    <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                                Login Here
                            </Link>
                        </p>
                        <div className="flex items-center gap-2 text-slate-400">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                Secure Registration
                            </span>
                        </div>
                    </div>
                </div>

                {/* System Stats Footer */}
                <div className="mt-8 flex justify-between items-center px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <Activity size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">API v2.0.4</span>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 APEX_SYSTEMS</span>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;