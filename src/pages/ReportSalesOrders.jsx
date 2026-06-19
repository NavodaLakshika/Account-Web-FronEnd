import React, { useEffect, useState } from 'react';
import { salesOrderService } from '../services/salesOrder.service';
import SalesOrderDetailModal from '../components/SalesOrderDetailModal';
import { showErrorToast } from '../utils/toastUtils';
import { getSessionData } from '../utils/session';

const ReportSalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocNo, setSelectedDocNo] = useState(null);

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
        <div className="overflow-x-auto rounded-lg shadow-sm bg-white">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-left text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2">Document No</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">No sales orders found</td>
                </tr>
              ) : (
                orders.map((o, i) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => openDetail(o.docNo)}
                  >
                    <td className="px-4 py-2 font-mono text-blue-600 font-medium">{o.docNo}</td>
                    <td className="px-4 py-2 text-gray-700">{o.date?.split('T')[0]}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${o.status === 'Applied' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {o.status || 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {selectedDocNo && (
        <SalesOrderDetailModal docNo={selectedDocNo} onClose={closeDetail} />
      )}
    </div>
  );
};

export default ReportSalesOrders;
