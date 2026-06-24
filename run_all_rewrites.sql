PRINT '============================================================';
PRINT 'Starting ALL stored procedure rewrites';
PRINT '============================================================';
GO

:r E:\Project\Accounts\Accounts Web\rewrite_phase1_accounting.sql
GO

:r E:\Project\Accounts\Accounts Web\rewrite_phase2_sales.sql
GO

:r E:\Project\Accounts\Accounts Web\rewrite_phase3_purchasing.sql
GO

:r E:\Project\Accounts\Accounts Web\rewrite_phase4_banking.sql
GO

:r E:\Project\Accounts\Accounts Web\rewrite_fixes.sql
GO

PRINT '============================================================';
PRINT 'All stored procedure rewrites completed!';
PRINT '============================================================';
GO
