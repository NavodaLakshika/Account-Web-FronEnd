USE Acc_Web;
GO

-- 56. Account List
ALTER PROCEDURE dbo.ACC_sp_GetAccountList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        sa.Sub_Acc_Name AS Account_Name,
        sa.Acc_Type AS Account_Type,
        'LKR' AS Currency,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Balance
    FROM ACC_Sub_Accounts sa
    LEFT JOIN ACC_Account_Transaction_Details td ON sa.Sub_Code = td.Acc_Code AND (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
    WHERE (@CompanyId IS NULL OR sa.Company_Code = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY sa.Sub_Acc_Name, sa.Acc_Type
    ORDER BY sa.Acc_Type, sa.Sub_Acc_Name;
END;
GO

-- 57. Reconciliation Reports
ALTER PROCEDURE dbo.ACC_sp_GetReconciliationReports
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- No permanent reconciliation history tables currently available, returning empty structure
    SELECT 
        CAST('' AS NVARCHAR(100)) AS Account_Name,
        CAST('' AS NVARCHAR(50)) AS Statement_Ending_Date,
        CAST('' AS NVARCHAR(50)) AS Reconciled_Date,
        CAST(0.0 AS DECIMAL(18,2)) AS Ending_Balance
    WHERE 1 = 0;
END;
GO

-- 58. Adjusted Trial Balance
ALTER PROCEDURE dbo.ACC_sp_GetAdjustedTrialBalance
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    WITH AccountBalances AS (
        SELECT 
            ISNULL(sa.Sub_Acc_Name, 'Unknown Account') AS Account_Name,
            MAX(sa.Acc_Type) AS Account_Type,
            SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Net_Balance
        FROM ACC_Account_Transaction_Details td
        LEFT JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
        WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
          AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
          AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
        GROUP BY ISNULL(sa.Sub_Acc_Name, 'Unknown Account')
    )
    SELECT 
        Account_Name,
        CASE WHEN Net_Balance >= 0 THEN Net_Balance ELSE 0 END AS Debit,
        CASE WHEN Net_Balance < 0 THEN ABS(Net_Balance) ELSE 0 END AS Credit
    FROM AccountBalances
    WHERE Net_Balance <> 0
    ORDER BY Account_Type, Account_Name;
END;
GO

-- 59. Profit and Loss By Tag Group
ALTER PROCEDURE dbo.ACC_sp_GetProfitAndLossByTagGroup
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(NULLIF(td.Loca, ''), 'Unassigned') AS Tag_Group,
        ISNULL(sa.Sub_Acc_Name, 'Unknown Account') AS Account_Name,
        SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) AS Amount
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type IN ('INCOME', 'OTHER INCOME', 'EXPENSES', 'COST OF SALES')
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY td.Loca, ISNULL(sa.Sub_Acc_Name, 'Unknown Account')
    HAVING (SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0))) <> 0
    ORDER BY Tag_Group, Account_Name;
END;
GO

-- 60. Transaction List by Tag Group
ALTER PROCEDURE dbo.ACC_sp_GetTransactionListByTagGroup
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(NULLIF(td.Loca, ''), 'Unassigned') AS Tag_Group,
        COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) AS Date,
        td.Doc_No AS Transaction_No,
        ISNULL(sa.Sub_Acc_Name, 'Unknown Account') AS Account_Name,
        ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0) AS Amount
    FROM ACC_Account_Transaction_Details td
    LEFT JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    ORDER BY Tag_Group, COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) DESC, td.Doc_No;
END;
GO
