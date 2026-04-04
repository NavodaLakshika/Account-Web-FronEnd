import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Plus, Save, RotateCcw, X, Trash2, Calendar, CheckCircle, Image as ImageIcon, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productService } from '../services/product.service';

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

    const initialFormData = {
        code: '',
        prodName: '',
        unit: 'NOS',
        packSize: 1,
        purchasePrice: 0,
        sellingPrice: 0,
        supplierCode: '',
        deptCode: '',
        categoryCode: '',
        brandName: '',
        discPrice: 0,
        businessType: 'Product',
        expenseAccount: '',
        incomeAccount: '',
        taxId: '',
        vatRate: '',
        minusAllow: false,
        underCostAllow: false,
        isInactive: false,
        availableStock: 0,
        createUser: 'SYSTEM',
        createDate: new Date().toISOString().split('T')[0],
        modifiedUser: 'SYSTEM',
        modifiedDate: new Date().toISOString().split('T')[0],
        lastPurchQty: 0,
        discount: 0,
        companyCode: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isOpen) {
            const companyData = localStorage.getItem('selectedCompany');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let companyCode = 'C001';
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) { companyCode = companyData; }
            }

            const initUser = user?.emp_Name || user?.empName || 'SYSTEM';
            setFormData(prev => ({ ...prev, companyCode, createUser: initUser, modifiedUser: initUser }));
            fetchLookups(companyCode);
        }
    }, [isOpen]);

    const fetchLookups = async (company) => {
        try {
            const data = await productService.getLookups(company);
            setLookups(data);
        } catch (error) {
            toast.error('Failed to load lookup data.');
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
        if (!formData.code) return toast.error('Please enter Item ID.');
        if (!formData.prodName) return toast.error('Please enter Product Name.');
        if (!formData.deptCode) return toast.error('Please select Department.');

        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                purchase_price: parseFloat(formData.purchasePrice) || 0,
                selling_price: parseFloat(formData.sellingPrice) || 0,
                disc_Price: parseFloat(formData.discPrice) || 0,
                discount: parseFloat(formData.discount) || 0,
            };
            await productService.save(payload);
            toast.success('Product saved successfully.');
        } catch (error) {
            toast.error('Error saving product.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!formData.code) return;
        if (!window.confirm(`Are you sure you want to delete ${formData.code}?`)) return;

        try {
            await productService.delete(formData.code, formData.companyCode);
            toast.success('Product deleted successfully');
            handleClear();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleClear = () => {
        setFormData({ ...initialFormData, companyCode: formData.companyCode, createUser: formData.createUser });
        setProductImage(null);
    };

    const handleMainSearch = async () => {
        try {
            const results = await productService.search(formData.companyCode, searchQuery);
            setSearchResults(results || []);
            setShowSearchModal(true);
        } catch (error) { toast.error('Search failed.'); }
    };

    const handleSelectResult = async (item) => {
        try {
            const data = await productService.get(item.code, formData.companyCode);
            setFormData({
                ...formData,
                code: data.code,
                prodName: data.prod_Name || '',
                unit: data.unit || 'NOS',
                packSize: data.pack_Size || 1,
                purchasePrice: data.purchase_price || 0,
                sellingPrice: data.selling_price || 0,
                supplierCode: data.supplier_Code || '',
                deptCode: data.dept_Code || '',
                categoryCode: data.category_Code || '',
                brandName: data.brand_Name || '',
                discPrice: data.disc_Price || 0,
                businessType: data.business_Type || 'Product',
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
            fetchStockInfo(data.code);
            setShowSearchModal(false);
        } catch (error) { toast.error('Failed to load record.'); }
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
            reader.onloadend = () => setProductImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const ModalField = ({ label, value, onClick, placeholder, displayValue }) => (
        <div className="flex items-center gap-3">
            <label className="text-[12px] font-bold text-gray-600 w-32 shrink-0">{label}</label>
            <div className="flex-1 flex gap-1">
                <input type="text" readOnly value={displayValue || value} className="flex-1 h-8 bg-gray-50 border border-gray-200 rounded-sm px-2 text-[12px] text-gray-700 font-bold outline-none" placeholder={placeholder} />
                <button onClick={onClick} className="h-8 w-8 bg-slate-100 text-[#0078d4] hover:bg-slate-200 flex items-center justify-center rounded-sm transition-colors border border-gray-200"><Search size={14}/></button>
            </div>
        </div>
    );

    const InputField = ({ label, name, value, onChange, type = "text", readOnly = false, alignment = "text-left" }) => (
        <div className="flex items-center gap-3">
            <label className="text-[12px] font-bold text-gray-600 w-32 shrink-0">{label}</label>
            <input name={name} type={type} value={value} onChange={onChange} readOnly={readOnly}
                className={`flex-1 h-8 border ${readOnly ? 'bg-gray-50 border-gray-200' : 'border-gray-300'} rounded-sm px-2 text-[12px] ${alignment} font-bold text-gray-700 outline-none focus:border-[#0078d4]`} 
            />
        </div>
    );

    return (
        <>
            <SimpleModal isOpen={isOpen} onClose={onClose} title="Item Master File" maxWidth="max-w-[1000px]"
                footer={
                    <>
                        <div className="flex-1 flex gap-2">
                            <button onClick={handleDelete} className="px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-md hover:bg-red-100 uppercase flex items-center gap-2 border border-red-100"><Trash2 size={14} /> Delete</button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleClear} className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-md hover:bg-gray-100 uppercase flex items-center gap-2 border border-gray-100"><Plus size={14} /> New</button>
                            <button onClick={handleSave} disabled={isSaving} className="px-8 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md hover:bg-[#005a9e] uppercase flex items-center gap-2 shadow-sm">{isSaving ? 'Saving...' : <><Save size={14} /> Save</>}</button>
                        </div>
                    </>
                }
            >
                <div className="flex gap-6">
                    <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            <div className="flex items-center gap-3">
                                <label className="text-[12px] font-bold text-gray-600 w-32 shrink-0">Item ID & Name</label>
                                <div className="flex-1 flex gap-1">
                                    <input name="code" value={formData.code} onChange={handleInput} className="w-24 h-8 border border-gray-300 rounded-sm px-2 text-[12px] font-bold text-[#0078d4]" placeholder="ID" />
                                    <button onClick={() => setShowSearchModal(true)} className="h-8 w-8 bg-slate-100 text-[#0078d4] border border-gray-300 rounded-sm flex items-center justify-center hover:bg-slate-200"><Search size={14}/></button>
                                    <input name="prodName" value={formData.prodName} onChange={handleInput} className="flex-1 h-8 border border-gray-300 rounded-sm px-2 text-[12px] font-bold text-gray-700" placeholder="Product Name" />
                                </div>
                            </div>
                            <ModalField label="Category" value={formData.categoryCode} displayValue={lookups.categories.find(c => c.code === formData.categoryCode)?.name} onClick={() => setActiveLookup({ title: 'Select Category', field: 'categoryCode', data: lookups.categories })} />
                            
                            <ModalField label="Department" value={formData.deptCode} displayValue={lookups.departments.find(d => d.code === formData.deptCode)?.name} onClick={() => setActiveLookup({ title: 'Select Department', field: 'deptCode', data: lookups.departments })} />
                            <InputField label="Brand" name="brandName" value={formData.brandName} onChange={handleInput} />

                            <ModalField label="Supplier" value={formData.supplierCode} displayValue={lookups.suppliers.find(s => s.code === formData.supplierCode)?.name} onClick={() => setActiveLookup({ title: 'Select Supplier', field: 'supplierCode', data: lookups.suppliers })} />
                            <InputField label="Selling Price" name="sellingPrice" value={formData.sellingPrice} onChange={handleInput} type="number" alignment="text-right" />

                            <InputField label="Purchase Price" name="purchasePrice" value={formData.purchasePrice} onChange={handleInput} type="number" alignment="text-right" />
                            <InputField label="Discount (%)" name="discount" value={formData.discount} onChange={handleInput} type="number" alignment="text-right" />

                            <InputField label="Disc. Price" name="discPrice" value={formData.discPrice} onChange={handleInput} type="number" alignment="text-right" />
                            <InputField label="Pack Size" name="packSize" value={formData.packSize} onChange={handleInput} type="number" alignment="text-right" />

                            <ModalField label="Unit of Measure" value={formData.unit} displayValue={lookups.units.find(u => u.code === formData.unit)?.name} onClick={() => setActiveLookup({ title: 'Select Unit', field: 'unit', data: lookups.units })} />
                            <ModalField label="Tax ID" value={formData.taxId} displayValue={lookups.taxIds.find(t => t.code === formData.taxId)?.name} onClick={() => setActiveLookup({ title: 'Select Tax ID', field: 'taxId', data: lookups.taxIds })} />

                            <ModalField label="Business Type" value={formData.businessType} displayValue={lookups.businessTypes.find(b => b.name === formData.businessType || b.code === formData.businessType)?.name} onClick={() => setActiveLookup({ title: 'Select Business Type', field: 'businessType', data: lookups.businessTypes })} />
                            <ModalField label="Vat Rate" value={formData.vatRate} displayValue={lookups.vatRates.find(v => v.code === formData.vatRate)?.name} onClick={() => setActiveLookup({ title: 'Select Vat Rate', field: 'vatRate', data: lookups.vatRates })} />

                            <ModalField label="Expense Account" value={formData.expenseAccount} displayValue={lookups.expenseAccounts.find(a => a.code === formData.expenseAccount)?.name} onClick={() => setActiveLookup({ title: 'Select Expense Account', field: 'expenseAccount', data: lookups.expenseAccounts })} />
                            <ModalField label="Income Account" value={formData.incomeAccount} displayValue={lookups.incomeAccounts.find(a => a.code === formData.incomeAccount)?.name} onClick={() => setActiveLookup({ title: 'Select Income Account', field: 'incomeAccount', data: lookups.incomeAccounts })} />

                            <div className="flex items-center gap-6 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" name="underCostAllow" checked={formData.underCostAllow} onChange={handleInput} className="w-4 h-4 rounded border-gray-300 text-[#0078d4]" />
                                    <span className="text-[11px] font-bold text-gray-600 uppercase">Under Cost Allow</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" name="minusAllow" checked={formData.minusAllow} onChange={handleInput} className="w-4 h-4 rounded border-gray-300 text-[#0078d4]" />
                                    <span className="text-[11px] font-bold text-gray-600 uppercase">Minus Allow</span>
                                </label>
                            </div>
                            <InputField label="Last Purch Qty" value={formData.lastPurchQty} readOnly alignment="text-right" />

                            <InputField label="Available Stock" value={formData.availableStock} readOnly alignment="text-right" />
                            <InputField label="Modified User/Date" value={`${formData.modifiedUser} / ${formData.modifiedDate}`} readOnly />

                            <InputField label="Create User/Date" value={`${formData.createUser} / ${formData.createDate}`} readOnly />
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" name="isInactive" checked={formData.isInactive} onChange={handleInput} className="w-4 h-4 rounded border-gray-300 text-red-600" />
                                <span className="text-[11px] font-bold text-red-600 uppercase">Inactive Item</span>
                            </label>
                        </div>
                    </div>

                    <div className="w-[300px] flex flex-col gap-4">
                        <div className="w-full aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 overflow-hidden relative group">
                            {productImage ? <img src={productImage} alt="Product" className="w-full h-full object-cover" /> : <><ImageIcon size={48} strokeWidth={1} /><span className="text-xs mt-2 uppercase font-bold tracking-wider text-center">No Product Image</span></>}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform shadow-lg"><Camera size={20}/></button>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h4 className="text-[11px] font-bold text-slate-800 uppercase mb-2">Live Statistics</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[11px]"><span className="text-slate-600 font-medium">Margin</span><span className="font-bold text-green-600">{(( (formData.sellingPrice - formData.purchasePrice) / (formData.sellingPrice || 1) ) * 100).toFixed(2)}%</span></div>
                                <div className="h-1 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${Math.min(100, Math.max(0, ((formData.sellingPrice - formData.purchasePrice) / (formData.sellingPrice || 1)) * 100))}%` }}></div></div>
                            </div>
                        </div>
                    </div>
                </div>

                {activeLookup && (
                    <SimpleModal isOpen={!!activeLookup} onClose={() => setActiveLookup(null)} title={activeLookup.title} maxWidth="max-w-[500px]">
                        <div className="space-y-4 pt-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="text" autoFocus placeholder="Search..." className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none" value={lookupQuery} onChange={(e) => setLookupQuery(e.target.value)} />
                            </div>
                            <div className="max-h-[400px] overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                                {activeLookup.data.filter(item => 
                                    item.name?.toLowerCase().includes(lookupQuery.toLowerCase()) || 
                                    item.code?.toLowerCase().includes(lookupQuery.toLowerCase())
                                ).map((item, idx) => (
                                    <button key={idx} onClick={() => handleInputPick(activeLookup.field, item)} className="w-full flex items-center justify-between p-4 hover:bg-blue-50 transition-colors text-left group">
                                        <div><div className="text-sm font-bold text-gray-700 group-hover:text-blue-700">{item.name}</div><div className="text-[10px] text-gray-400 font-mono">{item.code}</div></div>
                                        <Plus size={14} className="text-gray-300 group-hover:text-blue-500" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </SimpleModal>
                )}

                {showSearchModal && (
                    <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Search Products" maxWidth="max-w-[700px]">
                        <div className="space-y-4 pt-2">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text" autoFocus placeholder="Enter product name or code..." className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleMainSearch()} />
                                </div>
                                <button onClick={handleMainSearch} className="px-8 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-md">Search</button>
                            </div>
                            <div className="max-h-[450px] overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
                                {searchResults.map((item, idx) => (
                                    <div key={idx} onClick={() => handleSelectResult(item)} className="p-4 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-colors">
                                        <div>
                                            <div className="text-sm font-bold text-gray-800 group-hover:text-blue-700">{item.prod_Name}</div>
                                            <div className="text-xs text-gray-500 font-medium">Code: <span className="text-gray-700">{item.code}</span> | Price: <span className="text-green-600 font-bold">Rs. {item.selling_Price?.toLocaleString()}</span></div>
                                        </div>
                                        <RotateCcw size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                ))}
                                {searchResults.length === 0 && searchQuery && <div className="p-12 text-center text-gray-400 italic">No products found for "{searchQuery}"</div>}
                            </div>
                        </div>
                    </SimpleModal>
                )}
            </SimpleModal>
        </>
    );
};

export default ItemMasterBoard;
