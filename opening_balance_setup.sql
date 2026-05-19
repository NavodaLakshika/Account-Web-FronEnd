-- =======================================================
-- Setup script for Opening Balance
-- =======================================================

-- 1. Create ACC_OpeningBalance table if not exists
IF OBJECT_ID('ACC_OpeningBalance') IS NULL
BEGIN
    CREATE TABLE [dbo].[ACC_OpeningBalance](
        [Id_No] [numeric](18, 0) IDENTITY(1,1) NOT NULL,
        [Doc_No] [nvarchar](30) NOT NULL,
        [Opb_Date] [nvarchar](30) NULL,
        [Acc_Id] [nvarchar](50) NULL,
        [Acc_Name] [nvarchar](50) NULL,
        [Vend_Id] [nvarchar](20) NULL,
        [Vend_Name] [nvarchar](50) NULL,
        [Cust_Id] [nvarchar](20) NULL,
        [Cust_Name] [nvarchar](50) NULL,
        [Address] [nvarchar](100) NULL,
        [Memo] [nvarchar](300) NULL,
        [OpBalance] [money] NULL,
        [BalanceOf] [nvarchar](30) NULL,
        [Create_User] [nvarchar](50) NULL,
        [Create_Date] [datetime] NULL,
        [Insert_Date] [datetime] NULL,
        [Company] [nvarchar](20) NULL,
        [Iid] [nvarchar](5) NULL,
        [opId] [nvarchar](10) NULL,
        [Post] [char](2) NULL
    ) ON [PRIMARY]
END
GO

