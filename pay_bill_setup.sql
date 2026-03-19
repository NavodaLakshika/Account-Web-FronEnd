-- Run this script to generate the tables needed for the Pay Bill module

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Paybll_Sumary]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Paybll_Sumary](
        [Doc_No] [nvarchar](20) PRIMARY KEY,
        [Date_Due] [nvarchar](20) NULL,
        [Vend_Id] [nvarchar](20) NULL,
        [Vend_Name] [nvarchar](100) NULL,
        [Ref_No] [nvarchar](50) NULL,
        [Amount_Due] [money] NULL,
        [Balance] [money] NULL,
        [To_Pay] [money] NULL,
        [Iid] [nvarchar](10) NULL,
        [Company] [nvarchar](20) NULL,
        [Create_User] [nvarchar](50) NULL,
        [Create_Date] [datetime] DEFAULT GETDATE(),
        [CostCenter] [nvarchar](20) NULL
    )
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Paid_PaymentSummary]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Paid_PaymentSummary](
        [Id] [int] IDENTITY(1,1) PRIMARY KEY,
        [Pay_Doc] [nvarchar](20) NOT NULL,
        [Doc_No] [nvarchar](20) NOT NULL,
        [Vend_Id] [nvarchar](20) NULL,
        [Discount] [money] NULL,
        [Pay_Type] [nvarchar](20) NULL,
        [Set_Amnt] [money] NULL,
        [OverPay] [money] NULL,
        [Amount] [money] NULL,
        [CostCenter] [nvarchar](20) NULL,
        [Company_Id] [nvarchar](20) NULL,
        [Pay_Date] [nvarchar](30) NULL,
        [Voucher_No] [nvarchar](20) NULL,
        [Memo] [nvarchar](200) NULL
    )
END
GO

-- Assuming sample bill to test the Pay Bill grid
INSERT INTO [dbo].[ACC_Paybll_Sumary] (Doc_No, Date_Due, Vend_Id, Vend_Name, Ref_No, Amount_Due, Balance, Company)
VALUES ('EBN260319001', '19/03/2026', 'V001', 'Sample Vendor', 'REF123', 1500.00, 1500.00, 'C001')
GO
