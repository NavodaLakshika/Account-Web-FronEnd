import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    Building2, 
    Loader2, 
    CheckCircle2,
    ArrowLeft,
    PlusCircle
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { showErrorToast } from '../../utils/toastUtils';
import ContactSupportModal from './ContactSupportModal';
import CreateCompanyModal from './CreateCompanyModal';

const SUCCESS_SOUND_URL = '/Music/mrstokes302-success-videogame-sfx-423626.mp3';

const CompanySelectModal = ({ isOpen, onClose, onSelect, user }) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [connectingCompany, setConnectingCompany] = useState(null);
    const [showSupport, setShowSupport] = useState(false);
    const [showCreateCompany, setShowCreateCompany] = useState(false);

    const userName = user ? (user.EmpName || user.empName || user.Emp_Name || 'User') : 'Guest';

    useEffect(() => {
        if (isOpen) {
            fetchUserCompanies();
        }
    }, [isOpen]);

    const fetchUserCompanies = async () => {
        try {
            setFetching(true);
            const data = await authService.getCompaniesByEmployee(userName);
            const mapped = data.map(c => ({
                id: c.companyCode || c.CompanyCode,
                name: c.companyName || c.CompanyName
            }));
            setCompanies(mapped);
            if (mapped.length > 0) {
                setSelectedCompanyId(mapped[0].id);
            }
        } catch (err) {
            console.error("Error fetching companies:", err);
            if (err?.message !== "No companies assigned to this employee." && err?.message !== "Employee not found.") {
                showErrorToast("Failed to load companies");
            }
        } finally {
            setFetching(false);
        }
    };

    const handleOpen = async () => {
        const selected = companies.find(c => c.id === selectedCompanyId);
        if (!selected) {
            showErrorToast('Please select a company first');
            return;
        }
        setLoading(true);
        try {
            await authService.openCompany(userName, selected.id);
            setConnectingCompany(selected.name);

            const audio = new Audio(SUCCESS_SOUND_URL);
            audio.volume = 0.5;
            audio.play().catch(e => console.error("Audio play failed:", e));

            setTimeout(() => onSelect(), 1500);
        } catch (err) {
            showErrorToast(typeof err === 'object' ? (err.message || "Error opening company") : err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 font-['Arial']">
            {/* Clean, frosted glass overlay */}
            <div className="absolute inset-0 bg-slate-800/40 backdrop-blur-sm" />
            
            <div className="relative w-full max-w-md bg-white rounded-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100">
                    <div className="w-12 h-12 bg-blue-50 rounded-none flex items-center justify-center mx-auto mb-4">
                        <Building2 size={24} className="text-[#00acee]" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-tahoma mb-1">
                        Select Your Company
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Choose a workspace to continue
                    </p>
                </div>

                {/* Main Content Area */}
                <div className="px-8 py-6 bg-slate-50/50">
                    <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
                        {fetching ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-3">
                                <Loader2 size={24} className="text-[#00acee] animate-spin" />
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading...</p>
                            </div>
                        ) : companies.length === 0 ? (
                            <div className="py-10 flex flex-col items-center gap-4 text-center">
                                <Building2 size={32} className="text-slate-300" />
                                <p className="text-slate-500 text-sm font-bold">No companies assigned</p>
                                <button onClick={() => setShowCreateCompany(true)}
                                    className="mt-2 px-6 py-2.5 bg-white border border-[#00acee] text-[#00acee] hover:bg-blue-50 font-bold text-sm rounded-none transition-all flex items-center gap-2">
                                    <PlusCircle size={16} />
                                    Create New Company
                                </button>
                            </div>
                        ) : (
                            companies.map((company) => {
                                const isSelected = selectedCompanyId === company.id;
                                return (
                                    <button 
                                        key={company.id}
                                        onClick={() => setSelectedCompanyId(company.id)}
                                        className={`w-full text-left p-4 rounded-none border transition-all flex items-center justify-between ${
                                            isSelected 
                                                ? 'bg-blue-50 border-[#00acee] shadow-sm' 
                                                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-none ${isSelected ? 'bg-white text-[#00acee]' : 'bg-slate-100 text-slate-500'}`}>
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm ${isSelected ? 'text-slate-800' : 'text-slate-600'}`}>
                                                    {company.name}
                                                </p>
                                                <p className={`text-[10px] uppercase tracking-wider font-bold mt-0.5 ${isSelected ? 'text-[#00acee]' : 'text-slate-400'}`}>
                                                    ID: {company.id}
                                                </p>
                                            </div>
                                        </div>
                                        {isSelected && <CheckCircle2 size={20} className="text-[#00acee]" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-6 border-t border-slate-100 bg-white">
                    <div className="flex items-center gap-3 mb-4">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-none transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                        <button 
                            disabled={loading || !selectedCompanyId}
                            onClick={handleOpen}
                            className="flex-1 py-3 px-4 bg-[#00acee] hover:bg-[#0092cc] text-white font-bold text-sm rounded-none transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Enter Site'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <button onClick={() => setShowCreateCompany(true)} className="hover:text-[#00acee] transition-colors">
                            + Create Company
                        </button>
                        <button onClick={() => setShowSupport(true)} className="hover:text-[#00acee] transition-colors underline underline-offset-2">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>

            <ContactSupportModal 
                isOpen={showSupport} 
                onClose={() => setShowSupport(false)} 
            />
            <CreateCompanyModal
                isOpen={showCreateCompany}
                onClose={() => setShowCreateCompany(false)}
                user={user}
                onCreated={() => {
                    setShowCreateCompany(false);
                    fetchUserCompanies();
                }}
            />
        </div>

            {/* Full-page Connecting Overlay */}
            {connectingCompany && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-800/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md mx-auto px-8 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 size={36} className="text-white animate-spin" />
                            <h3 className="text-white text-xl font-bold font-sans tracking-wide">
                                Connecting to {connectingCompany}...
                            </h3>
                            <p className="text-white/70 text-sm font-sans">
                                Initializing workspace
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CompanySelectModal;
