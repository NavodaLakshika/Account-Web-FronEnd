USE [Acc_Web]
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Acc_System_Locks' AND xtype='U')
BEGIN
    CREATE TABLE Acc_System_Locks (
        ModuleId NVARCHAR(100) PRIMARY KEY,
        IsLocked BIT NOT NULL DEFAULT 0,
        UpdatedAt DATETIME DEFAULT GETDATE()
    )
END
GO

-- Insert default records if they don't exist
INSERT INTO Acc_System_Locks (ModuleId, IsLocked)
SELECT id, 0 FROM (
    VALUES 
    -- Master Files
    ('isLocked_master_company'), ('isLocked_master_costCenter'), ('isLocked_master_department'), ('isLocked_master_category'),
    ('isLocked_master_supplier'), ('isLocked_master_customer'), ('isLocked_master_cardSale'), ('isLocked_master_chartOfAccount'),
    ('isLocked_master_userProfile'), ('isLocked_master_vendorTypes'), ('isLocked_master_changePassword'), ('isLocked_master_logoff'),
    -- Admin Modules
    ('isLocked_backup'), ('isLocked_stockUpdate'), ('isLocked_inventoryDownload'), ('isLocked_deleteAccount'),
    ('isLocked_search'), ('isLocked_journalEditor'), ('isLocked_transactionEditor'), ('isLocked_update'),
    ('isLocked_clear'), ('isLocked_lock'), ('isLocked_systemSettings'), ('isLocked_changePassword'),
    -- Transaction Modules
    ('isLocked_trans_po'), ('isLocked_trans_grn'), ('isLocked_trans_pettyCash'), ('isLocked_trans_enterBills'),
    ('isLocked_trans_payBills'), ('isLocked_trans_estimate'), ('isLocked_trans_salesOrder'), ('isLocked_trans_invoice'),
    ('isLocked_trans_receivePayment'), ('isLocked_trans_salesReceipt'), ('isLocked_trans_refunds'), ('isLocked_trans_items'),
    ('isLocked_trans_journal'), ('isLocked_trans_marketing'), ('isLocked_trans_collection'), ('isLocked_trans_chequeRegister'),
    ('isLocked_trans_writeCheque'),
    -- Product Actions
    ('isAddProductLocked'), ('isAddProductLocked_PO')
) AS default_locks(id)
WHERE NOT EXISTS (SELECT 1 FROM Acc_System_Locks WHERE ModuleId = id)
GO

-- Get System Locks Procedure
IF EXISTS (SELECT * FROM sysobjects WHERE name='ACC_sp_GetSystemLocks' AND xtype='P')
    DROP PROCEDURE ACC_sp_GetSystemLocks
GO

CREATE PROCEDURE ACC_sp_GetSystemLocks
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ModuleId, IsLocked FROM Acc_System_Locks
END
GO

-- Update System Lock Procedure
IF EXISTS (SELECT * FROM sysobjects WHERE name='ACC_sp_UpdateSystemLock' AND xtype='P')
    DROP PROCEDURE ACC_sp_UpdateSystemLock
GO

CREATE PROCEDURE ACC_sp_UpdateSystemLock
    @ModuleId NVARCHAR(100),
    @IsLocked BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM Acc_System_Locks WHERE ModuleId = @ModuleId)
    BEGIN
        UPDATE Acc_System_Locks 
        SET IsLocked = @IsLocked, UpdatedAt = GETDATE()
        WHERE ModuleId = @ModuleId
    END
    ELSE
    BEGIN
        INSERT INTO Acc_System_Locks (ModuleId, IsLocked)
        VALUES (@ModuleId, @IsLocked)
    END
END
GO
