-- =============================================================================
-- Collection Deposit Setup Script (Fixed & Robust Version)
-- Missing Tables, Columns, and Stored Procedures for Make Deposit Workflow
-- =============================================================================

USE [Acc_Web]
GO

-- ────────────────────────────────────────────────────────────────────────────
-- 1. ACC_tempMakeDepLoad TABLE
-- ────────────────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ACC_tempMakeDepLoad' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[ACC_tempMakeDepLoad](
        [Iid]           [nvarchar](50) NULL,
        [Doc_No]        [nvarchar](50) NULL,
        [Post_Date]     [nvarchar](20) NULL,
        [Amount]        [numeric](18, 2) NULL,
        [Balance]       [numeric](18, 2) NULL,
        [Vendor_Id]     [nvarchar](20) NULL,
        [Comp_ID]       [nvarchar](20) NULL,
        [Chk]           [bit] NULL DEFAULT 0,
        [PayType]       [nvarchar](50) NULL,
        [TempDocNo]     [nvarchar](50) NULL,
        [Cheque_No]     [nvarchar](50) NULL,
        [Cheque_Date]   [nvarchar](20) NULL,
        [CostCenter]    [nvarchar](20) NULL,
        [ReceiptNo]     [nvarchar](50) NULL
    )
END
ELSE
BEGIN
    -- Ensure columns exist in case table was created with different schema
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_tempMakeDepLoad') AND name='CostCenter')
        ALTER TABLE ACC_tempMakeDepLoad ADD [CostCenter] [nvarchar](20) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_tempMakeDepLoad') AND name='TempDocNo')
        ALTER TABLE ACC_tempMakeDepLoad ADD [TempDocNo] [nvarchar](50) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_tempMakeDepLoad') AND name='Chk')
        ALTER TABLE ACC_tempMakeDepLoad ADD [Chk] [bit] NULL DEFAULT 0;
END
GO

-- ────────────────────────────────────────────────────────────────────────────
-- 2. ACC_TempMakeDeposit TABLE
-- ────────────────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ACC_TempMakeDeposit' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[ACC_TempMakeDeposit](
        [Iid]           [nvarchar](50) NULL,
        [Doc_No]        [nvarchar](50) NULL,
        [Post_Date]     [nvarchar](20) NULL,
        [Amount]        [numeric](18, 2) NULL,
        [Balance]       [numeric](18, 2) NULL,
        [SteadyBal]     [numeric](18, 2) NULL,
        [Vendor_Id]     [nvarchar](20) NULL,
        [Comp_ID]       [nvarchar](20) NULL,
        [PayType]       [nvarchar](50) NULL,
        [Temp_DocNo]    [nvarchar](50) NULL,
        [Cheque_No]     [nvarchar](50) NULL,
        [Cheque_Date]   [nvarchar](20) NULL,
        [CostCenter]    [nvarchar](20) NULL
    )
END
ELSE
BEGIN
    -- Ensure all required columns exist
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_TempMakeDeposit') AND name='Temp_DocNo')
        ALTER TABLE ACC_TempMakeDeposit ADD [Temp_DocNo] [nvarchar](50) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_TempMakeDeposit') AND name='SteadyBal')
        ALTER TABLE ACC_TempMakeDeposit ADD [SteadyBal] [numeric](18, 2) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_TempMakeDeposit') AND name='PayType')
        ALTER TABLE ACC_TempMakeDeposit ADD [PayType] [nvarchar](50) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_TempMakeDeposit') AND name='Vendor_Id')
        ALTER TABLE ACC_TempMakeDeposit ADD [Vendor_Id] [nvarchar](20) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_TempMakeDeposit') AND name='CostCenter')
        ALTER TABLE ACC_TempMakeDeposit ADD [CostCenter] [nvarchar](20) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_TempMakeDeposit') AND name='Cheque_No')
        ALTER TABLE ACC_TempMakeDeposit ADD [Cheque_No] [nvarchar](50) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_TempMakeDeposit') AND name='Cheque_Date')
        ALTER TABLE ACC_TempMakeDeposit ADD [Cheque_Date] [nvarchar](20) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_TempMakeDeposit') AND name='Post_Date')
        ALTER TABLE ACC_TempMakeDeposit ADD [Post_Date] [nvarchar](20) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_TempMakeDeposit') AND name='Amount')
        ALTER TABLE ACC_TempMakeDeposit ADD [Amount] [numeric](18, 2) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_TempMakeDeposit') AND name='Balance')
        ALTER TABLE ACC_TempMakeDeposit ADD [Balance] [numeric](18, 2) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_TempMakeDeposit') AND name='Iid')
        ALTER TABLE ACC_TempMakeDeposit ADD [Iid] [nvarchar](50) NULL;
END
GO

-- ────────────────────────────────────────────────────────────────────────────
-- 3. ACC_UnDepositedFund TABLE
-- ────────────────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ACC_UnDepositedFund' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[ACC_UnDepositedFund](
        [Iid]           [nvarchar](50) NULL,
        [Doc_No]        [nvarchar](50) NULL,
        [Post_Date]     [nvarchar](20) NULL,
        [Amount]        [numeric](18, 2) NULL,
        [Balance]       [numeric](18, 2) NULL,
        [Pay_Type]      [nvarchar](50) NULL,
        [Loca]          [nvarchar](20) NULL,
        [Comp_Id]       [nvarchar](20) NULL,
        [Cheque_No]     [nvarchar](50) NULL,
        [Cheque_Date]   [nvarchar](20) NULL,
        [CostCenter]    [nvarchar](20) NULL
    )
END
GO

-- ────────────────────────────────────────────────────────────────────────────
-- 4. ENSURE ACC_GetSystem_DoctNo HAS REQUIRED COLUMNS
-- ────────────────────────────────────────────────────────────────────────────
IF EXISTS (SELECT * FROM sysobjects WHERE name='ACC_GetSystem_DoctNo' AND xtype='U')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_GetSystem_DoctNo') AND name='Temp_ColDep')
        ALTER TABLE ACC_GetSystem_DoctNo ADD [Temp_ColDep] [int] NULL DEFAULT 1;
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_GetSystem_DoctNo') AND name='Temp_Mdp')
        ALTER TABLE ACC_GetSystem_DoctNo ADD [Temp_Mdp] [int] NULL DEFAULT 1;

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ACC_GetSystem_DoctNo') AND name='CI')
        ALTER TABLE ACC_GetSystem_DoctNo ADD [CI] [int] NULL DEFAULT 1;
END
GO

-- ────────────────────────────────────────────────────────────────────────────
-- 5. UPDATE STORED PROCEDURES
-- ────────────────────────────────────────────────────────────────────────────

-- Procedure: ACC_sp_CallDocNumber
IF EXISTS (SELECT * FROM sysobjects WHERE name='ACC_sp_CallDocNumber' AND xtype='P')
    DROP PROCEDURE [dbo].[ACC_sp_CallDocNumber]
GO

