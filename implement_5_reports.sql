USE Acc_Web;
GO

-- Helper for Safe Date: COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))

-- 1. Profit and Loss Detail
ALTER PROCEDURE dbo.ACC_sp_GetProfitAndLossDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        sa.Acc_Type AS Account_Type,
        td.Acc_Code AS Account_Code,
        MAX(sa.Sub_Acc_Name) AS Account_Name,
        MAX(td.Depend_Acc_Name) AS Description,
        MAX(td.Post_Date) AS Post_Date,
        td.Doc_No AS Document_No,
        SUM(ISNULL(td.Amount, 0)) AS Debit,
        SUM(ISNULL(td.Credit, 0)) AS Credit,
        SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) AS Net_Amount
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
      AND sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES')
    GROUP BY sa.Acc_Type, td.Acc_Code, td.Doc_No
    ORDER BY sa.Acc_Type DESC, td.Acc_Code, Post_Date DESC;
END;
GO

-- 2. Profit and Loss Year-to-Date Comparison
ALTER PROCEDURE dbo.ACC_sp_GetProfitAndLossYeartodateComparison
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @YTD_Start DATE = DATEFROMPARTS(YEAR(ISNULL(@EndDate, GETDATE())), 1, 1);
    DECLARE @YTD_End DATE = ISNULL(@EndDate, GETDATE());

    SELECT 
        sa.Acc_Type AS Account_Type,
        td.Acc_Code AS Account_Code,
        MAX(sa.Sub_Acc_Name) AS Account_Name,
        
        -- Current Period Net
        SUM(CASE 
            WHEN (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate) AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate) 
            THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) 
            ELSE 0 
        END) AS Current_Period_Net,

        -- YTD Net
        SUM(CASE 
            WHEN COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @YTD_Start AND COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @YTD_End 
            THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) 
            ELSE 0 
        END) AS YTD_Net

    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES')
      AND (
          ((@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate) AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate))
          OR
          (COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @YTD_Start AND COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @YTD_End)
      )
    GROUP BY sa.Acc_Type, td.Acc_Code
    ORDER BY sa.Acc_Type DESC, td.Acc_Code;
END;
GO

-- 3. Quarterly Profit and Loss Summary
ALTER PROCEDURE dbo.ACC_sp_GetQuarterlyProfitAndLossSummary
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @TargetYear INT = YEAR(ISNULL(@EndDate, GETDATE()));

    SELECT 
        sa.Acc_Type AS Account_Type,
        td.Acc_Code AS Account_Code,
        MAX(sa.Sub_Acc_Name) AS Account_Name,
        
        SUM(CASE WHEN DATEPART(QUARTER, COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) = 1 THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) AS Q1_Net,
        SUM(CASE WHEN DATEPART(QUARTER, COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) = 2 THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) AS Q2_Net,
        SUM(CASE WHEN DATEPART(QUARTER, COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) = 3 THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) AS Q3_Net,
        SUM(CASE WHEN DATEPART(QUARTER, COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) = 4 THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) AS Q4_Net,
        SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) AS Total_Net
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND YEAR(COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE))) = @TargetYear
      AND sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES')
    GROUP BY sa.Acc_Type, td.Acc_Code
    ORDER BY sa.Acc_Type DESC, td.Acc_Code;
END;
GO

-- 4. Statement of Changes in Equity
ALTER PROCEDURE dbo.ACC_sp_GetStatementOfChangesInEquity
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        sa.Acc_Type AS Account_Type,
        td.Acc_Code AS Account_Code,
        MAX(sa.Sub_Acc_Name) AS Account_Name,
        
        -- Opening Balance (all transactions before StartDate)
        SUM(CASE 
            WHEN (@StartDate IS NOT NULL AND COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) < @StartDate) 
            THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) 
            ELSE 0 
        END) AS Opening_Balance,

        -- Net Changes (transactions between StartDate and EndDate)
        SUM(CASE 
            WHEN (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate) AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate) 
            THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) 
            ELSE 0 
        END) AS Net_Changes,

        -- Closing Balance (Opening + Net Changes)
        SUM(CASE 
            WHEN (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate) 
            THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) 
            ELSE 0 
        END) AS Closing_Balance

    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (sa.Acc_Type LIKE '%EQUITY%' OR sa.Acc_Type LIKE '%CAPITAL%')
    GROUP BY sa.Acc_Type, td.Acc_Code
    ORDER BY td.Acc_Code;
END;
GO

-- 5. Custom Summary Report
ALTER PROCEDURE dbo.ACC_sp_GetCustomSummaryReport
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        sa.Acc_Type AS Account_Type,
        SUM(ISNULL(td.Amount, 0)) AS Total_Debit,
        SUM(ISNULL(td.Credit, 0)) AS Total_Credit,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Net_Balance
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, td.Post_Date, 103), TRY_CAST(td.Post_Date AS DATE)) <= @EndDate)
    GROUP BY sa.Acc_Type
    ORDER BY sa.Acc_Type;
END;
GO
