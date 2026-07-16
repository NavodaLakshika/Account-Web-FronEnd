import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Plus, Save, RotateCcw, X, Trash2, Calendar, CheckCircle, Image as ImageIcon, Camera , FileText} from 'lucide-react';

import { productService } from '../services/product.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';


const ItemMasterBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ 
        departments: [], suppliers: [], categories: [], 
        incomeAccounts: [], expenseAccounts: [], units: [],
        businessTypes: [], taxIds: [], vatRates: [] 
    });
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);
    
    // UI State
    const [activeLookup, setActiveLookup] = useState(null); // { title: string, field: string, data: [] }
    const [lookupQuery, setLookupQuery] = useState('');
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [productImage, setProductImage] = useState(null);

    const getInitialFormData = () => ({
        code: '',
        prodName: '',
        unit: '',
        packSize: 1,
        purchasePrice: 0,
        sellingPrice: 0,
        supplierCode: '',
        deptCode: '',
        categoryCode: '',
        brandName: '',
        discPrice: 0,
        businessType: '',
        expenseAccount: '',
        incomeAccount: '',
        taxId: '',
        vatRate: '',
        minusAllow: false,
        underCostAllow: false,
        isInactive: false,
        availableStock: 0,
        createUser: '',
        createDate: new Date().toISOString().split('T')[0],
        modifiedUser: '',
        modifiedDate: new Date().toISOString().split('T')[0],
        lastPurchQty: 0,
        discount: 0,
        companyCode: ''
    });

    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode, userName: initUser } = getSessionData();

            setFormData(prev => ({ ...prev, companyCode, createUser: initUser, modifiedUser: initUser }));
            fetchLookups(companyCode);
        }
    }, [isOpen]);

    const fetchLookups = async (company) => {
        try {
            const data = await productService.getLookups(company);
            setLookups(data);
        } catch (error) {
            showErrorToast('Failed to load lookup data.');
        }
    };

    const generateNextId = async (deptCode) => {
        try {
            const data = await productService.getNextId(deptCode);
            setFormData(prev => ({ ...prev, code: data.code }));
        } catch (error) {
            console.error('Error generating ID:', error);
        }
    };

    const fetchStockInfo = async (code) => {
        try {
            const [stockData, lastPurchData] = await Promise.all([
                productService.getStock(code, formData.companyCode),
                productService.getLastPurchQty(code)
            ]);
            setFormData(prev => ({ 
                ...prev, 
                availableStock: stockData.qty || 0,
                lastPurchQty: lastPurchData.qty || 0
            }));
        } catch (error) {
            console.error('Error fetching stock info:', error);
        }
    };

    const handleInput = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSave = async () => {
        if (!formData.code) return showErrorToast('Please enter Item ID.');
        if (!formData.prodName) return showErrorToast('Please enter Product Name.');
        if (!formData.deptCode) return showErrorToast('Please select Department.');

        setIsSaving(true);
        try {
            const payload = {
                Code: formData.code,
                Prod_Name: formData.prodName,
                Unit: formData.unit,
                Pack_Size: formData.packSize,
                Purchase_price: parseFloat(formData.purchasePrice) || 0,
                Selling_Price: parseFloat(formData.sellingPrice) || 0,
                Supplier_Code: formData.supplierCode,
                Dept_Code: formData.deptCode,
                Category_Code: formData.categoryCode,
                Brand_Name: formData.brandName,
                Disc_Price: parseFloat(formData.discPrice) || 0,
                Business_Type: formData.businessType,
                Expense_Account: formData.expenseAccount,
                Income_Account: formData.incomeAccount,
                Tax_ID: formData.taxId,
                Vat_Rate: formData.vatRate,
                Minus_Allow: formData.minusAllow,
                Under_Cost_Allow: formData.underCostAllow,
                Is_Inactive: formData.isInactive,
                Available_Stock: formData.availableStock,
                Last_Purch_Qty: formData.lastPurchQty,
                Discount: parseFloat(formData.discount) || 0,
                Company_Code: formData.companyCode,
                ImageSv: productImage || ''
            };
            await productService.save(payload);
            showSuccessToast('Product saved successfully.');
        } catch (error) {
            showErrorToast('Error saving product.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!formData.code) return;
        if (!window.confirm(`Are you sure you want to delete ${formData.code}?`)) return;

        try {
            await productService.delete(formData.code, formData.companyCode);
            showSuccessToast('Product deleted successfully');
            handleClear();
        } catch (error) {
            showErrorToast('Failed to delete product');
        }
    };

    const handleClear = () => {
        setFormData({ ...getInitialFormData(), companyCode: formData.companyCode, createUser: formData.createUser });
        setProductImage(null);
    };

    const handleMainSearch = async () => {
        try {
            const results = await productService.search(formData.companyCode, searchQuery);
            setSearchResults(results || []);
            setShowSearchModal(true);
        } catch (error) { showErrorToast('Search failed.'); }
    };

    const handleSelectResult = async (selectedItem) => {
        try {
            const data = await productService.get(selectedItem.code, formData.companyCode);
            setFormData({
                ...formData,
                code: data.code,
                prodName: data.prod_Name || '',
                unit: data.unit || '',
                packSize: data.pack_Size || 1,
                purchasePrice: data.purchase_price ?? 0,
                sellingPrice: data.selling_Price ?? data.selling_price ?? 0,
                supplierCode: data.supplier_Code || '',
                deptCode: data.dept_Code || '',
                categoryCode: data.category_Code || '',
                brandName: data.brand_Name || '',
                discPrice: data.disc_Price || 0,
                businessType: data.business_Type || '',
                expenseAccount: data.expense_Acc || '',
                incomeAccount: data.income_Acc || '',
                taxId: data.tax_Id || '',
                vatRate: data.vat_Id || '',
                minusAllow: data.minus_Allow === "T" || data.minus_Allow === 1,
                underCostAllow: data.under_Cost_Allow === "T" || data.under_Cost_Allow === 1,
                isInactive: data.locked === 1,
                createUser: data.create_User || 'SYSTEM',
                createDate: data.create_Date || formData.createDate,
                modifiedUser: data.modified_User || 'SYSTEM',
                modifiedDate: data.modified_Date || formData.modifiedDate,
                discount: data.discount || 0
            });
            setProductImage(data.imageSv ? 'data:image/jpeg;base64,' + data.imageSv : null);
            fetchStockInfo(data.code);
            setShowSearchModal(false);
        } catch (error) { showErrorToast('Failed to load record.'); }
    };

    const handleInputPick = (field, item) => {
        setFormData(prev => ({ ...prev, [field]: item.code }));
        
        if (field === 'deptCode' && !formData.code) {
            generateNextId(item.code);
        }
        
        setActiveLookup(null);
        setLookupQuery('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const max_size = 500;

                    if (width > height) {
                        if (width > max_size) {
                            height *= max_size / width;
                            width = max_size;
                        }
                    } else {
                        if (height > max_size) {
                            width *= max_size / height;
                            height = max_size;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
                    setProductImage(compressedBase64);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Transaction Management" icon={FileText} isOpen={isOpen} onClose={onClose} title="Item Master" maxWidth="max-w-[700px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button onClick={handleDelete} className="px-6 h-10 bg-white text-[#ff3b30] border-2 border-[#ff3b30] hover:bg-red-50 text-sm font-black rounded-[3px] shadow-md shadow-red-100 hover:bg-[#e03127] transition-all active:scale-95 flex items-center gap-2 border-none"><Trash2 size={14} /> DELETE ITEM</button>
                            <button onClick={handleClear} className="px-6 h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 text-sm font-black rounded-[3px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none"><RotateCcw size={14} /> CLEAR FORM</button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={isSaving} className="px-10 h-10 bg-white text-[#2bb744] border-2 border-[#2bb744] hover:bg-green-50 text-sm font-black rounded-[3px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">{isSaving ? 'SAVING...' : <><Save size={14} /> SAVE RECORD</>}</button>
                        </div>
                    </div>
                }
            >
                <div className="flex gap-6 font-['Tahoma']">
                    <div className="flex-1 bg-white p-5 border border-gray-200 rounded-[3px] shadow-sm space-y-4">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            <div className="flex items-center gap-2 col-span-2">
                                <label className="text-[12.5px] font-bold text-gray-700 w-28 shrink-0">Item ID & Title</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input name="code" value={formData.code} onChange={handleInput} className="w-[138px] min-w-0 h-8 border border-gray-300 rounded-[3px] px-3 font-mono text-[12px] font-black text-[#0285fd] bg-blue-50/20 outline-none shadow-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] appearance-none" placeholder="ID"  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                    <input name="prodName" value={formData.prodName} onChange={handleInput} className="flex ml-7 w-[300px] min-w-0 h-8 border border-gray-300 rounded-[3px] px-3 font-mono text-[12px] font-bold text-gray-800 outline-none shadow-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" placeholder="Enter Product Name..." />
                             </div>
                            </div>
                            <ModalField label="Category Group" value={formData.categoryCode} displayValue={lookups.categories.find(c => c.code === formData.categoryCode)?.name} onClick={() => setActiveLookup({ title: 'Select Category', field: 'categoryCode', data: lookups.categories })}  />
                            
                            <ModalField label="Department" value={formData.deptCode} displayValue={lookups.departments.find(d => d.code === formData.deptCode)?.name} onClick={() => setActiveLookup({ title: 'Select Department', field: 'deptCode', data: lookups.departments })} />
                            <InputField label="Brand" name="brandName" value={formData.brandName} onChange={handleInput} />

                            <ModalField label="Supplier" value={formData.supplierCode} displayValue={lookups.suppliers.find(s => s.code === formData.supplierCode)?.name} onClick={() => setActiveLookup({ title: 'Select Supplier', field: 'supplierCode', data: lookups.suppliers })} />
                            <InputField label="Selling Price" name="sellingPrice" value={formData.sellingPrice} onChange={handleInput} alignment="text-right" />

                            <InputField label="Purchase Price" name="purchasePrice" value={formData.purchasePrice} onChange={handleInput} alignment="text-right" />
                            <InputField label="Discount (%)" name="discount" value={formData.discount} onChange={handleInput} alignment="text-right" />

                            <InputField label="Disc. Price" name="discPrice" value={formData.discPrice} onChange={handleInput} alignment="text-right" />
                            <InputField label="Pack Size" name="packSize" value={formData.packSize} onChange={handleInput} alignment="text-right" />

                            <ModalField label="Unit of Measure" value={formData.unit} displayValue={lookups.units.find(u => u.code === formData.unit)?.name} onClick={() => setActiveLookup({ title: 'Select Unit', field: 'unit', data: lookups.units })} />
                            <ModalField label="Tax ID" value={formData.taxId} displayValue={lookups.taxIds.find(t => t.code === formData.taxId)?.name} onClick={() => setActiveLookup({ title: 'Select Tax ID', field: 'taxId', data: lookups.taxIds })} />

                            <ModalField label="Business Type" value={formData.businessType} displayValue={lookups.businessTypes.find(b => b.name === formData.businessType || b.code === formData.businessType)?.name} onClick={() => setActiveLookup({ title: 'Select Business Type', field: 'businessType', data: lookups.businessTypes })} />
                            <ModalField label="Vat Rate" value={formData.vatRate} displayValue={lookups.vatRates.find(v => v.code === formData.vatRate)?.name} onClick={() => setActiveLookup({ title: 'Select Vat Rate', field: 'vatRate', data: lookups.vatRates })} />

                            <ModalField label="Expense Account" value={formData.expenseAccount} displayValue={lookups.expenseAccounts.find(a => a.code === formData.expenseAccount)?.name} onClick={() => setActiveLookup({ title: 'Select Expense Account', field: 'expenseAccount', data: lookups.expenseAccounts })} />
                            <ModalField label="Income Account" value={formData.incomeAccount} displayValue={lookups.incomeAccounts.find(a => a.code === formData.incomeAccount)?.name} onClick={() => setActiveLookup({ title: 'Select Income Account', field: 'incomeAccount', data: lookups.incomeAccounts })} />

                            <div className="flex items-center gap-6 mt-1.5 pl-32 col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" name="underCostAllow" checked={formData.underCostAllow} onChange={handleInput} className="w-4 h-4 text-[#0285fd] rounded border-gray-300 focus:ring-[#0285fd]" />
                                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">ALLOW UNDERCOST</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" name="minusAllow" checked={formData.minusAllow} onChange={handleInput} className="w-4 h-4 text-[#0285fd] rounded border-gray-300 focus:ring-[#0285fd]" />
                                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">MINUS ALLOWED</span>
                                </label>
                            </div>
                            
                            <div className="col-span-2 my-2 border-t border-gray-200" />
                            
                            <InputField label="Last Purch Qty" value={formData.lastPurchQty} readOnly alignment="text-right" />

                            <InputField label="Available Stock" value={formData.availableStock} readOnly alignment="text-right" />
                            <InputField label="Modified User/Date" value={`${formData.modifiedUser} / ${formData.modifiedDate}`} readOnly />

                            <InputField label="Create User/Date" value={`${formData.createUser} / ${formData.createDate}`} readOnly />
                            <div className="flex items-center gap-6 mt-1.5 pl-32 col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" name="isInactive" checked={formData.isInactive} onChange={handleInput} className="w-4 h-4 text-red-500 rounded border-red-300 focus:ring-red-500" />
                                    <span className="text-[11px] font-black text-red-500 uppercase tracking-widest">DEACTIVATE ITEM</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="w-[300px] flex flex-col gap-4">
                        <div className="w-full aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-[3px] flex flex-col items-center justify-center text-gray-400 overflow-hidden relative group">
                            {productImage ? <img src={productImage} alt="Product" className="w-full h-full object-cover" /> : <><ImageIcon size={48} strokeWidth={1} /><span className="text-xs mt-2 uppercase font-bold tracking-wider text-center">No Product Image</span></>}
                            <div className="absolute inset-0 bg-slate-200/50 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform shadow-lg"><Camera size={20}/></button>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                        <div className="bg-slate-50 p-4 rounded-[3px] border border-slate-200">
                            <h4 className="text-[11px] font-bold text-slate-800 uppercase mb-2">Live Statistics</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[11px]"><span className="text-slate-600 font-medium">Margin</span><span className="font-bold text-blue-600">{(( (formData.sellingPrice - formData.purchasePrice) / (formData.sellingPrice || 1) ) * 100).toFixed(2)}%</span></div>
                                <div className="h-1 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${Math.min(100, Math.max(0, ((formData.sellingPrice - formData.purchasePrice) / (formData.sellingPrice || 1)) * 100))}%` }}></div></div>
                            </div>
                        </div>
                    </div>
                </div>

                {activeLookup && (
                    <SimpleModal isOpen={!!activeLookup} onClose={() => setActiveLookup(null)} title={`${activeLookup.title} Directory`} maxWidth="max-w-[700px]">
                        <div className="space-y-4 font-['Tahoma']">
                            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-[3px] border border-gray-200 mb-2">
                                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Directory Search</span>
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                    <input type="text" autoFocus placeholder="Filter records..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={lookupQuery} onChange={(e) => setLookupQuery(e.target.value)} />
                                </div>
                            </div>
                            <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                                <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                            <tr>
                                                <th className=" px-5 py-3">Reference Code</th>
                                                <th className=" px-5 py-3">Detailed Description</th>
                                                <th className="text-right px-5 py-3">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {activeLookup.data.filter(item => 
                                                item.name?.toLowerCase().includes(lookupQuery.toLowerCase()) || 
                                                item.code?.toLowerCase().includes(lookupQuery.toLowerCase())
                                            ).map((item, idx) => (
                                                <tr key={idx} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleInputPick(activeLookup.field, item)}>
                                                    <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{item.code}</td>
                                                    <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{item.name}</td>
                                                    <td className="text-right px-5 py-3">
                                                        <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {activeLookup.data.filter(item => 
                                                item.name?.toLowerCase().includes(lookupQuery.toLowerCase()) || 
                                                item.code?.toLowerCase().includes(lookupQuery.toLowerCase())
                                            ).length === 0 && <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No matching records found</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </SimpleModal>
                )}

                {showSearchModal && (
                    <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Global Reference Database" maxWidth="max-w-[700px]">
                        <div className="space-y-4 font-['Tahoma']">
                            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-[3px] border border-gray-200 mb-2">
                                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Master Search</span>
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                    <input type="text" autoFocus placeholder="Enter item code, name, or properties..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleMainSearch()} />
                                </div>
                                <button onClick={handleMainSearch} className="px-8 h-9 bg-[#0285fd] text-slate-800 dark:text-white rounded-[3px] font-black hover:bg-[#0073ff] transition-all active:scale-95 shadow-md text-xs tracking-widest uppercase">Perform Query</button>
                            </div>
                            <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                                <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                                            <tr>
                                                <th className=" px-5 py-3">Item Code</th>
                                                <th className=" px-5 py-3">Technical Title</th>
                                                <th className="text-right px-5 py-3">Standard M.R.P</th>
                                                <th className="text-right px-5 py-3">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {searchResults.map((item, idx) => (
                                                <tr key={idx} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleSelectResult(item)}>
                                                    <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{item.code}</td>
                                                    <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{item.prod_Name}</td>
                                                    <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">Rs. {(item.selling_Price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="text-right px-5 py-3">
                                                        <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">RETRIEVE ITEM</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {searchResults.length === 0 && <tr className="h-32"><td colSpan="4" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">{searchQuery ? `No records found matching "${searchQuery}"` : "Initialize a query to view results"}</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </SimpleModal>
                )}
            </TransactionFormWrapper>
        </>
    );
};

// --- SUBSIDIARY COMPONENTS ---

const InputField = ({ label, name, value, onChange, type = "text", readOnly = false, alignment = "text-left" }) => {
    // Standardise value to prevent uncontrolled input conversion
    const displayValue = value === null || value === undefined ? '' : value;
    
    return (
        <div className="flex items-center gap-2">
            <label className="text-[12.5px] font-bold text-gray-700 w-28 shrink-0 tracking-tight">{label}</label>
            <input 
                name={name} 
                type={type} 
                value={displayValue} 
                onChange={onChange} 
                readOnly={readOnly}
                autoComplete="off"
                spellCheck="false"
                className={`flex-1 min-w-0 h-8 border ${readOnly ? 'border-transparent bg-transparent text-gray-500' : 'border-gray-300 bg-white text-gray-700 focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] hover:border-gray-400 shadow-sm'} font-mono font-bold rounded-[3px] px-3 text-[12px] ${alignment} outline-none transition-colors`} 
            />
        </div>
    );
};

const ModalField = ({ label, value, placeholder, onClick, displayValue }) => (
    <div className="flex items-center gap-2">
        <label className="text-[12.5px] font-bold text-gray-700 w-28 shrink-0 tracking-tight">{label}</label>
        <div className="flex-1 flex gap-1 h-8 min-w-0 overflow-hidden">
            <input 
                type="text" 
                readOnly 
                value={displayValue || value || placeholder || ''} 
                className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-mono font-bold text-gray-600 bg-gray-50 rounded-[3px] outline-none shadow-sm cursor-pointer hover:border-gray-400 transition-colors truncate appearance-none" 
                onClick={onClick} 
             style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
        </div>
    </div>
);

export default ItemMasterBoard;




