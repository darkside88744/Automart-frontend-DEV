import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Menu, 
    X, 
    LogOut, 
    Shield, 
    LayoutDashboard, 
    Car, 
    Wrench, 
    Settings, 
    ShoppingBag, 
    History,
    Activity,
    ChevronRight
} from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    // --- AUTH & ROLE CHECKS ---
    const isAuthenticated = !!localStorage.getItem('access_token');
    const isGuest = localStorage.getItem('is_guest') === 'true';
    
    const rawVehicle = localStorage.getItem('user_vehicle');
    let vehicle = null;
    try {
        vehicle = rawVehicle ? JSON.parse(rawVehicle) : null;
    } catch (e) {
        console.error("Error parsing vehicle data", e);
    }

    const isSuper = localStorage.getItem('is_superuser') === 'true'; 
    const isStaff = localStorage.getItem('is_staff') === 'true'; 
    const isMechanic = localStorage.getItem('is_mechanic') === 'true';
    const isBilling = localStorage.getItem('is_billing') === 'true';
    const isEcommerce = localStorage.getItem('is_ecommerce') === 'true';

    const hasAdminAccess = isSuper || isStaff || isMechanic || isBilling || isEcommerce;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.clear();
        setIsMenuOpen(false);
        navigate('/login');
        window.location.reload(); 
    };

    const isActive = (path) => location.pathname === path;

    const getRoleInfo = () => {
        if (isSuper) return { label: 'ROOT ADMIN', color: 'bg-indigo-600' };
        if (isStaff) return { label: 'STAFF OPS', color: 'bg-blue-600' };
        if (isMechanic) return { label: 'ENGINEERING', color: 'bg-slate-800' };
        if (isBilling) return { label: 'FINANCE', color: 'bg-emerald-600' };
        if (isEcommerce) return { label: 'LOGISTICS', color: 'bg-indigo-500' };
        return null;
    };
    const role = getRoleInfo();

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-500 ${
            scrolled 
            ? 'py-3 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm' 
            : 'py-6 bg-[#f8fafc] border-b border-transparent'
        }`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex justify-between items-center">
                    
                    {/* --- BRAND --- */}
                    <Link to={hasAdminAccess ? "/admin-panel" : "/"} className="flex items-center gap-3 group">
                        <div className="bg-slate-950 p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-300">
                            <Activity className="text-white" size={20} />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center">
                                <span className="text-xl font-black tracking-tighter text-slate-950 uppercase leading-none">AUTO</span>
                                <span className="text-xl font-bold tracking-tighter text-indigo-600 uppercase leading-none">MART</span>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Registry v2.0</span>
                        </div>
                    </Link>

                    {/* --- DESKTOP NAV --- */}
                    <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/60">
                        {hasAdminAccess ? (
                            <>
                                <NavLink to="/admin-panel" active={isActive('/admin-panel')}>Command</NavLink>
                                {(isMechanic || isSuper || isBilling || isStaff) && (
                                    <NavLink to="/admin/records" active={isActive('/admin/records')}>Records</NavLink>
                                )}
                                {isSuper && <NavLink to="/admin/staff" active={isActive('/admin/staff')}>Staff</NavLink>}
                            </>
                        ) : (
                            <>
                                {isAuthenticated && !isGuest && (
                                    <>
                                        <NavLink to="/home" active={isActive('/home')}>Home</NavLink>
                                        <NavLink to="/services" active={isActive('/services')}>Services</NavLink>
                                        <NavLink to="/parts" active={isActive('/parts')}>Hardware</NavLink>
                                        <NavLink to="/dashboard" active={isActive('/dashboard')}>Garage</NavLink>
                                        <NavLink to="/history" active={isActive('/history')}>Logs</NavLink>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* --- ACTION AREA --- */}
                    <div className="flex items-center gap-3">
                        {/* Status Badges */}
                        <div className="hidden lg:block">
                            {role ? (
                                <div className={`px-4 py-2 rounded-xl ${role.color} text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-200`}>
                                    <Shield size={12} />
                                    {role.label}
                                </div>
                            ) : (vehicle && (
                                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                                    <Car size={12} className="text-indigo-600" />
                                    {vehicle.make} <span className="text-slate-300">/</span> {vehicle.model}
                                </div>
                            ))}
                        </div>

                        {/* Auth Button */}
                        {(isAuthenticated || isGuest) ? (
                            <button 
                                onClick={handleLogout}
                                className="h-11 w-11 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-xl transition-all duration-300"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        ) : (
                            <Link 
                                to="/login" 
                                className="bg-slate-950 text-white px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md active:scale-95"
                            >
                                Sign In
                            </Link>
                        )}

                        {/* Mobile Toggle */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            className="md:hidden h-11 w-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MOBILE PANEL --- */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
                    >
                        <div className="p-6 space-y-3">
                            {hasAdminAccess ? (
                                <>
                                    <MobileNavLink to="/admin-panel" icon={<LayoutDashboard size={18}/>}>Command Center</MobileNavLink>
                                    {(isBilling || isSuper || isStaff) && <MobileNavLink to="/admin/bookings" icon={<History size={18}/>}>Deployment List</MobileNavLink>}
                                    {(isEcommerce || isSuper || isStaff) && <MobileNavLink to="/admin/orders" icon={<ShoppingBag size={18}/>}>Hardware Queue</MobileNavLink>}
                                    {isSuper && <MobileNavLink to="/admin/staff" icon={<Settings size={18}/>}>Personnel Registry</MobileNavLink>}
                                </>
                            ) : (
                                <>
                                    <MobileNavLink to="/home" icon={<Activity size={18}/>}>System Home</MobileNavLink>
                                    <MobileNavLink to="/services" icon={<Wrench size={18}/>}>Services</MobileNavLink>
                                    {isAuthenticated && !isGuest && (
                                        <>
                                            <MobileNavLink to="/parts" icon={<ShoppingBag size={18}/>}>Hardware Store</MobileNavLink>
                                            <MobileNavLink to="/dashboard" icon={<Car size={18}/>}>Asset Status</MobileNavLink>
                                            <MobileNavLink to="/history" icon={<History size={18}/>}>Service Logs</MobileNavLink>
                                        </>
                                    )}
                                </>
                            )}
                            
                            {isAuthenticated && (
                                <button 
                                    onClick={handleLogout} 
                                    className="w-full mt-4 p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-red-100"
                                >
                                    <LogOut size={16} />
                                    Terminate Session
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

// --- SUBCOMPONENTS ---

const NavLink = ({ to, children, active }) => (
    <Link 
        to={to} 
        className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest transition-all rounded-xl
            ${active 
                ? 'text-indigo-600 bg-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
    >
        {children}
    </Link>
);

const MobileNavLink = ({ to, children, icon, onClick }) => (
    <Link 
        to={to} 
        onClick={onClick} 
        className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group active:bg-slate-100 transition-colors"
    >
        <div className="flex items-center gap-3">
            <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">{icon}</span>
            <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{children}</span>
        </div>
        <ChevronRight size={16} className="text-slate-300" />
    </Link>
);

export default Navbar;