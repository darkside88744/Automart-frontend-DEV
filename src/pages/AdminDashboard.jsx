import React, { useEffect, useState } from 'react';
import api from '../api';
import axios from 'axios';

// Sub-components
import StatsOverview from "../components/admin/StatsOverview";
import BookingTab from "../components/admin/BookingTab";
import OrdersTab from "../components/admin/OrdersTab";
import DentingTab from "../components/admin/DentingTab";
import ServicesTab from "../components/admin/ServicesTab";
import PartsTab from "../components/admin/PartsTab";

const AdminDashboard = ({ activeTab: routeTab }) => {
    // --- AUTH & ROLES ---
    const isSuper = localStorage.getItem('is_superuser') === 'true';
    const isStaff = localStorage.getItem('is_staff') === 'true'; 
    const isMechanic = localStorage.getItem('is_mechanic') === 'true';
    const isBilling = localStorage.getItem('is_billing') === 'true';
    const isEcommerce = localStorage.getItem('is_ecommerce') === 'true';

    // --- STATE ---
    const [bookings, setBookings] = useState([]);
    const [partOrders, setPartOrders] = useState([]);
    const [dentingRequests, setDentingRequests] = useState([]);
    const [services, setServices] = useState([]);
    const [spareParts, setSpareParts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [activeTab, setActiveTab] = useState(routeTab || 'bookings');
    const [brandSearchQuery, setBrandSearchQuery] = useState(''); 
    const [selectedImg, setSelectedImg] = useState(null);
    const [quotePrice, setQuotePrice] = useState({});
    const [serviceForm, setServiceForm] = useState({ name: '', description: '', base_price: '' });
    
    const [partForm, setPartForm] = useState({
        id: null, name: '', brand: '', model: '', year: '', description: '', price: '', stock: 0, is_available: true, image: null 
    });

    const API_BASE_URL = "http://127.0.0.1:8000"; 

    useEffect(() => {
        if (routeTab) setActiveTab(routeTab);
    }, [routeTab]);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [bookingRes, dentingRes, serviceRes, partsRes, ordersRes] = await Promise.allSettled([
                api.get('/admin-bookings/'),
                api.get('/admin-denting/'),
                api.get('/services/'),
                api.get('/spare-parts/'),
                api.get('/admin-part-orders/')
            ]);

            if (bookingRes.status === 'fulfilled') setBookings(bookingRes.value.data);
            if (dentingRes.status === 'fulfilled') setDentingRequests(dentingRes.value.data);
            if (serviceRes.status === 'fulfilled') setServices(serviceRes.value.data);
            if (partsRes.status === 'fulfilled') setSpareParts(partsRes.value.data);
            if (ordersRes.status === 'fulfilled') setPartOrders(ordersRes.value.data);
        } catch (error) {
            console.error("Critical Admin Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const canSeeTab = (tabName) => {
        if (isSuper || isStaff) return true;
        switch (tabName) {
            case 'bookings': return isBilling; 
            case 'orders': return isEcommerce;
            case 'denting': return isMechanic;
            case 'services': return isMechanic;
            case 'parts': return isMechanic || isEcommerce;
            default: return false;
        }
    };

    const availableTabs = [
        { id: 'bookings', label: 'Bookings', show: canSeeTab('bookings') },
        { id: 'orders', label: 'Inventory Orders', show: canSeeTab('orders') },
        { id: 'denting', label: 'Bodywork', show: canSeeTab('denting') },
        { id: 'services', label: 'Services', show: canSeeTab('services') },
        { id: 'parts', label: 'Stock Management', show: canSeeTab('parts') },
    ].filter(t => t.show);

    // --- HANDLERS (Logics maintained exactly as requested) ---
    const handleFinalizeBooking = async (bookingId, finalAmount) => {
        try {
            await api.post(`/admin-bookings/${bookingId}/finalize_booking/`, { 
                final_amount: parseFloat(finalAmount) 
            });
            alert("Record Finalized.");
            fetchAdminData(); 
        } catch (err) { alert(err.response?.data?.error || "Finalization Error"); }
    };

    const handleStatusChange = async (id, newStatus) => {
        if (newStatus === 'COMPLETED') {
            const booking = bookings.find(b => b.id === id);
            const amount = prompt(`Enter final billing amount:`, booking?.total_amount);
            if (amount) handleFinalizeBooking(id, amount);
            return;
        }
        try {
            await api.patch(`/admin-bookings/${id}/`, { status: newStatus });
            setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
        } catch (err) { alert("Status Update Failed"); }
    };

    const handlePartOrderStatusChange = async (id, newStatus) => {
        try {
            await api.post(`/admin-part-orders/${id}/update_status/`, { status: newStatus });
            setPartOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch (err) { alert("Order Status Update Failed"); }
    };

    const handleGenerateQuote = async (requestId) => {
        const price = quotePrice[requestId];
        if (!price || price <= 0) return alert("Invalid Price");
        try {
            await api.patch(`/admin-denting/${requestId}/`, { estimated_price: price, status: 'Quoted' });
            alert("Quote Sent");
            fetchAdminData(); 
        } catch (err) { alert("Quote Error"); }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        try {
            await api.post('/services/', { ...serviceForm, base_price: 0 });
            setServiceForm({ name: '', description: '', base_price: '' });
            fetchAdminData();
        } catch (err) { alert("Service Add Error"); }
    };

    const handleAddPart = async (e) => {
        if (e) e.preventDefault();
        const formData = new FormData();
        Object.keys(partForm).forEach(key => {
            if (key !== 'id' && partForm[key] !== null) {
                if (key === 'image' && typeof partForm[key] === 'string') return;
                formData.append(key, partForm[key]);
            }
        });
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            };
            if (partForm.id) {
                await axios.patch(`${API_BASE_URL}/api/spare-parts/${partForm.id}/`, formData, config);
                alert("Inventory Updated Successfully");
            } else {
                await axios.post(`${API_BASE_URL}/api/spare-parts/`, formData, config);
                alert("New Part Registered");
            }
            setPartForm({ id: null, name: '', brand: '', model: '', year: '', description: '', price: '', stock: 0, is_available: true, image: null });
            fetchAdminData();
        } catch (err) { 
            alert(err.response?.data?.error || "Inventory Operation Failed"); 
        }
    };

    const handleUpdatePart = async (id, data) => {
        try {
            await api.patch(`/spare-parts/${id}/`, data);
            fetchAdminData();
        } catch (err) { alert("Stock Update Failed"); }
    };

    const handleDeleteItem = async (type, id) => {
        if (!window.confirm("Confirm deletion?")) return;
        try {
            const endpoint = type === 'service' ? `/services/${id}/` : `/spare-parts/${id}/`;
            await api.delete(endpoint);
            fetchAdminData();
        } catch (err) { alert("Delete Failed"); }
    };

    const stats = {
        totalRevenue: bookings.reduce((acc, curr) => (curr.payment_status === 'PAID' ? acc + Number(curr.final_amount || curr.total_amount || 0) : acc), 0),
        pendingServices: bookings.filter(b => b.status === 'PENDING').length,
        pendingQuotes: dentingRequests.filter(r => r.status?.toUpperCase().includes('PENDING')).length,
        lowStock: spareParts.filter(p => p.stock < 5).length
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute text-blue-600 font-bold text-[10px]">AM</div>
            </div>
            <p className="mt-4 text-slate-500 font-medium text-sm animate-pulse tracking-wide">Syncing Workshop Data...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100">
            {/* Image Modal Overlay */}
            {selectedImg && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedImg(null)}>
                    <div className="relative group max-w-4xl">
                        <img src={selectedImg} className="rounded-xl shadow-2xl border-4 border-white/10" alt="Preview" />
                        <button className="absolute -top-4 -right-4 bg-white text-slate-900 w-10 h-10 rounded-full font-bold shadow-lg">✕</button>
                    </div>
                </div>
            )}
            
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-[50] bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-blue-200 shadow-lg">
                            <span className="text-white font-bold text-xs">A</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-slate-800">AutoMart <span className="text-blue-600 font-medium">Control</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[11px] font-bold text-slate-600 border border-slate-200">
                            {isSuper ? "ROOT_ACCESS" : isStaff ? "ADMIN_STAFF" : "OPERATOR"}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                            ID
                        </div>
                    </div>
                </div>
            </nav>

            {/* Dashboard Header */}
            <header className="bg-white border-b border-slate-200 pt-8 pb-12 px-6">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Workshop Overview</h1>
                            <p className="text-slate-500 mt-1 text-sm font-medium">Real-time management and inventory tracking</p>
                        </div>

                        {/* Professional Tab Switcher */}
                        <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1 border border-slate-200 shadow-inner">
                            {availableTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 
                                        ${activeTab === tab.id 
                                        ? 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10">
                        <StatsOverview stats={stats} />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-[1600px] mx-auto px-6 -mt-8 pb-20 relative z-20">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                                {availableTabs.find(t => t.id === activeTab)?.label} Module
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                             <span className="text-[10px] font-bold tracking-widest uppercase">System Active</span>
                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    <div className="p-8">
                        {availableTabs.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-4xl">🔒</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Insufficient Permissions</h3>
                                <p className="text-slate-500 max-w-sm mt-3 leading-relaxed">Your account identity lacks the protocols required to view this module. Please contact systems administrator.</p>
                            </div>
                        )}
                        
                        {/* Tab Content Injection */}
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {activeTab === 'bookings' && canSeeTab('bookings') && (
                                <BookingTab bookings={bookings} handleStatusChange={handleStatusChange} />
                            )}
                            {activeTab === 'orders' && canSeeTab('orders') && (
                                <OrdersTab partOrders={partOrders} handlePartOrderStatusChange={handlePartOrderStatusChange} />
                            )}
                            {activeTab === 'denting' && canSeeTab('denting') && (
                                <DentingTab dentingRequests={dentingRequests} quotePrice={quotePrice} setQuotePrice={setQuotePrice} handleGenerateQuote={handleGenerateQuote} setSelectedImg={setSelectedImg} />
                            )}
                            {activeTab === 'services' && canSeeTab('services') && (
                                <ServicesTab services={services} serviceForm={serviceForm} setServiceForm={setServiceForm} handleAddService={handleAddService} handleDeleteItem={handleDeleteItem} />
                            )}
                            {activeTab === 'parts' && canSeeTab('parts') && (
                                <PartsTab 
                                    spareParts={spareParts} 
                                    partForm={partForm} 
                                    setPartForm={setPartForm} 
                                    handleAddPart={handleAddPart} 
                                    handleUpdatePart={handleUpdatePart}
                                    handleDeleteItem={handleDeleteItem} 
                                    brandSearchQuery={brandSearchQuery} 
                                    setBrandSearchQuery={setBrandSearchQuery} 
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Clean Enterprise Footer */}
            <footer className="border-t border-slate-200 bg-white py-10 px-8">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mainframe v2.4.0</span>
                        </div>
                        <span className="text-slate-300 text-xs">|</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">© 2026 AutoMart Systems Inc.</span>
                    </div>
                    
                    <div className="flex gap-8">
                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Connection Status</span>
                            <span className="text-[11px] font-bold text-slate-700">SSL_SECURED_ENDPOINT</span>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Auth Protocol</span>
                            <span className="text-[11px] font-bold text-blue-600">JWT_BEARER_ACTIVE</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AdminDashboard;