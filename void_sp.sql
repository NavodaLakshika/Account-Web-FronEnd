CREATE PROCEDURE [dbo].[ACC_sp_WriteChq_Void]
	@Err_x			INT OUTPUT,
	@Doc_No			NVARCHAR(20),	
	@Company		NVARCHAR(20),
	@Iid			NVARCHAR(10),
	@CreateUser		NVARCHAR(50),
	@Reason			NVARCHAR(MAX)
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		BEGIN TRAN
			
			-- 1. Check if it exists and is not already canceled
			IF NOT EXISTS (SELECT * FROM ACC_Transaction_Header WHERE Doc_No = @Doc_No AND Company_Id = @Company AND Iid = @Iid AND ISNULL(Cancel, 'F') <> 'T')
			BEGIN
				RAISERROR('Document not found or already voided.', 16, 1)
			END

			-- 2. Mark Header as Cancelled
			UPDATE ACC_Transaction_Header 
			SET Cancel = 'T', 
			    Void_Date = GETDATE(), 
			    Void_By = @CreateUser, 
			    Void_Reason = @Reason
			WHERE Doc_No = @Doc_No AND Company_Id = @Company AND Iid = @Iid

			-- 3. Reverse Account Transaction Details (GL)
			INSERT INTO ACC_Account_Transaction_Details(
				Doc_No, Post_Date, Vendor_Id, Company_Id, Iid, Acc_Code, Acc_Name, 
				Incom_Acc_Code, Amount, Discount, Credit, Pay_Type, Memo, Cust_Job, 
				Create_User, InsertDate, Sys_Memo, Depend_Acc_Code, Depend_Acc_Name, 
				Balance, Loca, Reconcile_Chk, OldAcc_Code, Reconcile_Date, Recon_DocNo
			)
			SELECT 
				Doc_No, GETDATE(), Vendor_Id, Company_Id, Iid, Acc_Code, Acc_Name, 
				Incom_Acc_Code, (ISNULL(Amount, 0) * -1), (ISNULL(Discount, 0) * -1), (ISNULL(Credit, 0) * -1), Pay_Type, Memo, Cust_Job, 
				@CreateUser, GETDATE(), 'VOID REVERSAL', Depend_Acc_Code, Depend_Acc_Name, 
				Balance, Loca, Reconcile_Chk, OldAcc_Code, Reconcile_Date, Recon_DocNo
			FROM ACC_Account_Transaction_Details
			WHERE Doc_No = @Doc_No AND Company_Id = @Company AND Iid = @Iid
			
			-- 4. Reverse Inventory
			UPDATE SM SET Qty = SM.Qty - TD.Qty 
			FROM ACC_Stock_Master SM 
			INNER JOIN ACC_Transaction_Details TD ON TD.Prod_Code = SM.Prod_Code 
			WHERE SM.Comp_Code = @Company AND TD.Doc_No = @Doc_No AND TD.Iid = @Iid
			
			-- 5. Reverse PettyCashAdd if exists
			INSERT INTO ACC_PettyCashAdd ( Doc_No ,Acc_Name,Amount ,Disc ,Comp_Id,Post_Date )
			SELECT Doc_No, Acc_Name, (Amount * -1), 'VOID REVERSAL', Comp_Id, GETDATE() 
			FROM ACC_PettyCashAdd
			WHERE Doc_No = @Doc_No AND Comp_Id = @Company AND Disc = 'from Write Chque'

			-- 6. Cancel Cheque Assignment
			DELETE FROM ACC_Assign_ChqNumber
			WHERE Doc_No = @Doc_No AND Company = @Company

			-- 7. Add Log
			INSERT INTO ACC_Transaction_log ( Type , Transaction_Id , Transaction_Name , Doc_Number , Emp_Code , Transaction_Date , Insert_Date , Company)
			VALUES  ( 'Cancel', @Iid, 'Write Chque Void', @Doc_No, @CreateUser, GETDATE(), GETDATE(), @Company )

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
