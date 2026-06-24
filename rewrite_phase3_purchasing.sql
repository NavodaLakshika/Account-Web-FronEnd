-- ===================================================================
-- PHASE 3: PURCHASES & SUPPLIERS REPORTS
-- ===================================================================

-- =============================================
-- 1. ACC_sp_GetSupplierBalanceSummary
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetSupplierBalanceSummary]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetSupplierBalanceSummary]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetSupplierBalanceSummary]
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
        th.Vendor_Id AS SupplierCode,
        ISNULL(s.Supplier_Name, th.Payee) AS SupplierName,
        COUNT(DISTINCT CASE WHEN th.Doc_No LIKE 'EBN%' THEN th.Doc_No END) AS BillCount,
        SUM(CASE WHEN th.Doc_No LIKE 'EBN%' THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS TotalBilled,
        SUM(CASE WHEN (th.Doc_No LIKE 'PO%' OR th.Doc_No LIKE 'CHQ%' OR th.Doc_No LIKE 'PYB%') THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS TotalPaid,
        SUM(CASE WHEN th.Doc_No LIKE 'EBN%' THEN ISNULL(th.Net_Amount, 0) ELSE 0 END)
        - SUM(CASE WHEN (th.Doc_No LIKE 'PO%' OR th.Doc_No LIKE 'CHQ%' OR th.Doc_No LIKE 'PYB%') THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS OutstandingBalance
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Supplier s ON th.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Vendor_Id IS NOT NULL AND th.Vendor_Id != '')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    GROUP BY th.Vendor_Id, ISNULL(s.Supplier_Name, th.Payee)
    ORDER BY OutstandingBalance DESC;
END
GO

-- =============================================
-- 2. ACC_sp_GetSupplierBalanceDetail
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetSupplierBalanceDetail]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetSupplierBalanceDetail]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetSupplierBalanceDetail]
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
        ISNULL(s.Supplier_Name, ISNULL(th.Payee, th.Vendor_Id)) AS SupplierName,
        th.Vendor_Id AS SupplierCode,
        th.Post_Date AS TransactionDate,
        CASE 
            WHEN th.Doc_No LIKE 'EBN%' THEN 'Bill'
            WHEN th.Doc_No LIKE 'CHQ%' OR th.Doc_No LIKE 'PYB%' THEN 'Payment'
            WHEN th.Doc_No LIKE 'PO%' THEN 'Purchase Order'
            ELSE 'Other'
        END AS TransactionType,
        th.Doc_No AS DocumentNo,
        th.Expected_Date AS DueDate,
        CASE WHEN th.Doc_No LIKE 'EBN%' THEN ISNULL(th.Net_Amount, 0) ELSE 0 END AS BillAmount,
        CASE WHEN th.Doc_No LIKE 'CHQ%' OR th.Doc_No LIKE 'PYB%' THEN ISNULL(th.Net_Amount, 0) ELSE 0 END AS PaymentAmount,
        ISNULL(th.Net_Amount, 0) AS Balance
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Supplier s ON th.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
      AND (th.Vendor_Id IS NOT NULL AND th.Vendor_Id != '')
    ORDER BY SupplierName, th.Post_Date;
END
GO

-- =============================================
-- 3. ACC_sp_GetUnpaidBills
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetUnpaidBills]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetUnpaidBills]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetUnpaidBills]
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
        bh.Doc_No AS BillNo,
        bh.Post_Date AS BillDate,
        bh.Bill_Due_Date AS DueDate,
        bh.Vendor_Id AS SupplierCode,
        ISNULL(s.Supplier_Name, '') AS SupplierName,
        bh.Net_Amount AS BillAmount,
        bh.Memo,
        bh.Ref_No AS ReferenceNo,
        bh.CostCenter,
        bh.Company AS CompanyCode,
        -- Calculate paid amount from transaction header
        ISNULL((SELECT SUM(ISNULL(Net_Amount, 0)) FROM dbo.ACC_Transaction_Header 
                WHERE Reference = bh.Doc_No AND Company_Id = @CompanyId), 0) AS PaidAmount,
        bh.Net_Amount - ISNULL((SELECT SUM(ISNULL(Net_Amount, 0)) FROM dbo.ACC_Transaction_Header 
                WHERE Reference = bh.Doc_No AND Company_Id = @CompanyId), 0) AS OutstandingAmount
    FROM dbo.ACC_Bill_Header bh
    LEFT JOIN dbo.ACC_Supplier s ON bh.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR bh.Company = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) <= @EndDate)
      AND bh.Net_Amount > ISNULL((SELECT SUM(ISNULL(Net_Amount, 0)) FROM dbo.ACC_Transaction_Header 
            WHERE Reference = bh.Doc_No AND Company_Id = @CompanyId), 0)
    ORDER BY bh.Bill_Due_Date, bh.Vendor_Id;
