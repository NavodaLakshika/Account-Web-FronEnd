USE Acc_Web;
GO

-- 11. Collections Report
ALTER PROCEDURE dbo.ACC_sp_GetCollectionsReport
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(c.Cust_Name), 'Unknown Customer') AS Customer_Name,
        ISNULL(MAX(c.Phone), 'N/A') AS Phone,
        ISNULL(MAX(c.Email), 'N/A') AS Email,
        td.Doc_No AS Invoice_No,
        MAX(td.Post_Date) AS Post_Date,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Open_Balance
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Customer c ON td.Cust_Job = c.Code AND c.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND td.Acc_Code = '12000' -- Accounts Receivable
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(c.Code, td.Cust_Job), td.Doc_No
    HAVING SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) > 0
    ORDER BY Customer_Name, Open_Balance DESC;
END;
GO

-- 12. Invoice List
ALTER PROCEDURE dbo.ACC_sp_GetInvoiceList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(c.Cust_Name), 'Unknown Customer') AS Customer_Name,
        td.Doc_No AS Invoice_No,
        MAX(td.Post_Date) AS Post_Date,
        MAX(td.Depend_Acc_Name) AS Description,
        SUM(ISNULL(td.Amount, 0)) AS Invoice_Amount,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Open_Balance
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

-- 13. Statement List
ALTER PROCEDURE dbo.ACC_sp_GetStatementList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(c.Cust_Name), 'Unknown Customer') AS Customer_Name,
        CONVERT(VARCHAR(10), GETDATE(), 120) AS Statement_Date,
        SUM(ISNULL(td.Amount, 0)) AS Total_Invoiced,
        SUM(ISNULL(td.Credit, 0)) AS Total_Paid,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Statement_Balance
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Customer c ON td.Cust_Job = c.Code AND c.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND td.Acc_Code = '12000' -- Accounts Receivable
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(c.Code, td.Cust_Job)
    ORDER BY Customer_Name;
END;
GO

-- 14. Terms List
ALTER PROCEDURE dbo.ACC_sp_GetTermsList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        TermCode AS Term_Code,
        TermName AS Term_Name,
        Days AS Days_Due,
        CASE WHEN Inactive = 1 THEN 'Inactive' ELSE 'Active' END AS Status
    FROM ACC_Payment_Terms
    ORDER BY TermName;
END;
GO

-- 15. Unbilled time
ALTER PROCEDURE dbo.ACC_sp_GetUnbilledTime
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- No time tracking tables exist, returning empty structured set
    SELECT 
        CAST('' AS NVARCHAR(100)) AS Employee_Name,
        CAST('' AS NVARCHAR(100)) AS Customer_Name,
        CAST('' AS NVARCHAR(50)) AS Date,
        CAST(0.0 AS DECIMAL(18,2)) AS Hours,
        CAST(0.0 AS DECIMAL(18,2)) AS Amount
    WHERE 1 = 0;
END;
GO