CREATE PROCEDURE [dbo].[ACC_sp_CallDocNumber]
	@Err_x		INT OUTPUT,
	@TransId	NVARCHAR(10),
	@Company	NVARCHAR(10),
	@Loca		NVARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRAN

        IF (@TransId = 'MDPO') -- MakeDep document number
        BEGIN
            DECLARE @MDP NVARCHAR(20)
            DECLARE @TEMPDOC NVARCHAR(20)
            SET @MDP = (SELECT ISNULL(Temp_ColDep, 1) FROM ACC_GetSystem_DoctNo WHERE Com_Code = @Company)
            
            SET @MDP = LTRIM(RTRIM(REPLICATE('0',(6-LEN(@MDP)))))+LTRIM(RTRIM(@MDP))
                
            SELECT 'MDP' + @Company + @MDP [Temp_ColDep]

            SET @TEMPDOC= 'MDP' + @Company + @MDP

            UPDATE ACC_GetSystem_DoctNo SET Temp_ColDep = ISNULL(Temp_ColDep, 1) + 1 WHERE Com_Code = @Company

            DELETE FROM ACC_tempMakeDepLoad WHERE Comp_Id=@Company and TempDocNo=@TEMPDOC
            
            INSERT INTO ACC_tempMakeDepLoad(Amount ,Balance ,Comp_ID ,Doc_No ,Iid ,PayType,Post_Date ,Vendor_Id, Chk, TempDocNo, Cheque_No, Cheque_Date, CostCenter)
            SELECT Amount ,Balance ,Comp_Id ,Doc_No ,Iid  ,Pay_Type ,Post_Date ,CASE WHEN Loca IS NULL THEN '01' ELSE Loca END, 0 , @TEMPDOC, ISNULL(Cheque_No,''), ISNULL(Cheque_Date,''), CostCenter 
            FROM ACC_UnDepositedFund 
            WHERE Comp_Id=@Company AND Balance>0

            SELECT Post_Date DATE,Iid Type,Doc_No Number, Loca_Name NAME, Amount Amount, Balance, 0 chk, Cheque_Date, Cheque_No 
            FROM ACC_tempMakeDepLoad 
            LEFT JOIN ACC_Location ON Code = Vendor_Id 
            WHERE Comp_Id=@Company AND TempDocNo=@TEMPDOC AND Balance>0

            SELECT Cust_Name,Code FROM ACC_Customer WHERE Locked=0

            SELECT ISNULL(SUM(Balance),0) Balance FROM ACC_tempMakeDepLoad WHERE Comp_Id=@Company AND TempDocNo=@TEMPDOC
        END
        
        COMMIT TRAN
        SET @Err_x = 0
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN
        SET @Err_x = ERROR_NUMBER()
        RAISERROR('Error in ACC_sp_CallDocNumber', 16, 1)
    END CATCH
END
GO

-- Procedure: ACC_sp_LoadSelectedPaymentForDep
IF EXISTS (SELECT * FROM sysobjects WHERE name='ACC_sp_LoadSelectedPaymentForDep' AND xtype='P')
    DROP PROCEDURE [dbo].[ACC_sp_LoadSelectedPaymentForDep]
GO

CREATE PROCEDURE [dbo].[ACC_sp_LoadSelectedPaymentForDep]
    @Comp_Id	nvarchar(20),
    @TempDocNo	nvarchar(20),
    @UserName	nvarchar(50),
    @PayType	nvarchar(50),
    @CostCenter nvarchar(20) = ''
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ErrorMessage NVARCHAR(4000);
    BEGIN TRY
        BEGIN TRAN

        -- Delete existing if any for this temp doc
        DELETE FROM ACC_TempMakeDeposit WHERE Comp_ID=@Comp_Id AND Temp_DocNo = @TempDocNo
        
        IF(@PayType = 'CHEQUE' OR @PayType = 'Cheque')
        BEGIN
            INSERT INTO ACC_TempMakeDeposit (Amount ,Balance , SteadyBal, Comp_ID ,Doc_No ,Iid , Post_Date, PayType ,Vendor_Id, Temp_DocNo, TempDocNo, Cheque_Date, Cheque_No, CostCenter)
            SELECT Amount ,Balance, Balance ,Comp_Id ,Doc_No ,Iid   ,Post_Date ,PayType,Vendor_Id, @TempDocNo, @TempDocNo, 
                   CASE WHEN ISDATE(Cheque_Date) = 1 THEN Cheque_Date ELSE NULL END, 
                   Cheque_No, CostCenter 
            FROM ACC_tempMakeDepLoad 
            WHERE Comp_Id=@Comp_Id AND Chk=1 AND TempDocNo=@TempDocNo AND PayType='CHEQUE' 

            SELECT Cheque_Date [DATE], Cheque_No Type,Doc_No Number, Loca_Name [NAME], Amount Amount, Balance, 0 PaidAmt 
            FROM ACC_TempMakeDeposit 
            LEFT JOIN ACC_Location ON Code=Vendor_Id 
            WHERE Temp_DocNo=@TempDocNo AND Comp_ID=@Comp_Id
        END
        ELSE
        BEGIN
            INSERT INTO ACC_TempMakeDeposit (Amount ,Balance , SteadyBal, Comp_ID ,Doc_No ,Iid , Post_Date, PayType ,Vendor_Id, Temp_DocNo, TempDocNo, CostCenter)
            SELECT Amount ,Balance, Balance ,Comp_Id ,Doc_No ,Iid   ,Post_Date , CASE WHEN PayType = 'CREDIT' THEN Iid ELSE PayType END, Vendor_Id, @TempDocNo, @TempDocNo, CostCenter 
            FROM ACC_tempMakeDepLoad 
            WHERE Comp_Id=@Comp_Id AND Chk=1 AND TempDocNo=@TempDocNo AND PayType <> 'CHEQUE' 

            SELECT Post_Date [DATE], PayType Type,Doc_No Number, Loca_Name [NAME], Amount Amount, Balance, 0 PaidAmt 
            FROM ACC_TempMakeDeposit 
            LEFT JOIN ACC_Location ON Code=Vendor_Id 
            WHERE Temp_DocNo=@TempDocNo AND Comp_ID=@Comp_Id
        END

        SELECT CAST(ISNULL(SUM(Balance),0) AS DECIMAL (18,2)) Balance FROM ACC_TempMakeDeposit WHERE Temp_DocNo=@TempDocNo AND Comp_ID=@Comp_Id

        COMMIT TRAN
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN
        SET @ErrorMessage = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1)
    END CATCH
