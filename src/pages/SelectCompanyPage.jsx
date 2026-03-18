import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Search, X, Loader2, LogOut, ChevronRight, Building2 } from 'lucide-react';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

const SelectCompanyPage = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [searching, setSearching] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState({ id: '', name: '' });
    const [showSelection, setShowSelection] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
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
            setCompanies(data.map(c => ({
                id: c.companyCode || c.CompanyCode,
                name: c.companyName || c.CompanyName
            })));
        } catch (err) {
            console.error("Error fetching assigned companies:", err);
        } finally {
            setFetching(false);
        }
    };

    const handleSearchClick = async (e) => {
        e.stopPropagation();
        setShowSelection(true);
        if (!userName || userName === 'Guest') return;
        try {
            setSearching(true);
            const data = await authService.getCompaniesByEmployee(userName);
            setCompanies(data.map(c => ({
                id: c.companyCode || c.CompanyCode,
                name: c.companyName || c.CompanyName
            })));
        } catch (err) {
            toast.error(typeof err === 'object' ? (err.message || "Failed to load companies") : err);
        } finally {
            setSearching(false);
        }
    };

    const handleOpen = async () => {
        if (!selectedCompany.id) {
            toast.error('Please select a company first');
            return;
        }
        setLoading(true);
        try {
            const result = await authService.openCompany(userName, selectedCompany.id);
            toast.success(result.message || `Accessing ${selectedCompany.name}...`, {
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
            toast.error(typeof err === 'object' ? (err.message || err.Message || "Error opening company") : err);
        } finally {
            setLoading(false);
        }
    };

    const handleExit = () => {
        authService.logout();
        navigate('/login');
    };

    const selectCompany = (company) => {
        setSelectedCompany(company);
        setShowSelection(false);
    };

    // Filter displayed companies based on search term in modal
    const filteredCompanies = companies.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen relative flex items-center justify-center font-['Outfit'] overflow-hidden">
            <div className="absolute -inset-8 z-0">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute w-full h-full object-cover scale-110"
                    style={{ filter: 'blur(4px) brightness(0.5)' }}
                >
                    <source src="/Video/Backgroundvideo2.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="relative z-10 w-full max-w-lg px-8 py-12 flex flex-col items-center">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-white tracking-[0.2em] mb-2 uppercase">ONIMTA</h1>
                    <p className="text-white/60 text-lg tracking-wide uppercase">Select Company</p>
                </div>

                <div className="w-full space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            value={userName}
                            readOnly
                            className="w-full px-8 py-4 bg-black/20 border border-white/30 rounded-full outline-none text-white/50 font-medium cursor-not-allowed"
                            placeholder="User"
                        />
                        <UserIcon className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                    </div>

                    <div className="relative group">
                        <div 
                            onClick={() => setShowSelection(true)}
                            className="w-full px-8 py-4 bg-black/20 border border-white/30 rounded-full outline-none hover:bg-white/10 hover:border-white transition-all text-left text-white font-medium flex items-center justify-between cursor-pointer"
                        >
                            <span className={selectedCompany.name ? "text-white" : "text-white/40"}>
                                {selectedCompany.name || "Choose Company..."}
                            </span>
                            <div className="flex items-center gap-3">
                                {selectedCompany.id && <span className="text-[#00acee] text-xs font-bold tracking-widest">{selectedCompany.id}</span>}
                                <button 
                                    onClick={handleSearchClick}
                                    title="Search all companies"
                                    className="p-2 hover:bg-[#00acee]/20 rounded-full transition-colors text-white/60 hover:text-[#00acee]"
                                >
                                    <Search size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <button
                            onClick={handleOpen}
                            disabled={loading || !selectedCompany.id}
                            className="w-full py-4 bg-[#00acee] hover:bg-[#0092cc] rounded-full font-bold text-base text-white shadow-xl shadow-[#00acee]/20 transition-all active:scale-[0.98] disabled:opacity-30 h-[56px] flex items-center justify-center uppercase tracking-widest"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : "Open System"}
                        </button>
                        
                        <button
                            onClick={handleExit}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold text-sm text-white/70 hover:text-white transition-all active:scale-[0.98] h-[56px] uppercase tracking-widest"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.5em] font-medium">
                        Powered by Onimta Information Technology
                    </p>
                </div>
            </div>

            {showSelection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 backdrop-blur-md" onClick={() => setShowSelection(false)}></div>
                    <div className="relative w-full max-w-md  border border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                        {/* Modal Header */}
                        <div className="p-8 pb-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-white font-bold tracking-[0.1em] uppercase text-sm">Target Company</h3>
                                <p className="text-white/40 text-[10px] mt-1 tracking-widest uppercase">Database Directory</p>
                            </div>
                            <button onClick={() => setShowSelection(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search Input in Modal */}
                        <div className="px-8 pb-6">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="SEARCH BY NAME OR CODE..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#00acee]/50 transition-all tracking-widest uppercase"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00acee] animate-spin" size={16} />}
                            </div>
                        </div>

                        {/* Company List */}
                        <div className="px-4 pb-8 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {filteredCompanies.length === 0 ? (
                                <div className="py-20 flex flex-col items-center gap-4 text-white/20">
                                    <Building2 size={40} strokeWidth={1} />
                                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase">No Match Found</p>
                                </div>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <button
                                        key={company.id}
                                        onClick={() => selectCompany(company)}
                                        className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-[#00acee] border border-white/5 hover:border-[#00acee] rounded-[24px] transition-all group"
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                                                🏢
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-[11px] tracking-tight uppercase line-clamp-1">{company.name}</p>
                                                <p className="text-white/40 group-hover:text-white/70 text-[9px] font-bold tracking-[0.15em] mt-0.5 uppercase">{company.id}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-white/20 group-hover:text-white transition-all transform group-hover:translate-x-1" size={18} />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectCompanyPage;
