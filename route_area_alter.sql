-- route_area_alter.sql
-- ALTER script to update existing ACC_Route and ACC_Area tables
-- to match the current C# entity models.
-- Run this ONLY if your tables were created from the old route_area_setup.sql.

-- ========================================
-- ACC_Route changes
-- ========================================

-- Add Id_No (identity) - requires table rebuild if table has data.
-- If the table is empty, drop and recreate using route_area_setup.sql instead.
IF COL_LENGTH('dbo.ACC_Route', 'Id_No') IS NULL
BEGIN
    PRINT 'WARNING: Id_No cannot be added as IDENTITY to an existing table with data.';
    PRINT 'Option 1: If table is empty, run route_area_setup.sql to recreate.';
    PRINT 'Option 2: Manually add Id_No via SSMS table designer.';
    PRINT 'Option 3: Add as nullable column (not identity):';
    EXEC('ALTER TABLE [dbo].[ACC_Route] ADD [Id_No] decimal(18,2) NULL');
END
GO

-- Add Area_Code
IF COL_LENGTH('dbo.ACC_Route', 'Area_Code') IS NULL
BEGIN
    ALTER TABLE [dbo].[ACC_Route] ADD [Area_Code] nvarchar(15) NOT NULL DEFAULT ('');
END
GO

-- Add Create_User
IF COL_LENGTH('dbo.ACC_Route', 'Create_User') IS NULL
BEGIN
    ALTER TABLE [dbo].[ACC_Route] ADD [Create_User] nvarchar(50) NULL;
END
GO

-- Add Create_Date
IF COL_LENGTH('dbo.ACC_Route', 'Create_Date') IS NULL
BEGIN
    ALTER TABLE [dbo].[ACC_Route] ADD [Create_Date] datetime2 NULL;
END
GO

-- ========================================
-- ACC_Area changes
-- ========================================

-- Add Id_No (identity) - same warning as above
IF COL_LENGTH('dbo.ACC_Area', 'Id_No') IS NULL
BEGIN
    PRINT 'WARNING: Id_No cannot be added as IDENTITY to existing ACC_Area table with data.';
    EXEC('ALTER TABLE [dbo].[ACC_Area] ADD [Id_No] decimal(18,2) NULL');
END
GO

-- Add User_Name
IF COL_LENGTH('dbo.ACC_Area', 'User_Name') IS NULL
BEGIN
    ALTER TABLE [dbo].[ACC_Area] ADD [User_Name] nvarchar(50) NULL;
END
GO

-- Add Create_Date
IF COL_LENGTH('dbo.ACC_Area', 'Create_Date') IS NULL
BEGIN
    ALTER TABLE [dbo].[ACC_Area] ADD [Create_Date] datetime2 NULL;
END
GO

PRINT '--- ALTER script completed ---';
PRINT 'If errors occurred above, the columns may already exist.';
GO