END
GO

-- =============================================
-- 4. ACC_sp_GetBillPaymentList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetBillPaymentList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetBillPaymentList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetBillPaymentList]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Payments made to suppliers (from ACC_Transaction_Header with payment prefixes)
    SELECT 
        th.Doc_No AS PaymentNo,
        th.Post_Date AS PaymentDate,
        th.Vendor_Id AS SupplierCode,
        ISNULL(s.Supplier_Name, th.Payee) AS SupplierName,
        th.Net_Amount AS Amount,
        th.Pay_Type AS PaymentType,
        th.Reference AS ReferenceNo,
        th.Remarks,
        th.CostCenter,
        th.Create_User AS CreatedBy
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Supplier s ON th.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'PYB%' OR th.Doc_No LIKE 'CHQ%')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    ORDER BY th.Post_Date DESC, th.Doc_No;
END
GO

-- =============================================
-- 5. ACC_sp_GetBillsAndAppliedPayments
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetBillsAndAppliedPayments]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetBillsAndAppliedPayments]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetBillsAndAppliedPayments]
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
        'Bill' AS RecordType,
        bh.Doc_No AS DocumentNo,
        bh.Post_Date AS Date,
        ISNULL(s.Supplier_Name, bh.Vendor_Id) AS SupplierName,
        bh.Net_Amount AS Amount,
        bh.Memo,
        NULL AS PaymentRef,
        NULL AS PaymentAmount
    FROM dbo.ACC_Bill_Header bh
    LEFT JOIN dbo.ACC_Supplier s ON bh.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR bh.Company = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) <= @EndDate)

    UNION ALL

    SELECT 
        'Payment' AS RecordType,
        th.Doc_No AS DocumentNo,
        th.Post_Date AS Date,
        ISNULL(s.Supplier_Name, th.Payee) AS SupplierName,
        NULL AS Amount,
        th.Remarks,
        th.Reference AS PaymentRef,
        th.Net_Amount AS PaymentAmount
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Supplier s ON th.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'PYB%' OR th.Doc_No LIKE 'CHQ%')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    ORDER BY Date DESC, RecordType, DocumentNo;
END
GO

-- =============================================
-- 6. ACC_sp_GetPurchaseList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetPurchaseList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetPurchaseList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetPurchaseList]
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
        bh.Doc_No AS BillNo,
        bh.Post_Date AS BillDate,
        bh.Bill_Due_Date AS DueDate,
        bh.Vendor_Id AS SupplierCode,
        ISNULL(s.Supplier_Name, '') AS SupplierName,
        bh.Net_Amount AS Amount,
        bh.Memo,
        bh.Ref_No AS ReferenceNo,
        bh.Bill_Type,
        bh.CostCenter,
        bh.Company AS CompanyCode
    FROM dbo.ACC_Bill_Header bh
    LEFT JOIN dbo.ACC_Supplier s ON bh.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR bh.Company = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) <= @EndDate)
    ORDER BY bh.Post_Date DESC, bh.Doc_No;
END
GO

-- =============================================
-- 7. ACC_sp_GetPurchasesBySupplierDetail
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetPurchasesBySupplierDetail]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetPurchasesBySupplierDetail]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetPurchasesBySupplierDetail]
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
        ISNULL(s.Supplier_Name, bh.Vendor_Id) AS SupplierName,
        bh.Vendor_Id AS SupplierCode,
        bh.Doc_No AS BillNo,
        bh.Post_Date AS BillDate,
        bh.Bill_Due_Date AS DueDate,
        bh.Net_Amount AS BillAmount,
        bh.Memo,
        bh.Ref_No AS ReferenceNo,
        bi.Item_Id AS ItemCode,
        bi.Discription AS ItemDescription,
        bi.Qty AS Quantity,
        bi.Cost AS UnitCost,
        ISNULL(bi.Qty, 0) * ISNULL(bi.Cost, 0) AS LineTotal
    FROM dbo.ACC_Bill_Header bh
    LEFT JOIN dbo.ACC_Supplier s ON bh.Vendor_Id = s.Code
    LEFT JOIN dbo.ACC_Bill_Item bi ON bh.Doc_No = bi.Doc_No
    WHERE (@CompanyId IS NULL OR bh.Company = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) <= @EndDate)
    ORDER BY SupplierName, bh.Post_Date, bh.Doc_No;
