-- Run this script to generate the tables needed for the Purchase Order (TransactionSave) module

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_TransactionSave_Header]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_TransactionSave_Header](
        [Doc_No] [nvarchar](20) NOT NULL,
        [Iid] [nvarchar](10) NOT NULL,
        [Company_Id] [nvarchar](20) NOT NULL,
        [Post_Date] [nvarchar](20) NULL,
        [Expected_Date] [nvarchar](20) NULL,
        [Vendor_Id] [nvarchar](20) NULL,
        [Pay_Type] [nvarchar](50) NULL,
        [Remarks] [nvarchar](150) NULL,
        [Reference] [nvarchar](150) NULL,
        [Comment] [nvarchar](200) NULL,
        [Total] [money] NULL,
        [TaxPer] [nvarchar](20) NULL,
        [NbtAmnt] [money] NULL,
        [Net_Amount] [money] NULL,
        [Create_User] [nvarchar](50) NULL,
        [Create_Date] [datetime] DEFAULT GETDATE(),
        CONSTRAINT [PK_ACC_TransactionSave_Header] PRIMARY KEY CLUSTERED 
        (
            [Doc_No] ASC,
            [Iid] ASC,
            [Company_Id] ASC
        )
    )
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_TransactionSave_Details]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_TransactionSave_Details](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Doc_No] [nvarchar](20) NOT NULL,
        [Iid] [nvarchar](10) NOT NULL,
        [Company_Id] [nvarchar](20) NOT NULL,
        [Ln_No] [int] NULL,
        [Prod_Code] [nvarchar](25) NULL,
        [Prod_Name] [nvarchar](100) NULL,
        [Unit] [nvarchar](10) NULL,
        [Pack_Size] [int] NULL,
        [Qty] [float] NULL,
        [Purchase_Price] [money] NULL,
        [Amount] [money] NULL,
        [Create_User] [nvarchar](50) NULL,
        CONSTRAINT [PK_ACC_TransactionSave_Details] PRIMARY KEY CLUSTERED 
        (
            [Id] ASC
        )
    )
END
GO
