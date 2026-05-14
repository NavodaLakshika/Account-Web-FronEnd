IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'ACC_sp_SaveUserProfile')
    DROP PROCEDURE ACC_sp_SaveUserProfile;
GO

CREATE PROCEDURE ACC_sp_SaveUserProfile
    @Emp_Code NVARCHAR(50),
    @Emp_Name NVARCHAR(200),
    @Pass_Word NVARCHAR(200),
    @Must_Change CHAR(1),
    @Cant_Change CHAR(1),
    @Acc_Desable CHAR(1),
    @Exp_Date NVARCHAR(50),
    @Member_Id NVARCHAR(50),
    @CurrentUser NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM ACC_Employee WHERE Emp_Code = @Emp_Code)
    BEGIN
        -- UPDATE
        UPDATE ACC_Employee
        SET Emp_Name = @Emp_Name,
            Pass_Word = @Pass_Word,
            Conpass_Word = @Pass_Word,
            Must_Change = @Must_Change,
            Cant_Change = @Cant_Change,
            Acc_Desable = @Acc_Desable,
            Exp_Date = @Exp_Date,
            Member_Id = @Member_Id,
            LastModUser = @CurrentUser,
            LastModDate = CONVERT(NVARCHAR(50), GETDATE(), 103),
            Acc_Delete = '0' -- In case it was deleted
        WHERE Emp_Code = @Emp_Code;
        
        SELECT 'Updated' as [Status], @Emp_Code as [Emp_Code];
    END
    ELSE
    BEGIN
        -- INSERT
        INSERT INTO ACC_Employee (
            Emp_Code, Emp_Name, Pass_Word, Conpass_Word, 
            Must_Change, Cant_Change, Acc_Desable, 
            Exp_Date, Member_Id, Create_User, Create_Date, 
            Acc_Delete, Insert_Date
        )
        VALUES (
            @Emp_Code, @Emp_Name, @Pass_Word, @Pass_Word,
            @Must_Change, @Cant_Change, @Acc_Desable,
            @Exp_Date, @Member_Id, @CurrentUser, CONVERT(NVARCHAR(50), GETDATE(), 103),
            '0', GETDATE()
        );

        SELECT 'Inserted' as [Status], @Emp_Code as [Emp_Code];
    END
END
GO
