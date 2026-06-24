-- ===================================================================
-- PHASE 1: ACCOUNTING CORE REPORTS
-- Rewriting all stub stored procedures for core financial reports
-- ===================================================================

-- =============================================
-- 1. ACC_sp_GetJournal - General Journal Report
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetJournal]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetJournal]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetJournal]
    @CompanyId NVARCHAR(50),
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = 'Accrual',
    @DisplayColumnsBy NVARCHAR(50) = 'Total',
    @CompareTo NVARCHAR(50) = 'None'
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        j.Id_No AS TransactionId,
        TRY_CONVERT(DATE, j.Date, 103) AS TransactionDate,
        j.Acc_ID AS AccountCode,
        j.Acc_Name AS AccountName,
        j.Doc_No AS DocumentNo,
        j.Memo,
        ISNULL(j.Debit, 0) AS Debit,
        ISNULL(j.Credit, 0) AS Credit,
        j.Iid AS TransactionType,
        RTRIM(LTRIM(j.Company)) AS CompanyCode
    FROM 
        ACC_Jenaral_Journal j
    WHERE 
        RTRIM(LTRIM(j.Company)) = @CompanyId
        AND (@StartDate IS NULL OR TRY_CONVERT(DATE, j.Date, 103) >= @StartDate)
        AND (@EndDate IS NULL OR TRY_CONVERT(DATE, j.Date, 103) <= @EndDate)
    ORDER BY 
        TRY_CONVERT(DATE, j.Date, 103), j.Id_No;
END
GO

-- =============================================
-- 2. ACC_sp_GetProfitAndLossDetail - P&L Detail
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetProfitAndLossDetail]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetProfitAndLossDetail]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetProfitAndLossDetail]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DynamicSQL NVARCHAR(MAX);

    SET @DynamicSQL = '
    SELECT 
        CASE 
            WHEN sa.Acc_Type = ''INCOME'' THEN ''Income''
            WHEN sa.Acc_Type = ''COST OF SALES'' THEN ''Cost of Sales''
            WHEN sa.Acc_Type = ''EXPENSES'' THEN ''Expenses''
            ELSE ''Other''
        END AS AccountType,
        td.Acc_Code AS AccountCode,
        MAX(ISNULL(sa.Sub_Acc_Name, td.Acc_Code)) AS AccountName,
        td.Doc_No AS DocumentNo,
        td.Post_Date AS TransactionDate,
        td.Acc_Name AS Description,
        td.Amount AS Debit,
        td.Credit AS Credit,
        ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) AS Balance
    '
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(td.Cust_Job AS NVARCHAR), ''Unknown'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, TRY_CAST(td.Post_Date AS DATE)) + '' '' + CAST(YEAR(TRY_CAST(td.Post_Date AS DATE)) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, TRY_CAST(td.Post_Date AS DATE)) AS NVARCHAR) + '' '' + CAST(YEAR(TRY_CAST(td.Post_Date AS DATE)) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(TRY_CAST(td.Post_Date AS DATE)) AS NVARCHAR) AS PivotColumn '

    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type IN (''INCOME'', ''EXPENSES'', ''COST OF SALES'')
    ORDER BY AccountType DESC, td.Acc_Code, td.Post_Date;
    '

    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

-- =============================================
-- 3. ACC_sp_GetProfitAndLossByMonth
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetProfitAndLossByMonth]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetProfitAndLossByMonth]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetProfitAndLossByMonth]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        CASE 
            WHEN sa.Acc_Type = 'INCOME' THEN 'Income'
            WHEN sa.Acc_Type = 'COST OF SALES' THEN 'Cost of Sales'
            WHEN sa.Acc_Type = 'EXPENSES' THEN 'Expenses'
            ELSE 'Other'
        END AS AccountType,
        td.Acc_Code AS AccountCode,
        MAX(ISNULL(sa.Sub_Acc_Name, td.Acc_Code)) AS AccountName,
        DATENAME(month, TRY_CAST(td.Post_Date AS DATE)) + ' ' + CAST(YEAR(TRY_CAST(td.Post_Date AS DATE)) AS NVARCHAR) AS MonthYear,
        YEAR(TRY_CAST(td.Post_Date AS DATE)) AS Year,
        MONTH(TRY_CAST(td.Post_Date AS DATE)) AS Month,
        SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) AS Balance
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES')
    GROUP BY 
        CASE 
            WHEN sa.Acc_Type = 'INCOME' THEN 'Income'
            WHEN sa.Acc_Type = 'COST OF SALES' THEN 'Cost of Sales'
            WHEN sa.Acc_Type = 'EXPENSES' THEN 'Expenses'
            ELSE 'Other'
        END,
        td.Acc_Code,
        DATENAME(month, TRY_CAST(td.Post_Date AS DATE)) + ' ' + CAST(YEAR(TRY_CAST(td.Post_Date AS DATE)) AS NVARCHAR),
        YEAR(TRY_CAST(td.Post_Date AS DATE)),
        MONTH(TRY_CAST(td.Post_Date AS DATE))
    HAVING (SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0))) <> 0
    ORDER BY Year, Month, AccountType DESC, AccountCode;
END
GO

-- =============================================
-- 4. ACC_sp_GetProfitAndLossComparison
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetProfitAndLossComparison]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetProfitAndLossComparison]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetProfitAndLossComparison]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @StartDatePrev DATE, @EndDatePrev DATE;
    IF @StartDate IS NOT NULL AND @EndDate IS NOT NULL
    BEGIN
        SET @StartDatePrev = DATEADD(YEAR, -1, @StartDate);
        SET @EndDatePrev = DATEADD(YEAR, -1, @EndDate);
    END

    SELECT 
        CASE 
            WHEN sa.Acc_Type = 'INCOME' THEN 'Income'
            WHEN sa.Acc_Type = 'COST OF SALES' THEN 'Cost of Sales'
            WHEN sa.Acc_Type = 'EXPENSES' THEN 'Expenses'
            ELSE 'Other'
        END AS AccountType,
        td.Acc_Code AS AccountCode,
        MAX(ISNULL(sa.Sub_Acc_Name, td.Acc_Code)) AS AccountName,
        SUM(CASE WHEN TRY_CAST(td.Post_Date AS DATE) >= @StartDate AND TRY_CAST(td.Post_Date AS DATE) <= @EndDate 
            THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) AS CurrentPeriod,
        SUM(CASE WHEN TRY_CAST(td.Post_Date AS DATE) >= @StartDatePrev AND TRY_CAST(td.Post_Date AS DATE) <= @EndDatePrev 
            THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) AS PreviousPeriod,
        CASE WHEN SUM(CASE WHEN TRY_CAST(td.Post_Date AS DATE) >= @StartDatePrev AND TRY_CAST(td.Post_Date AS DATE) <= @EndDatePrev 
            THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) <> 0
            THEN (SUM(CASE WHEN TRY_CAST(td.Post_Date AS DATE) >= @StartDate AND TRY_CAST(td.Post_Date AS DATE) <= @EndDate 
                THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) 
                - SUM(CASE WHEN TRY_CAST(td.Post_Date AS DATE) >= @StartDatePrev AND TRY_CAST(td.Post_Date AS DATE) <= @EndDatePrev 
                    THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END))
                / ABS(SUM(CASE WHEN TRY_CAST(td.Post_Date AS DATE) >= @StartDatePrev AND TRY_CAST(td.Post_Date AS DATE) <= @EndDatePrev 
                    THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END)) * 100
            ELSE 0 END AS ChangePercent
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES')
    GROUP BY 
        CASE 
            WHEN sa.Acc_Type = 'INCOME' THEN 'Income'
            WHEN sa.Acc_Type = 'COST OF SALES' THEN 'Cost of Sales'
            WHEN sa.Acc_Type = 'EXPENSES' THEN 'Expenses'
            ELSE 'Other'
        END,
        td.Acc_Code
    HAVING (SUM(CASE WHEN TRY_CAST(td.Post_Date AS DATE) >= @StartDate AND TRY_CAST(td.Post_Date AS DATE) <= @EndDate 
                THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) <> 0)
        OR (SUM(CASE WHEN TRY_CAST(td.Post_Date AS DATE) >= @StartDatePrev AND TRY_CAST(td.Post_Date AS DATE) <= @EndDatePrev 
                THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) <> 0)
    ORDER BY AccountType DESC, AccountCode;
END
GO

-- =============================================
-- 5. ACC_sp_GetProfitAndLossAsOfTotalIncome
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetProfitAndLossAsOfTotalIncome]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetProfitAndLossAsOfTotalIncome]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetProfitAndLossAsOfTotalIncome]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalIncome DECIMAL(18,2);
    
    SELECT @TotalIncome = SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0))
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type = 'INCOME';

    SELECT 
        CASE 
            WHEN sa.Acc_Type = 'INCOME' THEN 'Income'
            WHEN sa.Acc_Type = 'COST OF SALES' THEN 'Cost of Sales'
            WHEN sa.Acc_Type = 'EXPENSES' THEN 'Expenses'
            ELSE 'Other'
        END AS AccountType,
        td.Acc_Code AS AccountCode,
        MAX(ISNULL(sa.Sub_Acc_Name, td.Acc_Code)) AS AccountName,
        SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) AS Balance,
        CASE WHEN ISNULL(@TotalIncome, 0) = 0 THEN 0 
            ELSE (SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) / @TotalIncome) * 100 
        END AS PercentOfTotalIncome
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES')
    GROUP BY 
        CASE 
            WHEN sa.Acc_Type = 'INCOME' THEN 'Income'
            WHEN sa.Acc_Type = 'COST OF SALES' THEN 'Cost of Sales'
            WHEN sa.Acc_Type = 'EXPENSES' THEN 'Expenses'
            ELSE 'Other'
        END,
        td.Acc_Code
    HAVING (SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0))) <> 0
    ORDER BY AccountType DESC, Balance DESC;
END
GO

-- =============================================
-- 6. ACC_sp_GetProfitAndLossByCustomer
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetProfitAndLossByCustomer]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetProfitAndLossByCustomer]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetProfitAndLossByCustomer]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), 'Unknown Customer') AS CustomerName,
        CASE 
            WHEN sa.Acc_Type = 'INCOME' THEN 'Income'
            WHEN sa.Acc_Type = 'COST OF SALES' THEN 'Cost of Sales'
            WHEN sa.Acc_Type = 'EXPENSES' THEN 'Expenses'
            ELSE 'Other'
        END AS AccountType,
        td.Acc_Code AS AccountCode,
        MAX(ISNULL(sa.Sub_Acc_Name, td.Acc_Code)) AS AccountName,
        SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) AS Balance
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES')
      AND NULLIF(LTRIM(RTRIM(td.Cust_Job)), '') IS NOT NULL
    GROUP BY 
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), 'Unknown Customer'),
        CASE 
            WHEN sa.Acc_Type = 'INCOME' THEN 'Income'
            WHEN sa.Acc_Type = 'COST OF SALES' THEN 'Cost of Sales'
            WHEN sa.Acc_Type = 'EXPENSES' THEN 'Expenses'
            ELSE 'Other'
        END,
        td.Acc_Code
    HAVING (SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0))) <> 0
    ORDER BY CustomerName, AccountType DESC, AccountCode;
END
GO

-- =============================================
-- 7. ACC_sp_GetProfitAndLossYeartodateComparison
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetProfitAndLossYeartodateComparison]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetProfitAndLossYeartodateComparison]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetProfitAndLossYeartodateComparison]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurrentYearStart DATE, @CurrentYearEnd DATE;
    DECLARE @PrevYearStart DATE, @PrevYearEnd DATE;
    
    SET @CurrentYearStart = DATEFROMPARTS(YEAR(GETDATE()), 1, 1);
    SET @CurrentYearEnd = GETDATE();
    SET @PrevYearStart = DATEFROMPARTS(YEAR(GETDATE()) - 1, 1, 1);
    SET @PrevYearEnd = DATEFROMPARTS(YEAR(GETDATE()) - 1, 12, 31);

    SELECT 
        CASE 
            WHEN sa.Acc_Type = 'INCOME' THEN 'Income'
            WHEN sa.Acc_Type = 'COST OF SALES' THEN 'Cost of Sales'
            WHEN sa.Acc_Type = 'EXPENSES' THEN 'Expenses'
            ELSE 'Other'
        END AS AccountType,
        td.Acc_Code AS AccountCode,
        MAX(ISNULL(sa.Sub_Acc_Name, td.Acc_Code)) AS AccountName,
        SUM(CASE WHEN TRY_CAST(td.Post_Date AS DATE) >= @CurrentYearStart AND TRY_CAST(td.Post_Date AS DATE) <= @CurrentYearEnd 
            THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) AS CurrentYearToDate,
        SUM(CASE WHEN TRY_CAST(td.Post_Date AS DATE) >= @PrevYearStart AND TRY_CAST(td.Post_Date AS DATE) <= @PrevYearEnd 
            THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) AS PreviousYearTotal
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES')
    GROUP BY 
        CASE 
            WHEN sa.Acc_Type = 'INCOME' THEN 'Income'
            WHEN sa.Acc_Type = 'COST OF SALES' THEN 'Cost of Sales'
            WHEN sa.Acc_Type = 'EXPENSES' THEN 'Expenses'
            ELSE 'Other'
        END,
        td.Acc_Code
    HAVING (SUM(CASE WHEN TRY_CAST(td.Post_Date AS DATE) >= @CurrentYearStart AND TRY_CAST(td.Post_Date AS DATE) <= @CurrentYearEnd 
                THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) <> 0)
        OR (SUM(CASE WHEN TRY_CAST(td.Post_Date AS DATE) >= @PrevYearStart AND TRY_CAST(td.Post_Date AS DATE) <= @PrevYearEnd 
                THEN ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0) ELSE 0 END) <> 0)
    ORDER BY AccountType DESC, AccountCode;
END
GO

