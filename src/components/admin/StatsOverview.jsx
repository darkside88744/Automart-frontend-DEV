import React from 'react';

const StatsOverview = ({ stats }) => {
    // --- ROLE CHECKS ---
    const isSuper = localStorage.getItem('is_superuser') === 'true';
    const isMechanic = localStorage.getItem('is_mechanic') === 'true';
    const isBilling = localStorage.getItem('is_billing') === 'true';
    const isEcommerce = localStorage.getItem('is_ecommerce') === 'true';

    // Define which stats each role is allowed to see
    const statCards = [
        {
            id: 'revenue',
            label: 'Total Revenue',
            subLabel: 'This Month',
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3 1.343 3 3-1.343 3-3 3m0-13c-1.657 0-3 1.343-3 3s1.343 3 3 3 3 1.343 3 3-1.343 3-3 3m0-13V4m0 16v-4m0-12V4m0 16v-4m-6-4h12" />
                </svg>
            ),
            theme: 'text-blue-600 bg-blue-50 border-blue-100',
            show: isSuper || isBilling
        },
        {
            id: 'services',
            label: 'Active Services',
            subLabel: 'Live in Workshop',
            value: stats.pendingServices,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            theme: 'text-emerald-600 bg-emerald-50 border-emerald-100',
            show: isSuper || isMechanic || isBilling
        },
        {
            id: 'quotes',
            label: 'Pending Quotes',
            subLabel: 'Awaiting Approval',
            value: stats.pendingQuotes,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            theme: 'text-indigo-600 bg-indigo-50 border-indigo-100',
            show: isSuper || isMechanic
        },
        {
            id: 'stock',
            label: 'Low Stock',
            subLabel: 'Inventory Alerts',
            value: stats.lowStock,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            theme: 'text-amber-600 bg-amber-50 border-amber-100',
            show: isSuper || isMechanic || isEcommerce
        }
    ];

    const visibleCards = statCards.filter(card => card.show);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className={`grid grid-cols-1 gap-5
                ${visibleCards.length === 1 ? 'md:grid-cols-1' : 
                  visibleCards.length === 2 ? 'md:grid-cols-2' : 
                  visibleCards.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}
            >
                {visibleCards.map((card) => (
                    <div 
                        key={card.id}
                        className="relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 group"
                    >
                        {/* Decorative Background Pattern */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 scale-0 group-hover:scale-100 transition-transform duration-500" />

                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">
                                    {card.label}
                                </p>
                                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {card.value}
                                </h3>
                                <p className="text-slate-400 text-[10px] font-medium mt-1 italic">
                                    {card.subLabel}
                                </p>
                            </div>

                            <div className={`p-3 rounded-xl border ${card.theme} shadow-sm group-hover:scale-110 transition-transform`}>
                                {card.icon}
                            </div>
                        </div>

                        {/* Bottom Bar Indicator */}
                        <div className="mt-5 flex items-center gap-2">
                             <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full w-2/3 rounded-full opacity-60 ${card.theme.split(' ')[0].replace('text', 'bg')}`} />
                             </div>
                             <span className="text-[9px] font-black text-slate-300 uppercase">Live</span>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {visibleCards.length === 0 && (
                    <div className="col-span-full py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                        <div className="inline-flex p-4 rounded-full bg-white shadow-sm border border-slate-100 mb-4 text-slate-400">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </div>
                        <h4 className="text-slate-900 font-bold text-lg">Activity Stream Secure</h4>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">Your role permissions allow access to the control panel but restrict financial and inventory overview cards.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsOverview;