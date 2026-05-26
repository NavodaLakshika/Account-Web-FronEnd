-- admin_config_setup.sql
-- Run this in SQL Server Management Studio (SSMS)

-- 1. Create Admin Config Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Admin_Config]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Admin_Config] (
        [Id_No] int IDENTITY(1,1) NOT NULL,
        [Entity_Type] nvarchar(20) NOT NULL,
        [Entity_Code] nvarchar(15) NOT NULL,
        [Config_Key] nvarchar(100) NOT NULL,
        [Config_Value] nvarchar(max) NULL,
        [Is_Active] bit NOT NULL DEFAULT 1,
        [Remarks] nvarchar(500) NULL,
        [Created_By] nvarchar(50) NULL,
        [Created_Date] datetime2 NULL DEFAULT (GETDATE()),
        [Modified_By] nvarchar(50) NULL,
        [Modified_Date] datetime2 NULL,
        CONSTRAINT [PK_ACC_Admin_Config] PRIMARY KEY CLUSTERED ([Id_No] ASC)
    );

    CREATE NONCLUSTERED INDEX [IX_ACC_Admin_Config_Entity] ON [dbo].[ACC_Admin_Config]
    (
        [Entity_Type] ASC,
        [Entity_Code] ASC
    );
END
GO

-- 2. Create Trigger to Prevent Deletion
IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TR_ACC_Admin_Config_PreventDelete]'))
BEGIN
    DROP TRIGGER [dbo].[TR_ACC_Admin_Config_PreventDelete];
END
GO

CREATE TRIGGER [dbo].[TR_ACC_Admin_Config_PreventDelete]
ON [dbo].[ACC_Admin_Config]
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
    RAISERROR('Deletion of admin configuration records is not allowed. Records can only be deactivated.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
END
GO

-- 3. Seed default config keys for Routes
IF NOT EXISTS (SELECT 1 FROM [dbo].[ACC_Admin_Config] WHERE [Entity_Type] = 'ROUTE' AND [Config_Key] = 'IsActive')
BEGIN
    INSERT INTO [dbo].[ACC_Admin_Config] ([Entity_Type], [Entity_Code], [Config_Key], [Config_Value], [Is_Active], [Remarks], [Created_By])
    SELECT 'ROUTE', r.[Code], 'IsActive', 'true', 1, 'Route active status', 'SYSTEM'
    FROM [dbo].[ACC_Route] r
    WHERE NOT EXISTS (SELECT 1 FROM [dbo].[ACC_Admin_Config] c WHERE c.[Entity_Type] = 'ROUTE' AND c.[Entity_Code] = r.[Code] AND c.[Config_Key] = 'IsActive');
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[ACC_Admin_Config] WHERE [Entity_Type] = 'ROUTE' AND [Config_Key] = 'AllowEdit')
BEGIN
    INSERT INTO [dbo].[ACC_Admin_Config] ([Entity_Type], [Entity_Code], [Config_Key], [Config_Value], [Is_Active], [Remarks], [Created_By])
    SELECT 'ROUTE', r.[Code], 'AllowEdit', 'true', 1, 'Allow route editing', 'SYSTEM'
    FROM [dbo].[ACC_Route] r
    WHERE NOT EXISTS (SELECT 1 FROM [dbo].[ACC_Admin_Config] c WHERE c.[Entity_Type] = 'ROUTE' AND c.[Entity_Code] = r.[Code] AND c.[Config_Key] = 'AllowEdit');
END
GO

-- 4. Seed default config keys for Areas
IF NOT EXISTS (SELECT 1 FROM [dbo].[ACC_Admin_Config] WHERE [Entity_Type] = 'AREA' AND [Config_Key] = 'IsActive')
BEGIN
    INSERT INTO [dbo].[ACC_Admin_Config] ([Entity_Type], [Entity_Code], [Config_Key], [Config_Value], [Is_Active], [Remarks], [Created_By])
    SELECT 'AREA', a.[Code], 'IsActive', 'true', 1, 'Area active status', 'SYSTEM'
    FROM [dbo].[ACC_Area] a
    WHERE NOT EXISTS (SELECT 1 FROM [dbo].[ACC_Admin_Config] c WHERE c.[Entity_Type] = 'AREA' AND c.[Entity_Code] = a.[Code] AND c.[Config_Key] = 'IsActive');
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[ACC_Admin_Config] WHERE [Entity_Type] = 'AREA' AND [Config_Key] = 'AllowEdit')
BEGIN
    INSERT INTO [dbo].[ACC_Admin_Config] ([Entity_Type], [Entity_Code], [Config_Key], [Config_Value], [Is_Active], [Remarks], [Created_By])
    SELECT 'AREA', a.[Code], 'AllowEdit', 'true', 1, 'Allow area editing', 'SYSTEM'
    FROM [dbo].[ACC_Area] a
    WHERE NOT EXISTS (SELECT 1 FROM [dbo].[ACC_Admin_Config] c WHERE c.[Entity_Type] = 'AREA' AND c.[Entity_Code] = a.[Code] AND c.[Config_Key] = 'AllowEdit');
END
GO

PRINT '--- Admin Config setup completed ---';
GO
