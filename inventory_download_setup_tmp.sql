USE [Acc_Web]
GO

-- 1. Create source tables if missing
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Download_Inv_Trans_Header]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Download_Inv_Trans_Header](
        [Doc_No] [nvarchar](50) NOT NULL,
        [Post_Date] [nvarchar](25) NULL,
        [Supplier_Id] [nvarchar](20) NULL,
        [Iid] [nvarchar](10) NULL,
        [Inv_Date] [nvarchar](25) NULL,
        [Inv_No] [nvarchar](50) NULL,
        [Inv_Amt] [money] NULL,
        [Porder_No] [nvarchar](50) NULL,
        [Amount] [money] NULL,
        [Net_Amount] [money] NULL,
        [Adjst] [money] NULL,
        [Discount] [money] NULL,
        [Remarks] [nvarchar](max) NULL,
        [Reference] [nvarchar](50) NULL,
        [Tax] [money] NULL,
        [AddRemarks] [nvarchar](max) NULL,
        [AddValue] [money] NULL,
        [AddAmt] [money] NULL,
        [ReduceRemarks] [nvarchar](max) NULL,
        [ReduceValue] [money] NULL,
        [ReduceAmt] [money] NULL,
        [Pay_Type] [nvarchar](20) NULL,
        [Recalled] [nvarchar](10) NULL,
        [Expected_Date] [nvarchar](25) NULL,
        [Loca] [nvarchar](3) NULL,
        [Download] [nvarchar](1) DEFAULT 'F'
    )
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Download_Inv_Trans_Details]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Download_Inv_Trans_Details](
        [Doc_No] [nvarchar](50) NOT NULL,
        [Post_Date] [nvarchar](25) NULL,
        [Supplier_Id] [nvarchar](20) NULL,
        [Iid] [nvarchar](10) NULL,
        [Prod_Code] [nvarchar](20) NULL,
        [Prod_Name] [nvarchar](250) NULL,
        [Unit] [nvarchar](20) NULL,
        [Pack_Size] [decimal](18, 4) NULL,
        [Qty] [decimal](18, 4) NULL,
        [FreeQty] [decimal](18, 4) NULL,
        [Purchase_Price] [money] NULL,
        [Selling_Price] [money] NULL,
        [Disc] [decimal](18, 4) NULL,
        [Amount] [money] NULL,
        [Ln] [int] NULL,
        [Phy_Qty] [decimal](18, 4) NULL,
        [Loca] [nvarchar](3) NULL,
        [Download] [nvarchar](1) DEFAULT 'F'
    )
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Download_Inv_PaymentSummary]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Download_Inv_PaymentSummary](
        [Org_Doc_No] [nvarchar](50) NULL,
        [Post_Date] [nvarchar](25) NULL,
        [Acc_Code] [nvarchar](20) NULL,
        [Amount] [money] NULL,
        [Download] [nvarchar](1) DEFAULT 'F',
        [Iid] [nvarchar](10) NULL,
        [Loca] [nvarchar](3) NULL,
        [Payment_Mode] [nvarchar](20) NULL,
        [Cheque_No] [nvarchar](50) NULL,
        [Cheque_Date] [nvarchar](25) NULL
    )
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACC_Download_Inv_PosSale]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ACC_Download_Inv_PosSale](
        [TransDocNo] [nvarchar](50) NULL,
        [Sale_Date] [nvarchar](25) NULL,
        [PosNet_Amt] [money] NULL,
        [Iid] [nvarchar](10) NULL,
        [Download] [nvarchar](1) DEFAULT 'F',
        [Loca] [nvarchar](3) NULL,
        [PosCash_Amt] [money] NULL,
        [Id_No] [nvarchar](50) NULL,
        [PosCredit_amt] [money] NULL
    )
END
GO

-- 2. Create/Alter Stored Procedures
IF OBJECT_ID('dbo.ACC_sp_Download_Purchase') IS NULL EXEC('CREATE PROCEDURE dbo.ACC_sp_Download_Purchase AS BEGIN SET NOCOUNT ON; END')
GO
ALTER PROCEDURE [dbo].[ACC_sp_Download_Purchase]
	@Err_x			INT OUTPUT,
	@Create_User	NVARCHAR(20),
	@Comp			NVARCHAR(20),
	@Loca			NVARCHAR(3),
	@DateFrom		NVARCHAR(25),
	@DateTo			NVARCHAR(25),
	@Message		NVARCHAR(50) OUTPUT
