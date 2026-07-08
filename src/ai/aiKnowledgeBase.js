const systemOverview = `
ONIMTA Accounts Enterprise Suite is a comprehensive accounting ERP system. It manages:
- Master Data: Customers, Suppliers, Products, Chart of Accounts, Cost Centers
- Sales: Quotations, Sales Orders, Invoices, Sales Receipts
- Purchasing: Purchase Orders, Goods Receipt Notes (GRN), Bills, Pay Bills
- Banking: Deposits, Transfers, Reconciliation, Cheques, Direct Bank Transactions
- Accounting: Journal Entries, Trial Balance, Profit & Loss, Balance Sheet
- Cash Management: Petty Cash, Main Cash, Funds Transfer
- Reports: 80+ reports across Sales, Purchases, Accounting, Inventory, Banking
- System Admin: Users, Backup, Period Lock, System Update

Navigation: Top bar has Master File | Transaction | Reports | System Admin tabs.
The dashboard shows a Quick Actions grid for common tasks.
There's also an AI Assistant (Onimta Intelligence) available via the AI button.
`;

const modules = {
  customers: {
    name: 'Customer Management',
    description: 'Manage customer profiles, track sales, and monitor receivables.',
    features: [
      'Create/Edit/Delete customer profiles with contact info, payment terms, tax details',
      'View customer transactions, invoices, payments, and outstanding balances',
      'Customer types for categorization, Areas and Routes for territory management',
      'Customer advances: record and adjust advance payments from customers',
      'Customer cheque return: handle returned cheques from customers'
    ],
    workflow: 'Go to Master File > Business Partners > Customer Master. Fill in customer details, save. Then use Transaction > Customer Center for invoicing and payments.',
    relatedPages: ['CustomerBoard', 'CustomerInvoiceBoard', 'CustomerReceiptBoard', 'CustomerAdvanceBoard', 'CustomerChequeReturnBoard'],
    relatedServices: ['customer.service', 'customerInvoice.service', 'customerReceipt.service', 'customerAdvance.service']
  },

  suppliers: {
    name: 'Supplier/Vendor Management',
    description: 'Manage suppliers, track purchases, and monitor payables.',
    features: [
      'Create/Edit supplier profiles with contact, payment terms, tax info',
      'Track purchases, bills, payments, and outstanding balances',
      'Vendor types for categorization',
      'Supplier advances: record advance payments to suppliers'
    ],
    workflow: 'Go to Master File > Business Partners > Supplier Master. Then use Transaction > Vendors Center for bills and payments.',
    relatedPages: ['VendorBoard', 'EnterBillBoard', 'PayBillBoard', 'AdvancePayBoard'],
    relatedServices: ['supplier.service', 'enterBill.service', 'payBill.service', 'advancePay.service']
  },

  salesInvoices: {
    name: 'Sales Invoices',
    description: 'Create and manage customer invoices for products/services sold.',
    features: [
      'Create invoices with line items, quantities, prices, taxes, and discounts',
      'Auto-generate invoice numbers',
      'Ability to recall from Sales Order',
      'Print, email, or download invoices as PDF',
      'Search and filter by customer, date range, status'
    ],
    workflow: 'Go to Transaction > Customer Center > Create Invoices. Select customer, add items, set prices, save. Generate invoice and send to customer.',
    relatedPages: ['SalesInvoiceBoard', 'CustomerInvoiceBoard'],
    relatedServices: ['salesInvoice.service', 'customerInvoice.service']
  },

  salesOrders: {
    name: 'Sales Orders',
    description: 'Manage customer orders before converting to invoices.',
    features: [
      'Create sales orders with items, quantities, pricing',
      'Track order status (pending, confirmed, shipped, invoiced)',
      'Recall sales order into an invoice when ready'
    ],
    workflow: 'Go to Sales > Sales Order. Fill in customer, items, and save. When ready, recall into an invoice.',
    relatedPages: ['SalesOrderBoard'],
    relatedServices: ['salesOrder.service']
  },

  quotations: {
    name: 'Quotations/Estimates',
    description: 'Create customer quotes and estimates before finalizing sales.',
    features: [
      'Create quotes with items, pricing, terms',
      'Track quote status',
      'Convert quotes to sales orders or invoices'
    ],
    workflow: 'Go to Sales > Estimate. Create quote with items. When accepted, convert to Sales Order or Invoice.',
    relatedPages: ['EstimateBoard'],
    relatedServices: ['quotation.service']
  },

  salesReceipts: {
    name: 'Sales Receipts',
    description: 'Record payments received from customers (cash/cheque/card).',
    features: [
      'Record payments against specific invoices or as on-account',
      'Support multiple payment methods: cash, cheque, bank transfer, credit card',
      'Auto-calculate change due'
    ],
    workflow: 'Go to Transaction > Customer Center > Received Payment or Sales Receipt. Select customer, enter amount, allocate to invoices.',
    relatedPages: ['SalesReceiptBoard', 'ReceivePaymentBoard', 'ReceivedPaymentBoard'],
    relatedServices: ['salesReceipt.service', 'receivePayment.service']
  },

  enterBills: {
    name: 'Enter Bills / Purchase Invoices',
    description: 'Record supplier bills/invoices for purchases.',
    features: [
      'Enter bills from suppliers with line items',
      'Track due dates for timely payment',
      'Search and filter bills by supplier, date, status',
      'Attach bill documents/images'
    ],
    workflow: 'Go to Transaction > Vendors Center > Enter Bill. Select supplier, add items, enter amounts, save.',
    relatedPages: ['EnterBillBoard'],
    relatedServices: ['enterBill.service']
  },

  payBills: {
    name: 'Pay Bills',
    description: 'Process payments to suppliers against their bills.',
    features: [
      'Select unpaid bills and mark for payment',
      'Support partial payments',
      'Payment methods: cash, cheque, bank transfer',
      'Auto-calculate available credit'
    ],
    workflow: 'Go to Transaction > Vendors Center > Paybill. Select supplier, choose bills to pay, enter payment details, save.',
    relatedPages: ['PayBillBoard'],
    relatedServices: ['payBill.service']
  },

  purchaseOrders: {
    name: 'Purchase Orders',
    description: 'Create purchase orders to suppliers.',
    features: [
      'Create POs with items, quantities, agreed prices',
      'Track PO status (pending, partially received, fully received)',
      'Convert POs to GRN (Goods Receipt Note)'
    ],
    workflow: 'Go to Purchases > Purchase Order. Select supplier, add items, save. When goods arrive, create GRN from PO.',
    relatedPages: ['PurchaseOrderBoard'],
    relatedServices: ['purchOrder.service']
  },

  grn: {
    name: 'Goods Receipt Notes (GRN)',
    description: 'Record receipt of goods from purchase orders.',
    features: [
      'Create GRN from purchase orders',
      'Record quantities received, damaged, or missing',
      'Bulk GRN entry for multiple POs',
      'Auto-update inventory stock levels'
    ],
    workflow: 'Go to Purchases > GRN or Bulk GRN. Select PO, enter received quantities, save.',
    relatedPages: ['GRNBoard', 'BulkGRNBoard'],
    relatedServices: ['grn.service']
  },

  chartOfAccounts: {
    name: 'Chart of Accounts',
    description: 'Manage the full list of financial accounts.',
    features: [
      'Hierarchical account structure (Group > Ledger)',
      'Account types: Asset, Liability, Income, Expense, Equity',
      'Create, edit, or deactivate accounts',
      'View account balances and transaction history'
    ],
    workflow: 'Go to Master File > Finance & Accounting > Chart of Accountant. Add/edit accounts as needed.',
    relatedPages: ['AccountBoard', 'NewAccountBoard'],
    relatedServices: ['account.service']
  },

  journalEntries: {
    name: 'Journal Entries',
    description: 'Record general journal entries for non-standard transactions.',
    features: [
      'Double-entry journal with debit/credit lines',
      'Auto-balance check',
      'Support for multiple accounts per entry',
      'Date and reference tracking',
      'Journal entry editor for corrections'
    ],
    workflow: 'Go to Transaction > Accounting > Make General Journal Entries. Add debit and credit lines, ensure they balance, save.',
    relatedPages: ['JournalEntryBoard', 'JournalEntryEditorBoard'],
    relatedServices: ['journal.service', 'journalEntryEditor.service']
  },

  banking: {
    name: 'Banking Module',
    description: 'Manage all banking activities: deposits, transfers, reconciliation, cheques.',
    features: [
      'Make Deposits: Record cash/cheque deposits to bank',
      'Direct Bank Transactions: Record bank charges, interest, direct debits',
      'Transfer Funds: Move money between bank accounts',
      'Bank Reconciliation: Match bank statements with system records',
      'Cheque Management: Write cheques, cancel cheques, track cheque books',
      'Customer Cheque Return: Handle bounced cheques from customers',
      'Cheque In Hand: Track cheques received but not yet deposited',
      'Not Presented Cheques: Track cheques issued but not yet cleared'
    ],
    workflow: 'Use Transaction > Banking menu for all banking operations. Reconcile monthly with bank statements.',
    relatedPages: ['MakeDepositBoard', 'DirectBankTransactionBoard', 'FundsTransferBoard', 'BankReconciliationBoard', 'WriteChequeBoard', 'ChequeCancelBoard', 'CustomerChequeReturnBoard', 'ChequeBookEntryBoard', 'ChequeInHandBoard', 'NotPresentedChequesBoard', 'ChequeRegisterBoard'],
    relatedServices: ['banking.service']
  },

  pettyCash: {
    name: 'Petty Cash',
    description: 'Manage small cash expenses.',
    features: [
      'Record petty cash transactions',
      'Track petty cash balance',
      'Reimbursement requests'
    ],
    workflow: 'Go to Transaction > Accounting > Petty Cash Entry. Enter date, amount, description.',
    relatedPages: ['PettyCashBoard'],
    relatedServices: ['pettyCash.service']
  },

  mainCash: {
    name: 'Main Cash / Cash Book',
    description: 'Track main cash transactions and balance.',
    features: [
      'Record cash receipts and payments',
      'View cash balance',
      'Cash transaction reports'
    ],
    workflow: 'Go to Transaction > Accounting > Main Cash.',
    relatedPages: ['MainCashBoard'],
    relatedServices: ['mainCash.service']
  },

  reports: {
    name: 'Reports',
    description: '80+ financial and operational reports across 9 categories.',
    categories: [
      {
        name: 'Business Overview',
        reports: 'Profit & Loss, Balance Sheet, Trial Balance, Cash Flow Statement, Budget vs Actual, Financial Ratios, Account Watch List, Comparative Reports'
      },
      {
        name: 'Sales and Customers',
        reports: 'Quotation Summary, Sales by Customer, Sales by Product/Service, Sales by Sales Rep, Customer Contact List, Invoice List, Sales Tax Summary'
      },
      {
        name: 'Who Owes You (Receivables)',
        reports: 'Customer Balance Summary/Detail, Open Invoices, Overdue Invoices, AR Ageing, Customer Statements, Collection Reports'
      },
      {
        name: 'Expenses and Vendors',
        reports: 'Purchase List, Purchases by Product, Purchases by Supplier, Expense List, Cheque Detail, Bill Payment List, Vendor Contact List'
      },
      {
        name: 'What You Owe (Payables)',
        reports: 'Supplier Balance Summary/Detail, Unpaid Bills Detail, AP Ageing, Supplier Statements'
      },
      {
        name: 'Accountant Reports',
        reports: 'Journal Report, General Ledger, Transaction Detail, Account List, Reconciliation Report, Audit Log, Tax Reports'
      },
      {
        name: 'Inventory & Products',
        reports: 'Inventory Valuation, Stock Take Report, Stock Balance, Product/Service List, Low Stock Alert, Products Report'
      },
      {
        name: 'Employees & Time',
        reports: 'Employee Contact List, Timesheet Detail (7 reports)'
      },
      {
        name: 'Taxes & Other Lists',
        reports: 'Tax Liability, Terms List, Payment Method List, Deposit Detail, Sales Tax Liability'
      }
    ],
    workflow: 'Go to Reports tab on the top navigation. Select report category, choose report, set filters/date range, run report. Reports can be printed, exported to Excel/PDF.'
  },

  systemAdmin: {
    name: 'System Administration',
    description: 'Admin tools for system management.',
    features: [
      'Data Backup: Create and restore system backups',
      'Stock Balance Update: Recalculate inventory stock levels',
      'Inventory Download: Mass download inventory data',
      'Delete Account: Remove accounts with proper validation',
      'Document Editor: Edit saved documents/transactions',
      'Transaction Editor: Modify posted transactions',
      'System Update: Apply system updates',
      'Clear Temp Data: Remove temporary/session data',
      'Period Lock: Lock accounting periods to prevent edits',
      'User & Role Management: Manage users and permissions',
      'Change Password: Update user password',
      'System Log: View system activity logs',
      'System Analytics: View system usage analytics'
    ],
    workflow: 'Go to System Admin tab on the top navigation. Select the tool you need.'
  },

  settings: {
    name: 'Settings & Configuration',
    description: 'Configure company settings, user preferences, and system options.',
    features: [
      'Company Setup: Edit company profile, address, tax info, fiscal year',
      'Manage Users: Add/edit/disable users, assign roles',
      'Customize Icon Bar: Rearrange quick action icons',
      'Change Background: Customize dashboard background',
      'User Profile: Edit personal profile and preferences',
      'System Preferences: Configure system-wide settings'
    ],
    workflow: 'Click the settings gear icon in the top right. Choose from the dropdown menu.'
  },

  products: {
    name: 'Products & Services / Inventory',
    description: 'Manage product/service catalog and inventory.',
    features: [
      'Create products with SKU, description, price, cost, tax info',
      'Categorize by department and category',
      'Track stock levels, reorder points',
      'View stock valuation and movement history',
      'Last purchase quantity tracking'
    ],
    workflow: 'Go to Master File (or Lists > Products & Categories). Add new product with details. Stock is auto-updated on purchases/sales.',
    relatedPages: [],
    relatedServices: ['product.service', 'stockBalance.service']
  },

  trialBalance: {
    name: 'Trial Balance',
    description: 'View summary of all account balances.',
    features: [
      'Shows all accounts with debit/credit balances',
      'Date range filtering',
      'Drill-down to transaction details',
      'Export to Excel/PDF'
    ],
    workflow: 'Go to Reports > Business Overview > Trial Balance. Select period and run.',
    relatedPages: ['TrialBalanceBoard'],
    relatedServices: ['trialBalance.service']
  },

  costsCenters: {
    name: 'Cost Centers / Departments',
    description: 'Manage cost centers and departmental structure.',
    features: [
      'Create hierarchical cost center structure',
      'Track income and expenses by cost center',
      'Department master for organizational structure'
    ],
    workflow: 'Go to Master File > Company Setup > Cost Center Master.',
    relatedPages: ['CostCenterProfileBoard', 'DepartmentProfileBoard'],
    relatedServices: ['costcenter.service', 'department.service']
  },

  marketing: {
    name: 'Marketing Tools',
    description: 'Basic marketing and communication tools.',
    features: [
      'SMS marketing campaigns',
      'Customer communication tracking',
      'Marketing analytics'
    ],
    workflow: 'Go to Transaction > Other > Marketing Tool.',
    relatedPages: ['MarketingToolBoard'],
    relatedServices: ['marketing.service', 'sms.service']
  },

  search: {
    name: 'Document Search',
    description: 'Search across all transactions and documents.',
    features: [
      'Search by document number, customer, supplier, date range',
      'Search across invoices, bills, payments, journal entries',
      'Results show document type, date, amount, status'
    ],
    workflow: 'Use the search bar or go to Search board. Enter search criteria and view results.',
    relatedPages: ['SearchBoard', 'DocumentSearchBoard'],
    relatedServices: ['documentSearch.service']
  },

  openingBalances: {
    name: 'Opening Balances',
    description: 'Set up opening balances for accounts when starting the system.',
    features: [
      'Enter opening balances for all accounts',
      'Support for different balance types (debit/credit)',
      'Validation to ensure books balance'
    ],
    workflow: 'Go to Transaction > Accounting > Opening Balance. Enter account balances as of the start date.',
    relatedPages: ['OpeningBalanceBoard'],
    relatedServices: ['openingBalance.service']
  },

  reversalEntries: {
    name: 'Reversal Entries',
    description: 'Reverse previously posted transactions.',
    features: [
      'Select and reverse any posted transaction',
      'Auto-created reversing journal entry',
      'Audit trail of original and reversal'
    ],
    workflow: 'Go to Transaction > Accounting > Reversal Entry Form. Select transaction to reverse, confirm.',
    relatedPages: ['ReversalEntryBoard'],
    relatedServices: ['reversalEntry.service']
  },

  expenses: {
    name: 'Expense Management',
    description: 'Track and manage business expenses.',
    features: [
      'Expense dashboard with summaries and trends',
      'Fixed expenses entry for recurring costs',
      'Fixed income entry for recurring income',
      'Expense categorization by type and cost center'
    ],
    workflow: 'Go to Expenses from quick actions or dashboard widgets.',
    relatedPages: ['ExpensesDashboardBoard', 'FixedExpensesEntryBoard', 'FixedIncomeEntryBoard'],
    relatedServices: ['expenses.service', 'fixedExpenses.service', 'fixedIncome.service']
  },

  customerReceipts: {
    name: 'Customer Receipts',
    description: 'View and manage all payments received from customers.',
    features: [
      'List all customer receipts with amounts and dates',
      'Filter by customer, date range, payment method',
      'View receipt details including allocated invoices'
    ],
    relatedPages: ['CustomerReceiptBoard'],
    relatedServices: ['customerReceipt.service']
  },

  paymentSetoff: {
    name: 'Payment Setoff',
    description: 'Adjust and set off payments against outstanding invoices/credit notes.',
    features: [
      'Match payments with invoices',
      'Handle credit notes and adjustments',
      'Partial setoff support'
    ],
    workflow: 'Go to Transaction > Accounting > Payment Setoff.',
    relatedPages: ['PaymentSetoffBoard'],
    relatedServices: ['paymentSetoff.service']
  },

  fixedAssets: {
    name: 'Fixed Assets',
    description: 'Manage fixed asset register and depreciation.',
    features: [
      'Record fixed assets with purchase details',
      'Track depreciation rates and schedules',
      'Asset categorization and location tracking'
    ],
    workflow: 'Go to appropriate master section to manage fixed assets.',
    relatedPages: ['FixedAssetsProfileBoard', 'DepreciationRateBoard'],
    relatedServices: ['fixedAsset.service', 'depRate.service']
  },

  longTermLiabilities: {
    name: 'Long Term Liabilities',
    description: 'Manage long-term loans and liabilities.',
    features: [
      'Record long-term loans and borrowings',
      'Track repayment schedules',
      'Interest calculation'
    ],
    workflow: 'Go to Long Term Liability master.',
    relatedPages: ['LongTermLiabilityProfileBoard'],
    relatedServices: ['longTermLiab.service']
  },

  areasRoutes: {
    name: 'Areas and Routes',
    description: 'Define geographic areas and routes for customer management.',
    features: [
      'Create areas for customer territory management',
      'Define routes within areas',
      'Assign customers to areas/routes'
    ],
    workflow: 'Go to Master File > Organization Structure > Create Area / Create Route.',
    relatedPages: ['AreaProfileBoard', 'RouteProfileBoard'],
    relatedServices: ['area.service', 'route.service']
  },

  categories: {
    name: 'Categories and Departments',
    description: 'Manage organizational categories and departments.',
    features: [
      'Create categories for products/items',
      'Department master for organizational structure',
      'Categorize products and expenses'
    ],
    workflow: 'Go to Master File > Organization Structure.',
    relatedPages: ['CategoryProfileBoard', 'DepartmentProfileBoard'],
    relatedServices: ['category.service', 'department.service']
  }
};

