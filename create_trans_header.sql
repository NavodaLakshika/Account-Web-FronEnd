IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ACC_Transaction_Header')
BEGIN
    CREATE TABLE ACC_Transaction_Header (
        Doc_No NVARCHAR(50),
        Iid NVARCHAR(50),
        Company_Id NVARCHAR(50),
        Account NVARCHAR(50),
        Net_Amount DECIMAL(18,2),
        Post_Date DATE,
        Create_Date DATETIME
    )
END
