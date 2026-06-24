-- ===================================================================
-- PHASE 2: SALES & CUSTOMERS REPORTS
-- ===================================================================

-- =============================================
-- 1. ACC_sp_GetInvoiceList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetInvoiceList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetInvoiceList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetInvoiceList]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        th.Doc_No AS DocumentNo,
        th.Post_Date AS InvoiceDate,
        th.Expected_Date AS DueDate,
        th.Vendor_Id AS CustomerCode,
        ISNULL(c.Cust_Name, th.Payee) AS CustomerName,
        th.Net_Amount AS Amount,
        th.Total AS TotalAmount,
        th.Tax AS TaxAmount,
        th.Remarks,
        th.Pay_Type AS PaymentType,
        th.CostCenter,
        'INV' AS DocumentType
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'INV%' OR th.Doc_No LIKE 'CIV%')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    ORDER BY th.Post_Date DESC, th.Doc_No;
END
GO

-- =============================================
-- 2. ACC_sp_GetOpenInvoices
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetOpenInvoices]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetOpenInvoices]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetOpenInvoices]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Open invoices = invoices with outstanding balance
    SELECT 
        th.Doc_No AS DocumentNo,
        th.Post_Date AS InvoiceDate,
        th.Expected_Date AS DueDate,
        th.Vendor_Id AS CustomerCode,
        ISNULL(c.Cust_Name, th.Payee) AS CustomerName,
        ISNULL(th.Net_Amount, 0) AS InvoiceAmount,
        ISNULL(th.Net_Amount, 0) - ISNULL(
            (SELECT ISNULL(SUM(ISNULL(Credit, 0)), 0) FROM dbo.ACC_Account_Transaction_Details 
             WHERE Doc_No = th.Doc_No AND Company_Id = th.Company_Id), 0
        ) AS OutstandingBalance,
        DATEDIFF(DAY, th.Expected_Date, GETDATE()) AS DaysOverdue,
        CASE 
            WHEN DATEDIFF(DAY, th.Expected_Date, GETDATE()) <= 0 THEN 'Current'
            WHEN DATEDIFF(DAY, th.Expected_Date, GETDATE()) <= 30 THEN '1-30 Days'
            WHEN DATEDIFF(DAY, th.Expected_Date, GETDATE()) <= 60 THEN '31-60 Days'
            WHEN DATEDIFF(DAY, th.Expected_Date, GETDATE()) <= 90 THEN '61-90 Days'
            ELSE '90+ Days'
        END AS AgingBucket
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'INV%' OR th.Doc_No LIKE 'CIV%')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    ORDER BY th.Expected_Date;
END
GO

-- =============================================
-- 3. ACC_sp_GetIncomeByCustomerSummary
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetIncomeByCustomerSummary]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetIncomeByCustomerSummary]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetIncomeByCustomerSummary]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), 'Unknown') AS CustomerName,
        td.Acc_Code AS AccountCode,
        MAX(ISNULL(sa.Sub_Acc_Name, td.Acc_Code)) AS AccountName,
        SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) AS IncomeAmount,
        COUNT(DISTINCT td.Doc_No) AS TransactionCount
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND NULLIF(LTRIM(RTRIM(td.Cust_Job)), '') IS NOT NULL
      AND sa.Acc_Type = 'INCOME'
    GROUP BY 
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), 'Unknown'),
        td.Acc_Code
    HAVING (SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0))) <> 0
    ORDER BY IncomeAmount DESC;
END
GO

-- =============================================
-- 4. ACC_sp_GetInvoicesAndReceivedPayments
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetInvoicesAndReceivedPayments]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetInvoicesAndReceivedPayments]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetInvoicesAndReceivedPayments]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        'Invoice' AS RecordType,
        th.Doc_No AS DocumentNo,
        th.Post_Date AS Date,
        ISNULL(c.Cust_Name, th.Payee) AS CustomerName,
        th.Net_Amount AS Amount,
        NULL AS PaymentRef,
        NULL AS PaymentAmount
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'INV%' OR th.Doc_No LIKE 'CIV%')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)

    UNION ALL

    SELECT 
        'Payment' AS RecordType,
        th.Doc_No AS DocumentNo,
        th.Post_Date AS Date,
        ISNULL(c.Cust_Name, th.Payee) AS CustomerName,
        NULL AS Amount,
        th.Reference AS PaymentRef,
        th.Net_Amount AS PaymentAmount
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'RCP%' OR th.Doc_No LIKE 'CSP%' OR th.Doc_No LIKE 'CAC%')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    ORDER BY Date DESC, RecordType, DocumentNo;
END
GO

