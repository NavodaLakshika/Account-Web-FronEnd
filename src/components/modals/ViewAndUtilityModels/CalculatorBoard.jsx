import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import { Delete, X } from 'lucide-react';

const CalculatorBoard = ({ isOpen, onClose }) => {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    const [isFinished, setIsFinished] = useState(false);

    const handleNumber = (num) => {
        if (display === '0' || isFinished) {
            setDisplay(num);
            setIsFinished(false);
        } else {
            setDisplay(display + num);
        }
    };

    const handleOperator = (op) => {
        setEquation(display + ' ' + op + ' ');
        setDisplay('0');
        setIsFinished(false);
    };

    const handleClear = () => {
        setDisplay('0');
        setEquation('');
        setIsFinished(false);
    };

    const handleEqual = () => {
        try {
            const result = eval(equation + display);
            setDisplay(String(result));
            setEquation('');
            setIsFinished(true);
        } catch (e) {
            setDisplay('Error');
        }
    };

    const buttons = [
        { label: 'C', onClick: handleClear, className: 'bg-red-50 text-red-600 border-red-200' },
        { label: '÷', onClick: () => handleOperator('/'), className: 'bg-blue-50 text-blue-600 border-blue-200' },
        { label: '×', onClick: () => handleOperator('*'), className: 'bg-blue-50 text-blue-600 border-blue-200' },
        { label: 'DEL', onClick: () => setDisplay(display.length > 1 ? display.slice(0, -1) : '0'), className: 'bg-orange-50 text-orange-600 border-orange-200' },
        
        { label: '7', onClick: () => handleNumber('7') },
        { label: '8', onClick: () => handleNumber('8') },
        { label: '9', onClick: () => handleNumber('9') },
        { label: '-', onClick: () => handleOperator('-'), className: 'bg-blue-50 text-blue-600 border-blue-200' },
        
        { label: '4', onClick: () => handleNumber('4') },
        { label: '5', onClick: () => handleNumber('5') },
        { label: '6', onClick: () => handleNumber('6') },
        { label: '+', onClick: () => handleOperator('+'), className: 'bg-blue-50 text-blue-600 border-blue-200' },
        
        { label: '1', onClick: () => handleNumber('1') },
        { label: '2', onClick: () => handleNumber('2') },
        { label: '3', onClick: () => handleNumber('3') },
        { label: '=', onClick: handleEqual, className: 'bg-[#0078d4] text-white border-[#005a9e] row-span-2' },
        
        { label: '0', onClick: () => handleNumber('0'), className: 'col-span-2' },
        { label: '.', onClick: () => handleNumber('.') },
    ];

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Calculator"
            maxWidth="max-w-[320px]"
        >
            <div className="p-2 space-y-4">
                {/* Result Display */}
                <div className="bg-[#f3f4f6] p-4 border border-gray-300 rounded-sm shadow-inner text-right min-h-[80px] flex flex-col justify-end">
                    <div className="text-[12px] font-bold text-gray-400 h-5 tracking-tight">{equation}</div>
                    <div className="text-[28px] font-bold text-gray-800 truncate tracking-tight">{display}</div>
                </div>

                {/* Button Grid */}
                <div className="grid grid-cols-4 gap-2">
                    {buttons.map((btn, idx) => (
                        <button
                            key={idx}
                            onClick={btn.onClick}
                            className={`
                                h-12 flex items-center justify-center text-[15px] font-bold border rounded-sm shadow-sm transition-all active:scale-95 active:shadow-inner
                                ${btn.className || 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
                            `}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>
        </SimpleModal>
    );
};

export default CalculatorBoard;
