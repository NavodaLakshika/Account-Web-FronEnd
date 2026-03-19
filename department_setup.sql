-- department_setup.sql
-- Run this in SQL Server Management Studio (SSMS)

-- 1. Create Location Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Location]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Location] (
        [Code] [varchar](10) NOT NULL,
        [Loca_Name] [varchar](50) NOT NULL,
        [Comp_Code] [varchar](20) NOT NULL,
        CONSTRAINT [PK_ACC_Location] PRIMARY KEY CLUSTERED ([Code] ASC)
    );
END
GO

-- 2. Create Department Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Department]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Department] (
        [Code] [varchar](10) NOT NULL,
        [Loca_Id] [varchar](10) NOT NULL,
        [Company] [varchar](20) NOT NULL,
        [Dept_Name] [varchar](50) NOT NULL,
        [CreatUser] [varchar](50) NULL,
        [Insert_Date] [datetime] NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_ACC_Department] PRIMARY KEY CLUSTERED 
        (
            [Code] ASC,
            [Loca_Id] ASC,
            [Company] ASC
        )
    );
END
GO

-- 3. Seed some dummy locations if the table is empty
IF NOT EXISTS (SELECT TOP 1 1 FROM [dbo].[ACC_Location])
BEGIN
    INSERT INTO [dbo].[ACC_Location] (Code, Loca_Name, Comp_Code) VALUES 
    ('L001', 'Main Warehouse', 'C001'),
    ('L002', 'Head Office', 'C001');
END
GO