END
GO

-- =============================================
-- 8. ACC_sp_GetPurchasesByProductserviceDetail
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetPurchasesByProductserviceDetail]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetPurchasesByProductserviceDetail]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetPurchasesByProductserviceDetail]
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
        bi.Item_Id AS ProductCode,
        ISNULL(p.Prod_Name, bi.Discription) AS ProductName,
        bi.Doc_No AS DocumentNo,
        bh.Post_Date AS PurchaseDate,
        bh.Vendor_Id AS SupplierCode,
        ISNULL(s.Supplier_Name, '') AS SupplierName,
        bi.Qty AS Quantity,
        bi.Cost AS UnitCost,
        ISNULL(bi.Qty, 0) * ISNULL(bi.Cost, 0) AS LineTotal,
        bh.Memo
    FROM dbo.ACC_Bill_Item bi
    LEFT JOIN dbo.ACC_Bill_Header bh ON bi.Doc_No = bh.Doc_No
    LEFT JOIN dbo.ACC_Product p ON bi.Item_Id = p.Code
    LEFT JOIN dbo.ACC_Supplier s ON bh.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR bh.Company = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) <= @EndDate)
    ORDER BY ProductName, bh.Post_Date;
END
GO

-- =============================================
-- 9. ACC_sp_GetExpensesBySupplierSummary
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetExpensesBySupplierSummary]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetExpensesBySupplierSummary]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetExpensesBySupplierSummary]
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
        ISNULL(s.Supplier_Name, bh.Vendor_Id) AS SupplierName,
        bh.Vendor_Id AS SupplierCode,
        COUNT(DISTINCT bh.Doc_No) AS BillCount,
        SUM(ISNULL(bh.Net_Amount, 0)) AS TotalExpenses,
        MAX(bh.Post_Date) AS LastPurchaseDate
    FROM dbo.ACC_Bill_Header bh
    LEFT JOIN dbo.ACC_Supplier s ON bh.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR bh.Company = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) <= @EndDate)
    GROUP BY ISNULL(s.Supplier_Name, bh.Vendor_Id), bh.Vendor_Id
    ORDER BY TotalExpenses DESC;
END
GO

-- =============================================
-- 10. ACC_sp_GetTransactionListBySupplier
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetTransactionListBySupplier]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetTransactionListBySupplier]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetTransactionListBySupplier]
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
        ISNULL(s.Supplier_Name, th.Payee) AS SupplierName,
        th.Vendor_Id AS SupplierCode,
        th.Doc_No AS DocumentNo,
        th.Post_Date AS TransactionDate,
        CASE 
            WHEN th.Doc_No LIKE 'EBN%' THEN 'Bill'
            WHEN th.Doc_No LIKE 'CHQ%' THEN 'Cheque Payment'
            WHEN th.Doc_No LIKE 'PYB%' THEN 'Bill Payment'
            ELSE 'Other'
        END AS TransactionType,
        th.Net_Amount AS Amount,
        th.Remarks,
        th.Reference AS ReferenceNo
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Supplier s ON th.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
      AND (th.Vendor_Id IS NOT NULL AND th.Vendor_Id != '')
    ORDER BY SupplierName, th.Post_Date DESC;
END
GO

-- =============================================
-- 11. ACC_sp_GetSupplierContactList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetSupplierContactList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetSupplierContactList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetSupplierContactList]
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
        s.Code AS SupplierCode,
        s.Supplier_Name AS SupplierName,
        s.Address1,
        s.Address2,
        s.Phone,
        s.Fax,
        s.Email,
        s.Web,
        s.Contact_Person,
        s.Bank_Name,
        s.Bank_Code,
        s.AC_Number,
        s.VAT_Number
    FROM dbo.ACC_Supplier s
    WHERE s.Company = @CompanyId OR s.Company_Code = @CompanyId
    ORDER BY s.Supplier_Name;
