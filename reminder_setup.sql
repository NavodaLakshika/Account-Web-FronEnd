IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ACC_AddReminders')
BEGIN
    CREATE TABLE ACC_AddReminders (
        Id_No INT IDENTITY(1,1) PRIMARY KEY,
        Date NVARCHAR(100),
        Time NVARCHAR(100),
        Task NVARCHAR(MAX),
        Expire CHAR(10) DEFAULT 'F',
        Type CHAR(10) DEFAULT 'INST'
    );
END
GO
