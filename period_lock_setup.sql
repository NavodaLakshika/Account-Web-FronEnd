IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Period_Lock_Cost_center_Wise]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[ACC_Period_Lock_Cost_center_Wise](
	[Cost_Code] [varchar](50) NOT NULL,
	[From_Date] [date] NULL,
	[To_Date] [date] NULL,
	[Is_Check] [bit] NULL DEFAULT 0,
 CONSTRAINT [PK_ACC_Period_Lock_Cost_center_Wise] PRIMARY KEY CLUSTERED ([Cost_Code] ASC)
) ON [PRIMARY]
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Period_Lock_Cost_center_Wise]') AND name = 'From_Date')
        ALTER TABLE [dbo].[ACC_Period_Lock_Cost_center_Wise] ADD [From_Date] [date] NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Period_Lock_Cost_center_Wise]') AND name = 'To_Date')
        ALTER TABLE [dbo].[ACC_Period_Lock_Cost_center_Wise] ADD [To_Date] [date] NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Period_Lock_Cost_center_Wise]') AND name = 'Is_Check')
        ALTER TABLE [dbo].[ACC_Period_Lock_Cost_center_Wise] ADD [Is_Check] [bit] NULL DEFAULT 0;
END
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_sp_update_period_lock_facility]') AND type in (N'P'))
DROP PROCEDURE [dbo].[ACC_sp_update_period_lock_facility]
GO

CREATE Procedure [dbo].[ACC_sp_update_period_lock_facility]
	@costCenter varchar(50),
	@dateFrom  varchar(50),
	@dateTo  varchar(50),
	@isCheck bit,
	@Err_x			INT OUTPUT
AS 
SET NOCOUNT ON
BEGIN TRAN 
SET @Err_x = 0
BEGIN
	-- Try to convert dates safely
	DECLARE @dFrom date, @dTo date;
	
	-- SQL Server 2012+ can use TRY_CAST or just CAST for YYYY-MM-DD
	SET @dFrom = TRY_CAST(@dateFrom AS date);
	SET @dTo = TRY_CAST(@dateTo AS date);

	-- If TRY_CAST fails (returned NULL), try with format 103 (dd/mm/yyyy) as fallback
	IF @dFrom IS NULL AND @dateFrom IS NOT NULL SET @dFrom = TRY_CONVERT(date, @dateFrom, 103);
	IF @dTo IS NULL AND @dateTo IS NOT NULL SET @dTo = TRY_CONVERT(date, @dateTo, 103);

	if EXISTS(SELECT * FROM ACC_Period_Lock_Cost_center_Wise WHERE Cost_Code=@costCenter)
	BEGIN 
		UPDATE ACC_Period_Lock_Cost_center_Wise 
		set From_Date=@dFrom, 
		    To_Date=@dTo,
			Is_Check=@isCheck 
		where Cost_Code=@costCenter
	END
	ELSE
	BEGIN
		INSERT INTO ACC_Period_Lock_Cost_center_Wise(Cost_Code,From_Date,To_Date,Is_Check)
		VALUES(@costCenter,@dFrom,@dTo,@isCheck)
	END
END

IF (@@ERROR <> 0) GOTO PROBLEM
COMMIT TRAN
RETURN @Err_x

PROBLEM:
IF(@@ERROR<>0)
BEGIN
	SET @Err_x=@@ERROR
   	ROLLBACK TRAN
	RETURN  @Err_x
END
RETURN  @Err_x
GO