-- =============================================
-- 8. ACC_sp_GetQuarterlyProfitAndLossSummary
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetQuarterlyProfitAndLossSummary]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetQuarterlyProfitAndLossSummary]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetQuarterlyProfitAndLossSummary]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        CASE 
            WHEN sa.Acc_Type = 'INCOME' THEN 'Income'
            WHEN sa.Acc_Type = 'COST OF SALES' THEN 'Cost of Sales'
            WHEN sa.Acc_Type = 'EXPENSES' THEN 'Expenses'
            ELSE 'Other'
        END AS AccountType,
        td.Acc_Code AS AccountCode,
        MAX(ISNULL(sa.Sub_Acc_Name, td.Acc_Code)) AS AccountName,
        'Q' + CAST(DATEPART(quarter, TRY_CAST(td.Post_Date AS DATE)) AS NVARCHAR) + ' ' + CAST(YEAR(TRY_CAST(td.Post_Date AS DATE)) AS NVARCHAR) AS Quarter,
        YEAR(TRY_CAST(td.Post_Date AS DATE)) AS Year,
        DATEPART(quarter, TRY_CAST(td.Post_Date AS DATE)) AS QuarterNo,
        SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) AS Balance
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES')
    GROUP BY 
        CASE 
            WHEN sa.Acc_Type = 'INCOME' THEN 'Income'
            WHEN sa.Acc_Type = 'COST OF SALES' THEN 'Cost of Sales'
            WHEN sa.Acc_Type = 'EXPENSES' THEN 'Expenses'
            ELSE 'Other'
        END,
        td.Acc_Code,
        YEAR(TRY_CAST(td.Post_Date AS DATE)),
        DATEPART(quarter, TRY_CAST(td.Post_Date AS DATE))
    HAVING (SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0))) <> 0
    ORDER BY Year, QuarterNo, AccountType DESC, AccountCode;
END
GO

-- =============================================
-- 9. ACC_sp_GetProfitAndLossByTagGroup
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetProfitAndLossByTagGroup]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetProfitAndLossByTagGroup]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetProfitAndLossByTagGroup]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        CASE 
            WHEN sa.Acc_Type = 'INCOME' THEN 'Income'
            WHEN sa.Acc_Type = 'COST OF SALES' THEN 'Cost of Sales'
            WHEN sa.Acc_Type = 'EXPENSES' THEN 'Expenses'
            ELSE 'Other'
        END AS AccountType,
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), 'No Tag/Customer') AS TagGroup,
        td.Acc_Code AS AccountCode,
        MAX(ISNULL(sa.Sub_Acc_Name, td.Acc_Code)) AS AccountName,
        SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0)) AS Balance
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES')
    GROUP BY 
        CASE 
            WHEN sa.Acc_Type = 'INCOME' THEN 'Income'
            WHEN sa.Acc_Type = 'COST OF SALES' THEN 'Cost of Sales'
            WHEN sa.Acc_Type = 'EXPENSES' THEN 'Expenses'
            ELSE 'Other'
        END,
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), 'No Tag/Customer'),
        td.Acc_Code
    HAVING (SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0))) <> 0
    ORDER BY AccountType DESC, TagGroup, AccountCode;
END
GO

-- =============================================
-- 10. ACC_sp_GetBalanceSheetComparison
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetBalanceSheetComparison]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetBalanceSheetComparison]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetBalanceSheetComparison]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PrevEndDate DATE;
    IF @EndDate IS NOT NULL
        SET @PrevEndDate = DATEADD(YEAR, -1, @EndDate);

    SELECT 
        CASE 
            WHEN sa.Acc_Type = 'ASSETS' THEN 'Assets'
            WHEN sa.Acc_Type = 'LIABILITIES' THEN 'Liabilities'
            WHEN sa.Acc_Type = 'EQUITY' THEN 'Equity'
            ELSE 'Other'
        END AS AccountType,
        td.Acc_Code AS AccountCode,
        MAX(ISNULL(sa.Sub_Acc_Name, td.Acc_Code)) AS AccountName,
        SUM(ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0)) AS CurrentBalance,
        SUM(CASE WHEN TRY_CAST(td.Post_Date AS DATE) <= @PrevEndDate 
            THEN ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0) ELSE 0 END) AS PreviousBalance
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type IN ('ASSETS', 'LIABILITIES', 'EQUITY')
    GROUP BY 
        CASE 
            WHEN sa.Acc_Type = 'ASSETS' THEN 'Assets'
            WHEN sa.Acc_Type = 'LIABILITIES' THEN 'Liabilities'
            WHEN sa.Acc_Type = 'EQUITY' THEN 'Equity'
            ELSE 'Other'
        END,
        td.Acc_Code
    HAVING (SUM(ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0))) <> 0
    ORDER BY AccountType, AccountCode;
END
GO

