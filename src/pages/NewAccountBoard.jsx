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
        Income: {
            title: 'Income Account',
            description: 'Tracks revenue generated from primary business operations and sales.',
            tip: 'Record income when earned for accurate profit tracking.',
            examples: ['Product Sales', 'Service Fees', 'Interest Income']
        },
        Expense: {
            title: 'Expense Account',
            description: 'Tracks costs incurred during regular business operation activities.',
            tip: 'Clearly categorize expenses for better tax reporting.',
            examples: ['Office Rent', 'Utility Bills', 'Staff Salaries']
        },
        Assets: {
            title: 'Assets Account',
            description: 'Tracks valuable resources owned by the company for future benefit.',
            tip: 'Regularly audit physical assets for balance sheet accuracy.',
            examples: ['Inventory', 'Equipment', 'Property Value']
        },
        Bank: {
            title: 'Bank Account',
            description: 'Tracks liquid cash balances held within various financial accounts.',
            tip: 'Perform weekly reconciliations to catch errors early.',
            examples: ['Checking', 'Savings', 'Petty Cash']
        },
        Loan: {
            title: 'Loan Account',
            description: 'Tracks borrowed funds from lenders that must be repaid over time.',
            tip: 'Monitor interest rates to manage debt effectively.',
            examples: ['Bank Loans', 'Mortgages', 'Credit Lines']
        },
        Equity: {
            title: 'Equity Account',
            description: 'Tracks the net worth of the business belonging to the owners.',
            tip: 'Equity represents the owners\' stake in the business.',
            examples: ['Owner Capital', 'Stock Shares', 'Net Earnings']
        },
        'Credit Cards': {
            title: 'Credit Cards Account',
            description: 'Tracks revolving debt and liabilities from corporate card usage.',
            tip: 'Pay off balances monthly to avoid high interest fees.',
            examples: ['Visa Card', 'Mastercard', 'Amex Business']
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
            setSelectedType('Expense');
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
                                    label="Expense"
                                    id="expce"
                                    name="accountType"
                                    checked={selectedType === 'Expense'}
                                    onChange={() => setSelectedType('Expense')}
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
                                    label="Bank"
                                    id="bank"
                                    name="accountType"
                                    checked={selectedType === 'Bank'}
                                    onChange={() => setSelectedType('Bank')}
                                />
                                <RadioButton
                                    label="Loan"
                                    id="loan"
                                    name="accountType"
                                    checked={selectedType === 'Loan'}
                                    onChange={() => setSelectedType('Loan')}
                                />
                                <RadioButton
                                    label="Equity"
                                    id="equity"
                                    name="accountType"
                                    checked={selectedType === 'Equity'}
                                    onChange={() => setSelectedType('Equity')}
                                />
                                <RadioButton
                                    label="Credit Cards"
                                    id="credit"
                                    name="accountType"
                                    checked={selectedType === 'Credit Cards'}
                                    onChange={() => setSelectedType('Credit Cards')}
                                />
                                <div className="pt-2 mt-2 border-t border-gray-200 flex items-center justify-between group">
                                    <RadioButton
                                        label={otherAccountType || "Other"}
                                        id="other"
                                        name="accountType"
                                        checked={selectedType === 'Other'}
                                        onChange={() => {
                                            setSelectedType('Other');
                                            setShowTypeModal(true);
                                        }}
                                    />
                                    <button 
                                        onClick={() => setShowTypeModal(true)}
                                        className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] hover:bg-blue-600 transition-all active:scale-95 shrink-0 shadow-sm"
                                    >
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Information Pane with Cinematic Page-Turn & Glow */}
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

