import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import { 
    Database, 
    Server, 
    User, 
    Lock, 
    Folder, 
    Play, 
    ChevronDown, 
    MoreHorizontal,
    Monitor,
    ShieldCheck,
    RotateCcw,
    X,
    Save,
    Search,
    Layers
} from 'lucide-react';

const DatabaseBackupModal = ({ isOpen, onClose }) => {
    const [server, setServer] = useState({ code: 'SRV-01', name: '26.173.209.64\\SQL2019' });
    const [database, setDatabase] = useState({ code: '', name: '' });
    const [username, setUsername] = useState('sa');
    const [password, setPassword] = useState('********');
    const [backupPath, setBackupPath] = useState('');
    const [loading, setLoading] = useState(false);

    // Lookup States
    const [showServerLookup, setShowServerLookup] = useState(false);
    const [showDatabaseLookup, setShowDatabaseLookup] = useState(false);

    const servers = [
        { code: 'SRV-01', name: '26.173.209.64\\SQL2019' },
        { code: 'LOC-01', name: 'LOCAL\\SQLEXPRESS' },
        { code: 'CLD-01', name: 'CLOUD_INSTANCE_PRODUCTION' }
    ];

    const databases = [
        { code: 'DB01', name: 'ACCOUNTS_MAIN_2024' },
        { code: 'DB02', name: 'INVENTORY_SYSTEM_V2' },
        { code: 'DB03', name: 'HRM_ENTERPRISE_DATA' }
    ];

    const handleClear = () => {
        setDatabase({ code: '', name: '' });
        setBackupPath('');
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl font-['Tahoma']">
            <button 
                onClick={() => setLoading(true)} 
                className="px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <Save size={14} /> Create Backup
            </button>
            <button 
                onClick={handleClear} 
                className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 border-none flex items-center justify-center gap-2"
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
                title="Database Backup"
                maxWidth="max-w-2xl"
                footer={footer}
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-6 text-[12.5px] mt-2">
                    
                    <div className="border-b border-gray-200 pb-4 mb-2 flex items-center justify-center gap-3">
                        <Database size={20} className="text-[#0078d4]" />
                        <h2 className="text-[17px] font-bold text-black uppercase tracking-tight">Database Backup Profile & Execution</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#0078d4] font-bold border-b border-slate-100 pb-1 mb-4">
                            <Monitor size={14} />
                            <span className="uppercase tracking-wider text-[11px]">Connection Settings</span>
                        </div>

                        {/* Server Instance Lookup (Replaced Dropdown) */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Server Instance</label>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={server.name} 
                                    readOnly 
                                    className="flex-1 h-8 border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-default font-bold text-[#0078d4]" 
                                />
                                <button 
                                    onClick={() => setShowServerLookup(true)} 
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                >
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Auth Credentials</label>
                            <div className="flex-1 flex gap-3">
                                <div className="relative flex-grow">
                                    <input 
                                        type="text" 
                                        value={username} 
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none font-mono text-gray-700 shadow-sm" 
                                        placeholder="Username"
                                    />
                                    <User size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                <div className="relative flex-grow">
                                    <input 
                                        type="password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none font-mono text-gray-700 shadow-sm" 
                                        placeholder="Password"
                                    />
                                    <Lock size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                <button className="px-4 h-8 bg-[#0285fd] text-white text-[11px] font-bold uppercase rounded-[5px] hover:bg-[#0073ff] transition-all shadow-md active:scale-95">
                                    Connect
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 text-[#0078d4] font-bold border-b border-slate-100 pb-1 mb-4">
                            <Folder size={14} />
                            <span className="uppercase tracking-wider text-[11px]">Backup Parameters</span>
                        </div>

                        {/* Database Name Lookup (Replaced Dropdown) */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Database Name</label>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={database.name} 
                                    readOnly 
                                    placeholder="Select Target Database..."
                                    className="flex-1 h-8 border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-default font-bold text-blue-600" 
                                />
                                <button 
                                    onClick={() => setShowDatabaseLookup(true)} 
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                >
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Copy To Path</label>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={backupPath} 
                                    onChange={(e) => setBackupPath(e.target.value)}
                                    className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all" 
                                    placeholder="C:\\Backups\\Accounts\\..." 
                                />
                                <button className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-[5px] flex items-center justify-between opacity-80">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-[#50af60]" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Service Status: Operational</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">SQL_SERVER_AGENT_RUNNING</span>
                    </div>

                </div>
            </SimpleModal>

            {/* Server Lookup Modal */}
            {showServerLookup && (
                <SearchModal 
                    title="Server Instance" 
                    list={servers} 
                    onSelect={(item) => { setServer(item); setShowServerLookup(false); }} 
                    onClose={() => setShowServerLookup(false)}
                    placeholder="Search server instance..."
                />
            )}

            {/* Database Lookup Modal */}
            {showDatabaseLookup && (
                <SearchModal 
                    title="Database" 
                    list={databases} 
                    onSelect={(item) => { setDatabase(item); setShowDatabaseLookup(false); }} 
                    onClose={() => setShowDatabaseLookup(false)}
                    placeholder="Search database name..."
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
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
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
                        <span className="flex-1 px-3">DISPLAY NAME</span>
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
                    <span className="italic font-bold text-[#0078d4]">ACCOUNT CLOUD INFRASTRUCTURE</span>
                </div>
            </div>
        </div>
    );
};

export default DatabaseBackupModal;
