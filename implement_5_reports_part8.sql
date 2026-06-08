USE Acc_Web;
GO

-- 36. Supplier Contact List
ALTER PROCEDURE dbo.ACC_sp_GetSupplierContactList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Code AS Supplier_ID,
        Supplier_Name,
        ISNULL(Phone, 'N/A') AS Phone,
        ISNULL(Email, 'N/A') AS Email,
        ISNULL(Address1, '') + CASE WHEN Address2 IS NOT NULL AND Address2 <> '' THEN ', ' + Address2 ELSE '' END AS Address,
        ISNULL(Contact_Person, 'N/A') AS Contact_Person
    FROM ACC_Supplier
    WHERE (@CompanyId IS NULL OR Company_Code = @CompanyId)
    ORDER BY Supplier_Name;
END;
GO

-- 37. Cheque Detail
ALTER PROCEDURE dbo.ACC_sp_GetChequeDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.Chq_No AS Cheque_No,
        MAX(c.Post_Date) AS Date,
        ISNULL(MAX(s.Supplier_Name), MAX(c.Payee)) AS Payee,
        MAX(c.Bank_Acc) AS Bank_Account,
        SUM(ISNULL(c.Amount, 0)) AS Amount
    FROM ACC_WriteChq_Header c
    LEFT JOIN ACC_Supplier s ON c.Vendor_Id = s.Code AND s.Company_Code = c.Company_Id
    WHERE (@CompanyId IS NULL OR c.Company_Id = @CompanyId)
      AND (@StartDate IS NULL OR COALESCE(TRY_CONVERT(DATE, c.Post_Date, 103), TRY_CAST(c.Post_Date AS DATE)) >= @StartDate)
      AND (@EndDate IS NULL OR COALESCE(TRY_CONVERT(DATE, c.Post_Date, 103), TRY_CAST(c.Post_Date AS DATE)) <= @EndDate)
    GROUP BY c.Chq_No
    ORDER BY MAX(COALESCE(TRY_CONVERT(DATE, c.Post_Date, 103), TRY_CAST(c.Post_Date AS DATE))) DESC;
END;
GO

-- 38. Bill Payment List
ALTER PROCEDURE dbo.ACC_sp_GetBillPaymentList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ISNULL(MAX(Vend_Name), 'Unknown Vendor') AS Vendor_Name,
        MAX(CAST(Create_Date AS DATE)) AS Payment_Date,
        Doc_No AS Bill_No,
        MAX(Pab_Doc) AS Payment_Doc_No,
        SUM(ISNULL(To_Pay, 0)) AS Amount_Paid
    FROM ACC_Paybll_Sumary
    WHERE (@CompanyId IS NULL OR Company = @CompanyId)
      AND (@StartDate IS NULL OR CAST(Create_Date AS DATE) >= @StartDate)
      AND (@EndDate IS NULL OR CAST(Create_Date AS DATE) <= @EndDate)
    GROUP BY Doc_No
    ORDER BY MAX(CAST(Create_Date AS DATE)) DESC;
END;
GO

-- 39. Open Purchase Order Detail
ALTER PROCEDURE dbo.ACC_sp_GetOpenPurchaseOrderDetail
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- No PO tables currently available, returning empty structure
    SELECT 
        CAST('' AS NVARCHAR(100)) AS Supplier_Name,
        CAST('' AS NVARCHAR(50)) AS PO_No,
        CAST('' AS NVARCHAR(50)) AS Date,
        CAST('' AS NVARCHAR(100)) AS Item_Name,
        CAST(0.0 AS DECIMAL(18,2)) AS Amount
    WHERE 1 = 0;
END;
GO

-- 40. Open Purchase Order List
ALTER PROCEDURE dbo.ACC_sp_GetOpenPurchaseOrderList
    @CompanyId NVARCHAR(50) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- No PO tables currently available, returning empty structure
    SELECT 
        CAST('' AS NVARCHAR(100)) AS Supplier_Name,
        CAST('' AS NVARCHAR(50)) AS PO_No,
        CAST('' AS NVARCHAR(50)) AS Date,
        CAST(0.0 AS DECIMAL(18,2)) AS Amount
    WHERE 1 = 0;
END;
GO