-- =============================================
-- 11. ACC_sp_GetBalanceSheetDetail
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetBalanceSheetDetail]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetBalanceSheetDetail]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetBalanceSheetDetail]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        CASE 
            WHEN sa.Acc_Type = 'ASSETS' THEN 'Assets'
            WHEN sa.Acc_Type = 'LIABILITIES' THEN 'Liabilities'
            WHEN sa.Acc_Type = 'EQUITY' THEN 'Equity'
            ELSE 'Other'
        END AS AccountType,
        td.Acc_Code AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, td.Acc_Code) AS AccountName,
        td.Doc_No AS DocumentNo,
        td.Post_Date AS TransactionDate,
        td.Acc_Name AS Description,
        td.Amount AS Debit,
        td.Credit,
        ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0) AS Balance
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type IN ('ASSETS', 'LIABILITIES', 'EQUITY')
    ORDER BY AccountType, AccountCode, td.Post_Date;
END
GO

-- =============================================
-- 12. ACC_sp_GetBalanceSheetSummary
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetBalanceSheetSummary]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetBalanceSheetSummary]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetBalanceSheetSummary]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        CASE 
            WHEN sa.Acc_Type = 'ASSETS' THEN 'Assets'
            WHEN sa.Acc_Type = 'LIABILITIES' THEN 'Liabilities'
            WHEN sa.Acc_Type = 'EQUITY' THEN 'Equity'
            ELSE 'Other'
        END AS AccountType,
        SUM(ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0)) AS TotalBalance,
        COUNT(DISTINCT td.Acc_Code) AS AccountCount
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type IN ('ASSETS', 'LIABILITIES', 'EQUITY')
    GROUP BY 
        CASE 
            WHEN sa.Acc_Type = 'ASSETS' THEN 'Assets'
            WHEN sa.Acc_Type = 'LIABILITIES' THEN 'Liabilities'
            WHEN sa.Acc_Type = 'EQUITY' THEN 'Equity'
            ELSE 'Other'
        END
    ORDER BY AccountType;
END
GO

-- =============================================
-- 13. ACC_sp_GetStatementOfCashFlows
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetStatementOfCashFlows]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetStatementOfCashFlows]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetStatementOfCashFlows]
    @CompanyId NVARCHAR(50),
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = 'Accrual',
    @DisplayColumnsBy NVARCHAR(50) = 'Total',
    @CompareTo NVARCHAR(50) = 'None'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NetIncome DECIMAL(18,2);
    DECLARE @CashBank DECIMAL(18,2);
    DECLARE @AR DECIMAL(18,2);
    DECLARE @AP DECIMAL(18,2);
    DECLARE @Inventory DECIMAL(18,2);
    DECLARE @Depreciation DECIMAL(18,2);

    -- Net Income (from P&L: Income - Expenses)
    SELECT @NetIncome = SUM(ISNULL(Credit, 0) - ISNULL(Amount, 0))
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES');

    -- Change in Accounts Receivable
    SELECT @AR = SUM(ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0))
    FROM dbo.ACC_Account_Transaction_Details td
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND td.Acc_Code IN (SELECT Sub_Code FROM Acc_Sub_Accounts WHERE Acc_Type = 'ASSETS' AND Sub_Acc_Name LIKE '%Receivable%');

    -- Change in Accounts Payable
    SELECT @AP = SUM(ISNULL(td.Credit, 0) - ISNULL(td.Amount, 0))
    FROM dbo.ACC_Account_Transaction_Details td
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND td.Acc_Code IN (SELECT Sub_Code FROM Acc_Sub_Accounts WHERE Acc_Type = 'LIABILITIES' AND Sub_Acc_Name LIKE '%Payable%');

    -- Change in Inventory
    SELECT @Inventory = SUM(ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0))
    FROM dbo.ACC_Account_Transaction_Details td
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND td.Acc_Code IN (SELECT Sub_Code FROM Acc_Sub_Accounts WHERE Acc_Type = 'ASSETS' AND Sub_Acc_Name LIKE '%Inventory%');

    -- Cash and Bank Balance
    SELECT @CashBank = SUM(ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0))
    FROM dbo.ACC_Account_Transaction_Details td
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
      AND td.Acc_Code IN (SELECT Sub_Code FROM Acc_Sub_Accounts WHERE Acc_Type = 'ASSETS' AND (Sub_Acc_Name LIKE '%Cash%' OR Sub_Acc_Name LIKE '%Bank%'));

    SELECT 
        'Operating Activities' AS Section,
        'Net Income' AS Item,
        ISNULL(@NetIncome, 0) AS Amount,
        1 AS SortOrder
    UNION ALL
    SELECT 
        'Operating Activities',
        'Change in Accounts Receivable',
        -ISNULL(@AR, 0),
        2
    UNION ALL
    SELECT 
        'Operating Activities',
        'Change in Accounts Payable',
        ISNULL(@AP, 0),
        3
    UNION ALL
    SELECT 
        'Operating Activities',
        'Change in Inventory',
        -ISNULL(@Inventory, 0),
        4
    UNION ALL
    SELECT 
        'Operating Activities',
        'Net Cash from Operating Activities',
        ISNULL(@NetIncome, 0) - ISNULL(@AR, 0) + ISNULL(@AP, 0) - ISNULL(@Inventory, 0),
        5
    UNION ALL
    SELECT 
        'Cash at End',
        'Cash and Bank Balance',
        ISNULL(@CashBank, 0),
        6
    ORDER BY SortOrder;