-- =============================================
-- 5. ACC_sp_GetSalesByCustomerSummary
-- Already exists? Check via query and replace if stub.
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetSalesByCustomerSummary]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetSalesByCustomerSummary]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetSalesByCustomerSummary]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), 'Unknown') AS CustomerName,
        td.Acc_Code AS AccountCode,
        MAX(ISNULL(sa.Sub_Acc_Name, td.Acc_Code)) AS AccountName,
        COUNT(DISTINCT td.Doc_No) AS TransactionCount,
        SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) AS TotalSales,
        MAX(td.Post_Date) AS LastTransactionDate
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND NULLIF(LTRIM(RTRIM(td.Cust_Job)), '') IS NOT NULL
      AND sa.Acc_Type = 'INCOME'
    GROUP BY 
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), 'Unknown'),
        td.Acc_Code
    HAVING (SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0))) <> 0
    ORDER BY TotalSales DESC;
END
GO

-- =============================================
-- 6. ACC_sp_GetSalesByProductserviceSummary
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetSalesByProductserviceSummary]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetSalesByProductserviceSummary]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetSalesByProductserviceSummary]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        td.Acc_Code AS ProductServiceCode,
        MAX(ISNULL(p.Prod_Name, ISNULL(sa.Sub_Acc_Name, td.Acc_Code))) AS ProductServiceName,
        COUNT(DISTINCT td.Doc_No) AS TransactionCount,
        SUM(ISNULL(td.Amount, 0)) AS TotalDebit,
        SUM(ISNULL(td.Credit, 0)) AS TotalCredit,
        SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) AS NetAmount,
        MAX(td.Post_Date) AS LastSaleDate
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.ACC_Product p ON td.Acc_Code = p.Code
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
    GROUP BY td.Acc_Code
    HAVING (SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0))) <> 0
    ORDER BY NetAmount DESC;
END
GO

-- =============================================
-- 7. ACC_sp_GetSalesByProductserviceDetail
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetSalesByProductserviceDetail]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetSalesByProductserviceDetail]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetSalesByProductserviceDetail]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        td.Acc_Code AS ProductServiceCode,
        ISNULL(p.Prod_Name, ISNULL(sa.Sub_Acc_Name, td.Acc_Code)) AS ProductServiceName,
        td.Doc_No AS DocumentNo,
        td.Post_Date AS TransactionDate,
        td.Acc_Name AS Description,
        td.Amount AS Debit,
        td.Credit,
        ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) AS Amount,
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), '') AS CustomerName
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.ACC_Product p ON td.Acc_Code = p.Code
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
    ORDER BY td.Acc_Code, td.Post_Date DESC;
END
GO

-- =============================================
-- 8. ACC_sp_GetSalesOrderSummary
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetSalesOrderSummary]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetSalesOrderSummary]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetSalesOrderSummary]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        th.Doc_No AS SalesOrderNo,
        th.Post_Date AS OrderDate,
        th.Expected_Date AS ExpectedDate,
        th.Vendor_Id AS CustomerCode,
        ISNULL(c.Cust_Name, th.Payee) AS CustomerName,
        th.Net_Amount AS OrderAmount,
        th.Remarks,
        th.CostCenter,
        CASE 
            WHEN th.Doc_No LIKE 'SON%' THEN 'Sales Order'
            ELSE 'Order'
        END AS OrderType
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'SON%')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    ORDER BY th.Post_Date DESC, th.Doc_No;
END
GO

