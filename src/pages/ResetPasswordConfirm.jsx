import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const ResetPasswordConfirm = () => {
    const { uid, token } = useParams(); // Grabs values from the URL
    console.log("URL Params detected by React:", { uid, token });
    const navigate = useNavigate();
    
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        const cleanUid = uid.replace(/[=\s]/g, '');
        const cleanToken = token.replace(/[=\s]/g, '');
        console.log("SENDING TO BACKEND:", { uid, token, new_password: password });
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            // We will create this backend endpoint next
            await axios.post('http://127.0.0.1:8000/api/password-reset-confirm/', {
                uid,
                token,
                new_password: password
            });
            alert("Password updated successfully! Redirecting to login...");
            navigate('/login');
        } catch (err) {
            setMessage("Link expired or invalid. Please request a new one.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#FAFAFA] flex items-center justify-center px-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100"
            >
                <h2 className="text-2xl font-black uppercase italic mb-6">New <span className="text-red-600">Password</span></h2>
                <form onSubmit={handleReset} className="space-y-4">
                    <input 
                        type="password"
                        placeholder="New Password"
                        className="w-full px-7 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-red-500 transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input 
                        type="password"
                        placeholder="Confirm New Password"
                        className="w-full px-7 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-red-500 transition-all"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button 
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                    {message && <p className="text-red-600 text-[10px] font-bold uppercase text-center">{message}</p>}
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPasswordConfirm;