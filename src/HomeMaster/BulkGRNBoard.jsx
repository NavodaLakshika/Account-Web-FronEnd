import React, { useState, useEffect, useRef } from 'react';
import SimpleModal from '../components/SimpleModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import ColumnSelectionModal from '../components/modals/ColumnSelectionModal';
import { Search, CheckCircle, RotateCcw, FileUp, FileDown, Trash2, X , FileText} from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { grnService } from '../services/grn.service';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { departmentService } from '../services/department.service';
import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import { reportService } from '../services/report.service';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const BulkGRNBoard = ({ isOpen, onClose }) => {
    const [lookups, setLookups] = useState({ suppliers: [], products: [], pos: [], paymentMethods: [] });
    const [isApplying, setIsApplying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    // An array of grouped GRNs
    const [groupedGrns, setGroupedGrns] = useState([]);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    
    const excelInputRef = useRef(null);

    // Initial setup
    const getInitialFormDataTemplate = () => ({
        grnDate: new Date().toISOString().split('T')[0],
        expectedDate: new Date().toISOString().split('T')[0],
        company: '',
        createUser: ''
    });

    const [formDataTemplate, setFormDataTemplate] = useState(getInitialFormDataTemplate());

    useEffect(() => {
        if (isOpen) {
            setFormDataTemplate(getInitialFormDataTemplate());
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

    const handleTemplateDownload = async (selectedColumns) => {
        try {
            // 1. Resolve Target Company Code (check form, session, storage, and fallback)
            let targetCompany = formDataTemplate?.company || '';
            if (!targetCompany) {
                const sess = getSessionData();
                targetCompany = sess?.companyCode || '';
            }
            if (!targetCompany) {
                const storageKeys = ['selectedCompany', 'company', 'companyCode', 'currentCompany'];
                for (const k of storageKeys) {
                    try {
                        const raw = localStorage.getItem(k) || sessionStorage.getItem(k);
                        if (raw) {
                            const p = JSON.parse(raw);
                            const found = p?.company_Code || p?.companyCode || p?.CompanyCode || p?.Company_Code || p?.Code || p?.code || p?.Company_Id || p?.companyId || (typeof p === 'string' ? p : '');
                            if (found) { targetCompany = found; break; }
                        }
                    } catch (e) {
                        const raw = localStorage.getItem(k) || sessionStorage.getItem(k);
                        if (raw && typeof raw === 'string' && raw.trim() && !raw.startsWith('{')) {
                            targetCompany = raw.trim();
                            break;
                        }
                    }
                }
            }
            if (!targetCompany) {
                try {
                    const uRaw = localStorage.getItem('user') || sessionStorage.getItem('user');
                    if (uRaw) {
                        const u = JSON.parse(uRaw);
                        targetCompany = u?.company_Code || u?.companyCode || u?.CompanyCode || u?.Company_Code || u?.company || '';
                    }
                } catch (e) {}
            }
            if (!targetCompany) {
                targetCompany = 'COM001';
            }

            // 2. Fetch categories and departments from productService (Acc_Category & Acc_Department lookups) and fallback services
            let rawCats = [];
            let rawDepts = [];

            const extractArray = (res, key) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (key && Array.isArray(res[key])) return res[key];
                return [];
            };

            // Primary: productService.getLookups(targetCompany)
            try {
                const prodLookups = await productService.getLookups(targetCompany);
                const c = extractArray(prodLookups, 'categories');
                const d = extractArray(prodLookups, 'departments');
                if (c.length > 0) rawCats = c;
                if (d.length > 0) rawDepts = d;
            } catch (e) {
                console.warn("productService.getLookups notice:", e);
            }

            // Fallback 1: category & department services for targetCompany
            if (rawCats.length === 0) {
                try {
                    const c = await categoryService.searchCategories('', targetCompany, '');
                    if (Array.isArray(c) && c.length > 0) rawCats = c;
                } catch (e) {}
            }
            if (rawCats.length === 0) {
                try {
                    const c = await categoryService.getAll(targetCompany);
                    if (Array.isArray(c) && c.length > 0) rawCats = c;
                } catch (e) {}
            }
            if (rawDepts.length === 0) {
                try {
                    const d = await departmentService.searchDepartments(targetCompany, '');
                    if (Array.isArray(d) && d.length > 0) rawDepts = d;
                } catch (e) {}
            }
            if (rawDepts.length === 0) {
                try {
                    const d = await departmentService.getAll(targetCompany);
                    if (Array.isArray(d) && d.length > 0) rawDepts = d;
                } catch (e) {}
            }

            // Fallback 2: If still empty and targetCompany was not 'COM001', check 'COM001'
            if ((rawCats.length === 0 || rawDepts.length === 0) && targetCompany !== 'COM001') {
                try {
                    const fallbackLookups = await productService.getLookups('COM001');
                    const c = extractArray(fallbackLookups, 'categories');
                    const d = extractArray(fallbackLookups, 'departments');
                    if (rawCats.length === 0 && c.length > 0) rawCats = c;
                    if (rawDepts.length === 0 && d.length > 0) rawDepts = d;
                } catch (e) {}
            }

            // 3. Normalise department and category lists
            const deptList = rawDepts.map(d => ({
                'Department Code': d?.code || d?.Code || d?.dept_Code || d?.Dept_Code || d?.deptCode || d?.DeptCode || '',
                'Department Name': d?.name || d?.Name || d?.dept_Name || d?.Dept_Name || d?.deptName || d?.DeptName || ''
            })).filter(d => d['Department Code'] || d['Department Name']);

            const catList = rawCats.map(c => ({
                'Category Code': c?.code || c?.Code || c?.cat_Code || c?.Cat_Code || c?.catCode || c?.CatCode || '',
                'Category Name': c?.name || c?.Name || c?.cat_Name || c?.Cat_Name || c?.catName || c?.CatName || '',
                'Department Code': c?.dept_Code || c?.Dept_Code || c?.deptCode || c?.DeptCode || c?.dept_code || ''
            })).filter(c => c['Category Code'] || c['Category Name']);

            // 4. Ensure Category and Department columns exist in the template
            const templateCols = Array.isArray(selectedColumns) && selectedColumns.length > 0
                ? [...selectedColumns]
                : [
                    'Supplier Code', 'Supplier Invoice', 'PO Number', 'Payment Method', 'Comment',
                    'Product Code', 'Product Name', 'Unit', 'Pack Size',
                    'Category', 'Department',
                    'Available Stock', 'Purchase Price', 'Selling Price', 'Qty', 'Free Qty'
                ];

            if (!templateCols.includes('Category')) {
                templateCols.splice(Math.min(9, templateCols.length), 0, 'Category');
            }
            if (!templateCols.includes('Department')) {
                const catIdx = templateCols.indexOf('Category');
                templateCols.splice(catIdx >= 0 ? catIdx + 1 : Math.min(10, templateCols.length), 0, 'Department');
            }

            // 5. Build Cursor Hover Tooltip Messages: "This data in your company"
            const catNamesList = catList.map(c => {
                const code = c['Category Code'] || '';
                const name = c['Category Name'] || '';
                if (name && code && name !== code) return `• ${name} (${code})`;
                return `• ${name || code}`;
            });

            const deptNamesList = deptList.map(d => {
                const code = d['Department Code'] || '';
                const name = d['Department Name'] || '';
                if (name && code && name !== code) return `• ${name} (${code})`;
                return `• ${name || code}`;
            });

            const catCommentText = [
                "This data in your company:",
                "----------------------------------------",
                ...(catNamesList.length > 0 ? catNamesList.slice(0, 30) : ['• (No categories found in Acc_Category)']),
                catNamesList.length > 30 ? `...and ${catNamesList.length - 30} more (see Acc_Category sheet)` : ''
            ].filter(Boolean).join('\n');

            const deptCommentText = [
                "This data in your company:",
                "----------------------------------------",
                ...(deptNamesList.length > 0 ? deptNamesList.slice(0, 30) : ['• (No departments found in Acc_Department)']),
                deptNamesList.length > 30 ? `...and ${deptNamesList.length - 30} more (see Acc_Department sheet)` : ''
            ].filter(Boolean).join('\n');

            // 6. First Row: Show actual Category and Department names (No "e.g." text)
            const firstCatName = catList[0] ? (catList[0]['Category Name'] || catList[0]['Category Code']) : '';
            const firstDeptName = deptList[0] ? (deptList[0]['Department Name'] || deptList[0]['Department Code']) : '';

            const firstDataRow = templateCols.map(col => {
                if (col === 'Category') return firstCatName;
                if (col === 'Department') return firstDeptName;
                return '';
            });

            // 25 clean rows for user data entry
            const dataRows = [
                firstDataRow,
                ...Array.from({ length: 25 }, () => templateCols.map(() => ''))
            ];

            const ws = XLSX.utils.aoa_to_sheet([templateCols, ...dataRows]);

            // 7. Attach Comments to ONLY row 0 (Header cell) so only one row has the note, and hidden until cursor hovers
            const catColIdx = templateCols.indexOf('Category');
            const deptColIdx = templateCols.indexOf('Department');
            const totalRows = dataRows.length + 1; // Header + data rows

            if (catColIdx >= 0) {
                const headerCell = XLSX.utils.encode_cell({ r: 0, c: catColIdx });
                if (ws[headerCell]) {
                    ws[headerCell].c = [{ a: 'Accounts System', t: catCommentText, hidden: true }];
                    ws[headerCell].c.hidden = true;
                }
            }
            if (deptColIdx >= 0) {
                const headerCell = XLSX.utils.encode_cell({ r: 0, c: deptColIdx });
                if (ws[headerCell]) {
                    ws[headerCell].c = [{ a: 'Accounts System', t: deptCommentText, hidden: true }];
                    ws[headerCell].c.hidden = true;
                }
            }

            // Style Header Row
            templateCols.forEach((col, index) => {
                const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
                if (ws[cellRef]) {
                    const isCatOrDept = col === 'Category' || col === 'Department';
                    ws[cellRef].s = {
                        fill: { fgColor: { rgb: isCatOrDept ? "1D4ED8" : "1E40AF" } },
                        font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
                        alignment: { vertical: "center", horizontal: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "CBD5E1" } },
                            bottom: { style: "medium", color: { rgb: "1E3A8A" } },
                            left: { style: "thin", color: { rgb: "CBD5E1" } },
                            right: { style: "thin", color: { rgb: "CBD5E1" } }
                        }
                    };
                }
            });

            // Style Data Rows
            for (let r = 1; r < totalRows; r++) {
                templateCols.forEach((col, cIdx) => {
                    const cellRef = XLSX.utils.encode_cell({ r, c: cIdx });
                    if (ws[cellRef]) {
                        const isCatOrDept = col === 'Category' || col === 'Department';
                        ws[cellRef].s = {
                            fill: { fgColor: { rgb: (r === 1 && isCatOrDept) ? "EFF6FF" : (r % 2 === 0 ? "F8FAFC" : "FFFFFF") } },
                            font: { name: "Calibri", sz: 10, bold: r === 1 && isCatOrDept, color: { rgb: (r === 1 && isCatOrDept) ? "1E40AF" : "1E293B" } },
                            alignment: { vertical: "center", horizontal: "left" },
                            border: {
                                top: { style: "thin", color: { rgb: "E2E8F0" } },
                                bottom: { style: "thin", color: { rgb: "E2E8F0" } },
                                left: { style: "thin", color: { rgb: "E2E8F0" } },
                                right: { style: "thin", color: { rgb: "E2E8F0" } }
                            }
                        };
                    }
                });
            }

            ws['!cols'] = templateCols.map(col => ({
                wch: Math.max(col.length + 6, 20)
            }));

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Bulk_GRN_Template");

            // 6. Suggestions Sheet: Side-by-side Acc_Department and Acc_Category for login/active company
            const maxRows = Math.max(deptList.length, catList.length, 1);
            const compLabel = targetCompany ? ` (${targetCompany})` : '';
            const suggestionsAoa = [
                [`DEPARTMENT SUGGESTIONS${compLabel} - Acc_Department`, '', '', `CATEGORY SUGGESTIONS${compLabel} - Acc_Category`, '', ''],
                ['Department Code', 'Department Name', '', 'Category Code', 'Category Name', 'Department Code']
            ];

            for (let i = 0; i < maxRows; i++) {
                const dept = deptList[i];
                const cat = catList[i];
                suggestionsAoa.push([
                    dept ? dept['Department Code'] : (i === 0 && deptList.length === 0 ? '(No departments in Acc_Department)' : ''),
                    dept ? dept['Department Name'] : '',
                    '',
                    cat ? cat['Category Code'] : (i === 0 && catList.length === 0 ? '(No categories in Acc_Category)' : ''),
                    cat ? cat['Category Name'] : '',
                    cat ? cat['Department Code'] : ''
                ]);
            }

            const wsSuggestions = XLSX.utils.aoa_to_sheet(suggestionsAoa);

            const headerStyleDept = {
                fill: { fgColor: { rgb: "0284C7" } },
                font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
                alignment: { vertical: "center", horizontal: "center" }
            };
            const headerStyleCat = {
                fill: { fgColor: { rgb: "4F46E5" } },
                font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
                alignment: { vertical: "center", horizontal: "center" }
            };
            const colHeaderStyle = {
                fill: { fgColor: { rgb: "F1F5F9" } },
                font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "334155" } },
                alignment: { vertical: "center", horizontal: "left" }
            };

            ['A1', 'B1'].forEach(cell => { if (wsSuggestions[cell]) wsSuggestions[cell].s = headerStyleDept; });
            ['D1', 'E1', 'F1'].forEach(cell => { if (wsSuggestions[cell]) wsSuggestions[cell].s = headerStyleCat; });
            ['A2', 'B2', 'D2', 'E2', 'F2'].forEach(cell => { if (wsSuggestions[cell]) wsSuggestions[cell].s = colHeaderStyle; });

            wsSuggestions['!cols'] = [
                { wch: 22 },
                { wch: 32 },
                { wch: 5 },
                { wch: 22 },
                { wch: 32 },
                { wch: 22 }
            ];

            XLSX.utils.book_append_sheet(wb, wsSuggestions, "Suggestions");

            // 7. Dedicated Reference sheets for Acc_Department and Acc_Category
            const wsDept = XLSX.utils.json_to_sheet(deptList.length > 0 ? deptList : [{'Department Code': '', 'Department Name': ''}]);
            wsDept['!cols'] = [{ wch: 22 }, { wch: 35 }];
            XLSX.utils.book_append_sheet(wb, wsDept, "Acc_Department");

            const wsCat = XLSX.utils.json_to_sheet(catList.length > 0 ? catList : [{'Category Code': '', 'Category Name': '', 'Department Code': ''}]);
            wsCat['!cols'] = [{ wch: 22 }, { wch: 35 }, { wch: 22 }];
            XLSX.utils.book_append_sheet(wb, wsCat, "Acc_Category");

            XLSX.writeFile(wb, "Bulk_GRN_Template.xlsx");
            showSuccessToast(`Bulk Template downloaded with ${targetCompany || 'company'} Category & Department suggestions!`);
        } catch (error) {
            console.error("Template download error:", error);
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
                let data = XLSX.utils.sheet_to_json(ws);
                
                // Filter out empty rows or suggestion rows
                data = data.filter(r => {
                    const sc = (r['Supplier Code'] || r['Supplier'] || '').toString().trim();
                    const pc = (r['Product Code'] || r['prodCode'] || r['Item Code'] || '').toString().trim();
                    if (!sc && !pc) return false;
                    return !sc.startsWith('e.g.') && !pc.startsWith('e.g.');
                });

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

                    const pName = row['Product Name'] || row['prodName'] || row['Item Name'] || '';
                    const prod = lookups.products.find(p => p.code?.trim().toUpperCase() === pCode.toUpperCase());
                    
                    const qty = parseFloat(row['Qty'] || row['Quantity'] || 0);
                    const free = parseFloat(row['Free Qty'] || row['Free'] || 0);
                    const cost = parseFloat(row['Purchase Price'] || row['Cost Price'] || row['Cost'] || (prod ? prod.price : 0));
                    const selling = parseFloat(row['Selling Price'] || row['Selling'] || (prod ? prod.sellingPrice : 0));

                    groups[key].products.push({
                        prodCode: pCode,
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

                const parsedGroups = Object.values(groups);
                
                if (parsedGroups.length > 0) {
                    setGroupedGrns(prev => [...prev, ...parsedGroups]);
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
        <TransactionFormWrapper boardName="BulkGRNBoard" icon={FileText}
            isOpen={isOpen}
            onClose={onClose}
            title="Bulk GRN"
            maxWidth="max-w-[700px]"
            footer={
                <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
                    <button onClick={handleClear} className="px-6 h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 text-sm font-black rounded-[3px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none">
                        <RotateCcw size={14} /> CLEAR ALL
                    </button>
                    <div className="flex gap-3">
                        <button onClick={handleSave} disabled={isSaving || isApplying || groupedGrns.length === 0} className="px-6 h-10 bg-slate-600 text-slate-800 dark:text-white text-sm font-black rounded-[3px] shadow-md shadow-slate-100 hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">
                            {isSaving ? <Search className="animate-spin" size={14} /> : <FileDown size={14} />} SAVE ALL ({groupedGrns.length})
                        </button>
                        <button onClick={handleApply} disabled={isSaving || isApplying || groupedGrns.length === 0} className="px-6 h-10 bg-white text-[#2bb744] border-2 border-[#2bb744] hover:bg-green-50 text-sm font-black rounded-[3px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">
                            {isApplying ? <Search className="animate-spin" size={14} /> : <CheckCircle size={14} />} APPLY ALL ({groupedGrns.length})
                        </button>
                    </div>
                </div>
            }
        >
            <input type="file" ref={excelInputRef} onChange={handleExcelUpload} accept=".xlsx, .xls, .csv" className="hidden" />
            <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                <div className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">
                    <div className="text-sm font-bold text-gray-600">
                        Total GRNs to Process: <span className="text-blue-600">{groupedGrns.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowColumnSelector(true)} className="h-8 px-4 bg-white text-emerald-600 border-2 border-emerald-500 text-[10px] font-black rounded-[3px] hover:bg-emerald-50 transition-all flex items-center gap-2 uppercase active:scale-95 shadow-sm">
                            <FileDown size={14} /> BULK TEMPLATE
                        </button>
                        <button onClick={() => excelInputRef.current?.click()} className="h-8 px-4 bg-white text-blue-600 border-2 border-blue-500 text-[10px] font-black rounded-[3px] hover:bg-blue-50 transition-all flex items-center gap-2 uppercase active:scale-95 shadow-sm">
                            <FileUp size={14} /> LOAD BULK EXCEL
                        </button>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-[3px] bg-white shadow-sm flex flex-col min-h-[400px] overflow-hidden">
                    <div className="flex bg-slate-50/80 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center">
                        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">Supplier</div>
                        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">Inv No</div>
                        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">PO No</div>
                        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">Items</div>
                        <div className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Total Amount</div>
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
                                <div key={g.id} className="flex border-b border-gray-200 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors group">
                                    <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-blue-600 font-mono text-[10px]">{g.suppCode}</span>
                                            <span className="truncate">{supplierName}</span>
                                        </div>
                                    </div>
                                    <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">{g.suppInv || '-'}</div>
                                    <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">{g.poNo || '-'}</div>
                                    <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
                                        <span className="px-6 h-10 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-[3px] hover:bg-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-emerald-100">{g.products.length} Items</span>
                                    </div>
                                    <div className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">
                                        {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className="w-12 flex justify-center py-1">
                                        <button onClick={() => removeGroup(g.id)} className="text-red-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-[3px]">
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

            <ColumnSelectionModal
                isOpen={showColumnSelector}
                onClose={() => setShowColumnSelector(false)}
                onDownload={handleTemplateDownload}
            />
        </TransactionFormWrapper>
        </>
    );
};

export default BulkGRNBoard;




