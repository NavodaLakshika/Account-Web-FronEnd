-- Create ACC_Fixed_Asset_Registor table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Fixed_Asset_Registor]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Fixed_Asset_Registor](
        [Assets_Code] [nvarchar](20) NOT NULL,
        [Company] [nvarchar](20) NOT NULL,
        [Assets_Name] [nvarchar](100) NULL,
        [Acc_Code] [nvarchar](20) NULL,
        [Purch_Name] [nvarchar](200) NULL,
        [Cond_Type] [nvarchar](10) NULL,
        [Purch_Date] [nvarchar](20) NULL,
        [Purch_Price] [money] NULL,
        [Payee] [nvarchar](100) NULL,
        [Ass_Sold] [nvarchar](10) NULL,
        [Sales_Name] [nvarchar](200) NULL,
        [Sales_Date] [nvarchar](20) NULL,
        [Selling_Price] [money] NULL,
        [Sales_Expence] [money] NULL,
        [Assets_Description] [nvarchar](max) NULL,
        [Location] [nvarchar](100) NULL,
        [Serial_No] [nvarchar](50) NULL,
        [Warranty_Exp] [nvarchar](20) NULL,
        [Referance] [nvarchar](max) NULL,
        [Creat_User] [nvarchar](50) NULL,
        [Creat_Date] [nvarchar](50) NULL,
        PRIMARY KEY (Assets_Code, Company)
    )
END

-- Create Acc_Sub_Cust_Accounts if it doesn't exist (for lookups)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Acc_Sub_Cust_Accounts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Acc_Sub_Cust_Accounts](
        [Cust_Acc_Code] [nvarchar](20) NOT NULL,
        [Sub_Cust_Acc_Code] [nvarchar](20) NOT NULL,
        [Sub_Cust_Acc_Name] [nvarchar](100) NULL,
        PRIMARY KEY (Cust_Acc_Code, Sub_Cust_Acc_Code)
    )
END

-- Insert sample Asset Sub-Accounts (Main Code 300) if empty
IF NOT EXISTS (SELECT * FROM [dbo].[Acc_Sub_Accounts] WHERE Main_Acc_Code = '300')
BEGIN
    INSERT INTO [dbo].[Acc_Sub_Accounts] (Sub_Code, Sub_Acc_Name, Main_Acc_Code) VALUES ('300-100', 'LAND & BUILDINGS', '300')
    INSERT INTO [dbo].[Acc_Sub_Accounts] (Sub_Code, Sub_Acc_Name, Main_Acc_Code) VALUES ('300-200', 'MOTOR VEHICLES', '300')
    INSERT INTO [dbo].[Acc_Sub_Accounts] (Sub_Code, Sub_Acc_Name, Main_Acc_Code) VALUES ('300-300', 'OFFICE EQUIPMENT', '300')
END
