USE Acc_Web;
GO

-- 31. Invoices and Received Payments
ALTER PROCEDURE dbo.ACC_sp_GetInvoicesAndReceivedPayments
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(c.Cust_Name), 'Unknown Customer') AS Customer_Name,
        MAX(sa.Sub_Acc_Name) AS Transaction_Type,
        MAX(td.Post_Date) AS Date,
        td.Doc_No,
        SUM(ISNULL(td.Amount, 0)) + SUM(ISNULL(td.Credit, 0)) AS Amount
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    LEFT JOIN ACC_Customer c ON td.Cust_Job = c.Code AND c.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (sa.Sub_Code = '12000' OR sa.Acc_Type IN ('BANK/CASH', 'CREDIT CARD'))
      AND td.Cust_Job IS NOT NULL AND td.Cust_Job <> ''
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(c.Code, td.Cust_Job), td.Doc_No
    ORDER BY Customer_Name, MAX(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) DESC;
END;
GO

-- 32. Purchase List
ALTER PROCEDURE dbo.ACC_sp_GetPurchaseList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(s.Supplier_Name), 'Unknown Supplier') AS Supplier_Name,
        b.Doc_No AS Bill_No,
        MAX(b.Post_Date) AS Date,
        MAX(b.Bill_Due_Date) AS Due_Date,
        SUM(ISNULL(b.Net_Amount, 0)) AS Amount
    FROM ACC_Bill_Header b
    LEFT JOIN ACC_Supplier s ON b.Vendor_Id = s.Code AND s.Company_Code = b.Company
    WHERE (@CompanyId IS NULL OR b.Company = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, b.Post_Date, 103), TRY_CAST(b.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, b.Post_Date, 103), TRY_CAST(b.Post_Date AS DATE)) <= @EndDate)
    GROUP BY b.Doc_No
    ORDER BY MAX(COALESCE(TRY_CONVERT(DATE, b.Post_Date, 103), TRY_CAST(b.Post_Date AS DATE))) DESC;
END;
GO

-- 33. Purchases by Supplier Detail
ALTER PROCEDURE dbo.ACC_sp_GetPurchasesBySupplierDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(s.Supplier_Name), 'Unknown Supplier') AS Supplier_Name,
        MAX(b.Post_Date) AS Date,
        b.Doc_No AS Bill_No,
        MAX(i.Discription) AS Item_Name,
        SUM(ISNULL(i.Cost * i.Qty, 0)) AS Amount
    FROM ACC_Bill_Header b
    JOIN ACC_Bill_Item i ON b.Doc_No = i.Doc_No
    LEFT JOIN ACC_Supplier s ON b.Vendor_Id = s.Code AND s.Company_Code = b.Company
    WHERE (@CompanyId IS NULL OR b.Company = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, b.Post_Date, 103), TRY_CAST(b.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, b.Post_Date, 103), TRY_CAST(b.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(s.Code, b.Vendor_Id), b.Doc_No, i.Item_Id
    ORDER BY Supplier_Name, MAX(COALESCE(TRY_CONVERT(DATE, b.Post_Date, 103), TRY_CAST(b.Post_Date AS DATE))) DESC;
END;
GO

-- 34. Expenses by Supplier Summary
ALTER PROCEDURE dbo.ACC_sp_GetExpensesBySupplierSummary
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(s.Supplier_Name), 'Unknown Supplier') AS Supplier_Name,
        SUM(ISNULL(b.Net_Amount, 0)) AS Total_Expenses
    FROM ACC_Bill_Header b
    LEFT JOIN ACC_Supplier s ON b.Vendor_Id = s.Code AND s.Company_Code = b.Company
    WHERE (@CompanyId IS NULL OR b.Company = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, b.Post_Date, 103), TRY_CAST(b.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, b.Post_Date, 103), TRY_CAST(b.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(s.Code, b.Vendor_Id)
    ORDER BY Total_Expenses DESC;
END;
GO

-- 35. Transaction List by Supplier
ALTER PROCEDURE dbo.ACC_sp_GetTransactionListBySupplier
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(s.Supplier_Name), 'Unknown Supplier') AS Supplier_Name,
        MAX(td.Post_Date) AS Date,
        td.Doc_No,
        MAX(sa.Sub_Acc_Name) AS Account_Name,
        SUM(ISNULL(td.Amount, 0)) AS Debit,
        SUM(ISNULL(td.Credit, 0)) AS Credit,
        SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) AS Net_Amount
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    JOIN ACC_Supplier s ON td.Cust_Job = s.Code AND s.Company_Code = td.Company_Id -- Vendor Code mapped to Cust_Job
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(s.Code, td.Cust_Job), td.Doc_No
    ORDER BY Supplier_Name, MAX(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) DESC;
END;
GO
