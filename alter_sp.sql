ALTER PROCEDURE [dbo].[ACC_sp_WriteChq_Apply]
	@Err_x			INT OUTPUT,
	@Doc_No			NVARCHAR(20),	
	@Company		NVARCHAR(20),
	@Iid			NVARCHAR(10),
	@CreateUser		NVARCHAR(20),
	@Date			NVARCHAR(20),
	@NetAmount		MONEY,
	@Bank			NVARCHAR(20),	
	@Payee			NVARCHAR(40)='',
	@OnlinePay			NVARCHAR(4)='F', 
	@AppDoc			NVARCHAR(20) OUTPUT,
	@OrgDocNum		NVARCHAR(20) OUTPUT,
	@MachineDate	DATETIME
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		BEGIN TRAN
			DECLARE @orgDocNo NVARCHAR(20)
			DECLARE @Acc_Id NVARCHAR(20)
			DECLARE @Acc_Name NVARCHAR(10)
			DECLARE @VouchNo	NVARCHAR(20)
			
			SET @Acc_Id = (SELECT Acc_Id FROM ACC_TransactionSave_Header WHERE Doc_No = @Doc_No AND Company_Id = @Company )
			SET @Acc_Name =  UPPER((SELECT SUBSTRING(Sub_Acc_Name,1,2) FROM Acc_Sub_Accounts WHERE Sub_Code = @Acc_Id))
			IF @Acc_Name IS NULL
			BEGIN
				SET @Acc_Name = UPPER((SELECT TOP 1 SUBSTRING(Bank_Name,1,2) FROM ACC_Bank WHERE Bank_Code = @Acc_Id))
			END
			IF @Acc_Name IS NULL SET @Acc_Name = 'BK'
			
			IF EXISTS (SELECT Sub_Code FROM ACC_Sub_Accounts WHERE Acc_Type='Cash Drawer' AND Sub_Code=@Acc_Id)
			BEGIN
				SET @VouchNo = (SELECT VoucherNo_Cash FROM ACC_GetSystem_DoctNo WHERE Com_Code = @Company)
				SET @VouchNo = 'RLCB'+LTRIM(RTRIM(REPLICATE('0', (6-LEN(LTRIM(RTRIM(@VouchNo)))))))+LTRIM(RTRIM(@VouchNo))
				UPDATE ACC_GetSystem_DoctNo SET VoucherNo_Cash = VoucherNo_Cash + 1 WHERE Com_Code = @Company
			END
			ELSE
			BEGIN
				SET @VouchNo = (SELECT VoucherNo_Cheque FROM ACC_GetSystem_DoctNo WHERE Com_Code = @Company)
				SET @VouchNo = 'RLBA'+LTRIM(RTRIM(REPLICATE('0', (6-LEN(LTRIM(RTRIM(@VouchNo)))))))+LTRIM(RTRIM(@VouchNo))
				UPDATE ACC_GetSystem_DoctNo SET VoucherNo_Cheque = VoucherNo_Cheque + 1 WHERE Com_Code = @Company
			END

			DECLARE @AccPart NVARCHAR(10)
			SET @AccPart = CASE WHEN CHARINDEX('-', @Acc_Id) > 0 THEN SUBSTRING(@Acc_Id, CHARINDEX('-', @Acc_Id) + 1, 7) ELSE SUBSTRING(@Acc_Id, 5, 7) END
			IF @AccPart = '' SET @AccPart = '0'

			SET @orgDocNo = (SELECT Doc_No FROM ACC_GetSystem_PabNo WHERE Comp = @Company AND Acc_Code = @AccPart)
			IF @orgDocNo IS NULL SET @orgDocNo = 1 -- Fallback if not seeded
			
			SET	@orgDocNo =  @Acc_Name + 'C' + @AccPart + @Company + LTRIM(RTRIM(REPLICATE('0',(6-LEN(@orgDocNo))))) + LTRIM(RTRIM(@orgDocNo))		
			
			INSERT INTO	ACC_Transaction_Header( Doc_No ,Post_Date ,Inv_Date,Vendor_Id ,Company_Id ,Memo ,Iid ,Net_Amount, Sel_Amount, Reference ,Create_User,Acc_Type ,InsertDate,Chque_No, Voucher_No ,Payee,Terms)
			SELECT @orgDocNo,convert(nvarchar(10),getdate(),103),@Date,Vendor_Id,@Company,Memo,@Iid,@NetAmount, @NetAmount,Reference,@CreateUser,Acc_Id ,@MachineDate,Cheque_No, @VouchNo ,@Payee, CASE @OnlinePay WHEN 'T' THEN 'ONLINE PAYMENT' ELSE '' END FROM ACC_TransactionSave_Header WHERE Doc_No = @Doc_No AND Company_Id = @Company
			
			INSERT INTO ACC_CostCenterExpenses (Doc_No, Post_Date, Company_Id, Iid, Vendor_Id, Acc_Code, Acc_Name, CostCode, CostName, Amount, CreateUser)
			SELECT @orgDocNo, @Date, @Company, @Iid, Vend_Id, Acc_Code, Expence_Id, CostCode, CostName, Amount, @CreateUser FROM ACC_Temp_EnterBill_Expence WHERE Doc_No=@Doc_No AND Company=@Company AND Iid=@Iid
			
			IF EXISTS (SELECT * FROM ACC_Temp_EnterBill_Expence WHERE Doc_No = @Doc_No AND Company = @Company)
			BEGIN
				INSERT INTO	ACC_Account_Transaction_Details( Doc_No ,Post_Date,Vendor_Id ,Company_Id ,Iid ,Acc_Code ,Acc_Name ,Amount ,Memo ,Cust_Job ,Create_User,Sys_Memo )
				SELECT @orgDocNo,@Date,Vend_Id,@Company,@Iid,Acc_Code,Expence_Id,Amount,Memo,Cust_Job,@CreateUser ,Memo FROM dbo.ACC_Temp_EnterBill_Expence WHERE Doc_No = @Doc_No AND Company = @Company
			END	

			IF EXISTS (SELECT * FROM ACC_Temp_EnterBill_ItemPurch WHERE Doc_No = @Doc_No AND Company = @Company)
			BEGIN
				INSERT INTO  ACC_Transaction_Details( Doc_No ,Vendor_Id ,Company_Id ,Iid ,Prod_Code ,Prod_Name ,Qty ,Amount ,Cust_Job ,Create_User,Post_Date )
				SELECT @orgDocNo,Vend_Id,@Company,@Iid,Item_Id,Discription,Qty,Cost,Cust_Job,@CreateUser,@Date FROM dbo.ACC_Temp_EnterBill_ItemPurch WHERE Doc_No = @Doc_No AND Company = @Company
			END

			UPDATE SM SET Qty = SM.Qty + TD.Qty 
			FROM ACC_Stock_Master SM 
			INNER JOIN ACC_Transaction_Details TD ON TD.Prod_Code = SM.Prod_Code 
			WHERE SM.Comp_Code = @Company AND TD.Doc_No = @orgDocNo AND TD.Iid = 'WCH'

			INSERT INTO ACC_Account_Transaction_Details( Doc_No ,Post_Date ,Vendor_Id ,Company_Id ,Iid, Prod_Code, Acc_Code ,Incom_Acc_Code ,Amount,Create_User)
			SELECT @orgDocNo,@Date,Vendor_Id,Company_Id,Iid,Prod_Code, ACC_Product.Expense_Acc,ACC_Product.Income_Acc,Amount, ACC_Transaction_Details.Create_User 
			FROM ACC_Transaction_Details INNER JOIN ACC_Product ON ACC_Transaction_Details.Prod_Code = ACC_Product.Code 
			WHERE ACC_Transaction_Details.Doc_No = @orgDocNo AND ACC_Transaction_Details.Company_Id = @Company AND ACC_Transaction_Details.Iid='WCH'

			INSERT INTO ACC_Account_Transaction_Details( Doc_No ,Post_Date ,Vendor_Id ,Company_Id ,Iid ,Acc_Code , Credit, Create_User )
			SELECT @orgDocNo, @Date, Vendor_Id, @Company,Iid, Acc_Type,Net_Amount,@CreateUser  FROM ACC_Transaction_Header WHERE Doc_No = @orgDocNo AND Company_Id = @Company AND Iid = 'WCH' 

			IF EXISTS (SELECT * FROM ACC_Account_Transaction_Details WHERE Iid = 'WCH' AND Acc_Code = '400-101' AND Company_Id = @Company AND Doc_No = @orgDocNo)
			BEGIN
				INSERT INTO ACC_PettyCashAdd ( Doc_No ,Acc_Name,Amount ,Disc ,Comp_Id,Post_Date )
				SELECT ACC_Transaction_Header.Doc_No, Acc_Sub_Accounts.Sub_Acc_Name,ACC_Account_Transaction_Details.Amount,'from Write Chque',@Company,ACC_Transaction_Header.Post_Date 
				FROM ACC_Transaction_Header 
				INNER JOIN Acc_Sub_Accounts ON Acc_Sub_Accounts.Sub_Code = ACC_Transaction_Header.Acc_Type 
				INNER JOIN ACC_Account_Transaction_Details ON ACC_Transaction_Header.Doc_No = ACC_Account_Transaction_Details.Doc_No AND ACC_Transaction_Header.Company_Id = ACC_Account_Transaction_Details.Company_Id 
				WHERE  ACC_Account_Transaction_Details.Iid = 'WCH' AND ACC_Account_Transaction_Details.Acc_Code = '400-101' AND ACC_Account_Transaction_Details.Doc_No = @orgDocNo AND ACC_Account_Transaction_Details.Company_Id = @Company
			END

			-- Add to Cheque Printing Utility
			INSERT INTO ACC_Assign_ChqNumber (Chq_No, Chq_Date, Payee, Amount, Acc_Id, Chq_Print, Company, Doc_No)
			SELECT Cheque_No, Inv_Date, Payee, Net_Amount, Acc_Id, 'F', @Company, @orgDocNo 
			FROM ACC_TransactionSave_Header 
			WHERE Doc_No = @Doc_No AND Company_Id = @Company AND Iid = 'WCH'

			DELETE ACC_TransactionSave_Header WHERE Doc_No = @Doc_No AND Company_Id = @Company AND Iid = 'WCH'
			DELETE ACC_Temp_EnterBill_Expence WHERE Doc_No = @Doc_No AND Company = @Company AND Iid = 'WCH'
			DELETE ACC_Temp_EnterBill_ItemPurch WHERE Doc_No = @Doc_No AND Company = @Company AND Iid = 'WCH'
			
			IF NOT EXISTS (SELECT 1 FROM ACC_GetSystem_PabNo WHERE Acc_Code = @AccPart AND Comp = @Company)
			BEGIN
				INSERT INTO ACC_GetSystem_PabNo (Comp, Acc_Code, Doc_No) VALUES (@Company, @AccPart, 2)
			END
			ELSE
			BEGIN
				UPDATE ACC_GetSystem_PabNo SET Doc_No = Doc_No + 1 WHERE Acc_Code = @AccPart AND Comp = @Company
			END
			
			INSERT INTO ACC_Transaction_log ( Type , Transaction_Id , Transaction_Name , Doc_Number , Emp_Code , Transaction_Date , Insert_Date , Company)
			VALUES  ( 'Create', 'WCH', 'Write Chque', @orgDocNo, @CreateUser, GETDATE(), GETDATE(), @Company )
			
			SET @AppDoc = @orgDocNo
			SET @OrgDocNum = @orgDocNo
		COMMIT TRAN
		SET @Err_x = 0
	END TRY
	BEGIN CATCH
		IF @@TRANCOUNT > 0 ROLLBACK TRAN
		SET @Err_x = ERROR_NUMBER()
		DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
		RAISERROR(@ErrorMessage, 16, 1)
	END CATCH
END
