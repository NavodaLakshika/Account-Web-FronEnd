-- Create ACC_LongTermLiab table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_LongTermLiab]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_LongTermLiab](
        [LiabCode] [nvarchar](20) NOT NULL,
        [Company] [nvarchar](20) NOT NULL,
        [LiabName] [nvarchar](100) NOT NULL,
        [LiabAccCode] [nvarchar](20) NULL,
        [LenderCode] [nvarchar](20) NULL,
        [Amount] [money] NULL,
        [Description] [nvarchar](200) NULL,
        [Term] [float] NULL,
        [OrgDate] [nvarchar](20) NULL,
        [PayType] [nvarchar](30) NULL,
        [InterestRate] [float] NULL,
        [NoOfInstallment] [int] NULL,
        [MonthlyIns] [money] NULL,
        [DueDate] [nvarchar](20) NULL,
        [CreateUser] [nvarchar](50) NULL,
        [CreateDate] [datetime] DEFAULT GETDATE(),
        PRIMARY KEY (LiabCode, Company)
    )
END

-- Insert some sample Liability accounts (850 series) if missing from Acc_Sub_Accounts
IF NOT EXISTS (SELECT * FROM [dbo].[Acc_Sub_Accounts] WHERE SUBSTRING(Sub_Code,1,3) = '850')
BEGIN
    INSERT INTO [dbo].[Acc_Sub_Accounts] (Sub_Code, Sub_Acc_Name, Main_Acc_Code) VALUES ('850-100', 'LONG TERM LOANS', '850')
    INSERT INTO [dbo].[Acc_Sub_Accounts] (Sub_Code, Sub_Acc_Name, Main_Acc_Code) VALUES ('850-200', 'BANK OVERDRAFTS', '850')
END
