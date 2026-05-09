USE [Acc_Web]
GO

-- 1. Create ACC_Addnew_ChkBook table if missing
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Addnew_ChkBook]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Addnew_ChkBook](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Acc_Id] [nvarchar](20) NOT NULL,
        [ChkBook_No] [int] NOT NULL,
        [Chk_No] [nvarchar](10) NOT NULL,
        [Chk_Date] [nvarchar](30) NULL,
        [Create_User] [nvarchar](50) NULL,
        [Create_Date] [nvarchar](30) NULL,
        [Company] [nvarchar](20) NOT NULL,
        [Is_Used] [bit] DEFAULT 0,
        CONSTRAINT [PK_ACC_Addnew_ChkBook] PRIMARY KEY CLUSTERED ([Id] ASC)
    )
END
GO

-- 2. Stored Procedure: ACC_sp_Add_CheckBookNo
IF EXISTS (SELECT * FROM sysobjects WHERE name='ACC_sp_Add_CheckBookNo' AND xtype='P')
    DROP PROCEDURE [dbo].[ACC_sp_Add_CheckBookNo]
GO

CREATE PROCEDURE [dbo].[ACC_sp_Add_CheckBookNo]
    @Err_x			INT OUTPUT,
    @Acc_Code		NVARCHAR(20),
    @ChkBk_No		INT,
    @Chk_No			DECIMAL(18,0),
    @Date			NVARCHAR(30),
    @User			NVARCHAR(50),
    @Create_Date	NVARCHAR(30),
    @Company		NVARCHAR(20),
    @Type			NVARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRAN
            
            DECLARE @Check_No NVARCHAR(10) 
            SET @Check_No = LTRIM(RTRIM(REPLICATE('0',(6-LEN(CAST(@Chk_No AS NVARCHAR(10)))))))+CAST(@Chk_No AS NVARCHAR(10)) 
            
            IF @Type = 'DELETE'
            BEGIN
                DELETE FROM ACC_Addnew_ChkBook WHERE ChkBook_No = @ChkBk_No AND Acc_Id = @Acc_Code AND Company = @Company
            END
            ELSE
            BEGIN
                IF NOT EXISTS (SELECT * FROM ACC_Addnew_ChkBook WHERE Acc_Id=@Acc_Code AND Chk_No=@Check_No AND Company=@Company)
                BEGIN
                    INSERT INTO ACC_Addnew_ChkBook (Acc_Id, ChkBook_No, Chk_No, Chk_Date, Create_User, Create_Date, Company, Is_Used )
                    VALUES(@Acc_Code, @ChkBk_No, @Check_No, @Date, @User, @Create_Date,@Company, 0 )
                END
            END

            -- Log Transaction
            IF NOT EXISTS(SELECT * FROM ACC_Addnew_ChkBook WHERE ChkBook_No = @ChkBk_No AND Company = @Company) 
            BEGIN
                INSERT INTO ACC_Transaction_log ( Type , Transaction_Id , Transaction_Name , Doc_Number , Emp_Code , Transaction_Date , Insert_Date, Company )
                VALUES ('Transaction', '', 'Cheque Book Number', @Check_No, @User, GETDATE(), GETDATE(), @Company)
            END
            
        COMMIT TRAN
        SET @Err_x = 0
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN
        SET @Err_x = 1
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1)
    END CATCH
END
GO

-- 3. Stored Procedure: ACC_sp_GetChequeBookLookups
IF EXISTS (SELECT * FROM sysobjects WHERE name='ACC_sp_GetChequeBookLookups' AND xtype='P')
    DROP PROCEDURE [dbo].[ACC_sp_GetChequeBookLookups]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetChequeBookLookups]
    @Company NVARCHAR(20),
    @AccCode NVARCHAR(20) = ''
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Accounts (Looking for Cash & Bank related accounts in current schema)
    SELECT Sub_Code [code], Sub_Acc_Name [name] 
    FROM ACC_Sub_Accounts 
    WHERE Main_Acc_Code IN ('11000', '11200') OR Sub_Code IN ('11200')
    ORDER BY Sub_Code

    -- Next Book Number for specific account
    IF @AccCode <> ''
    BEGIN
        SELECT ISNULL(MAX(ChkBook_No), 0) + 1 AS NextBookNo 
        FROM ACC_Addnew_ChkBook 
        WHERE Acc_Id = @AccCode AND Company = @Company
    END
    ELSE
    BEGIN
        SELECT 1 AS NextBookNo
    END
END
GO

-- 4. Stored Procedure: ACC_sp_GetChequeBookList
IF EXISTS (SELECT * FROM sysobjects WHERE name='ACC_sp_GetChequeBookList' AND xtype='P')
    DROP PROCEDURE [dbo].[ACC_sp_GetChequeBookList]
GO

CREATE PROCEDURE [dbo].[ACC_sp_GetChequeBookList]
    @Company NVARCHAR(20),
    @AccCode NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ChkBook_No, MIN(Chk_No) [StartNo], MAX(Chk_No) [EndNo], Chk_Date, Create_User
    FROM ACC_Addnew_ChkBook
    WHERE Acc_Id = @AccCode AND Company = @Company
    GROUP BY ChkBook_No, Chk_Date, Create_User
    ORDER BY ChkBook_No DESC
END
GO

PRINT 'Cheque Register Setup completed successfully.'
