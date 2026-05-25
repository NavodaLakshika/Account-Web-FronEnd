USE [Acc_Web]
GO

-- ============================================================
-- SUPER ADMIN SETUP
-- Tables already exist via EF Core migrations:
--   ACC_Company      - Company master table
--   ACC_Employee_Company - Employee-Company mapping
--   ACC_Employee     - Employee master table
-- ============================================================

-- Ensure ACC_Employee_Company table exists (for EF Core)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ACC_Employee_Company' AND xtype='U')
BEGIN
    CREATE TABLE ACC_Employee_Company (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Emp_Code NVARCHAR(15) NOT NULL,
        Company_Code NVARCHAR(15) NOT NULL
    )
END
GO

-- Ensure all employees have company access
INSERT INTO ACC_Employee_Company (Emp_Code, Company_Code)
SELECT e.Emp_Code, c.Code
FROM ACC_Employee e
CROSS JOIN ACC_Company c
WHERE (e.Acc_Delete IS NULL OR e.Acc_Delete != '1')
AND NOT EXISTS (
    SELECT 1 FROM ACC_Employee_Company ec 
    WHERE ec.Emp_Code = e.Emp_Code AND ec.Company_Code = c.Code
)
GO

PRINT 'Super Admin setup completed successfully.';
GO
