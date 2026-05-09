-- =============================================================================
-- Cheque Printing Utility Setup Script
-- =============================================================================

-- 1. CREATE ASSIGNED CHEQUE NUMBERS TABLE
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ACC_Assign_ChqNumber' AND xtype='U')
CREATE TABLE [dbo].[ACC_Assign_ChqNumber](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Chq_No] [nvarchar](20) NULL,
    [Chq_Date] [nvarchar](20) NULL,
    [Payee] [nvarchar](100) NULL,
    [Amount] [money] NULL,
    [Acc_Id] [nvarchar](20) NULL,
    [Chq_Print] [nvarchar](1) DEFAULT 'F',
    [Company] [nvarchar](20) NULL,
    [Doc_No] [nvarchar](20) NULL,
    [InsertDate] [datetime] DEFAULT GETDATE()
);
GO

-- 2. CREATE STORED PROCEDURE FOR SEARCHING CHEQUES
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_SearchChequesToPrint]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[ACC_sp_SearchChequesToPrint]
GO

CREATE PROCEDURE [dbo].[ACC_sp_SearchChequesToPrint]
    @Company     NVARCHAR(20),
    @AccId       NVARCHAR(20),
    @SearchType  NVARCHAR(20), -- 'ALL', 'CHQ_NO', 'DATE', 'PAYEE', 'ADP'
    @Val1        NVARCHAR(100) = NULL,
    @Val2        NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @SearchType = 'ALL'
    BEGIN
        SELECT Chq_No, Chq_Date [Date], Payee, Amount 
        FROM ACC_Assign_ChqNumber 
        WHERE Acc_Id = @AccId AND Chq_Print = 'F' AND Company = @Company
    END
    ELSE IF @SearchType = 'CHQ_NO'
    BEGIN
        SELECT Chq_No, Chq_Date [Date], Payee, Amount 
        FROM ACC_Assign_ChqNumber 
        WHERE Chq_No BETWEEN @Val1 AND @Val2 
          AND Acc_Id = @AccId AND Chq_Print = 'F' AND Company = @Company
    END
    ELSE IF @SearchType = 'DATE'
    BEGIN
        SELECT Chq_No, Chq_Date [Date], Payee, Amount 
        FROM ACC_Assign_ChqNumber 
        WHERE Acc_Id = @AccId AND Chq_Print = 'F' AND Company = @Company
          AND Chq_Date BETWEEN @Val1 AND @Val2
    END
    ELSE IF @SearchType = 'PAYEE'
    BEGIN
        SELECT Chq_No, Chq_Date [Date], Payee, Amount 
        FROM ACC_Assign_ChqNumber 
        WHERE Acc_Id = @AccId AND Chq_Print = 'F' AND Company = @Company
          AND Payee = @Val1
    END
    ELSE IF @SearchType = 'ADP' -- Advance Pay
    BEGIN
        SELECT Chq_No, Chq_Date [Date], Vender [Payee], Amount 
        FROM ACC_AdvancePay 
        WHERE Doc_No = @Val1 AND Company = @Company
    END
END
GO

PRINT 'Cheque Printing setup completed.';
