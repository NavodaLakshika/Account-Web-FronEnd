import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { HelpCircle, ChevronDown, PlusCircle , X} from 'lucide-react';

const NewAccountBoard = ({ isOpen, onClose }) => {
    const [selectedType, setSelectedType] = useState('Expence');
    const [otherAccountType, setOtherAccountType] = useState('');

    const accountDetails = {
        Income: {
            title: 'Income Account',
            description: 'Categorizes money your business earns through sales, services, or other revenue streams.',
            examples: ['Product sales', 'Service fees', 'Interest income', 'Rental income']
        },
        Expence: {
            title: 'Expense Account',
            description: 'Categorizes money spent in the course of normal business operations, such as:',
            examples: [
                'Advertising and promotion',
                'Office supplies',
                'Insurance',
                'Legal fees',
                'Charitable contributions',
                'Rent'
            ]
        },
        Assets: {
            title: 'Assets Account',
            description: 'Tracks the value of things your business owns, from cash to physical property.',
            examples: ['Inventory', 'Equipment', 'Vehicles', 'Real Estate']
        },
        Bank: {
            title: 'Bank Account',
            description: 'Tracks money held in financial institutions, including checking and savings accounts.',
            examples: ['Checking account', 'Savings account', 'Money market account']
        },
        Loan: {
            title: 'Loan Account',
            description: 'Tracks money borrowed from lenders and the balance remaining to be paid.',
            examples: ['Business loans', 'Mortgages', 'Lines of credit']
        },
        Equity: {
            title: 'Equity Account',
            description: 'Tracks the owners\' investment in the business and retained earnings.',
            examples: ['Owner\'s equity', 'Common stock', 'Retained earnings']
        },
        'Credit Cards': {
            title: 'Credit Cards Account',
            description: 'Tracks liabilities incurred through the use of corporate credit cards.',
            examples: ['Business credit cards', 'Store credit cards']
        }
    };

    const currentDetails = accountDetails[selectedType] || {
        title: 'Other Account Type',
        description: 'Select an account type from the dropdown to see more details.',
        examples: []
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Account"
            maxWidth="max-w-2xl"
            footer={
                <>
                    <button
                        className="px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2"
                        onClick={() => {
                            console.log('Creating account:', selectedType === 'Other' ? otherAccountType : selectedType);
                            onClose();
                        }}
                    >
                        <PlusCircle size={14} /> Create Account
                    </button>
                    <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95">
                        <X size={14} /> Exit
                    </button>
                </>
            }
        >
            <div className="space-y-6">
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
                                    checked={selectedType === 'Expence'}
                                    onChange={() => setSelectedType('Expence')}
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
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Information Pane */}
                    <div className="flex-1 border border-gray-200 p-6 bg-blue-50/30 rounded-sm">
                        <div className="text-center mb-6">
                            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-tight">{currentDetails.title}</h3>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed mb-4">
                            {currentDetails.description}
                        </p>

                        {currentDetails.examples.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Examples:</p>
                                <ul className="text-xs text-gray-600 space-y-1.5 ml-2">
                                    {currentDetails.examples.map((ex, i) => (
                                        <li key={i} className="flex gap-2 items-start">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                                            <span>{ex}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Row: Other Account Type */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 w-[180px] shrink-0">
                            <input
                                type="radio"
                                id="other"
                                name="accountType"
                                checked={selectedType === 'Other'}
                                onChange={() => setSelectedType('Other')}
                                className="w-4 h-4 cursor-pointer accent-[#0078d4]"
                            />
                            <label htmlFor="other" className={`text-sm cursor-pointer ${selectedType === 'Other' ? 'font-bold text-gray-900' : 'text-gray-700 font-medium'}`}>Other Account Type</label>
                        </div>
                        <div className="relative flex-1">
                            <select
                                disabled={selectedType !== 'Other'}
                                value={otherAccountType}
                                onChange={(e) => setOtherAccountType(e.target.value)}
                                className="w-full h-8 px-2 pr-8 text-sm bg-white border border-gray-300 rounded-sm appearance-none disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:border-blue-500"
                            >
                                <option value="" disabled>Select from registry...</option>
                                <option value="Cost of Goods Sold">Cost of Goods Sold</option>
                                <option value="Other Income">Other Income</option>
                                <option value="Other Expense">Other Expense</option>
                                <option value="Other Current Asset">Other Current Asset</option>
                                <option value="Fixed Asset">Fixed Asset</option>
                                <option value="Other Current Liability">Other Current Liability</option>
                                <option value="Long Term Liability">Long Term Liability</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
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

