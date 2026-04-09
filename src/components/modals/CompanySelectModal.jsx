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

            {/* Sliding Support Drawer - Compact Symmetric Style (RESPONSIVE) */}
            <div className={`fixed right-4 bottom-4 md:right-12 md:bottom-12 z-[110] transition-transform duration-700 ease-out ${showSupport ? 'translate-y-0' : 'translate-y-[calc(100%+48px)]'}`}>
                <div 
                    className="w-[calc(100vw-32px)] md:w-[420px] h-[280px] relative transition-all duration-700 [perspective:1000px]"
                >
                    <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                        
                        {/* FRONT SIDE (Direct Contact) */}
                        <div className="absolute inset-0 w-full h-full bg-white rounded-[5px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 p-7 [backface-visibility:hidden] flex flex-col justify-center overflow-y-auto custom-scrollbar">
                            <button 
                                onClick={() => setShowSupport(false)}
                                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-[#00acee] transition-colors"
                            >
                                <X size={18} />
                            </button>

                            <div>
                                <div className="text-center mb-6">
                                    <h4 className="text-[#1a1a1a] font-mono font-bold text-[13px] uppercase tracking-[0.3em] mb-2 leading-none">Need Assistance?</h4>
                                    <div className="w-8 h-[2px] bg-[#00D1FF] mx-auto" />
                                </div>

                                <div className="space-y-3">
                                    <a 
                                        href="https://wa.me/94771234567" 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5c] text-white flex items-center justify-center gap-3 rounded-[5px] transition-all active:scale-[0.97] group shadow-lg shadow-green-500/10"
                                    >
                                        <MessageCircle size={16} />
                                        <span className="font-bold text-[10px] uppercase tracking-widest">WhatsApp Support</span>
                                    </a>
                                    
                                    <a 
                                        href="mailto:it-help@onimta.com" 
                                        className="w-full py-3.5 bg-[#00D1FF] hover:bg-[#00acee] text-white flex items-center justify-center gap-3 rounded-[5px] transition-all active:scale-[0.97] group shadow-lg shadow-cyan-500/10"
                                    >
                                        <Mail size={16} />
                                        <span className="font-bold text-[10px] uppercase tracking-widest">Email Support Desk</span>
                                    </a>
                                </div>
                            </div>

                            {/* Company Profile Trigger - Fixed Bottom Tab Style */}
                            <div className="absolute inset-x-0 bottom-0">
                                <button 
                                    onClick={() => setIsFlipped(true)}
                                    className="w-full h-10 bg-gray-50/80 hover:bg-[#00acee]/10 text-gray-400 hover:text-[#00acee] transition-all flex items-center justify-center gap-2 border-t border-gray-100 group"
                                >
                                    <Building size={12} className="opacity-40 group-hover:opacity-100" />
                                    <span className="font-black text-[8px] uppercase tracking-[0.3em]">Corporate Profile</span>
                                    <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* BACK SIDE (Folded-Tab Style) */}
                        <div className="absolute inset-0 w-full h-full bg-white rounded-[5px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col overflow-hidden border border-gray-100">
                            
                            {/* Top Content (White Branding Area) */}
                            <div className="flex-grow flex flex-col items-center justify-center relative px-8">
                                <button 
                                    onClick={() => setShowSupport(false)}
                                    className="absolute top-4 right-4 p-2 text-gray-200 hover:text-[#00acee] transition-colors z-20"
                                >
                                    <X size={18} />
                                </button>

                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 mb-4">
                                        <img src="/logo-removebg.png" alt="Onimta Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <h3 className="text-gray-500 font-bold tracking-widest text-[16px] uppercase leading-none">Onimta Cloud</h3>
                                    <p className="text-[#00acee] text-[8px] uppercase tracking-[0.2em] font-black mt-2">Innovative Enterprise Solutions</p>
                                </div>
                            </div>

                            {/* Folded Tab Footer Section - User Specific Geometric Logic */}
                            <div className="relative h-16 w-full mt-auto select-none">
                                {/* Left dark wedge */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: '#3a3a3a',
                                        clipPath: 'polygon(0 0, 15% 0, 20% 100%, 0 100%)',
                                    }}
                                />
                                {/* Left darker corner */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: '#4a4a4a',
                                        clipPath: 'polygon(0 0, 15% 0, 0 100%)',
                                    }}
                                />
                                {/* Cyan center band */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: '#00BFDE',
                                        clipPath: 'polygon(13% 0, 85% 0, 93% 100%, 5% 100%)',
                                    }}
                                />
                                {/* Right dark wedge */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: '#3a3a3a',
                                        clipPath: 'polygon(85% 0, 100% 0, 100% 100%, 80% 100%)',
                                    }}
                                />
                                {/* Right darker corner */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: '#4a4a4a',
                                        clipPath: 'polygon(95% 0, 100% 0, 100% 100%)',
                                    }}
                                />

                                {/* Text content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 z-20">
                                    <p className="text-white text-[7px] tracking-[0.3em] opacity-80 font-bold uppercase">
                                        Innovative Enterprise Solutions
                                    </p>
                                    <a href="https://www.onimta.com" target="_blank" rel="noreferrer" className="text-white text-[10px] font-black tracking-[0.1em] uppercase hover:underline">
                                        WWW.ONIMTA.COM
                                    </a>
                                </div>
                                
                                <button 
                                    onClick={() => setIsFlipped(false)}
                                    className="absolute left-4 bottom-3 z-30 text-white/30 hover:text-white transition-colors"
                                >
                                    <ArrowLeft size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <style>
                {`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #eee;
                        border-radius: 10px;
                    }
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                    @keyframes shimmerFlow {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    .animate-shimmer {
                        background: linear-gradient(
                            90deg, 
                            #ffffff 0%, 
                            #ffffff 40%, 
                            #00BFDE 50%, 
                            #ffffff 60%, 
                            #ffffff 100%
                        );
                        background-size: 200% auto;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: shimmerFlow 12s linear infinite;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #00D1FF;
                    }
                `}
            </style>
        </div>
    );
};

export default CompanySelectModal;
