import React, { useState, useEffect, useMemo, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import CalendarModal from '../components/CalendarModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import FeatureLockedModal from '../components/modals/FeatureLockedModal';
import { Search, Calendar, Plus, Trash2, Save, RotateCcw, Loader2, FileText, FileUp, FileDown, CheckCircle } from 'lucide-react';
import { grnService } from '../services/grn.service';
import { paymentMethodService } from '../services/paymentMethod.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import * as XLSX from 'xlsx';

const GRNBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ suppliers: [], products: [], pos: [], paymentMethods: [] });
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [showSupplierSearch, setShowSupplierSearch] = useState(false);
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [isAddProductLocked, setIsAddProductLocked] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAddProductLocked(localStorage.getItem('isAddProductLocked') === 'true');
        }
    }, [isOpen]);

    const [showItemMasterModal, setShowItemMasterModal] = useState(false);
    const [showPOSearch, setShowPOSearch] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('grnDate');
    const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [poSearchQuery, setPOSearchQuery] = useState('');
    const [showExpenseSearch, setShowExpenseSearch] = useState(false);
    const [showPayMethodSearch, setShowPayMethodSearch] = useState(false);
    const [payMethodSearchQuery, setPayMethodSearchQuery] = useState('');
    const [orders, setOrders] = useState([]);
    const excelInputRef = useRef(null);

    const getInitialFormData = () => ({
        docNo: '',
        grnDate: new Date().toISOString().split('T')[0],
        expectedDate: new Date().toISOString().split('T')[0],
        suppCode: '',
        poNo: '',
        payType: 'Cash',
        suppInv: '',
        invAmount: '0.00',
        consignmentBasis: false,
        acceptOtherSupp: false,
        comment: '',
        company: '',
        createUser: '',
        taxPer: '0',
        nbtPer: '0',
        discPer: '0',
        adjType: '',
        adjAmt: '0.00'
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [products, setProducts] = useState([]);
    const [entry, setEntry] = useState({
        prodCode: '',
        prodName: '',
        unit: '',
        packSize: 1,
        qty: '',
        free: '',
        cost: '',
        selling: '',
        amount: '0.00'
    });

    const [showProductQtyModal, setShowProductQtyModal] = useState(false);
    const [productMasterData, setProductMasterData] = useState({
        code: '', name: '', unit: 'Nos', purchasePrice: '', sellingPrice: '', packSize: 1
    });
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);

    const qtyRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode: initCompany, userName: initUser } = getSessionData();

            setFormData(prev => ({ ...prev, company: initCompany, createUser: initUser }));
            fetchLookups(initCompany);
            generateDocNo(initCompany);
        }
    }, [isOpen]);

    const fetchLookups = async (company) => {
        try {
            const data = await grnService.getLookups(company);
            const methods = await paymentMethodService.getAll(company);
            setLookups({ ...data, paymentMethods: methods });
        } catch (error) {
            showErrorToast('Failed to load lookups.');
        }
    };

    const generateDocNo = async (company) => {
        try {
            const data = await grnService.generateDocNo(company);
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch (error) {
            showErrorToast('Failed to generate document number.');
        }
    };

    const handleInput = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDateSelect = (date) => {
        setFormData(prev => ({ ...prev, [datePickerField]: date }));
        setShowDatePicker(false);
    };

    const handleEntryInput = (e) => {
        const { name, value } = e.target;
        let newEntry = { ...entry, [name]: value };

        if (name === 'prodCode' && value) {
            const prod = lookups.products.find(p => p.code?.trim().toUpperCase() === value.trim().toUpperCase());
            if (prod) {
                newEntry = {
                    ...newEntry,
                    prodName: prod.name,
                    unit: prod.unit || '',
                    packSize: prod.packSize || 1,
                    cost: prod.price?.toString() || '0.00',
                    selling: prod.sellingPrice?.toString() || '0.00'
                };
                setTimeout(() => qtyRef.current?.focus(), 50);
            }
        }

        if (name === 'qty' || name === 'cost') {
            const q = parseFloat(name === 'qty' ? value : newEntry.qty) || 0;
            const c = parseFloat(name === 'cost' ? value : newEntry.cost) || 0;
            newEntry.amount = (q * c).toFixed(2);
        }
        setEntry(newEntry);
    };

    const addProduct = () => {
        if (!entry.prodCode) return showErrorToast('Select a Product.');
        if (!entry.qty || parseFloat(entry.qty) <= 0) return showErrorToast('Enter valid Quantity.');

        setProducts([...products, { ...entry }]);
        setEntry({ prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', free: '', cost: '', selling: '', amount: '0.00' });
        showSuccessToast("Product added to GRN listing.");
    };

    const totals = useMemo(() => {
        const sumTotal = products.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
        const sumQty = products.reduce((acc, p) => acc + (parseFloat(p.qty) || 0), 0);
        const sumFree = products.reduce((acc, p) => acc + (parseFloat(p.free) || 0), 0);
        const discAmt = sumTotal * (parseFloat(formData.discPer) || 0) / 100;
        const discountedSum = sumTotal - discAmt;
        const nbtAmt = discountedSum * (parseFloat(formData.nbtPer) || 0) / 100;
        const taxAmt = discountedSum * (parseFloat(formData.taxPer) || 0) / 100;
        const adj = parseFloat(formData.adjAmt) || 0;
        const finalAdj = formData.adjType === 'Add' ? adj : -adj;
        const netAmount = discountedSum + nbtAmt + taxAmt + finalAdj;
        return { sumTotal, sumQty, sumFree, discAmt, nbtAmt, taxAmt, netAmount };
    }, [products, formData]);

    const handleSaveDraft = async () => {
        if (!formData.suppCode) return showErrorToast('Select Supplier.');
        if (products.length === 0) return showErrorToast('No products entered.');
        const payload = preparePayload();
        try {
            await grnService.save(payload);
            showSuccessToast('Draft saved successfully.');
        } catch (error) { showErrorToast(error.toString()); }
    };

    const handleApply = async () => {
        if (!formData.suppCode) return showErrorToast('Select Supplier.');
        if (products.length === 0) return showErrorToast('No products entered.');
        setShowConfirmModal(true);
    };

    const confirmApply = async () => {
        setIsApplying(true);
        const payload = preparePayload();
        try {
            await grnService.apply(payload);
            showSuccessToast('GRN Applied successfully.');
            handleClear();
            setShowConfirmModal(false);
        } catch (error) { showErrorToast(error.toString()); } finally { setIsApplying(false); }
    };

    const handleSelectPO = async (poNo) => {
        try {
            const data = await grnService.getPODetails(poNo, formData.company);
            const h = data.header;
            setFormData(prev => ({
                ...prev,
                poNo: h.doc_No,
                suppCode: h.vendor_Id?.trim() || prev.suppCode,
                payType: h.pay_Type || prev.payType,
                remarks: h.remarks || prev.remarks,
                comment: h.comment || prev.comment,
                taxPer: h.taxPer || '0',
                nbtPer: h.nbt?.toString() || '0'
            }));

            setProducts(data.details.map(d => ({
                prodCode: d.prod_Code,
                prodName: d.prod_Name,
                unit: d.unit,
                packSize: d.pack_Size,
                qty: d.qty?.toString() || '0',
                free: d.free_Qty?.toString() || '0',
                cost: d.purchase_Price?.toString() || '0.00',
                selling: d.selling_Price?.toString() || '0.00',
                amount: d.amount?.toString() || '0.00'
            })));
            setShowPOSearch(false);
            setPOSearchQuery('');
            showSuccessToast(`Purchase Order ${poNo} loaded.`);
        } catch (error) { showErrorToast('Failed to fetch PO details.'); }
    };

    const downloadExcelTemplate = async () => {
        try {
            const template = [{
                'Supplier Code': '', 'Supplier Invoice': '', 'PO Number': '', 'Payment Method': '', 'Comment': '',
                'Product Code': '', 'Product Name': '', 'Unit': '', 'Pack Size': '', 'Category': '', 'Department': '',
                'Available Stock': '', 'Purchase Price': '', 'Selling Price': '', 'Qty': '', 'Free Qty': ''
            }];

            const ws = XLSX.utils.json_to_sheet(template);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "GRN_Template");
            XLSX.writeFile(wb, "GRN_Full_Template.xlsx");
            showSuccessToast("Template downloaded. You can now import header data too!");
        } catch (error) {
            showErrorToast("Failed to generate template.");
        }
    };

    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) return showErrorToast("Excel file is empty.");

                const firstRow = data[0];
                const suppCode = firstRow['Supplier Code'] || firstRow['Supplier'];
                const invNo = firstRow['Supplier Invoice'] || firstRow['Inv No'];
                const payType = firstRow['Payment Method'] || firstRow['Pay Type'];
                const comment = firstRow['Comment'] || firstRow['Remarks'];
                const poNo = firstRow['PO Number'] || firstRow['PO No'];

                if (suppCode || invNo || payType || comment || poNo) {
                    setFormData(prev => ({
                        ...prev,
                        suppCode: (suppCode || prev.suppCode).toString().trim(),
                        suppInv: (invNo || prev.suppInv).toString().trim(),
                        payType: (payType || prev.payType).toString().trim(),
                        comment: (comment || prev.comment).toString().trim(),
                        poNo: (poNo || prev.poNo).toString().trim()
                    }));
                }

                const importedProducts = [];
                let skipCount = 0;

                data.forEach((row) => {
                    const pCode = row['Product Code'] || row['prodCode'] || row['Item Code'];
                    if (!pCode) { skipCount++; return; }

                    const pName = row['Product Name'] || row['prodName'] || row['Item Name'] || '';
                    const prod = lookups.products.find(p => p.code?.trim().toUpperCase() === pCode.toString().trim().toUpperCase());

                    const qty = parseFloat(row['Qty'] || row['Quantity'] || 0);
                    const free = parseFloat(row['Free Qty'] || row['Free'] || 0);
                    const cost = parseFloat(row['Purchase Price'] || row['Cost Price'] || row['Cost'] || (prod ? prod.price : 0));
                    const selling = parseFloat(row['Selling Price'] || row['Selling'] || (prod ? prod.sellingPrice : 0));

                    importedProducts.push({
                        prodCode: pCode.toString().trim(),
                        prodName: prod ? prod.name : (pName || 'Unknown Product'),
                        unit: prod ? prod.unit : 'Nos',
                        packSize: prod ? prod.packSize : 1,
                        qty: qty.toString(),
                        free: free.toString(),
                        cost: cost.toFixed(2),
                        selling: selling.toFixed(2),
                        amount: (qty * cost).toFixed(2)
                    });
                });

                if (importedProducts.length > 0) {
                    setProducts(importedProducts);
                    showSuccessToast(`Successfully loaded ${importedProducts.length} items and header data.`);
                }
                if (skipCount > 0) showErrorToast(`Skipped ${skipCount} rows due to missing Product Code.`);

            } catch (err) {
                showErrorToast("Failed to parse Excel file.");
                console.error(err);
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = null;
    };

    const preparePayload = () => ({
        ...formData,
        total: totals.sumTotal,
        totQty: totals.sumQty,
        totFree: totals.sumFree,
        taxAmt: totals.taxAmt,
        nbtAmnt: totals.nbtAmt,
        discount: totals.discAmt,
        netAmount: totals.netAmount,
        products: products.map((p, i) => ({
            ...p,
            lnNo: i + 1,
            qty: parseFloat(p.qty) || 0,
            free: parseFloat(p.free) || 0,
            cost: parseFloat(p.cost) || 0,
            selling: parseFloat(p.selling) || 0,
            amount: parseFloat(p.amount) || 0
        }))
    });

    const handleClear = () => {
        setProducts([]);
        setEntry({ prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', free: '', cost: '', selling: '', amount: '0.00' });
        setFormData(prev => ({
            ...prev,
            suppCode: '', poNo: '', suppInv: '', invAmount: '0.00', consignmentBasis: false,
            acceptOtherSupp: false, comment: '', taxPer: '0', nbtPer: '0', discPer: '0', adjType: '', adjAmt: '0.00'
        }));
        generateDocNo(formData.company);
    };

    const handleSearchClick = async () => {
        try {
            const data = await grnService.searchDocs(formData.company);
            setOrders(data);
            setShowSearchModal(true);
        } catch (error) { showErrorToast('Failed to load saved GRNs.'); }
    };

    const handleSelectRow = async (docNo) => {
        try {
            const data = await grnService.getOrder(docNo, formData.company);
            const h = data.header;
            setFormData(prev => ({
                ...prev,
                docNo: h.doc_No,
                grnDate: h.post_Date?.split('T')[0] || prev.grnDate,
                expectedDate: h.expected_Date?.split('T')[0] || prev.expectedDate,
                suppCode: h.vendor_Id?.trim() || '',
                payType: h.pay_Type || 'Cash',
                suppInv: h.inv_No || '',
                invAmount: h.inv_Amount?.toString() || '0.00',
                consignmentBasis: h.bill_Type || false,
                comment: h.comment || '',
                poNo: h.pO_No || '',
                taxPer: h.taxPer || '0',
                nbtPer: h.nbt?.toString() || '0',
                discPer: h.purDiscount?.toString() || '0',
                adjType: h.adjType || '',
                adjAmt: h.adjst?.toString() || '0.00'
            }));

            setProducts(data.details.map(d => ({
                prodCode: d.prod_Code,
                prodName: d.prod_Name,
                unit: d.unit,
                packSize: d.pack_Size,
                qty: d.qty?.toString() || '0',
                free: d.free_Qty?.toString() || '0',
                cost: d.purchase_Price?.toString() || '0.00',
                selling: d.selling_Price?.toString() || '0.00',
                amount: d.amount?.toString() || '0.00'
            })));
            setShowSearchModal(false);
            showSuccessToast('Record Loaded Successfully.');
        } catch (error) { showErrorToast('Failed to fetch order details.'); }
    };

    const handleCreateProduct = async () => {
        if (!productMasterData.code || !productMasterData.name) {
            return showErrorToast('Code and Name are required.');
        }
        setIsCreatingProduct(true);
        try {
            await grnService.createProduct({
                ...productMasterData,
                createUser: formData.createUser
            });
            showSuccessToast('Product created successfully.');
            setShowItemMasterModal(false);
            setProductMasterData({ code: '', name: '', unit: 'Nos', purchasePrice: '', sellingPrice: '', packSize: 1 });
            const results = await grnService.getLookups(formData.company);
            setLookups(prev => ({ ...prev, products: results.products }));
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setIsCreatingProduct(false);
        }
    };

    const currentSupplierName = useMemo(() => {
        if (!formData.suppCode) return '';
        const s = lookups.suppliers.find(x => x.code?.trim().toUpperCase() === formData.suppCode.trim().toUpperCase());
        return s ? s.name : formData.suppCode;
    }, [formData.suppCode, lookups.suppliers]);

    return (
        <>
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                `}
            </style>
            <TransactionFormWrapper
                subtitle="Transaction Management"
                icon={FileText}
                isOpen={isOpen}
                onClose={onClose}
                title="Good Received Note"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={handleSaveDraft} className="px-6 h-10 border-2 border-[#0285fd] text-[#0285fd] bg-white hover:bg-blue-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <Save size={14} /> SAVE DRAFT
                            </button>
                            <button type="button" onClick={handleApply} disabled={isApplying} className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${isApplying ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isApplying ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} APPLY GRN
                            </button>
                        </div>
                    </div>
                }
            >
                <input
                    type="file"
                    ref={excelInputRef}
                    onChange={handleExcelUpload}
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                />
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    {/* Top Toolbar Row */}
                    <div className="flex items-center justify-between mb-1 px-1">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="consignmentBasis"
                                    checked={formData.consignmentBasis}
                                    onChange={handleInput}
                                    className="w-4 h-4 rounded text-[#0285fd] focus:ring-[#0285fd] border-gray-300 transition-all cursor-pointer"
                                />
                                <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#0285fd] transition-colors">Consignment Basis</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="acceptOtherSupp"
                                    checked={formData.acceptOtherSupp}
                                    onChange={handleInput}
                                    className="w-4 h-4 rounded text-[#0285fd] focus:ring-[#0285fd] border-gray-300 transition-all cursor-pointer"
                                />
                                <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#0285fd] transition-colors">Accept Other Supp.</span>
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={downloadExcelTemplate} className="h-8 px-4 bg-white border-2 border-emerald-500 text-emerald-600 text-[10px] font-black rounded-[3px] hover:bg-emerald-50 transition-all flex items-center gap-2 uppercase active:scale-95 shadow-sm">
                                <FileDown size={14} /> TEMPLATE
                            </button>
                            <button onClick={() => excelInputRef.current?.click()} className="h-8 px-4 bg-white border-2 border-blue-500 text-blue-600 text-[10px] font-black rounded-[3px] hover:bg-blue-50 transition-all flex items-center gap-2 uppercase active:scale-95 shadow-sm">
                                <FileUp size={14} /> LOAD EXCEL
                            </button>
                        </div>
                    </div>

                    {/* Header Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Row 1: Doc No | Post Date | Exp. Date */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Document ID</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="docNo"
                                        value={formData.docNo}
                                        onChange={handleInput}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none"
                                     style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Post Date</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.grnDate}
                                        onClick={() => { setDatePickerField('grnDate'); setShowDatePicker(true); }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700"
                                    />
                                    <button onClick={() => { setDatePickerField('grnDate'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Expected Date</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.expectedDate}
                                        onClick={() => { setDatePickerField('expectedDate'); setShowDatePicker(true); }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700"
                                    />
                                    <button onClick={() => { setDatePickerField('expectedDate'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 2: Supplier | PO Number */}
                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Supplier</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={currentSupplierName}
                                        onClick={() => setShowSupplierSearch(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                     style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">PO Number</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.poNo || ''}
                                        onClick={() => setShowPOSearch(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                     style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>
                            </div>

                            {/* Row 3: Supp. Inv | Inv. Amount | Pay Method */}
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Supplier Invoice</label>
                                <input type="text" name="suppInv" value={formData.suppInv} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Invoice Amount</label>
                                <input type="text" name="invAmount" value={formData.invAmount} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-right text-gray-700" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payment Method</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={lookups.paymentMethods?.find(m => m.code === formData.payType)?.name || formData.payType || 'Select...'}
                                        onClick={() => setShowPayMethodSearch(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                                     style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>
                            </div>

                            {/* Row 4: Comment */}
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Comment / Remarks</label>
                                <input type="text" name="comment" value={formData.comment} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>

                    {/* Products Table Section */}
                    <div className="border border-slate-200 rounded-[3px] bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-50/50 border-b border-slate-200">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Allocation</span>
                            <button
                                onClick={() => {
                                    if (isAddProductLocked) {
                                        setShowLockModal(true);
                                        return;
                                    }
                                    setEntry({ prodCode: '', prodName: '', unit: '', packSize: 1, qty: '', free: '', cost: '', selling: '', amount: '0.00' });
                                    grnService.getLookups(formData.company).then(data => setLookups(prev => ({ ...prev, products: data.products })));
                                    setShowAddProductModal(true);
                                }}
                                className="h-7 px-3 bg-[#0285fd] text-white text-[10px] font-bold rounded-[3px] hover:bg-[#0073ff] transition-all flex items-center gap-1.5 border-none shadow-sm active:scale-95"
                            >
                                <Plus size={13} /> ADD ITEM
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 leading-10">
                                    <tr>
                                        <th className="px-4">Product Code</th>
                                        <th className="px-4">Product Name</th>
                                        <th className="px-3 text-center w-16">Unit</th>
                                        <th className="px-3 text-right w-28">Cost</th>
                                        <th className="px-3 text-right w-28">Selling</th>
                                        <th className="px-2 text-center w-20">Qty</th>
                                        <th className="px-2 text-center w-20">Free</th>
                                        <th className="px-4 text-right w-36">Amount</th>
                                        <th className="w-16 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="py-10 text-center text-gray-300 font-black italic text-[11px] uppercase tracking-widest">No items added. Click "ADD ITEM" to begin.</td>
                                        </tr>
                                    ) : products.map((p, idx) => (
                                        <tr key={idx} className="text-[12px] font-bold text-gray-700 border-b border-gray-50 hover:bg-slate-50/30 transition-colors">
                                            <td className="px-4 py-2.5 font-mono text-blue-700">{p.prodCode}</td>
                                            <td className="px-4 py-2.5 uppercase">{p.prodName}</td>
                                            <td className="px-3 py-2.5 text-center text-gray-400">{p.unit}</td>
                                            <td className="px-3 py-2.5 text-right font-mono">{parseFloat(p.cost).toFixed(2)}</td>
                                            <td className="px-3 py-2.5 text-right font-mono text-blue-600">{parseFloat(p.selling).toFixed(2)}</td>
                                            <td className="px-1 py-1">
                                                <input
                                                    type="text"
                                                    value={p.qty}
                                                    onChange={(ev) => {
                                                        const newQty = e.target.value;
                                                        const newAmount = (parseFloat(newQty) || 0) * (parseFloat(p.cost) || 0);
                                                        setProducts(products.map((item, i) =>
                                                            i === idx ? { ...item, qty: newQty, amount: newAmount.toFixed(2) } : item
                                                        ));
                                                    }}
                                                    className="w-full h-8 border border-gray-200 rounded-[3px] text-center text-[12px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]"
                                                />
                                            </td>
                                            <td className="px-1 py-1">
                                                <input
                                                    type="text"
                                                    value={p.free}
                                                    onChange={(ev) => {
                                                        setProducts(products.map((item, i) =>
                                                            i === idx ? { ...item, free: e.target.value } : item
                                                        ));
                                                    }}
                                                    className="w-full h-8 border border-gray-200 rounded-[3px] text-center text-[12px] font-mono text-blue-700 bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]"
                                                />
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono font-black">
                                                {parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-1 text-center">
                                                <button
                                                    onClick={() => {
                                                        setProductToDelete(p);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                    className="text-red-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-full"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bottom Section: Expense Ac + Remarks | Calculations */}
                    <div className="grid grid-cols-12 gap-x-6">
                        {/* Left: Expense Account + Remarks */}
                        <div className="col-span-7 space-y-3">
                            <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-3">
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Expense Account</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value=""
                                            onClick={() => setShowExpenseSearch(true)}
                                            className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-500 appearance-none"
                                         style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                    </div>
                                </div>
                                <div className="">
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Internal Remarks & Disclaimers</label>
                                    <textarea
                                        name="comment"
                                        value={formData.comment}
                                        onChange={handleInput}
                                        className="w-full h-[128px] border border-gray-300 rounded-[3px] p-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] resize-none text-gray-700"
                                        placeholder=""
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right: Calculations Summary */}
                        <div className="col-span-5 space-y-3">
                            <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] font-medium text-gray-700">Gross Inventory</span>
                                    <span className="text-[16px] font-mono font-black text-gray-800">
                                        {totals.sumTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[13px] font-medium text-gray-700">Discount %</span>
                                    <div className="flex items-center gap-2">
                                        <input type="text" name="discPer" value={formData.discPer} onChange={handleInput} className="w-16 h-8 border border-gray-300 rounded-[3px] px-2 text-center text-[13px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                        <div className="w-28 h-8 bg-gray-50 border border-gray-200 rounded-[3px] flex items-center justify-end px-3 text-[13px] font-mono text-gray-500">
                                            {totals.discAmt.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[13px] font-medium text-gray-700">Tax / NBT Levies</span>
                                    <div className="flex items-center gap-1">
                                        <input type="text" name="taxPer" value={formData.taxPer} onChange={handleInput} placeholder="T" className="w-14 h-8 border border-gray-300 rounded-[3px] px-1 text-center text-[13px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                        <input type="text" name="nbtPer" value={formData.nbtPer} onChange={handleInput} placeholder="N" className="w-14 h-8 border border-gray-300 rounded-[3px] px-1 text-center text-[13px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                        <div className="w-28 h-8 bg-gray-50 border border-gray-200 rounded-[3px] flex items-center justify-end px-3 text-[13px] font-mono text-gray-500">
                                            {(totals.taxAmt + totals.nbtAmt).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[13px] font-medium text-gray-700">Manual Adjustment</span>
                                    <div className="flex items-center gap-1">
                                        <select name="adjType" value={formData.adjType} onChange={handleInput} className="w-14 h-8 border border-gray-300 rounded-[3px] text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]">
                                            <option value="">±</option>
                                            <option value="Add">+</option>
                                            <option value="Less">-</option>
                                        </select>
                                        <input type="text" name="adjAmt" value={formData.adjAmt} onChange={handleInput} className="w-28 h-8 border border-gray-300 rounded-[3px] px-2 text-right text-[13px] font-mono bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd]" />
                                    </div>
                                </div>
                                <div className="h-px bg-gray-200 my-1" />
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-[3px]">
                                    <span className="text-[14px] font-black text-gray-800 uppercase">Net Liability</span>
                                    <span className="text-[22px] font-mono font-black text-[#0285fd] tracking-tight">
                                        {totals.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            {/* Archived GRN Search Modal */}
            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Archived GRN Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter archived GRNs..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Doc No</th>
                                        <th className=" px-5 py-3">Date</th>
                                        <th className=" px-5 py-3">Supplier Name</th>
                                        <th className="text-right px-5 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.map((o, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleSelectRow(o.docNo)}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{o.docNo}</td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{o.date?.split('T')[0]}</td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{o.supplier}</td>
                                            <td className="text-right px-5 py-3">
                                                <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">RETRIEVE</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && <tr><td colSpan="4" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">Archive is empty</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Supplier Search Modal */}
            <SimpleModal isOpen={showSupplierSearch} onClose={() => setShowSupplierSearch(false)} title="Supplier Directory Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find supplier by legal name or code..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={supplierSearchQuery} onChange={(e) => setSupplierSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Code</th>
                                        <th className=" px-5 py-3">Legal Name</th>
                                        <th className="text-right px-5 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.suppliers.filter(s => s.name?.toLowerCase().includes(supplierSearchQuery.toLowerCase()) || s.code?.toLowerCase().includes(supplierSearchQuery.toLowerCase())).map((s) => (
                                        <tr key={s.code} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, suppCode: s.code?.trim() })); setShowSupplierSearch(false); setSupplierSearchQuery(''); }}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{s.code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{s.name}</td>
                                            <td className="text-right px-5 py-3">
                                                <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {lookups.suppliers.filter(s => s.name?.toLowerCase().includes(supplierSearchQuery.toLowerCase()) || s.code?.toLowerCase().includes(supplierSearchQuery.toLowerCase())).length === 0 && <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No suppliers found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Add Product Modal (Catalog) */}
            <SimpleModal isOpen={showAddProductModal} onClose={() => { setShowAddProductModal(false); setProductSearchQuery(''); }} title="Inventory Acquisition Portal" maxWidth="max-w-[700px]">
                <div className="space-y-4 px-1 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="relative flex-1 max-w-[400px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search Inventory"
                                    className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                                    value={productSearchQuery}
                                    onChange={async (e) => {
                                        const val = ev.target.value; setProductSearchQuery(val);
                                        if (val.length >= 2) { try { const r = await grnService.searchProducts(val); setLookups(prev => ({ ...prev, products: r })); } catch (_) {} }
                                        else if (val.length === 0) { const init = await grnService.getLookups(formData.company); setLookups(prev => ({ ...prev, products: init.products })); }
                                    }}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => setShowItemMasterModal(true)}
                            className="h-10 px-5 bg-[#0285fd] text-white text-[12px] font-bold rounded-[3px] hover:bg-[#0073ff] transition-all flex items-center gap-2 border-none shadow-sm active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={14} /> CREATE NEW ITEM
                        </button>
                    </div>

                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm bg-white">
                        <div className="max-h-[420px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Code</th>
                                        <th className=" px-5 py-3">Item Description</th>
                                        <th className="text-right px-5 py-3">Base Price</th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(lookups.products || []).map(p => (
                                        <tr key={p.code}
                                            onClick={() => {
                                                setEntry(prev => ({
                                                    ...prev,
                                                    prodCode: p.code, prodName: p.name, unit: p.unit || '',
                                                    packSize: p.packSize || 1,
                                                    cost: parseFloat(p.price || 0).toFixed(2),
                                                    selling: parseFloat(p.sellingPrice || 0).toFixed(2),
                                                    qty: prev.qty || '',
                                                    amount: ((parseFloat(prev.qty) || 0) * parseFloat(p.price || 0)).toFixed(2)
                                                }));
                                                setShowProductQtyModal(true);
                                            }}
                                            className={`group hover:bg-blue-50/50 cursor-pointer transition-all duration-200 ${entry.prodCode === p.code ? 'bg-blue-50/70' : ''}`}
                                        >
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{p.code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">
                                                <div className="text-[13px] font-bold text-gray-700 uppercase group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 max-w-[320px]">
                                                    {p.name}
                                                </div>
                                            </td>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">
                                                <span className="text-[10px] text-gray-300 mr-1">Rs.</span>
                                                {parseFloat(p.price || 0).toFixed(2)}
                                            </td>
                                            <td className="text-right px-5 py-3">
                                                <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Line Item Configuration Modal (Quantity/Cost) */}
            <SimpleModal
                isOpen={showProductQtyModal}
                onClose={() => setShowProductQtyModal(false)}
                title="Line Item Configuration"
                maxWidth="max-w-[700px]"
            >
                <div className="space-y-4 px-1 py-1 font-['Tahoma']">
                    <div className="bg-slate-50/50 p-4 rounded-[3px] border border-slate-100 flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Active Selection</span>
                        <h3 className="text-[18px] font-black text-slate-700 uppercase leading-[1.2] tracking-tight max-w-[90%] break-words">
                            {entry.prodName}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] font-mono font-bold text-blue-500 bg-white px-3 py-0.5 rounded-[3px] shadow-sm border border-slate-100">{entry.prodCode}</span>
                            <span className="text-[10px] font-black text-slate-300 uppercase">Product Code</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                                    Unit Price <span className="text-blue-500 font-mono">LKR</span>
                                </label>
                                <input
                                    type="text"
                                    name="cost"
                                    value={entry.cost}
                                    onChange={handleEntryInput}
                                    className="w-full h-12 border border-gray-300 px-5 text-right text-[16px] font-mono font-black rounded-[3px] outline-none focus:border-blue-500 bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                                    Selling Price <span className="text-blue-500 font-mono">LKR</span>
                                </label>
                                <input
                                    type="text"
                                    name="selling"
                                    value={entry.selling}
                                    onChange={handleEntryInput}
                                    className="w-full h-12 border border-gray-300 px-5 text-right text-[16px] font-mono font-black text-blue-600 rounded-[3px] outline-none focus:border-blue-500 bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Received Qty</label>
                                <input
                                    type="text"
                                    name="qty"
                                    ref={qtyRef}
                                    value={entry.qty}
                                    onChange={handleEntryInput}
                                    onKeyDown={e => { if (e.key === 'Enter') { addProduct(); setShowProductQtyModal(false); setShowAddProductModal(false); setProductSearchQuery(''); } }}
                                    className="w-full h-12 border border-blue-500 px-5 text-center text-[18px] font-mono font-black rounded-[3px] outline-none bg-blue-50/20"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Free Issue</label>
                                <input
                                    type="text"
                                    name="free"
                                    value={entry.free}
                                    onChange={handleEntryInput}
                                    className="w-full h-12 border border-gray-300 px-5 text-center text-[18px] font-mono font-black text-blue-600 rounded-[3px] outline-none focus:border-blue-500 bg-white shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Valuation</span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                                <span className="text-[12px] font-bold text-blue-500">LKR</span>
                                <span className="text-[26px] font-mono font-black text-slate-800 tracking-tight">
                                    {parseFloat(entry.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => { addProduct(); setShowProductQtyModal(false); setShowAddProductModal(false); setProductSearchQuery(''); }}
                            className="h-11 px-8 bg-[#0285fd] text-white text-[13px] font-bold rounded-[3px] hover:bg-[#0073ff] transition-all active:scale-95 flex items-center gap-2 border-none shadow-sm"
                        >
                            <Plus size={16} /> ADD TO LIST
                        </button>
                    </div>
                </div>
            </SimpleModal>

            {/* PO Search Modal */}
            <SimpleModal isOpen={showPOSearch} onClose={() => setShowPOSearch(false)} title="Select Purchase Order Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Filter active PO documents..." value={poSearchQuery} onChange={(e) => setPOSearchQuery(e.target.value)} className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-sm focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm" autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Document ID</th>
                                        <th className="text-right px-5 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lookups.pos.filter(p => p.docNo.toLowerCase().includes(poSearchQuery.toLowerCase())).map((p) => (
                                        <tr key={p.docNo} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleSelectPO(p.docNo)}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{p.docNo}</td>
                                            <td className="text-right px-5 py-3">
                                                <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT ORDER</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {lookups.pos.length === 0 && <tr><td colSpan="2" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No active orders available</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Payment Method Search Modal */}
            <SimpleModal
                isOpen={showPayMethodSearch}
                onClose={() => {
                    setShowPayMethodSearch(false);
                    setPayMethodSearchQuery('');
                }}
                title="Payment Method Lookup"
                maxWidth="max-w-[700px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Filter payment methods..."
                                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                                value={payMethodSearchQuery}
                                onChange={(e) => setPayMethodSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Code</th>
                                        <th className=" px-5 py-3">Method Title</th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(lookups.paymentMethods || [])
                                        .filter(m => !payMethodSearchQuery || m.name.toLowerCase().includes(payMethodSearchQuery.toLowerCase()) || m.code.toLowerCase().includes(payMethodSearchQuery.toLowerCase()))
                                        .map(m => (
                                            <tr key={m.code} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => {
                                                setFormData(prev => ({ ...prev, payType: m.code }));
                                                setShowPayMethodSearch(false);
                                                setPayMethodSearchQuery('');
                                            }}>
                                                <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{m.code}</td>
                                                <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{m.name}</td>
                                            
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                        ))}
                                    {(lookups.paymentMethods || []).length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No methods found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Expense Account Search Modal */}
            <SimpleModal
                isOpen={showExpenseSearch}
                onClose={() => setShowExpenseSearch(false)}
                title="Expense Account Lookup"
                maxWidth="max-w-[700px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Filter ledger accounts..."
                                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Code</th>
                                        <th className=" px-5 py-3">Account Name</th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <tr>
                                        <td colSpan="2" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No accounts configured</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Confirm Apply Modal */}
            <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={confirmApply} title="Save & Apply GRN" message={`Are you sure you want to Save and Apply GRN document ${formData.docNo}?`} loading={isApplying} confirmText="Apply GRN" />

            {/* Calendar Modal */}
            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onDateSelect={handleDateSelect}
                initialDate={formData[datePickerField]}
            />

            {/* Product Master Creation Modal */}
            <SimpleModal
                isOpen={showItemMasterModal}
                onClose={() => setShowItemMasterModal(false)}
                title="Product Master Creation"
                maxWidth="max-w-[700px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-200 rounded-b-xl">
                        <button onClick={() => setShowItemMasterModal(false)} className="px-6 h-9 bg-white text-gray-500 text-[13px] font-bold rounded-[3px] border border-gray-300 hover:bg-blue-50/50 transition-all active:scale-95 font-tahoma cursor-pointer group border-b border-gray-50">CANCEL</button>
                        <button onClick={handleCreateProduct} disabled={isCreatingProduct} className="px-8 h-9 bg-[#0285fd] text-white text-[13px] font-bold rounded-[3px] shadow-md shadow-green-50 hover:bg-[#0073ff] transition-all active:scale-95 flex items-center gap-2 border-none font-tahoma">
                            {isCreatingProduct ? 'CREATING...' : 'CREATE PRODUCT'}
                        </button>
                    </div>
                }
            >
                <div className="py-2 px-1 font-['Tahoma'] space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[12px] font-bold text-gray-600 uppercase tracking-widest pl-1">Product Code</label>
                            <input type="text" value={productMasterData.code} onChange={e => setProductMasterData({...productMasterData, code: e.target.value})} className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-[13px] outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white font-mono uppercase shadow-sm" placeholder="" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[12px] font-bold text-gray-600 uppercase tracking-widest pl-1">Unit of Measure</label>
                            <input type="text" value={productMasterData.unit} onChange={e => setProductMasterData({...productMasterData, unit: e.target.value})} className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-[13px] outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm" placeholder="Nos" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[12px] font-bold text-gray-600 uppercase tracking-widest pl-1">Product Description</label>
                        <input type="text" value={productMasterData.name} onChange={e => setProductMasterData({...productMasterData, name: e.target.value})} className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-[13px] outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white uppercase shadow-sm font-bold" placeholder="" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest pl-1">Purchase Price</label>
                            <input type="text" value={productMasterData.purchasePrice} onChange={e => setProductMasterData({...productMasterData, purchasePrice: e.target.value})} className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-right text-[13px] font-mono outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm" placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest pl-1">Selling Price</label>
                            <input type="text" value={productMasterData.sellingPrice} onChange={e => setProductMasterData({...productMasterData, sellingPrice: e.target.value})} className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-right text-[13px] font-mono outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm" placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest pl-1">Pack Size</label>
                            <input type="text" value={productMasterData.packSize} onChange={e => setProductMasterData({...productMasterData, packSize: e.target.value})} className="w-full h-10 border border-gray-300 rounded-[3px] px-4 text-center text-[13px] font-mono outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] bg-white shadow-sm" placeholder="1" />
                        </div>
                    </div>
                    <div className="bg-blue-50/50 p-3.5 rounded-[3px] border border-blue-100/50 flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest leading-relaxed">System Defaults: Category (1) and Department (1) will be automatically assigned to this record.</p>
                    </div>
                </div>
            </SimpleModal>

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => {
                    if (productToDelete) {
                        setProducts(products.filter(p => p.prodCode !== productToDelete.prodCode));
                        setShowDeleteConfirm(false);
                        setProductToDelete(null);
                        showSuccessToast("Item removed from allocation");
                    }
                }}
                title="Confirm Item Removal"
                message={`Are you sure you want to remove "${productToDelete?.prodName}" from this GRN allocation?`}
                loading={isDeleting}
            />

            {/* Feature Locked Modal */}
            <FeatureLockedModal
                isOpen={showLockModal}
                onClose={() => setShowLockModal(false)}
            />
        </>
    );
};

export default GRNBoard;
