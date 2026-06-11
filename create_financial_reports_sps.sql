-- ==============================================================================
-- ACCOUNTS WEB - CORE FINANCIAL REPORTS STORED PROCEDURES (PHASE 1)
-- ==============================================================================

-- 1. SP: ACC_sp_GetProfitAndLoss
IF OBJECT_ID('dbo.ACC_sp_GetProfitAndLoss', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetProfitAndLoss
GO
CREATE PROCEDURE dbo.ACC_sp_GetProfitAndLoss
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Standard Profit and Loss groups Income and Expenses. 
    -- Assuming Main_Acc_Code '400' series is Income, '500' series is Expense
    SELECT 
        CASE 
            WHEN LEFT(sa.Main_Acc_Code, 1) = '4' THEN 'Income'
            WHEN LEFT(sa.Main_Acc_Code, 1) IN ('5', '6') THEN 'Expenses'
            ELSE 'Other'
        END AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
      AND (LEFT(sa.Main_Acc_Code, 1) IN ('4', '5', '6') OR sa.Main_Acc_Code IS NULL)
    GROUP BY 
        CASE 
            WHEN LEFT(sa.Main_Acc_Code, 1) = '4' THEN 'Income'
            WHEN LEFT(sa.Main_Acc_Code, 1) IN ('5', '6') THEN 'Expenses'
            ELSE 'Other'
        END,
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountType DESC, AccountCode;
END
GO

-- 2. SP: ACC_sp_GetBalanceSheet
IF OBJECT_ID('dbo.ACC_sp_GetBalanceSheet', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetBalanceSheet
GO
CREATE PROCEDURE dbo.ACC_sp_GetBalanceSheet
    @CompanyId NVARCHAR(50) = NULL,
    @AsOfDate DATE = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Calculate Retained Earnings (Net Income up to AsOfDate)
    DECLARE @RetainedEarnings DECIMAL(18,2) = 0;
    SELECT @RetainedEarnings = SUM(ISNULL(th.Net_Amount, 0))
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@AsOfDate IS NULL OR th.Post_Date <= @AsOfDate)
      AND (LEFT(sa.Main_Acc_Code, 1) IN ('4', '5', '6'));

    -- Balance Sheet items: Assets (100s), Liabilities (200s), Equity (300s)
    SELECT 
        CASE 
            WHEN LEFT(sa.Main_Acc_Code, 1) = '1' THEN 'Assets'
            WHEN LEFT(sa.Main_Acc_Code, 1) = '2' THEN 'Liabilities'
            WHEN LEFT(sa.Main_Acc_Code, 1) = '3' THEN 'Equity'
            ELSE 'Other'
        END AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@AsOfDate IS NULL OR th.Post_Date <= @AsOfDate)
      AND (LEFT(sa.Main_Acc_Code, 1) IN ('1', '2', '3') OR sa.Main_Acc_Code IS NULL)
    GROUP BY 
        CASE 
            WHEN LEFT(sa.Main_Acc_Code, 1) = '1' THEN 'Assets'
            WHEN LEFT(sa.Main_Acc_Code, 1) = '2' THEN 'Liabilities'
            WHEN LEFT(sa.Main_Acc_Code, 1) = '3' THEN 'Equity'
            ELSE 'Other'
        END,
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
        
    UNION ALL
    
    -- Inject Calculated Retained Earnings
    SELECT 
        'Equity' AS AccountType,
        '399-RE' AS AccountCode,
        'Retained Earnings' AS AccountName,
        ISNULL(@RetainedEarnings, 0) AS Balance
    WHERE ISNULL(@RetainedEarnings, 0) <> 0

    ORDER BY AccountType ASC, AccountCode;
END
GO

-- 3. SP: ACC_sp_GetTrialBalance
IF OBJECT_ID('dbo.ACC_sp_GetTrialBalance', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetTrialBalance
GO
CREATE PROCEDURE dbo.ACC_sp_GetTrialBalance
    @CompanyId NVARCHAR(50) = NULL,
    @AsOfDate DATE = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(CASE WHEN ISNULL(th.Net_Amount, 0) > 0 THEN ISNULL(th.Net_Amount, 0) ELSE 0 END) AS TotalDebit,
        SUM(CASE WHEN ISNULL(th.Net_Amount, 0) < 0 THEN ABS(ISNULL(th.Net_Amount, 0)) ELSE 0 END) AS TotalCredit
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@AsOfDate IS NULL OR th.Post_Date <= @AsOfDate)
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
END
GO