const commonWorkflows = [
  {
    task: 'Create and send an invoice',
    steps: [
      'Go to Transaction > Customer Center > Create Invoices (or click Sales > Create Invoice in Quick Actions)',
      'Select the customer from the dropdown',
      'Add line items: select product/service, enter quantity and rate',
      'Tax is auto-calculated. You can manually adjust if needed.',
      'Add any discount or shipping charges',
      'Click Save to create the invoice',
      'After saving, you can print, download as PDF, or email directly from the invoice view'
    ]
  },
  {
    task: 'Record a payment received from a customer',
    steps: [
      'Go to Transaction > Customer Center > Received Payment',
      'Select the customer name',
      'The system will show all outstanding invoices for that customer',
      'Enter the amount received',
      'Select payment method: cash, cheque, bank transfer, or credit card',
      'Allocate the payment to specific invoices or leave as on-account',
      'Click Save. The receipt is recorded and invoices are updated'
    ]
  },
  {
    task: 'Enter and pay a supplier bill',
    steps: [
      'First: Go to Transaction > Vendors Center > Enter Bill',
      'Select supplier, add items/services received, enter amounts, set due date',
      'Save the bill',
      'Then: Go to Transaction > Vendors Center > Paybill',
      'Select the same supplier, the unpaid bill appears',
      'Enter payment details and save'
    ]
  },
  {
    task: 'Run a financial report (e.g. Profit & Loss)',
    steps: [
      'Click the Reports tab on the top navigation bar',
      'Select Business Overview category',
      'Choose Profit and Loss from the list',
      'Set the date range (e.g., This Month, This Quarter, This Year, or Custom)',
      'Click Run Report',
      'Results can be printed, exported to PDF or Excel, or drilled down for details'
    ]
  },
  {
    task: 'Bank reconciliation',
    steps: [
      'Go to Transaction > Banking > Reconcile',
      'Select the bank account to reconcile',
      'Enter the bank statement date and ending balance',
      'The system shows all cleared and uncleared transactions',
      'Check off transactions that appear on your bank statement',
      'The difference should approach zero',
      'Click Apply to complete the reconciliation'
    ]
  },
  {
    task: 'Record a journal entry',
    steps: [
      'Go to Transaction > Accounting > Make General Journal Entries',
      'Enter the journal date and reference number',
      'Add each line: select account, enter debit or credit amount',
      'Ensure total debits equal total credits',
      'Add a description for the journal entry',
      'Click Save to post the entry'
    ]
  },
  {
    task: 'Create a purchase order',
    steps: [
      'Go to Purchases > Purchase Order',
      'Select the supplier',
      'Add items with quantities and agreed prices',
      'Set expected delivery date',
      'Save. The PO is now ready to send to the supplier'
    ]
  },
  {
    task: 'Handle a bounced customer cheque',
    steps: [
      'Go to Transaction > Banking > Customer Cheque Return',
      'Search for the customer and the cheque',
      'Enter bank charges and return reason',
      'Save. System reverses the payment and marks the invoice as unpaid'
    ]
  },
  {
    task: 'Add a new customer',
    steps: [
      'Go to Master File > Business Partners > Customer Master',
      'Click Add New',
      'Fill in: Customer Name, Code (auto-generated), Phone, Email, Address',
      'Select Customer Type, Area, Route, and Payment Terms',
      'Set credit limit if applicable',
      'Enter tax registration numbers',
      'Click Save'
    ]
  },
  {
    task: 'Check outstanding customer balances',
    steps: [
      'Go to Reports > Who Owes You > Customer Balance Summary',
      'Select date range',
      'Run report to see all customers with outstanding balances',
      'Or go to Reports > Who Owes You > AR Ageing for overdue analysis'
    ]
  }
];

