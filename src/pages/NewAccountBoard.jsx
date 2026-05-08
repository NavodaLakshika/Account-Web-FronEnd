import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import AccountBoard from './AccountBoard';
import MainAccountTypeModal from '../components/MainAccountTypeModal';
import { HelpCircle, ChevronDown, PlusCircle, X, Search } from 'lucide-react';

const NewAccountBoard = ({ isOpen, onClose }) => {
    const [selectedType, setSelectedType] = useState('Expense');
    const [otherAccountType, setOtherAccountType] = useState('');
    const [showTypeModal, setShowTypeModal] = useState(false);

    const accountDetails = {
        Assets: {
            title: 'Assets (1xxxx)',
            description: 'Tracks valuable resources owned by the company for future benefit, including cash, inventory, and fixed assets.',
            tip: 'Regularly audit physical assets for balance sheet accuracy.',
            examples: ['Cash in Hand', 'Bank Accounts', 'Inventory', 'Fixed Assets']
        },
        Liabilities: {
            title: 'Liabilities (2xxxx)',
            description: 'Tracks money the company owes to external parties, including loans, creditors, and payables.',
            tip: 'Monitor debt levels to maintain a healthy debt-to-equity ratio.',
            examples: ['Bank Loans', 'Trade Creditors', 'VAT Payable', 'Accrued Expenses']
        },
        Equity: {
            title: 'Equity (3xxxx)',
            description: 'Tracks the net worth of the business belonging to the owners/shareholders.',
            tip: 'Equity represents the residual interest in the assets after deducting liabilities.',
            examples: ['Owner Capital', 'Retained Earnings', 'Share Capital', 'Drawings']
        },
        Income: {
            title: 'Income (4xxxx)',
            description: 'Tracks revenue generated from primary business operations and sales.',
            tip: 'Record income when earned for accurate profit tracking.',
            examples: ['Local Sales', 'Export Sales', 'Service Income', 'Commission']
        },
        'Cost of Sales': {
            title: 'Cost of Sales (5xxxx)',
            description: 'Tracks direct costs incurred to produce or purchase the goods sold by the company.',
            tip: 'Accurate COS tracking is vital for calculating Gross Profit.',
            examples: ['Material Cost', 'Direct Labor', 'Production Overhead', 'Freight In']
        },
        Expenses: {
            title: 'Operating Expenses (6xxxx)',
            description: 'Tracks day-to-day operational costs not directly tied to production.',
            tip: 'Clearly categorize expenses for better budget management and tax reporting.',
            examples: ['Office Rent', 'Electricity', 'Staff Salaries', 'Telephone & Internet']
        },
        'Other Income': {
            title: 'Other Income (7xxxx)',
            description: 'Tracks revenue from non-operating activities like interest or asset disposal gains.',
            tip: 'Separate other income to understand the core performance of the business.',
            examples: ['Interest Income', 'Gain on Disposal', 'Rent Income']
        },
        'Other Expenses': {
            title: 'Other Expenses (8xxxx)',
            description: 'Tracks non-operating costs such as bank charges and interest expenses.',
            tip: 'Monitor these costs to identify potential savings in financial transactions.',
            examples: ['Bank Charges', 'Interest Expense', 'Exchange Loss']
        }
    };

    const currentDetails = accountDetails[selectedType] || {
        title: 'Other Account Type',
        description: 'Select an account type from the dropdown to see more details.',
        examples: []
    };

    const [showAccountBoard, setShowAccountBoard] = useState(false);

    // Reset state when modal is closed
    React.useEffect(() => {
        if (!isOpen) {
            setShowAccountBoard(false);
            setSelectedType('Assets');
            setOtherAccountType('');
        }
    }, [isOpen]);

    const handleCreateClick = () => {
        const finalType = selectedType === 'Other' ? otherAccountType : selectedType;
        if (!finalType) {
            toast.error('Please select an account type first');
            return;
        }
        setShowAccountBoard(true);
    };

    if (showAccountBoard) {
        return (
            <AccountBoard
                isOpen={isOpen}
                onClose={onClose}
                selectedType={selectedType === 'Other' ? otherAccountType : selectedType}
            />
        );
    }

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Account"
            maxWidth="max-w-2xl"
            footer={
                <div className="bg-slate-50  w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
                    <button
                        className="px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center gap-2"
                        onClick={handleCreateClick}
                    >
                        <PlusCircle size={14} /> Create Account
                    </button>
                </div>
            }
        >
            <div className="py-2 select-none font-['Tahoma'] space-y-6">
                <h2 className="text-sm font-bold text-blue-800 uppercase border-b border-blue-100 pb-2">Select One Account Type and Click Create</h2>

                <div className="flex gap-6">
                    {/* Left Column: Radio Options */}
                    <div className="flex-1 space-y-6">
                        <div className="p-4 border border-gray-200 bg-gray-50/50 rounded-sm">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Earnings & Operations</p>
                            <div className="space-y-3 ml-2">
                                <RadioButton
                                    label="Income"
                                    id="income"
                                    name="accountType"
                                    checked={selectedType === 'Income'}
                                    onChange={() => setSelectedType('Income')}
                                />
                                <RadioButton
                                    label="Cost of Sales"
                                    id="cos"
                                    name="accountType"
                                    checked={selectedType === 'Cost of Sales'}
                                    onChange={() => setSelectedType('Cost of Sales')}
                                />
                                <RadioButton
                                    label="Expenses"
                                    id="expce"
                                    name="accountType"
                                    checked={selectedType === 'Expenses'}
                                    onChange={() => setSelectedType('Expenses')}
                                />
                                <RadioButton
                                    label="Other Income"
                                    id="otherIncome"
                                    name="accountType"
                                    checked={selectedType === 'Other Income'}
                                    onChange={() => setSelectedType('Other Income')}
                                />
                                <RadioButton
                                    label="Other Expenses"
                                    id="otherExpenses"
                                    name="accountType"
                                    checked={selectedType === 'Other Expenses'}
                                    onChange={() => setSelectedType('Other Expenses')}
                                />
                            </div>
                        </div>

                        <div className="p-4 border border-gray-200 bg-gray-50/50 rounded-sm">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Assets & Liabilities</p>
                            <div className="space-y-3 ml-2">
                                <RadioButton
                                    label="Assets"
                                    id="assets"
                                    name="accountType"
                                    checked={selectedType === 'Assets'}
                                    onChange={() => setSelectedType('Assets')}
                                />
                                <RadioButton
                                    label="Liabilities"
                                    id="liabilities"
                                    name="accountType"
                                    checked={selectedType === 'Liabilities'}
                                    onChange={() => setSelectedType('Liabilities')}
                                />
                                <RadioButton
                                    label="Equity"
                                    id="equity"
                                    name="accountType"
                                    checked={selectedType === 'Equity'}
                                    onChange={() => setSelectedType('Equity')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Information Pane with original style */}
                    <div 
                        key={selectedType}
                        className="flex-1 border border-blue-200 p-6 bg-white rounded-sm shadow-[0_0_15px_rgba(30,144,255,0.05)] animate-in slide-in-from-right-4 fade-in duration-500 ease-out"
                    >
                        <div className="text-center mb-6 border-b border-blue-50 pb-4">
                            <h3 className="text-[13px] font-black text-blue-900 uppercase tracking-widest">{currentDetails.title}</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Description</p>
                                <p className="text-[11px] text-gray-600 leading-relaxed ">
                                    "{currentDetails.description}"
                                </p>
                            </div>

                            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                                <p className="text-[10px] font-bold text-blue-400 uppercase mb-1.5 tracking-wider flex items-center gap-1.5">
                                    <HelpCircle size={10} /> Professional Tip
                                </p>
                                <p className="text-[11px] text-blue-800 font-medium">
                                    {currentDetails.tip}
                                </p>
                            </div>

                            {currentDetails.examples.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Common Examples</p>
                                    <div className="grid grid-cols-1 gap-2 ml-1">
                                        {currentDetails.examples.map((ex, i) => (
                                            <div key={i} className="flex gap-2 items-center group/item">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover/item:scale-125 transition-transform shrink-0"></div>
                                                <span className="text-[11px] text-gray-600 font-bold group-hover/item:text-blue-600 transition-colors">{ex}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <MainAccountTypeModal
                isOpen={showTypeModal}
                onClose={() => setShowTypeModal(false)}
                onSelect={(type) => {
                    setOtherAccountType(type.main_Acc_Name);
                    setSelectedType('Other');
                }}
            />
        </SimpleModal>
    );
};

const RadioButton = ({ label, id, name, checked, onChange }) => (
    <div className="flex items-center gap-3">
        <input
            type="radio"
            id={id}
            name={name}
            checked={checked}
            onChange={onChange}
            className="w-4 h-4 cursor-pointer accent-[#0078d4]"
        />
        <label htmlFor={id} className={`text-sm cursor-pointer transition-colors ${checked ? 'font-bold text-gray-900' : 'text-gray-600 font-medium hover:text-gray-900'}`}>
            {label}
        </label>
    </div>
);

export default NewAccountBoard;