END
GO

-- Procedure: ACC_sp_tempMakeDepLoad
IF EXISTS (SELECT * FROM sysobjects WHERE name='ACC_sp_tempMakeDepLoad' AND xtype='P')
    DROP PROCEDURE [dbo].[ACC_sp_tempMakeDepLoad]
GO

CREATE PROCEDURE [dbo].[ACC_sp_tempMakeDepLoad] 
	@Mode		    Int = 0,
	@Comp_Id		Nvarchar(20),
	@TempDocNo		varchar(25),
	@PayType		varchar(20),
    @CostCenter     nvarchar(20) = ''
AS
BEGIN
    SET NOCOUNT ON;
	
    IF (@PayType='' OR @PayType='All Payment Types')
	BEGIN
		SELECT Post_Date [DATE], Iid [Type], Doc_No [Number], Loca_Name [NAME], Amount Amount, Balance, Chk [chk] 
        FROM ACC_tempMakeDepLoad 
        LEFT JOIN ACC_Location ON Code=Vendor_Id 
        WHERE Comp_Id=@Comp_Id AND TempDocNo=@TempDocNo 
        AND (ISNULL(@CostCenter,'') = '' OR CostCenter = @CostCenter)
        ORDER BY Post_Date
	END
	ELSE IF (@PayType='CREDIT')
	BEGIN
		SELECT Post_Date [DATE],Iid [Type],Doc_No [Number], Loca_Name [NAME], Amount [Amount], Balance, Chk [chk] 
        FROM ACC_tempMakeDepLoad 
        LEFT JOIN ACC_Location ON Code=Vendor_Id 
        WHERE Comp_Id=@Comp_Id AND TempDocNo=@TempDocNo AND PayType=@PayType AND Iid <> 'CRED' 
        AND (ISNULL(@CostCenter,'') = '' OR CostCenter = @CostCenter)
        ORDER BY Post_Date
	END
	ELSE IF (@PayType='CR_Note')
	BEGIN
		SELECT Post_Date [DATE],Iid [Type],Doc_No [Number], Loca_Name [NAME], Amount [Amount], Balance, Chk [chk] 
        FROM ACC_tempMakeDepLoad 
        LEFT JOIN ACC_Location ON Code=Vendor_Id 
        WHERE Comp_Id=@Comp_Id AND TempDocNo=@TempDocNo AND PayType IN ('Direct Deposit','STP','CR_Note','PARKING','OTACC') 
        AND (ISNULL(@CostCenter,'') = '' OR CostCenter = @CostCenter)
        ORDER BY Post_Date
	END
	ELSE IF (@PayType='Cheque' OR @PayType='CHEQUE')
	BEGIN
		SELECT Cheque_Date [DATE],Cheque_No [Type], Doc_No [Number], Loca_Name NAME, Amount Amount, Balance, Chk [chk] 
        FROM ACC_tempMakeDepLoad 
        LEFT JOIN ACC_Location ON Code=Vendor_Id 
        WHERE Comp_Id=@Comp_Id AND TempDocNo=@TempDocNo AND PayType=@PayType 
        AND (ISNULL(@CostCenter,'') = '' OR CostCenter = @CostCenter)
        ORDER BY Cheque_Date
	END
	ELSE
	BEGIN
		SELECT Post_Date [DATE],Iid [Type],Doc_No [Number], Loca_Name [NAME], Amount [Amount], Balance, Chk [chk] 
        FROM ACC_tempMakeDepLoad 
        LEFT JOIN ACC_Location ON Code=Vendor_Id 
        WHERE Comp_Id=@Comp_Id AND TempDocNo=@TempDocNo AND PayType=@PayType 
        AND (ISNULL(@CostCenter,'') = '' OR CostCenter = @CostCenter)
        ORDER BY Post_Date
	END