AS
BEGIN
	SET NOCOUNT ON
	BEGIN TRAN	
	IF EXISTS ( SELECT * FROM ACC_Supplier INNER JOIN ACC_Download_Inv_Trans_Header ON ACC_Supplier.Code = ACC_Download_Inv_Trans_Header.Supplier_Id WHERE (Iid = 'GRN' OR Iid = 'SRN') AND Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103) )
	  BEGIN
	  	INSERT INTO ACC_Transaction_Header( Doc_No ,Post_Date ,Bill_Type ,Vendor_Id  ,Company_Id ,Terms ,Memo ,To_Comp ,Iid ,Inv_Date ,Inv_No ,Inv_Amount ,PO_No     ,Amount ,Net_Amount ,Sel_Amount ,Adjst ,AdjstType ,Discount_Amt ,PurDiscount ,Remarks ,Reference ,Tax ,Taxper ,TaxPerAmt ,AddRemarks ,AddValue ,AddAmt ,ReduceRemarks ,ReduceValue ,ReduceAmt ,Pay_Type ,Bank ,Recalled ,Expected_Date ,Comment ,CrdtPeriod ,SalesRef ,Create_User    ,Acc_Type ,Location ,Payee ,Acc_Bal ,CheckValue ,UserName      ,Chque_No ,ReffNo2 ,Cancel ,NBT ,NbtAmnt ,OverPay)
		SELECT			                   Doc_No ,Post_Date,0	      ,Supplier_Id ,@Comp      ,''	    ,''  ,''      ,Iid, Inv_Date ,Inv_No, Inv_Amt    ,Porder_No, Amount,Net_Amount ,0           , Adjst,''        ,Discount	   ,0	         ,Remarks ,Reference,Tax  ,''          ,0                 ,AddRemarks ,AddValue  ,AddAmt, ReduceRemarks ,ReduceValue ,ReduceAmt ,Pay_Type ,''       ,Recalled ,Expected_Date ,''              ,0                 ,''            ,@Create_User ,''                , ''            ,''          ,0            ,''                   ,@Create_User,''                ,''             ,''           ,0      ,0             ,0 FROM ACC_Download_Inv_Trans_Header INNER JOIN ACC_Supplier ON ACC_Download_Inv_Trans_Header.Supplier_Id = ACC_Supplier.Code WHERE Iid = 'GRN' AND Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103) 
		IF (@@ERROR <> 0) GOTO PROBLEM
			  
		INSERT INTO ACC_Transaction_Details( Doc_No ,Post_Date ,Relevent_Date ,Vendor_Id  ,Company_Id ,To_Comp ,Iid ,Prod_Code ,Prod_Name ,Unit ,Pack_Size ,Qty ,FreeQty ,Purchase_Price ,Selling_Price ,Disc ,Discount ,Amount ,Cust_Job ,Ln_No ,Phy_Qty ,Create_User     ,Doc_ForAll ,TempVal1 ,TempVal2 ,TempVal3 ,TempVal4 ,Acc_ID ,Cancel)
		SELECT							     Doc_No ,Post_Date ,''           ,Supplier_Id ,@Comp     ,''      ,Iid ,Prod_Code ,Prod_Name ,Unit ,Pack_Size ,Qty ,FreeQty ,Purchase_Price ,Selling_Price ,Disc ,0	  ,Amount ,''	      ,Ln         ,Phy_Qty ,@Create_User ,''                ,0	    , 0              , 0              ,0                ,''           ,''  FROM ACC_Download_Inv_Trans_Details INNER JOIN ACC_Supplier ON ACC_Download_Inv_Trans_Details.Supplier_Id = ACC_Supplier.Code WHERE Iid = 'GRN' AND Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
		IF (@@ERROR <> 0) GOTO PROBLEM
		
		INSERT INTO ACC_Transaction_Header( Doc_No ,Post_Date ,Bill_Type ,Vendor_Id  ,Company_Id ,Terms ,Memo ,To_Comp ,Iid ,Inv_Date ,Inv_No ,Inv_Amount ,PO_No     ,Amount ,Net_Amount ,Sel_Amount ,Adjst ,AdjstType ,Discount_Amt ,PurDiscount ,Remarks ,Reference ,Tax ,Taxper ,TaxPerAmt ,AddRemarks ,AddValue ,AddAmt ,ReduceRemarks ,ReduceValue ,ReduceAmt ,Pay_Type ,Bank ,Recalled ,Expected_Date ,Comment ,CrdtPeriod ,SalesRef ,Create_User    ,Acc_Type ,Location ,Payee ,Acc_Bal ,CheckValue ,UserName      ,Chque_No ,ReffNo2 ,Cancel ,NBT ,NbtAmnt ,OverPay)
		SELECT			          Doc_No ,Post_Date,0	     ,Supplier_Id ,@Comp         ,''	     ,''          ,''               ,'PRN',Inv_Date  , Inv_No, Inv_Amt     ,Porder_No, Amount,Net_Amount ,0                  , Adjst,''                ,Discount	   ,0	            ,Remarks ,Reference,Tax  ,''          ,0                 ,AddRemarks ,AddValue  ,AddAmt, ReduceRemarks ,ReduceValue ,ReduceAmt ,Pay_Type ,''       ,Recalled ,Expected_Date ,''              ,0                 ,''            ,@Create_User ,''                , ''            ,''          ,0            ,''                   ,@Create_User,''                ,''             ,''           ,0      ,0             ,0 FROM ACC_Download_Inv_Trans_Header INNER JOIN ACC_Supplier ON ACC_Download_Inv_Trans_Header.Supplier_Id = ACC_Supplier.Code WHERE Iid = 'SRN' AND Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103) 
		IF (@@ERROR <> 0) GOTO PROBLEM
			  
		INSERT INTO ACC_Transaction_Details( Doc_No ,Post_Date ,Relevent_Date ,Vendor_Id  ,Company_Id ,To_Comp ,Iid ,Prod_Code ,Prod_Name ,Unit ,Pack_Size ,Qty ,FreeQty ,Purchase_Price ,Selling_Price ,Disc ,Discount ,Amount ,Cust_Job ,Ln_No ,Phy_Qty ,Create_User     ,Doc_ForAll ,TempVal1 ,TempVal2 ,TempVal3 ,TempVal4 ,Acc_ID ,Cancel)
		SELECT			         Doc_No ,Post_Date ,''                       ,Supplier_Id ,@Comp        ,''               ,'PRN' ,Prod_Code ,Prod_Name ,Unit ,Pack_Size ,Qty ,FreeQty ,Purchase_Price ,Selling_Price ,Disc ,0	  ,Amount ,''	      ,Ln         ,Phy_Qty ,@Create_User ,''                ,0	    , 0              , 0              ,0                ,''           ,''  FROM ACC_Download_Inv_Trans_Details INNER JOIN ACC_Supplier ON ACC_Download_Inv_Trans_Details.Supplier_Id = ACC_Supplier.Code WHERE Iid = 'SRN' AND Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
		IF (@@ERROR <> 0) GOTO PROBLEM
		
		INSERT INTO ACC_Paybll_Sumary( Pab_Doc ,Doc_No ,Date_Due , Vend_Id    ,Vend_Name      ,     Ref_No    ,Amount_Due,Discount ,Set_Use ,To_Pay ,  Balance , Iid ,Company ,Create_User ,Create_Date )
		SELECT			''   ,Doc_No ,Post_Date,Supplier_Id,S.Supplier_Name  ,   T.Reference,Net_Amount,0        ,       0,      0,Net_Amount,T.Iid,   @Comp,@Create_User,GETDATE() FROM dbo.ACC_Download_Inv_Trans_Header T INNER JOIN  ACC_Supplier S ON S.Code = T.Supplier_Id WHERE  Iid = 'GRN' AND Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
		IF (@@ERROR <> 0) GOTO PROBLEM
		
		INSERT INTO ACC_Account_Transaction_Details( Doc_No,Post_Date,Vendor_ID,Company_ID,To_Comp,Iid  ,Acc_Code,Acc_Name,Incom_Acc_Code,Amount,Credit,Memo,Cust_Job,Create_User)
		SELECT					Doc_No,Post_Date,Supplier_Id,@Comp	 ,''	 ,'GRN','860-101',''     ,''		,Net_Amount,0,'Cost of Sales','', @Create_User FROM ACC_Download_Inv_Trans_Header INNER JOIN ACC_Supplier ON ACC_Download_Inv_Trans_Header.Supplier_Id = ACC_Supplier.Code WHERE Iid = 'GRN' AND Download= 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
		IF (@@ERROR <> 0) GOTO PROBLEM
		
		INSERT INTO ACC_Account_Transaction_Details( Doc_No,Post_Date,Vendor_ID,Company_ID,To_Comp,Iid  ,Acc_Code,Acc_Name,Incom_Acc_Code,Amount,Credit,Memo,Cust_Job,Create_User)
		SELECT					Doc_No,Post_Date,Supplier_Id,@Comp	 ,''	 ,'GRN','830-100',''     ,''		,0    ,Net_Amount,'Account Payable','', @Create_User FROM ACC_Download_Inv_Trans_Header INNER JOIN ACC_Supplier ON ACC_Download_Inv_Trans_Header.Supplier_Id = ACC_Supplier.Code WHERE Iid = 'GRN'  AND Download= 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
		IF (@@ERROR <> 0) GOTO PROBLEM
		
		INSERT INTO ACC_Account_Transaction_Details( Doc_No,Post_Date,Vendor_ID,Company_ID,To_Comp,Iid  ,Acc_Code,Acc_Name,Incom_Acc_Code,Amount,Credit,Memo,Cust_Job,Create_User)
		SELECT					Doc_No,Post_Date,Supplier_Id,@Comp	 ,''	 ,'PRN','830-100',''     ,''		,Net_Amount,0, 'Account Payable','', @Create_User FROM ACC_Download_Inv_Trans_Header INNER JOIN ACC_Supplier ON ACC_Download_Inv_Trans_Header.Supplier_Id = ACC_Supplier.Code WHERE Iid = 'SRN'  AND Download= 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
		IF (@@ERROR <> 0) GOTO PROBLEM
		
		INSERT INTO ACC_Account_Transaction_Details( Doc_No,Post_Date,Vendor_ID,Company_ID,To_Comp,Iid  ,Acc_Code,Acc_Name,Incom_Acc_Code,Amount,Credit,Memo,Cust_Job,Create_User)
		SELECT						Doc_No,Post_Date,Supplier_Id,@Comp	 ,''	 ,'PRN','860-103',''     ,''	,0    ,Net_Amount,'Purchase Return','', @Create_User FROM ACC_Download_Inv_Trans_Header INNER JOIN ACC_Supplier ON ACC_Download_Inv_Trans_Header.Supplier_Id = ACC_Supplier.Code WHERE Iid = 'SRN'  AND Download= 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
		IF (@@ERROR <> 0) GOTO PROBLEM
				
		INSERT INTO ACC_AdvancePay( Acc_Code ,VendId ,Vender ,Address ,Memo ,Amount				,Balance ,Chq_No ,Doc_No ,Post_Date ,Vouch_No ,Ref_No ,Chq_Date ,Company ,Create_User ,Create_Date  ,Iid)
		SELECT		'820-101',Supplier_Id,'','','Purchase Return',(SUM(Net_Amount)),(SUM(Net_Amount)),'',	Doc_No,	Post_Date,'','Purch Return','',	@Comp,@Create_User,getdate(),'ADP' FROM ACC_Download_Inv_Trans_Header  WHERE Iid='SRN'  AND Download= 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)   GROUP BY Doc_No,Post_Date,Supplier_Id
		IF (@@ERROR <> 0) GOTO PROBLEM				
						
		CREATE TABLE #Temp (PostDate NVARCHAR(30),Iid NVARCHAR(6),Purch MONEY,Retn MONEY)
		
		INSERT INTO #Temp(  PostDate,Iid, Purch, Retn )
		SELECT Post_Date,Iid,CASE Iid WHEN 'GRN' THEN Qty*Purchase_Price ELSE 0  END,CASE Iid WHEN 'SRN' THEN (QTY*Purchase_Price) ELSE 0 END FROM ACC_Download_Inv_Trans_Details WHERE (Iid = 'GRN' OR Iid = 'SRN') AND Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103) GROUP BY Post_Date,Iid,Qty,Purchase_Price
		IF (@@ERROR <> 0) GOTO PROBLEM
		
		INSERT INTO ACC_StockValuation ( Post_Date ,Purchase ,Sale )
		SELECT DISTINCT CONVERT(DATETIME,PostDate,103), SUM(Purch)-SUM(Retn),0 FROM #Temp GROUP BY PostDate ORDER BY CONVERT(DATETIME,PostDate,103)
		IF (@@ERROR <> 0) GOTO PROBLEM
		
		UPDATE dbo.ACC_Download_Inv_Trans_Header SET Download = 'T' FROM ACC_Supplier  WHERE (Iid = 'GRN' OR Iid = 'SRN') AND Loca = @Loca AND Download = 'F' AND ACC_Download_Inv_Trans_Header.Supplier_Id = ACC_Supplier.Code AND CONVERT(DATETIME,Post_Date,103) BETWEEN  CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103) 
		IF (@@ERROR <> 0) GOTO PROBLEM
	
		UPDATE dbo.ACC_Download_Inv_Trans_Details SET Download = 'T' FROM ACC_Supplier WHERE (Iid = 'GRN' OR Iid = 'SRN') AND Loca = @Loca AND Download = 'F' AND ACC_Download_Inv_Trans_Details.Supplier_Id = ACC_Supplier.Code AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
		IF (@@ERROR <> 0) GOTO PROBLEM
		
		SET @Message = 'Purchase Downloaded Successfully'
	  END
     ELSE	
	  BEGIN
	  	SET @Message = 'Pleace Download Masterfile..'	
	  END
	COMMIT TRAN
	RETURN 0
	PROBLEM:
	IF(@@ERROR<>0)
	BEGIN
		SET @Err_x=@@ERROR
   		ROLLBACK TRAN
		RETURN  @Err_x
	END