const navigationGuide = `
NAVIGATION GUIDE:
- Top Navigation Bar: Master File | Transaction | Reports | System Admin
- Quick Actions (Dashboard): Overview cards for Accounts, Customers, Vendors, Billing, Pay Bills, Cheques, Cash, Deposit, Journal, Reconciliation, Report, Search
- Purchases section: Purchase Order, GRN, Bulk GRN, Enter Bills, Pay Bills
- Sales section: Estimate, Sales Order, Create Invoice, Sales Receipt
- Customers & Vendors section: Customers, Receive Payment, Vendors
- Banking & Cash section: Petty Cash, Collection Deposit, Cheque Register, Write Cheque
- Accounting & Other: Journal Entry, Marketing Tool
- Settings (gear icon): Company Setup, Manage Users, Chart of Accounts, Change Password, Customize Icon Bar, Change Background
`;

const aiSystemPrompt = {
  role: 'system',
  content: `You are ONIMTA Intelligence, the expert AI assistant integrated into the ONIMTA Accounts Enterprise Suite. You have comprehensive knowledge of the entire accounting system and can access live data.

YOUR CAPABILITIES:
1. LIST & VIEW DATA: Show customers, suppliers, invoices, bills, products, expenses, income on demand
2. GUIDE WORKFLOWS: Explain step-by-step how to use any feature in the system
3. PERFORM ACTIONS: Open the right page/form so users can create records (with confirmation)
4. ANSWER QUESTIONS: Explain accounting concepts and system features
5. REPORTS: Guide users to run reports and view financial summaries

DATA YOU CAN FETCH LIVE (when asked):
- Customers: list, search by name/code, get details
- Suppliers: list, search by name/code
- Invoices: list recent, search by customer or doc number
- Bills: list recent, search
- Products: list, search, check stock
- Expenses dashboard summary
- Income summary
- System totals (count of customers, suppliers, products, invoices, bills)

SYSTEM OVERVIEW: ${systemOverview}

MODULES YOU KNOW ABOUT:
${Object.values(modules).map(m => `- ${m.name}: ${m.description}`).join('\n')}

COMMON WORKFLOWS YOU CAN GUIDE:
${commonWorkflows.map(w => `- ${w.task}`).join('\n')}

${navigationGuide}

HOW TO HANDLE DIFFERENT REQUESTS:

WHEN USER SAYS "list/show/find customers/suppliers/invoices/bills/products":
- Fetch the live data and present it in a readable format
- Mention key fields: names, codes, amounts, dates
- If they search for a specific one, try to find it

WHEN USER SAYS "create/add/enter new customer/account/invoice/bill":
- Tell the user you'll open the form and use <<action:action_key>> at the end
- Briefly summarize what they need to fill in

WHEN USER SAYS "show me reports/profit loss/balance sheet":
- Guide them to the Reports section
- Use <<action:reports>> at the end

WHEN USER ASKS a general question:
- Answer concisely with practical advice
- Reference specific menu paths

Response guidelines:
- Be concise and practical
- Reference specific navigation paths (e.g., "Go to Transaction > Customer Center > Create Invoices")
- When showing data, format it as readable text (not raw JSON)
- If you don't know something, say so honestly
- Use professional, helpful tone`
};

