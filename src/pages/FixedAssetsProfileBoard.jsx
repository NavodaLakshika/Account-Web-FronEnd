import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, RotateCcw, Save, Calendar } from 'lucide-react';
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

    const handleAccountSelect = (code) => {
        setFormData(prev => ({ ...prev, AccCode: code }));
        setShowAccountSearch(false);
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
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-[3px]">
                        <p className="text-[12px] font-bold text-[#0369a1] text-center">Use for property you purchase, track, and may eventually sell. Fixed assets are long-lived assets, such as land, buildings, furniture, equipment, and vehicles.</p>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-3">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Asset Number</label>
                                <input type="text" name="AssetsCode" value={formData.AssetsCode} readOnly className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-slate-50 outline-none text-gray-700 font-mono" />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Asset Name</label>
                                <input type="text" name="AssetsName" value={formData.AssetsName} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-3 flex items-end">
                                <button onClick={openSearch} className="w-full h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] text-[13px] transition-all flex items-center justify-center gap-2 border-none">
                                    <Search size={16} /> SEARCH
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Account & Condition</span>
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Asset Account</label>
                                <div className="relative">
                                    <input type="text" readOnly value={accounts.find(a => a.code === formData.AccCode)?.name?.trim() || formData.AccCode} onClick={() => setShowAccountSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 cursor-pointer" />
                                    <button onClick={() => setShowAccountSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Condition</label>
                                <div className="flex items-center gap-6 h-10">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="Condition" value="New" checked={formData.Condition === 'New'} onChange={handleInputChange} className="w-4 h-4 text-[#0285fd] border-gray-300 focus:ring-[#0285fd]" />
                                        <span className="text-[13px] text-gray-700">New</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="Condition" value="Used" checked={formData.Condition === 'Used'} onChange={handleInputChange} className="w-4 h-4 text-[#0285fd] border-gray-300 focus:ring-[#0285fd]" />
                                        <span className="text-[13px] text-gray-700">Used</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                            <span className="text-[11px] font-bold text-[#0285fd] uppercase tracking-widest">Purchase Information</span>
                            <div className="space-y-3.5">
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Purchase Description</label>
                                    <input type="text" name="PurchDescription" value={formData.PurchDescription} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date</label>
                                        <div className="relative">
                                            <input type="text" readOnly value={formData.PurchDate} onClick={() => setShowPurchDateModal(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 cursor-pointer" />
                                            <button onClick={() => setShowPurchDateModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                                <Calendar size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost</label>
                                        <input type="number" name="PurchCost" value={formData.PurchCost} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right" step="0.01" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Vendor / Payee</label>
                                    <input type="text" name="Vendor" value={formData.Vendor} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                            <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest">Sales Information</span>
                            <div className="space-y-3.5">
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Sales Description</label>
                                    <input type="text" name="SalesDescription" value={formData.SalesDescription} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="AssetSold" checked={formData.AssetSold === 'Sold'} onChange={handleInputChange} className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500" />
                                        <span className="text-[13px] font-medium text-red-600">Asset is Sold</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Sales Date</label>
                                        <div className="relative">
                                            <input type="text" readOnly value={formData.SalesDate} onClick={() => setShowSalesDateModal(true)} disabled={formData.AssetSold !== 'Sold'} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed" />
                                            <button onClick={() => setShowSalesDateModal(true)} disabled={formData.AssetSold !== 'Sold'} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer disabled:opacity-50">
                                                <Calendar size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Sales Price</label>
                                        <input type="number" name="SellingPrice" value={formData.SellingPrice} onChange={handleInputChange} disabled={formData.AssetSold !== 'Sold'} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right disabled:bg-gray-100" step="0.01" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Sales Expense</label>
                                    <input type="number" name="SalesExpense" value={formData.SalesExpense} onChange={handleInputChange} disabled={formData.AssetSold !== 'Sold'} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right disabled:bg-gray-100" step="0.01" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Detailed Info</span>
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Asset Full Description</label>
                                <input type="text" name="AssetLongDescription" value={formData.AssetLongDescription} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Location / Office</label>
                                <input type="text" name="Location" value={formData.Location} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Registration / Serial No</label>
                                <input type="text" name="SerialNo" value={formData.SerialNo} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Warranty Expires</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.WarrantyExpiry} onClick={() => setShowWarrantyExpiryModal(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 cursor-pointer" />
                                    <button onClick={() => setShowWarrantyExpiryModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Internal Reference Notes</label>
                                <textarea name="Note" value={formData.Note} onChange={handleInputChange} rows={3} className="w-full border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 resize-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Asset Registry Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find by Asset Name or ID..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Asset ID</th><th className=" px-5 py-3">Asset Description</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {assetsList.filter(a => (a.assets_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.assets_Code || '').toLowerCase().includes(searchQuery.toLowerCase())).map((asset, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => selectAsset(asset.assets_Code)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{asset.assets_Code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{asset.assets_Name}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                                {assetsList.length === 0 && (
                                    <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No assets found in registry.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showAccountSearch} onClose={() => setShowAccountSearch(false)} title="Asset Accounts Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find by Account Name or Code..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={accSearchQuery} onChange={(e) => setAccSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Account Code</th><th className=" px-5 py-3">Account Description</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {accounts.filter(a => (a.name || '').toLowerCase().includes(accSearchQuery.toLowerCase()) || (a.code || '').toLowerCase().includes(accSearchQuery.toLowerCase())).map((acc, idx) => (
                                    <tr key={idx} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleAccountSelect(acc.code)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{acc.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{acc.name}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <CalendarModal isOpen={showPurchDateModal} onClose={() => setShowPurchDateModal(false)} onDateSelect={(date) => handleDateSelect('PurchDate', date)} currentDate={formData.PurchDate} />
            <CalendarModal isOpen={showSalesDateModal} onClose={() => setShowSalesDateModal(false)} onDateSelect={(date) => handleDateSelect('SalesDate', date)} currentDate={formData.SalesDate} />
            <CalendarModal isOpen={showWarrantyExpiryModal} onClose={() => setShowWarrantyExpiryModal(false)} onDateSelect={(date) => handleDateSelect('WarrantyExpiry', date)} currentDate={formData.WarrantyExpiry} />
        </>
    );
};

export default FixedAssetsProfileBoard;
