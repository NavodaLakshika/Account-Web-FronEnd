USE Acc_Web;
GO

-- 46. Accounts payable ageing summary
ALTER PROCEDURE dbo.ACC_sp_GetAccountsPayableAgeingSummary
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    WITH UnpaidBills AS (
        SELECT 
            ISNULL(MAX(s.Supplier_Name), td.Cust_Job) AS Supplier_Name,
            td.Doc_No,
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
    )
    SELECT 
        Supplier_Name,
        SUM(CASE WHEN Days_Past_Due <= 0 THEN Open_Balance ELSE 0 END) AS [Current],
        SUM(CASE WHEN Days_Past_Due BETWEEN 1 AND 30 THEN Open_Balance ELSE 0 END) AS [1_30_Days],
        SUM(CASE WHEN Days_Past_Due BETWEEN 31 AND 60 THEN Open_Balance ELSE 0 END) AS [31_60_Days],
        SUM(CASE WHEN Days_Past_Due BETWEEN 61 AND 90 THEN Open_Balance ELSE 0 END) AS [61_90_Days],
        SUM(CASE WHEN Days_Past_Due > 90 THEN Open_Balance ELSE 0 END) AS [Over_90_Days],
        SUM(Open_Balance) AS Total
    FROM UnpaidBills
    GROUP BY Supplier_Name
    ORDER BY Supplier_Name;
END;
GO

-- 47. Accounts payable ageing detail
ALTER PROCEDURE dbo.ACC_sp_GetAccountsPayableAgeingDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    WITH UnpaidBills AS (
        SELECT 
            ISNULL(MAX(s.Supplier_Name), td.Cust_Job) AS Supplier_Name,
            MAX(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) AS Date,
            td.Doc_No AS Bill_No,
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
    )
    SELECT 
        Supplier_Name,
        Date,
        Bill_No,
        Days_Past_Due AS Age,
        CASE WHEN Days_Past_Due <= 0 THEN Open_Balance ELSE 0 END AS [Current],
        CASE WHEN Days_Past_Due BETWEEN 1 AND 30 THEN Open_Balance ELSE 0 END AS [1_30_Days],
        CASE WHEN Days_Past_Due BETWEEN 31 AND 60 THEN Open_Balance ELSE 0 END AS [31_60_Days],
        CASE WHEN Days_Past_Due BETWEEN 61 AND 90 THEN Open_Balance ELSE 0 END AS [61_90_Days],
        CASE WHEN Days_Past_Due > 90 THEN Open_Balance ELSE 0 END AS [Over_90_Days],
        Open_Balance
    FROM UnpaidBills
    ORDER BY Supplier_Name, Age DESC;
END;
GO

-- 48. Journal
ALTER PROCEDURE dbo.ACC_sp_GetJournal
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) AS Date,
        td.Doc_No AS Transaction_No,
        ISNULL(sa.Sub_Acc_Name, 'Unknown') AS Account_Name,
        ISNULL(td.Cust_Job, '') AS Name,
        ISNULL(td.Amount, 0) AS Debit,
        ISNULL(td.Credit, 0) AS Credit
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    ORDER BY COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) DESC, td.Doc_No;
END;
GO

-- 49. General Ledger
ALTER PROCEDURE dbo.ACC_sp_GetGeneralLedger
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(sa.Sub_Acc_Name, 'Unknown Account') AS Account_Name,
        COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) AS Date,
        td.Doc_No AS Transaction_No,
        ISNULL(td.Cust_Job, '') AS Name,
        ISNULL(td.Amount, 0) AS Debit,
        ISNULL(td.Credit, 0) AS Credit,
        ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0) AS Balance
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    ORDER BY ISNULL(sa.Sub_Acc_Name, 'Unknown Account'), COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) DESC;
END;
GO

-- 50. General Ledger List
ALTER PROCEDURE dbo.ACC_sp_GetGeneralLedgerList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(sa.Sub_Acc_Name, 'Unknown Account') AS Account_Name,
        MAX(sa.Acc_Type) AS Account_Type,
        SUM(ISNULL(td.Amount, 0)) AS Total_Debit,
        SUM(ISNULL(td.Credit, 0)) AS Total_Credit,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Net_Balance
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY ISNULL(sa.Sub_Acc_Name, 'Unknown Account')
    ORDER BY Account_Name;
END;
GO
