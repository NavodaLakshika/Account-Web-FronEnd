-- Run this script to generate the tables needed for the Enter Bill module

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Bill_Header]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Bill_Header](
        [Doc_No] [nvarchar](20) PRIMARY KEY,
        [Company] [nvarchar](20) NOT NULL,
        [Bill_Type] [nvarchar](20) NULL,
        [Vendor_Id] [nvarchar](20) NULL,
        [Acc_Id] [nvarchar](20) NULL,
        [Terms] [nvarchar](100) NULL,
        [Memo] [nvarchar](200) NULL,
        [Bill_No] [nvarchar](50) NULL,
        [Ref_No] [nvarchar](50) NULL,
        [Post_Date] [nvarchar](20) NULL,
        [Bill_Due_Date] [nvarchar](20) NULL,
        [Net_Amount] [money] NULL,
        [CostCenter] [nvarchar](20) NULL,
        [Create_User] [nvarchar](50) NULL,
        [Create_Date] [datetime] DEFAULT GETDATE()
    )
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Bill_Expense]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Bill_Expense](
        [Id] [int] IDENTITY(1,1) PRIMARY KEY,
        [Doc_No] [nvarchar](20) NOT NULL,
        [Acc_Code] [nvarchar](20) NOT NULL,
        [CostCenter] [nvarchar](20) NULL,
        [Amount] [money] NULL,
        [Memo] [nvarchar](200) NULL
    )
END
GO
