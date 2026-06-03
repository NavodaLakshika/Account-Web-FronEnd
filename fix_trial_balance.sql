USE Acc_Web;
GO

ALTER PROCEDURE dbo.ACC_sp_GetTrialBalance
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @AsOfDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Acc_Code AS Account_Code,
        MAX(Memo) AS Account_Name,
        SUM(ISNULL(Amount, 0)) AS Debit,
        SUM(ISNULL(Credit, 0)) AS Credit,
        SUM(ISNULL(Amount, 0)) - SUM(ISNULL(Credit, 0)) AS Net_Balance
    FROM ACC_Account_Transaction_Details
    WHERE (@CompanyId IS NULL OR Company_Id = @CompanyId)
      AND (@AsOfDate IS NULL OR Post_Date <= @AsOfDate)
    GROUP BY Acc_Code
    ORDER BY Acc_Code;
END
GO
