import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import AccountBoard from './AccountBoard';
import { HelpCircle, PlusCircle, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { accountService } from '../services/account.service';
import { getSessionData, getCompanyModule } from '../utils/session';

export const ACCOUNT_CATEGORIES = [
    { key: 'Assets', label: 'Assets', code: '10000', baseCode: '10000' },
    { key: 'Liabilities', label: 'Liabilities', code: '20000', baseCode: '20000' },
    { key: 'Equity', label: 'Equity', code: '30000', baseCode: '30000' },
    { key: 'Income', label: 'Income', code: '40000', baseCode: '40000' },
    { key: 'Cost of Sales', label: 'Cost of Sales', code: '50000', baseCode: '50000' },
    { key: 'Expenses', label: 'Expenses', code: '60000', baseCode: '60000' },
    { key: 'Other Income', label: 'Other Income', code: '70000', baseCode: '70000' },
    { key: 'Other Expenses', label: 'Other Expenses', code: '80000', baseCode: '80000' },
];

export const ACCOUNT_DETAILS = {
    Assets: {
        title: 'ASSETS (10000)',
        description: 'Tracks valuable resources owned by the company for future economic benefit, including liquid cash, receivables, inventory, and long-term fixed assets.',
        tip: 'Regularly audit physical assets and maintain depreciation schedules for accurate balance sheet presentation.',
        examples: [
            '10000 - CURRENT ASSETS',
            '11000 - CASH & BANK',
            '12000 - RECEIVABLES',
            '13000 - INVENTORY',
            '15000 - FIXED ASSETS',
            '16000 - ACCUMULATED DEPRECIATION'
        ]
    },
    Liabilities: {
        title: 'LIABILITIES (20000)',
        description: 'Tracks debts and obligations owed by the enterprise to external entities, such as trade creditors, statutory tax payables, and long-term bank loans.',
        tip: 'Monitor current liabilities against current assets to sustain a healthy working capital ratio.',
        examples: [
            '20000 - CURRENT LIABILITIES',
            '21000 - TRADE CREDITORS',
            '22000 - VAT PAYABLE',
            '23000 - SALARY PAYABLE',
            '25000 - LONG TERM LIABILITIES',
            '25100 - BANK LOANS'
        ]
    },
    Equity: {
        title: 'EQUITY (30000)',
        description: 'Represents owner or shareholder claim on company assets after deducting all existing liabilities.',
        tip: 'Keep owner capital injections and drawings clearly distinguished from operational retained earnings.',
        examples: [
            '30000 - CAPITAL',
            '31000 - OWNER CAPITAL',
            '32000 - RETAINED EARNINGS',
            '33000 - DRAWINGS'
        ]
    },
    Income: {
        title: 'INCOME (40000)',
        description: 'Tracks gross earnings originating from standard commercial operations, including domestic product sales, exported goods, and contracted services.',
        tip: 'Enforce accrual matching to recognize income during the cycle in which goods or services were fulfilled.',
        examples: [
            '40000 - SALES REVENUE',
            '41000 - LOCAL SALES',
            '42000 - EXPORT SALES',
            '43000 - SERVICE INCOME'
        ]
    },
    'Cost of Sales': {
        title: 'COST OF SALES (50000)',
        description: 'Tracks direct expenditures directly tied to inventory manufacturing or merchandise acquisition sold during the fiscal period.',
        tip: 'Carefully reconcile direct labor and raw material costs against revenues to assess accurate Gross Margins.',
        examples: [
            '50000 - COST OF GOODS SOLD',
            '51000 - MATERIAL COST',
            '52000 - DIRECT LABOUR'
        ]
    },
    Expenses: {
        title: 'OPERATING EXPENSES (60000)',
        description: 'Tracks periodic operational expenditures that sustain organizational functions, administrative logistics, facilities, and promotional overhead.',
        tip: 'Differentiate administrative overhead from sales distribution to monitor commercial operational efficiency.',
        examples: [
            '60000 - ADMINISTRATIVE EXPENSES',
            '61000 - SALARIES',
            '62000 - ELECTRICITY',
            '66000 - SELLING & DISTRIBUTION',
            '66100 - MARKETING'
        ]
    },
    'Other Income': {
        title: 'OTHER INCOME (70000)',
        description: 'Captures non-operational financial inflows generated outside principal trading activities, such as bank interest or asset disposal gains.',
        tip: 'Separate non-operating revenues to prevent distortion of core operational profitability metrics (EBITDA).',
        examples: [
            '70000 - INTEREST INCOME',
            '71000 - GAIN ON DISPOSAL'
        ]
    },
    'Other Expenses': {
        title: 'OTHER EXPENSES (80000)',
        description: 'Captures financial charges, non-operating costs, foreign currency exchange fluctuations, and loan financing expenses.',
        tip: 'Keep financing expenses and currency losses segregated from direct operational cost centers.',
        examples: [
            '80000 - BANK CHARGES',
            '81000 - INTEREST EXPENSE',
            '82000 - EXCHANGE LOSS'
        ]
    }
};

const NewAccountBoard = ({ isOpen, onClose }) => {
    const [selectedType, setSelectedType] = useState('Assets');
    const [showAccountBoard, setShowAccountBoard] = useState(false);
    const [mainTypes, setMainTypes] = useState([]);
    const [dynamicSubGroups, setDynamicSubGroups] = useState([]);

    const { companyCode } = getSessionData();
    const currentModule = getCompanyModule(companyCode);
    const isServiceModule = currentModule === 'Service';

    // Hide Cost of Sales if Service module is selected
    const availableCategories = ACCOUNT_CATEGORIES.filter(cat => {
        if (isServiceModule && (cat.key === 'Cost of Sales' || cat.code === '50000')) {
            return false;
        }
        return true;
    });

    const currentDetails = ACCOUNT_DETAILS[selectedType] || ACCOUNT_DETAILS['Assets'];

    useEffect(() => {
        if (isServiceModule && selectedType === 'Cost of Sales') {
            setSelectedType('Assets');
        }
    }, [isServiceModule, selectedType]);

    useEffect(() => {
        if (!isOpen) {
            setShowAccountBoard(false);
            setSelectedType('Assets');
        } else {
            const { companyCode: comp } = getSessionData();
            accountService.getMainTypes(comp).then(data => {
                const filtered = isServiceModule
                    ? (data || []).filter(t => !t.main_Acc_Name?.toLowerCase().includes('cost of sales') && String(t.main_Acc_Code) !== '50000')
                    : (data || []);
                setMainTypes(filtered);
            }).catch(err => console.error("Failed to load main types", err));
        }
    }, [isOpen, isServiceModule]);

    useEffect(() => {
        if (isOpen) {
            const { companyCode: comp } = getSessionData();
            let apiType = selectedType;
            if (mainTypes.length > 0) {
                const matched = mainTypes.find(t => 
                    t.main_Acc_Name.toLowerCase() === selectedType.toLowerCase() || 
                    t.main_Acc_Name.toLowerCase().includes(selectedType.toLowerCase())
                );
                if (matched) apiType = matched.main_Acc_Name;
            }
            
            accountService.getParentAccounts(apiType, comp).then(data => {
                setDynamicSubGroups(data || []);
            }).catch(err => {
                console.error("Failed to load parent accounts", err);
                setDynamicSubGroups([]);
            });
        }
    }, [selectedType, mainTypes, isOpen]);

    const handleCreateClick = () => {
        setShowAccountBoard(true);
    };

    if (showAccountBoard) {
        return (
            <AccountBoard
                isOpen={isOpen}
                onClose={() => setShowAccountBoard(false)}
                selectedType={selectedType}
            />
        );
    }

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="CREATE NEW ACCOUNT"
        >
            <div className="py-1 select-none flex flex-col font-['Tahoma']">
                <div className="border-b border-gray-200 pb-2 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PlusCircle size={15} className="text-[#0285fd]" />
                        <h2 className="text-[12px] font-bold text-gray-700 uppercase tracking-tight">
                            Select One Account Type and Click Create
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            isServiceModule 
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                            {isServiceModule ? 'Service Module (Cost of Sales Hidden)' : 'Sales Module'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-[#0285fd] rounded border border-blue-100 uppercase tracking-wider">
                            Chart of Accounts v2.0
                        </span>
                    </div>
                </div>

                <div className="flex gap-6 px-1 items-stretch h-[460px]">
                    {/* Left Column: Radio Options (Categories in standard accounting order) */}
                    <div className="w-[260px] shrink-0 flex flex-col h-full">
                        <div className="p-4 border border-gray-200 bg-white rounded-[3px] shadow-sm flex-1 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                    Categories ({availableCategories.length} Active)
                                </p>
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-0.5">
                                {availableCategories.map(cat => (
                                    <div
                                        key={cat.key}
                                        onClick={() => setSelectedType(cat.key)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-[3px] cursor-pointer transition-all ${
                                            selectedType === cat.key
                                                ? 'bg-blue-50/70 border border-blue-200/80 shadow-xs'
                                                : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                selectedType === cat.key ? 'border-[#0285fd]' : 'border-gray-300 bg-white'
                                            }`}>
                                                {selectedType === cat.key && <div className="w-2 h-2 rounded-full bg-[#0285fd]" />}
                                            </div>
                                            <span className={`text-[12px] font-bold tracking-tight uppercase ${
                                                selectedType === cat.key ? 'text-[#0285fd]' : 'text-gray-700'
                                            }`}>
                                                {cat.label}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-gray-400">
                                            {cat.code}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Information Pane */}
                    <div className="flex-1 border border-gray-200 p-5 bg-white rounded-[3px] flex flex-col justify-between shadow-sm h-full">
                        <div className="text-center mb-3 border-b border-gray-100 pb-3">
                            <h3 className="text-[16px] font-bold text-gray-800 uppercase tracking-tight">
                                {currentDetails.title}
                            </h3>
                        </div>

                        <div className="space-y-3.5 flex-1 flex flex-col justify-between">
                            <div className="min-h-[44px] space-y-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Description</p>
                                <p className="text-[12px] text-gray-600 font-medium leading-relaxed">
                                    {currentDetails.description}
                                </p>
                            </div>

                            <div className="min-h-[64px] p-3.5 bg-blue-50/50 rounded-[3px] border border-blue-100 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <HelpCircle size={13} className="text-[#0285fd]" />
                                    <p className="text-[10px] font-bold text-[#0285fd] uppercase tracking-wider">Professional Accounting Tip</p>
                                </div>
                                <p className="text-[11.5px] text-gray-700 font-medium leading-normal">
                                    {currentDetails.tip}
                                </p>
                            </div>

                            {/* Sub-groups display */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Layers size={11} className="text-gray-400" /> Current Sub-Groups / Headings
                                    </p>
                                    <span className="text-[10px] font-bold text-gray-400">
                                        {(dynamicSubGroups.length > 0 ? dynamicSubGroups.length : currentDetails.examples.length)} items
                                    </span>
                                </div>
                                
                                <div className="h-[140px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar border border-gray-100 rounded-[3px] p-2 bg-gray-50/50">
                                    {dynamicSubGroups.length > 0 ? (
                                        dynamicSubGroups.map((group, i) => (
                                            <div key={i} className="flex gap-2.5 items-center bg-white px-2.5 py-1.5 rounded-[2px] border border-gray-100 shadow-2xs">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#0285fd] shrink-0"></div>
                                                <span className="text-[11.5px] text-gray-700 font-bold uppercase tracking-tight">
                                                    {group.code} - {group.name}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        currentDetails.examples.map((ex, i) => (
                                            <div key={i} className="flex gap-2.5 items-center bg-white px-2.5 py-1.5 rounded-[2px] border border-gray-100 shadow-2xs">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#0285fd] shrink-0"></div>
                                                <span className="text-[11.5px] text-gray-700 font-bold uppercase tracking-tight">
                                                    {ex}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        className="px-5 h-9 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-[3px] text-[12.5px] transition-all"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-6 h-9 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[12.5px] transition-all flex items-center gap-2 cursor-pointer"
                        onClick={handleCreateClick}
                    >
                        Create Account
                    </button>
                </div>
            </div>
        </SimpleModal>
    );
};

export default NewAccountBoard;
