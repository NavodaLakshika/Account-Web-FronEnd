-- route_area_setup.sql
-- Run this in SQL Server Management Studio (SSMS) for NEW databases only
-- For existing databases, use route_area_alter.sql

-- 1. Create Route Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Route]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Route] (
        [Code] nvarchar(15) NOT NULL,
        [Id_No] decimal(18,2) IDENTITY(1,1) NOT NULL,
        [Area_Code] nvarchar(15) NOT NULL DEFAULT (''),
        [Route_Name] nvarchar(50) NULL,
        [Create_User] nvarchar(50) NULL,
        [Create_Date] datetime2 NULL,
        [Insert_Date] datetime2 NULL DEFAULT (GETDATE()),
        [Company] nvarchar(20) NULL,
        [CreatUser] nvarchar(50) NULL,
        [LastModUser] nvarchar(50) NULL,
        CONSTRAINT [PK_ACC_Route] PRIMARY KEY CLUSTERED ([Code] ASC)
    );
END
GO

-- 2. Create Area Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Area]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Area] (
        [Id_No] decimal(18,2) IDENTITY(1,1) NOT NULL,
        [Code] nvarchar(15) NULL,
        [Area_Name] nvarchar(50) NULL,
        [User_Name] nvarchar(50) NULL,
        [Route_Code] nvarchar(10) NULL,
        [Company] nvarchar(20) NULL,
        [CreatUser] nvarchar(50) NULL,
        [LastModUser] nvarchar(50) NULL,
        [Create_Date] datetime2 NULL,
        [Insert_Date] datetime2 NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_ACC_Area] PRIMARY KEY CLUSTERED ([Id_No] ASC)
    );
END
GO
