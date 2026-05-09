-- =============================================================================
-- Write Cheque Missing Tables Script
-- Run this on your Acc_Web database
-- =============================================================================

-- 1. COST CENTER EXPENSES TABLE
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ACC_CostCenterExpenses' AND xtype='U')
CREATE TABLE [dbo].[ACC_CostCenterExpenses](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Doc_No] [nvarchar](20) NULL,
    [Post_Date] [nvarchar](20) NULL,
    [Company_Id] [nvarchar](20) NULL,
    [Iid] [nvarchar](10) NULL,
    [Vendor_Id] [nvarchar](20) NULL,
    [Acc_Code] [nvarchar](20) NULL,
    [Acc_Name] [nvarchar](100) NULL,
    [CostCode] [nvarchar](20) NULL,
    [CostName] [nvarchar](100) NULL,
    [Amount] [money] NULL,
    [CreateUser] [nvarchar](20) NULL
);
GO

-- 2. PETTY CASH ADDITIONS TABLE
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ACC_PettyCashAdd' AND xtype='U')
CREATE TABLE [dbo].[ACC_PettyCashAdd](
    [Id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Doc_No] [nvarchar](20) NULL,
    [Acc_Name] [nvarchar](100) NULL,
    [Amount] [money] NULL,
    [Disc] [nvarchar](100) NULL,
    [Comp_Id] [nvarchar](20) NULL,
    [Post_Date] [nvarchar](20) NULL
);
GO

-- 3. STOCK MASTER TABLE (Safety Check)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ACC_Stock_Master' AND xtype='U')
CREATE TABLE [dbo].[ACC_Stock_Master](
    [Prod_Code]  [nvarchar](15) NOT NULL,
    [Comp_Code]  [nvarchar](20) NOT NULL,
    [Qty]        [numeric](18, 5) DEFAULT 0,
    CONSTRAINT PK_ACC_Stock_Master PRIMARY KEY (Prod_Code, Comp_Code)
);
GO

PRINT 'Write Cheque missing tables created successfully.';
