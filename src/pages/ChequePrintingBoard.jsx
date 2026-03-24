import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, X, RotateCcw, Loader2, Landmark, Calendar, Printer, FileText, CheckCircle2, Sliders, Layout, Settings, Save, ArrowRight, Eye, MousePointer2 } from 'lucide-react';
import { bankingService } from '../services/banking.service';
import { toast } from 'react-hot-toast';

const ChequePrintingBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ formats: [] });
    const [pendingCheques, setPendingCheques] = useState([]);
    
    // UI States
    const [selectedCheque, setSelectedCheque] = useState(null);
    const [dateRange, setDateRange] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    // Form / Layout States
    const [layoutConfig, setLayoutConfig] = useState({
        pageX: 0,
        pageY: 0,
        fieldX: 0,
        fieldY: 0,
        activeField: 'Amount Value',
        hideField: false,
        bankFormat: '',
        printPayeeOnly: false,
        normalCrossing: false
    });

    const [chequeData, setChequeData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        payee: '',
        amountText: 'Zero Only'
    });

    // Mock Field Positions (for live drag/drop logic simulation)
    const [fieldPositions, setFieldPositions] = useState({
        'Date': { x: 550, y: 50 },
        'Payee': { x: 80, y: 150 },
        'Amount Text': { x: 100, y: 220 },
        'Amount Value': { x: 450, y: 250 }
    });

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            loadPendingCheques();
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            const res = await bankingService.getChequeFormatLookups();
            setLookups(res);
        } catch (error) {
            toast.error("Format definitions load failed");
        }
    };

    const loadPendingCheques = async () => {
        try {
            setLoading(true);
            const res = await bankingService.getPendingCheques(dateRange);
            setPendingCheques(res);
        } catch (error) {
            toast.error("Failed to load negotiable instruments");
        } finally {
            setLoading(false);
        }
    };

    const handleChequeSelect = (cheque) => {
        setSelectedCheque(cheque);
        setChequeData({
            date: cheque.chequeDate || new Date().toISOString().split('T')[0],
            amount: cheque.amount || 0,
            payee: cheque.payee || '',
            amountText: numberToWords(cheque.amount || 0)
        });
    };

    const numberToWords = (num) => {
        // Simple mock for amount to text
        if (num === 0) return 'Zero Rupees Only';
        return `Rupees ${num.toLocaleString()} Only`;
    };

    const handleSaveFormat = async () => {
        try {
            setLoading(true);
            await bankingService.saveChequeFormatSet({ ...layoutConfig, positions: fieldPositions });
            toast.success("Print protocol alignment saved!");
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handlePrintRequest = () => {
        if (!selectedCheque) return toast.error("Select a cheque from the ledger first.");
        toast.success(`Broadcasting print command for ${selectedCheque.chequeNo}...`);
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Professional Cheque Printing & Alignment Hub"
            maxWidth="max-w-[1300px]"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl font-['Inter']">
                    <div className="flex gap-4">
                        <button onClick={() => {}} className="px-5 h-10 bg-white border border-gray-200 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded hover:bg-slate-50 transition-all active:scale-95 shadow-sm flex items-center gap-2">
                            <Settings size={14} /> Default Settings
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handlePrintRequest} className="px-12 h-10 bg-[#0078d4] text-white text-sm font-bold rounded shadow-xl shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2">
                            <Printer size={18} /> Print Instrument
                        </button>
                        <button onClick={onClose} className="px-10 h-10 bg-white border border-gray-300 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-all flex items-center gap-2">
                             <X size={16} /> Exit
                        </button>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-12 gap-8 font-['Plus_Jakarta_Sans']">
                {/* Left: Interactive Preview & Controls */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Header Controls */}
                    <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-200 rounded-sm">
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase text-slate-400">Page Shift X</span>
                                <input type="number" value={layoutConfig.pageX} onChange={e => setLayoutConfig({...layoutConfig, pageX: parseInt(e.target.value)})} className="w-20 h-8 border border-gray-300 px-2 rounded-sm text-sm font-bold bg-white outline-none focus:border-blue-500" />
                            </label>
                            <label className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase text-slate-400">Page Shift Y</span>
                                <input type="number" value={layoutConfig.pageY} onChange={e => setLayoutConfig({...layoutConfig, pageY: parseInt(e.target.value)})} className="w-20 h-8 border border-gray-300 px-2 rounded-sm text-sm font-bold bg-white outline-none focus:border-blue-500" />
                            </label>
                        </div>
                        <div className="flex gap-2">
                             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-slate-600 text-[10px] font-black uppercase hover:bg-slate-50 rounded-sm transition-all shadow-sm">
                                <Layout size={14} /> Design Mode
                             </button>
                        </div>
                    </div>

                    {/* Live Preview Container (Glassmorphic) */}
                    <div className="relative aspect-[2.2/1] bg-white border-2 border-slate-200 rounded overflow-hidden shadow-inner group">
                        {/* Cheque Background Grid / Mockup */}
                        <div className="absolute inset-0 grid grid-cols-10 grid-rows-6 opacity-[0.03] pointer-events-none">
                            {[...Array(60)].map((_, i) => <div key={i} className="border border-slate-300" />)}
                        </div>

                        {/* Date Boxes (DDMMYYYY) */}
                        <div className="absolute top-6 right-12 flex gap-1 animate-in slide-in-from-right duration-700">
                           {chequeData.date.replace(/-/g, '').split('').map((char, i) => (
                               <div key={i} className="w-8 h-10 border border-slate-200 bg-slate-50/50 flex items-center justify-center text-lg font-mono font-black text-slate-700 shadow-sm first:rounded-l last:rounded-r">
                                   {char}
                               </div>
                           ))}
                        </div>

                        {/* Pay Line */}
                        <div className="absolute top-24 left-10 flex flex-col gap-1 w-2/3">
                            <span className="text-[10px] font-black uppercase text-slate-300 italic tracking-widest">PAY AGAINST THIS INSTRUMENT TO</span>
                            <div className="text-xl font-black text-[#0078d4] border-b-2 border-slate-100 pb-1 italic pl-10 pr-4 truncate">
                                {chequeData.payee || 'SPECIMEN PAYEE NAME'}
                            </div>
                        </div>

                        {/* Amount Text */}
                        <div className="absolute top-44 left-10 flex flex-col gap-1 w-3/4">
                            <span className="text-[10px] font-black uppercase text-slate-300 italic tracking-widest">THE SUM OF RUPEES</span>
                            <div className="text-sm font-bold text-slate-600 border-b border-dashed border-slate-200 pb-1 italic pl-10 leading-relaxed uppercase">
                                {chequeData.amountText}
                            </div>
                        </div>

                        {/* Amount Value Box */}
                        <div className="absolute top-52 right-12">
                             <div className="relative px-8 py-4 bg-[#f8fafd] border-4 border-slate-700/10 rounded min-w-[200px] text-right shadow-2xl">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 italic">Rs.</span>
                                  <span className="text-3xl font-black text-slate-800 tracking-tighter tabular-nums italic">
                                      {chequeData.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                  </span>
                             </div>
                        </div>

                        {/* Crossings (Optional) */}
                        {layoutConfig.normalCrossing && (
                            <div className="absolute top-0 left-0 p-8">
                                <div className="border-t-2 border-b-2 border-slate-300 px-6 py-1 rotate-[-35deg] text-[10px] font-black text-slate-400 tracking-widest">
                                    A/C PAYEE ONLY
                                </div>
                            </div>
                        )}

                        {/* Overlay Controls (Hidden by default, shown on hover/active) */}
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-2 border-[#0078d4] m-[1px]">
                             <div className="absolute top-4 left-4 bg-[#0078d4] text-white text-[9px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-widest">
                                 Live Virtual Preview
                             </div>
                        </div>
                    </div>

                    {/* Bottom Controls Grid */}
                    <div className="grid grid-cols-12 gap-8 bg-white p-8 border border-slate-100 rounded shadow-sm">
                         {/* Manual Override Fields */}
                         <div className="col-span-12 lg:col-span-6 space-y-5">
                            <div className="grid grid-cols-12 items-center gap-4">
                                <label className="col-span-3 text-[11px] font-black uppercase text-slate-400">Date</label>
                                <div className="col-span-9 flex items-center px-3 h-10 border border-gray-200 bg-white rounded shadow-sm">
                                    <input type="date" value={chequeData.date} onChange={e => setChequeData({...chequeData, date: e.target.value})} className="flex-1 text-[13px] font-bold text-slate-700 outline-none bg-transparent" />
                                    <Calendar size={14} className="text-blue-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-12 items-center gap-4">
                                <label className="col-span-3 text-[11px] font-black uppercase text-slate-400">Amount</label>
                                <input type="number" step="0.01" value={chequeData.amount} onChange={e => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setChequeData({...chequeData, amount: val, amountText: numberToWords(val)});
                                }} className="col-span-9 h-10 border border-gray-200 px-4 text-[14px] font-black text-slate-700 rounded outline-none focus:border-blue-500 shadow-sm" />
                            </div>
                            <div className="grid grid-cols-12 items-center gap-4">
                                <label className="col-span-3 text-[11px] font-black uppercase text-slate-400">Payee</label>
                                <input type="text" value={chequeData.payee} onChange={e => setChequeData({...chequeData, payee: e.target.value})} className="col-span-9 h-10 border border-gray-200 px-4 text-[13px] font-bold text-slate-700 rounded outline-none focus:border-blue-500 shadow-sm" />
                            </div>
                            <div className="flex gap-6 pl-[25%] pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={layoutConfig.printPayeeOnly} onChange={e => setLayoutConfig({...layoutConfig, printPayeeOnly: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#0078d4] transition-all" />
                                    <span className="text-[11px] font-bold text-slate-500 group-hover:text-[#0078d4] transition-colors">Print Payee Only</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={layoutConfig.normalCrossing} onChange={e => setLayoutConfig({...layoutConfig, normalCrossing: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[#0078d4] transition-all" />
                                    <span className="text-[11px] font-bold text-slate-500 group-hover:text-[#0078d4] transition-colors">Normal Crossing</span>
                                </label>
                            </div>
                         </div>

                         {/* Alignment Fine Tuning */}
                         <div className="col-span-12 lg:col-span-6 space-y-4 border-l border-slate-100 pl-8">
                             <div className="grid grid-cols-12 items-center gap-4">
                                 <label className="col-span-4 text-[11px] font-black uppercase text-slate-400">Active Field</label>
                                 <select value={layoutConfig.activeField} onChange={e => setLayoutConfig({...layoutConfig, activeField: e.target.value})} className="col-span-8 h-10 border border-gray-200 px-3 bg-white text-sm font-bold text-slate-700 rounded outline-none">
                                     {Object.keys(fieldPositions).map(f => <option key={f}>{f}</option>)}
                                 </select>
                             </div>
                             <div className="grid grid-cols-12 items-center gap-4">
                                 <div className="col-span-6 flex items-center gap-3">
                                     <span className="text-[11px] font-black uppercase text-slate-400">Field X</span>
                                     <input type="number" value={layoutConfig.fieldX} onChange={e => setLayoutConfig({...layoutConfig, fieldX: parseInt(e.target.value)})} className="flex-1 h-9 border border-gray-300 px-2 rounded-sm text-sm font-bold outline-none" />
                                 </div>
                                 <div className="col-span-6 flex items-center gap-3">
                                     <span className="text-[11px] font-black uppercase text-slate-400">Field Y</span>
                                     <input type="number" value={layoutConfig.fieldY} onChange={e => setLayoutConfig({...layoutConfig, fieldY: parseInt(e.target.value)})} className="flex-1 h-9 border border-gray-300 px-2 rounded-sm text-sm font-bold outline-none" />
                                 </div>
                             </div>
                             <div className="flex justify-between items-center pt-4">
                                 <button onClick={handleSaveFormat} className="px-10 h-10 bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest rounded shadow-md hover:bg-black transition-all active:scale-95 flex items-center gap-2">
                                     <Save size={14} /> Update Alignment
                                 </button>
                                 <div className="flex gap-4">
                                     <button className="w-10 h-10 bg-slate-50 text-slate-400 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all"><RotateCcw size={18} /></button>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Right: Negotiation List Side Panel */}
                <div className="col-span-12 lg:col-span-4 flex flex-col h-[750px] border border-slate-200 rounded overflow-hidden shadow-xl bg-white">
                    <div className="bg-[#f8fafd] p-6 border-b border-slate-200 space-y-4">
                        <div className="flex items-center gap-2">
                            <Sliders size={18} className="text-[#0078d4]" />
                            <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-600">Instruments Repository</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase ml-1">From</span>
                                <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} className="h-9 border border-gray-200 px-3 text-[12px] font-bold rounded outline-none focus:border-blue-400" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase ml-1">To</span>
                                <input type="date" value={dateRange.to} onChange={e => {
                                    setDateRange({...dateRange, to: e.target.value});
                                    loadPendingCheques();
                                }} className="h-9 border border-gray-200 px-3 text-[12px] font-bold rounded outline-none focus:border-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 sticky top-0 border-b border-slate-100 shadow-sm z-10 font-[Inter]">
                                <tr>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document / Cheque</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valuation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {pendingCheques.length > 0 ? pendingCheques.map((cheque, idx) => (
                                    <tr 
                                        key={idx} 
                                        onClick={() => handleChequeSelect(cheque)}
                                        className={`cursor-pointer transition-all hover:bg-blue-50/50 group ${selectedCheque?.chequeNo === cheque.chequeNo ? 'bg-blue-50 border-l-4 border-l-[#0078d4]' : 'border-l-4 border-l-transparent'}`}
                                    >
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-black text-slate-700 uppercase tracking-tighter">{cheque.chequeNo}</span>
                                                <span className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">{cheque.payee}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`text-[13px] font-black tabular-nums transition-colors ${selectedCheque?.chequeNo === cheque.chequeNo ? 'text-[#0078d4]' : 'text-slate-600'}`}>
                                                    {cheque.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                </span>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[9px] font-black text-[#0078d4] uppercase">Select</span>
                                                    <ArrowRight size={10} className="text-[#0078d4]" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={2} className="p-12 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-20">
                                                <Search size={48} />
                                                <span className="text-[11px] font-black uppercase">No instruments found</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-slate-50 p-4 border-t border-slate-100">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                             <span>Total Selection</span>
                             <span className="text-[#0078d4] italic">{pendingCheques.length} Records</span>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default ChequePrintingBoard;