END
GO

IF OBJECT_ID('dbo.ACC_sp_Download_Sales') IS NULL EXEC('CREATE PROCEDURE dbo.ACC_sp_Download_Sales AS BEGIN SET NOCOUNT ON; END')
GO
ALTER PROCEDURE [dbo].[ACC_sp_Download_Sales]
	@Err_x			INT OUTPUT,
	@Create_User	NVARCHAR(20),
	@Comp			NVARCHAR(20),
	@Loca			NVARCHAR(3),
	@DateFrom		NVARCHAR(25),
	@DateTo			NVARCHAR(25),
	@Message		NVARCHAR(50) OUTPUT
AS
BEGIN
	SET NOCOUNT ON
	BEGIN TRAN
	
	INSERT INTO ACC_Transaction_Header( Doc_No ,Post_Date ,Bill_Type ,Vendor_Id  ,Company_Id ,Terms ,Memo ,To_Comp ,Iid ,Inv_Date ,Inv_No ,Inv_Amount ,PO_No     ,Amount ,Net_Amount ,Sel_Amount ,Adjst ,AdjstType ,Discount_Amt ,PurDiscount ,Remarks ,Reference ,Tax ,Taxper ,TaxPerAmt ,AddRemarks ,AddValue ,AddAmt ,ReduceRemarks ,ReduceValue ,ReduceAmt ,Pay_Type ,Bank ,Recalled ,Expected_Date ,Comment ,CrdtPeriod ,SalesRef ,Create_User    ,Acc_Type ,Location ,Payee ,Acc_Bal ,CheckValue ,UserName      ,Chque_No ,ReffNo2 ,Cancel ,NBT ,NbtAmnt ,OverPay)
	SELECT			          Doc_No ,Post_Date,0	     ,Supplier_Id ,@Comp         ,''	     ,''          ,''               ,Iid,Inv_Date  , Inv_No, Inv_Amt     ,Porder_No, Amount,Net_Amount ,0                  , Adjst,''                ,Discount	   ,0	            ,Remarks ,Reference,Tax  ,''          ,0                 ,AddRemarks ,AddValue  ,AddAmt, ReduceRemarks ,ReduceValue ,ReduceAmt ,Pay_Type ,''       ,Recalled ,Expected_Date ,''              ,0                 ,''            ,@Create_User ,''                , ''            ,'',0 ,'' ,@Create_User,'' ,'' ,'',0,0,0 FROM ACC_Download_Inv_Trans_Header WHERE Iid = 'INV' AND Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
	IF (@@ERROR <> 0) GOTO PROBLEM
		  
	INSERT INTO ACC_Transaction_Details( Doc_No ,Post_Date ,Relevent_Date ,Vendor_Id  ,Company_Id ,To_Comp ,Iid ,Prod_Code ,Prod_Name ,Unit ,Pack_Size ,Qty ,FreeQty ,Purchase_Price ,Selling_Price ,Disc ,Discount ,Amount ,Cust_Job ,Ln_No ,Phy_Qty ,Create_User     ,Doc_ForAll ,TempVal1 ,TempVal2 ,TempVal3 ,TempVal4 ,Acc_ID ,Cancel)
	SELECT			         Doc_No ,Post_Date ,''                       ,Supplier_Id ,@Comp        ,''               ,Iid ,Prod_Code ,Prod_Name ,Unit ,Pack_Size ,Qty ,FreeQty ,Purchase_Price ,Selling_Price ,Disc ,0	  ,Amount ,''	      ,Ln         ,Phy_Qty ,@Create_User ,''                ,0	    , 0              , 0              ,0                ,''           ,''  FROM ACC_Download_Inv_Trans_Details WHERE Iid = 'INV' AND Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
	IF (@@ERROR <> 0) GOTO PROBLEM
	
	INSERT INTO dbo.ACC_Payment_Summary( Doc_No ,Date_Due ,Iid ,Vend_Id ,Ref_No ,Inv_Amount ,Balance ,Payment ,Company ,Create_User )
	SELECT								Doc_No ,Post_Date ,Iid ,Supplier_Id ,Reference,Net_Amount,Net_Amount,0,@Comp,@Create_User FROM dbo.ACC_Download_Inv_Trans_Header WHERE  Iid = 'INV' AND Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
	IF (@@ERROR <> 0) GOTO PROBLEM
	
	INSERT INTO ACC_Transaction_Header( Doc_No ,Post_Date ,Bill_Type ,Vendor_Id,Company_Id    ,Terms       ,Memo      ,To_Comp,Iid , Inv_Date ,  Inv_No ,Inv_Amount  ,PO_No     ,Amount ,Net_Amount ,Sel_Amount ,Adjst ,AdjstType ,Discount_Amt ,PurDiscount ,Remarks ,Reference ,Tax ,Taxper ,TaxPerAmt ,AddRemarks ,AddValue ,AddAmt ,ReduceRemarks ,ReduceValue ,ReduceAmt ,Pay_Type ,Bank ,Recalled ,Expected_Date ,Comment ,CrdtPeriod ,SalesRef ,Create_User    ,Acc_Type ,Location ,Payee ,Acc_Bal ,CheckValue ,UserName      ,Chque_No ,ReffNo2 ,Cancel ,NBT ,NbtAmnt ,OverPay)
	SELECT							   Doc_No ,Post_Date,0	     ,Supplier_Id ,@Comp         ,''	     ,''          ,''    ,'SRN',Inv_Date  , Inv_No, Inv_Amt     ,Porder_No , Amount,Net_Amount ,0          , Adjst,''        ,Discount	   ,0	        ,Remarks ,Reference,Tax  ,''     ,0         ,AddRemarks ,AddValue  ,AddAmt, ReduceRemarks ,ReduceValue ,ReduceAmt ,Pay_Type ,''  ,Recalled ,Expected_Date ,''      ,0          ,''       ,@Create_User , ''        , ''      ,''    ,0       ,''         ,@Create_User  ,''       ,''      ,''     ,0   ,0       ,0 FROM ACC_Download_Inv_Trans_Header WHERE Iid = 'CUR' AND Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
	IF (@@ERROR <> 0) GOTO PROBLEM
	
	INSERT INTO ACC_Transaction_Details( Doc_No ,Post_Date ,Relevent_Date ,Vendor_Id  ,Company_Id ,To_Comp ,Iid ,Prod_Code ,Prod_Name ,Unit ,Pack_Size ,Qty ,FreeQty ,Purchase_Price ,Selling_Price ,Disc ,Discount ,Amount ,Cust_Job ,Ln_No ,Phy_Qty ,Create_User     ,Doc_ForAll ,TempVal1 ,TempVal2 ,TempVal3 ,TempVal4 ,Acc_ID ,Cancel)
	SELECT			         Doc_No ,Post_Date ,''                       ,Supplier_Id ,@Comp        ,''               ,'SRN' ,Prod_Code ,Prod_Name ,Unit ,Pack_Size ,Qty ,FreeQty ,Purchase_Price ,Selling_Price ,Disc ,0	  ,Amount ,''	      ,Ln         ,Phy_Qty ,@Create_User ,''                ,0	    , 0              , 0              ,0                ,''           ,''  FROM ACC_Download_Inv_Trans_Details WHERE Iid = 'CUR' AND Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
	IF (@@ERROR <> 0) GOTO PROBLEM
	
	INSERT INTO ACC_Account_Transaction_Details( Doc_No,Post_Date,Vendor_ID,Company_ID,To_Comp,Iid  ,Acc_Code,Acc_Name,Incom_Acc_Code,Amount,Credit,Memo,Cust_Job,Create_User)
	SELECT					Doc_No,Post_Date,Vendor_Id,@Comp	 ,''	 ,'INV','800-100',''     ,''		,Net_Amount,0,'Accounts Receivables','', @Create_User FROM dbo.ACC_Transaction_Header	WHERE Iid = 'INV' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
	IF (@@ERROR <> 0) GOTO PROBLEM
		
	INSERT INTO ACC_Account_Transaction_Details( Doc_No,Post_Date,Vendor_ID,Company_ID,To_Comp,Iid  ,Acc_Code,Acc_Name,Incom_Acc_Code,Amount,Credit,Memo,Cust_Job,Create_User)
	SELECT					Doc_No,Post_Date,Vendor_Id,@Comp	 ,''	 ,'INV','100-101',''     ,''		,0    ,Net_Amount,'Customer Invoice','', @Create_User FROM dbo.ACC_Transaction_Header	WHERE Iid = 'INV' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
	IF (@@ERROR <> 0) GOTO PROBLEM
	
	INSERT INTO ACC_Account_Transaction_Details( Doc_No,Post_Date,Vendor_ID,Company_ID,To_Comp,Iid  ,Acc_Code,Acc_Name,Incom_Acc_Code,Amount,Credit,Memo,Cust_Job,Create_User)
	SELECT					Doc_No,Post_Date,Vendor_Id,@Comp	 ,''	 ,'SRN','800-100',''     ,''		,0    ,Net_Amount,'Accounts Receivables','', @Create_User FROM dbo.ACC_Transaction_Header	WHERE Iid = 'CUR' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
	IF (@@ERROR <> 0) GOTO PROBLEM
	
	INSERT INTO ACC_Account_Transaction_Details (Doc_No,Post_Date,Vendor_ID,Company_ID,To_Comp,Iid ,Acc_Code ,Acc_Name,Incom_Acc_Code,Amount,Credit    ,Memo,Cust_Job,Create_User,Sys_Memo)
	SELECT                                      Doc_No,Post_Date,Vendor_Id,Company_Id,''    ,'SRN','100-101',''      ,''            ,SUM(Amount),0    ,'Sales Return' ,''      ,ACC_Transaction_Details.Create_User,Vendor_Id+'  '+Cust_Name FROM ACC_Transaction_Details INNER JOIN ACC_Customer ON Code=Vendor_Id WHERE Iid='SRN' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103) GROUP BY Doc_No,Post_Date,Vendor_Id,Company_Id,ACC_Transaction_Details.Create_User,Cust_Name
	IF (@@ERROR <> 0) GOTO PROBLEM
	
	CREATE TABLE #Temp (PostDate NVARCHAR(30),Iid NVARCHAR(6),Purch MONEY,Retn MONEY)
	
	INSERT INTO #Temp(  PostDate,Iid, Purch, Retn )
	SELECT Post_Date,Iid,CASE Iid WHEN 'INV'THEN Qty*ACC_Product.Purchase_price ELSE 0  END,CASE Iid WHEN 'CUR' THEN (QTY*ACC_Product.Purchase_price) ELSE 0 END FROM dbo.ACC_Download_Inv_Trans_Details INNER JOIN dbo.ACC_Product ON ACC_Download_Inv_Trans_Details.Prod_Code = ACC_Product.Code WHERE (Iid = 'INV' OR Iid = 'CUR') AND Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103) GROUP BY Post_Date,Iid,Qty,ACC_Product.Purchase_price
	IF (@@ERROR <> 0) GOTO PROBLEM
	
	INSERT INTO ACC_StockValuation ( Post_Date  ,Sale ,Purchase)
	SELECT DISTINCT CONVERT(DATETIME,PostDate,103), SUM(Purch)-SUM(Retn),0 FROM #Temp GROUP BY PostDate ORDER BY CONVERT(DATETIME,PostDate,103)
	IF (@@ERROR <> 0) GOTO PROBLEM
		
	UPDATE dbo.ACC_Download_Inv_Trans_Header SET Download = 'T' WHERE (Iid = 'INV' OR Iid = 'CUR') AND Loca = @Loca AND Download = 'F'AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103) 
	IF (@@ERROR <> 0) GOTO PROBLEM

	UPDATE dbo.ACC_Download_Inv_Trans_Details SET Download  = 'T' WHERE (Iid = 'INV' OR Iid = 'CUR') AND Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
	IF (@@ERROR <> 0) GOTO PROBLEM
	
	SET @Message = 'Sales Downloaded Successfully'
	COMMIT TRAN
	RETURN 0
	PROBLEM:
	IF(@@ERROR<>0)
	BEGIN
		SET @Err_x=@@ERROR
   		ROLLBACK TRAN
		RETURN  @Err_x
	END
