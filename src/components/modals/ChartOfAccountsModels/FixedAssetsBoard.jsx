import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import CalendarModal from '../../CalendarModal';
import { Search, RotateCcw, Save, Calendar, Loader2, X, PlusCircle } from 'lucide-react';
import { fixedAssetService } from '../../../services/fixedAsset.service';
import { toast } from 'react-hot-toast';

const FixedAssetsBoard = ({ isOpen, onClose }) => {
    const initialState = {
        AssetsCode: '',
        AssetsName: '',
        AccCode: '',
        Company: '',
        PurchDescription: '',
        Condition: 'New',
        PurchDate: new Date().toISOString().split('T')[0],
        PurchCost: '0.00',
        Vendor: '',
        AssetSold: '',
        SalesDescription: '',
        SalesDate: new Date().toISOString().split('T')[0],
        SellingPrice: '0.00',
        SalesExpense: '0.00',
        AssetLongDescription: '',
        Location: '',
        SerialNo: '',
        WarrantyExpiry: new Date().toISOString().split('T')[0],
        Note: '',
        CurrentUser: 'SYSTEM'
    };

    const [formData, setFormData] = useState(initialState);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [assetsList, setAssetsList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAccountSearch, setShowAccountSearch] = useState(false);
    const [accSearchQuery, setAccSearchQuery] = useState('');
    const [showPurchDateModal, setShowPurchDateModal] = useState(false);
    const [showSalesDateModal, setShowSalesDateModal] = useState(false);
    const [showWarrantyExpiryModal, setShowWarrantyExpiryModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const companyData = localStorage.getItem('selectedCompany');
            const user = JSON.parse(localStorage.getItem('user'));
            let companyCode = 'C001';
            
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) { companyCode = companyData; }
            }

            setFormData(prev => ({ 
                ...prev, 
                Company: companyCode,
                CurrentUser: user?.emp_Name || user?.empName || 'SYSTEM'
            }));

            fetchLookups();
            fetchNextCode(companyCode);
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await fixedAssetService.getLookups();
            // Process to remove duplicates from join and format for display
            const formatted = [];
            let lastCode = "";
            data.forEach(item => {
                if (item.sub_Code !== lastCode) {
                    formatted.push({ 
                        code: item.sub_Code, 
                        name: item.sub_Acc_Name, 
                        isMain: true 
                    });
                    lastCode = item.sub_Code;
                }
                if (item.sub_Cust_Acc_Code) {
                    formatted.push({ 
                        code: item.sub_Cust_Acc_Code, 
                        name: `      ${item.sub_Cust_Acc_Name}`, 
                        isMain: false 
                    });
                }
            });
            setAccounts(formatted);
        } catch (error) {
            console.error('Lookup fetch error:', error);
        }
    };

    const fetchNextCode = async (company) => {
        try {
            const code = await fixedAssetService.getNextCode(company);
            setFormData(prev => ({ ...prev, AssetsCode: code }));
        } catch (error) {}
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 'Sold' : '') : value
        }));
    };

    const handleClear = () => {
        setFormData({
            ...initialState,
            Company: formData.Company,
            CurrentUser: formData.CurrentUser
        });
        setIsEditMode(false);
        fetchNextCode(formData.Company);
    };

    const handleAccountSelect = (code, name) => {
        setFormData(prev => ({ ...prev, AccCode: code }));
        setShowAccountSearch(false);
    };

    const handleDateSelect = (field, date) => {
        setFormData(prev => ({ ...prev, [field]: date }));
    };

    const handleSave = async () => {
        if (!formData.AssetsCode || !formData.AssetsName) {
            toast.error('Enter Account Code and Account Name.');
            return;
        }
        if (!formData.AccCode || formData.AccCode === '< Select Account >') {
            toast.error('Select Assets Account Name.');
            return;
        }
        if (parseFloat(formData.PurchCost) === 0) {
            toast.error('Enter Cost.');
            return;
        }

        setLoading(true);
        try {
            await fixedAssetService.save({
                ...formData,
                PurchCost: parseFloat(formData.PurchCost),
                SellingPrice: parseFloat(formData.SellingPrice),
                SalesExpense: parseFloat(formData.SalesExpense)
            });
            toast.success(isEditMode ? 'Record Updated Successfully' : 'New record Added Successfully');
            handleClear();
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openSearch = async () => {
        setLoading(true);
        try {
            const data = await fixedAssetService.search(formData.Company);
            setAssetsList(data);
            setShowSearchModal(true);
        } catch (err) {
            toast.error('Failed to load assets list');
        } finally {
            setLoading(false);
        }
    };

    const selectAsset = async (code) => {
        setLoading(true);
        try {
            const data = await fixedAssetService.getByCode(code, formData.Company);
            setFormData({
                AssetsCode: data.assets_Code || data.Assets_Code,
                AssetsName: data.assets_Name || data.Assets_Name,
                AccCode: data.acc_Code || data.Acc_Code,
                Company: data.company || data.Company,
                PurchDescription: data.purch_Name || data.Purch_Name,
                Condition: data.cond_Type || data.Cond_Type,
                PurchDate: convertDateToDisplay(data.purch_Date || data.Purch_Date),
                PurchCost: data.purch_Price || data.Purch_Price,
                Vendor: data.payee || data.Payee,
                AssetSold: data.ass_Sold || data.Ass_Sold,
                SalesDescription: data.sales_Name || data.Sales_Name,
                SalesDate: convertDateToDisplay(data.sales_Date || data.Sales_Date),
                SellingPrice: data.selling_Price || data.Selling_Price,
                SalesExpense: data.sales_Expence || data.Sales_Expence,
                AssetLongDescription: data.assets_Description || data.Assets_Description,
                Location: data.location || data.Location,
                SerialNo: data.serial_No || data.Serial_No,
                WarrantyExpiry: convertDateToDisplay(data.warranty_Exp || data.Warranty_Exp),
                Note: data.referance || data.Referance,
                CurrentUser: formData.CurrentUser
            });
            setIsEditMode(true);
            setShowSearchModal(false);
        } catch (error) {
            toast.error('Failed to load asset details');
        } finally {
            setLoading(false);
        }
    };

    const convertDateToDisplay = (dateStr) => {
        if (!dateStr) return new Date().toISOString().split('T')[0];
        // Handles dd/MM/yyyy to yyyy-MM-dd
        if (dateStr.includes('/')) {
            const [d, m, y] = dateStr.split('/');
            return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        return dateStr.split(' ')[0];
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="New Fixed Assets Item"
                maxWidth="max-w-4xl"
                footer={
                    <div className="bg-slate-50 px-6 w-full flex justify-end gap-3 border-t border-gray-100 mt-1 rounded-b-xl">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            {isEditMode ? 'Update' : 'Save'}
                        </button>
                        <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RotateCcw size={14} /> Clear
                        </button>
                    </div>
                }
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-4">
                    {/* Info Header */}
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-[5px] shadow-sm">
                        <p className="text-[12px] font-bold text-[#0369a1] text-center leading-relaxed ">
                            Use for property you purchase, track, and may eventually sell. Fixed assets are
                            long-lived assets, such as land, buildings, furniture, equipment, and vehicles.
                        </p>
                    </div>

                    {/* Top Section */}
                    <div className="bg-white p-4 border border-gray-200 rounded-[5px] space-y-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-700 w-[140px] shrink-0 uppercase">Asset Number / Name</label>
                            <div className="flex flex-1 gap-2">
                                <input type="text" name="AssetsCode" value={formData.AssetsCode} onChange={handleInputChange} readOnly className="w-32 h-8 border border-gray-300 px-2 text-sm bg-gray-50 font-bold text-blue-600 rounded-[5px] text-center" />
                                <div className="flex-1 flex gap-1 items-center">
                                    <input type="text" name="AssetsName" value={formData.AssetsName} onChange={handleInputChange} className="min-w-0 flex-1 h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-500 outline-none rounded-[5px] bg-white font-bold text-gray-700 shadow-sm" placeholder="" />
                                    <button onClick={openSearch} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"><Search size={18} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-bold text-gray-700 w-[140px] shrink-0 uppercase">Asset Accounts of</label>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={accounts.find(a => a.code === formData.AccCode)?.name?.trim() || formData.AccCode} 
                                    readOnly 
                                    className="min-w-0 flex-1 h-8 border border-gray-300 px-3 text-[12.5px] bg-gray-50 rounded-[5px] outline-none font-bold text-blue-600 shadow-sm cursor-default" 
                                />
                                <button 
                                    onClick={() => setShowAccountSearch(true)} 
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Middle Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Purchase Information */}
                        <div className="border border-gray-200 rounded-[5px] p-4 relative pt-6 bg-slate-50/30">
                            <span className="absolute -top-3 left-3 bg-white px-2 py-0.5 border border-gray-200 rounded-[5px] text-[10px] font-bold text-[#0078d4] uppercase tracking-wider shadow-sm">Purchase Information</span>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Purchase Description</label>
                                    <input type="text" name="PurchDescription" value={formData.PurchDescription} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] bg-white shadow-sm" />
                                </div>
                                <div className="flex items-center gap-6">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Asset is</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="Condition" value="New" checked={formData.Condition === 'New'} onChange={handleInputChange} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                            <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors">New</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="Condition" value="Used" checked={formData.Condition === 'Used'} onChange={handleInputChange} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                            <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Used</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Date</label>
                                        <div className="flex gap-1 items-center">
                                            <input 
                                                type="text" 
                                                value={formData.PurchDate} 
                                                readOnly 
                                                className="min-w-0 flex-1 h-8 border border-gray-300 px-3 text-[12.5px] bg-white rounded-[5px] outline-none font-bold text-gray-700 shadow-sm" 
                                            />
                                            <button 
                                                onClick={() => setShowPurchDateModal(true)} 
                                                className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                            >
                                                <Calendar size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Cost</label>
                                        <input type="number" name="PurchCost" value={formData.PurchCost} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] bg-white text-right font-bold text-blue-600 shadow-sm" step="0.01" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Vendor / Payee</label>
                                    <input type="text" name="Vendor" value={formData.Vendor} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] bg-white shadow-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Sales Information */}
                        <div className="border border-gray-200 rounded-[5px] p-4 relative pt-6 bg-slate-50/30">
                            <span className="absolute -top-3 left-3 bg-white px-2 py-0.5 border border-gray-200 rounded-[5px] text-[10px] font-bold text-[#d13438] uppercase tracking-wider shadow-sm">Sales Information</span>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Sales Description</label>
                                    <input type="text" name="SalesDescription" value={formData.SalesDescription} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] bg-white shadow-sm" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" name="AssetSold" checked={formData.AssetSold === 'Sold'} onChange={handleInputChange} className="w-4 h-4 rounded-[5px] border-gray-300 text-red-600 focus:ring-red-500" />
                                        <span className="text-xs font-bold text-red-600 group-hover:underline uppercase tracking-tight">Asset is Sold</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Sales Date</label>
                                        <div className="flex gap-1 items-center">
                                            <input 
                                                type="text" 
                                                value={formData.SalesDate} 
                                                readOnly 
                                                disabled={formData.AssetSold !== 'Sold'}
                                                className="min-w-0 flex-1 h-8 border border-gray-300 px-3 text-[12.5px] bg-white disabled:bg-gray-100 rounded-[5px] outline-none font-bold text-gray-700 shadow-sm" 
                                            />
                                            <button 
                                                onClick={() => setShowSalesDateModal(true)} 
                                                disabled={formData.AssetSold !== 'Sold'}
                                                className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 disabled:opacity-50 shrink-0"
                                            >
                                                <Calendar size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Sales Price</label>
                                        <input type="number" name="SellingPrice" value={formData.SellingPrice} onChange={handleInputChange} disabled={formData.AssetSold !== 'Sold'} className="w-full h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] bg-white text-right font-bold text-red-600 disabled:bg-gray-100 shadow-sm" step="0.01" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Sales Expense</label>
                                    <input type="number" name="SalesExpense" value={formData.SalesExpense} onChange={handleInputChange} disabled={formData.AssetSold !== 'Sold'} className="w-full h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] bg-white text-right disabled:bg-gray-100 shadow-sm" step="0.01" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Asset Detailed Information */}
                    <div className="border border-gray-200 rounded-[5px] p-4 relative pt-6 bg-blue-50/10 shadow-sm">
                        <span className="absolute -top-3 left-3 bg-white px-3 py-0.5 border border-gray-200 rounded-[5px] text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                             Detailed Info
                        </span>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Asset Full Description</label>
                                <input type="text" name="AssetLongDescription" value={formData.AssetLongDescription} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-[5px] bg-white" placeholder="" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Location / Office</label>
                                    <input type="text" name="Location" value={formData.Location} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-[5px] bg-white" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Registration / Serial No</label>
                                    <input type="text" name="SerialNo" value={formData.SerialNo} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-[5px] bg-white" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Warranty Expires</label>
                                    <div className="flex gap-1 items-center">
                                        <input 
                                            type="text" 
                                            value={formData.WarrantyExpiry} 
                                            readOnly 
                                            className="min-w-0 flex-1 h-8 border border-gray-300 px-3 text-[12.5px] bg-white rounded-[5px] outline-none font-bold text-gray-700 shadow-sm" 
                                        />
                                        <button 
                                            onClick={() => setShowWarrantyExpiryModal(true)} 
                                            className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-90 shrink-0"
                                        >
                                            <Calendar size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Internal Reference Notes</label>
                                <textarea name="Note" value={formData.Note} onChange={handleInputChange} className="w-full h-16 border border-gray-300 p-2 text-sm focus:border-blue-500 outline-none rounded-[5px] resize-none bg-white font-medium" placeholder="" />
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {showSearchModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSearchModal(false)} />
                    <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            {/* System Color Left Accent */}
                            <div 
                                className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                                style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }}
                            />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Asset Registry Lookup</span>
                            </div>
                            <button
                                onClick={() => setShowSearchModal(false)}
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Search Input Area */}
                        <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find by Asset Name or ID..." 
                                className="h-9 border border-gray-300 px-3 text-xs rounded-md w-72 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                            />
                        </div>

                        {/* Results List */}
                        <div className="p-2">
                            <div className=" px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                                <span className="w-32 text-center">Asset ID</span>
                                <span className="flex-1 px-3">Asset Description</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {assetsList.filter(a => (a.assets_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.assets_Code || '').toLowerCase().includes(searchQuery.toLowerCase())).map((asset, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => selectAsset(asset.assets_Code)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-32 text-center font-mono text-[11px] font-bold text-[#0078d4]">
                                                {asset.assets_Code}
                                            </span>
                                            <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">
                                                {asset.assets_Name}
                                            </span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                                    </button>
                                ))}
                                {assetsList.length === 0 && (
                                    <div className="p-8 text-center text-gray-400 italic text-sm">No assets found in registry.</div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{assetsList.length} Result(s) Found</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Account Search Modal */}
            {showAccountSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAccountSearch(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            {/* System Color Left Accent */}
                            <div 
                                className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                                style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }}
                            />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">General Ledger Accounts Lookup</span>
                            </div>
                            <button
                                onClick={() => setShowAccountSearch(false)}
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Search Input Area */}
                        <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find by Account Name or Code..." 
                                className="h-9 border border-gray-300 px-3 text-xs rounded-md w-72 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                                value={accSearchQuery} 
                                onChange={(e) => setAccSearchQuery(e.target.value)} 
                            />
                        </div>

                        {/* Results List */}
                        <div className="p-2">
                            <div className=" px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                                <span className="w-32 text-center">Account Code</span>
                                <span className="flex-1 px-3">Account Description</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {accounts.filter(a => (a.name || '').toLowerCase().includes(accSearchQuery.toLowerCase()) || (a.code || '').toLowerCase().includes(accSearchQuery.toLowerCase())).map((acc, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => handleAccountSelect(acc.code, acc.name)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-32 text-center font-mono text-[11px] font-bold text-[#0078d4]">
                                                {acc.code}
                                            </span>
                                            <span className={`flex-1 px-3 font-mono font-medium text-gray-700 uppercase ${acc.isMain ? 'font-black' : ''}`}>
                                                {acc.name}
                                            </span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                                    </button>
                                ))}
                                {accounts.length === 0 && (
                                    <div className="p-8 text-center text-gray-400 italic text-sm">No accounts found.</div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{accounts.length} Account(s) Available</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Date Modals */}
            <CalendarModal 
                isOpen={showPurchDateModal} 
                onClose={() => setShowPurchDateModal(false)} 
                onSelect={(date) => handleDateSelect('PurchDate', date)} 
                currentDate={formData.PurchDate}
            />
            <CalendarModal 
                isOpen={showSalesDateModal} 
                onClose={() => setShowSalesDateModal(false)} 
                onSelect={(date) => handleDateSelect('SalesDate', date)} 
                currentDate={formData.SalesDate}
            />
            <CalendarModal 
                isOpen={showWarrantyExpiryModal} 
                onClose={() => setShowWarrantyExpiryModal(false)} 
                onSelect={(date) => handleDateSelect('WarrantyExpiry', date)} 
                currentDate={formData.WarrantyExpiry}
            />
        </>
    );
};

export default FixedAssetsBoard;
