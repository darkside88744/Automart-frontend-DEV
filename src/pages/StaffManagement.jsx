import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
    Users, 
    ShieldCheck, 
    Wrench, 
    Receipt, 
    ShoppingBag, 
    Search,
    ArrowRight,
    Activity,
    Lock,
    ShieldAlert,
    UserCheck,
    Mail,
    Hash,
    ChevronRight,
    RefreshCcw,
    AlertCircle
} from 'lucide-react';

const StaffManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState('admin'); 
    const currentUsername = localStorage.getItem('username');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users/');
            setUsers(res.data);
        } catch (err) {
            console.error("Vault access error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, username, roleField) => {
        // Prevention logic for self-lockout
        if (username === currentUsername && roleField === 'is_staff') {
            alert("CRITICAL ERROR: Self-revocation of administrative rights is blocked to prevent system lockout.");
            return;
        }

        const actionName = roleField.replace('is_', '').toUpperCase();
        if (!window.confirm(`Update [${actionName}] access for ${username}?`)) return;

        try {
            // This patch MUST match your backend toggle_role logic
            await api.patch(`/admin/users/${userId}/toggle_role/`, { role: roleField });
            
            // Update local state immediately
            setUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, [roleField]: !u[roleField] } : u
            ));
        } catch (err) {
            alert("Update failed. This typically happens if the backend session has expired.");
        }
    };

    const filtered = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = {
        admin: { label: 'Administrators', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', field: 'is_staff', data: filtered.filter(u => u.is_staff) },
        mechanic: { label: 'Technical Staff', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50', field: 'is_mechanic', data: filtered.filter(u => u.is_mechanic) },
        billing: { label: 'Financial Control', icon: Receipt, color: 'text-emerald-600', bg: 'bg-emerald-50', field: 'is_billing', data: filtered.filter(u => u.is_billing) },
        ecommerce: { label: 'Inventory Mgr', icon: ShoppingBag, color: 'text-sky-600', bg: 'bg-sky-50', field: 'is_ecommerce', data: filtered.filter(u => u.is_ecommerce) },
        customers: { label: 'Full Directory', icon: Users, color: 'text-slate-600', bg: 'bg-slate-50', field: 'is_customer', data: filtered }
    };

    const UserTable = ({ data, categoryKey }) => {
        const cat = categories[categoryKey];

        return (
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Identity</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Matrix</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">System Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.length > 0 ? data.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-inner transition-transform group-hover:scale-105">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 text-sm tracking-tight">{user.username}</span>
                                                    {user.username === currentUsername && (
                                                        <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-md font-black">ROOT_USER</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 mt-0.5 text-slate-400">
                                                    <Mail size={12} />
                                                    <span className="text-[11px] font-medium">{user.email || 'internal@system.void'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-1.5">
                                            {/* Synced with your logic: is_staff = ADMIN label */}
                                            {user.is_staff && <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase border border-indigo-100">ADMIN</span>}
                                            {user.is_mechanic && <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-black uppercase border border-amber-100">MECHANIC</span>}
                                            {user.is_billing && <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase border border-emerald-100">FINANCE</span>}
                                            {user.is_ecommerce && <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 text-[9px] font-black uppercase border border-sky-100">STORE</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-1.5">
                                            {['is_staff', 'is_mechanic', 'is_billing', 'is_ecommerce'].map(role => (
                                                <button 
                                                    key={role}
                                                    onClick={() => handleRoleUpdate(user.id, user.username, role)}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all border 
                                                        ${user[role] 
                                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                                                            : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-400 hover:bg-slate-50'}`}
                                                >
                                                    {role.replace('is_', '')}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <ShieldAlert size={48} strokeWidth={1} />
                                            <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-900">Zero Entries Found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-5">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Matrix</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-white w-full font-sans antialiased text-slate-900">
            <div className="w-full mx-auto max-w-7xl pb-24 pt-12 px-8">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.3em]">
                            <Activity size={14} />
                            <span>System Control</span>
                            <ChevronRight size={12} className="text-slate-300" />
                            <span className="text-slate-400">Permissions</span>
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter text-slate-900">Governance</h2>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                        <button onClick={fetchUsers} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95">
                            <RefreshCcw size={18} />
                        </button>
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600" />
                            <input 
                                type="text" 
                                placeholder="Search by identity..." 
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none text-sm transition-all"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* --- ANALYTICS CARDS --- */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
                    {Object.entries(categories).map(([key, config]) => (
                        <button 
                            key={key}
                            onClick={() => setCurrentView(key)}
                            className={`p-6 rounded-3xl border transition-all duration-300 text-left relative
                                ${currentView === key 
                                    ? 'bg-white border-indigo-600 shadow-2xl shadow-indigo-500/10 -translate-y-1' 
                                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}
                        >
                            <div className={`mb-4 w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color}`}>
                                <config.icon size={20} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{config.label}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-black tracking-tighter">{config.data.length}</span>
                                {currentView === key && <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>}
                            </div>
                        </button>
                    ))}
                </div>

                {/* --- MAIN TABLE --- */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
                                Current View: {categories[currentView].label}
                            </h3>
                        </div>
                        {currentView === 'admin' && (
                            <div className="flex items-center gap-2 text-amber-500 bg-amber-50 px-3 py-1 rounded-md text-[9px] font-black border border-amber-100">
                                <AlertCircle size={10} />
                                CHANGES REQUIRE RE-LOGIN TO SYNC PANELS
                            </div>
                        )}
                    </div>
                    
                    <UserTable 
                        data={categories[currentView].data} 
                        categoryKey={currentView} 
                    />
                </div>

                {/* --- FOOTER --- */}
                <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-slate-100">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Hash size={12} /> System_Build_2026.4
                        </div>
                        <div className="h-4 w-[1px] bg-slate-200"></div>
                        <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                            Admin.OS v4.0.1
                        </div>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 italic">
                        Administrative access changes take effect immediately on current sessions.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StaffManagement;