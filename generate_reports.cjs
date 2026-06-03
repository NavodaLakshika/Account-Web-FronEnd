const fs = require('fs');

// 1. Update task.md
let taskContent = fs.readFileSync('C:/Users/LENOVO/.gemini/antigravity-ide/brain/299bfe48-11b3-4c24-b6fc-e39ab5e5c81e/task.md', 'utf8');
taskContent += `
## Phase 2: Mass Report Generation
- \`[ ]\` Write generator script for 87 reports
- \`[ ]\` Generate \`mass_create_reports_sps.sql\`
- \`[ ]\` Inject C# endpoints into \`ReportController.cs\`
- \`[ ]\` Update \`ReportTemplate.jsx\` dynamic mapping
`;
fs.writeFileSync('C:/Users/LENOVO/.gemini/antigravity-ide/brain/299bfe48-11b3-4c24-b6fc-e39ab5e5c81e/task.md', taskContent);

// 2. Read all reports
const reportsStr = `["Profit and Loss Detail", "Profit and Loss year-to-date comparison", "Quarterly Profit and Loss Summary", "Statement of Changes in Equity", "Custom Summary Report", "Project Profitability Summary", "Customer Balance Summary", "Customer Balance Detail", "Open Invoices", "Accounts receivable ageing detail", "Collections Report", "Invoice List", "Statement List", "Terms List", "Unbilled time", "Unbilled charges", "Sales by Customer Summary", "Sales by Customer Detail", "Sales by Product/Service Summary", "Sales by Product/Service Detail", "Product/Service List", "Income by Customer Summary", "Customer Contact List", "Payment Method List", "Transaction List by Customer", "Time Activities by Customer Detail", "Estimates by Customer", "Deposit Detail", "Bill Approval Status", "Product/Item Profitability by Customer", "Invoice Approval Status", "Transaction List by Tag Group", "Invoices and Received Payments", "Supplier Phone List", "Bills and Applied Payments", "Customer Phone List", "Purchases by Product/Service Detail", "Time Summary by Pay Type", "Timesheet Detail by Employee", "Tax Liability Report", "Adjusted Trial Balance", "Invalid Journal Transactions", "Profit and Loss By Tag Group", "Sales by Customer Type Detail", "Purchase List", "General Ledger List", "Purchases by Supplier Detail", "Audit Log", "Expenses by Supplier Summary", "Transaction List by Supplier", "Supplier Contact List", "Cheque Detail", "Accounts payable ageing summary", "Supplier Balance Detail", "Bill Payment List", "Accounts payable ageing detail", "Unpaid Bills", "Supplier Balance Summary", "Account List", "Reconciliation Reports", "Trial Balance", "Journal", "Profit and Loss", "Profit and Loss Comparison", "Balance Sheet", "Balance Sheet Comparison", "Transaction Detail by Account", "General Ledger", "Transaction List with Splits", "Statement of Cash Flows", "Transaction List by Date", "Recent Transactions", "Recurring Template List", "Time Activities by Employee Detail", "Recent/Edited Time Activities", "Employee Contact List", "Inventory Valuation Summary", "Inventory Valuation Detail", "Stock Take Worksheet", "Open Purchase Order Detail", "Open Purchase Order List", "Accounts receivable ageing summary", "Balance Sheet Detail", "Balance Sheet Summary", "Business Snapshot", "Profit and Loss as % of total income", "Profit and Loss by Customer", "Profit and Loss by Month"]`;
const allReports = JSON.parse(reportsStr);
const doneReports = ['Profit and Loss', 'Balance Sheet', 'Trial Balance'];
const pendingReports = allReports.filter(r => !doneReports.includes(r));

// Utility to convert strings
const toKebabCase = str => str.replace(/[^a-zA-Z0-9 ]/g, "").split(' ').map(w=>w.toLowerCase()).filter(Boolean).join('-');
const toPascalCase = str => str.replace(/[^a-zA-Z0-9 ]/g, "").split(' ').map(w=>w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).filter(Boolean).join('');

let sqlOutput = `-- ==============================================================================
-- ACCOUNTS WEB - MASS GENERATED STORED PROCEDURES (PHASE 2)
-- ==============================================================================
`;

let csharpMethods = '';

for (const report of pendingReports) {
    const pascal = toPascalCase(report);
    const kebab = toKebabCase(report);
    const spName = `dbo.ACC_sp_Get${pascal}`;
    
    // Generate SQL
    sqlOutput += `
IF OBJECT_ID('${spName}', 'P') IS NOT NULL
    DROP PROCEDURE ${spName}
GO
CREATE PROCEDURE ${spName}
    @CompanyId NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Auto-generated fallback logic. Ensure you replace this with actual business logic.
    SELECT 
        'No Data' AS PlaceholderColumn,
        'This stored procedure was auto-generated for ${report}' AS Message;
END
GO
`;

    // Generate C#
    csharpMethods += `
        [HttpGet("${kebab}")]
        public async Task<IActionResult> Get${pascal}([FromQuery] string companyId)
        {
            return await ExecuteFinancialReportSP("${spName}", companyId, null, null);
        }
`;
}

fs.writeFileSync('mass_create_reports_sps.sql', sqlOutput);

// 3. Inject into ReportController.cs
const controllerPath = 'E:/Project/Accounts/Acc-Web_BackEnd/backend/Account-Web-Backend/Acc-Web-API/Controllers/ReportController.cs';
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

// Insert the methods right before ExecuteFinancialReportSP
controllerContent = controllerContent.replace(
    '        private async Task<IActionResult> ExecuteFinancialReportSP',
    csharpMethods + '\n        private async Task<IActionResult> ExecuteFinancialReportSP'
);
fs.writeFileSync(controllerPath, controllerContent);

// 4. Update ReportTemplate.jsx
const templatePath = 'src/components/ReportTemplate.jsx';
let templateContent = fs.readFileSync(templatePath, 'utf8');

// Replace the giant if/else block with a dynamic generator
const dynamicEndpointLogic = `
            const endpoint = title.replace(/[^a-zA-Z0-9 ]/g, "").split(' ').map(w=>w.toLowerCase()).filter(Boolean).join('-');
`;

templateContent = templateContent.replace(
    /let endpoint = '';\s*if \(title === 'Profit and Loss'\) endpoint = 'profit-and-loss';\s*else if \(title === 'Balance Sheet'\) endpoint = 'balance-sheet';\s*else if \(title === 'Trial Balance'\) endpoint = 'trial-balance';/,
    dynamicEndpointLogic
);

fs.writeFileSync(templatePath, templateContent);

console.log("Mass generation successful.");
