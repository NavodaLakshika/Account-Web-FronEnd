-- ===================================================================
-- PHASE 4: BANKING & SYSTEM AUDIT REPORTS
-- ===================================================================

-- =============================================
-- 1. ACC_sp_GetReconciliationReports
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetReconciliationReports]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetReconciliationReports]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetReconciliationReports]
    @CompanyId NVARCHAR(50),
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = 'Accrual',
    @DisplayColumnsBy NVARCHAR(50) = 'Total',
    @CompareTo NVARCHAR(50) = 'None'
AS
BEGIN
    SET NOCOUNT ON;

    -- Bank reconciliation report showing cleared vs uncleared transactions
    SELECT 
        td.Acc_Code AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, td.Acc_Code) AS AccountName,
        td.Doc_No AS DocumentNo,
        td.Post_Date AS TransactionDate,
        td.Amount AS Debit,
        td.Credit,
        CASE WHEN ISNULL(td.Reconcile_Chk, 0) = 1 THEN 'Cleared' ELSE 'Uncleared' END AS ReconcileStatus,
        td.Memo,
        td.Company_Id AS CompanyCode
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type = 'ASSETS'
      AND (sa.Sub_Acc_Name LIKE '%Bank%' OR sa.Sub_Acc_Name LIKE '%Cash%')
    ORDER BY td.Post_Date, td.Doc_No;
END
GO

-- =============================================
-- 2. ACC_sp_GetAuditLog
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetAuditLog]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetAuditLog]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetAuditLog]
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
        sl.Id_No AS Id,
        sl.Transaction_Id AS TransactionId,
        sl.Transaction_Name AS TransactionName,
        sl.Doc_Number AS DocumentNo,
        sl.Emp_Code AS EmployeeCode,
        sl.Transaction_Date AS TransactionDate,
        sl.Insert_Date AS LoggedDate
    FROM dbo.ACC_Systemlog sl
    WHERE (@StartDate IS NULL OR sl.Transaction_Date >= @StartDate)
      AND (@EndDate IS NULL OR sl.Transaction_Date <= @EndDate)
    ORDER BY sl.Insert_Date DESC, sl.Id_No DESC;
END
GO

-- =============================================
-- 3. ACC_sp_GetDepositDetail
-- =============================================
-- Already exists with real implementation, but ensure it's correct
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetDepositDetail]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetDepositDetail]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetDepositDetail]
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
        Doc_No AS DocumentNo,
        Post_Date AS PostDate,
        PayType AS PaymentType,
        Reference,
        Vendor_Id AS PayeeCode,
        Balance AS Amount,
        CostCenter,
        UserName,
        IsDeposited,
        Cheque_No AS ChequeNo,
        Cheque_Date AS ChequeDate
    FROM dbo.ACC_UnDepositedFund
    WHERE (@CompanyId IS NULL OR Comp_ID = @CompanyId)
      AND (@StartDate IS NULL OR Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR Post_Date <= @EndDate)
    ORDER BY Post_Date DESC, Id;
END
GO

-- =============================================
-- 4. ACC_sp_GetChequeRegister
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetChequeRegister]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetChequeRegister]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetChequeRegister]
    @CompanyId NVARCHAR(50),
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = 'Accrual',
    @DisplayColumnsBy NVARCHAR(50) = 'Total',
    @CompareTo NVARCHAR(50) = 'None'
