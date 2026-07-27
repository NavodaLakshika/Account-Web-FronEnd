import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, RotateCcw, Save, Calendar, X } from 'lucide-react';
import { fixedAssetService } from '../services/fixedAsset.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const FixedAssetsProfileBoard = ({ isOpen, onClose }) => {
    const initialState = {
        AssetsCode: '', AssetsName: '', AccCode: '', Company: '', PurchDescription: '',
        Condition: 'New', PurchDate: new Date().toISOString().split('T')[0], PurchCost: '0.00',
        Vendor: '', AssetSold: '', SalesDescription: '', SalesDate: new Date().toISOString().split('T')[0],
        SellingPrice: '0.00', SalesExpense: '0.00', AssetLongDescription: '', Location: '', SerialNo: '',
        WarrantyExpiry: new Date().toISOString().split('T')[0], Note: '', CurrentUser: 'SYSTEM'
    };

    const [formData, setFormData] = useState(initialState);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [assetsList, setAssetsList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPurchDateModal, setShowPurchDateModal] = useState(false);
    const [showSalesDateModal, setShowSalesDateModal] = useState(false);
    const [showWarrantyExpiryModal, setShowWarrantyExpiryModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const companyData = localStorage.getItem('selectedCompany');
            const user = JSON.parse(localStorage.getItem('user'));
            let companyCode = 'C001';
            if (companyData) {
                try { const parsed = JSON.parse(companyData); companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData; } catch (e) { companyCode = companyData; }
            }
            setFormData(prev => ({ ...prev, Company: companyCode, CurrentUser: user?.emp_Name || user?.empName || 'SYSTEM' }));
            fetchLookups();
            fetchNextCode(companyCode);
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await fixedAssetService.getLookups();
            const formatted = [];
            let lastCode = '';
            data.forEach(item => {
                if (item.sub_Code !== lastCode) {
                    formatted.push({ code: item.sub_Code, name: item.sub_Acc_Name, isMain: true });
                    lastCode = item.sub_Code;
                }
                if (item.sub_Cust_Acc_Code) {
                    formatted.push({ code: item.sub_Cust_Acc_Code, name: `      ${item.sub_Cust_Acc_Name}`, isMain: false });
                }
            });
            setAccounts(formatted);
        } catch (error) { console.error('Lookup error:', error); }
    };

    const fetchNextCode = async (company) => {
        try { const code = await fixedAssetService.getNextCode(company); setFormData(prev => ({ ...prev, AssetsCode: code })); } catch (error) {}
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 'Sold' : '') : value }));
    };

    const handleClear = () => {
        setFormData({ ...initialState, Company: formData.Company, CurrentUser: formData.CurrentUser });
        setIsEditMode(false);
        fetchNextCode(formData.Company);
    };

    const handleDateSelect = (field, date) => {
        setFormData(prev => ({ ...prev, [field]: date }));
    };

    const handleSave = async () => {
        if (!formData.AssetsCode || !formData.AssetsName) { showErrorToast('Enter Account Code and Account Name.'); return; }
        if (!formData.AccCode) { showErrorToast('Select Assets Account Name.'); return; }
        if (parseFloat(formData.PurchCost) === 0) { showErrorToast('Enter Cost.'); return; }
        setLoading(true);
        try {
            await fixedAssetService.save({ ...formData, PurchCost: parseFloat(formData.PurchCost), SellingPrice: parseFloat(formData.SellingPrice), SalesExpense: parseFloat(formData.SalesExpense) });
            showSuccessToast(isEditMode ? 'Record Updated Successfully' : 'New record Added Successfully');
            handleClear();
        } catch (error) { showErrorToast(error); } finally { setLoading(false); }
    };

    const openSearch = async () => {
        setLoading(true);
        try { const data = await fixedAssetService.search(formData.Company); setAssetsList(data); setShowSearchModal(true); } catch (err) { showErrorToast('Failed to load assets list'); } finally { setLoading(false); }
    };

    const selectAsset = async (code) => {
        setLoading(true);
        try {
            const data = await fixedAssetService.getByCode(code, formData.Company);
            const convertDate = (dateStr) => {
                if (!dateStr) return new Date().toISOString().split('T')[0];
                if (dateStr.includes('/')) { const [d, m, y] = dateStr.split('/'); return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; }
                return dateStr.split(' ')[0];
            };
            setFormData({
                AssetsCode: data.assets_Code || data.Assets_Code, AssetsName: data.assets_Name || data.Assets_Name,
                AccCode: data.acc_Code || data.Acc_Code, Company: data.company || data.Company,
                PurchDescription: data.purch_Name || data.Purch_Name, Condition: data.cond_Type || data.Cond_Type,
                PurchDate: convertDate(data.purch_Date || data.Purch_Date), PurchCost: data.purch_Price || data.Purch_Price,
                Vendor: data.payee || data.Payee, AssetSold: data.ass_Sold || data.Ass_Sold,
                SalesDescription: data.sales_Name || data.Sales_Name, SalesDate: convertDate(data.sales_Date || data.Sales_Date),
                SellingPrice: data.selling_Price || data.Selling_Price, SalesExpense: data.sales_Expence || data.Sales_Expence,
                AssetLongDescription: data.assets_Description || data.Assets_Description, Location: data.location || data.Location,
                SerialNo: data.serial_No || data.Serial_No, WarrantyExpiry: convertDate(data.warranty_Exp || data.Warranty_Exp),
                Note: data.referance || data.Referance, CurrentUser: formData.CurrentUser
            });
            setIsEditMode(true);
            setShowSearchModal(false);
        } catch (error) { showErrorToast('Failed to load asset details'); } finally { setLoading(false); }
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Register and manage fixed assets" icon={null}
                isOpen={isOpen} onClose={onClose} title="Fixed Assets"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <Save size={14} /> {isEditMode ? 'UPDATE' : 'SAVE'}
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-4 overflow-y-auto no-scrollbar">
                    {/* Info Header */}
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-[3px] shadow-sm">
                        <p className="text-[12px] font-bold text-[#0369a1] text-center leading-relaxed">
                            Use for property you purchase, track, and may eventually sell. Fixed assets are
                            long-lived assets, such as land, buildings, furniture, equipment, and vehicles.
                        </p>
                    </div>

                    {/* Top Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4 shadow-sm">
                        <div className="flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 w-[140px] shrink-0 uppercase tracking-widest">Asset Number / Name</label>
                            <div className="flex flex-1 gap-2">
                                <input type="text" name="AssetsCode" value={formData.AssetsCode} onChange={handleInputChange} readOnly className="w-32 h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 font-bold text-[#0285fd] rounded outline-none text-center cursor-not-allowed shadow-sm flex-none" />
                                <div className="flex-1 flex gap-1 items-center">
                                    <input type="text" name="AssetsName" value={formData.AssetsName} onChange={handleInputChange} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white" placeholder="" />
                                </div>
                                <button onClick={openSearch} className="h-8 px-4 bg-[#0285fd] hover:bg-[#0073ff] text-white font-bold rounded shadow-sm text-[11px] transition-all flex items-center justify-center gap-2 border-none active:scale-95 uppercase tracking-widest shrink-0">
                                    <Search size={14} /> SEARCH
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-[11px] font-bold text-gray-500 w-[140px] shrink-0 uppercase tracking-widest">Asset Accounts of</label>
                            <div className="flex-1">
                                <select
                                    value={formData.AccCode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, AccCode: e.target.value }))}
                                    className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 bg-white rounded text-gray-700 cursor-pointer"
                                >
                                    <option value="">Select account...</option>
                                    {accounts.map((acc, idx) => (
                                        <option key={idx} value={acc.code}>{acc.code} - {acc.name.trim()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Middle Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Purchase Information */}
                        <div className="border border-slate-200 rounded-[3px] p-4 relative pt-6 bg-white shadow-sm">
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
                        <div className="border border-slate-200 rounded-[3px] p-4 relative pt-6 bg-white shadow-sm">
                            <span className="absolute -top-3 left-3 bg-white px-2 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-red-500 uppercase tracking-widest shadow-sm">Sales Information</span>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1 tracking-widest">Sales Description</label>
                                    <input type="text" name="SalesDescription" value={formData.SalesDescription} onChange={handleInputChange} className="w-full h-8 border border-slate-200 px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-gray-700 bg-white rounded" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group h-[22px]">
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
                    <div className="border border-slate-200 rounded-[3px] p-4 relative pt-6 bg-white shadow-sm mb-4">
                        <span className="absolute -top-3 left-3 bg-white px-3 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 shadow-sm">
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
            </TransactionFormWrapper>

            {showSearchModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowSearchModal(false)} />
                    <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 select-none relative overflow-hidden">
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-bold text-slate-900 uppercase tracking-[3px] truncate">Asset Registry Lookup</span>
                            </div>
                            <button onClick={() => setShowSearchModal(false)} className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded transition-all"><X size={20} /></button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search</span>
                            <input type="text" placeholder="Find by Asset Name or ID..." className="h-9 border border-slate-200 px-3 text-xs rounded w-72 focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 sticky top-0 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <tr><th className="px-5 py-3">Asset ID</th><th className="px-5 py-3">Asset Description</th><th className="px-5 py-3 text-right">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {assetsList.filter(a => (a.assets_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.assets_Code || '').toLowerCase().includes(searchQuery.toLowerCase())).map((asset, idx) => (
                                        <tr key={idx} onClick={() => selectAsset(asset.assets_Code)} className="hover:bg-blue-50/50 cursor-pointer">
                                            <td className="px-5 py-3 text-[12px] font-bold text-blue-600">{asset.assets_Code}</td>
                                            <td className="px-5 py-3 text-[12px] font-bold text-slate-700 uppercase">{asset.assets_Name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded font-bold hover:bg-[#cb9b34]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {assetsList.length === 0 && (
                                        <tr><td colSpan="3" className="p-8 text-center text-gray-400 italic text-sm">No assets found in registry.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-gray-50 px-4 h-10 border-t border-gray-200 flex items-center text-[10px] text-gray-400">
                            <span>{assetsList.length} Result(s) Found</span>
                        </div>
                    </div>
                </div>
            )}

            <CalendarModal isOpen={showPurchDateModal} onClose={() => setShowPurchDateModal(false)} onDateSelect={(date) => handleDateSelect('PurchDate', date)} currentDate={formData.PurchDate} />
            <CalendarModal isOpen={showSalesDateModal} onClose={() => setShowSalesDateModal(false)} onDateSelect={(date) => handleDateSelect('SalesDate', date)} currentDate={formData.SalesDate} />
            <CalendarModal isOpen={showWarrantyExpiryModal} onClose={() => setShowWarrantyExpiryModal(false)} onDateSelect={(date) => handleDateSelect('WarrantyExpiry', date)} currentDate={formData.WarrantyExpiry} />
        </>
    );
};

export default FixedAssetsProfileBoard;