END
GO

-- =============================================
-- 14. ACC_sp_GetGeneralLedgerList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetGeneralLedgerList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetGeneralLedgerList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetGeneralLedgerList]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        sa.Sub_Code AS AccountCode,
        sa.Sub_Acc_Name AS AccountName,
        sa.Acc_Type,
        ma.Main_Acc_Name AS MainAccountName,
        ISNULL(SUM(td.Amount), 0) AS TotalDebit,
        ISNULL(SUM(td.Credit), 0) AS TotalCredit,
        ISNULL(SUM(td.Amount), 0) - ISNULL(SUM(td.Credit), 0) AS Balance
    FROM dbo.Acc_Sub_Accounts sa
    LEFT JOIN dbo.Acc_Main_Accounts ma ON sa.Main_Acc_Code = ma.Main_Acc_Code
    LEFT JOIN dbo.ACC_Account_Transaction_Details td ON sa.Sub_Code = td.Acc_Code 
        AND (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
        AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
        AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
    WHERE sa.Company_Code = @CompanyId
    GROUP BY sa.Sub_Code, sa.Sub_Acc_Name, sa.Acc_Type, ma.Main_Acc_Name
    ORDER BY sa.Acc_Type, sa.Sub_Code;
END
GO

-- =============================================
-- 15. ACC_sp_GetAdjustedTrialBalance
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetAdjustedTrialBalance]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetAdjustedTrialBalance]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetAdjustedTrialBalance]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        sa.Sub_Code AS AccountCode,
        sa.Sub_Acc_Name AS AccountName,
        sa.Acc_Type,
        ISNULL(SUM(td.Amount), 0) AS Debit,
        ISNULL(SUM(td.Credit), 0) AS Credit,
        ISNULL(SUM(td.Amount), 0) - ISNULL(SUM(td.Credit), 0) AS Balance
    FROM dbo.Acc_Sub_Accounts sa
    LEFT JOIN dbo.ACC_Account_Transaction_Details td ON sa.Sub_Code = td.Acc_Code
        AND (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
        AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
        AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
    WHERE sa.Company_Code = @CompanyId
        AND sa.Acc_Type IN ('ASSETS', 'LIABILITIES', 'EQUITY', 'INCOME', 'EXPENSES', 'COST OF SALES')
    GROUP BY sa.Sub_Code, sa.Sub_Acc_Name, sa.Acc_Type
    HAVING (ISNULL(SUM(td.Amount), 0) - ISNULL(SUM(td.Credit), 0)) <> 0
    ORDER BY sa.Acc_Type, sa.Sub_Code;
END
GO

-- =============================================
-- 16. ACC_sp_GetInvalidJournalTransactions
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetInvalidJournalTransactions]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetInvalidJournalTransactions]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetInvalidJournalTransactions]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Find transactions that don't balance (Debit != Credit) per document
    SELECT 
        j.Doc_No,
        TRY_CONVERT(DATE, j.Date, 103) AS TransactionDate,
        j.Iid AS TransactionType,
        SUM(ISNULL(j.Debit, 0)) AS TotalDebit,
        SUM(ISNULL(j.Credit, 0)) AS TotalCredit,
        SUM(ISNULL(j.Debit, 0)) - SUM(ISNULL(j.Credit, 0)) AS Difference,
        CASE WHEN ABS(SUM(ISNULL(j.Debit, 0)) - SUM(ISNULL(j.Credit, 0))) > 0.01 
            THEN 'Unbalanced' ELSE 'Balanced' END AS Status,
        COUNT(*) AS LineCount
    FROM ACC_Jenaral_Journal j
    WHERE RTRIM(LTRIM(j.Company)) = @CompanyId
        AND (@StartDate IS NULL OR TRY_CONVERT(DATE, j.Date, 103) >= @StartDate)
        AND (@EndDate IS NULL OR TRY_CONVERT(DATE, j.Date, 103) <= @EndDate)
    GROUP BY j.Doc_No, j.Date, j.Iid
    HAVING ABS(SUM(ISNULL(j.Debit, 0)) - SUM(ISNULL(j.Credit, 0))) > 0.01
    ORDER BY TransactionDate DESC;
