IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'ACC_sp_DeleteUserProfile')
    DROP PROCEDURE ACC_sp_DeleteUserProfile;
GO

CREATE PROCEDURE ACC_sp_DeleteUserProfile
    @Emp_Code NVARCHAR(50),
    @CurrentUser NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE ACC_Employee
    SET Acc_Delete = '1',
        LastModUser = @CurrentUser,
        LastModDate = CONVERT(NVARCHAR(50), GETDATE(), 103)
    WHERE Emp_Code = @Emp_Code;

    SELECT 'Deleted' as [Status], @Emp_Code as [Emp_Code];
END
GO
