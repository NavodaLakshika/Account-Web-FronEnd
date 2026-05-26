-- acc_transaction_type_setup.sql
-- Run this in SQL Server Management Studio (SSMS)
-- Populates the ACC_Transaction_Type table with all system transaction types

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Transaction_Type]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Transaction_Type] (
        [Code] [varchar](10) NOT NULL,
        [Name] [varchar](100) NOT NULL,
        [Category] [varchar](50) NULL,
        [IsActive] [bit] NULL DEFAULT (1),
        [Insert_Date] [datetime] NULL DEFAULT (GETDATE()),
        CONSTRAINT [PK_ACC_Transaction_Type] PRIMARY KEY CLUSTERED ([Code] ASC)
    );
END
GO

-- Insert all transaction types (skip duplicates)
MERGE INTO [dbo].[ACC_Transaction_Type] AS target
USING (VALUES
    -- Inventory / Purchase
    ('PUR',    'Purchase Order',          'Inventory'),
    ('GRN',    'Goods Received Note',     'Inventory'),
    ('SRN',    'Sales Return Note',       'Inventory'),
    ('PRN',    'Purchase Return Note',    'Inventory'),
    ('STK',    'Stock Adjustment',        'Inventory'),
    ('GREQ',   'Goods Requisition Note',  'Inventory'),
    ('TOGN',   'Goods Transfer Note',     'Inventory'),
    ('PRPC',   'Product Price Change',    'Inventory'),

    -- Sales
    ('SIN',    'Sales Invoice',           'Sales'),
    ('INV',    'Invoice',                 'Sales'),
    ('CIV',    'Customer Invoice',        'Sales'),
    ('CUR',    'Customer Return / Credit Note', 'Sales'),
    ('SRNR',   'Sales Return Note',       'Sales'),
    ('SALORD', 'Sales Order',             'Sales'),
    ('QTAT',   'Quotation / Estimate',    'Sales'),
    ('CRJOB',  'Create Job',              'Sales'),

    -- Finance / Payments
    ('PV',     'Payment Voucher',         'Finance'),
    ('RV',     'Receipt Voucher',         'Finance'),
    ('JE',     'Journal Entry',           'Finance'),
    ('JNLDN',  'Journal Entry (Doc No)',  'Finance'),
    ('PCV',    'Petty Cash Voucher',      'Finance'),
    ('PETT',   'Petty Cash',              'Finance'),
    ('RCP',    'Receipt',                 'Finance'),
    ('PAY',    'Payment',                 'Finance'),
    ('BIL',    'Bill',                    'Finance'),
    ('EBTDN',  'Enter Bill',              'Finance'),
    ('PAYB',   'Pay Bill',                'Finance'),
    ('ADP',    'Advance Payment',         'Finance'),
    ('ADVPY',  'Advance Pay (Doc No)',    'Finance'),
    ('ADR',    'Advance Receipt',         'Finance'),
    ('ADVRC',  'Advance Receipt (Doc No)','Finance'),
    ('OPB',    'Opening Balance',         'Finance'),
    ('OPBV',   'Opening Balance Vendor',  'Finance'),
    ('OPBC',   'Opening Balance Customer','Finance'),
    ('OPBA',   'Opening Balance Account', 'Finance'),
    ('WRCHQ',  'Write Cheque',            'Finance'),
    ('CSPY',   'Customer Payment',        'Finance'),
    ('FNTDN',  'Funds Transfer',          'Finance'),
    ('BNCDN',  'Bank Charges / Direct Transaction', 'Finance'),
    ('MDPO',   'Make Deposit',            'Finance'),
    ('MCSH',   'Main Cash',               'Finance'),
    ('REPA',   'Receive Payment',         'Finance'),
    ('OTAC',   'Other Account Transaction','Finance'),
    ('STAF',   'Statement Affair',        'Finance'),
    ('LTLIB',  'Long Term Liability',     'Finance'),

    -- Cheque Management
    ('CCRT',   'Customer Cheque Return',  'Cheque'),
    ('SCRT',   'Supplier Cheque Return',  'Cheque'),
    ('NPC',    'Not Presented Cheques',   'Cheque'),
    ('CIH',    'Cheque In Hand',          'Cheque')
) AS source ([Code], [Name], [Category])
ON target.[Code] = source.[Code]
WHEN NOT MATCHED THEN
    INSERT ([Code], [Name], [Category]) VALUES (source.[Code], source.[Name], source.[Category]);
GO

-- Verify inserted data
SELECT * FROM [dbo].[ACC_Transaction_Type] ORDER BY [Category], [Code];
GO