END
GO

-- =============================================
-- 17. ACC_sp_GetTransactionDetailByAccount
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetTransactionDetailByAccount]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetTransactionDetailByAccount]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetTransactionDetailByAccount]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        td.Acc_Code AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, td.Acc_Code) AS AccountName,
        sa.Acc_Type,
        td.Doc_No AS DocumentNo,
        td.Post_Date AS TransactionDate,
        td.Acc_Name AS Description,
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), '') AS CustomerJob,
        td.Amount AS Debit,
        td.Credit,
        ISNULL(td.Amount, 0) - ISNULL(td.Credit, 0) AS Balance
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
    ORDER BY sa.Acc_Type, td.Acc_Code, td.Post_Date, td.Doc_No;
END
GO

-- =============================================
-- 18. ACC_sp_GetTransactionListWithSplits
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetTransactionListWithSplits]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetTransactionListWithSplits]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetTransactionListWithSplits]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        td.Doc_No AS DocumentNo,
        td.Post_Date AS TransactionDate,
        td.Acc_Code AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, td.Acc_Code) AS AccountName,
        sa.Acc_Type,
        td.Acc_Name AS Description,
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), '') AS CustomerJob,
        td.Amount AS Debit,
        td.Credit,
        td.Company_Id AS CompanyCode
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
    ORDER BY td.Doc_No, td.Post_Date, td.Acc_Code;
END
GO

-- =============================================
-- 19. ACC_sp_GetTransactionListByDate
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetTransactionListByDate]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetTransactionListByDate]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetTransactionListByDate]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        td.Post_Date AS TransactionDate,
        td.Doc_No AS DocumentNo,
        td.Acc_Code AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, td.Acc_Code) AS AccountName,
        td.Amount AS Debit,
        td.Credit,
        td.Acc_Name AS Description,
        ISNULL(NULLIF(LTRIM(RTRIM(td.Cust_Job)), ''), '') AS CustomerJob,
        td.Company_Id AS CompanyCode
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
    ORDER BY td.Post_Date DESC, td.Doc_No;
END
GO

-- =============================================
-- 20. ACC_sp_GetRecentTransactions
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetRecentTransactions]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetRecentTransactions]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetRecentTransactions]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 100
        td.Post_Date AS TransactionDate,
        td.Doc_No AS DocumentNo,
        td.Acc_Code AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, td.Acc_Code) AS AccountName,
        td.Amount AS Debit,
        td.Credit,
        td.Acc_Name AS Description,
        td.Company_Id AS CompanyCode
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
    ORDER BY td.Post_Date DESC, td.Doc_No DESC;
END
GO

-- =============================================
-- 21. ACC_sp_GetAccountList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetAccountList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetAccountList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetAccountList]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        sa.Sub_Code AS AccountCode,
        sa.Sub_Acc_Name AS AccountName,
        sa.Acc_Type,
        ma.Main_Acc_Code AS MainAccountCode,
        ma.Main_Acc_Name AS MainAccountName,
        sa.Company_Code AS CompanyCode,
        CASE WHEN sa.InactiveAcc = 1 THEN 0 ELSE 1 END AS IsActive
    FROM dbo.Acc_Sub_Accounts sa
    LEFT JOIN dbo.Acc_Main_Accounts ma ON sa.Main_Acc_Code = ma.Main_Acc_Code
    WHERE sa.Company_Code = @CompanyId
    ORDER BY sa.Acc_Type, sa.Sub_Code;
END
GO

