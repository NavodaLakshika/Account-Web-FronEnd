USE Acc_Web;
GO


ALTER PROCEDURE dbo.ACC_sp_GetAccountsReceivableAgeingSummary
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    WITH UnpaidInvoices AS (
        SELECT ISNULL(td.Cust_Job, 'Unknown Customer') AS Cust_Name, td.Doc_No,
            DATEDIFF(day, MAX(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))), GETDATE()) AS Days_Past_Due,
            SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Open_Balance
        FROM ACC_Account_Transaction_Details td
        WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId) AND td.Acc_Code = '12000'
          AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
          AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
        GROUP BY td.Cust_Job, td.Doc_No
        HAVING (SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0))) > 0
    )
    SELECT Cust_Name,
        SUM(CASE WHEN Days_Past_Due <= 0 THEN Open_Balance ELSE 0 END) AS [Current],
        SUM(CASE WHEN Days_Past_Due BETWEEN 1 AND 30 THEN Open_Balance ELSE 0 END) AS [1_30_Days],
        SUM(CASE WHEN Days_Past_Due BETWEEN 31 AND 60 THEN Open_Balance ELSE 0 END) AS [31_60_Days],
        SUM(CASE WHEN Days_Past_Due > 60 THEN Open_Balance ELSE 0 END) AS [Over_60_Days],
        SUM(Open_Balance) AS Total
    FROM UnpaidInvoices GROUP BY Cust_Name ORDER BY Cust_Name;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetAuditLog
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 100
        ISNULL(InsertDate, GETDATE()) AS Date, ISNULL(Create_User, 'System') AS [User],
        ISNULL(Doc_No, '') AS Event, ISNULL(Acc_Name, '') AS Name, ISNULL(Memo, '') AS Description,
        ISNULL(Amount, 0) + ISNULL(Credit, 0) AS Amount
    FROM ACC_Account_Transaction_Details
    WHERE (@CompanyId IS NULL OR Company_Id = @CompanyId)
    ORDER BY Id_No DESC;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetBalanceSheetComparison
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(sa.Sub_Acc_Name, 'Unknown') AS Account_Name, ISNULL(sa.Acc_Type, 'Other') AS Account_Type,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Balance
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type IN ('FIXED ASSETS', 'CURRENT ASSETS', 'CURRENT LIABILITIES', 'LONG TERM LIABILITIES', 'EQUITY')
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY sa.Sub_Acc_Name, sa.Acc_Type ORDER BY sa.Acc_Type, sa.Sub_Acc_Name;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetBalanceSheetDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(sa.Sub_Acc_Name, 'Unknown') AS Account_Name, ISNULL(sa.Acc_Type, 'Other') AS Account_Type,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Balance
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type IN ('FIXED ASSETS', 'CURRENT ASSETS', 'CURRENT LIABILITIES', 'LONG TERM LIABILITIES', 'EQUITY')
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY sa.Sub_Acc_Name, sa.Acc_Type ORDER BY sa.Acc_Type, sa.Sub_Acc_Name;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetBalanceSheetSummary
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(sa.Sub_Acc_Name, 'Unknown') AS Account_Name, ISNULL(sa.Acc_Type, 'Other') AS Account_Type,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Balance
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type IN ('FIXED ASSETS', 'CURRENT ASSETS', 'CURRENT LIABILITIES', 'LONG TERM LIABILITIES', 'EQUITY')
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY sa.Sub_Acc_Name, sa.Acc_Type ORDER BY sa.Acc_Type, sa.Sub_Acc_Name;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetBusinessSnapshot
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        (SELECT SUM(ISNULL(Credit,0)) - SUM(ISNULL(Amount,0)) FROM ACC_Account_Transaction_Details td JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code WHERE sa.Acc_Type IN ('INCOME', 'OTHER INCOME') AND (@CompanyId IS NULL OR td.Company_Id = @CompanyId)) AS Total_Income,
        (SELECT SUM(ISNULL(Amount,0)) - SUM(ISNULL(Credit,0)) FROM ACC_Account_Transaction_Details td JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code WHERE sa.Acc_Type IN ('EXPENSES', 'COST OF SALES') AND (@CompanyId IS NULL OR td.Company_Id = @CompanyId)) AS Total_Expenses,
        (SELECT SUM(ISNULL(Amount,0)) - SUM(ISNULL(Credit,0)) FROM ACC_Account_Transaction_Details WHERE Acc_Code = '12000' AND (@CompanyId IS NULL OR Company_Id = @CompanyId)) AS Unpaid_Invoices,
        (SELECT SUM(ISNULL(Credit,0)) - SUM(ISNULL(Amount,0)) FROM ACC_Account_Transaction_Details WHERE Acc_Code = '22000' AND (@CompanyId IS NULL OR Company_Id = @CompanyId)) AS Unpaid_Bills;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetCustomerPhoneList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Cust_Name, ISNULL(Phone, 'N/A') AS Phone, ISNULL(Fax, 'N/A') AS Mobile
    FROM ACC_Customer WHERE (@CompanyId IS NULL OR Company_Code = @CompanyId) ORDER BY Cust_Name;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetEmployeeContactList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST('' AS NVARCHAR(100)) AS Employee_Name, CAST('' AS NVARCHAR(50)) AS Phone, CAST('' AS NVARCHAR(100)) AS Email WHERE 1=0;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetInventoryValuationDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(Prod_Name, Code) AS Prod_Name, ISNULL(Available_Stock, 0) AS Qty_On_Hand,
        ISNULL(Purchase_price, 0) AS Asset_Value, ISNULL(Selling_price, 0) * ISNULL(Available_Stock, 0) AS Retail_Value
    FROM ACC_Product WHERE (@CompanyId IS NULL OR Comp_Code = @CompanyId) ORDER BY Prod_Name;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetInventoryValuationSummary
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(Prod_Name, Code) AS Prod_Name, ISNULL(Available_Stock, 0) AS Qty_On_Hand,
        ISNULL(Purchase_price, 0) AS Asset_Value, ISNULL(Selling_price, 0) * ISNULL(Available_Stock, 0) AS Retail_Value
    FROM ACC_Product WHERE (@CompanyId IS NULL OR Comp_Code = @CompanyId) ORDER BY Prod_Name;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetProfitAndLossAsOfTotalIncome
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(sa.Sub_Acc_Name, 'Unknown') AS Account_Name, ISNULL(sa.Acc_Type, 'Other') AS Account_Type,
        SUM(ISNULL(td.Credit,0)) - SUM(ISNULL(td.Amount,0)) AS Net_Income
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId) AND sa.Acc_Type IN ('INCOME', 'OTHER INCOME', 'EXPENSES', 'COST OF SALES')
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY sa.Sub_Acc_Name, sa.Acc_Type ORDER BY sa.Acc_Type DESC, sa.Sub_Acc_Name;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetProfitAndLossComparison
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(sa.Sub_Acc_Name, 'Unknown') AS Account_Name, ISNULL(sa.Acc_Type, 'Other') AS Account_Type,
        SUM(ISNULL(td.Credit,0)) - SUM(ISNULL(td.Amount,0)) AS Net_Income
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId) AND sa.Acc_Type IN ('INCOME', 'OTHER INCOME', 'EXPENSES', 'COST OF SALES')
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY sa.Sub_Acc_Name, sa.Acc_Type ORDER BY sa.Acc_Type DESC, sa.Sub_Acc_Name;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetProfitAndLossByCustomer
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(td.Cust_Job, 'Unassigned') AS Customer, ISNULL(sa.Sub_Acc_Name, 'Unknown') AS Account_Name,
        SUM(ISNULL(td.Credit,0)) - SUM(ISNULL(td.Amount,0)) AS Net_Income
    FROM ACC_Account_Transaction_Details td JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId) AND sa.Acc_Type IN ('INCOME', 'OTHER INCOME', 'EXPENSES', 'COST OF SALES')
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY td.Cust_Job, sa.Sub_Acc_Name ORDER BY Customer, Account_Name;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetProfitAndLossByMonth
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT FORMAT(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)), 'yyyy-MM') AS Month, ISNULL(sa.Sub_Acc_Name, 'Unknown') AS Account_Name,
        SUM(ISNULL(td.Credit,0)) - SUM(ISNULL(td.Amount,0)) AS Net_Income
    FROM ACC_Account_Transaction_Details td JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId) AND sa.Acc_Type IN ('INCOME', 'OTHER INCOME', 'EXPENSES', 'COST OF SALES')
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY FORMAT(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)), 'yyyy-MM'), sa.Sub_Acc_Name ORDER BY Month, Account_Name;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetPurchasesByProductserviceDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(Discription, Item_Id) AS Prod_Name, ISNULL(Cost, 0) AS Cost, ISNULL(Qty, 0) AS Qty, ISNULL(Discription, '') AS Memo,
        Doc_No AS Bill_No, NULL AS Date
    FROM ACC_Bill_Item WHERE (@CompanyId IS NULL OR 1=1) ORDER BY Prod_Name, Date DESC;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetRecenteditedTimeActivities
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST('' AS NVARCHAR(100)) AS Name, CAST('' AS NVARCHAR(100)) AS Description, CAST(0 AS DECIMAL(18,2)) AS Amount WHERE 1=0;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetRecurringTemplateList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST('' AS NVARCHAR(100)) AS Name, CAST('' AS NVARCHAR(100)) AS Description, CAST(0 AS DECIMAL(18,2)) AS Amount WHERE 1=0;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetTimeActivitiesByCustomerDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST('' AS NVARCHAR(100)) AS Name, CAST('' AS NVARCHAR(100)) AS Description, CAST(0 AS DECIMAL(18,2)) AS Amount WHERE 1=0;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetTimeActivitiesByEmployeeDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST('' AS NVARCHAR(100)) AS Name, CAST('' AS NVARCHAR(100)) AS Description, CAST(0 AS DECIMAL(18,2)) AS Amount WHERE 1=0;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetTimeSummaryByPayType
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST('' AS NVARCHAR(100)) AS Name, CAST('' AS NVARCHAR(100)) AS Description, CAST(0 AS DECIMAL(18,2)) AS Amount WHERE 1=0;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetTimesheetDetailByEmployee
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST('' AS NVARCHAR(100)) AS Name, CAST('' AS NVARCHAR(100)) AS Description, CAST(0 AS DECIMAL(18,2)) AS Amount WHERE 1=0;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetSalesByCustomerTypeDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(td.Cust_Job, 'Unknown') AS Customer, ISNULL(sa.Sub_Acc_Name, 'Sales') AS Account_Name,
        SUM(ISNULL(td.Credit, 0)) AS Total_Sales
    FROM ACC_Account_Transaction_Details td JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId) AND sa.Acc_Type IN ('INCOME', 'OTHER INCOME')
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY td.Cust_Job, sa.Sub_Acc_Name ORDER BY Customer;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetStatementOfCashFlows
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(sa.Sub_Acc_Name, 'Bank') AS Account_Name, SUM(ISNULL(td.Amount, 0)) AS Inflow, SUM(ISNULL(td.Credit, 0)) AS Outflow,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Net_Cash
    FROM ACC_Account_Transaction_Details td JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId) AND sa.Acc_Type = 'BANK'
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY sa.Sub_Acc_Name ORDER BY Account_Name;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetStockTakeWorksheet
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(Prod_Name, Code) AS Prod_Name, CAST('' AS NVARCHAR(100)) AS Description, ISNULL(Available_Stock, 0) AS System_Qty,
        CAST('' AS NVARCHAR(50)) AS Physical_Count, CAST('' AS NVARCHAR(50)) AS Difference
    FROM ACC_Product WHERE (@CompanyId IS NULL OR Comp_Code = @CompanyId) ORDER BY Prod_Name;
END;
GO

ALTER PROCEDURE dbo.ACC_sp_GetTaxLiabilityReport
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ISNULL(sa.Sub_Acc_Name, 'Tax') AS Tax_Account, SUM(ISNULL(td.Credit, 0)) AS Tax_Collected, SUM(ISNULL(td.Amount, 0)) AS Tax_Paid,
        SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) AS Tax_Liability
    FROM ACC_Account_Transaction_Details td JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId) AND sa.Sub_Acc_Name LIKE '%Tax%' OR sa.Sub_Acc_Name LIKE '%VAT%'
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY sa.Sub_Acc_Name ORDER BY Tax_Account;
END;
GO