AS
BEGIN
    SET NOCOUNT ON;

    -- Cheques issued (from cheque writing module)
    SELECT 
        'Issued' AS ChequeType,
        wch.Doc_No AS DocumentNo,
        wch.Post_Date AS TransactionDate,
        wch.Chq_Date AS ChequeDate,
        wch.Chq_No AS ChequeNo,
        wch.Vendor_Id AS PayeeCode,
        wch.Payee AS PayeeName,
        wch.Amount,
        wch.Memo,
        wch.Bank_Acc AS BankAccount,
        wch.Cost_Center AS CostCenter
    FROM dbo.ACC_WriteChq_Header wch
    WHERE (@CompanyId IS NULL OR wch.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CONVERT(DATE, wch.Post_Date, 103) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CONVERT(DATE, wch.Post_Date, 103) <= @EndDate)

    UNION ALL

    -- Cheques received (from CIH)
    SELECT 
        'Received' AS ChequeType,
        h.DocNo AS DocumentNo,
        NULL AS TransactionDate,
        d.ChequeDate,
        d.ChequeNo,
        NULL AS PayeeCode,
        h.BankName AS PayeeName,
        d.Amount,
        d.Memo,
        h.BankCode AS BankAccount,
        NULL AS CostCenter
    FROM ACC_CIH_Header h
    JOIN ACC_CIH_Details d ON h.Id = d.HeaderId
    WHERE RTRIM(LTRIM(h.Company)) = @CompanyId
      AND (@StartDate IS NULL OR d.ChequeDate >= @StartDate)
      AND (@EndDate IS NULL OR d.ChequeDate <= @EndDate)

    ORDER BY ChequeDate DESC, ChequeType;
END
GO

-- =============================================
-- 5. ACC_sp_GetCustomerPhoneList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetCustomerPhoneList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetCustomerPhoneList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetCustomerPhoneList]
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
        c.Code AS CustomerCode,
        c.Cust_Name AS CustomerName,
        c.Phone,
        c.Email,
        c.Cont_Person AS ContactPerson,
        c.Fax
    FROM dbo.ACC_Customer c
    WHERE c.Company_Code = @CompanyId
    ORDER BY c.Cust_Name;
END
GO

-- =============================================
-- 6. ACC_sp_GetCustomerContactList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetCustomerContactList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetCustomerContactList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetCustomerContactList]
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
        c.Code AS CustomerCode,
        c.Cust_Name AS CustomerName,
        c.Address1,
        c.Address2,
        c.Phone,
        c.Email,
        c.Cont_Person AS ContactPerson,
        c.Web,
        c.Bank,
        c.VAT_Number,
        c.Credit_Period,
        c.Credit_Limit,
        c.Type AS CustomerType
    FROM dbo.ACC_Customer c
    WHERE c.Company_Code = @CompanyId
    ORDER BY c.Cust_Name;
END
GO

-- =============================================
-- 7. ACC_sp_GetPaymentMethodList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetPaymentMethodList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetPaymentMethodList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetPaymentMethodList]
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
        pm.Mode_ID AS Id,
        pm.Mode_Name AS PaymentMethod,
        pm.Mode_Code AS MethodCode
    FROM dbo.ACC_Payment_Mode pm
    ORDER BY pm.Mode_Name;
END
GO

-- =============================================
-- 8. ACC_sp_GetEmployeeContactList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetEmployeeContactList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetEmployeeContactList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetEmployeeContactList]
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
        e.Emp_Code AS EmployeeCode,
        e.Emp_Name AS EmployeeName,
        e.Email,
        e.Phone_Number AS Phone,
        e.Create_User AS CreatedBy
    FROM dbo.ACC_Employee e
    ORDER BY e.Emp_Name;
END
GO

-- =============================================
-- 9. ACC_sp_GetUnbilledTime
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetUnbilledTime]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetUnbilledTime]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetUnbilledTime]
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
        ta.Id,
        ta.Emp_Code AS EmployeeCode,
        ISNULL(e.Emp_Name, ta.Emp_Code) AS EmployeeName,
        ta.Cust_Code AS CustomerCode,
        ta.Activity_Date AS ActivityDate,
        ta.Hours AS TotalHours,
        ta.Pay_Type AS PayType,
        ta.Description
    FROM dbo.ACC_Time_Activity ta
    LEFT JOIN dbo.ACC_Employee e ON ta.Emp_Code = e.Emp_Code
    WHERE (@CompanyId IS NULL OR ta.Company_Code = @CompanyId)
      AND (@StartDate IS NULL OR ta.Activity_Date >= @StartDate)
      AND (@EndDate IS NULL OR ta.Activity_Date <= @EndDate)
    ORDER BY ta.Activity_Date DESC;
