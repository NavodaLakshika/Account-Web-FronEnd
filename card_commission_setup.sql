-- Create ACC_CardType table if it doesn't exist (for lookups)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Acc_CardType]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Acc_CardType](
        [CardID] [nvarchar](5) NOT NULL PRIMARY KEY,
        [CardName] [nvarchar](20) NOT NULL
    )
END

-- Create ACC_CardCommission table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_CardCommission]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_CardCommission](
        [BankAcc_Code] [nvarchar](10) NOT NULL,
        [BankAcc_Name] [nvarchar](50) NOT NULL,
        [CardID] [nvarchar](5) NOT NULL,
        [CardType] [nvarchar](20) NOT NULL,
        [Rate] [money] NOT NULL,
        PRIMARY KEY (BankAcc_Code, CardID)
    )
END

-- Create Acc_Sub_Accounts table if it doesn't exist (for bank account lookups)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Acc_Sub_Accounts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Acc_Sub_Accounts](
        [Sub_Code] [nvarchar](10) NOT NULL PRIMARY KEY,
        [Sub_Acc_Name] [nvarchar](50) NOT NULL,
        [Main_Acc_Code] [nvarchar](10) NOT NULL
    )
END

-- Insert some sample data for Card Types if empty
IF NOT EXISTS (SELECT * FROM [dbo].[Acc_CardType])
BEGIN
    INSERT INTO [dbo].[Acc_CardType] (CardID, CardName) VALUES ('C01', 'VISA')
    INSERT INTO [dbo].[Acc_CardType] (CardID, CardName) VALUES ('C02', 'MASTER')
    INSERT INTO [dbo].[Acc_CardType] (CardID, CardName) VALUES ('C03', 'AMEX')
END

-- Insert sample Sub Accounts for banking (Main_Acc_Code = '400')
IF NOT EXISTS (SELECT * FROM [dbo].[Acc_Sub_Accounts])
BEGIN
    INSERT INTO [dbo].[Acc_Sub_Accounts] (Sub_Code, Sub_Acc_Name, Main_Acc_Code) VALUES ('400-001', 'HNB MAIN ACCOUNT', '400')
    INSERT INTO [dbo].[Acc_Sub_Accounts] (Sub_Code, Sub_Acc_Name, Main_Acc_Code) VALUES ('400-002', 'SAMPATH SAVINGS', '400')
    INSERT INTO [dbo].[Acc_Sub_Accounts] (Sub_Code, Sub_Acc_Name, Main_Acc_Code) VALUES ('400-003', 'BOC CURRENT', '400')
END
