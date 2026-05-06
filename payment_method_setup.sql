IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_PaymentMethod]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_PaymentMethod](
        [Code] [nvarchar](20) NOT NULL,
        [Id_No] [decimal](18, 0) IDENTITY(1,1) NOT NULL,
        [Name] [nvarchar](50) NULL,
        [User_Name] [nvarchar](50) NULL,
        [Create_Date] [datetime] NULL,
        [Company] [nvarchar](20) NOT NULL,
        CONSTRAINT [PK_ACC_PaymentMethod] PRIMARY KEY CLUSTERED 
        (
            [Code] ASC,
            [Company] ASC
        )
    )
END
GO
