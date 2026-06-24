-- ===================================================================
-- FIXES: Correct stored procedures that had wrong column references
-- ===================================================================

-- =============================================
-- FIX 1: ACC_sp_GetPaymentMethodList - Fix column names
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
-- FIX 2: ACC_sp_GetTermsList - Fix column names
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
-- FIX 3: ACC_sp_GetDepositDetail - Fix column names for ACC_UnDepositedFund
-- =============================================
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
-- FIX 4: ACC_sp_GetAuditLog - Fix column names for ACC_Systemlog
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
        Id_No AS Id,
        Transaction_Id AS TransactionId,
        Transaction_Name AS TransactionName,
        Doc_Number AS DocumentNumber,
        Emp_Code AS EmployeeCode,
        Transaction_Date AS TransactionDate,
        Insert_Date AS LoggedDate
    FROM dbo.ACC_Systemlog
    WHERE (@CompanyId IS NULL OR Transaction_Id LIKE '%' + @CompanyId + '%')
      AND (@StartDate IS NULL OR Transaction_Date >= @StartDate)
      AND (@EndDate IS NULL OR Transaction_Date <= @EndDate)
    ORDER BY Insert_Date DESC, Id_No DESC;
END
GO

-- =============================================
-- FIX 5: ACC_sp_GetTimeActivitiesByEmployeeDetail - Fix for actual ACC_Time_Activity schema
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
        ta.Hours AS TotalHours,
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
-- FIX 6: ACC_sp_GetTimeSummaryByPayType - Fix for actual schema
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
-- FIX 7: ACC_sp_GetRecenteditedTimeActivities - Fix for actual schema
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
-- FIX 8: ACC_sp_GetTimesheetDetailByEmployee - Fix for actual schema
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
-- FIX 9: ACC_sp_GetUnbilledTime - Fix for actual schema
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
-- FIX 10: ACC_sp_GetCustomerPhoneList - Fix column names
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
-- FIX 11: ACC_sp_GetCustomerContactList - Fix column names
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
-- FIX 12: ACC_sp_GetReconciliationReports - Fix Reconcile_Chk column
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
-- FIX 13: ACC_sp_GetEmployeeContactList - Fix column names
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
-- FIX 14: ACC_sp_GetChequeRegister - Fix column references 
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
-- FIX 15: ACC_sp_GetTaxLiabilityReport - Simplify table references
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

    -- Sales/Income - potential output tax
    SELECT 
        'Output Tax (Sales)' AS TaxType,
        td.Doc_No AS DocumentNo,
        td.Post_Date AS TransactionDate,
        td.Acc_Code AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, td.Acc_Code) AS AccountName,
        SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) AS TaxableAmount,
        SUM((ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) * 0.15) AS TaxAmount
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type = 'INCOME'
    GROUP BY td.Doc_No, td.Post_Date, td.Acc_Code, ISNULL(sa.Sub_Acc_Name, td.Acc_Code)

    UNION ALL

    -- Purchases/bills - potential input tax
    SELECT 
        'Input Tax (Purchases)' AS TaxType,
        bh.Doc_No AS DocumentNo,
        bh.Post_Date AS TransactionDate,
        bh.Vendor_Id AS AccountCode,
        ISNULL(s.Supplier_Name, bh.Vendor_Id) AS AccountName,
        ISNULL(bh.Net_Amount, 0) AS TaxableAmount,
        ISNULL(bh.Net_Amount, 0) * 0.15 AS TaxAmount
    FROM dbo.ACC_Bill_Header bh
    LEFT JOIN dbo.ACC_Supplier s ON bh.Vendor_Id = s.Code
    WHERE (@CompanyId IS NULL OR bh.Company = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CONVERT(DATE, bh.Post_Date, 103) <= @EndDate)
    ORDER BY TaxType, TransactionDate;
END
GO

PRINT 'All fixes applied successfully.';