END
GO

-- =============================================
-- 10. ACC_sp_GetUnbilledCharges
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetUnbilledCharges]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetUnbilledCharges]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetUnbilledCharges]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Unbilled expenses/charges from various sources
    SELECT 
        'Expense' AS ChargeType,
        td.Doc_No AS DocumentNo,
        td.Post_Date AS TransactionDate,
        td.Acc_Code AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, td.Acc_Code) AS AccountName,
        td.Amount AS Debit,
        td.Credit,
        ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0) AS ChargeAmount,
        td.Acc_Name AS Description,
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), '') AS CustomerJob
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type = 'EXPENSES'
    ORDER BY td.Post_Date DESC;
END
GO

-- =============================================
-- 11. ACC_sp_GetTimeActivitiesByEmployeeDetail
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetTimeActivitiesByEmployeeDetail]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetTimeActivitiesByEmployeeDetail]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetTimeActivitiesByEmployeeDetail]
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
        ISNULL(e.Emp_Name, ta.Emp_Code) AS EmployeeName,
        ta.Emp_Code AS EmployeeCode,
        ta.Id AS ActivityId,
        ta.Activity_Date AS ActivityDate,
        ta.Cust_Code AS CustomerCode,
        ta.Hours AS Hours,
        ta.Pay_Type AS PayType,
        ta.Description
    FROM dbo.ACC_Time_Activity ta
    LEFT JOIN dbo.ACC_Employee e ON ta.Emp_Code = e.Emp_Code
    WHERE (@CompanyId IS NULL OR ta.Company_Code = @CompanyId)
      AND (@StartDate IS NULL OR ta.Activity_Date >= @StartDate)
      AND (@EndDate IS NULL OR ta.Activity_Date <= @EndDate)
    ORDER BY EmployeeName, ta.Activity_Date;
END
GO

-- =============================================
-- 12. ACC_sp_GetTimesheetDetailByEmployee
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetTimesheetDetailByEmployee]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetTimesheetDetailByEmployee]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetTimesheetDetailByEmployee]
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
        ISNULL(e.Emp_Name, ta.Emp_Code) AS EmployeeName,
        ta.Emp_Code AS EmployeeCode,
        ta.Activity_Date AS ActivityDate,
        DATENAME(dw, ta.Activity_Date) AS DayOfWeek,
        ta.Hours AS Hours,
        ta.Pay_Type AS PayType,
        ta.Description,
        ta.Cust_Code AS CustomerCode
    FROM dbo.ACC_Time_Activity ta
    LEFT JOIN dbo.ACC_Employee e ON ta.Emp_Code = e.Emp_Code
    WHERE (@CompanyId IS NULL OR ta.Company_Code = @CompanyId)
      AND (@StartDate IS NULL OR ta.Activity_Date >= @StartDate)
      AND (@EndDate IS NULL OR ta.Activity_Date <= @EndDate)
    ORDER BY EmployeeName, ta.Activity_Date;
END
GO

-- =============================================
-- 13. ACC_sp_GetTimeSummaryByPayType
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetTimeSummaryByPayType]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetTimeSummaryByPayType]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetTimeSummaryByPayType]
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
        ta.Pay_Type AS PayType,
        COUNT(*) AS ActivityCount,
        SUM(ISNULL(ta.Hours, 0)) AS TotalHours,
        ISNULL(e.Emp_Name, ta.Emp_Code) AS EmployeeName,
        ta.Emp_Code AS EmployeeCode
    FROM dbo.ACC_Time_Activity ta
    LEFT JOIN dbo.ACC_Employee e ON ta.Emp_Code = e.Emp_Code
    WHERE (@CompanyId IS NULL OR ta.Company_Code = @CompanyId)
      AND (@StartDate IS NULL OR ta.Activity_Date >= @StartDate)
      AND (@EndDate IS NULL OR ta.Activity_Date <= @EndDate)
    GROUP BY ta.Pay_Type, ISNULL(e.Emp_Name, ta.Emp_Code), ta.Emp_Code
    ORDER BY EmployeeName, PayType;
