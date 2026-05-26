-- ============================================
-- ACC_MessageLog Table
-- Logs all SMS messages sent via the gateway
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ACC_MessageLog' AND xtype='U')
BEGIN
    CREATE TABLE ACC_MessageLog (
        Id_No INT IDENTITY(1,1) PRIMARY KEY,
        Phone_Number NVARCHAR(50) NOT NULL,
        Message_Text NVARCHAR(500) NOT NULL,
        Sender_Name NVARCHAR(100) NOT NULL,
        Receiver_Name NVARCHAR(100) NULL,
        Receiver_Code NVARCHAR(50) NULL,
        Gateway_Response NVARCHAR(MAX) NULL,
        Sent_At DATETIME2 NOT NULL DEFAULT GETDATE(),
        Status NVARCHAR(20) NOT NULL DEFAULT 'Sent'
    );

    -- Index for faster lookups
    CREATE NONCLUSTERED INDEX IX_ACC_MessageLog_SentAt 
        ON ACC_MessageLog (Sent_At DESC);
    CREATE NONCLUSTERED INDEX IX_ACC_MessageLog_Phone 
        ON ACC_MessageLog (Phone_Number);
END
GO
