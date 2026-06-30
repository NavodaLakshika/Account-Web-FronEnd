import React, { useEffect, useState } from 'react';
import { payBillService } from '../services/payBill.service';
import PaymentDetailModal from '../components/PaymentDetailModal';
import { showErrorToast } from '../utils/toastUtils';
import { getSessionData } from '../utils/session';

const ReportBillPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayDoc, setSelectedPayDoc] = useState(null);

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
              {payments.map((p) => (
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
        </div>
      )}
      {selectedPayDoc && (
        <PaymentDetailModal payDoc={selectedPayDoc} onClose={closeDetail} />
      )}
    </div>
  );
};

export default ReportBillPayments;
