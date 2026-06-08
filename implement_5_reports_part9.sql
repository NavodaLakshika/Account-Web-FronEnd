USE Acc_Web;
GO

-- 41. Bills and Applied Payments
ALTER PROCEDURE dbo.ACC_sp_GetBillsAndAppliedPayments
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(s.Supplier_Name), ISNULL(MAX(p.Vend_Name), 'Unknown Supplier')) AS Supplier_Name,
        p.Doc_No AS Bill_No,
        MAX(p.Pab_Doc) AS Payment_Doc,
        MAX(CAST(p.Create_Date AS DATE)) AS Payment_Date,
        SUM(ISNULL(p.To_Pay, 0)) AS Amount_Applied
    FROM ACC_Paybll_Sumary p
    LEFT JOIN ACC_Supplier s ON p.Vend_Id = s.Code AND s.Company_Code = p.Company
    WHERE (@CompanyId IS NULL OR p.Company = @CompanyId)
      AND (@StartDate IS NULL OR CAST(p.Create_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR CAST(p.Create_Date AS DATE) <= @EndDate)
      AND ISNULL(p.To_Pay, 0) > 0
    GROUP BY ISNULL(s.Code, p.Vend_Id), p.Doc_No
    ORDER BY Supplier_Name, MAX(CAST(p.Create_Date AS DATE)) DESC;
END;
GO

-- 42. Supplier Phone List
ALTER PROCEDURE dbo.ACC_sp_GetSupplierPhoneList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Supplier_Name,
        ISNULL(Phone, 'N/A') AS Phone,
        ISNULL(Fax, 'N/A') AS Mobile
    FROM ACC_Supplier
    WHERE (@CompanyId IS NULL OR Company_Code = @CompanyId)
    ORDER BY Supplier_Name;
END;
GO

-- 43. Supplier Balance Summary
ALTER PROCEDURE dbo.ACC_sp_GetSupplierBalanceSummary
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(s.Supplier_Name), td.Cust_Job) AS Supplier_Name,
        SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) AS Balance
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Supplier s ON td.Cust_Job = s.Code AND s.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND td.Acc_Code = '22000' -- Accounts Payable
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY td.Cust_Job
    HAVING (SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0))) <> 0
    ORDER BY Supplier_Name;
END;
GO

-- 44. Supplier Balance Detail
ALTER PROCEDURE dbo.ACC_sp_GetSupplierBalanceDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(s.Supplier_Name, td.Cust_Job) AS Supplier_Name,
        COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) AS Date,
        td.Doc_No,
        ISNULL(td.Credit, 0) AS Billed,
        ISNULL(td.Amount, 0) AS Paid,
        ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) AS Balance
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Supplier s ON td.Cust_Job = s.Code AND s.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND td.Acc_Code = '22000' -- Accounts Payable
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    ORDER BY Supplier_Name, Date DESC, td.Doc_No;
END;
GO

-- 45. Unpaid Bills
ALTER PROCEDURE dbo.ACC_sp_GetUnpaidBills
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(s.Supplier_Name), td.Cust_Job) AS Supplier_Name,
        td.Doc_No AS Bill_No,
        MAX(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) AS Date,
        DATEDIFF(day, MAX(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))), GETDATE()) AS Days_Past_Due,
        SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) AS Open_Balance
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Supplier s ON td.Cust_Job = s.Code AND s.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND td.Acc_Code = '22000' -- Accounts Payable
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY td.Cust_Job, td.Doc_No
    HAVING (SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0))) > 0
    ORDER BY Supplier_Name, Date ASC;
END;
GO
