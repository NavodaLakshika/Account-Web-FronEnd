import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import CalendarModal from '../../CalendarModal';
import { Search, RotateCcw, Save, Calendar, Loader2, X, PlusCircle } from 'lucide-react';
import { fixedAssetService } from '../../../services/fixedAsset.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';


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
            showErrorToast('Enter Account Code and Account Name.');
            return;
        }
        if (!formData.AccCode || formData.AccCode === '< Select Account >') {
            showErrorToast('Select Assets Account Name.');
            return;
        }
        if (parseFloat(formData.PurchCost) === 0) {
            showErrorToast('Enter Cost.');
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
            showSuccessToast(isEditMode ? 'Record Updated Successfully' : 'New record Added Successfully');
            handleClear();
        } catch (error) {
            showErrorToast(error);
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
            showErrorToast('Failed to load assets list');
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
            showErrorToast('Failed to load asset details');
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
                title="Fixed Assets"
                maxWidth="max-w-[700px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-4 border-t border-slate-200 mt-1 rounded-b-[5px]">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-8 h-10 text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md bg-[#2bb744] hover:bg-[#259b3a] shadow-green-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            {isEditMode ? 'UPDATE' : 'SAVE'}
                        </button>
                        <button onClick={handleClear} className="px-8 h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                            <RotateCcw size={14} /> CLEAR
                        </button>
                    </div>
                }
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-4">
                    {/* Info Header */}
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-[3px] shadow-sm">
                        <p className="text-[12px] font-bold text-[#0369a1] text-center leading-relaxed ">
                            Use for property you purchase, track, and may eventually sell. Fixed assets are
                            long-lived assets, such as land, buildings, furniture, equipment, and vehicles.
                        </p>
                    </div>

                    {/* Top Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 w-[140px] shrink-0 uppercase tracking-widest">Asset Number / Name</label>
                            <div className="flex flex-1 gap-2">
                                <input type="text" name="AssetsCode" value={formData.AssetsCode} onChange={handleInputChange} readOnly className="w-32 h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 font-bold text-[#0285fd] rounded outline-none text-center cursor-not-allowed shadow-sm flex-none" />
                                <div className="flex-1 flex gap-1 items-center">
                                    <input type="text" name="AssetsName" value={formData.AssetsName} onChange={handleInputChange} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white appearance-none" placeholder=""  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 w-[140px] shrink-0 uppercase tracking-widest">Asset Accounts of</label>
                            <div className="flex-1 flex gap-1 items-center">
                                <input 
                                    type="text" 
                                    value={accounts.find(a => a.code === formData.AccCode)?.name?.trim() || formData.AccCode} 
                                    readOnly 
                                    className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed appearance-none" 
                                 style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                            </div>
                        </div>
                    </div>

                    {/* Middle Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Purchase Information */}
 <div className=" rounded-[3px] p-4 relative pt-6 bg-white shadow-sm">
                            <span className="absolute -top-3 left-3 bg-white px-2 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-[#0285fd] uppercase tracking-widest shadow-sm">Purchase Information</span>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 tracking-widest">Purchase Description</label>
                                    <input type="text" name="PurchDescription" value={formData.PurchDescription} onChange={handleInputChange} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white rounded" />
                                </div>
                                <div className="flex items-center gap-6">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Asset is</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="Condition" value="New" checked={formData.Condition === 'New'} onChange={handleInputChange} className="w-4 h-4 text-[#0285fd] border-slate-200 focus:ring-[#00D1FF]" />
                                            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-widest group-hover:text-[#0285fd] transition-colors">New</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="Condition" value="Used" checked={formData.Condition === 'Used'} onChange={handleInputChange} className="w-4 h-4 text-[#0285fd] border-slate-200 focus:ring-[#00D1FF]" />
                                            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-widest group-hover:text-[#0285fd] transition-colors">Used</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 tracking-widest">Date</label>
                                        <div className="flex gap-1 items-center">
                                            <input 
                                                type="text" 
                                                value={formData.PurchDate} 
                                                readOnly 
                                                className="min-w-0 flex-1 h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed" 
                                            />
                                            <button 
                                                onClick={() => setShowPurchDateModal(true)} 
                                                className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"
                                            >
                                                <Calendar size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 tracking-widest">Cost</label>
                                        <input type="number" name="PurchCost" value={formData.PurchCost} onChange={handleInputChange} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 bg-white text-right text-blue-600 rounded" step="0.01" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 tracking-widest">Vendor / Payee</label>
                                    <input type="text" name="Vendor" value={formData.Vendor} onChange={handleInputChange} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white rounded" />
                                </div>
                            </div>
                        </div>

                        {/* Sales Information */}
 <div className=" rounded-[3px] p-4 relative pt-6 bg-white shadow-sm">
                            <span className="absolute -top-3 left-3 bg-white px-2 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-red-500 uppercase tracking-widest shadow-sm">Sales Information</span>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 tracking-widest">Sales Description</label>
                                    <input type="text" name="SalesDescription" value={formData.SalesDescription} onChange={handleInputChange} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white rounded" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" name="AssetSold" checked={formData.AssetSold === 'Sold'} onChange={handleInputChange} className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-500" />
                                        <span className="text-[11px] font-bold text-red-500 group-hover:underline uppercase tracking-widest">Asset is Sold</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 tracking-widest">Sales Date</label>
                                        <div className="flex gap-1 items-center">
                                            <input 
                                                type="text" 
                                                value={formData.SalesDate} 
                                                readOnly 
                                                disabled={formData.AssetSold !== 'Sold'}
                                                className="min-w-0 flex-1 h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 disabled:bg-gray-100 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed" 
                                            />
                                            <button 
                                                onClick={() => setShowSalesDateModal(true)} 
                                                disabled={formData.AssetSold !== 'Sold'}
                                                className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 disabled:opacity-50 shrink-0 border-none"
                                            >
                                                <Calendar size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 tracking-widest">Sales Price</label>
                                        <input type="number" name="SellingPrice" value={formData.SellingPrice} onChange={handleInputChange} disabled={formData.AssetSold !== 'Sold'} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 bg-white text-right text-red-500 disabled:bg-gray-100 rounded" step="0.01" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 tracking-widest">Sales Expense</label>
                                    <input type="number" name="SalesExpense" value={formData.SalesExpense} onChange={handleInputChange} disabled={formData.AssetSold !== 'Sold'} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 bg-white text-right disabled:bg-gray-100 rounded" step="0.01" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Asset Detailed Information */}
 <div className=" rounded-[3px] p-4 relative pt-6 bg-white shadow-sm">
                        <span className="absolute -top-3 left-3 bg-white px-3 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             Detailed Info
                        </span>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 tracking-widest">Asset Full Description</label>
                                <input type="text" name="AssetLongDescription" value={formData.AssetLongDescription} onChange={handleInputChange} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white rounded" placeholder="" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 tracking-widest">Location / Office</label>
                                    <input type="text" name="Location" value={formData.Location} onChange={handleInputChange} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white rounded" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 tracking-widest">Registration / Serial No</label>
                                    <input type="text" name="SerialNo" value={formData.SerialNo} onChange={handleInputChange} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white rounded" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 tracking-widest">Warranty Expires</label>
                                    <div className="flex gap-1 items-center">
                                        <input 
                                            type="text" 
                                            value={formData.WarrantyExpiry} 
                                            readOnly 
                                            className="min-w-0 flex-1 h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed" 
                                        />
                                        <button 
                                            onClick={() => setShowWarrantyExpiryModal(true)} 
                                            className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"
                                        >
                                            <Calendar size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 tracking-widest">Internal Reference Notes</label>
                                <textarea name="Note" value={formData.Note} onChange={handleInputChange} className="w-full h-16 border border-slate-200 p-2 px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white rounded resize-none" placeholder="" />
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {showSearchModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowSearchModal(false)} />
 <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 select-none relative overflow-hidden">
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
                                className="w-9 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Search Input Area */}
                        <div className="p-3 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find by Asset Name or ID..." 
                                className="h-9 border border-slate-200 px-3 text-xs rounded-[3px] w-72 focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none shadow-sm transition-all" 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                            />
                        </div>

                        {/* Results List */}
                        <div className="border border-gray-200 overflow-hidden bg-white">
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-slate-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-5 py-3">Asset ID</th>
                                            <th className="px-5 py-3">Asset Description</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {assetsList.filter(a => (a.assets_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.assets_Code || '').toLowerCase().includes(searchQuery.toLowerCase())).map((asset, idx) => (
                                            <tr 
                                                key={idx} 
                                                onClick={() => selectAsset(asset.assets_Code)}
                                                className="group hover:bg-blue-50/50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-5 py-3 font-mono text-[13px] text-gray-600">{asset.assets_Code}</td>
                                                <td className="px-5 py-3 text-[13px] font-mono text-gray-600 uppercase font-bold group-hover:text-blue-600 transition-colors">{asset.assets_Name}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[3px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase tracking-widest border-none">SELECT</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {assetsList.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="p-8 text-center text-gray-400 italic text-sm">No assets found in registry.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 h-10 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{assetsList.length} Result(s) Found</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Account Search Modal */}
            {showAccountSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowAccountSearch(false)} />
 <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 select-none relative overflow-hidden">
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
                                className="w-9 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Search Input Area */}
                        <div className="p-3 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find by Account Name or Code..." 
                                className="h-9 border border-slate-200 px-3 text-xs rounded-[3px] w-72 focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none shadow-sm transition-all" 
                                value={accSearchQuery} 
                                onChange={(e) => setAccSearchQuery(e.target.value)} 
                            />
                        </div>

                        {/* Results List */}
                        <div className="border border-gray-200 overflow-hidden bg-white">
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-slate-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-5 py-3">Account Code</th>
                                            <th className="px-5 py-3">Account Description</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {accounts.filter(a => (a.name || '').toLowerCase().includes(accSearchQuery.toLowerCase()) || (a.code || '').toLowerCase().includes(accSearchQuery.toLowerCase())).map((acc, idx) => (
                                            <tr 
                                                key={idx} 
                                                onClick={() => handleAccountSelect(acc.code, acc.name)}
                                                className="group hover:bg-blue-50/50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-5 py-3 font-mono text-[13px] text-gray-600">{acc.code}</td>
                                                <td className="px-5 py-3 text-[13px] font-mono text-gray-600 uppercase font-bold group-hover:text-blue-600 transition-colors">{acc.name}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[3px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase tracking-widest border-none">SELECT</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {accounts.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="p-8 text-center text-gray-400 italic text-sm">No accounts found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 h-10 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{accounts.length} Account(s) Available</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Date Modals */}
            <CalendarModal 
                isOpen={showPurchDateModal} 
                onClose={() => setShowPurchDateModal(false)} 
                onDateSelect={(date) => handleDateSelect('PurchDate', date)} 
                currentDate={formData.PurchDate}
            />
            <CalendarModal 
                isOpen={showSalesDateModal} 
                onClose={() => setShowSalesDateModal(false)} 
                onDateSelect={(date) => handleDateSelect('SalesDate', date)} 
                currentDate={formData.SalesDate}
            />
            <CalendarModal 
                isOpen={showWarrantyExpiryModal} 
                onClose={() => setShowWarrantyExpiryModal(false)} 
                onDateSelect={(date) => handleDateSelect('WarrantyExpiry', date)} 
                currentDate={formData.WarrantyExpiry}
            />
        </>
    );
};

export default FixedAssetsBoard;
