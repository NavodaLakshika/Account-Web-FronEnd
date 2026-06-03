USE Acc_Web;
GO

-- 6. Project Profitability Summary
ALTER PROCEDURE dbo.ACC_sp_GetProjectProfitabilitySummary
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(td.Cust_Job, 'Unassigned') AS Project_ID,
        SUM(CASE WHEN sa.Acc_Type = 'INCOME' THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) AS Income,
        SUM(CASE WHEN sa.Acc_Type IN ('EXPENSES', 'COST OF SALES') THEN ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0) ELSE 0 END) AS Expenses,
        SUM(CASE WHEN sa.Acc_Type = 'INCOME' THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) - 
        SUM(CASE WHEN sa.Acc_Type IN ('EXPENSES', 'COST OF SALES') THEN ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0) ELSE 0 END) AS Net_Profit
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
      AND sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES')
    GROUP BY td.Cust_Job
    ORDER BY Net_Profit DESC;
END;
GO

-- 7. Customer Balance Summary
ALTER PROCEDURE dbo.ACC_sp_GetCustomerBalanceSummary
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(c.Code, td.Cust_Job) AS Customer_ID,
        ISNULL(MAX(c.Cust_Name), 'Unknown Customer') AS Customer_Name,
        SUM(ISNULL(td.Amount, 0)) AS Total_Invoiced_Debit,
        SUM(ISNULL(td.Credit, 0)) AS Total_Paid_Credit,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Open_Balance
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Customer c ON td.Cust_Job = c.Code AND c.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND td.Acc_Code = '12000' -- Accounts Receivable
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(c.Code, td.Cust_Job)
    HAVING SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) <> 0
    ORDER BY Open_Balance DESC;
END;
GO

-- 8. Customer Balance Detail
ALTER PROCEDURE dbo.ACC_sp_GetCustomerBalanceDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(c.Cust_Name), 'Unknown Customer') AS Customer_Name,
        td.Doc_No AS Document_No,
        MAX(td.Post_Date) AS Post_Date,
        MAX(td.Depend_Acc_Name) AS Description,
        SUM(ISNULL(td.Amount, 0)) AS Debit,
        SUM(ISNULL(td.Credit, 0)) AS Credit,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Net_Amount
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Customer c ON td.Cust_Job = c.Code AND c.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND td.Acc_Code = '12000' -- Accounts Receivable
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(c.Code, td.Cust_Job), td.Doc_No
    ORDER BY Customer_Name, MAX(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) DESC;
END;
GO

-- 9. Open Invoices
ALTER PROCEDURE dbo.ACC_sp_GetOpenInvoices
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
        SUM(ISNULL(td.Amount, 0)) AS Original_Amount,
        SUM(ISNULL(td.Credit, 0)) AS Payments_Applied,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Open_Balance
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Customer c ON td.Cust_Job = c.Code AND c.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND td.Acc_Code = '12000' -- Accounts Receivable
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(c.Code, td.Cust_Job), td.Doc_No
    HAVING SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) > 0
    ORDER BY Invoice_Date ASC;
END;
GO

-- 10. Accounts receivable ageing detail
ALTER PROCEDURE dbo.ACC_sp_GetAccountsReceivableAgeingDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentDate DATE = ISNULL(@EndDate, GETDATE());

    SELECT 
        ISNULL(MAX(c.Cust_Name), 'Unknown Customer') AS Customer_Name,
        td.Doc_No AS Invoice_No,
        MAX(td.Post_Date) AS Invoice_Date,
        DATEDIFF(DAY, COALESCE(TRY_CONVERT(DATE, MAX(td.Post_Date), 103), TRY_CAST(MAX(td.Post_Date) AS DATE)), @CurrentDate) AS Age_Days,
        
        CASE 
            WHEN DATEDIFF(DAY, COALESCE(TRY_CONVERT(DATE, MAX(td.Post_Date), 103), TRY_CAST(MAX(td.Post_Date) AS DATE)), @CurrentDate) <= 30 THEN '0-30 Days'
            WHEN DATEDIFF(DAY, COALESCE(TRY_CONVERT(DATE, MAX(td.Post_Date), 103), TRY_CAST(MAX(td.Post_Date) AS DATE)), @CurrentDate) BETWEEN 31 AND 60 THEN '31-60 Days'
            WHEN DATEDIFF(DAY, COALESCE(TRY_CONVERT(DATE, MAX(td.Post_Date), 103), TRY_CAST(MAX(td.Post_Date) AS DATE)), @CurrentDate) BETWEEN 61 AND 90 THEN '61-90 Days'
            ELSE '90+ Days'
        END AS Age_Bucket,
        
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Open_Balance

    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Customer c ON td.Cust_Job = c.Code AND c.Company_Code = td.Company_Id
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND td.Acc_Code = '12000' -- Accounts Receivable
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(c.Code, td.Cust_Job), td.Doc_No
    HAVING SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) > 0
    ORDER BY Age_Days DESC;
END;
GO