END
GO

-- =============================================
-- 12. ACC_sp_GetSupplierPhoneList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetSupplierPhoneList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetSupplierPhoneList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetSupplierPhoneList]
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
        s.Code AS SupplierCode,
        s.Supplier_Name AS SupplierName,
        s.Phone,
        s.Email,
        s.Contact_Person,
        s.Fax
    FROM dbo.ACC_Supplier s
    WHERE s.Company = @CompanyId OR s.Company_Code = @CompanyId
    ORDER BY s.Supplier_Name;
END
GO

-- =============================================
-- 13. ACC_sp_GetAccountsPayableAgeingSummary
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetAccountsPayableAgeingSummary]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetAccountsPayableAgeingSummary]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetAccountsPayableAgeingSummary]
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
        ISNULL(s.Supplier_Name, bh.Vendor_Id) AS SupplierName,
        bh.Vendor_Id AS SupplierCode,
        SUM(ISNULL(bh.Net_Amount, 0)) AS TotalOutstanding,
        SUM(CASE WHEN DATEDIFF(DAY, TRY_CONVERT(DATE, bh.Bill_Due_Date, 103), @AsOfDate) <= 0 THEN ISNULL(bh.Net_Amount, 0) ELSE 0 END) AS Current_Amount,
        SUM(CASE WHEN DATEDIFF(DAY, TRY_CONVERT(DATE, bh.Bill_Due_Date, 103), @AsOfDate) BETWEEN 1 AND 30 THEN ISNULL(bh.Net_Amount, 0) ELSE 0 END) AS Aging_1_30,
        SUM(CASE WHEN DATEDIFF(DAY, TRY_CONVERT(DATE, bh.Bill_Due_Date, 103), @AsOfDate) BETWEEN 31 AND 60 THEN ISNULL(bh.Net_Amount, 0) ELSE 0 END) AS Aging_31_60,
        SUM(CASE WHEN DATEDIFF(DAY, TRY_CONVERT(DATE, bh.Bill_Due_Date, 103), @AsOfDate) BETWEEN 61 AND 90 THEN ISNULL(bh.Net_Amount, 0) ELSE 0 END) AS Aging_61_90,
        SUM(CASE WHEN DATEDIFF(DAY, TRY_CONVERT(DATE, bh.Bill_Due_Date, 103), @AsOfDate) > 90 THEN ISNULL(bh.Net_Amount, 0) ELSE 0 END) AS Aging_90_Plus
    FROM dbo.ACC_Bill_Header bh
    LEFT JOIN dbo.ACC_Supplier s ON bh.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR bh.Company = @CompanyId)
      AND ISNULL(bh.Net_Amount, 0) > 0
    GROUP BY ISNULL(s.Supplier_Name, bh.Vendor_Id), bh.Vendor_Id
    ORDER BY TotalOutstanding DESC;
END
GO

-- =============================================
-- 14. ACC_sp_GetAccountsPayableAgeingDetail
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetAccountsPayableAgeingDetail]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetAccountsPayableAgeingDetail]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetAccountsPayableAgeingDetail]
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
        ISNULL(s.Supplier_Name, bh.Vendor_Id) AS SupplierName,
        bh.Vendor_Id AS SupplierCode,
        bh.Doc_No AS BillNo,
        bh.Post_Date AS BillDate,
        bh.Bill_Due_Date AS DueDate,
        ISNULL(bh.Net_Amount, 0) AS Amount,
        DATEDIFF(DAY, TRY_CONVERT(DATE, bh.Bill_Due_Date, 103), @AsOfDate) AS DaysOverdue,
        CASE 
            WHEN DATEDIFF(DAY, TRY_CONVERT(DATE, bh.Bill_Due_Date, 103), @AsOfDate) <= 0 THEN 'Current'
            WHEN DATEDIFF(DAY, TRY_CONVERT(DATE, bh.Bill_Due_Date, 103), @AsOfDate) BETWEEN 1 AND 30 THEN '1-30 Days'
            WHEN DATEDIFF(DAY, TRY_CONVERT(DATE, bh.Bill_Due_Date, 103), @AsOfDate) BETWEEN 31 AND 60 THEN '31-60 Days'
            WHEN DATEDIFF(DAY, TRY_CONVERT(DATE, bh.Bill_Due_Date, 103), @AsOfDate) BETWEEN 61 AND 90 THEN '61-90 Days'
            ELSE '90+ Days'
        END AS AgingBucket
    FROM dbo.ACC_Bill_Header bh
    LEFT JOIN dbo.ACC_Supplier s ON bh.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR bh.Company = @CompanyId)
      AND ISNULL(bh.Net_Amount, 0) > 0
      AND (@StartDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) <= @EndDate)
    ORDER BY SupplierName, TRY_CONVERT(DATE, bh.Bill_Due_Date, 103);