END
GO

-- =============================================
-- 14. ACC_sp_GetRecenteditedTimeActivities
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetRecenteditedTimeActivities]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetRecenteditedTimeActivities]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetRecenteditedTimeActivities]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 50
        ta.Id,
        ISNULL(e.Emp_Name, ta.Emp_Code) AS EmployeeName,
        ta.Activity_Date AS ActivityDate,
        ta.Cust_Code AS CustomerCode,
        ta.Hours AS Hours,
        ta.Pay_Type AS PayType,
        ta.Description
    FROM dbo.ACC_Time_Activity ta
    LEFT JOIN dbo.ACC_Employee e ON ta.Emp_Code = e.Emp_Code
    WHERE (@CompanyId IS NULL OR ta.Company_Code = @CompanyId)
    ORDER BY ta.Activity_Date DESC;
END
GO

-- =============================================
-- 15. ACC_sp_GetTaxLiabilityReport
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetTaxLiabilityReport]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetTaxLiabilityReport]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetTaxLiabilityReport]
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
        'Sales Tax Output' AS TaxType,
        td.Doc_No AS DocumentNo,
        td.Post_Date AS TransactionDate,
        td.Acc_Code AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, td.Acc_Code) AS AccountName,
        SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) AS TaxableAmount,
        'Standard' AS TaxRate,
        SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) * 0.15 AS TaxAmount
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type = 'INCOME'
    GROUP BY td.Doc_No, td.Post_Date, td.Acc_Code, ISNULL(sa.Sub_Acc_Name, td.Acc_Code)

    UNION ALL

    SELECT 
        'Input Tax (VAT on Purchases)' AS TaxType,
        bh.Doc_No AS DocumentNo,
        bh.Post_Date AS TransactionDate,
        bh.Vendor_Id AS AccountCode,
        ISNULL(s.Supplier_Name, bh.Vendor_Id) AS AccountName,
        ISNULL(bh.Net_Amount, 0) AS TaxableAmount,
        'Standard' AS TaxRate,
        ISNULL(bh.Net_Amount, 0) * 0.15 AS TaxAmount
    FROM dbo.ACC_Bill_Header bh
    LEFT JOIN dbo.ACC_Supplier s ON bh.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR bh.Company = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) <= @EndDate)
    ORDER BY TaxType, TransactionDate;
END
GO

-- =============================================
-- 16. ACC_sp_GetInventoryValuationSummary
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetInventoryValuationSummary]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetInventoryValuationSummary]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetInventoryValuationSummary]
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
        ISNULL(sm.Qty, 0) AS StockQuantity,
        ISNULL(p.Purchase_price, 0) AS AvgCost,
        ISNULL(sm.Qty, 0) * ISNULL(p.Purchase_price, 0) AS StockValue,
        ISNULL(p.Selling_price, 0) AS SellingPrice,
        ISNULL(sm.Qty, 0) * ISNULL(p.Selling_price, 0) AS SalesValue,
        sm.Reorder_Level AS ReorderLevel,
        cat.Cat_Name AS Category
    FROM dbo.ACC_Product p
    LEFT JOIN dbo.ACC_Stock_Master sm ON p.Code = sm.Prod_Code AND RTRIM(LTRIM(sm.Comp_Code)) = @CompanyId
    LEFT JOIN dbo.ACC_Category cat ON p.Cat_Code = cat.Code AND RTRIM(LTRIM(cat.Company)) = @CompanyId
    WHERE ISNULL(sm.Qty, 0) > 0
    ORDER BY StockValue DESC;
END
GO