END
GO

IF OBJECT_ID('dbo.ACC_sp_Download_Inv_Masterfile') IS NULL EXEC('CREATE PROCEDURE dbo.ACC_sp_Download_Inv_Masterfile AS BEGIN SET NOCOUNT ON; END')
GO
ALTER PROCEDURE [dbo].[ACC_sp_Download_Inv_Masterfile]
@Err_x			INT OUTPUT,
@Create_User	NVARCHAR(20),
@Comp			NVARCHAR(20),
@Message		NVARCHAR(50) OUTPUT
 AS
BEGIN
	SET NOCOUNT ON
	
	DELETE FROM ACC_Department
	DELETE FROM ACC_Category
	DELETE FROM ACC_Supplier WHERE Vend_Typ = 'Purchase'
	DELETE FROM ACC_Customer WHERE Code <> 'DEFAULT'
	DELETE FROM ACC_Product
	DELETE FROM ACC_Stock_Master
	DELETE FROM ACC_Location

	INSERT INTO ACC_Department( Code ,Dept_Name ,Loca_Id ,User_Name ,Create_Date ,Company )
	SELECT LTRIM(RTRIM(Dept_Code)), LTRIM(RTRIM(Dept_Name)),'01', @Create_User,GETDATE(),@Comp FROM  Bestow_New.dbo.department

	INSERT INTO ACC_Category( Dept_Code ,Code ,Cat_Name ,User_Name ,Create_Date ,Company)		
	SELECT LTRIM(RTRIM(Dept_Code)), LTRIM(RTRIM(Cat_Code)), LTRIM(RTRIM(Cat_Name)), @Create_User, GETDATE(),@Comp FROM  Bestow_New.dbo.category

	INSERT INTO ACC_Supplier( Code ,Supplier_Name			,Destibution_Name ,Address1				  ,Address2					,Phone			,Fax				,Email				,Web ,Contact_Person ,Credit_Period ,Bank_Id ,Bank_Name ,Vend_Typ ,Brunch ,AC_Number ,VAT_Number ,Locked ,Create_User ,Create_Date  ,Company)			
	SELECT	LTRIM(RTRIM(Supp_Code)), LTRIM(RTRIM(Supp_Name)),''				  , LTRIM(RTRIM(Address1)), LTRIM(RTRIM(Address2)) ,LTRIM(RTRIM(Tel)), LTRIM(RTRIM(Fax)), LTRIM(RTRIM(Email)), '', ''			 ,0				, ''	 , ''		,'Purchase',''	  ,''		 ,''		 , 0	 ,@Create_User,CONVERT(NVARCHAR ,GETDATE(),103),@Comp FROM  Bestow_New.dbo.supplier WHERE Lock = 'F'

	INSERT INTO ACC_Customer( Code ,Cust_Name ,Address1 ,Address2 ,Phone ,Fax ,Email ,Web ,Cont_Person ,Credit_Period ,Credit_Limit ,NIC ,Bank ,Brunch ,AC_Number ,VAT_Number ,Type ,Area_Code ,Route_Code ,Locked ,User_Name ,Create_Date)
	SELECT		 LTRIM(RTRIM(Cust_Code)), LTRIM(RTRIM(Cust_Name)), LTRIM(RTRIM(Address1)), LTRIM(RTRIM(Address2)),LTRIM(RTRIM(Tel)), LTRIM(RTRIM(Fax)), LTRIM(RTRIM(Email)), '', '', 0, 0,'', '','','','','','','', 0,@Create_User,CONVERT(NVARCHAR ,GETDATE(),103) FROM  Bestow_New.dbo.Customer

	INSERT INTO ACC_Product( Code ,Prod_Name ,Dept_Code ,Cat_Code ,Supplier_Code ,Brand ,Purchase_price ,Selling_Price ,Discount_Price ,Unit ,Pack_Size ,Locked ,Cost_Code ,Margine ,Business_Type ,Tax_Id ,Vat_Id ,Expense_Acc ,Income_Acc ,Pic_Path  ,Create_Date ,Create_User ,Minus_Allow ,Under_Cost ,Discount,Modified_Date)
	SELECT LTRIM(RTRIM(Prod_Code)), LTRIM(RTRIM(Prod_Name)), LTRIM(RTRIM(Department_Id)), LTRIM(RTRIM(Category_Id)), LTRIM(RTRIM(Supplier_Id)), Brand_code,Purchase_price, Selling_Price, Disc_Price,'Nos' ,PACK_SIZE, 0,'', (((Selling_Price- Purchase_price) /CASE  Purchase_price WHEN 0 THEN 1 ELSE Purchase_price END) * 100),'','','','','','',CONVERT(NVARCHAR ,GETDATE(),103),@Create_User,'F','F','',''  FROM  Bestow_New.dbo.product WHERE LockedItem = 'F' 

	INSERT INTO ACC_Stock_Master( Prod_Code ,Comp_Code ,Qty ,Opening_Stock ,Reorder_Level ,Reorder_Qty ,User_Name ,Minus_Allow ,Under_Cost ,Create_Date )
	SELECT LTRIM(RTRIM(Prod_Code)), LTRIM(RTRIM(@Comp)), Qty, Qty, 1, 0, @Create_User,'F','F',CONVERT(NVARCHAR ,GETDATE(),103) FROM  Bestow_New.dbo.stock_master
	
	INSERT INTO ACC_Location( Comp_Code ,Code ,Loca_Name ,Address1 ,Address2 ,Phone ,Fax ,EMail ,User_Name ,Create_Date ,LastModUser ,LastModDate )
	SELECT 		LTRIM(RTRIM('')), LTRIM(RTRIM(Loca)), LTRIM(RTRIM(Loca_Descrip)),Address1 ,Address2 ,Tel  ,''   ,''    , @Create_User,CONVERT(NVARCHAR ,GETDATE(),103),'','' FROM  Bestow_New.dbo.Location
	
	SET	 @Message = 'Master file Downloaded Successfully'
	RETURN 0