-- =============================================
-- 22. ACC_sp_GetBusinessSnapshot
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetBusinessSnapshot]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetBusinessSnapshot]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetBusinessSnapshot]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalIncome DECIMAL(18,2), @TotalExpenses DECIMAL(18,2);
    DECLARE @TotalAssets DECIMAL(18,2), @TotalLiabilities DECIMAL(18,2);
    DECLARE @TotalEquity DECIMAL(18,2), @NetProfit DECIMAL(18,2);
    DECLARE @AR DECIMAL(18,2), @AP DECIMAL(18,2);
    DECLARE @CashBalance DECIMAL(18,2);

    -- Income
    SELECT @TotalIncome = SUM(ISNULL(Credit, 0) - ISNULL(Amount, 0))
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type = 'INCOME';

    -- Expenses
    SELECT @TotalExpenses = SUM(ISNULL(Credit, 0) - ISNULL(Amount, 0))
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type IN ('EXPENSES', 'COST OF SALES');

    -- Net Profit
    SET @NetProfit = ISNULL(@TotalIncome, 0) + ISNULL(@TotalExpenses, 0);

    -- Assets
    SELECT @TotalAssets = SUM(ISNULL(Amount, 0) - ISNULL(Credit, 0))
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type = 'ASSETS';

    -- Liabilities
    SELECT @TotalLiabilities = SUM(ISNULL(Credit, 0) - ISNULL(Amount, 0))
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type = 'LIABILITIES';

    -- Accounts Receivable (12000 or similar)
    SELECT @AR = SUM(ISNULL(Amount, 0) - ISNULL(Credit, 0))
    FROM dbo.ACC_Account_Transaction_Details
    WHERE (@CompanyId IS NULL OR Company_Id = @CompanyId)
      AND Acc_Code IN (SELECT Sub_Code FROM Acc_Sub_Accounts WHERE Acc_Type = 'ASSETS' AND Sub_Acc_Name LIKE '%Receivable%');

    -- Accounts Payable
    SELECT @AP = SUM(ISNULL(Credit, 0) - ISNULL(Amount, 0))
    FROM dbo.ACC_Account_Transaction_Details
    WHERE (@CompanyId IS NULL OR Company_Id = @CompanyId)
      AND Acc_Code IN (SELECT Sub_Code FROM Acc_Sub_Accounts WHERE Acc_Type = 'LIABILITIES' AND Sub_Acc_Name LIKE '%Payable%');

    -- Cash
    SELECT @CashBalance = SUM(ISNULL(Amount, 0) - ISNULL(Credit, 0))
    FROM dbo.ACC_Account_Transaction_Details
    WHERE (@CompanyId IS NULL OR Company_Id = @CompanyId)
      AND Acc_Code IN (SELECT Sub_Code FROM Acc_Sub_Accounts WHERE Acc_Type = 'ASSETS' AND (Sub_Acc_Name LIKE '%Cash%' OR Sub_Acc_Name LIKE '%Bank%'));

    SELECT 
        'Income' AS Metric, ISNULL(@TotalIncome, 0) AS Value
    UNION ALL SELECT 'Expenses', ISNULL(@TotalExpenses, 0)
    UNION ALL SELECT 'Net Profit/Loss', ISNULL(@NetProfit, 0)
    UNION ALL SELECT 'Total Assets', ISNULL(@TotalAssets, 0)
    UNION ALL SELECT 'Total Liabilities', ISNULL(@TotalLiabilities, 0)
    UNION ALL SELECT 'Accounts Receivable', ISNULL(@AR, 0)
    UNION ALL SELECT 'Accounts Payable', ISNULL(@AP, 0)
    UNION ALL SELECT 'Cash & Bank Balance', ISNULL(@CashBalance, 0);
END
GO

-- =============================================
-- 23. ACC_sp_GetRecurringTemplateList
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetRecurringTemplateList]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetRecurringTemplateList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetRecurringTemplateList]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        Id,
        Template_Name AS TemplateName,
        Template_Type AS TemplateType,
        Frequency,
        Amount,
        Next_Run_Date AS NextRunDate,
        1 AS IsActive,
        Company_Code AS CompanyCode
    FROM dbo.ACC_Recurring_Template
    WHERE (@CompanyId IS NULL OR Company_Code = @CompanyId)
    ORDER BY Template_Name;
END
GO

-- =============================================
-- 24. ACC_sp_GetCustomSummaryReport
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_GetCustomSummaryReport]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[ACC_sp_GetCustomSummaryReport]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetCustomSummaryReport]
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @AccountingMethod NVARCHAR(20) = NULL,
    @DisplayColumnsBy NVARCHAR(50) = NULL,
    @CompareTo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        CASE 
            WHEN sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES') THEN 'Profit & Loss'
            WHEN sa.Acc_Type IN ('ASSETS', 'LIABILITIES', 'EQUITY') THEN 'Balance Sheet'
            ELSE 'Other'
        END AS ReportSection,
        sa.Acc_Type AS AccountType,
        td.Acc_Code AS AccountCode,
        MAX(ISNULL(sa.Sub_Acc_Name, td.Acc_Code)) AS AccountName,
        SUM(ISNULL(td.Amount, 0)) AS TotalDebit,
        SUM(ISNULL(td.Credit, 0)) AS TotalCredit,
        CASE 
            WHEN sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES') 
                THEN SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0))
            ELSE SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0))
        END AS Balance
    FROM dbo.ACC_Account_Transaction_Details td
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR TRY_CAST(td.Post_Date AS DATE) <= @EndDate)
    GROUP BY 
        CASE 
            WHEN sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES') THEN 'Profit & Loss'
            WHEN sa.Acc_Type IN ('ASSETS', 'LIABILITIES', 'EQUITY') THEN 'Balance Sheet'
            ELSE 'Other'
        END,
        sa.Acc_Type,
        td.Acc_Code
    HAVING (SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0))) <> 0
    ORDER BY ReportSection, AccountType, AccountCode;
END
GO

PRINT 'Phase 1 (Accounting Core) completed - 24 stored procedures rewritten.';