-- =============================================
-- 9. ACC_sp_GetQuotationSummary / Estimates
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetQuotationSummary]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetQuotationSummary]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetQuotationSummary]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        th.Doc_No AS EstimateNo,
        th.Post_Date AS EstimateDate,
        th.Expected_Date AS ExpiryDate,
        th.Vendor_Id AS CustomerCode,
        ISNULL(c.Cust_Name, th.Payee) AS CustomerName,
        th.Net_Amount AS Amount,
        th.Remarks,
        th.CostCenter,
        'EST' AS DocType
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'EST%')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    ORDER BY th.Post_Date DESC, th.Doc_No;
END
GO

-- =============================================
-- 10. ACC_sp_GetStatementList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetStatementList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetStatementList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetStatementList]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Customer statements showing all transactions per customer
    SELECT 
        ISNULL(c.Cust_Name, th.Payee) AS CustomerName,
        th.Vendor_Id AS CustomerCode,
        th.Doc_No AS DocumentNo,
        th.Post_Date AS TransactionDate,
        th.Expected_Date AS DueDate,
        CASE 
            WHEN th.Doc_No LIKE 'INV%' OR th.Doc_No LIKE 'CIV%' THEN 'Invoice'
            WHEN th.Doc_No LIKE 'RCP%' OR th.Doc_No LIKE 'CSP%' THEN 'Payment'
            WHEN th.Doc_No LIKE 'CAC%' THEN 'Credit'
            WHEN th.Doc_No LIKE 'EST%' THEN 'Estimate'
            ELSE 'Other'
        END AS TransactionType,
        CASE 
            WHEN th.Doc_No LIKE 'INV%' OR th.Doc_No LIKE 'CIV%' THEN ISNULL(th.Net_Amount, 0)
            ELSE 0
        END AS DebitAmount,
        CASE 
            WHEN th.Doc_No LIKE 'RCP%' OR th.Doc_No LIKE 'CSP%' OR th.Doc_No LIKE 'CAC%' THEN ISNULL(th.Net_Amount, 0)
            ELSE 0
        END AS CreditAmount,
        th.Remarks
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'INV%' OR th.Doc_No LIKE 'CIV%' OR th.Doc_No LIKE 'RCP%' OR th.Doc_No LIKE 'CSP%' OR th.Doc_No LIKE 'CAC%')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    ORDER BY CustomerName, th.Post_Date, th.Doc_No;
END
GO

-- =============================================
-- 11. ACC_sp_GetTermsList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetTermsList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetTermsList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetTermsList]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        Id,
        TermCode AS TermsCode,
        TermName AS TermsName,
        Days AS DueDays,
        CASE WHEN Inactive = 1 THEN 0 ELSE 1 END AS IsActive
    FROM dbo.ACC_Payment_Terms
    ORDER BY TermName;
END
GO

-- =============================================
-- 12. ACC_sp_GetSalesByCustomerTypeDetail
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetSalesByCustomerTypeDetail]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetSalesByCustomerTypeDetail]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetSalesByCustomerTypeDetail]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ISNULL(ct.Type_Name, 'Unknown') AS CustomerType,
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), 'Unknown') AS CustomerName,
        td.Doc_No AS DocumentNo,
        td.Post_Date AS TransactionDate,
        td.Acc_Code AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, td.Acc_Code) AS AccountName,
        td.Amount AS Debit,
        td.Credit,
        ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) AS Amount
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    LEFT JOIN dbo.ACC_Customer c ON td.Cust_Job = c.Code
    LEFT JOIN dbo.ACC_CustomerType ct ON c.Type = ct.Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND NULLIF(LTRIM(RTRIM(td.Cust_Job)), '') IS NOT NULL
    ORDER BY CustomerType, CustomerName, td.Post_Date;
END
GO

