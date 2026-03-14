import React from 'react';
import SimpleModal from '../components/SimpleModal';
import { 
  Home, 
  PenTool, 
  Truck, 
  Wallet, 
  FileText, 
  CreditCard, 
  Users, 
  ArrowDownLeft, 
  RefreshCcw, 
  Settings, 
  BookOpen, 
  Globe, 
  ChevronRight,
  Landmark,
  Layers,
  BarChart3,
  Search
} from 'lucide-react';

const HomeBoard = ({ isOpen, onClose }) => {
    return (
        <SimpleModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Naval Intelligence - Main Dashboard"
            maxWidth="max-w-[1240px]"
            footer={
                <div className="flex gap-4 items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-4">System Console Ready</span>
                    <button onClick={onClose} className="px-8 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100">
                        Exit Dashboard
                    </button>
                </div>
            }
        >
            <div className="flex flex-col h-full bg-white select-none">
                {/* 1. Dashboard Tabs (matches first image) */}
                <div className="flex items-center gap-1 mb-6 border-b border-slate-200 pb-2">
                    <div className="bg-[#eef8ff] border border-slate-300 rounded-t-lg px-8 py-2 flex items-center gap-2 shadow-sm relative -bottom-[9px] z-10 border-b-white">
                        <Home size={18} className="text-[#0078d4]" />
                        <span className="text-xl font-black italic text-[#0078d4] tracking-tighter">Home</span>
                    </div>
                    {['Vender', 'Customer', 'Acc. Balance'].map((tab, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 border-b-0 rounded-t-lg px-6 py-2 flex items-center gap-2 opacity-60 grayscale scale-95 origin-bottom relative -bottom-[9px]">
                            <span className="text-xs font-bold text-slate-500">{tab}</span>
                        </div>
                    ))}
                    <div className="ml-auto text-right pr-4">
                         <span className="bg-[#0078d4]/10 text-[#0078d4] px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full">Select Item to Quick View</span>
                    </div>
                </div>

                {/* 2. Main Flow Diagram Container */}
                <div className="grid grid-cols-12 gap-6 bg-slate-50/50 p-6 rounded-sm border border-slate-200 border-t-4 border-t-[#0078d4] shadow-inner min-h-[500px]">
                    
                    {/* Left Side: Operations (Flow Diagrams) */}
                    <div className="col-span-12 lg:col-span-9 space-y-6">
                        
                        {/* A. Vendors & Purchasing Section */}
                        <div className="bg-white border border-slate-300 rounded-sm p-8 relative shadow-sm min-h-[220px]">
                             <div className="absolute -top-3 left-8 px-4 bg-white border border-slate-300 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Vendors & Purchasing</div>
                             
                             {/* Flow Items and Connecting Lines */}
                             <div className="relative h-full">
                                 {/* Horizontal Line PO -> GRN -> Petty Cash */}
                                 <div className="absolute top-8 left-[10%] right-[15%] h-0.5 bg-slate-200" />
                                 <div className="absolute top-[32px] left-[25%]"><ChevronRight size={16} className="text-slate-300" /></div>
                                 <div className="absolute top-[32px] left-[58%]"><ChevronRight size={16} className="text-slate-300" /></div>
                                 
                                 <div className="grid grid-cols-3 gap-2 relative z-10">
                                     <NavIcon icon={PenTool} label="Purchase Order" />
                                     <NavIcon icon={Truck} label="GRN" />
                                     <NavIcon icon={Wallet} label="Petty Cash" />
                                 </div>

                                 {/* Vertical & Lower Branch */}
                                 <div className="absolute top-16 left-[16%] w-0.5 h-16 bg-slate-200" />
                                 <div className="absolute top-[128px] left-[16%] right-[30%] h-0.5 bg-slate-200" />
                                 
                                 <div className="mt-16 ml-[25%] grid grid-cols-2 gap-2 relative z-10 justify-items-start">
                                     <NavIcon icon={FileText} label="Enter Bills" highlight />
                                     <div className="ml-20">
                                        <NavIcon icon={CreditCard} label="Pay Bills" />
                                     </div>
                                 </div>
                             </div>
                        </div>

                        {/* B. Customers & Sales Section */}
                        <div className="bg-white border border-slate-300 rounded-sm p-8 relative shadow-sm min-h-[260px]">
                             <div className="absolute -top-3 left-8 px-4 bg-white border border-slate-300 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Customers & Sales</div>
                             
                             {/* Flow Items and Connecting Lines */}
                             <div className="relative h-full">
                                 {/* Horizontal Line Estimate -> Invoice -> Payment -> Refund */}
                                 <div className="absolute top-32 left-[10%] right-[10%] h-0.5 bg-slate-200" />
                                 <div className="absolute top-[128px] left-[32%]"><ChevronRight size={16} className="text-slate-300" /></div>
                                 <div className="absolute top-[128px] left-[55%]"><ChevronRight size={16} className="text-slate-300" /></div>
                                 <div className="absolute top-[128px] left-[78%]"><ChevronRight size={16} className="text-slate-300" /></div>

                                 {/* Upper part (Sales Order) */}
                                 <div className="flex justify-center mb-8 relative z-10">
                                     <NavIcon icon={Users} label="Sales Order" />
                                     {/* Connector lines from SO */}
                                     <div className="absolute top-10 left-[50%] w-0.5 h-22 bg-slate-200" />
                                 </div>

                                 <div className="grid grid-cols-4 gap-2 relative z-10">
                                     <NavIcon icon={ArrowDownLeft} label="Estimate" />
                                     <NavIcon icon={PenTool} label="Create Invoice" highlight />
                                     <NavIcon icon={CreditCard} label="Receive Payment" />
                                     <NavIcon icon={RefreshCcw} label="Refunds" />
                                 </div>
                                 
                                 {/* Connector to Receipt */}
                                 <div className="absolute top-16 right-[35%] w-0.5 h-16 bg-slate-200" />
                                 <div className="absolute top-12 right-[25%] relative z-10 flex justify-end">
                                     <NavIcon icon={FileText} label="Create Sales Receipt" horizontal />
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Right Side: Utilities & External */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                        {/* Company Quadrant */}
                        <div className="bg-white border border-slate-300 rounded-sm p-6 relative shadow-sm h-[220px]">
                            <div className="absolute -top-3 left-6 px-3 bg-white border border-slate-300 text-[#0078d4] text-[10px] font-black uppercase tracking-widest">Company</div>
                            <div className="flex flex-col items-center gap-6 pt-4">
                                 <NavIcon icon={Settings} label="Items & Services" horizontal small />
                                 <NavIcon icon={BookOpen} label="Journal Entry" horizontal small />
                                 <NavIcon icon={Globe} label="Marketing Tool" horizontal small />
                            </div>
                        </div>

                        {/* Banking Quadrant */}
                        <div className="bg-white border border-slate-300 rounded-sm p-6 relative shadow-sm h-[260px]">
                            <div className="absolute -top-3 left-6 px-3 bg-white border border-slate-300 text-[#0078d4] text-[10px] font-black uppercase tracking-widest">Banking</div>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-6 pt-6">
                                <NavIcon icon={ArrowDownLeft} label="Deposit" small />
                                <NavIcon icon={Layers} label="Register" small />
                                <NavIcon icon={PenTool} label="Write Cheque" small />
                                <NavIcon icon={RefreshCcw} label="Print Cheque" small />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

const NavIcon = ({ icon: Icon, label, horizontal, small, highlight }) => (
    <div className={`flex ${horizontal ? 'flex-row items-center gap-4' : 'flex-col items-center gap-2'} group cursor-pointer transition-all`}>
        <div className={`
            ${small ? 'w-10 h-10' : 'w-14 h-14'} 
            bg-white border border-gray-300 rounded-sm flex items-center justify-center shadow-sm
            group-hover:border-blue-500 group-hover:bg-blue-50 transition-all
            ${highlight ? 'border-orange-300 bg-orange-50/30' : ''}
        `}>
            <Icon size={small ? 16 : 24} className={`
                ${highlight ? 'text-orange-600' : 'text-gray-600'} 
                group-hover:text-blue-600 transition-colors
            `} />
        </div>
        <span className={`
            text-[10px] font-bold text-gray-600 uppercase tracking-tighter leading-tight text-center
            group-hover:text-[#0078d4]
            ${horizontal ? 'text-left' : ''}
        `}>
            {label}
        </span>
    </div>
);

export default HomeBoard;
