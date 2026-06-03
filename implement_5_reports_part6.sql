USE Acc_Web;
GO

-- 26. Estimates by Customer
ALTER PROCEDURE dbo.ACC_sp_GetEstimatesByCustomer
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- No estimates table currently available, returning empty structure
    SELECT 
        CAST('' AS NVARCHAR(100)) AS Customer_Name,
        CAST('' AS NVARCHAR(50)) AS Estimate_No,
        CAST('' AS NVARCHAR(50)) AS Date,
        CAST(0.0 AS DECIMAL(18,2)) AS Amount,
        CAST('' AS NVARCHAR(50)) AS Status
    WHERE 1 = 0;
END;
GO

-- 27. Deposit Detail
ALTER PROCEDURE dbo.ACC_sp_GetDepositDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        MAX(Post_Date) AS Deposit_Date,
        Doc_No AS Deposit_No,
        MAX(PayType) AS Payment_Type,
        SUM(ISNULL(Amount, 0)) AS Amount,
        CASE WHEN MAX(CAST(IsDeposited AS INT)) = 1 THEN 'Deposited' ELSE 'Undeposited' END AS Status
    FROM ACC_UnDepositedFund
    WHERE (@CompanyId IS NULL OR Comp_ID = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, Post_Date, 103), TRY_CAST(Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, Post_Date, 103), TRY_CAST(Post_Date AS DATE)) <= @EndDate)
    GROUP BY Doc_No
    ORDER BY MAX(COALESCE(TRY_CONVERT(DATE, Post_Date, 103), TRY_CAST(Post_Date AS DATE))) DESC;
END;
GO

-- 28. Bill Approval Status
ALTER PROCEDURE dbo.ACC_sp_GetBillApprovalStatus
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        b.Bill_No,
        ISNULL(MAX(s.Supplier_Name), 'Unknown Vendor') AS Vendor_Name,
        MAX(b.Post_Date) AS Bill_Date,
        MAX(b.Bill_Due_Date) AS Due_Date,
        SUM(ISNULL(b.Net_Amount, 0)) AS Amount,
        'Approved' AS Status -- Posted bills are implicitly approved in the current schema
    FROM ACC_Bill_Header b
    LEFT JOIN ACC_Supplier s ON b.Vendor_Id = s.Code AND s.Company_Code = b.Company
    WHERE (@CompanyId IS NULL OR b.Company = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, b.Post_Date, 103), TRY_CAST(b.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, b.Post_Date, 103), TRY_CAST(b.Post_Date AS DATE)) <= @EndDate)
    GROUP BY b.Bill_No
    ORDER BY MAX(COALESCE(TRY_CONVERT(DATE, b.Post_Date, 103), TRY_CAST(b.Post_Date AS DATE))) DESC;
END;
GO

-- 29. Product/Item Profitability by Customer
ALTER PROCEDURE dbo.ACC_sp_GetProductitemProfitabilityByCustomer
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(c.Cust_Name), 'Unknown Customer') AS Customer_Name,
        ISNULL(MAX(p.Prod_Name), 'Unknown Product') AS Product_Name,
        SUM(CASE WHEN sa.Acc_Type = 'INCOME' THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) AS Income,
        SUM(CASE WHEN sa.Acc_Type IN ('EXPENSES', 'COST OF SALES') THEN ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0) ELSE 0 END) AS Cost,
        SUM(CASE WHEN sa.Acc_Type = 'INCOME' THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) - 
        SUM(CASE WHEN sa.Acc_Type IN ('EXPENSES', 'COST OF SALES') THEN ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0) ELSE 0 END) AS Profit
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    LEFT JOIN ACC_Customer c ON td.Cust_Job = c.Code AND c.Company_Code = td.Company_Id
    LEFT JOIN ACC_Product p ON td.Prod_Code = p.Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES')
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(c.Code, td.Cust_Job), ISNULL(p.Code, td.Prod_Code)
    ORDER BY Customer_Name, Profit DESC;
END;
GO

-- 30. Invoice Approval Status
ALTER PROCEDURE dbo.ACC_sp_GetInvoiceApprovalStatus
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(c.Cust_Name), 'Unknown Customer') AS Customer_Name,
        td.Doc_No AS Invoice_No,
        MAX(td.Post_Date) AS Invoice_Date,
        SUM(ISNULL(td.Amount, 0)) AS Amount,
        CASE WHEN SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) > 0 THEN 'Pending' ELSE 'Paid / Approved' END AS Status
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Customer c ON td.Cust_Job = c.Code AND c.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND td.Acc_Code = '12000' -- Accounts Receivable
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(c.Code, td.Cust_Job), td.Doc_No
    ORDER BY MAX(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) DESC;
END;
GO
