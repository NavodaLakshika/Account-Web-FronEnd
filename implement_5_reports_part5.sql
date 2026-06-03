USE Acc_Web;
GO

-- 21. Product/Service List
ALTER PROCEDURE dbo.ACC_sp_GetProductserviceList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Code AS Product_Code,
        Prod_Name AS Product_Name
    FROM ACC_Product
    ORDER BY Prod_Name;
END;
GO

-- 22. Income by Customer Summary
ALTER PROCEDURE dbo.ACC_sp_GetIncomeByCustomerSummary
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(c.Cust_Name), 'Unknown Customer') AS Customer_Name,
        SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) AS Total_Income
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    LEFT JOIN ACC_Customer c ON td.Cust_Job = c.Code AND c.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type = 'INCOME'
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(c.Code, td.Cust_Job)
    HAVING SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) <> 0
    ORDER BY Total_Income DESC;
END;
GO

-- 23. Customer Contact List
ALTER PROCEDURE dbo.ACC_sp_GetCustomerContactList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Code AS Customer_ID,
        Cust_Name AS Customer_Name,
        ISNULL(Phone, 'N/A') AS Phone,
        ISNULL(Email, 'N/A') AS Email,
        ISNULL(Address1, '') + CASE WHEN Address2 IS NOT NULL AND Address2 <> '' THEN ', ' + Address2 ELSE '' END AS Address,
        ISNULL(Cont_Person, 'N/A') AS Contact_Person
    FROM ACC_Customer
    WHERE (@CompanyId IS NULL OR Company_Code = @CompanyId)
    ORDER BY Cust_Name;
END;
GO

-- 24. Payment Method List
ALTER PROCEDURE dbo.ACC_sp_GetPaymentMethodList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Code AS Method_Code,
        Name AS Method_Name
    FROM ACC_PaymentMethod
    WHERE Company = 'ALL' OR Company = @CompanyId OR @CompanyId IS NULL
    ORDER BY Name;
END;
GO

-- 25. Transaction List by Customer
ALTER PROCEDURE dbo.ACC_sp_GetTransactionListByCustomer
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
        MAX(sa.Sub_Acc_Name) AS Account_Name,
        MAX(td.Depend_Acc_Name) AS Description,
        SUM(ISNULL(td.Amount, 0)) AS Debit,
        SUM(ISNULL(td.Credit, 0)) AS Credit,
        SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) AS Net_Amount
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    LEFT JOIN ACC_Customer c ON td.Cust_Job = c.Code AND c.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(c.Code, td.Cust_Job), td.Doc_No
    ORDER BY Customer_Name, MAX(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) DESC;
END;
GO
