import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
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
                    <div className="flex justify-center gap-3 w-full border-t pt-3 mt-2">
                        <button onClick={handleSave} disabled={loading} className="px-8 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border hover:bg-[#005a9e] flex items-center gap-2">
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            {isEditMode ? 'Update' : 'Save'}
                        </button>
                        <button onClick={handleClear} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2">
                            <RotateCcw size={14} /> Clear
                        </button>
                        <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2">
                            <X size={14} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 py-2 font-['Plus_Jakarta_Sans']">
                    {/* Info Header */}
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-sm shadow-sm">
                        <p className="text-[12px] font-bold text-[#0369a1] text-center leading-relaxed italic">
                            Use for property you purchase, track, and may eventually sell. Fixed assets are
                            long-lived assets, such as land, buildings, furniture, equipment, and vehicles.
                        </p>
                    </div>

                    {/* Top Section */}
                    <div className="bg-white p-4 border border-gray-200 rounded-sm space-y-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-extrabold text-gray-700 w-[140px] shrink-0 uppercase">Asset Number / Name</label>
                            <div className="flex flex-1 gap-2">
                                <input type="text" name="AssetsCode" value={formData.AssetsCode} onChange={handleInputChange} readOnly className="w-32 h-8 border border-gray-300 px-2 text-sm bg-gray-50 font-bold text-blue-600 rounded-sm" />
                                <div className="flex-1 flex gap-1">
                                    <input type="text" name="AssetsName" value={formData.AssetsName} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white font-medium" placeholder="Enter asset display name" />
                                    <button onClick={openSearch} className="w-9 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-sm"><Search size={16} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-[12px] font-extrabold text-gray-700 w-[140px] shrink-0 uppercase">Asset Accounts of</label>
                            <select name="AccCode" value={formData.AccCode} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white font-medium">
                                <option value="">&lt; Select Account &gt;</option>
                                {accounts.map((acc, idx) => (
                                    <option key={idx} value={acc.code} disabled={acc.code === '300-100'}>{acc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Middle Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Purchase Information */}
                        <div className="border border-gray-200 rounded-sm p-4 relative pt-6 bg-slate-50/30">
                            <span className="absolute -top-3 left-3 bg-white px-2 py-0.5 border border-gray-200 rounded-full text-[10px] font-black text-[#0078d4] uppercase tracking-wider shadow-sm">Purchase Information</span>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Purchase Description</label>
                                    <input type="text" name="PurchDescription" value={formData.PurchDescription} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white" />
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
                                        <input type="date" name="PurchDate" value={formData.PurchDate} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Cost</label>
                                        <input type="number" name="PurchCost" value={formData.PurchCost} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white text-right font-bold text-blue-600" step="0.01" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Vendor / Payee</label>
                                    <input type="text" name="Vendor" value={formData.Vendor} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white" />
                                </div>
                            </div>
                        </div>

                        {/* Sales Information */}
                        <div className="border border-gray-200 rounded-sm p-4 relative pt-6 bg-slate-50/30">
                            <span className="absolute -top-3 left-3 bg-white px-2 py-0.5 border border-gray-200 rounded-full text-[10px] font-black text-[#d13438] uppercase tracking-wider shadow-sm">Sales Information</span>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Sales Description</label>
                                    <input type="text" name="SalesDescription" value={formData.SalesDescription} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" name="AssetSold" checked={formData.AssetSold === 'Sold'} onChange={handleInputChange} className="w-4 h-4 rounded-sm border-gray-300 text-red-600 focus:ring-red-500" />
                                        <span className="text-xs font-black text-red-600 group-hover:underline">ASSET IS SOLD</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Sales Date</label>
                                        <input type="date" name="SalesDate" value={formData.SalesDate} onChange={handleInputChange} disabled={formData.AssetSold !== 'Sold'} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white disabled:bg-gray-100 opacity-80" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Sales Price</label>
                                        <input type="number" name="SellingPrice" value={formData.SellingPrice} onChange={handleInputChange} disabled={formData.AssetSold !== 'Sold'} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white text-right font-bold text-red-600 disabled:bg-gray-100" step="0.01" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Sales Expense</label>
                                    <input type="number" name="SalesExpense" value={formData.SalesExpense} onChange={handleInputChange} disabled={formData.AssetSold !== 'Sold'} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white text-right disabled:bg-gray-100" step="0.01" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Asset Detailed Information */}
                    <div className="border border-gray-200 rounded-sm p-4 relative pt-6 bg-blue-50/10 shadow-sm">
                        <span className="absolute -top-3 left-3 bg-white px-3 py-0.5 border border-gray-200 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                             Detailed Info
                        </span>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Asset Full Description</label>
                                <input type="text" name="AssetLongDescription" value={formData.AssetLongDescription} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white" placeholder="Add serial numbers, model details, etc." />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Location / Office</label>
                                    <input type="text" name="Location" value={formData.Location} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Registration / Serial No</label>
                                    <input type="text" name="SerialNo" value={formData.SerialNo} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Warranty Expires</label>
                                    <input type="date" name="WarrantyExpiry" value={formData.WarrantyExpiry} onChange={handleInputChange} className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Internal Reference Notes</label>
                                <textarea name="Note" value={formData.Note} onChange={handleInputChange} className="w-full h-16 border border-gray-300 p-2 text-sm focus:border-blue-500 outline-none rounded-sm resize-none bg-white font-medium" placeholder="Add any special notes about this asset..." />
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {showSearchModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSearchModal(false)} />
                    <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh] border border-gray-300 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white select-none">
                            <div className="flex items-center gap-3">
                                <PlusCircle size={20} className="text-[#0078d4]" />
                                <h3 className="font-black text-gray-700 uppercase tracking-tight">Fixed Asset Registry Search</h3>
                            </div>
                            <div className="flex gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input 
                                        type="text" 
                                        placeholder="Search asset..." 
                                        className="h-9 border border-gray-300 pl-9 pr-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none shadow-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-[#d13438] transition-colors"><X size={24} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Plus_Jakarta_Sans']">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-[#f8fafd] border-b text-[11px] font-black text-gray-500 uppercase tracking-widest sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 text-center w-32 border-r">Asset ID</th>
                                        <th className="p-3">Asset Description</th>
                                        <th className="p-3 text-center w-24">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assetsList.filter(a => (a.assets_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.assets_Code || '').toLowerCase().includes(searchQuery.toLowerCase())).map((asset, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b last:border-0 group">
                                            <td className="p-3 text-center font-bold text-blue-600 border-r">{asset.assets_Code}</td>
                                            <td className="p-3 font-semibold text-gray-700 uppercase">{asset.assets_Name}</td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => selectAsset(asset.assets_Code)} className="bg-white border border-[#0078d4] text-[#0078d4] text-[10px] px-3 py-1.5 rounded-sm font-black hover:bg-[#0078d4] hover:text-white transition-all">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {assetsList.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-12 text-center text-gray-400 italic font-medium">No assets found in registry</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-3 bg-gray-50 border-t border-gray-200 text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest leading-none">
                            Found {assetsList.length} Active Asset Registrations
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FixedAssetsBoard;
