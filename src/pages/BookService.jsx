import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';

const BookService = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. STATE MANAGEMENT
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(location.state?.selectedServiceId || '');
    const [date, setDate] = useState('');
    const [vehicle] = useState(JSON.parse(localStorage.getItem('user_vehicle')));
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // 2. FETCH SERVICES & AUTH CHECK
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert("Please login to schedule a service.");
            navigate('/login');
            return;
        }

        api.get('/services/')
            .then(res => setServices(res.data))
            .catch(err => console.error("Error fetching services", err));
    }, [navigate]);

    // 3. DATE VALIDATION HELPER
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    // 4. SUBMIT BOOKING LOGIC (SIMPLIFIED: NO UPFRONT PAYMENT)
    const handleBooking = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!date) {
            setErrors({ date: "Please select a date." });
            return;
        }

        const selectedDate = new Date(date);
        if (selectedDate <= new Date()) {
            setErrors({ date: "Appointment must be in the future!" });
            return;
        }

        if (!selectedService) {
            setErrors({ service: "Please select a service." });
            return;
        }

        if (!vehicle?.id) {
            alert("No vehicle selected. Please go back and select a vehicle.");
            navigate('/select-vehicle');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                vehicle: vehicle.id, 
                services: [parseInt(selectedService)],
                appointment_time: date,
                total_amount: 0, // Initial amount is 0; Admin will update this later
                status: 'PENDING',
                payment_status: 'PENDING'
            };

            await api.post('/bookings/', payload);
            
            alert("Appointment Scheduled! Please bring your vehicle on the selected date. You can pay the bill after the service is completed.");
            navigate('/dashboard');

        } catch (err) {
            console.error("Booking Error Data:", err.response?.data);
            alert("Error: " + JSON.stringify(err.response?.data));
        } finally {
            setLoading(false);
        }
    };

    const currentService = services.find(s => s.id === parseInt(selectedService));

   return (
    <div className="min-h-screen w-full relative overflow-x-hidden flex flex-col items-center py-12 px-6 font-sans">
        {/* Dynamic Car Background Layer */}
        <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-slate-950/70 z-10" /> 
            <img 
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000" 
                alt="Background" 
                className="w-full h-full object-cover scale-105"
            />
        </div>

        <div className="relative z-10 w-full max-w-2xl">
            <header className="text-center mb-10 space-y-4">
                <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter drop-shadow-2xl">
                    Secure <span className="text-red-600">Slot</span>
                </h1>
                
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 shadow-2xl">
                    <span className="text-xl">🏎️</span>
                    <p className="text-xs font-black text-white uppercase tracking-[0.2em]">
                        {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "No Vehicle Selected"}
                    </p>
                </div>
            </header>

            <main className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-blue-600 rounded-[3rem] blur opacity-25 transition duration-1000"></div>
                
                <div className="relative bg-white/95 backdrop-blur-2xl border border-white/50 p-8 md:p-12 rounded-[3rem] shadow-2xl">
                    <form onSubmit={handleBooking} className="flex flex-col gap-8">
                        
                        {/* Maintenance Type Select */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-5">
                                Required Service
                            </label>
                            <div className="relative">
                                <select 
                                    value={selectedService} 
                                    onChange={(e) => setSelectedService(e.target.value)}
                                    className={`w-full p-5 bg-slate-100/80 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-blue-600 transition-all outline-none appearance-none cursor-pointer ${errors.service ? 'border-red-500' : ''}`}
                                >
                                    <option value="">-- Choose a Service --</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    ▼
                                </div>
                            </div>
                            {errors.service && <span className="text-red-600 text-[10px] font-black uppercase ml-5 mt-1">{errors.service}</span>}
                        </div>

                        {/* Date & Time Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-5">
                                Select Appointment Date
                            </label>
                            <input 
                                type="datetime-local" 
                                min={getMinDateTime()} 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={`w-full p-5 bg-slate-100/80 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:bg-white focus:border-blue-600 transition-all outline-none ${errors.date ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors.date && <span className="text-red-600 text-[10px] font-black uppercase ml-5 mt-1">{errors.date}</span>}
                        </div>

                        {/* Info Message Card */}
                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex gap-4 items-center">
                            <div className="text-2xl">ℹ️</div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Billing Policy</p>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                    Final pricing is calculated after service completion. You can pay via your dashboard or at the workshop.
                                </p>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="group relative w-full bg-slate-950 overflow-hidden text-white py-6 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl transition-all duration-300 disabled:opacity-50 mt-4 active:scale-95"
                        >
                            <div className="absolute inset-0 w-0 bg-blue-600 transition-all duration-300 ease-out group-hover:w-full"></div>
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {loading ? "Reserving Slot..." : "Confirm Appointment →"}
                            </span>
                        </button>
                    </form>
                </div>
            </main>
            
            <footer className="mt-8 text-center">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Pay later functionality enabled</p>
            </footer>
        </div>
    </div>
);};
export default BookService;