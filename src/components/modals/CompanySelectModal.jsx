import React, { useState, useEffect } from 'react';
import { 
    Building2, 
    Loader2, 
    X, 
    ChevronRight,
    CheckCircle2,
    Database,
    Building,
    User,
    MessageCircle,
    Mail,
    Globe,
    ArrowLeft
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import ContactSupportModal from './ContactSupportModal';

const CompanySelectModal = ({ isOpen, onClose, onSelect, user }) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);

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
            toast.error("Failed to load companies");
        } finally {
            setFetching(false);
        }
    };

    const handleAccessingToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-20 fade-in duration-700' : 'animate-out slide-out-to-right-20 fade-out duration-500'} 
                max-w-[320px] w-full bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0 bg-blue-50/50 rounded-full flex items-center justify-center">
                        <DotLottiePlayer
                            src="/lottiefile/Successffull.lottie"
                            autoplay
                            loop={false}
                        />
                    </div>
                    <div className="flex-grow text-left">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-tight uppercase font-tahoma truncate">{message}</h3>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                {/* Progress Bar Timer */}
                <div className="h-[3px] w-full bg-slate-50">
                    <div 
                        className="h-full bg-gradient-to-r from-[#00BFDE] to-blue-600"
                        style={{ animation: 'toastProgress 3s linear forwards' }}
                    />
                </div>
            </div>
        ), {
            duration: 3000,
            position: 'top-right'
        });
    };

    const handleOpen = async () => {
        const selected = companies.find(c => c.id === selectedCompanyId);
        if (!selected) {
            toast.error('Please select a company first');
            return;
        }
        setLoading(true);
        try {
            await authService.openCompany(userName, selected.id);
            handleAccessingToast(`Accessing ${selected.name}`);
            onSelect();
        } catch (err) {
            toast.error(typeof err === 'object' ? (err.message || "Error opening company") : err);
        } finally {
            setLoading(false);
        }
    };


    const [showSupport, setShowSupport] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
            {/* Cinematic Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            
            <div className="relative w-full max-w-[420px] flex flex-col items-center animate-in slide-in-from-bottom-20 fade-in duration-500">
                
                {/* External Heading (Matching Image Style) */}
                <h3 className="text-white font-mono font-bold tracking-[0.15em] text-[32px] uppercase mb-8 drop-shadow-lg select-none">
                    Select Your Company
                </h3>

                {/* Main Content Area (Separated Div) */}
                <div className="w-full bg-white rounded-[5px] shadow-2xl px-10 pt-12 pb-10 relative mb-4">
                    <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {fetching ? (
                            <div className="py-16 flex flex-col items-center justify-center gap-4">
                                <Loader2 size={32} className="text-[#00D1FF] animate-spin" />
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-mono">Identifying Entities...</p>
                            </div>
                        ) : companies.length === 0 ? (
                            <div className="py-16 text-center text-gray-400 uppercase text-sm font-bold opacity-50">No Data Available</div>
                        ) : (
                            companies.map((company) => {
                                const isSelected = selectedCompanyId === company.id;
                                return (
                                    <div 
                                        key={company.id}
                                        onClick={() => setSelectedCompanyId(company.id)}
                                        className="group cursor-pointer relative"
                                    >
                                        <div className={`flex items-center gap-5 transition-all duration-300 pb-5 mb-1 ${isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}>
                                            <div className={`${isSelected ? 'text-[#00D1FF]' : 'text-gray-400'}`}>
                                                <Building2 size={24} strokeWidth={1.5} />
                                            </div>
                                            <div className="flex-grow text-left">
                                                <p className={`font-bold text-sm uppercase tracking-tight truncate ${isSelected ? 'text-gray-800' : 'text-gray-500'}`}>
                                                    {company.name}
                                                </p>
                                                <p className={`text-[9px] uppercase tracking-[0.2em] font-bold mt-0.5 font-mono ${isSelected ? 'text-[#00D1FF]' : 'text-gray-300'}`}>
                                                    ID: {company.id}
                                                </p>
                                            </div>
                                            {isSelected && <CheckCircle2 size={16} className="text-[#00D1FF]" />}
                                        </div>
                                        {/* Minimalist Separator Line */}
                                        <div className={`h-[1px] w-full transition-all duration-500 ${isSelected ? 'bg-gradient-to-r from-[#00D1FF] to-transparent shadow-[0_1px_2px_rgba(0,209,255,0.3)]' : 'bg-gray-100'}`} />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Cyan Dual Action Bar (Separated into Two Divs with Gap) */}
                <div className="w-full flex gap-4 h-[75px]">
                    <button 
                        onClick={onClose}
                        className="flex-1 bg-[#00D1FF] flex items-center justify-center text-white font-bold text-sm tracking-widest hover:bg-[#00acee] transition-colors uppercase rounded-[5px] shadow-2xl"
                    >
                        Back
                    </button>
                    <button 
                        disabled={loading || !selectedCompanyId}
                        onClick={handleOpen}
                        className="flex-1 bg-[#00D1FF] flex items-center justify-center text-white font-bold text-sm tracking-widest hover:bg-[#00acee] transition-colors uppercase rounded-[5px] shadow-2xl active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Enter Site'}
                    </button>
                </div>

                {/* Subtle Footer Prompt */}
                <button 
                    onClick={() => setShowSupport(true)}
                    className="mt-8 text-white/40 hover:text-white/80 transition-all font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2"
                >
                    <span className="text-[#00D1FF] underline decoration-2 underline-offset-4">Contact Support</span>
                </button>
            </div>

            <ContactSupportModal 
                isOpen={showSupport} 
                onClose={() => setShowSupport(false)} 
            />
        </div>
    );
};

export default CompanySelectModal;
