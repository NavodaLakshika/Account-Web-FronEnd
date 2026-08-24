import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { payBillService } from '../services/payBill.service';
import PaymentDetailModal from '../components/PaymentDetailModal';
import { showErrorToast } from '../utils/toastUtils';
import { getSessionData } from '../utils/session';

const ReportBillPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayDoc, setSelectedPayDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { companyCode } = getSessionData();
        if (!companyCode) {
          showErrorToast('Company code not found in session');
          return;
        }
        const data = await payBillService.getAllPayments(companyCode);
        setPayments(data);
      } catch (err) {
        showErrorToast('Failed to load bill payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const openDetail = (payDoc) => {
    setSelectedPayDoc(payDoc);
  };

  const closeDetail = () => {
    setSelectedPayDoc(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-['Inter']">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Bill Payments Report</h1>
      {loading ? (
        <div className="text-center text-gray-500">Loading payments...</div>
      ) : (
        <div className="overflow-x-auto rounded-[3px] shadow-sm bg-white">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-left text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2">Pay Doc</th>
                <th className="px-4 py-2">Vendor</th>
                <th className="px-4 py-2">Cost Center</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Pay Type</th>
                <th className="px-4 py-2">Pay Date</th>
              <th className="text-right px-5 py-3">Action</th></tr>
            </thead>
            <tbody>
              {payments.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((p) => (
                <tr
                  key={p.payDoc}
                  className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => openDetail(p.payDoc)}
                >
                  <td className="px-4 py-2 font-mono text-blue-600">{p.payDoc}</td>
                  <td className="px-4 py-2">{p.vendorId}</td>
                  <td className="px-4 py-2">
                    {p.costCenterName || p.costCenter || '-'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {parseFloat(p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2">{p.payType}</td>
                  <td className="px-4 py-2">{p.payDate?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white sm:px-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-[12px] text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * rowsPerPage, payments.length)}</span> of <span className="font-medium">{payments.length}</span> results
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border-gray-300 rounded-[3px] text-[12px] h-7 px-2 border focus:outline-none focus:border-[#0077c5]"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft size={16} />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-1.5 text-[12px] font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0">
                        Page {currentPage} of {Math.max(1, Math.ceil(payments.length / rowsPerPage))}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(payments.length / rowsPerPage)))}
                        disabled={currentPage === Math.ceil(payments.length / rowsPerPage) || payments.length === 0}
                        className="relative inline-flex items-center rounded-r-md px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="sr-only">Next</span>
                        <ChevronLeft size={16} className="rotate-180" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {selectedPayDoc && (
        <PaymentDetailModal payDoc={selectedPayDoc} onClose={closeDetail} />
      )}
    </div>
  );
};

export default ReportBillPayments;
