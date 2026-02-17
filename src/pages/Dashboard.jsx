import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Checkout from './Checkout'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wrench, 
    Camera, 
    Package, 
    RefreshCw, 
    Plus, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    X,
    ArrowRight,
    CreditCard,
    History,
    Shield
} from 'lucide-react';

const Dashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [partOrders, setPartOrders] = useState([]);
    const [dentingRequests, setDentingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const [activeTab, setActiveTab] = useState('bookings'); 
    const [showCheckout, setShowCheckout] = useState(false);
    const [activeBookingId, setActiveBookingId] = useState(null);

    const navigate = useNavigate();
    const API_BASE_URL = "http://127.0.0.1:8000";

    const fetchAllData = useCallback(async (quiet = false) => {
        if (!quiet) setLoading(true);
        else setIsRefreshing(true);

        try {
            const [bookingsRes, partsRes, dentingRes] = await Promise.allSettled([
                api.get('/bookings/'),
                api.get('/part-orders/'),
                api.get('/denting-requests/')
            ]);
            
            setBookings(bookingsRes.status === 'fulfilled' ? bookingsRes.value.data : []);
            setPartOrders(partsRes.status === 'fulfilled' ? partsRes.value.data : []);
            setDentingRequests(dentingRes.status === 'fulfilled' ? dentingRes.value.data : []);

            if (bookingsRes.status === 'rejected' && bookingsRes.reason.response?.status === 401) {
                navigate('/login');
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Confirm cancellation of this hardware procurement?")) return;
        try {
            await api.post(`/part-orders/${orderId}/cancel_order/`);
            fetchAllData(true); 
        } catch (err) {
            alert(err.response?.data?.error || "An error occurred.");
        }
    };

    const handlePaymentClick = (bookingId) => {
        setActiveBookingId(bookingId);
        setShowCheckout(true);
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-10 h-10 border-2 border-indigo-100 border-t-indigo-600 rounded-full mb-6"
            />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Syncing Command Center</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 pb-20">
            {/* AMBIENT BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px]" />
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {showCheckout && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                        >
                            <button 
                                onClick={() => setShowCheckout(false)}
                                className="absolute right-8 top-8 p-2 text-slate-400 hover:text-red-500 transition-colors z-10"
                            >
                                <X size={20} />
                            </button>
                            <Checkout 
                                bookingId={activeBookingId} 
                                onSuccess={() => { setShowCheckout(false); fetchAllData(true); }} 
                                onCancel={() => setShowCheckout(false)} 
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-24">
                
                {/* Header Section */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-[2px] w-10 bg-indigo-600"></div>
                            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">Operational Hub</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-950 leading-tight">
                            Control <span className="text-indigo-600">Center.</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => fetchAllData(true)}
                            className={`p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50 transition-all ${isRefreshing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`}
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button 
                            onClick={() => navigate('/services')} 
                            className="flex items-center gap-3 bg-slate-950 text-white px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all"
                        >
                            <Plus size={16} />
                            New Service
                        </button>
                    </div>
                </header>

                {/* Navigation Tabs */}
                <div className="flex p-1.5 bg-slate-200/50 backdrop-blur-sm rounded-[2rem] mb-12 w-fit">
                    {[
                        { id: 'bookings', label: 'Mechanical', icon: Wrench, count: bookings.length },
                        { id: 'quotes', label: 'Bodywork', icon: Camera, count: dentingRequests.length },
                        { id: 'parts', label: 'Hardware', icon: Package, count: partOrders.length }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-8 py-3.5 rounded-3xl transition-all duration-300 ${
                                activeTab === tab.id 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                            <span className="text-xs font-bold uppercase tracking-widest">{tab.label}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-indigo-100' : 'bg-slate-200/50'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="min-h-[400px]"
                >
                    {/* 1. MECHANICAL TAB */}
                    {activeTab === 'bookings' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {bookings.length === 0 ? (
                                <div className="lg:col-span-2"><EmptyState message="No Mechanical History" /></div>
                            ) : (
                                bookings.map(b => (
                                    <div key={b.id} className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 hover:border-indigo-100 transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                                    <History size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 uppercase tracking-tight">
                                                        {b.service_names?.join(' + ') || 'Calibration'}
                                                    </h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                                                        <Clock size={12} /> {new Date(b.appointment_time).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                b.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                            }`}>
                                                {b.status}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                            <div>
                                                <p className="text-2xl font-black text-slate-950 tracking-tighter">₹{Number(b.final_amount || b.total_amount || 0).toLocaleString()}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${b.payment_status === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                                        {b.payment_status === 'PAID' ? 'Settled' : 'Action Required'}
                                                    </p>
                                                </div>
                                            </div>
                                            {b.status === 'COMPLETED' && b.payment_status !== 'PAID' ? (
                                                <button 
                                                    onClick={() => handlePaymentClick(b.id)} 
                                                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-950 transition-all flex items-center gap-2"
                                                >
                                                    <CreditCard size={14} /> Settle
                                                </button>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                                                    <ArrowRight size={16} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* 2. BODYWORK TAB */}
                    {activeTab === 'quotes' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dentingRequests.length === 0 ? (
                                <div className="lg:col-span-3"><EmptyState message="No Aesthetic Requests" /></div>
                            ) : (
                                dentingRequests.map(req => (
                                    <div key={req.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40 group hover:border-indigo-100 transition-all">
                                        <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                                            <img 
                                                src={req.damage_image ? (req.damage_image.startsWith('http') ? req.damage_image : `${API_BASE_URL}${req.damage_image}`) : "https://via.placeholder.com/400x300"} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                alt="Vehicle Damage"
                                            />
                                            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                                Log #{req.id}
                                            </div>
                                        </div>
                                        <div className="p-8">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">{req.vehicle_model}</h4>
                                            <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">{req.description}</p>
                                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quote</span>
                                                <span className="text-xl font-black tracking-tighter text-slate-950">
                                                    {req.estimated_price ? `₹${Number(req.estimated_price).toLocaleString()}` : "EVALUATING"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* 3. HARDWARE TAB */}
                    {activeTab === 'parts' && (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {partOrders.length === 0 ? (
                                            <tr><td colSpan="5"><EmptyState message="No Orders Found" /></td></tr>
                                        ) : (
                                            partOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                    <td className="px-10 py-6">
                                                        <p className="font-bold text-slate-900 uppercase tracking-tight">{order.part_details?.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: PRT-{order.id}</p>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600">
                                                            {/* Fixed Logic: uses quantity from API, defaults to 1 only if truly missing */}
                                                            {order.quantity ?? order.qty ?? 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'Cancelled' ? 'bg-red-500' : 'bg-indigo-500'}`} />
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${order.status === 'Cancelled' ? 'text-red-600' : 'text-slate-900'}`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <span className="font-bold text-slate-950 tracking-tighter">
                                                            {/* Multiplies price by actual quantity */}
                                                            ₹{((order.part_details?.price || 0) * (order.quantity ?? order.qty ?? 1)).toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        {(order.status === 'Pending' || order.status === 'Confirmed') ? (
                                                            <button 
                                                                onClick={() => handleCancelOrder(order.id)}
                                                                className="text-[10px] font-black text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest"
                                                            >
                                                                Cancel Order
                                                            </button>
                                                        ) : (
                                                            <CheckCircle2 size={18} className="text-slate-200 ml-auto" />
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

const EmptyState = ({ message }) => (
    <div className="py-24 bg-white rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6">
            <Shield size={24} strokeWidth={1.5} />
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">{message}</p>
        <button className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:underline">
            Initiate System Check
        </button>
    </div>
);

export default Dashboard;