-- 2. Drop existing stored procedure if it exists and recreate
IF OBJECT_ID('ACC_sp_OpeningBal_Update') IS NOT NULL
BEGIN
    DROP PROCEDURE [dbo].[ACC_sp_OpeningBal_Update]
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ACC_sp_OpeningBal_Update]
	@Err_x			INT OUTPUT,
	@Doc_No			NVARCHAR(50),
	@Date			NVARCHAR(30),
	@Acc_Code		NVARCHAR(30),
	@Acc_Name		NVARCHAR(50),
	@Vend_Id		NVARCHAR(20),
	@Vender			NVARCHAR(50),
	@Cust_Id		NVARCHAR(20),
	@Cust_Name		NVARCHAR(50),
	@Address		NVARCHAR(100),
	@Memo			NVARCHAR(100),
	@OPBal			MONEY,
	@BalDate		NVARCHAR(30),
	@User			NVARCHAR(50),
	@Company		NVARCHAR(10),
	@Type			NVARCHAR(10),
	@OD				NVARCHAR(20),
	@AppDocNo		NVARCHAR(20) OUTPUT,
	@MachineDate	DATETIME,
	@DebitBal		NVARCHAR(10)='',
	@Credit			NVARCHAR(5)='',
	@Debit			NVARCHAR(5)=''
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRAN;
	
	SET @Err_x = 0;
	DECLARE @OrgDocno NVARCHAR(20);
	SET @OrgDocno = (SELECT Opb FROM ACC_GetSystem_DoctNo WHERE Com_Code = @Company);
	SET @OrgDocno = 'OPB' + @Company + LTRIM(RTRIM(REPLICATE('0', (6 - LEN(@OrgDocno))))) + LTRIM(RTRIM(@OrgDocno));
	
	IF @Type = 'VEND'
	BEGIN
		INSERT INTO ACC_OpeningBalance ( Doc_No, Opb_Date, Acc_Id, Acc_Name, Vend_Id, Vend_Name, Address, opId, Iid, Memo, OpBalance, BalanceOf, Create_User, Company, Create_Date, Insert_Date )
		VALUES ( @OrgDocno, @Date, @Acc_Code, @Acc_Name, @Vend_Id, @Vender, @Address, 'OPV', 'OPB', @Memo, @OPBal, @BalDate, @User, @Company, @MachineDate, @MachineDate );
		IF (@@ERROR <> 0) GOTO Problem;
		
		IF @DebitBal = 'FALSE'
		BEGIN
			INSERT INTO ACC_Account_Transaction_Details( Doc_No, Post_Date, Vendor_Id, Company_Id, Iid, Acc_Code, Acc_Name, Credit, Create_User, InsertDate, Sys_Memo )
			VALUES ( @OrgDocno, @Date, @Vend_Id, @Company, 'OPB', @Acc_Code, @Acc_Name, @OPBal, @User, @MachineDate, @Vender + ' Opening Balance' );
			IF (@@ERROR <> 0) GOTO Problem;
			
			INSERT INTO ACC_Paybll_Sumary ( Pab_Doc, Doc_No, Date_Due, Vend_Id, Vend_Name, Ref_No, Amount_Due, Discount, Set_Use, To_Pay, Balance, Iid, Company, Create_User, Create_Date )
			VALUES ( '', @OrgDocno, @Date, @Vend_Id, @Vender, 'Op Bal', @OPBal, 0, 0, 0, @OPBal, 'OPB', @Company, @User, @MachineDate );
			IF (@@ERROR <> 0) GOTO Problem;
		END
		ELSE
		BEGIN
			INSERT INTO ACC_Account_Transaction_Details( Doc_No, Post_Date, Vendor_Id, Company_Id, Iid, Acc_Code, Acc_Name, Amount, Create_User, InsertDate, Sys_Memo )
			VALUES ( @OrgDocno, @Date, @Vend_Id, @Company, 'OPB', @Acc_Code, @Acc_Name, @OPBal, @User, @MachineDate, @Vender + ' Opening Balance' );
			IF (@@ERROR <> 0) GOTO Problem;
			
			INSERT INTO ACC_AdvancePay( Acc_Code, VendId, Vender, Address, Memo, Amount, Balance, Chq_No, Doc_No, Post_Date, Vouch_No, Ref_No, Chq_Date, Company, Create_User, Create_Date, Iid )
			VALUES ( '820-101', @Vend_Id, '', '', ' ', @OPBal, @OPBal, '', @OrgDocno, @BalDate, '', 'OPV', '', @Company, @User, @MachineDate, 'ADP' );
			IF (@@ERROR <> 0) GOTO Problem;
		END
		
		SET @AppDocNo = @OrgDocno;
	END
	
	IF @Type = 'CUST'
	BEGIN
		INSERT INTO ACC_OpeningBalance ( Doc_No, Opb_Date, Acc_Id, Acc_Name, Cust_Id, Cust_Name, Address, opId, Iid, Memo, OpBalance, BalanceOf, Create_User, Company, Create_Date, Insert_Date )
		VALUES ( @OrgDocno, @Date, @Acc_Code, @Acc_Name, @Cust_Id, @Cust_Name, @Address, 'OPC', 'OPB', @Memo, @OPBal, @BalDate, @User, @Company, @MachineDate, @MachineDate );
		IF (@@ERROR <> 0) GOTO Problem;
		
		INSERT INTO ACC_Account_Transaction_Details( Doc_No, Post_Date, Vendor_Id, Company_Id, Iid, Acc_Code, Acc_Name, Amount, Create_User, InsertDate, Sys_Memo )
		VALUES ( @OrgDocno, @Date, @Cust_Id, @Company, 'OPB', @Acc_Code, @Acc_Name, @OPBal, @User, @MachineDate, @Cust_Name + ' Opening Balance' );
		IF (@@ERROR <> 0) GOTO Problem;
		
		IF NOT EXISTS (SELECT * FROM ACC_Payment_Summary WHERE Doc_No = @OrgDocno AND Company = @Company)
		BEGIN
			IF @OPBal < 0
			BEGIN
				INSERT INTO ACC_AdvanceReceipt ( Doc_No, Cust_Id, Cust_Name, Address, Memo, Amount, Balance, Bank, Chq_No, Post_Date, Ref_No, Acc_Id, Pay_Type, Branch, Chq_Date, Iid, Create_User, Company )
				VALUES ( @OrgDocno, @Cust_Id, @Cust_Name, @Address, @Memo, (0 - @OPBal), (0 - @OPBal), '', '', @BalDate, 'Op Bal', '840-101', '', '', '', 'ADR', @User, @Company );
				IF (@@ERROR <> 0) GOTO Problem;
			END
			ELSE
			BEGIN
				INSERT INTO ACC_Payment_Summary( Doc_No, Date_Due, Iid, Vend_Id, Ref_No, Inv_Amount, Balance, Company, Create_User )
				VALUES ( @OrgDocno, @BalDate, 'OPB', @Cust_Id, 'Op Bal', @OPBal, @OPBal, @Company, @User );
				IF (@@ERROR <> 0) GOTO Problem;
			END
		END
		
		SET @AppDocNo = @OrgDocno;
	END
	
	IF @Type = 'ACC'
	BEGIN
		IF NOT EXISTS (SELECT * FROM ACC_OpeningBalance WHERE Acc_Id = @Acc_Code AND Company = @Company)
		BEGIN
			INSERT INTO ACC_OpeningBalance( Doc_No, Acc_Id, Opb_Date, Acc_Name, Vend_Id, Vend_Name, Cust_Id, Cust_Name, Address, opId, Iid, Memo, OpBalance, BalanceOf, Create_User, Company, Create_Date, Insert_Date )
			VALUES ( @OrgDocno, @Acc_Code, @Date, @Acc_Name, @Vend_Id, @Vender, @Cust_Id, @Cust_Name, @Address, 'OPA', 'OPB', @Memo, @OPBal, @BalDate, @User, @Company, @MachineDate, @MachineDate );
			IF (@@ERROR <> 0) GOTO Problem;
			
			IF SUBSTRING(@Acc_Code, 1, 3) IN ('100','200','300','400','500','600','700','800','810','820','830','840','850','860','870','880')
			BEGIN
				IF @Credit = 'CR'
				BEGIN
					INSERT INTO ACC_Account_Transaction_Details( Doc_No, Post_Date, Vendor_Id, Company_Id, Iid, Acc_Code, Acc_Name, Credit, Create_User, InsertDate, Sys_Memo )
					VALUES ( @OrgDocno, @Date, @Cust_Id, @Company, 'OPB', @Acc_Code, @Acc_Name, @OPBal, @User, @MachineDate, @Acc_Name + ' Opening Balance ' );
					IF (@@ERROR <> 0) GOTO Problem;
				END
				
				IF @Debit = 'DR'
				BEGIN
					INSERT INTO ACC_Account_Transaction_Details( Doc_No, Post_Date, Vendor_Id, Company_Id, Iid, Acc_Code, Acc_Name, Amount, Create_User, InsertDate, Sys_Memo )
					VALUES ( @OrgDocno, @Date, @Cust_Id, @Company, 'OPB', @Acc_Code, @Acc_Name, @OPBal, @User, @MachineDate, @Acc_Name + ' Opening Balance ' );
					IF (@@ERROR <> 0) GOTO Problem;
				END
			END
			
			SET @AppDocNo = @OrgDocno;
		END
		ELSE
		BEGIN
			UPDATE ACC_OpeningBalance 
			SET Doc_No = @OrgDocno, Acc_Id = @Acc_Code, Opb_Date = @Date, Acc_Name = @Acc_Name, Vend_Id = @Vend_Id, Vend_Name = @Vender, Cust_Id = @Cust_Id, Cust_Name = @Cust_Name, Address = @Address, Memo = @Memo, OpBalance = @OPBal, BalanceOf = @BalDate 
			WHERE Iid = 'OPB' AND opId = 'OPA' AND Acc_Id = @Acc_Code AND Company = @Company;
			IF (@@ERROR <> 0) GOTO Problem;
			
			IF SUBSTRING(@Acc_Code, 1, 3) IN ('100','200','300','400','500','600','700','800','810','820','830','840','850','860','870','880')
			BEGIN
				IF @Credit = 'CR'
				BEGIN
					UPDATE ACC_Account_Transaction_Details 
					SET Post_Date = @Date, Vendor_Id = @Cust_Id, Acc_Code = @Acc_Code, Acc_Name = @Acc_Name, Credit = @OPBal 
					WHERE Iid = 'OPB' AND Acc_Code = @Acc_Code AND Company_Id = @Company;
					IF (@@ERROR <> 0) GOTO Problem;
				END
				
				IF @Debit = 'DR'
				BEGIN
					UPDATE ACC_Account_Transaction_Details 
					SET Post_Date = @Date, Vendor_Id = @Cust_Id, Acc_Code = @Acc_Code, Acc_Name = @Acc_Name, Amount = @OPBal 
					WHERE Iid = 'OPB' AND Acc_Code = @Acc_Code AND Company_Id = @Company;
					IF (@@ERROR <> 0) GOTO Problem;
				END
			END
			
			SET @AppDocNo = @OrgDocno;
		END
	END
	
	UPDATE ACC_GetSystem_DoctNo SET Opb = Opb + 1 WHERE Com_Code = @Company;
	IF (@@ERROR <> 0) GOTO Problem;
	
	INSERT INTO ACC_Transaction_log ( Type, Transaction_Id, Transaction_Name, Doc_Number, Emp_Code, Transaction_Date, Insert_Date, Company )
	VALUES ( 'Transaction', 'OPB', 'Opening Balance', @OrgDocno, @User, GETDATE(), GETDATE(), @Company );
	IF (@@ERROR <> 0) GOTO Problem;
	
	COMMIT TRAN;
	RETURN 0;

Problem:
	ROLLBACK TRAN;
	SET @Err_x = 1;
	RETURN 1;
END
GO
