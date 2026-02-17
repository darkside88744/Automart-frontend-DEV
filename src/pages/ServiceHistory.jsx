import React, { useEffect, useState, useMemo } from 'react';
import api from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';

const ServiceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // --- MODAL STATE ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({
    odometer_reading: '',
    admin_notes: '',
    parts_replaced: ''
  });

  // --- ROLE CHECKS ---
  const isSuperuser = localStorage.getItem('is_superuser') === 'true';
  const isMechanic = localStorage.getItem('is_mechanic') === 'true';
  const isBilling = localStorage.getItem('is_billing') === 'true';
  const isStaff = localStorage.getItem('is_staff') === 'true';
  const hasStaffPrivileges = isSuperuser || isMechanic || isBilling || isStaff;
  const canEdit = hasStaffPrivileges;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/history/');
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter((record) => {
      const recordDate = new Date(record.completion_date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start && recordDate < start) return false;
      if (end && recordDate > end) return false;

      const customerName = record.user_username || record.user?.username || "Unknown";
      const vehicleInfo = `${record.vehicle_make} ${record.vehicle_name || record.vehicle?.model || ''}`;
      const searchTarget = `${customerName} ${vehicleInfo} ${record.services_rendered}`.toLowerCase();
      
      return searchTarget.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, history, startDate, endDate]);

  // --- EDIT LOGIC ---
  const openEditModal = (e, record) => {
    e.stopPropagation();
    setSelectedRecord(record);
    setEditFormData({
      odometer_reading: record.odometer_reading || '',
      admin_notes: record.admin_notes || '',
      parts_replaced: record.parts_replaced || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/history/${selectedRecord.id}/update/`, editFormData);
      setShowEditModal(false);
      fetchHistory();
    } catch (err) {
      alert("System update failed. Please check network connectivity.");
    }
  };

  // --- PDF LOGIC ---
  const handleDownloadSequence = async (record) => {
    generateIndividualPDF(record);
    if (record.attachment_url) {
      window.open(record.attachment_url, '_blank');
    }
  };

  const generateIndividualPDF = (record) => {
    const doc = new jsPDF();
    const customer = record.user_username || record.user?.username || "N/A";
    
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('SERVICE INVOICE', 14, 25);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Report ID: LOG-${record.id}`, 160, 25);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Customer Details:', 14, 55);
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${customer}`, 14, 62);
    doc.text(`Date: ${new Date(record.completion_date).toLocaleDateString()}`, 14, 69);

    doc.setFont(undefined, 'bold');
    doc.text('Vehicle Info:', 120, 55);
    doc.setFont(undefined, 'normal');
    doc.text(`Vehicle: ${record.vehicle_make} ${record.vehicle_name || ''}`, 120, 62);
    doc.text(`Odometer: ${record.odometer_reading} KM`, 120, 69);

    autoTable(doc, {
      startY: 85,
      head: [['Description', 'Quantity', 'Amount']],
      body: [[record.services_rendered, '1', `INR ${record.total_paid}`]],
      theme: 'striped',
      headStyles: { fillColor: [225, 29, 72] }
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFont(undefined, 'bold');
    doc.text('Technician Notes:', 14, finalY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(record.admin_notes || "No notes provided.", 14, finalY + 7, { maxWidth: 180 });

    doc.save(`Invoice_LOG_${record.id}.pdf`);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Service Logbook Archive', 14, 22);
    autoTable(doc, {
      head: [["Date", "Customer", "Vehicle", "Cost"]],
      body: filteredHistory.map(r => [
        new Date(r.completion_date).toLocaleDateString(),
        r.user_username || "N/A",
        `${r.vehicle_make}`,
        `INR ${r.total_paid}`
      ]),
      startY: 30,
      headStyles: { fillColor: [15, 23, 42] },
    });
    doc.save('Logbook_Export.pdf');
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-[4px] border-slate-900 border-t-red-600 rounded-full animate-spin mb-4"></div>
      <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Syncing_Records...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-20 px-6 pt-24 font-mono">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-b-4 border-slate-900 pb-10">
          <div>
            <span className="bg-red-600 text-white text-[10px] px-3 py-1 font-black uppercase tracking-widest mb-4 inline-block">System_Archive_V2</span>
            <h1 className="text-7xl font-black tracking-tighter uppercase leading-[0.8] mb-2">
              Service <br /> <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #0f172a' }}>Logbook.</span>
            </h1>
          </div>
          <button 
            onClick={generatePDF} 
            className="group relative bg-slate-900 text-white px-10 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-3 overflow-hidden shadow-[8px_8px_0_0_#e2e8f0]"
          >
            <span className="relative z-10">Download Master CSV/PDF</span>
            <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </header>

        {/* INDUSTRIAL FILTERS */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Filter_By_Identity', val: searchQuery, set: setSearchQuery, type: 'text', placeholder: 'Search...' },
            { label: 'Start_Deployment', val: startDate, set: setStartDate, type: 'date' },
            { label: 'End_Deployment', val: endDate, set: setEndDate, type: 'date' }
          ].map((field) => (
            <div key={field.label} className="group relative bg-white border-2 border-slate-200 p-4 hover:border-slate-900 transition-colors shadow-sm">
              <label className="absolute -top-3 left-4 px-2 bg-white text-[9px] font-black text-slate-400 group-hover:text-red-600 uppercase tracking-widest z-10 transition-colors">
                {field.label}
              </label>
              <input 
                type={field.type}
                placeholder={field.placeholder}
                className="w-full bg-transparent text-[11px] font-black uppercase outline-none pt-1"
                value={field.val}
                onChange={(e) => field.set(e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* LOGBOOK ENTRIES */}
        <div className="space-y-6">
          {filteredHistory.length > 0 ? filteredHistory.map((record) => {
            const isOpen = expandedId === record.id;
            return (
              <div key={record.id} className={`group bg-white border-2 transition-all duration-300 overflow-hidden ${isOpen ? 'border-slate-900 shadow-[12px_12px_0_0_#f1f5f9]' : 'border-slate-100 hover:border-slate-300 shadow-sm'}`}>
                
                {/* LIST ITEM HEADER */}
                <div onClick={() => setExpandedId(isOpen ? null : record.id)} className="p-8 flex flex-col md:flex-row items-center justify-between cursor-pointer gap-6">
                  <div className="flex gap-8 items-center w-full md:w-auto">
                    <div className={`w-16 h-16 flex flex-col items-center justify-center border-2 transition-colors ${isOpen ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      <span className="text-xl font-black">{new Date(record.completion_date).getDate()}</span>
                      <span className="text-[8px] font-black uppercase">{new Date(record.completion_date).toLocaleString('en-US', {month: 'short'})}</span>
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-tighter text-2xl group-hover:text-red-600 transition-colors">
                        {record.vehicle_make} {record.vehicle_name || record.vehicle?.model}
                      </h3>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Client: {record.user_username || "Standard_User"}</span>
                         <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {record.id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total_Settled</p>
                      <span className="font-black italic text-3xl text-slate-900">₹{record.total_paid}</span>
                    </div>
                    <div className={`p-2 rounded-full border border-slate-100 transition-transform duration-500 ${isOpen ? 'rotate-180 bg-slate-900 text-white' : ''}`}>
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                {/* EXPANDABLE PROFILE */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}} exit={{height: 0, opacity: 0}} className="overflow-hidden border-t-2 border-slate-50">
                      <div className="p-8 bg-[#FAFAFA]">
                        
                        {/* DATA GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                            {[
                                {label: 'Odometer_Log', val: `${record.odometer_reading || 0} KM`},
                                {label: 'Hardware_Swaps', val: record.parts_replaced || 'None_Logged'},
                                {label: 'Technician_ID', val: 'SYS_ADMIN'},
                                {label: 'Registry_Status', val: 'Verified', color: 'text-emerald-600'}
                            ].map(item => (
                                <div key={item.label} className="bg-white p-5 border border-slate-200">
                                    <p className="text-[8px] font-black uppercase text-slate-400 mb-2">{item.label}</p>
                                    <p className={`text-xs font-black uppercase truncate ${item.color || 'text-slate-900'}`}>{item.val}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black uppercase text-red-600 mb-4 tracking-[0.2em] flex items-center gap-2">
                                    <span className="w-8 h-[2px] bg-red-600"></span> Operations_Rendered
                                </p>
                                <div className="flex flex-wrap gap-2">
                                {record.services_rendered?.split(',').map((s, i) => (
                                    <span key={i} className="text-[9px] bg-slate-900 text-white px-4 py-2 font-black uppercase italic transform -skew-x-12">
                                    <div className="skew-x-12">{s.trim()}</div>
                                    </span>
                                ))}
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Technical_Assessment</p>
                                <div className="bg-white border-l-4 border-slate-900 p-6 shadow-sm">
                                    <p className="text-xs font-medium leading-relaxed italic text-slate-600 uppercase">
                                    " {record.admin_notes || "No diagnostic summary was submitted for this operation sequence."} "
                                    </p>
                                </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col justify-end gap-4">
                            <button onClick={() => handleDownloadSequence(record)} className="group bg-red-600 text-white py-5 px-8 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-between">
                              Generate_Physical_Invoice 
                              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            </button>
                            {canEdit && (
                              <button onClick={(e) => openEditModal(e, record)} className="border-2 border-slate-900 text-slate-900 py-5 px-8 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                                Revise_System_Entry
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No_Records_Found_In_Selected_Range</p>
            </div>
          )}
        </div>
      </div>

      {/* --- ADMINISTRATIVE UPDATE MODAL --- */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowEditModal(false)} />
            <motion.div initial={{y: 50, opacity: 0}} animate={{y: 0, opacity: 1}} exit={{y: 50, opacity: 0}} className="relative w-full max-w-2xl bg-white border-[6px] border-slate-900 shadow-2xl">
              
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                <div>
                    <h2 className="font-black uppercase tracking-tighter text-2xl italic">System_Override</h2>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Modify_Record: LOG-{selectedRecord?.id}</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="w-10 h-10 border-2 border-white/20 hover:bg-red-600 hover:border-red-600 flex items-center justify-center transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-10 space-y-8">
                {/* READ ONLY INFO */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-100 pb-8">
                  {[
                    {h: 'Client', v: selectedRecord?.user_username},
                    {h: 'Make', v: selectedRecord?.vehicle_make},
                    {h: 'Model', v: selectedRecord?.vehicle_name || selectedRecord?.vehicle?.model},
                    {h: 'Core_Ops', v: selectedRecord?.services_rendered?.split(',')[0]}
                  ].map(stat => (
                    <div key={stat.h}>
                        <p className="text-[8px] font-black uppercase text-slate-400 mb-1">{stat.h}</p>
                        <p className="text-[10px] font-black uppercase truncate text-slate-900">{stat.v || 'N/A'}</p>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Odometer_Update (KM)</label>
                    <input 
                      type="number"
                      required
                      className="w-full bg-slate-50 border-2 border-slate-200 p-4 text-xs font-black outline-none focus:border-red-600 transition-colors"
                      value={editFormData.odometer_reading}
                      onChange={(e) => setEditFormData({...editFormData, odometer_reading: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Component_Swaps</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border-2 border-slate-200 p-4 text-xs font-black outline-none focus:border-red-600 transition-colors"
                      placeholder="Identify hardware..."
                      value={editFormData.parts_replaced}
                      onChange={(e) => setEditFormData({...editFormData, parts_replaced: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Operational_Notes</label>
                  <textarea 
                    rows="4"
                    className="w-full bg-slate-50 border-2 border-slate-200 p-4 text-xs font-bold outline-none focus:border-red-600 transition-colors"
                    placeholder="Enter diagnostic summary..."
                    value={editFormData.admin_notes}
                    onChange={(e) => setEditFormData({...editFormData, admin_notes: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-5 border-2 border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">Discard_Changes</button>
                  <button type="submit" className="flex-1 py-5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-[6px_6px_0_0_#0f172a]">Push_System_Update</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceHistory;