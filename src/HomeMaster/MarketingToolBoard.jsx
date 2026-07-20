import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { ChevronDown, X, Save, RotateCcw, Target, Percent, TrendingUp, Search, Loader2 , FileText} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import { marketingService } from '../services/marketing.service';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const MarketingToolBoard = ({ isOpen, onClose }) => {
    const [selectedTab, setSelectedTab] = useState('Sales Target');
    const [loading, setLoading] = useState(false);

    // --- State for Search ---
    const [showLevelSearch, setShowLevelSearch] = useState(false);
    const [levelSearchQuery, setLevelSearchQuery] = useState('');
    const [levelSearchResults, setLevelSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // --- State for Sales Target ---
    const initialSalesTargets = [
        { period: 'Day', targetValue: '', forecast: '' },
        { period: 'Week', targetValue: '', forecast: '' },
        { period: 'Month', targetValue: '', forecast: '' },
        { period: 'Quarter', targetValue: '', forecast: '' },
        { period: 'Year', targetValue: '', forecast: '' },
    ];
    const [salesTargets, setSalesTargets] = useState(initialSalesTargets);

    // --- State for Commission Level ---
    const commissionLabels = ['Milestone Floor', 'Intermediate Floor', 'Advanced Floor', 'Mastery Floor', 'Executive Floor'];
    const initialCommissionTiers = commissionLabels.map(label => ({
        tierName: label,
        lowLevel: '',
        highLevel: '',
        sharePercent: ''
    }));

    const [commissionLevel, setCommissionLevel] = useState({
        levelCode: 'LVL-SEQ-01',
        description: '',
        associatedMilestone: 'MONTHLY TARGET',
        tiers: initialCommissionTiers
    });

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const targets = await marketingService.getSalesTargets();
            if (targets && targets.length > 0) {
                // Merge with initial structure to maintain order
                const mergedTargets = initialSalesTargets.map(initT => {
                    const found = targets.find(t => t.period === initT.period);
                    return found ? { 
                        period: found.period, 
                        targetValue: found.targetValue || '', 
                        forecast: found.forecast || '' 
                    } : initT;
                });
                setSalesTargets(mergedTargets);
            } else {
                setSalesTargets(initialSalesTargets);
            }
            
            // Auto clear commission form when modal opens
            setCommissionLevel({
                levelCode: '',
                description: '',
                associatedMilestone: 'MONTHLY TARGET',
                tiers: initialCommissionTiers
            });
        } catch (error) {
            showErrorToast("Failed to fetch marketing data");
        } finally {
            setLoading(false);
        }
    };

    const loadCommissionLevel = async (levelCode) => {
        try {
            const commData = await marketingService.getCommissionLevels(undefined, levelCode);
            if (commData && commData.tiers && commData.tiers.length > 0) {
                const mergedTiers = initialCommissionTiers.map(initTier => {
                    const found = commData.tiers.find(t => t.tierName === initTier.tierName);
                    return found ? {
                        tierName: found.tierName,
                        lowLevel: found.lowLevel !== null ? found.lowLevel : '',
                        highLevel: found.highLevel !== null ? found.highLevel : '',
                        sharePercent: found.sharePercent !== null ? found.sharePercent : ''
                    } : initTier;
                });
                setCommissionLevel({
                    levelCode: levelCode,
                    description: commData.description || '',
                    associatedMilestone: commData.associatedMilestone || 'MONTHLY TARGET',
                    tiers: mergedTiers
                });
            } else {
                setCommissionLevel({
                    levelCode: levelCode,
                    description: commData.description || '',
                    associatedMilestone: commData.associatedMilestone || 'MONTHLY TARGET',
                    tiers: initialCommissionTiers
                });
            }
        } catch (error) {
            showErrorToast("Failed to load commission level");
        }
    };

    const handleLevelSearch = async (e) => {
        if(e) e.preventDefault();
        setSearching(true);
        try {
            const results = await marketingService.searchCommissionLevels(undefined, levelSearchQuery);
            setLevelSearchResults(results || []);
        } catch(error) {
            showErrorToast("Failed to search");
        } finally {
            setSearching(false);
        }
    };

    const handleSelectLevel = async (levelCode) => {
        setShowLevelSearch(false);
        setLoading(true);
        await loadCommissionLevel(levelCode);
        setLoading(false);
    };

    // --- Handlers ---
    const handleSalesTargetChange = (index, field, value) => {
        const updated = [...salesTargets];
        updated[index][field] = value;
        setSalesTargets(updated);
    };

    const handleCommissionTierChange = (index, field, value) => {
        const updated = { ...commissionLevel };
        updated.tiers[index][field] = value;
        setCommissionLevel(updated);
    };

    const handleSaveConfig = async () => {
        setLoading(true);
        try {
            if (selectedTab === 'Sales Target') {
                const payload = salesTargets.map(t => ({
                    period: t.period,
                    targetValue: parseFloat(t.targetValue) || 0,
                    forecast: parseFloat(t.forecast) || 0
                }));
                await marketingService.saveSalesTargets(undefined, payload);
                showSuccessToast('Sales Targets saved successfully!');
            } else {
                const payload = {
                    levelCode: commissionLevel.levelCode,
                    description: commissionLevel.description,
                    associatedMilestone: commissionLevel.associatedMilestone,
                    tiers: commissionLevel.tiers.map((t, idx) => ({
                        tierName: t.tierName,
                        lowLevel: parseFloat(t.lowLevel) || 0,
                        highLevel: (idx === commissionLevel.tiers.length - 1 || t.highLevel === '') ? null : parseFloat(t.highLevel),
                        sharePercent: parseFloat(t.sharePercent) || 0
                    }))
                };
                await marketingService.saveCommissionLevels(undefined, payload);
                showSuccessToast('Commission Level saved successfully!');
                handleReset('Commision Level');
            }
        } catch (error) {
            showErrorToast(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = (tabToReset = selectedTab) => {
        if (tabToReset === 'Sales Target') {
            setSalesTargets(initialSalesTargets);
        } else {
            setCommissionLevel({
                levelCode: '',
                description: '',
                associatedMilestone: 'MONTHLY TARGET',
                tiers: initialCommissionTiers
            });
        }
    };

    return (
        <>
        <TransactionFormWrapper subtitle="Transaction Management" icon={FileText}
            isOpen={isOpen}
            onClose={onClose}
            title="Marketing Tool"
            maxWidth="max-w-[700px]"
            footer={
                <div className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">
                    <button 
                        onClick={handleSaveConfig} 
                        disabled={loading} 
                        className={`px-8 h-10 bg-white text-[#2bb744] border-2 border-[#2bb744] hover:bg-green-50 text-[13px] font-mono font-bold uppercase tracking-widest rounded-[3px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        SAVE CONFIG
                    </button>
                    <button 
                        onClick={() => handleReset()} 
                        disabled={loading} 
                        className="px-6 h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 text-[13px] font-mono font-bold uppercase tracking-widest rounded-[3px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm shadow-blue-100"
                    >
                        <RotateCcw size={14} /> RESET FORM
                    </button>
                </div>
            }
        >
            <div className="p-1 font-['Tahoma',_sans-serif]">
                {/* Tab Navigation */}
                <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
                    <button 
                        onClick={() => setSelectedTab('Sales Target')}
                        className={`px-4 py-2 text-[12.5px] font-black uppercase tracking-widest transition-all rounded-[3px] ${selectedTab === 'Sales Target' ? 'bg-[#e49e1b] text-slate-800 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                    >
                        Sales Target
                    </button>
                    <button 
                        onClick={() => setSelectedTab('Commision Level')}
                        className={`px-4 py-2 text-[12.5px] font-black uppercase tracking-widest transition-all rounded-[3px] ${selectedTab === 'Commision Level' ? 'bg-[#e49e1b] text-slate-800 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                    >
                        Commission Level
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-slate-100 dark:bg-white/50 backdrop-blur-sm border border-gray-200 rounded-[3px] p-6 shadow-sm min-h-[400px]">
                    {selectedTab === 'Sales Target' ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-4 bg-[#0285fd] rounded-full" />
                                    <h3 className="text-[15px] font-mono font-black text-slate-800 uppercase tracking-tight">Sales Milestone Definitions</h3>
                                </div>
                            </div>

                            {/* Column Headers */}
                            <div className="grid grid-cols-12 gap-4 mb-2 pb-2">
                                <div className="col-span-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] pl-2">Segment Identifier</div>
                                <div className="col-span-3 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Target Value</div>
                                <div className="col-span-2 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Forecast</div>
                                <div className="col-span-2 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Action</div>
                            </div>

                            {/* Data Rows */}
                            {salesTargets.map((row, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-4 items-center group hover:bg-slate-50/50 p-1.5 rounded-[3px] transition-colors border border-transparent hover:border-gray-200 shadow-sm mb-1 bg-white">
                                    <div className="col-span-5 flex items-center">
                                        <div className="w-32 font-bold text-slate-700 text-[12.5px] uppercase">Sales Target</div>
                                        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
                                            <span className="text-[12px] font-black text-[#0285fd] uppercase tracking-[0.2em]">{row.period}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-3 relative">
                                        <input 
                                            type="number" 
                                            placeholder="0.00"
                                            value={row.targetValue}
                                            onChange={(e) => handleSalesTargetChange(idx, 'targetValue', e.target.value)}
                                            className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100" 
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input 
                                            type="number" 
                                            placeholder="0.00"
                                            value={row.forecast}
                                            onChange={(e) => handleSalesTargetChange(idx, 'forecast', e.target.value)}
                                            className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100" 
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <button 
                                            onClick={handleSaveConfig}
                                            disabled={loading}
                                            className="w-full h-9 bg-[#0285fd] text-slate-800 dark:text-white text-[11px] font-black uppercase tracking-widest rounded-[3px] hover:bg-[#0073ff] transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} COMMIT
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500 pb-6">
                            {/* Commission Level Header */}
                            <div className="bg-white p-4 border border-slate-200 rounded-[3px] shadow-sm space-y-4">
                                <div className="grid grid-cols-12 gap-x-10 gap-y-4">
                                    <div className="col-span-12 flex items-center gap-4">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase w-48 shrink-0">Sales Commission Level</label>
                                        <div className="flex-1 flex gap-1 h-8">
                                            <input type="text" readOnly value={commissionLevel.levelCode} className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100" onClick={() => { setShowLevelSearch(true); handleLevelSearch(); }} />
                                            <input 
                                                type="text" 
                                                value={commissionLevel.description}
                                                onChange={(e) => setCommissionLevel({...commissionLevel, description: e.target.value})}
                                                className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100" 
                                                placeholder="Enter Level Description..." 
                                             style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                        </div>
                                    </div>
                                    <div className="col-span-12 flex items-center gap-4">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase w-48 shrink-0">Associated Milestone</label>
                                        <select 
                                            value={commissionLevel.associatedMilestone}
                                            onChange={(e) => setCommissionLevel({...commissionLevel, associatedMilestone: e.target.value})}
                                            className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100"
                                            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                        >
                                            <option value="MONTHLY TARGET">MONTHLY TARGET</option>
                                            <option value="QUARTERLY TARGET">QUARTERLY TARGET</option>
                                            <option value="YEARLY TARGET">YEARLY TARGET</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Logic Grid Configuration */}
                            <div className="overflow-x-auto no-scrollbar pt-4">
                                <div className="flex gap-10 min-w-[900px]">
                                    {/* Labels Column */}
                                    <div className="space-y-8">
                                        <div className="text-center text-[11px] font-bold text-gray-500 uppercase h-8 flex items-center justify-center"></div>
                                        {commissionLevel.tiers.map((t, idx) => (
                                            <div key={idx} className="h-8 flex items-center">
                                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{t.tierName} Floor</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Floor Inputs */}
                                    <div className="space-y-8">
                                        <div className="text-center text-[11px] font-bold text-gray-500 uppercase h-8 flex items-center justify-center border-b border-gray-200/50 tracking-widest">Low Level</div>
                                        {commissionLevel.tiers.map((t, idx) => (
                                            <div key={idx} className="h-8 flex items-center">
                                                {idx === commissionLevel.tiers.length - 1 ? (
                                                    <span className="w-48"></span> // empty space for max tier
                                                ) : (
                                                    <input 
                                                        type="number" 
                                                        value={t.lowLevel}
                                                        onChange={(e) => handleCommissionTierChange(idx, 'lowLevel', e.target.value)}
                                                        className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100" 
                                                        placeholder="0.00" 
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Connectors (Arrows) */}
                                    <div className="space-y-8">
                                        <div className="text-center text-[11px] font-bold text-gray-500 uppercase h-8 flex items-center justify-center"></div>
                                        {commissionLevel.tiers.map((t, idx) => (
                                            <div key={idx} className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                                                {idx === commissionLevel.tiers.length - 1 ? (
                                                    <span className="font-black text-[13px] uppercase tracking-widest">Max</span>
                                                ) : "→"}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Cap Inputs (High Level) */}
                                    <div className="space-y-8">
                                        <div className="text-center text-[11px] font-bold text-gray-500 uppercase h-8 flex items-center justify-center border-b border-gray-200/50 tracking-widest">High Level</div>
                                        {commissionLevel.tiers.map((t, idx) => (
                                            <div key={idx} className="h-8 flex items-center">
                                                {idx === commissionLevel.tiers.length - 1 ? (
                                                    <span className="w-48"></span> // empty space
                                                ) : idx === commissionLevel.tiers.length - 2 ? (
                                                    <div className="w-48 h-8 border border-gray-200/60 border-dashed rounded bg-gray-50/50 flex items-center justify-center text-[10px] font-black text-gray-400 italic tracking-widest uppercase">Terminal Value</div>
                                                ) : (
                                                    <input 
                                                        type="number" 
                                                        value={t.highLevel}
                                                        onChange={(e) => handleCommissionTierChange(idx, 'highLevel', e.target.value)}
                                                        className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100" 
                                                        placeholder="∞" 
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calculation Operators (x) */}
                                    <div className="space-y-8">
                                        <div className="text-center text-[11px] font-bold text-gray-500 uppercase h-8 flex items-center justify-center"></div>
                                        {commissionLevel.tiers.map((t, idx) => (
                                            <div key={idx} className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
                                                <X size={12} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Share Inputs */}
                                    <div className="space-y-8">
                                        <div className="text-center text-[11px] font-bold text-gray-500 uppercase h-8 flex items-center justify-center border-b border-gray-200/50 tracking-widest">% Share</div>
                                        {commissionLevel.tiers.map((t, idx) => (
                                            <div key={idx} className="h-8 flex items-center border-b border-slate-200 pb-2">
                                                <input 
                                                    type="number" 
                                                    value={t.sharePercent}
                                                    onChange={(e) => handleCommissionTierChange(idx, 'sharePercent', e.target.value)}
                                                    className="w-20 h-8 font-mono font-black text-slate-800 text-center text-[14px] outline-none bg-transparent hover:bg-slate-50 transition-colors rounded" 
                                                    placeholder="0" 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TransactionFormWrapper>

        {/* Level Search Modal */}
        <SimpleModal isOpen={showLevelSearch} onClose={() => setShowLevelSearch(false)} title="Search Commission Levels" maxWidth="max-w-[700px]">
            <div className="flex flex-col h-full font-['Tahoma']">
                <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            autoFocus
                            value={levelSearchQuery}
                            onChange={(e) => setLevelSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter') handleLevelSearch(); }}
                            placeholder="Find by Code or Description"
                            className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100"
                        />
                        <button onClick={handleLevelSearch} disabled={searching} className="px-4 h-9 bg-[#0285fd] text-slate-800 dark:text-white rounded-[3px] font-bold text-[12px] hover:bg-[#0073ff] transition-all flex items-center gap-2 disabled:opacity-50 shadow-md">
                            {searching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                        </button>
                    </div>
                </div>
                <div className="max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100 rounded-[5px] shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Level Code</th>
                                <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Description</th>
                                <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Select</th>
                            <th className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {searching ? (
                                <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest"><Loader2 size={24} className="animate-spin inline-block mr-2" /> Searching...</td></tr>
                            ) : levelSearchResults.length > 0 ? (
                                levelSearchResults.map((l, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all border-b border-gray-50 cursor-pointer group border-b border-gray-50">
                                        <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">{l.levelCode}</td>
                                        <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">{l.description}</td>
                                        <td className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">
                                            <button 
                                                onClick={() => handleSelectLevel(l.levelCode)}
                                                className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100"
                                            >
                                                SELECT
                                            </button>
                                        </td>
                                    
                                            <td className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100"><button className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">SELECT</button></td>
                                        </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No commission levels found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </SimpleModal>
        </>
    );
};

export default MarketingToolBoard;