-- =============================================
-- 13. ACC_sp_GetCustomerBalanceSummary
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetCustomerBalanceSummary]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetCustomerBalanceSummary]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetCustomerBalanceSummary]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        th.Vendor_Id AS CustomerCode,
        ISNULL(c.Cust_Name, th.Payee) AS CustomerName,
        COUNT(DISTINCT CASE WHEN th.Doc_No LIKE 'INV%' OR th.Doc_No LIKE 'CIV%' THEN th.Doc_No END) AS InvoiceCount,
        SUM(CASE WHEN th.Doc_No LIKE 'INV%' OR th.Doc_No LIKE 'CIV%' THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS TotalInvoiced,
        SUM(CASE WHEN th.Doc_No LIKE 'RCP%' OR th.Doc_No LIKE 'CSP%' THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS TotalPaid,
        SUM(CASE WHEN th.Doc_No LIKE 'INV%' OR th.Doc_No LIKE 'CIV%' THEN ISNULL(th.Net_Amount, 0) ELSE 0 END)
        - SUM(CASE WHEN th.Doc_No LIKE 'RCP%' OR th.Doc_No LIKE 'CSP%' THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS OutstandingBalance
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Vendor_Id IS NOT NULL AND th.Vendor_Id != '')
      AND (th.Doc_No LIKE 'INV%' OR th.Doc_No LIKE 'CIV%' OR th.Doc_No LIKE 'RCP%' OR th.Doc_No LIKE 'CSP%')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    GROUP BY th.Vendor_Id, ISNULL(c.Cust_Name, th.Payee)
    ORDER BY OutstandingBalance DESC;
END
GO

-- =============================================
-- 14. ACC_sp_GetCollectionsReport
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetCollectionsReport]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetCollectionsReport]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetCollectionsReport]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ISNULL(c.Cust_Name, th.Payee) AS CustomerName,
        th.Vendor_Id AS CustomerCode,
        th.Doc_No AS DocumentNo,
        th.Post_Date AS PaymentDate,
        th.Reference AS ReferenceNo,
        th.Pay_Type AS PaymentMethod,
        th.Net_Amount AS Amount,
        th.Remarks,
        th.CostCenter
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'RCP%' OR th.Doc_No LIKE 'CSP%' OR th.Doc_No LIKE 'CAC%')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    ORDER BY th.Post_Date DESC, th.Doc_No;
END
GO

-- =============================================
-- 15. ACC_sp_GetAccountsReceivableAgeingSummary
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetAccountsReceivableAgeingSummary]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetAccountsReceivableAgeingSummary]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetAccountsReceivableAgeingSummary]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AsOfDate DATE = ISNULL(@EndDate, GETDATE());

    SELECT 
        ISNULL(c.Cust_Name, th.Payee) AS CustomerName,
        th.Vendor_Id AS CustomerCode,
        SUM(ISNULL(th.Net_Amount, 0)) AS TotalOutstanding,
        SUM(CASE WHEN DATEDIFF(DAY, th.Expected_Date, @AsOfDate) <= 0 THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS Current_Amount,
        SUM(CASE WHEN DATEDIFF(DAY, th.Expected_Date, @AsOfDate) BETWEEN 1 AND 30 THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS Aging_1_30,
        SUM(CASE WHEN DATEDIFF(DAY, th.Expected_Date, @AsOfDate) BETWEEN 31 AND 60 THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS Aging_31_60,
        SUM(CASE WHEN DATEDIFF(DAY, th.Expected_Date, @AsOfDate) BETWEEN 61 AND 90 THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS Aging_61_90,
        SUM(CASE WHEN DATEDIFF(DAY, th.Expected_Date, @AsOfDate) > 90 THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS Aging_90_Plus
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'INV%' OR th.Doc_No LIKE 'CIV%')
      AND ISNULL(th.Net_Amount, 0) > 0
    GROUP BY ISNULL(c.Cust_Name, th.Payee), th.Vendor_Id
    ORDER BY TotalOutstanding DESC;
END
GO

-- =============================================
-- 16. ACC_sp_GetAccountsReceivableAgeingDetail
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetAccountsReceivableAgeingDetail]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetAccountsReceivableAgeingDetail]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetAccountsReceivableAgeingDetail]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AsOfDate DATE = ISNULL(@EndDate, GETDATE());

    SELECT 
        ISNULL(c.Cust_Name, th.Payee) AS CustomerName,
        th.Vendor_Id AS CustomerCode,
        th.Doc_No AS DocumentNo,
        th.Post_Date AS InvoiceDate,
        th.Expected_Date AS DueDate,
        ISNULL(th.Net_Amount, 0) AS Amount,
        DATEDIFF(DAY, th.Expected_Date, @AsOfDate) AS DaysOverdue,
        CASE 
            WHEN DATEDIFF(DAY, th.Expected_Date, @AsOfDate) <= 0 THEN 'Current'
            WHEN DATEDIFF(DAY, th.Expected_Date, @AsOfDate) BETWEEN 1 AND 30 THEN '1-30 Days'
            WHEN DATEDIFF(DAY, th.Expected_Date, @AsOfDate) BETWEEN 31 AND 60 THEN '31-60 Days'
            WHEN DATEDIFF(DAY, th.Expected_Date, @AsOfDate) BETWEEN 61 AND 90 THEN '61-90 Days'
            ELSE '90+ Days'
        END AS AgingBucket
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'INV%' OR th.Doc_No LIKE 'CIV%')
      AND ISNULL(th.Net_Amount, 0) > 0
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    ORDER BY CustomerName, th.Expected_Date;
END
GO

