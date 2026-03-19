-- category_setup.sql
-- Run this in SQL Server Management Studio (SSMS)

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Category]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Category] (
        [Code] [varchar](10) NOT NULL,
        [Dept_Code] [varchar](10) NOT NULL,
        [Loca_Id] [varchar](10) NOT NULL,
        [Company] [varchar](20) NOT NULL,
        [Cat_Name] [varchar](50) NOT NULL,
        [CreatUser] [varchar](50) NULL,
        [LastModUser] [varchar](50) NULL,
        [Insert_Date] [datetime] NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_ACC_Category] PRIMARY KEY CLUSTERED 
        (
            [Code] ASC,
            [Dept_Code] ASC,
            [Loca_Id] ASC,
            [Company] ASC
        ),
        CONSTRAINT [FK_ACC_Category_Department] FOREIGN KEY ([Dept_Code], [Loca_Id], [Company]) 
        REFERENCES [dbo].[ACC_Department] ([Code], [Loca_Id], [Company])
    );
END
GO
