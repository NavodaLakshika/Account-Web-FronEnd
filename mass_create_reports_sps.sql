-- ==============================================================================
-- ACCOUNTS WEB - MASS GENERATED STORED PROCEDURES (PHASE 2)
-- ==============================================================================

IF OBJECT_ID('dbo.ACC_sp_GetProfitAndLossDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetProfitAndLossDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetProfitAndLossDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetProfitAndLossYeartodateComparison', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetProfitAndLossYeartodateComparison
GO
CREATE PROCEDURE dbo.ACC_sp_GetProfitAndLossYeartodateComparison
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetQuarterlyProfitAndLossSummary', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetQuarterlyProfitAndLossSummary
GO
CREATE PROCEDURE dbo.ACC_sp_GetQuarterlyProfitAndLossSummary
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetStatementOfChangesInEquity', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetStatementOfChangesInEquity
GO
CREATE PROCEDURE dbo.ACC_sp_GetStatementOfChangesInEquity
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetCustomSummaryReport', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetCustomSummaryReport
GO
CREATE PROCEDURE dbo.ACC_sp_GetCustomSummaryReport
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetProjectProfitabilitySummary', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetProjectProfitabilitySummary
GO
CREATE PROCEDURE dbo.ACC_sp_GetProjectProfitabilitySummary
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetCustomerBalanceSummary', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetCustomerBalanceSummary
GO
CREATE PROCEDURE dbo.ACC_sp_GetCustomerBalanceSummary
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetCustomerBalanceDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetCustomerBalanceDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetCustomerBalanceDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetOpenInvoices', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetOpenInvoices
GO
CREATE PROCEDURE dbo.ACC_sp_GetOpenInvoices
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetAccountsReceivableAgeingDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetAccountsReceivableAgeingDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetAccountsReceivableAgeingDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetCollectionsReport', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetCollectionsReport
GO
CREATE PROCEDURE dbo.ACC_sp_GetCollectionsReport
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetInvoiceList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetInvoiceList
GO
CREATE PROCEDURE dbo.ACC_sp_GetInvoiceList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetStatementList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetStatementList
GO
CREATE PROCEDURE dbo.ACC_sp_GetStatementList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetTermsList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetTermsList
GO
CREATE PROCEDURE dbo.ACC_sp_GetTermsList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetUnbilledTime', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetUnbilledTime
GO
CREATE PROCEDURE dbo.ACC_sp_GetUnbilledTime
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetUnbilledCharges', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetUnbilledCharges
GO
CREATE PROCEDURE dbo.ACC_sp_GetUnbilledCharges
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetSalesByCustomerSummary', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetSalesByCustomerSummary
GO
CREATE PROCEDURE dbo.ACC_sp_GetSalesByCustomerSummary
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetSalesByCustomerDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetSalesByCustomerDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetSalesByCustomerDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetSalesByProductserviceSummary', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetSalesByProductserviceSummary
GO
CREATE PROCEDURE dbo.ACC_sp_GetSalesByProductserviceSummary
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetSalesByProductserviceDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetSalesByProductserviceDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetSalesByProductserviceDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetProductserviceList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetProductserviceList
GO
CREATE PROCEDURE dbo.ACC_sp_GetProductserviceList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetIncomeByCustomerSummary', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetIncomeByCustomerSummary
GO
CREATE PROCEDURE dbo.ACC_sp_GetIncomeByCustomerSummary
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetCustomerContactList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetCustomerContactList
GO
CREATE PROCEDURE dbo.ACC_sp_GetCustomerContactList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetPaymentMethodList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetPaymentMethodList
GO
CREATE PROCEDURE dbo.ACC_sp_GetPaymentMethodList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetTransactionListByCustomer', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetTransactionListByCustomer
GO
CREATE PROCEDURE dbo.ACC_sp_GetTransactionListByCustomer
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetTimeActivitiesByCustomerDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetTimeActivitiesByCustomerDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetTimeActivitiesByCustomerDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetEstimatesByCustomer', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetEstimatesByCustomer
GO
CREATE PROCEDURE dbo.ACC_sp_GetEstimatesByCustomer
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetDepositDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetDepositDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetDepositDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetBillApprovalStatus', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetBillApprovalStatus
GO
CREATE PROCEDURE dbo.ACC_sp_GetBillApprovalStatus
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetProductitemProfitabilityByCustomer', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetProductitemProfitabilityByCustomer
GO
CREATE PROCEDURE dbo.ACC_sp_GetProductitemProfitabilityByCustomer
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetInvoiceApprovalStatus', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetInvoiceApprovalStatus
GO
CREATE PROCEDURE dbo.ACC_sp_GetInvoiceApprovalStatus
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetTransactionListByTagGroup', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetTransactionListByTagGroup
GO
CREATE PROCEDURE dbo.ACC_sp_GetTransactionListByTagGroup
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetInvoicesAndReceivedPayments', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetInvoicesAndReceivedPayments
GO
CREATE PROCEDURE dbo.ACC_sp_GetInvoicesAndReceivedPayments
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetSupplierPhoneList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetSupplierPhoneList
GO
CREATE PROCEDURE dbo.ACC_sp_GetSupplierPhoneList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetBillsAndAppliedPayments', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetBillsAndAppliedPayments
GO
CREATE PROCEDURE dbo.ACC_sp_GetBillsAndAppliedPayments
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetCustomerPhoneList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetCustomerPhoneList
GO
CREATE PROCEDURE dbo.ACC_sp_GetCustomerPhoneList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetPurchasesByProductserviceDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetPurchasesByProductserviceDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetPurchasesByProductserviceDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetTimeSummaryByPayType', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetTimeSummaryByPayType
GO
CREATE PROCEDURE dbo.ACC_sp_GetTimeSummaryByPayType
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetTimesheetDetailByEmployee', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetTimesheetDetailByEmployee
GO
CREATE PROCEDURE dbo.ACC_sp_GetTimesheetDetailByEmployee
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetTaxLiabilityReport', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetTaxLiabilityReport
GO
CREATE PROCEDURE dbo.ACC_sp_GetTaxLiabilityReport
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetAdjustedTrialBalance', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetAdjustedTrialBalance
GO
CREATE PROCEDURE dbo.ACC_sp_GetAdjustedTrialBalance
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetInvalidJournalTransactions', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetInvalidJournalTransactions
GO
CREATE PROCEDURE dbo.ACC_sp_GetInvalidJournalTransactions
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetProfitAndLossByTagGroup', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetProfitAndLossByTagGroup
GO
CREATE PROCEDURE dbo.ACC_sp_GetProfitAndLossByTagGroup
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetSalesByCustomerTypeDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetSalesByCustomerTypeDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetSalesByCustomerTypeDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetPurchaseList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetPurchaseList
GO
CREATE PROCEDURE dbo.ACC_sp_GetPurchaseList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetGeneralLedgerList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetGeneralLedgerList
GO
CREATE PROCEDURE dbo.ACC_sp_GetGeneralLedgerList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetPurchasesBySupplierDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetPurchasesBySupplierDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetPurchasesBySupplierDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetAuditLog', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetAuditLog
GO
CREATE PROCEDURE dbo.ACC_sp_GetAuditLog
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetExpensesBySupplierSummary', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetExpensesBySupplierSummary
GO
CREATE PROCEDURE dbo.ACC_sp_GetExpensesBySupplierSummary
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetTransactionListBySupplier', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetTransactionListBySupplier
GO
CREATE PROCEDURE dbo.ACC_sp_GetTransactionListBySupplier
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetSupplierContactList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetSupplierContactList
GO
CREATE PROCEDURE dbo.ACC_sp_GetSupplierContactList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetChequeDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetChequeDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetChequeDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetAccountsPayableAgeingSummary', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetAccountsPayableAgeingSummary
GO
CREATE PROCEDURE dbo.ACC_sp_GetAccountsPayableAgeingSummary
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetSupplierBalanceDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetSupplierBalanceDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetSupplierBalanceDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetBillPaymentList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetBillPaymentList
GO
CREATE PROCEDURE dbo.ACC_sp_GetBillPaymentList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetAccountsPayableAgeingDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetAccountsPayableAgeingDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetAccountsPayableAgeingDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetUnpaidBills', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetUnpaidBills
GO
CREATE PROCEDURE dbo.ACC_sp_GetUnpaidBills
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetSupplierBalanceSummary', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetSupplierBalanceSummary
GO
CREATE PROCEDURE dbo.ACC_sp_GetSupplierBalanceSummary
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetAccountList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetAccountList
GO
CREATE PROCEDURE dbo.ACC_sp_GetAccountList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetReconciliationReports', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetReconciliationReports
GO
CREATE PROCEDURE dbo.ACC_sp_GetReconciliationReports
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetJournal', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetJournal
GO
CREATE PROCEDURE dbo.ACC_sp_GetJournal
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetProfitAndLossComparison', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetProfitAndLossComparison
GO
CREATE PROCEDURE dbo.ACC_sp_GetProfitAndLossComparison
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetBalanceSheetComparison', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetBalanceSheetComparison
GO
CREATE PROCEDURE dbo.ACC_sp_GetBalanceSheetComparison
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetTransactionDetailByAccount', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetTransactionDetailByAccount
GO
CREATE PROCEDURE dbo.ACC_sp_GetTransactionDetailByAccount
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetGeneralLedger', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetGeneralLedger
GO
CREATE PROCEDURE dbo.ACC_sp_GetGeneralLedger
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetTransactionListWithSplits', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetTransactionListWithSplits
GO
CREATE PROCEDURE dbo.ACC_sp_GetTransactionListWithSplits
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetStatementOfCashFlows', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetStatementOfCashFlows
GO
CREATE PROCEDURE dbo.ACC_sp_GetStatementOfCashFlows
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetTransactionListByDate', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetTransactionListByDate
GO
CREATE PROCEDURE dbo.ACC_sp_GetTransactionListByDate
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetRecentTransactions', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetRecentTransactions
GO
CREATE PROCEDURE dbo.ACC_sp_GetRecentTransactions
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetRecurringTemplateList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetRecurringTemplateList
GO
CREATE PROCEDURE dbo.ACC_sp_GetRecurringTemplateList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetTimeActivitiesByEmployeeDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetTimeActivitiesByEmployeeDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetTimeActivitiesByEmployeeDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetRecenteditedTimeActivities', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetRecenteditedTimeActivities
GO
CREATE PROCEDURE dbo.ACC_sp_GetRecenteditedTimeActivities
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetEmployeeContactList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetEmployeeContactList
GO
CREATE PROCEDURE dbo.ACC_sp_GetEmployeeContactList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetInventoryValuationSummary', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetInventoryValuationSummary
GO
CREATE PROCEDURE dbo.ACC_sp_GetInventoryValuationSummary
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetInventoryValuationDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetInventoryValuationDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetInventoryValuationDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetStockTakeWorksheet', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetStockTakeWorksheet
GO
CREATE PROCEDURE dbo.ACC_sp_GetStockTakeWorksheet
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetOpenPurchaseOrderDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetOpenPurchaseOrderDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetOpenPurchaseOrderDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetOpenPurchaseOrderList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetOpenPurchaseOrderList
GO
CREATE PROCEDURE dbo.ACC_sp_GetOpenPurchaseOrderList
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetAccountsReceivableAgeingSummary', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetAccountsReceivableAgeingSummary
GO
CREATE PROCEDURE dbo.ACC_sp_GetAccountsReceivableAgeingSummary
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetBalanceSheetDetail', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetBalanceSheetDetail
GO
CREATE PROCEDURE dbo.ACC_sp_GetBalanceSheetDetail
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetBalanceSheetSummary', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetBalanceSheetSummary
GO
CREATE PROCEDURE dbo.ACC_sp_GetBalanceSheetSummary
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetBusinessSnapshot', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetBusinessSnapshot
GO
CREATE PROCEDURE dbo.ACC_sp_GetBusinessSnapshot
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetProfitAndLossAsOfTotalIncome', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetProfitAndLossAsOfTotalIncome
GO
CREATE PROCEDURE dbo.ACC_sp_GetProfitAndLossAsOfTotalIncome
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetProfitAndLossByCustomer', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetProfitAndLossByCustomer
GO
CREATE PROCEDURE dbo.ACC_sp_GetProfitAndLossByCustomer
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO

IF OBJECT_ID('dbo.ACC_sp_GetProfitAndLossByMonth', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_GetProfitAndLossByMonth
GO
CREATE PROCEDURE dbo.ACC_sp_GetProfitAndLossByMonth
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
        ''Report Category'' AS AccountType,
        th.Account AS AccountCode,
        ISNULL(sa.Sub_Acc_Name, th.Account) AS AccountName,
        SUM(ISNULL(th.Net_Amount, 0)) AS Balance
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) AS PivotColumn '
    ELSE
        SET @DynamicSQL = @DynamicSQL + ', ''Total'' AS PivotColumn '
        
    SET @DynamicSQL = @DynamicSQL + '
    FROM dbo.ACC_Transaction_Header th
    LEFT JOIN dbo.Acc_Sub_Accounts sa ON th.Account = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR th.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR th.Post_Date >= @StartDate)
      AND (@EndDate IS NULL OR th.Post_Date <= @EndDate)
    '
    
    SET @DynamicSQL = @DynamicSQL + '
    GROUP BY 
        th.Account,
        ISNULL(sa.Sub_Acc_Name, th.Account)
    '
    
    IF @DisplayColumnsBy = 'Customer'
        SET @DynamicSQL = @DynamicSQL + ', ISNULL(CAST(th.Customer_Id AS NVARCHAR), ''Unknown Customer'') '
    ELSE IF @DisplayColumnsBy = 'Month'
        SET @DynamicSQL = @DynamicSQL + ', DATENAME(month, th.Post_Date) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Quarter'
        SET @DynamicSQL = @DynamicSQL + ', ''Q'' + CAST(DATEPART(quarter, th.Post_Date) AS NVARCHAR) + '' '' + CAST(YEAR(th.Post_Date) AS NVARCHAR) '
    ELSE IF @DisplayColumnsBy = 'Years'
        SET @DynamicSQL = @DynamicSQL + ', CAST(YEAR(th.Post_Date) AS NVARCHAR) '
        
    SET @DynamicSQL = @DynamicSQL + '
    HAVING SUM(ISNULL(th.Net_Amount, 0)) <> 0
    ORDER BY AccountCode;
    '
    
    EXEC sp_executesql @DynamicSQL, 
        N'@CompanyId NVARCHAR(50), @StartDate DATE, @EndDate DATE',
        @CompanyId, @StartDate, @EndDate;
END
GO