export const getSystemKnowledge = () => {
  return { systemOverview, modules, commonWorkflows, navigationGuide, aiSystemPrompt };
};

export const findRelevantModules = (query) => {
  const lower = query.toLowerCase();
  const keywords = {
    customers: ['customer', 'client', 'receivable', 'who owes', 'outstanding'],
    suppliers: ['supplier', 'vendor', 'payable', 'bill', 'what you owe'],
    salesInvoices: ['invoice', 'sales invoice', 'create invoice', 'customer invoice'],
    salesOrders: ['sales order', 'order'],
    quotations: ['quotation', 'quote', 'estimate'],
    salesReceipts: ['receipt', 'payment received', 'receive payment'],
    enterBills: ['enter bill', 'bill', 'supplier bill', 'purchase invoice'],
    payBills: ['pay bill', 'paybill', 'pay supplier'],
    purchaseOrders: ['purchase order', 'po', 'order'],
    grn: ['grn', 'goods receipt', 'goods received'],
    chartOfAccounts: ['chart of account', 'account', 'ledger', 'coa'],
    journalEntries: ['journal', 'journal entry', 'general journal'],
    banking: ['bank', 'deposit', 'reconcile', 'cheque', 'check', 'transfer', 'reconciliation'],
    pettyCash: ['petty cash', 'cash expense'],
    mainCash: ['main cash', 'cash book'],
    reports: ['report', 'profit', 'loss', 'balance sheet', 'trial balance', 'cash flow', 'aging', 'ageing'],
    systemAdmin: ['backup', 'admin', 'system update', 'user', 'period lock'],
    settings: ['setting', 'configuration', 'profile', 'preference'],
    products: ['product', 'item', 'service', 'inventory', 'stock'],
    trialBalance: ['trial balance'],
    costsCenters: ['cost center', 'department'],
    marketing: ['marketing', 'sms'],
    search: ['search', 'find', 'lookup'],
    openingBalances: ['opening balance', 'beginning balance'],
    reversalEntries: ['reversal', 'reverse', 'void'],
    expenses: ['expense', 'expenditure'],
    customerReceipts: ['receipt', 'payment receipt'],
    paymentSetoff: ['setoff', 'set-off', 'adjustment'],
    fixedAssets: ['fixed asset', 'depreciation', 'asset'],
    longTermLiabilities: ['long term', 'liability', 'loan'],
    areasRoutes: ['area', 'route', 'territory'],
    categories: ['category', 'department']
  };

  const matched = [];
  for (const [moduleKey, moduleKeywords] of Object.entries(keywords)) {
    if (moduleKeywords.some(kw => lower.includes(kw))) {
      matched.push(modules[moduleKey]);
    }
  }
  return matched;
};
