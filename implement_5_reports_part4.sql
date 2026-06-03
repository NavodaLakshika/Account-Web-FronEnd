USE Acc_Web;
GO

-- 16. Unbilled charges
ALTER PROCEDURE dbo.ACC_sp_GetUnbilledCharges
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- No direct unbilled charges tracking table exists, returning empty structured set
    SELECT 
        CAST('' AS NVARCHAR(100)) AS Customer_Name,
        CAST('' AS NVARCHAR(50)) AS Date,
        CAST('' AS NVARCHAR(100)) AS Description,
        CAST(0.0 AS DECIMAL(18,2)) AS Amount
    WHERE 1 = 0;
END;
GO

-- 17. Sales by Customer Summary
ALTER PROCEDURE dbo.ACC_sp_GetSalesByCustomerSummary
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(c.Cust_Name), 'Unknown Customer') AS Customer_Name,
        SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) AS Total_Sales
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    LEFT JOIN ACC_Customer c ON td.Cust_Job = c.Code AND c.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type = 'INCOME'
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(c.Code, td.Cust_Job)
    HAVING SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) <> 0
    ORDER BY Total_Sales DESC;
END;
GO

-- 18. Sales by Customer Detail
ALTER PROCEDURE dbo.ACC_sp_GetSalesByCustomerDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(c.Cust_Name), 'Unknown Customer') AS Customer_Name,
        MAX(td.Post_Date) AS Post_Date,
        td.Doc_No AS Document_No,
        MAX(td.Prod_Code) AS Product_Code,
        MAX(td.Depend_Acc_Name) AS Description,
        SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) AS Amount
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    LEFT JOIN ACC_Customer c ON td.Cust_Job = c.Code AND c.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type = 'INCOME'
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(c.Code, td.Cust_Job), td.Doc_No
    HAVING SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) <> 0
    ORDER BY Customer_Name, MAX(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) DESC;
END;
GO

-- 19. Sales by Product/Service Summary
ALTER PROCEDURE dbo.ACC_sp_GetSalesByProductserviceSummary
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(p.Prod_Name), 'Unknown Product') AS Product_Name,
        SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) AS Total_Sales
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    LEFT JOIN ACC_Product p ON td.Prod_Code = p.Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type = 'INCOME'
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(p.Code, td.Prod_Code)
    HAVING SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) <> 0
    ORDER BY Total_Sales DESC;
END;
GO

-- 20. Sales by Product/Service Detail
ALTER PROCEDURE dbo.ACC_sp_GetSalesByProductserviceDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(p.Prod_Name), 'Unknown Product') AS Product_Name,
        ISNULL(MAX(c.Cust_Name), 'Unknown Customer') AS Customer_Name,
        MAX(td.Post_Date) AS Post_Date,
        td.Doc_No AS Document_No,
        SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) AS Amount
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    LEFT JOIN ACC_Product p ON td.Prod_Code = p.Code
    LEFT JOIN ACC_Customer c ON td.Cust_Job = c.Code AND c.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type = 'INCOME'
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(p.Code, td.Prod_Code), td.Doc_No
    HAVING SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) <> 0
    ORDER BY Product_Name, MAX(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) DESC;
END;
GO
