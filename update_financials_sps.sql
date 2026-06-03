USE Acc_Web;
GO

ALTER PROCEDURE dbo.ACC_sp_GetProfitAndLoss
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
        SUM(ISNULL(td.Amount, 0)) AS Debit,
        SUM(ISNULL(td.Credit, 0)) AS Credit,
        SUM(ISNULL(td.Credit, 0)) - SUM(ISNULL(td.Amount, 0)) AS Net_Income
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type IN ('INCOME', 'EXPENSES', 'COST OF SALES')
    GROUP BY sa.Acc_Type, td.Acc_Code
    ORDER BY sa.Acc_Type DESC, td.Acc_Code;
END
GO

ALTER PROCEDURE dbo.ACC_sp_GetBalanceSheet
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @AsOfDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        sa.Acc_Type AS Account_Type,
        td.Acc_Code AS Account_Code,
        MAX(sa.Sub_Acc_Name) AS Account_Name,
        SUM(ISNULL(td.Amount, 0)) AS Debit,
        SUM(ISNULL(td.Credit, 0)) AS Credit,
        SUM(ISNULL(td.Amount, 0)) - SUM(ISNULL(td.Credit, 0)) AS Net_Balance
    FROM ACC_Account_Transaction_Details td
    JOIN ACC_Sub_Accounts sa ON td.Acc_Code = sa.Sub_Code
    WHERE (@CompanyId IS NULL OR td.Company_Id = @CompanyId)
      AND sa.Acc_Type IN ('ASSETS', 'LIABILITIES', 'EQUITY')
    GROUP BY sa.Acc_Type, td.Acc_Code
    ORDER BY sa.Acc_Type, td.Acc_Code;
END
GO