-- =============================================
-- 17. ACC_sp_GetInventoryValuationDetail
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetInventoryValuationDetail]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetInventoryValuationDetail]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetInventoryValuationDetail]
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
        sm.Comp_Code AS CompanyCode,
        ISNULL(sm.Opening_Stock, 0) AS OpeningStock,
        ISNULL(sm.Qty, 0) AS CurrentQuantity,
        ISNULL(p.Purchase_price, 0) AS UnitCost,
        ISNULL(sm.Qty, 0) * ISNULL(p.Purchase_price, 0) AS TotalValue,
        sm.Reorder_Level AS ReorderLevel,
        sm.Reorder_Qty AS ReorderQty,
        sm.Minus_Allow AS AllowNegative,
        sm.User_Name AS LastUpdatedBy
    FROM dbo.ACC_Stock_Master sm
    LEFT JOIN dbo.ACC_Product p ON sm.Prod_Code = p.Code
    WHERE RTRIM(LTRIM(sm.Comp_Code)) = @CompanyId
    ORDER BY p.Prod_Name;
END
GO

-- =============================================
-- 18. ACC_sp_GetStockTakeWorksheet
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetStockTakeWorksheet]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetStockTakeWorksheet]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetStockTakeWorksheet]
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
        ISNULL(sm.Qty, 0) AS SystemQuantity,
        NULL AS PhysicalQuantity,
        NULL AS Difference,
        NULL AS Remarks,
        sm.Reorder_Level AS ReorderLevel,
        sm.Reorder_Qty AS ReorderQty
    FROM dbo.ACC_Product p
    LEFT JOIN dbo.ACC_Stock_Master sm ON p.Code = sm.Prod_Code AND RTRIM(LTRIM(sm.Comp_Code)) = @CompanyId
    WHERE (sm.Qty > 0 OR sm.Qty IS NOT NULL)
    ORDER BY p.Prod_Name;
END
GO

-- =============================================
-- 19. ACC_sp_GetProjectProfitabilitySummary
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetProjectProfitabilitySummary]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetProjectProfitabilitySummary]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetProjectProfitabilitySummary]
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
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), 'Unknown') AS ProjectName,
        SUM(CASE WHEN sa.Acc_Type = 'INCOME' THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) AS ProjectIncome,
        SUM(CASE WHEN sa.Acc_Type IN ('EXPENSES', 'COST OF SALES') THEN ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0) ELSE 0 END) AS ProjectCost,
        SUM(CASE WHEN sa.Acc_Type = 'INCOME' THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END)
        - SUM(CASE WHEN sa.Acc_Type IN ('EXPENSES', 'COST OF SALES') THEN ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0) ELSE 0 END) AS ProjectProfit,
        COUNT(DISTINCT td.Doc_No) AS TransactionCount
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND NULLIF(LTRIM(RTRIM(td.Cust_Job)), '') IS NOT NULL
    GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), 'Unknown')
    ORDER BY ProjectProfit DESC;
END
GO

-- =============================================
-- 20. ACC_sp_GetProductitemProfitabilityByCustomer
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetProductitemProfitabilityByCustomer]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetProductitemProfitabilityByCustomer]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetProductitemProfitabilityByCustomer]
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
        td.Acc_Code AS ProductCode,
        MAX(ISNULL(sa.Sub_Acc_Name, td.Acc_Code)) AS ProductName,
        SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) AS Revenue,
        SUM(ISNULL(td.Amount, 0)) AS Cost,
        SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Amount, 0)) AS Profit,
        CASE WHEN SUM(ISNULL(td.Amount, 0)) = 0 THEN 0 
            ELSE (SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Amount, 0))) / SUM(ISNULL(td.Amount, 0)) * 100 
        END AS ProfitMarginPercent
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND NULLIF(LTRIM(RTRIM(td.Cust_Job)), '') IS NOT NULL
      AND sa.Acc_Type = 'INCOME'
    GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), 'Unknown'), td.Acc_Code
    HAVING (SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0))) <> 0
    ORDER BY Profit DESC;
END
GO

PRINT 'Phase 4 (Banking & System Audit) completed - 20 stored procedures rewritten.';
