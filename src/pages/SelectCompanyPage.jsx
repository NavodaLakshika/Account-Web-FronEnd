import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Building2, 
    Search, 
    X, 
    Loader2, 
    ChevronRight, 
    ChevronLeft,
    Facebook,
    Linkedin,
    Globe,
    CheckCircle2
} from 'lucide-react';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

const SelectCompanyPage = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 3; // Vertical list fits better in the right panel

    const user = authService.getCurrentUser();
    const userName = user ? (user.EmpName || user.empName || user.Emp_Name || 'User') : 'Guest';

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.75;
        }
        fetchUserCompanies();
    }, []);

    const fetchUserCompanies = async () => {
        if (!userName || userName === 'Guest') {
            setFetching(false);
            return;
        }
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

    const handleOpen = async () => {
        const selected = companies.find(c => c.id === selectedCompanyId);
        if (!selected) {
            toast.error('Please select a company first');
            return;
        }
        setLoading(true);
        try {
            await authService.openCompany(userName, selected.id);
            toast.success(`Accessing ${selected.name}...`, {
                style: {
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    borderRadius: '24px',
                },
                iconTheme: {
                    primary: '#00acee',
                    secondary: '#fff',
                }
            });
            navigate('/dashboard');
        } catch (err) {
            toast.error(typeof err === 'object' ? (err.message || "Error opening company") : err);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(companies.length / itemsPerPage);
    const currentCompanies = companies.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    return (
        <div className="min-h-screen relative flex items-center justify-center font-['Arial'] overflow-hidden">
            <style>
                {`
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
                            #04b4faff 50%, 
                            #ffffff 60%, 
                            #ffffff 100%
                        );
                        background-size: 200% auto;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: shimmerFlow 12s linear infinite;
                    }
                `}
            </style>

            {/* Video Background (Identical to Login) */}
            <div className="absolute inset-0 z-0">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute w-full h-full object-cover scale-110"
                    style={{ filter: 'blur(24px) brightness(0.3)' }}
                >
                    <source src="/Video/Backgroundvideo2.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="relative z-10 w-full max-w-6xl px-12 flex items-center justify-between">
                
                {/* Left Branding Panel (Identical to Login) */}
                <div className="flex-1 flex flex-col items-center justify-center text-center pr-12">
                    <div className="relative mb-6">
                        <h1 className="text-[85px] font-bold tracking-[0.05em] uppercase animate-shimmer leading-none relative z-10">ONIMTA</h1>
                        <div className="absolute -right-12 -top-12 w-48 h-48 flex items-center justify-center opacity-80 select-none pointer-events-none">
                            <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full animate-[spin_30s_linear_infinite]" />
                            <img 
                                src="/logo-removebg.png" 
                                alt="Onimta Logo" 
                                className="w-24 h-24 object-contain animate-[pulse_4s_easeInOut_infinite]" 
                            />
                        </div>
                    </div>
                    <p className="text-white text-xl font-bold tracking-widest uppercase mb-4 opacity-90">Company Directory</p>
                    <p className="text-white/40 text-xs font-mono uppercase tracking-[0.3em]">Authorized Session: {userName}</p>
                </div>

                {/* Vertical Divider (Identical to Login) */}
                <div className="w-[1px] h-96 bg-white/40 mx-12 hidden md:block" />

                {/* Right Form Panel (Company Selection Interface) */}
                <div className="flex-1 max-w-md w-full py-12 flex flex-col">
                    <h2 className="text-white text-3xl font-bold mb-8 font-tahoma">Select Entity</h2>
                    
                    <div className="space-y-3 flex-grow min-h-[300px]">
                        {fetching ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 text-white/20 py-20">
                                <Loader2 size={40} className="animate-spin" />
                                <p className="text-[10px] font-mono tracking-[0.4em] uppercase">Accessing database...</p>
                            </div>
                        ) : companies.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 text-white/10 py-20">
                                <Building2 size={40} strokeWidth={1} />
                                <p className="text-[10px] font-mono tracking-[0.4em] uppercase">No active entities</p>
                            </div>
                        ) : (
                            currentCompanies.map((company) => {
                                const isSelected = selectedCompanyId === company.id;
                                return (
                                    <button
                                        key={company.id}
                                        onClick={() => setSelectedCompanyId(company.id)}
                                        className={`w-full group relative flex items-center justify-between p-5 transition-all duration-300 border ${
                                            isSelected 
                                            ? 'bg-[#00acee] border-[#00acee] translate-x-3 shadow-[0_0_30px_rgba(0,172,238,0.3)]' 
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 flex items-center justify-center transition-colors ${isSelected ? 'text-white' : 'text-white/20'}`}>
                                                <Building2 size={24} strokeWidth={1.5} />
                                            </div>
                                            <div className="text-left">
                                                <p className={`font-bold text-sm uppercase tracking-tight line-clamp-1 ${isSelected ? 'text-white' : 'text-white/70'}`}>
                                                    {company.name}
                                                </p>
                                                <p className={`text-[9px] font-mono font-bold tracking-widest mt-0.5 ${isSelected ? 'text-white/60' : 'text-white/20'}`}>
                                                    CODE: {company.id}
                                                </p>
                                            </div>
                                        </div>
                                        {isSelected && <CheckCircle2 size={18} className="text-white" />}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Navigation and Launch Actions */}
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all text-[10px] font-mono font-bold tracking-widest uppercase disabled:opacity-0"
                            >
                                <ChevronLeft size={16} className="inline mr-1" /> Prev
                            </button>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage >= totalPages - 1}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all text-[10px] font-mono font-bold tracking-widest uppercase disabled:opacity-0"
                            >
                                Next <ChevronRight size={16} className="inline ml-1" />
                            </button>
                        </div>

                        <button 
                            disabled={loading || !selectedCompanyId}
                            onClick={handleOpen}
                            className="w-full py-5 bg-[#00acee] hover:bg-[#0092cc] text-white font-mono font-bold tracking-[0.3em] transition-all active:scale-[0.98] disabled:opacity-30 uppercase shadow-lg shadow-black/20 text-lg flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Launch Session'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Social Icons (Identical to Login) */}
            <div className="absolute top-8 right-12 flex gap-6 text-white/40 z-20">
                <a href="#" className="hover:text-white transition-all transform hover:scale-110"><Facebook size={20} /></a>
                <a href="#" className="hover:text-white transition-all transform hover:scale-110"><Linkedin size={20} /></a>
                <a href="#" className="hover:text-white transition-all transform hover:scale-110"><Globe size={20} /></a>
            </div>

            {/* Bottom Footer Section (Identical to Login) */}
            <div className="absolute bottom-6 left-10 text-[12px] text-white/40 font-mono tracking-wide">
                Powered by Onimta Information Technology Pvt Ltd
            </div>

            <div className="absolute bottom-6 right-10 flex gap-6 text-[12px] text-white/40 font-mono">
                <a href="#" className="hover:text-white transition-colors">About us</a>
                <span>|</span>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
                <span>|</span>
                <a href="#" className="hover:text-white transition-colors">Help</a>
            </div>
        </div>
    );
};

export default SelectCompanyPage;
