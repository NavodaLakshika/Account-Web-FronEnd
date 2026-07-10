import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { salesOrderService } from '../services/salesOrder.service';
import SalesOrderDetailModal from '../components/SalesOrderDetailModal';
import { showErrorToast } from '../utils/toastUtils';
import { getSessionData } from '../utils/session';

const ReportSalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocNo, setSelectedDocNo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { companyCode } = getSessionData();
        if (!companyCode) {
          showErrorToast('Company code not found in session');
          return;
        }
        const data = await salesOrderService.searchOrders(companyCode);
        setOrders(data);
      } catch (err) {
        showErrorToast('Failed to load sales orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const openDetail = (docNo) => {
    setSelectedDocNo(docNo);
  };

  const closeDetail = () => {
    setSelectedDocNo(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-['Inter']">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Sales Orders Report</h1>
      {loading ? (
        <div className="text-center text-gray-500">Loading orders...</div>
      ) : (
        <div className="overflow-x-auto rounded-[3px] shadow-sm bg-white">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-left text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2">Document No</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2 text-center">Status</th>
              <th className="text-right px-5 py-3">Action</th></tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">No sales orders found</td>
                </tr>
              ) : (
                orders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((o, i) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => openDetail(o.docNo)}
                  >
                    <td className="px-4 py-2 font-mono text-blue-600 font-medium">{o.docNo}</td>
                    <td className="px-4 py-2 text-gray-700">{o.date?.split('T')[0]}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-[3px] text-xs font-semibold uppercase ${o.status === 'Applied' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {o.status || 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {orders.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white sm:px-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-[12px] text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * rowsPerPage, orders.length)}</span> of <span className="font-medium">{orders.length}</span> results
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
                        Page {currentPage} of {Math.max(1, Math.ceil(orders.length / rowsPerPage))}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(orders.length / rowsPerPage)))}
                        disabled={currentPage === Math.ceil(orders.length / rowsPerPage) || orders.length === 0}
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
      {selectedDocNo && (
        <SalesOrderDetailModal docNo={selectedDocNo} onClose={closeDetail} />
      )}
    </div>
  );
};

export default ReportSalesOrders;
