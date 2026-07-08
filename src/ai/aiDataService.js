import { customerService } from '../services/customer.service';
import { salesInvoiceService } from '../services/salesInvoice.service';
import { enterBillService } from '../services/enterBill.service';
import { supplierService } from '../services/supplier.service';
import { productService } from '../services/product.service';
import { journalService } from '../services/journal.service';
import { bankingService } from '../services/banking.service';
import { reportService } from '../services/report.service';
import { expensesService } from '../services/expenses.service';
import { salesOrderService } from '../services/salesOrder.service';
import { salesReceiptService } from '../services/salesReceipt.service';
import { receivePaymentService } from '../services/receivePayment.service';
import { quotationService } from '../services/quotation.service';
import { getCompanyCode } from '../utils/session';

const getCompany = () => getCompanyCode();

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.data) return Array.isArray(data.data) ? data.data : [];
  if (data?.records) return Array.isArray(data.records) ? data.records : [];
  if (data?.items) return Array.isArray(data.items) ? data.items : [];
  if (data?.list) return Array.isArray(data.list) ? data.list : [];
  return [];
};

export const aiDataService = {
  async getCustomers(searchQuery) {
    try {
      let data;
      if (searchQuery) {
        data = await customerService.search({ query: searchQuery });
      } else {
        data = await customerService.getAll();
      }
      const customers = normalizeArray(data);
      return customers.slice(0, 25).map(c => ({
        code: c.code || c.Code || c.customer_Code || c.CustomerCode || '',
        name: c.name || c.Name || c.customer_Name || c.CustomerName || '',
        phone: c.phone || c.Phone || c.phone_No || '',
        email: c.email || c.Email || '',
        balance: c.balance || c.Balance || c.outstanding || c.Outstanding || 0
      }));
    } catch { return []; }
  },

  async getCustomerDetail(code) {
    try {
      const data = await customerService.getByCode(code);
      return data;
    } catch { return null; }
  },

  async getInvoices(searchQuery) {
    try {
      const company = getCompany();
      if (!company) return [];
      const data = await salesInvoiceService.search(company);
      const invoices = normalizeArray(data);
      let filtered = invoices;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = invoices.filter(inv => 
          (inv.customer || inv.Customer || inv.customer_Name || '').toLowerCase().includes(q) ||
          (inv.docNo || inv.DocNo || inv.document_No || '').toLowerCase().includes(q)
        );
      }
      return filtered.slice(0, 20).map(inv => ({
        docNo: inv.docNo || inv.DocNo || inv.document_No || '',
        customer: inv.customer || inv.Customer || inv.customer_Name || '',
        date: inv.date || inv.Date || inv.invoice_Date || '',
        amount: inv.amount || inv.Amount || inv.total_Amount || inv.Total || 0,
        status: inv.status || inv.Status || 'Posted'
      }));
    } catch { return []; }
  },

  async getInvoiceDetail(docNo) {
    try {
      const company = getCompany();
      if (!company) return null;
      return await salesInvoiceService.getInvoice(docNo, company);
    } catch { return null; }
  },

  async getSuppliers(searchQuery) {
    try {
      let data;
      if (searchQuery) {
        data = await supplierService.search({ query: searchQuery });
      } else {
        data = await supplierService.getAll();
      }
      const suppliers = normalizeArray(data);
      return suppliers.slice(0, 25).map(s => ({
        code: s.code || s.Code || s.supplier_Code || '',
        name: s.name || s.Name || s.supplier_Name || '',
        phone: s.phone || s.Phone || '',
        email: s.email || s.Email || ''
      }));
    } catch { return []; }
  },

  async getBills(searchQuery) {
    try {
      const company = getCompany();
      if (!company) return [];
      const data = await enterBillService.searchBills(searchQuery || '', company);
      const bills = normalizeArray(data);
      return bills.slice(0, 20).map(b => ({
        docNo: b.docNo || b.DocNo || b.bill_No || '',
        supplier: b.supplier || b.Supplier || b.supplier_Name || '',
        date: b.date || b.Date || b.bill_Date || '',
        amount: b.amount || b.Amount || b.total_Amount || b.Total || 0,
        dueDate: b.dueDate || b.DueDate || b.due_Date || ''
      }));
    } catch { return []; }
  },

  async getProducts(searchQuery) {
    try {
      const company = getCompany();
      if (!company) return [];
      const data = await productService.search(company, searchQuery || '');
      const products = normalizeArray(data);
      return products.slice(0, 25).map(p => ({
        code: p.code || p.Code || p.product_Code || '',
        name: p.name || p.Name || p.product_Name || '',
        price: p.price || p.Price || p.sale_Price || p.SalePrice || 0,
        cost: p.cost || p.Cost || p.purchase_Price || 0,
        stock: p.stock || p.Stock || p.stock_Balance || 0
      }));
    } catch { return []; }
  },

  async getProductStock(code) {
    try {
      const company = getCompany();
      if (!company) return null;
      return await productService.getStock(code, company);
    } catch { return null; }
  },

  async getExpensesSummary() {
    try {
      const company = getCompany();
      if (!company) return null;
      return await expensesService.getDashboardData(company, {});
    } catch { return null; }
  },

  async getIncomeSummary() {
    try {
      const company = getCompany();
      if (!company) return null;
      return await expensesService.getIncomeSummary(company);
    } catch { return null; }
  },

  async searchEntity(type, query) {
    try {
      const company = getCompany();
      if (!company) return [];
      const q = query || '';
      switch (type) {
        case 'customer':
          return await customerService.search({ query: q });
        case 'supplier':
          return await supplierService.search({ query: q });
        case 'invoice':
          return normalizeArray(await salesInvoiceService.search(company));
        case 'bill':
          return normalizeArray(await enterBillService.searchBills(q, company));
        default:
          return [];
      }
    } catch { return []; }
  },

  async findInSystem(query) {
    const results = {};
    try {
      const [customers, suppliers, products, invoices, bills] = await Promise.allSettled([
        this.getCustomers(query),
        this.getSuppliers(query),
        this.getProducts(query),
        this.getInvoices(query),
        this.getBills(query)
      ]);
      if (customers.value?.length) results.customers = customers.value;
      if (suppliers.value?.length) results.suppliers = suppliers.value;
      if (products.value?.length) results.products = products.value;
      if (invoices.value?.length) results.invoices = invoices.value;
      if (bills.value?.length) results.bills = bills.value;
    } catch {}
    return results;
  },

  async getSummary() {
    try {
      const [customers, suppliers, products, invoices, bills] = await Promise.allSettled([
        this.getCustomers(),
        this.getSuppliers(),
        this.getProducts(),
        this.getInvoices(),
        this.getBills()
      ]);
      return {
        totalCustomers: customers.value?.length || 0,
        totalSuppliers: suppliers.value?.length || 0,
        totalProducts: products.value?.length || 0,
        totalInvoices: invoices.value?.length || 0,
        totalBills: bills.value?.length || 0,
      };
    } catch { return {}; }
  }
};