END
GO

-- =============================================
-- 15. ACC_sp_GetBillApprovalStatus
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetBillApprovalStatus]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetBillApprovalStatus]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetBillApprovalStatus]
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
        bh.Doc_No AS DocumentNo,
        bh.Post_Date AS BillDate,
        bh.Vendor_Id AS SupplierCode,
        ISNULL(s.Supplier_Name, '') AS SupplierName,
        bh.Net_Amount AS Amount,
        bh.Memo,
        bh.Create_User AS CreatedBy,
        bh.Create_Date AS CreatedDate,
        'Approved' AS ApprovalStatus
    FROM dbo.ACC_Bill_Header bh
    LEFT JOIN dbo.ACC_Supplier s ON bh.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR bh.Company = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) <= @EndDate)
    ORDER BY bh.Post_Date DESC, bh.Doc_No;
END
GO

-- =============================================
-- 16. ACC_sp_GetOpenPurchaseOrderList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetOpenPurchaseOrderList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetOpenPurchaseOrderList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetOpenPurchaseOrderList]
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
        tsh.Doc_No AS PONo,
        tsh.Post_Date AS PODate,
        tsh.Expected_Date AS ExpectedDate,
        tsh.Vendor_Id AS SupplierCode,
        tsh.Payee AS SupplierName,
        tsh.Net_Amount AS Amount,
        tsh.Remarks,
        tsh.CostCenter,
        tsh.Create_User AS CreatedBy
    FROM dbo.ACC_TransactionSave_Header tsh
    WHERE (@CompanyId IS NULL OR tsh.Company_Id = @CompanyId)
      AND tsh.Iid = 'PO'
      AND (@StartDate IS NULL OR TRY_CONVERT(DATE, tsh.Post_Date, 103) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CONVERT(DATE, tsh.Post_Date, 103) <= @EndDate)
    ORDER BY tsh.Post_Date DESC, tsh.Doc_No;
END
GO

-- =============================================
-- 17. ACC_sp_GetOpenPurchaseOrderDetail
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetOpenPurchaseOrderDetail]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetOpenPurchaseOrderDetail]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetOpenPurchaseOrderDetail]
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
        tsh.Doc_No AS PONo,
        tsh.Post_Date AS PODate,
        tsh.Vendor_Id AS SupplierCode,
        tsh.Payee AS SupplierName,
        tsd.Prod_Code AS ItemCode,
        tsd.Prod_Name AS ItemName,
        tsd.Qty AS Quantity,
        tsd.Purchase_Price AS UnitCost,
        ISNULL(tsd.Qty, 0) * ISNULL(tsd.Purchase_Price, 0) AS LineTotal,
        tsd.Memo
    FROM dbo.ACC_TransactionSave_Header tsh
    LEFT JOIN dbo.ACC_TransactionSave_Details tsd ON tsh.Doc_No = tsd.Doc_No
    WHERE (@CompanyId IS NULL OR tsh.Company_Id = @CompanyId)
      AND tsh.Iid = 'PO'
      AND (@StartDate IS NULL OR TRY_CONVERT(DATE, tsh.Post_Date, 103) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CONVERT(DATE, tsh.Post_Date, 103) <= @EndDate)
    ORDER BY tsh.Post_Date DESC, tsh.Doc_No, tsd.Id;
END
GO

-- =============================================
-- 18. ACC_sp_GetTransactionListByTagGroup (Supplier-focused)
-- Already done in Phase 1 - this is the same SP
-- =============================================

PRINT 'Phase 3 (Purchases & Suppliers) completed - 17 stored procedures rewritten.';
