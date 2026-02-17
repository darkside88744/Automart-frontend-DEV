import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    ChevronRight, 
    X, 
    CheckCircle2, 
    AlertCircle, 
    ShoppingBag, 
    ShieldCheck, 
    Truck,
    Filter,
    ArrowRight
} from 'lucide-react';

const SpareParts = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [onlyShowMatched, setOnlyShowMatched] = useState(true); 
    const navigate = useNavigate();
    
    const stripe = useStripe();
    const elements = useElements();

    const [selectedPart, setSelectedPart] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [userData, setUserData] = useState({ phone: '', address: '', city: '', pin: '' });

    const getVehicleData = () => {
        try {
            const data = localStorage.getItem('user_vehicle');
            return data ? JSON.parse(data) : null;
        } catch (e) { return null; }
    };
    const vehicle = getVehicleData();

    useEffect(() => {
        fetchParts();
    }, []);

    const fetchParts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/spare-parts/'); 
            setParts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching parts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetail = (part) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }
        setSelectedPart(part);
        setQuantity(1); 
        setShowDetail(true);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        if (selectedPart.stock < quantity) {
            alert("Insufficient stock available.");
            return;
        }

        setProcessing(true);
        try {
            const { data } = await api.post('/part-orders/checkout/', {
                part_id: selectedPart.id,
                quantity: quantity,
                vehicle_id: vehicle?.id,
                phone_number: userData.phone,
                shipping_address: `${userData.address}, ${userData.city}, ${userData.pin}`,
            });

            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: localStorage.getItem('username') || 'Guest User',
                        phone: userData.phone,
                    },
                },
            });

            if (result.error) {
                alert(result.error.message);
                setProcessing(false);
            } else if (result.paymentIntent.status === 'succeeded') {
                await api.post(`/part-orders/${data.order_id}/verify_part_payment/`, {
                    payment_intent_id: result.paymentIntent.id
                });
                
                alert("Order placed successfully.");
                setShowDetail(false);
                navigate('/dashboard'); 
            }
        } catch (err) {
            alert(err.response?.data?.error || "Transaction failed.");
        } finally {
            setProcessing(false);
        }
    };

    // --- IMPROVED FILTERING LOGIC ---
    const filteredParts = parts.filter(part => {
        const search = searchQuery.toLowerCase().trim();
        
        // Search matches name, brand, OR model
        const matchesSearch = 
            part.name?.toLowerCase().includes(search) ||
            part.brand?.toLowerCase().includes(search) ||
            part.model?.toLowerCase().includes(search);

        // Vehicle Matching (Robust against case and whitespace)
        const vMake = vehicle?.make?.toLowerCase().trim() || "";
        const vModel = vehicle?.model?.toLowerCase().trim() || "";
        
        const pMake = (part.make || part.brand || "").toLowerCase().trim();
        const pModel = (part.model || "").toLowerCase().trim();

        const isMatchedVehicle = vehicle && 
            pMake === vMake && 
            pModel.includes(vModel); // .includes handles variations like "Civic 2022"

        if (onlyShowMatched && vehicle) {
            return matchesSearch && isMatchedVehicle;
        }
        
        return matchesSearch;
    });

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="flex space-x-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
            </div>
            <p className="mt-6 text-sm font-bold text-slate-500 tracking-[0.2em] uppercase">Initializing Inventory...</p>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
                
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-slate-200 pb-12">
                    <div className="max-w-2xl">
                        <nav className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">
                            <ShoppingBag size={14} />
                            <span>Catalog</span>
                            <ChevronRight size={12} className="text-slate-300" />
                            <span className="text-slate-400">Inventory</span>
                        </nav>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-950 mb-6 uppercase">
                            Spare <span className="text-indigo-600">Parts.</span>
                        </h1>
                        <p className="text-lg text-slate-500 leading-relaxed max-w-xl font-medium">
                            {onlyShowMatched && vehicle 
                                ? `Showing certified components strictly compatible with your ${vehicle.make} ${vehicle.model}.`
                                : "Browse our full technical inventory of high-performance automotive components and OEM spares."}
                        </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-6">
                        {vehicle && (
                            <button 
                                onClick={() => setOnlyShowMatched(!onlyShowMatched)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all font-bold text-sm ${
                                    onlyShowMatched 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-600'
                                }`}
                            >
                                <Filter size={16} />
                                {onlyShowMatched ? `Filtered for ${vehicle.model}` : 'Show All Parts'}
                            </button>
                        )}
                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-indigo-600"/> Verified Spares</div>
                            <div className="flex items-center gap-2"><Truck size={14} className="text-indigo-600"/> Priority Dispatch</div>
                        </div>
                    </div>
                </header>

                <div className="relative mb-12 group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={22} />
                    </div>
                    <input 
                        type="text" 
                        placeholder={`Search ${onlyShowMatched ? vehicle?.model : 'all'} by brand, model or name...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-[2rem] pl-16 pr-8 py-6 text-xl shadow-xl shadow-slate-200/40 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-300 font-medium"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredParts.map((part) => (
                        <motion.div 
                            key={part.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ y: -8 }}
                            onClick={() => handleOpenDetail(part)}
                            className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:border-indigo-200"
                        >
                            <div className="relative aspect-square bg-slate-50 flex items-center justify-center p-8">
                                {vehicle && part.make?.toLowerCase().trim() === vehicle.make?.toLowerCase().trim() && (
                                    <div className="absolute top-6 left-6 bg-indigo-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg z-10 tracking-widest uppercase">
                                        Perfect Match
                                    </div>
                                )}
                                <img 
                                    src={part.image || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=600'} 
                                    alt={part.name} 
                                    className={`w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 ${part.stock === 0 ? 'grayscale opacity-30' : ''}`} 
                                />
                                {part.stock <= 0 && (
                                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] bg-white px-4 py-2 rounded-full border border-slate-200">Out of Stock</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{part.brand || 'OEM Standard'}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{part.make} {part.model}</p>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-6 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                                    {part.name}
                                </h3>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <span className="text-2xl font-black text-slate-950 tracking-tighter">₹{part.price.toLocaleString()}</span>
                                    <div className="w-10 h-10 bg-slate-950 text-white rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-all transform group-hover:rotate-[-45deg]">
                                        <ArrowRight size={18} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredParts.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white">
                        <div className="inline-flex p-6 rounded-full bg-slate-50 text-slate-300 mb-6">
                            <AlertCircle size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">No matching components</h3>
                        <p className="text-slate-500 mt-3 font-medium">We couldn't find matches for this selection.</p>
                        {onlyShowMatched && (
                            <button 
                                onClick={() => setOnlyShowMatched(false)}
                                className="mt-8 px-8 py-3 bg-slate-950 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-indigo-600 transition-colors"
                            >
                                Browse Entire Catalog
                            </button>
                        )}
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {showDetail && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => !processing && setShowDetail(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="relative bg-white w-full max-w-6xl rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl min-h-[700px] max-h-[90vh]"
                        >
                            <div className="w-full lg:w-[55%] bg-slate-50 p-8 md:p-16 flex flex-col">
                                <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] tracking-[0.3em] mb-6 uppercase">
                                    <CheckCircle2 size={16} />
                                    {selectedPart?.make?.toLowerCase() === vehicle?.make?.toLowerCase() ? 'Compatibility Guaranteed' : `Fits ${selectedPart?.make} ${selectedPart?.model}`}
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black text-slate-950 mb-8 leading-[0.9] tracking-tighter uppercase">
                                    {selectedPart?.name}
                                </h2>
                                
                                <div className="grid grid-cols-2 gap-8 mb-12">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Availability</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${selectedPart?.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                                            <span className="text-sm font-bold">{selectedPart?.stock > 0 ? `${selectedPart.stock} Units Available` : 'Backordered'}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Logistics</p>
                                        <span className="text-sm font-bold flex items-center gap-2"><Truck size={14} className="text-indigo-600"/> Express 48h Delivery</span>
                                    </div>
                                </div>

                                <div className="mt-auto bg-white p-12 rounded-[2rem] border border-slate-200 flex items-center justify-center shadow-inner group">
                                    <img src={selectedPart?.image} className="max-h-[300px] object-contain transition-transform duration-700 group-hover:scale-110" alt="product" />
                                </div>
                            </div>

                            <div className="w-full lg:w-[45%] bg-white p-8 md:p-16 border-l border-slate-100 overflow-y-auto">
                                <div className="flex justify-between items-center mb-12">
                                    <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight">Checkout</h3>
                                    <button onClick={() => setShowDetail(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                        <X size={28} />
                                    </button>
                                </div>

                                <form onSubmit={handlePlaceOrder} className="space-y-8">
                                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Quantity</span>
                                            <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                <button type="button" className="px-5 py-2 text-xl font-bold hover:bg-slate-50 transition-colors" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                                <span className="px-6 font-black border-x border-slate-200 min-w-[3rem] text-center">{quantity}</span>
                                                <button type="button" className="px-5 py-2 text-xl font-bold hover:bg-slate-50 transition-colors" onClick={() => setQuantity(Math.min(selectedPart?.stock, quantity + 1))}>+</button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Order Total</span>
                                            <span className="text-3xl font-black text-indigo-600 tracking-tighter">₹{(selectedPart?.price * quantity).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Secure Contact Phone</label>
                                                <input required type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all" value={userData.phone} onChange={(e) => setUserData({...userData, phone: e.target.value})} placeholder="+91" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">City</label>
                                                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all" value={userData.city} onChange={(e) => setUserData({...userData, city: e.target.value})} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pin Code</label>
                                                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all" value={userData.pin} onChange={(e) => setUserData({...userData, pin: e.target.value})} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Destination Address</label>
                                                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all" value={userData.address} onChange={(e) => setUserData({...userData, address: e.target.value})} />
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                <ShieldCheck size={14} className="text-emerald-500" />
                                                Stripe Encrypted Payment
                                            </label>
                                            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
                                                <CardElement options={{ style: { base: { fontSize: '16px', fontWeight: '600', color: '#0f172a', '::placeholder': { color: '#94a3b8' } } } }} />
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        disabled={processing || !stripe || selectedPart?.stock === 0}
                                        type="submit"
                                        className="w-full bg-slate-950 text-white py-6 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all transform active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
                                    >
                                        {processing ? 'Processing Transaction...' : selectedPart?.stock === 0 ? 'Inventory Depleted' : 'Authorize Payment'}
                                    </button>

                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <LockIcon /> 256-Bit SSL Encryption
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const LockIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

export default SpareParts;