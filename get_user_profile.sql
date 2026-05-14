IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'ACC_sp_GetUserProfile')
    DROP PROCEDURE ACC_sp_GetUserProfile;
GO

CREATE PROCEDURE ACC_sp_GetUserProfile
    @Emp_Code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        Emp_Code,
        Emp_Name,
        Pass_Word,
        Must_Change,
        Cant_Change,
        Acc_Desable,
        Exp_Date,
        Member_Id
    FROM ACC_Employee
    WHERE Emp_Code = @Emp_Code AND (Acc_Delete IS NULL OR Acc_Delete != '1');
END
GO
