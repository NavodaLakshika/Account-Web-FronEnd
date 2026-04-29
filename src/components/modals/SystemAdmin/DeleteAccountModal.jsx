import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import { 
    Trash2, 
    Search, 
    RotateCcw, 
    X, 
    Lock, 
    ShieldAlert, 
    UserCheck,
    Layers,
    ChevronRight
} from 'lucide-react';

const DeleteAccountModal = ({ isOpen, onClose }) => {
    const [account, setAccount] = useState({ code: '', name: '' });
    const [authorizer, setAuthorizer] = useState({ code: '', name: '' });
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Lookup States
    const [showAccountLookup, setShowAccountLookup] = useState(false);
    const [showAuthorizerLookup, setShowAuthorizerLookup] = useState(false);

    const accounts = [
        { code: 'ACC-001', name: 'GENERAL LEDGER MAIN' },
        { code: 'ACC-002', name: 'PETTY CASH ACCOUNT' },
        { code: 'ACC-003', name: 'BANK OF CEYLON - PRIMARY' }
    ];

    const authorizers = [
        { code: 'ADM-01', name: 'SYSTEM ADMINISTRATOR' },
        { code: 'MGR-01', name: 'FINANCE MANAGER' },
        { code: 'DIR-01', name: 'MANAGING DIRECTOR' }
    ];

    const handleClear = () => {
        setAccount({ code: '', name: '' });
        setAuthorizer({ code: '', name: '' });
        setPassword('');
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl font-['Tahoma']">
            <button 
                onClick={() => setLoading(true)} 
                className="px-8 h-10 bg-[#d13438] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <Trash2 size={14} /> Delete
            </button>
            <button 
                onClick={handleClear} 
                className="px-8 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 border-none flex items-center justify-center gap-2"
            >
                <RotateCcw size={14} /> Clear
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Delete Account"
                maxWidth="max-w-2xl"
                footer={footer}
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-6 text-[12.5px] mt-2">
                    
                    {/* Master Style Header */}
                    <div className="border-b border-gray-200 pb-4 mb-2 flex items-center justify-center gap-3">
                        <ShieldAlert size={20} className="text-[#d13438]" />
                        <h2 className="text-[17px] font-bold text-black uppercase tracking-tight">Security Account Termination Protocol</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Account Selection Row */}
                        <div className="flex items-center gap-6">
                            <label className="w-24 font-bold text-gray-700">Account</label>
                            <div className="flex-1 flex gap-2">
                                <div className="w-32 flex gap-1">
                                    <input 
                                        type="text" 
                                        value={account.code} 
                                        readOnly 
                                        placeholder="Code"
                                        className="w-full h-8 border border-gray-300 px-2 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-default font-bold text-[#0078d4] text-center" 
                                    />
                                    <button 
                                        onClick={() => setShowAccountLookup(true)} 
                                        className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                    >
                                        <Search size={14} />
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    value={account.name} 
                                    readOnly 
                                    placeholder="Account Description"
                                    className="flex-1 h-8 border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-default font-mono text-gray-600" 
                                />
                            </div>
                        </div>

                        {/* Authorize Row */}
                        <div className="flex items-center gap-6">
                            <label className="w-24 font-bold text-gray-700">Authorize</label>
                            <div className="flex-1 flex items-center gap-6">
                                <div className="flex-1 flex gap-2">
                                    <input 
                                        type="text" 
                                        value={authorizer.name} 
                                        readOnly 
                                        placeholder="Select Authorizer..."
                                        className="flex-1 h-8 border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-default font-mono text-gray-600" 
                                    />
                                    <button 
                                        onClick={() => setShowAuthorizerLookup(true)} 
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                    >
                                        <UserCheck size={16} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="font-bold text-gray-700">Password</label>
                                    <div className="relative w-40 group">
                                        <input 
                                            type="password" 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-red-400 shadow-sm transition-all focus:ring-4 focus:ring-red-50/50" 
                                        />
                                        <Lock size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Warning Box */}
                    <div className="bg-red-50 border border-red-100 p-4 rounded-[5px] flex items-start gap-4 mt-2">
                        <ShieldAlert size={24} className="text-[#d13438] shrink-0" />
                        <div className="space-y-1">
                            <h4 className="text-[11px] font-black text-[#d13438] uppercase tracking-widest">Permanent Action Required</h4>
                            <p className="text-[10px] text-red-600/80 leading-relaxed font-bold">
                                Deleting an account will permanently remove all associated transaction history, audit logs, and balance data. 
                                This process is irreversible once executed. Ensure all reconciliations are finalized.
                            </p>
                        </div>
                    </div>

                </div>
            </SimpleModal>

            {/* Account Lookup Modal */}
            {showAccountLookup && (
                <SearchModal 
                    title="Account" 
                    list={accounts} 
                    onSelect={(item) => { setAccount(item); setShowAccountLookup(false); }} 
                    onClose={() => setShowAccountLookup(false)}
                    placeholder="Search account code or description..."
                />
            )}

            {/* Authorizer Lookup Modal */}
            {showAuthorizerLookup && (
                <SearchModal 
                    title="Authorization Officer" 
                    list={authorizers} 
                    onSelect={(item) => { setAuthorizer(item); setShowAuthorizerLookup(false); }} 
                    onClose={() => setShowAuthorizerLookup(false)}
                    placeholder="Search authorizer name..."
                />
            )}
        </>
    );
};

const SearchModal = ({ title, list, onSelect, onClose, placeholder }) => {
    const [query, setQuery] = useState('');
    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="bg-[#0078d4] px-4 py-2 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <Search size={16} />
                        <span className="text-sm font-bold uppercase tracking-tight tracking-[0.1em]">{title} Profile Lookup</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-95 outline-none border-none group"
                    >
                        <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Layers size={14} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Security Filter</span>
                    </div>
                    <input 
                        type="text" 
                        placeholder={placeholder} 
                        className="h-8 border border-gray-300 px-3 text-xs rounded-md w-60 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)} 
                    />
                </div>

                <div className="p-2">
                    <div className="bg-gray-100 px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                        <span className="w-24 text-center">CODE</span>
                        <span className="flex-1 px-3">ENTITY NAME</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {list.filter(x => x.name.toLowerCase().includes(query.toLowerCase()) || x.code.toLowerCase().includes(query.toLowerCase())).map(x => (
                            <button 
                                key={x.code} 
                                onClick={() => onSelect(x)}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group"
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="w-24 text-center font-mono text-[11px] font-bold text-[#0078d4]">
                                        {x.code}
                                    </span>
                                    <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">
                                        {x.name}
                                    </span>
                                </div>
                                <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                    <span>{list.length} Entity/Entities Identified</span>
                    <span className="italic font-bold text-[#0078d4]">SECURE ACCESS INFRASTRUCTURE</span>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountModal;
