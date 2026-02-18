import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, 
    Lock, 
    User, 
    ArrowRight, 
    Mail, 
    ChevronLeft,
    Activity,
    UserPlus,
    UserCircle2
} from 'lucide-react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState(''); 
    const [isForgotPassword, setIsForgotPassword] = useState(false); 
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // FIXED: Removed extra /api/ because your axios instance likely already has it
            const res = await api.post('/login/', { username, password });
            localStorage.clear();

            // Extract tokens and user data
            const { access, refresh, user } = res.data;

            // Store Tokens
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('is_guest', 'false');

            // CRITICAL: Check if 'user' object exists before accessing its properties
            if (!user) {
                console.warn("Login successful, but no user data returned. Check backend serializer.");
                alert("Login successful, but user details are missing from the server response.");
                navigate('/home'); // Fallback redirect
                return;
            }

            // Store User Details
            localStorage.setItem('username', user.username || '');
            localStorage.setItem('is_staff', user.is_staff ? 'true' : 'false'); 
            localStorage.setItem('is_superuser', user.is_superuser ? 'true' : 'false'); 
            localStorage.setItem('is_mechanic', user.is_mechanic ? 'true' : 'false');
            localStorage.setItem('is_billing', user.is_billing ? 'true' : 'false');
            localStorage.setItem('is_ecommerce', user.is_ecommerce ? 'true' : 'false');

            const isAnyStaff = user.is_staff || user.is_superuser || user.is_mechanic || user.is_billing || user.is_ecommerce;

            // Redirection Logic
            if (isAnyStaff) {
                navigate('/admin-panel'); 
            } else if (user.has_vehicle) {
                try {
                    const vehicleRes = await api.get('/vehicles/'); 
                    if (vehicleRes.data.length > 0) {
                        localStorage.setItem('user_vehicle', JSON.stringify(vehicleRes.data[0]));
                    }
                } catch (vErr) {
                    console.error("Vehicle fetch error:", vErr);
                }
                navigate('/home'); 
            } else {
                navigate('/select-vehicle'); 
            }
            
            window.location.reload(); 
        } catch (err) {
            console.error("Login Error:", err);
            const errorMsg = err.response?.data?.detail || "Identity verification failed. Please check your credentials.";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/password-reset/', { email });
            alert("If an account exists, a recovery link has been sent.");
            setIsForgotPassword(false);
        } catch (err) {
            alert("Error sending reset link.");
        } finally {
            setLoading(false);
        }
    };

    const handleGuestMode = () => {
        localStorage.clear();
        localStorage.setItem('is_guest', 'true');
        const savedVehicle = localStorage.getItem('user_vehicle');
        if (!savedVehicle) {
            navigate('/select-vehicle');
        } else {
            navigate('/home');
        }
        window.location.reload();
    };

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 flex flex-col items-center justify-center p-4">
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 text-indigo-600">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 mb-2">
                        {isForgotPassword ? "Account Recovery" : "Welcome Back"}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {isForgotPassword ? "Enter your email to reset access" : "Login to manage your vehicle services"}
                    </p>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 md:p-10 shadow-xl shadow-slate-200/50">
                    <AnimatePresence mode='wait'>
                        {!isForgotPassword ? (
                            <motion.form 
                                key="login"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onSubmit={handleLogin} 
                                className="space-y-5"
                            >
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="Username" 
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                            required 
                                        />
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input 
                                            type="password" 
                                            placeholder="Password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button 
                                        type="button"
                                        onClick={() => setIsForgotPassword(true)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:shadow-none"
                                >
                                    {loading ? 'Authenticating...' : (
                                        <>
                                            Sign In <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form 
                                key="forgot"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onSubmit={handleForgotPassword} 
                                className="space-y-6"
                            >
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input 
                                        type="email" 
                                        placeholder="Enter your email address" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
                                        required 
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:bg-slate-200"
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </button>

                                <button 
                                    type="button"
                                    onClick={() => setIsForgotPassword(false)}
                                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                                >
                                    <ChevronLeft size={14} /> Back to Login
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-100"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-bold">
                            <span className="bg-white px-4 text-slate-300 tracking-widest">or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => navigate('/register')}
                            className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                        >
                            <UserPlus size={14} /> Create Account
                        </button>
                        <button 
                            onClick={handleGuestMode}
                            className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                        >
                            <UserCircle2 size={14} /> Guest Mode
                        </button>
                    </div>
                </div>

                {/* System Status */}
                <div className="mt-8 flex justify-between items-center px-4">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Secure</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v2.0.46</span>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;