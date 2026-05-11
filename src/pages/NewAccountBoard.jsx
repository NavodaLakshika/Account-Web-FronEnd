import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import AccountBoard from './AccountBoard';
import { HelpCircle, PlusCircle, Search, ChevronRight, CheckCircle2 } from 'lucide-react';
import { accountService } from '../services/account.service';
import { toast } from 'react-hot-toast';

const NewAccountBoard = ({ isOpen, onClose }) => {
    const [selectedType, setSelectedType] = useState('Expenses');
    const [showAccountBoard, setShowAccountBoard] = useState(false);

    const accountDetails = {
        Assets: {
            title: 'ASSETS (10000)',
            description: 'Tracks valuable resources owned by the company for future benefit, including cash, inventory, and fixed assets.',
            tip: 'Regularly audit physical assets for balance sheet accuracy.',
            examples: ['NON CURRENT ASSETS', 'CURRENT ASSETS']
        },
        Liabilities: {
            title: 'LIABILITIES (20000)',
            description: 'Tracks money the company owes to external parties, including loans, creditors, and payables.',
            tip: 'Monitor debt levels to maintain a healthy debt-to-equity ratio.',
            examples: ['NON CURRENT LIABILITIES', 'CURRENT LIABILITIES']
        },
        Equity: {
            title: 'EQUITY (30000)',
            description: 'Tracks the net worth of the business belonging to the owners/shareholders.',
            tip: 'Equity represents the residual interest in the assets after deducting liabilities.',
            examples: ['Owner Capital', 'Retained Earnings', 'Share Capital']
        },
        Income: {
            title: 'INCOME (40000)',
            description: 'Tracks revenue generated from primary business operations and sales.',
            tip: 'Record income when earned for accurate profit tracking.',
            examples: ['OPERATIONAL INCOME', 'OTHER INCOME']
        },
        'Cost of Sales': {
            title: 'COST OF SALES (50000)',
            description: 'Tracks direct costs incurred to produce or purchase the goods sold by the company.',
            tip: 'Accurate COS tracking is vital for calculating Gross Profit.',
            examples: ['Material Cost', 'Direct Labor', 'Production Overhead']
        },
        Expenses: {
            title: 'OPERATING EXPENSES (60000)',
            description: 'Tracks day-to-day operational costs not directly tied to production.',
            tip: 'Clearly categorize expenses for better budget management and tax reporting.',
            examples: ['ADMINISTRATION', 'SELLING & DISTRIBUTION', 'FINANCE & OTHER']
        },
        Other: {
            title: 'OTHER ACCOUNT TYPES',
            description: 'Specialized account categories for specific ledger requirements.',
            tip: 'Use specialized accounts for better balance sheet segmentation.',
            examples: ['Miscellaneous Accounts']
        }
    };

    const currentDetails = accountDetails[selectedType] || accountDetails['Other'];

    useEffect(() => {
        if (!isOpen) {
            setShowAccountBoard(false);
            setSelectedType('Expenses');
        }
    }, [isOpen]);

    const handleCreateClick = () => {
        setShowAccountBoard(true);
    };

    if (showAccountBoard) {
        return (
            <AccountBoard
                isOpen={isOpen}
                onClose={onClose}
                selectedType={selectedType}
            />
        );
    }

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="CREATE NEW ACCOUNT"
            maxWidth="max-w-[700px]"
        >
            <div className="py-1 select-none font-tahoma flex flex-col">
                {/* Header Subtitle */}
                <div className="border-b border-gray-100 pb-2 mb-6 flex items-center gap-2">
                    <PlusCircle size={14} className="text-[#0285fd]" />
                    <h2 className="text-[12px] font-bold text-blue-700 uppercase tracking-tight">
                       Select One Account Type and Click Create
                    </h2>
                </div>

                <div className="flex gap-8 px-1">
                    {/* Left Column: Radio Options */}
                    <div className="w-[240px] space-y-4">
                        <div className="p-5 border border-gray-100 bg-white rounded-lg shadow-sm">
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-4 border-b border-slate-50 pb-1">Categories</p>
                            <div className="space-y-3.5">
                                {['Income', 'Cost of Sales', 'Expenses', 'Assets', 'Liabilities', 'Equity'].map(type => (
                                    <RadioButton
                                        key={type}
                                        label={type}
                                        checked={selectedType === type}
                                        onChange={() => setSelectedType(type)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="p-5 border border-gray-100 bg-white rounded-lg shadow-sm">
                            <RadioButton
                                label="Other Account Types"
                                checked={selectedType === 'Other'}
                                onChange={() => setSelectedType('Other')}
                            />
                        </div>
                    </div>

                    {/* Right Column: Information Pane */}
                    <div 
                        key={selectedType}
                        className="flex-1 border border-blue-50 p-6 bg-white rounded-xl shadow-[0_10px_30px_rgba(2,133,253,0.03)] flex flex-col"
                    >
                        <div className="text-center mb-6 border-b border-blue-50 pb-4">
                            <h3 className="text-[16px] font-bold text-blue-900 uppercase">{currentDetails.title}</h3>
                        </div>

                        <div className="space-y-6 flex-grow">
                            <div className="space-y-2">
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Description</p>
                                <p className="text-[12px] text-slate-500 font-bold leading-relaxed">
                                    {currentDetails.description}
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <HelpCircle size={12} className="text-blue-500" />
                                    <p className="text-[9px] font-bold text-blue-500 uppercase">Professional Tip</p>
                                </div>
                                <p className="text-[12px] text-blue-800 font-bold leading-normal">
                                    {currentDetails.tip}
                                </p>
                            </div>

                            {currentDetails.examples.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Sub-Groups</p>
                                    <div className="grid grid-cols-1 gap-2 ml-1">
                                        {currentDetails.examples.map((ex, i) => (
                                            <div key={i} className="flex gap-3 items-center">
                                                <div className="w-2 h-2 rounded-full bg-[#0285fd] shrink-0"></div>
                                                <span className="text-[12px] text-slate-600 font-bold uppercase">{ex}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Action Area */}
                <div className="mt-8 flex justify-end">
                    <button
                        className="px-10 h-11 bg-[#2bb744] text-white text-[14px] font-black rounded-[5px] hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none uppercase font-tahoma shadow-sm"
                        onClick={handleCreateClick}
                    >
                        Create
                    </button>
                </div>
            </div>
        </SimpleModal>
    );
};

const RadioButton = ({ label, checked, onChange }) => (
    <div className="flex items-center gap-3.5 group cursor-pointer" onClick={onChange}>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'border-[#0285fd] bg-white' : 'border-gray-200 bg-white group-hover:border-gray-300'}`}>
            {checked && <div className="w-3.5 h-3.5 rounded-full bg-[#0285fd]" />}
        </div>
        <span className={`text-[12.5px] cursor-pointer transition-colors uppercase font-bold tracking-tight ${checked ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'}`}>
            {label}
        </span>
    </div>
);

export default NewAccountBoard;