END
GO

-- ────────────────────────────────────────────────────────────────────────────
-- 6. SAMPLE DATA FOR TESTING
-- ────────────────────────────────────────────────────────────────────────────

-- Ensure sample Cost Centers exist
IF NOT EXISTS (SELECT 1 FROM ACC_CostCenter WHERE CostCenterCode = 'CC001')
    INSERT INTO ACC_CostCenter (CostCenterCode, CostCenterName, Inactive) VALUES ('CC001', 'General Operations', 0);

IF NOT EXISTS (SELECT 1 FROM ACC_CostCenter WHERE CostCenterCode = 'CC002')
    INSERT INTO ACC_CostCenter (CostCenterCode, CostCenterName, Inactive) VALUES ('CC002', 'Sales Department', 0);

-- Ensure at least one Location exists for the join
IF NOT EXISTS (SELECT 1 FROM ACC_Location WHERE Code = '01')
    INSERT INTO ACC_Location (Code, Loca_Name, Comp_Code) VALUES ('01', 'Main Warehouse', 'C001');

IF NOT EXISTS (SELECT 1 FROM ACC_Location WHERE Code = '02')
    INSERT INTO ACC_Location (Code, Loca_Name, Comp_Code) VALUES ('02', 'Downtown Branch', 'C001');

-- Sample Undeposited Funds
IF NOT EXISTS (SELECT 1 FROM ACC_UnDepositedFund WHERE Doc_No = 'CR001')
    INSERT INTO ACC_UnDepositedFund (Iid, Doc_No, Post_Date, Amount, Balance, Pay_Type, Loca, Comp_Id, CostCenter)
    VALUES ('CASH', 'CR001', '2026-05-01', 1500.00, 1500.00, 'CASH', '01', 'C001', 'CC001');

IF NOT EXISTS (SELECT 1 FROM ACC_UnDepositedFund WHERE Doc_No = 'CR002')
    INSERT INTO ACC_UnDepositedFund (Iid, Doc_No, Post_Date, Amount, Balance, Pay_Type, Loca, Comp_Id, CostCenter, Cheque_No, Cheque_Date)
    VALUES ('CHQ', 'CR002', '2026-05-02', 5000.00, 5000.00, 'CHEQUE', '01', 'C001', 'CC001', 'CHQ-9988', '2026-05-15');

IF NOT EXISTS (SELECT 1 FROM ACC_UnDepositedFund WHERE Doc_No = 'CR003')
    INSERT INTO ACC_UnDepositedFund (Iid, Doc_No, Post_Date, Amount, Balance, Pay_Type, Loca, Comp_Id, CostCenter)
    VALUES ('CRED', 'CR003', '2026-05-03', 2750.50, 2750.50, 'CREDIT', '02', 'C001', 'CC002');

PRINT 'Collection Deposit Setup completed successfully with robust schema checks and sample data.'
GO
