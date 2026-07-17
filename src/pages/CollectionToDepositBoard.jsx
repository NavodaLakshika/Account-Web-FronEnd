import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, X, RotateCcw, Loader2, Landmark, Calendar, CheckSquare, Square, Filter, Banknote, ListChecks, CheckCircle2, ChevronRight, CornerDownRight, CheckCircle, FileText, Plus } from 'lucide-react';
import { bankingService } from '../services/banking.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import DepartmentProfileBoard from './DepartmentProfileBoard';

// SearchModal removed

const CollectionToDepositBoard = ({ isOpen, onClose, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [lookups, setLookups] = useState({ costCenters: [], paymentModes: [], customers: [], departments: [] });

  const { companyCode, userName } = getSessionData();

  const [formData, setFormData] = useState({
    docNo: '',
    costCenter: '',
    costCenterName: '',
    dateFrom: new Date().toLocaleDateString('en-GB'),
    dateTo: new Date().toLocaleDateString('en-GB'),
    paymentMode: '',
    customerReceipt: false,
    customerId: '',
    customerName: '',
    department: '',
    departmentName: '',
    company: companyCode,
    createUser: userName
  });

  const [collections, setCollections] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState('dateFrom');
  const [showDeptBoard, setShowDeptBoard] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const { companyCode: comp, userName: user } = getSessionData();
      setFormData(prev => ({
        ...prev,
        company: comp,
        createUser: user
      }));
      loadInitialData(comp);
    }
  }, [isOpen]);

  const loadInitialData = async (comp) => {
    try {
      setLoading(true);
      const activeComp = comp || companyCode;
      const lookupRes = await bankingService.getCollectionLookups(activeComp);
      setLookups(lookupRes);
      generateDocNo(activeComp);
    } catch (error) {
      showErrorToast("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const generateDocNo = async (comp) => {
    try {
      const activeComp = comp || companyCode;
      const docRes = await bankingService.generateDocNo('MDPO', activeComp);
      setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
    } catch (e) { }
  };

  const handleFetchCollections = async () => {
    if (!formData.docNo) return showErrorToast("Document Number is required.");
    try {
      setLoading(true);
      const data = await bankingService.getCollections({ ...formData, company: companyCode });
      setCollections(data);
      setSelectedIds([]);
    } catch (error) {
      showErrorToast("Failed to fetch collections records");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === collections.length ? [] : collections.map(c => c.documentNo));
  };

  const totalToDeposit = collections
    .filter(c => selectedIds.includes(c.documentNo))
    .reduce((sum, c) => sum + (c.balance || 0), 0);

  const handleSave = async () => {
    if (selectedIds.length === 0) return showErrorToast("Please select at least one record to deposit.");
    try {
      setLoading(true);
      const selectedItems = collections.filter(c => selectedIds.includes(c.documentNo));
      const result = await bankingService.saveDeposit({ ...formData, items: selectedItems });
      showSuccessToast('Funds successfully moved to deposit state!');
      if (onComplete) onComplete({ items: result.items, totalBalance: result.totalBalance, sourceDocNo: formData.docNo });
      onClose();
    } catch (error) {
      showErrorToast(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData(prev => ({
      ...prev,
      costCenter: '', costCenterName: '', paymentMode: '', customerReceipt: false,
      customerId: '', customerName: '', department: '', departmentName: '',
      dateFrom: new Date().toLocaleDateString('en-GB'),
      dateTo: new Date().toLocaleDateString('en-GB'),
    }));
    setCollections([]);
    setSelectedIds([]);
    generateDocNo();
  };

  const handleDateSelect = (formattedDate) => {
    setFormData(prev => ({ ...prev, [datePickerField]: formattedDate }));
    setShowDatePicker(false);
  };

  return (
    <>
      <style>{`@keyframes toastProgress{0%{width:100%}100%{width:0%}}`}</style>
      <TransactionFormWrapper subtitle="Transaction Management" icon={FileText}
        isOpen={isOpen}
        onClose={onClose}
        title="Collection to Deposit Selection"
        footer={
          <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
            <button
              onClick={handleClear}
              className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> CLEAR
            </button>
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={loading || selectedIds.length === 0}
                className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} CONFIRM
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 overflow-y-auto no-scrollbar">
          <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
            <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">

              {/* Row 1 */}
              <div className="col-span-4">
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Document ID</label>
                <div className="w-full h-10 bg-white border border-gray-300 rounded-[3px] px-3 flex items-center">
                  <span className="text-[13px] font-bold text-blue-600 font-mono">{formData.docNo}</span>
                </div>
              </div>

              <div className="col-span-4">
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date From</label>
                <div className="relative">
                  <input
                    type="text" readOnly
                    value={formData.dateFrom}
                    onClick={() => { setDatePickerField('dateFrom'); setShowDatePicker(true); }}
                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700"
                  />
                  <button onClick={() => { setDatePickerField('dateFrom'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                    <Calendar size={16} />
                  </button>
                </div>
              </div>

              <div className="col-span-4">
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date To</label>
                <div className="relative">
                  <input
                    type="text" readOnly
                    value={formData.dateTo}
                    onClick={() => { setDatePickerField('dateTo'); setShowDatePicker(true); }}
                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700"
                  />
                  <button onClick={() => { setDatePickerField('dateTo'); setShowDatePicker(true); }} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                    <Calendar size={16} />
                  </button>
                </div>
              </div>

              {/* Row 2 */}
              <div className="col-span-4">
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center</label>
                <div className="relative">
                  <select
                    value={formData.costCenter || ''}
                    onChange={(e) => {
                      const sel = lookups.costCenters.find(c => c.code === e.target.value);
                      setFormData({ ...formData, costCenter: sel?.code || '', costCenterName: sel?.name || '' });
                    }}
                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                   style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                  >
                    <option value="">Select cost center...</option>
                    {(lookups.costCenters || []).map((c, i) => (
                      <option key={i} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-span-4">
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Pay Type</label>
                <div className="relative">
                  <select
                    value={formData.paymentMode || ''}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                   style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                  >
                    <option value="">Select pay type...</option>
                    {(lookups.paymentModes || []).map((p, i) => (
                      <option key={i} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-span-4">
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Dept Unit</label>
                <div className="flex gap-2 relative">
                  <select
                    value={formData.department || ''}
                    onChange={(e) => {
                      const sel = lookups.departments.find(d => d.code === e.target.value);
                      setFormData({ ...formData, department: sel?.code || '', departmentName: sel?.name || '' });
                    }}
                    className="flex-1 h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                   style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                  >
                    <option value="">Select department...</option>
                    {(lookups.departments || []).map((d, i) => (
                      <option key={i} value={d.code}>{d.code} - {d.name}</option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={() => setShowDeptBoard(true)} 
                    className="h-10 w-10 flex-shrink-0 bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-[3px] flex items-center justify-center transition-colors relative"
                    title="Create Department"
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* Row 3 */}
              <div className="col-span-8">
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Customer</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" id="chkCustomer" checked={formData.customerReceipt} onChange={e => setFormData({ ...formData, customerReceipt: e.target.checked, customerId: '', customerName: '' })} className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#0285fd]" />
                    <span className="text-[13px] font-medium text-gray-700">Enable Customer Filter</span>
                  </label>
                  <div className={`relative flex-1 ${!formData.customerReceipt ? 'opacity-40 pointer-events-none' : ''}`}>
                    <select
                      value={formData.customerId || ''}
                      onChange={(e) => {
                        const sel = lookups.customers.find(c => c.code === e.target.value);
                        setFormData({ ...formData, customerId: sel?.code || '', customerName: sel?.name || '' });
                      }}
                      className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer text-gray-700 truncate appearance-none"
                     style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                    >
                      <option value="">Select customer...</option>
                      {(lookups.customers || []).map((c, i) => (
                        <option key={i} value={c.code}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-4 flex items-end justify-end gap-2">
                <button
                  onClick={handleFetchCollections}
                  disabled={loading}
                  className="h-10 px-6 bg-[#0285fd] text-white text-[13px] font-semibold rounded-[3px] shadow-sm hover:bg-[#0073ff] transition-all flex items-center gap-2"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Filter size={14} />} LOAD RECORDS
                </button>
              </div>

              {/* Select All Bar */}
              <div className="col-span-12 flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    {selectedIds.length === collections.length && collections.length > 0 ? (
                      <CheckSquare size={18} className="text-[#0285fd]" />
                    ) : (
                      <Square size={18} className="text-gray-400" />
                    )}
                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Select All</span>
                  </div>
                  <span className="text-[11px] text-gray-400">Use filters above to narrow the collection queue</span>
                </div>
                <span className="text-[11px] font-bold text-gray-500">{selectedIds.length} of {collections.length} selected</span>
              </div>
            </div>
          </div>

          {/* Collection Queue Table */}
          <div className="border border-slate-200 rounded-[3px] bg-white flex flex-col min-h-[300px] overflow-hidden">
            <div className="flex bg-slate-50 border-b border-slate-200 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-10 items-center">
              <div className="w-12 px-3 text-center">Sel</div>
              <div className="flex-1 px-4">Document Trace ID</div>
              <div className="w-32 px-4 text-center">Post Date</div>
              <div className="w-24 px-4 text-center">Origin</div>
              <div className="flex-1 px-4">Client / Payer Reference</div>
              <div className="w-36 px-4 text-right">Ledger Value</div>
              <div className="w-36 px-4 text-right text-blue-600">Liquidity Bal</div>
            </div>
            <div className="flex-1 bg-white overflow-y-auto max-h-[350px] divide-y divide-slate-100">
              {collections.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-300 gap-4">
                  <Landmark size={48} className="opacity-20" />
                  <div className="text-[11px] font-bold uppercase tracking-widest">Pending collection queue is empty</div>
                </div>
              ) : collections.map((c) => (
                <div
                  key={c.documentNo}
                  onClick={() => toggleSelect(c.documentNo)}
                  className={`flex text-[12px] hover:bg-gray-50 transition-colors cursor-pointer ${selectedIds.includes(c.documentNo) ? 'bg-blue-50/30' : 'text-slate-700'}`}
                >
                  <div className="w-12 px-3 flex items-center justify-center py-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all ${selectedIds.includes(c.documentNo) ? 'bg-[#0285fd] border-[#0285fd] text-white' : 'border-gray-300 bg-white'}`}>
                      {selectedIds.includes(c.documentNo) && <CheckCircle2 size={10} strokeWidth={4} />}
                    </div>
                  </div>
                  <div className="flex-1 px-4 py-2 text-blue-600 font-mono flex items-center gap-2 font-bold">
                    <CornerDownRight size={12} className="text-gray-300" />
                    {c.documentNo}
                  </div>
                  <div className="w-32 px-4 py-2 text-center text-gray-500 font-mono">{c.date}</div>
                  <div className="w-24 px-4 py-2 text-center">
                    <span className="px-1.5 py-0.5 rounded-[3px] bg-slate-100 text-gray-500 text-[10px] font-bold uppercase">{c.type}</span>
                  </div>
                  <div className="flex-1 px-4 py-2 truncate italic text-gray-500">{c.name || 'INTERNAL RECONCILIATION'}</div>
                  <div className="w-36 px-4 py-2 text-right text-gray-400 font-mono">{c.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <div className="w-36 px-4 py-2 text-right font-bold text-slate-800 font-mono">{c.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Total Box */}
          <div className="bg-white border border-slate-200 rounded-[3px] p-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-gray-700">Selected Entities</span>
                <div className="text-[14px] font-mono font-bold text-gray-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {selectedIds.length} <span className="text-gray-400 font-normal ml-1 text-[10px]">RECORDS</span>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#0285fd] uppercase tracking-widest">Aggregate Liquidity Value</span>
                <div className="text-[18px] font-mono font-bold text-[#0285fd] tracking-tighter">
                  {totalToDeposit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </TransactionFormWrapper>

      {/* Removed old SearchModal */}
      
      <CalendarModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} onDateSelect={handleDateSelect} initialDate={formData[datePickerField]} />
      <DepartmentProfileBoard isOpen={showDeptBoard} onClose={() => { setShowDeptBoard(false); loadInitialData(companyCode); }} />
    </>
  );
};

export default CollectionToDepositBoard;
