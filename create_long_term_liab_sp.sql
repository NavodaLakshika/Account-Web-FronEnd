USE [Acc_Web]
GO

IF OBJECT_ID('dbo.ACC_sp_LongTermLiab', 'P') IS NOT NULL
    DROP PROCEDURE dbo.ACC_sp_LongTermLiab;
GO

CREATE PROCEDURE [dbo].[ACC_sp_LongTermLiab]
	@Err_x			INT OUTPUT,
	@LiabCode		NVARCHAR(20),
	@LiabName		NVARCHAR(100),
	@LiabAccCode		NVARCHAR(20),
	@Vendor		NVARCHAR(20),
	@Descript		NVARCHAR(200),
	@Amount		MONEY,
	@Term			float,
	@OrgDate		NVARCHAR(20),
	@PayType		NVARCHAR(30),
	@InterestRate		float,
	@NoOfIns		int,
	@MonthlyIns		MONEY,
	@DueDate		NVARCHAR(20),
	@CreateUser		NVARCHAR(50),
	@Company		NVARCHAR(20)
AS
BEGIN
	BEGIN TRAN
        -- Check if it's an update or insert
        IF EXISTS (SELECT 1 FROM ACC_LongTermLiab WHERE LiabCode = @LiabCode AND Company = @Company)
        BEGIN
            UPDATE ACC_LongTermLiab
            SET LiabName = @LiabName,
                LiabAccCode = @LiabAccCode,
                LenderCode = @Vendor,
                Description = @Descript,
                Amount = @Amount,
                Term = @Term,
                PayType = @PayType,
                OrgDate = @OrgDate,
                InterestRate = @InterestRate,
                NoOfInstallment = @NoOfIns,
                MonthlyIns = @MonthlyIns,
                DueDate = @DueDate
            WHERE LiabCode = @LiabCode AND Company = @Company;
            IF (@@ERROR <> 0) GOTO PROBLEM

            INSERT INTO ACC_Transaction_log ( Type , Transaction_Id , Transaction_Name , Doc_Number , Emp_Code , Transaction_Date , Insert_Date, Company )
			VALUES  (    'Update', '', 'Long Term Liability', @LiabCode, @CreateUser, GETDATE(), GETDATE(), @Company)
			IF (@@ERROR <> 0) GOTO PROBLEM
        END
        ELSE
        BEGIN
		    INSERT INTO ACC_LongTermLiab (LiabCode,LiabName,LiabAccCode,LenderCode,Description,Amount,Balance,Term,PayType,OrgDate,InterestRate,NoOfInstallment,MonthlyIns,DueDate,Company,CreateUser,CreateDate)
		    VALUES (@LiabCode,@LiabName,@LiabAccCode,@Vendor,@Descript,@Amount,@Amount,@Term,@PayType,@OrgDate,@InterestRate,@NoOfIns,@MonthlyIns,@DueDate,@Company,@CreateUser,GETDATE())
		    IF (@@ERROR <> 0) GOTO PROBLEM	
		
		    INSERT INTO ACC_Transaction_log ( Type , Transaction_Id , Transaction_Name , Doc_Number , Emp_Code , Transaction_Date , Insert_Date, Company )
			VALUES  (    'Create', '', 'Long Term Liability', @LiabCode, @CreateUser, GETDATE(), GETDATE(), @Company)
			IF (@@ERROR <> 0) GOTO PROBLEM
        END

	COMMIT TRAN
    RETURN 0;
	
PROBLEM:
	IF(@@ERROR<>0)
	BEGIN
		SET @Err_x=@@ERROR
   		ROLLBACK TRAN
		RETURN  @Err_x
	END
END
GO