-- =============================================
-- 17. ACC_sp_GetInvoiceApprovalStatus
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetInvoiceApprovalStatus]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetInvoiceApprovalStatus]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetInvoiceApprovalStatus]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        th.Doc_No AS DocumentNo,
        th.Post_Date AS InvoiceDate,
        th.Vendor_Id AS CustomerCode,
        ISNULL(c.Cust_Name, th.Payee) AS CustomerName,
        th.Net_Amount AS Amount,
        th.Remarks,
        th.Create_User AS CreatedBy,
        th.Create_Date AS CreatedDate,
        ISNULL(th.Cancel, 'No') AS Cancelled,
        CASE WHEN th.Cancel IS NOT NULL AND th.Cancel = 'Yes' THEN 'Cancelled' ELSE 'Approved' END AS ApprovalStatus
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'INV%' OR th.Doc_No LIKE 'CIV%')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    ORDER BY th.Post_Date DESC, th.Doc_No;
END
GO

-- =============================================
-- 18. ACC_sp_GetProductserviceList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetProductserviceList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetProductserviceList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetProductserviceList]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        p.Code AS ProductCode,
        p.Prod_Name AS ProductName,
        p.Unit,
        p.Purchase_price AS PurchasePrice,
        p.Selling_price AS SellingPrice,
        p.Income_Acc AS IncomeAccount,
        p.Expense_Acc AS ExpenseAccount,
        p.Pack_Size,
        ISNULL(sm.Qty, 0) AS StockQuantity,
        sm.Reorder_Level AS ReorderLevel,
        cat.Dept_Code AS CategoryCode,
        cat.Cat_Name AS CategoryName
    FROM dbo.ACC_Product p
    LEFT JOIN dbo.ACC_Stock_Master sm ON p.Code = sm.Prod_Code AND RTRIM(LTRIM(sm.Comp_Code)) = @CompanyId
    LEFT JOIN dbo.ACC_Category cat ON p.Cat_Code = cat.Code AND RTRIM(LTRIM(cat.Company)) = @CompanyId
    WHERE (p.Locked = 0 OR p.Locked IS NULL) AND (p.Is_Inactive = 0 OR p.Is_Inactive IS NULL)
    ORDER BY p.Prod_Name;
END
GO

-- =============================================
-- 19. ACC_sp_GetItemsServiceReport
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetItemsServiceReport]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetItemsServiceReport]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetItemsServiceReport]
    @Company NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        p.Code AS Prod_Code,
        p.Prod_Name AS Prod_Name,
        '' AS Business_Type,
        p.Income_Acc AS Income_Account,
        p.Expense_Acc AS Expense_Account,
        ISNULL(p.Purchase_price, 0) AS Purchase_Price,
        ISNULL(p.Selling_price, 0) AS Selling_Price,
        p.Unit,
        ISNULL(sm.Qty, 0) AS Stock_Qty,
        sm.Reorder_Level,
        sm.Reorder_Qty
    FROM dbo.ACC_Product p
    LEFT JOIN dbo.ACC_Stock_Master sm ON p.Code = sm.Prod_Code AND RTRIM(LTRIM(sm.Comp_Code)) = @Company
    ORDER BY p.Prod_Name;
END
GO

PRINT 'Phase 2 (Sales & Customers) completed - 19 stored procedures rewritten.';
