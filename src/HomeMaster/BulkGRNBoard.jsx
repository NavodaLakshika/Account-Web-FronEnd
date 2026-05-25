import React, { useState, useEffect, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { Search, CheckCircle, RotateCcw, FileUp, FileDown, Trash2, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { grnService } from '../services/grn.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const BulkGRNBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ suppliers: [], products: [], pos: [], paymentMethods: [] });
    const [isApplying, setIsApplying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    // An array of grouped GRNs
    const [groupedGrns, setGroupedGrns] = useState([]);
    
    const excelInputRef = useRef(null);

    // Initial setup
    const [formDataTemplate, setFormDataTemplate] = useState({
        grnDate: new Date().toISOString().split('T')[0],
        expectedDate: new Date().toISOString().split('T')[0],
        company: '',
        createUser: ''
    });

    useEffect(() => {
        if (isOpen) {
            const { companyCode: initCompany, userName: initUser } = getSessionData();
            setFormDataTemplate(prev => ({ ...prev, company: initCompany, createUser: initUser }));
            fetchLookups(initCompany);
        }
    }, [isOpen]);

    const fetchLookups = async (company) => {
        try {
            const data = await grnService.getLookups(company);
            setLookups(data);
        } catch (error) {
            showErrorToast('Failed to load lookups.');
        }
    };

    const downloadExcelTemplate = () => {
        const template = [
            { 
                'Supplier Code': 'SUPP01', 
                'Supplier Invoice': 'INV-123',
                'PO Number' :'',
                'Payment Method': 'Cash',
                'Comment': 'Bulk upload',
                'Product Code': 'PROD01', 
                'Qty': '10', 
                'Free Qty': '0', 
                'Purchase Price': '100.00', 
                'Selling Price': '150.00' 
            },
            { 
                'Supplier Code': 'SUPP02', 
                'Supplier Invoice': 'INV-456',
                'PO Number' :'',
                'Payment Method': 'Credit',
                'Comment': 'Bulk upload 2',
                'Product Code': 'PROD02', 
                'Qty': '5', 
                'Free Qty': '1', 
                'Purchase Price': '200.00', 
                'Selling Price': '250.00' 
            },
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bulk_GRN_Template");
        XLSX.writeFile(wb, "Bulk_GRN_Template.xlsx");
        showSuccessToast("Bulk Template Downloaded!");
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

                let skipCount = 0;
                
                // Group by Supplier Code + Invoice No
                const groups = {};

                data.forEach((row, index) => {
                    const suppCode = (row['Supplier Code'] || row['Supplier'] || '').toString().trim();
                    const pCode = (row['Product Code'] || row['prodCode'] || row['Item Code'] || '').toString().trim();
                    
                    if (!suppCode || !pCode) { skipCount++; return; }

                    const invNo = (row['Supplier Invoice'] || row['Inv No'] || '').toString().trim();
                    const payType = (row['Payment Method'] || row['Pay Type'] || 'Cash').toString().trim();
                    const comment = (row['Comment'] || row['Remarks'] || '').toString().trim();
                    const poNo = (row['PO Number'] || row['PO No'] || '').toString().trim();

                    const key = `${suppCode}_${invNo}`;
                    
                    if (!groups[key]) {
                        groups[key] = {
                            id: Math.random().toString(36).substr(2, 9),
                            suppCode,
                            suppInv: invNo,
                            payType,
                            comment,
                            poNo,
                            products: []
                        };
                    }

                    const prod = lookups.products.find(p => p.code?.trim().toUpperCase() === pCode.toUpperCase());
                    
                    const qty = parseFloat(row['Qty'] || row['Quantity'] || 0);
                    const free = parseFloat(row['Free Qty'] || row['Free'] || 0);
                    const cost = parseFloat(row['Purchase Price'] || row['Cost Price'] || row['Cost'] || (prod ? prod.price : 0));
                    const selling = parseFloat(row['Selling Price'] || row['Selling'] || (prod ? prod.sellingPrice : 0));

                    groups[key].products.push({
                        prodCode: pCode,
                        prodName: prod ? prod.name : 'Unknown Product',
                        unit: prod ? prod.unit : 'Nos',
                        packSize: prod ? prod.packSize : 1,
                        qty: qty.toString(),
                        free: free.toString(),
                        cost: cost.toFixed(2),
                        selling: selling.toFixed(2),
                        amount: (qty * cost).toFixed(2)
                    });
                });

                const parsedGroups = Object.values(groups);
                
                if (parsedGroups.length > 0) {
                    setGroupedGrns(parsedGroups);
                    showSuccessToast(`Successfully grouped ${parsedGroups.length} GRNs from Excel.`);
                } else {
                    showErrorToast("Could not parse any valid GRN groups.");
                }
                
                if (skipCount > 0) showErrorToast(`Skipped ${skipCount} rows due to missing Supplier or Product Code.`);
                
            } catch (err) {
                showErrorToast("Failed to parse Excel file.");
                console.error(err);
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = null;
    };

    const handleClear = () => {
        setGroupedGrns([]);
    };
    
    const removeGroup = (id) => {
        setGroupedGrns(groupedGrns.filter(g => g.id !== id));
    };

    const handleApply = () => {
        if (groupedGrns.length === 0) return showErrorToast('No GRNs to apply.');
        setShowConfirmModal(true);
    };

    const confirmApply = async () => {
        setIsApplying(true);
        
        // Build payload
        const payload = groupedGrns.map(group => {
            const sumTotal = group.products.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
            const sumQty = group.products.reduce((acc, p) => acc + (parseFloat(p.qty) || 0), 0);
            const sumFree = group.products.reduce((acc, p) => acc + (parseFloat(p.free) || 0), 0);
            
            return {
                docNo: '', // Backend will generate
                grnDate: formDataTemplate.grnDate,
                expectedDate: formDataTemplate.expectedDate,
                suppCode: group.suppCode,
                poNo: group.poNo,
                payType: group.payType,
                suppInv: group.suppInv,
                invAmount: sumTotal.toString(),
                consignmentBasis: false,
                acceptOtherSupp: false,
                comment: group.comment,
                company: formDataTemplate.company,
                createUser: formDataTemplate.createUser,
                taxPer: '0',
                nbtPer: '0',
                discPer: '0',
                adjType: '',
                adjAmt: '0.00',
                total: sumTotal,
                totQty: sumQty,
                totFree: sumFree,
                taxAmt: 0,
                nbtAmnt: 0,
                discount: 0,
                netAmount: sumTotal,
                products: group.products.map((p, i) => ({
                    ...p,
                    lnNo: i + 1,
                    qty: parseFloat(p.qty) || 0,
                    free: parseFloat(p.free) || 0,
                    cost: parseFloat(p.cost) || 0,
                    selling: parseFloat(p.selling) || 0,
                    amount: parseFloat(p.amount) || 0
                }))
            };
        });

        try {
            await grnService.bulkApply(payload);
            showSuccessToast(`Successfully applied ${payload.length} GRNs.`);
            handleClear();
            setShowConfirmModal(false);
        } catch (error) { 
            showErrorToast(error.toString()); 
        } finally { 
            setIsApplying(false); 
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const payload = groupedGrns.map(group => {
            const sumTotal = group.products.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
            const sumQty = group.products.reduce((acc, p) => acc + (parseFloat(p.qty) || 0), 0);
            const sumFree = group.products.reduce((acc, p) => acc + (parseFloat(p.free) || 0), 0);

            return {
                company: formDataTemplate.company,
                createUser: formDataTemplate.createUser,
                vendorId: group.suppCode,
                suppInvNo: group.suppInv || '',
                poNo: group.poNo || '-NO-',
                postDate: formDataTemplate.grnDate,
                expectedDate: formDataTemplate.expectedDate,
                payType: group.payType || 'Cash',
                comment: group.comment || '',
                total: sumTotal,
                totQty: sumQty,
                totFree: sumFree,
                taxAmt: 0,
                nbtAmnt: 0,
                discount: 0,
                netAmount: sumTotal,
                products: group.products.map((p, i) => ({
                    ...p,
                    lnNo: i + 1,
                    qty: parseFloat(p.qty) || 0,
                    free: parseFloat(p.free) || 0,
                    cost: parseFloat(p.cost) || 0,
                    selling: parseFloat(p.selling) || 0,
                    amount: parseFloat(p.amount) || 0
                }))
            };
        });

        try {
            await grnService.bulkSave(payload);
            showSuccessToast(`Successfully saved ${payload.length} GRNs as drafts.`);
            handleClear();
        } catch (error) { 
            showErrorToast(error.toString()); 
        } finally { 
            setIsSaving(false); 
        }
    };

    return (
        <>
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Bulk Good Received Note (Bulk GRN)"
            maxWidth="max-w-[1200px]"
            footer={
                <div className="bg-slate-50 px-6 py-3 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl">
                    <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none">
                        <RotateCcw size={14} /> CLEAR ALL
                    </button>
                    <div className="flex gap-3">
                        <button onClick={handleSave} disabled={isSaving || isApplying || groupedGrns.length === 0} className="px-6 h-10 bg-slate-600 text-white text-sm font-black rounded-[5px] shadow-md shadow-slate-100 hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-2 border-none disabled:opacity-50">
                            {isSaving ? <Search className="animate-spin" size={14} /> : <FileDown size={14} />} SAVE ALL ({groupedGrns.length})
                        </button>
                        <button onClick={handleApply} disabled={isSaving || isApplying || groupedGrns.length === 0} className="px-6 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none disabled:opacity-50">
                            {isApplying ? <Search className="animate-spin" size={14} /> : <CheckCircle size={14} />} APPLY ALL ({groupedGrns.length})
                        </button>
                    </div>
                </div>
            }
        >
            <input type="file" ref={excelInputRef} onChange={handleExcelUpload} accept=".xlsx, .xls, .csv" className="hidden" />
            <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                <div className="flex items-center justify-between mb-1 px-1">
                    <div className="text-sm font-bold text-gray-600">
                        Total GRNs to Process: <span className="text-blue-600">{groupedGrns.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={downloadExcelTemplate} className="h-8 px-4 bg-white text-emerald-600 border-2 border-emerald-500 text-[10px] font-black rounded-[5px] hover:bg-emerald-50 transition-all flex items-center gap-2 uppercase active:scale-95 shadow-sm">
                            <FileDown size={14} /> BULK TEMPLATE
                        </button>
                        <button onClick={() => excelInputRef.current?.click()} className="h-8 px-4 bg-white text-blue-600 border-2 border-blue-500 text-[10px] font-black rounded-[5px] hover:bg-blue-50 transition-all flex items-center gap-2 uppercase active:scale-95 shadow-sm">
                            <FileUp size={14} /> LOAD BULK EXCEL
                        </button>
                    </div>
                </div>

                <div className="border border-gray-100 rounded-lg bg-white shadow-sm flex flex-col min-h-[400px] overflow-hidden">
                    <div className="flex bg-slate-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center">
                        <div className="flex-[1.5] py-2.5 px-4 border-r border-gray-100">Supplier</div>
                        <div className="w-32 py-2.5 px-3 border-r border-gray-100 text-center">Inv No</div>
                        <div className="w-32 py-2.5 px-3 border-r border-gray-100 text-center">PO No</div>
                        <div className="w-24 py-2.5 px-3 border-r border-gray-100 text-center">Items</div>
                        <div className="w-32 py-2.5 px-4 text-right">Total Amount</div>
                        <div className="w-12"></div>
                    </div>
                    <div className="flex-1 bg-white overflow-y-auto max-h-[350px] divide-y divide-gray-50">
                        {groupedGrns.length === 0 ? (
                            <div className="h-48 flex items-center justify-center text-gray-300 text-[11px] font-bold uppercase tracking-widest italic">
                                Load Excel file to preview Bulk GRNs
                            </div>
                        ) : groupedGrns.map((g, idx) => {
                            const supplierName = lookups.suppliers.find(s => s.code?.trim().toUpperCase() === g.suppCode.trim().toUpperCase())?.name || g.suppCode;
                            const totalAmount = g.products.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
                            
                            return (
                                <div key={g.id} className="flex border-b border-gray-100 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors group">
                                    <div className="flex-[1.5] py-2 px-4 border-r border-gray-100 truncate">
                                        <div className="flex flex-col">
                                            <span className="text-blue-600 font-mono text-[10px]">{g.suppCode}</span>
                                            <span className="truncate">{supplierName}</span>
                                        </div>
                                    </div>
                                    <div className="w-32 py-2 px-3 border-r border-gray-100 text-center font-mono">{g.suppInv || '-'}</div>
                                    <div className="w-32 py-2 px-3 border-r border-gray-100 text-center font-mono text-gray-500">{g.poNo || '-'}</div>
                                    <div className="w-24 py-2 px-3 border-r border-gray-100 text-center bg-white group-hover:bg-transparent">
                                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{g.products.length} Items</span>
                                    </div>
                                    <div className="w-32 py-1.5 px-4 text-right font-mono font-black text-slate-800">
                                        {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className="w-12 flex justify-center py-1">
                                        <button onClick={() => removeGroup(g.id)} className="text-red-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-[5px]">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={confirmApply} title="Bulk Apply GRNs" message={`Are you sure you want to apply ${groupedGrns.length} GRN documents? This action cannot be undone.`} loading={isApplying} confirmText="Apply All GRNs" />
        </SimpleModal>
        </>
    );
};

export default BulkGRNBoard;
