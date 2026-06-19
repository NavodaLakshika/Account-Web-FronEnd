IF OBJECT_ID('dbo.ACC_sp_GetAccountsReceivableAgeingSummary', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetAccountsReceivableAgeingSummary
GO
CREATE PROCEDURE dbo.ACC_sp_GetAccountsReceivableAgeingSummary
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
        ISNULL(c.Cust_Name, ISNULL(th.Payee, th.Vendor_Id)) AS Customer_Name,
        SUM(CASE WHEN DATEDIFF(day, ISNULL(th.Expected_Date, th.Post_Date), @AsOfDate) <= 0 THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS Current_Balance,
        SUM(CASE WHEN DATEDIFF(day, ISNULL(th.Expected_Date, th.Post_Date), @AsOfDate) BETWEEN 1 AND 30 THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS [1_30_Days_Balance],
        SUM(CASE WHEN DATEDIFF(day, ISNULL(th.Expected_Date, th.Post_Date), @AsOfDate) BETWEEN 31 AND 60 THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS [31_60_Days_Balance],
        SUM(CASE WHEN DATEDIFF(day, ISNULL(th.Expected_Date, th.Post_Date), @AsOfDate) BETWEEN 61 AND 90 THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS [61_90_Days_Balance],
        SUM(CASE WHEN DATEDIFF(day, ISNULL(th.Expected_Date, th.Post_Date), @AsOfDate) > 90 THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS Over_90_Days_Balance,
        SUM(ISNULL(th.Net_Amount, 0)) AS Total_Balance
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Account = '12000' OR th.Acc_Type = '12000' OR th.Vendor_Id LIKE 'CUS%')
      AND th.Post_Date <= @AsOfDate
    GROUP BY c.Cust_Name, th.Payee, th.Vendor_Id
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY Customer_Name;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetCustomerBalanceSummary', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetCustomerBalanceSummary
GO
CREATE PROCEDURE dbo.ACC_sp_GetCustomerBalanceSummary
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
        ISNULL(c.Cust_Name, ISNULL(th.Payee, th.Vendor_Id)) AS Customer_Name,
        SUM(ISNULL(th.Net_Amount, 0)) AS Total_Balance
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Account = '12000' OR th.Acc_Type = '12000' OR th.Vendor_Id LIKE 'CUS%')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    GROUP BY c.Cust_Name, th.Payee, th.Vendor_Id
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY Customer_Name;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetCustomerBalanceDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetCustomerBalanceDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetCustomerBalanceDetail
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
        ISNULL(c.Cust_Name, ISNULL(th.Payee, th.Vendor_Id)) AS Customer_Name,
        th.Post_Date AS Transaction_Date,
        CASE 
            WHEN th.Doc_No LIKE 'INV%' THEN 'Invoice'
            WHEN th.Doc_No LIKE 'PEC%' THEN 'Payment/Receipt'
            WHEN th.Doc_No LIKE 'EBN%' THEN 'Expense Bill'
            WHEN th.Doc_No LIKE 'GRN%' THEN 'Goods Receipt'
            ELSE 'Journal Entry'
        END AS Transaction_Type,
        th.Doc_No AS Document_No,
        th.Expected_Date AS Due_Date,
        ISNULL(th.Net_Amount, 0) AS Balance
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Account = '12000' OR th.Acc_Type = '12000' OR th.Vendor_Id LIKE 'CUS%')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    ORDER BY Customer_Name, th.Post_Date;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetInvoiceList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetInvoiceList
GO
CREATE PROCEDURE dbo.ACC_sp_GetInvoiceList
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
        th.Post_Date AS Date,
        CASE 
            WHEN th.Doc_No LIKE 'INV%' THEN 'Invoice'
            WHEN th.Doc_No LIKE 'PEC%' THEN 'Payment/Receipt'
            WHEN th.Doc_No LIKE 'EBN%' THEN 'Expense Bill'
            ELSE 'Transaction'
        END AS Transaction_Type,
        th.Doc_No AS Document_No,
        ISNULL(c.Cust_Name, ISNULL(th.Payee, th.Vendor_Id)) AS Customer_Name,
        th.Expected_Date AS Due_Date,
        ISNULL(th.Net_Amount, 0) AS Amount_Balance,
        ISNULL(th.Net_Amount, 0) AS Open_Balance
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'INV%' OR th.Bill_Type = 1) 
      AND (th.Vendor_Id LIKE 'CUS%' OR th.Acc_Type = '12000' OR th.Account = '12000')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    ORDER BY th.Post_Date DESC;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetOpenInvoices', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetOpenInvoices
GO
CREATE PROCEDURE dbo.ACC_sp_GetOpenInvoices
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
        th.Post_Date AS Date,
        CASE 
            WHEN th.Doc_No LIKE 'INV%' THEN 'Invoice'
            WHEN th.Doc_No LIKE 'PEC%' THEN 'Payment/Receipt'
            WHEN th.Doc_No LIKE 'EBN%' THEN 'Expense Bill'
            ELSE 'Transaction'
        END AS Transaction_Type,
        th.Doc_No AS Document_No,
        ISNULL(c.Cust_Name, ISNULL(th.Payee, th.Vendor_Id)) AS Customer_Name,
        th.Expected_Date AS Due_Date,
        ISNULL(th.Net_Amount, 0) AS Amount_Balance,
        ISNULL(th.Net_Amount, 0) AS Open_Balance
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.ACC_Customer c ON th.Vendor_Id = c.Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (th.Doc_No LIKE 'INV%' OR th.Bill_Type = 1) 
      AND (th.Vendor_Id LIKE 'CUS%' OR th.Acc_Type = '12000' OR th.Account = '12000')
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
      AND ISNULL(th.Net_Amount, 0) > 0
    ORDER BY th.Post_Date DESC;
END
GO
