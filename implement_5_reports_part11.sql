USE Acc_Web;
GO

-- 51. Transaction Detail by Account
ALTER PROCEDURE dbo.ACC_sp_GetTransactionDetailByAccount
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
        ISNULL(td.Memo, '') AS Memo,
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

-- 52. Transaction List with Splits
ALTER PROCEDURE dbo.ACC_sp_GetTransactionListWithSplits
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) AS Date,
        td.Doc_No AS Transaction_No,
        ISNULL(td.Cust_Job, '') AS Name,
        ISNULL(td.Memo, '') AS Memo,
        ISNULL(sa.Sub_Acc_Name, 'Unknown Account') AS Split_Account,
        ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0) AS Amount
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    ORDER BY td.Doc_No, COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) DESC;
END;
GO

-- 53. Transaction List by Date
ALTER PROCEDURE dbo.ACC_sp_GetTransactionListByDate
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) AS Date,
        td.Doc_No AS Transaction_No,
        ISNULL(td.Cust_Job, '') AS Name,
        ISNULL(td.Memo, '') AS Memo,
        ISNULL(sa.Sub_Acc_Name, 'Unknown Account') AS Account_Name,
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

-- 54. Recent Transactions
ALTER PROCEDURE dbo.ACC_sp_GetRecentTransactions
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP 100
        COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) AS Date,
        td.Doc_No AS Transaction_No,
        ISNULL(td.Cust_Job, '') AS Name,
        ISNULL(td.Memo, '') AS Memo,
        ISNULL(sa.Sub_Acc_Name, 'Unknown Account') AS Account_Name,
        ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0) AS Amount
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    ORDER BY td.Id_No DESC; -- Latest entered records
END;
GO

-- 55. Invalid Journal Transactions
ALTER PROCEDURE dbo.ACC_sp_GetInvalidJournalTransactions
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        MAX(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) AS Date,
        td.Doc_No AS Transaction_No,
        ISNULL(MAX(td.Cust_Job), '') AS Name,
        ISNULL(MAX(td.Memo), '') AS Memo,
        SUM(ISNULL(td.Amount, 0)) AS Total_Debit,
        SUM(ISNULL(td.Credit, 0)) AS Total_Credit,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Difference
    FROM ACC_Account_Transaction_Details td
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY td.Doc_No
    HAVING ABS(SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0))) > 0.01 -- Imbalanced transactions threshold
    ORDER BY Date DESC;
END;
GO