END
GO

IF OBJECT_ID('dbo.ACC_sp_Download_Inv_Receipt') IS NULL EXEC('CREATE PROCEDURE dbo.ACC_sp_Download_Inv_Receipt AS BEGIN SET NOCOUNT ON; END')
GO
ALTER PROCEDURE [dbo].[ACC_sp_Download_Inv_Receipt]
	@Err_x			INT OUTPUT,
	@Create_User	NVARCHAR(20),
	@Comp			NVARCHAR(20),
	@Loca			NVARCHAR(3),
	@DateFrom		NVARCHAR(25),
	@DateTo			NVARCHAR(25),
	@Message		NVARCHAR(50) OUTPUT
AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRAN
	INSERT INTO ACC_Account_Transaction_Details( Doc_No,Post_Date,Vendor_ID,Company_ID,To_Comp,Iid   ,Acc_Code ,Acc_Name,Incom_Acc_Code,Amount,Credit,Memo             ,Cust_Job,Create_User)
	SELECT                   Org_Doc_No,Post_Date,Acc_Code ,@Comp     ,''     ,'NDP' ,'810-101',''      ,''            ,Amount,0     ,'Undipositedfund',''      ,@Create_User FROM dbo.ACC_Download_Inv_PaymentSummary WHERE	Loca = @Loca AND Download = 'F' AND Iid='REC' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
	IF (@@ERROR <> 0) GOTO PROBLEM
	INSERT INTO ACC_Account_Transaction_Details( Doc_No,Post_Date,Vendor_ID,Company_ID,To_Comp,Iid   ,Acc_Code ,Acc_Name,Incom_Acc_Code,Amount,Credit,Memo             ,Cust_Job,Create_User)
	SELECT                   Org_Doc_No,Post_Date,Acc_Code ,@Comp     ,''     ,'NDP' ,'800-101',''      ,''            ,0	 ,Amount     ,'Accounts Receivables',''      ,@Create_User FROM dbo.ACC_Download_Inv_PaymentSummary WHERE Loca = @Loca AND Download = 'F' AND Iid='REC' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
	IF (@@ERROR <> 0) GOTO PROBLEM
	INSERT INTO dbo.ACC_UnDepositedFund( Doc_No,Vendor_Id ,PayDoc_No ,Amount ,Balance ,Post_Date ,UserName    ,Iid  ,Comp_Id ,Pay_Type, Loca, Cheque_No, Cheque_Date)
	SELECT		   		Org_Doc_no,Acc_Code  ,''  	,Amount ,Amount  ,Post_Date ,@Create_User,'NDP',@Comp   ,Payment_Mode, Loca, Cheque_No, Cheque_Date	 FROM dbo.ACC_Download_Inv_PaymentSummary WHERE	Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
	IF (@@ERROR <> 0) GOTO PROBLEM
	UPDATE dbo.ACC_Download_Inv_PaymentSummary SET Download = 'T' WHERE Loca = @Loca AND Download = 'F' AND CONVERT(DATETIME,Post_Date,103) BETWEEN CONVERT(DATETIME,@DateFrom,103) AND CONVERT(DATETIME,@DateTo,103)
	IF (@@ERROR <> 0) GOTO PROBLEM
	SET @Message = 'Receipt Downloaded Successfully'
	COMMIT TRAN
	RETURN 0
	PROBLEM:
	IF(@@ERROR<>0)
	BEGIN
		SET @Err_x=@@ERROR
   		ROLLBACK TRAN
		RETURN  @Err_x
	END
END
GO
