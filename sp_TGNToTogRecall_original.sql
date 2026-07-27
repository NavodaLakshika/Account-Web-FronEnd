

--exec [dbo].[sp_TGNToTogRecall] 0,'06','AGN06002754','TGN01009179','TGN'





CREATE PROCEDURE [dbo].[sp_TGNToTogRecall]



	@Err_x  As Int OutPut,

	@Loca			nvarchar(5),

	@TempDocNo		nvarchar(15),

	@TGNNo		nvarchar(15),

	@Iid			nvarchar(5),

	@SellingPriceTF	BIT=1





	AS

	SET NOCOUNT ON



	DECLARE @Errorsave int

	SET @ErrorSave=0

	BEGIN TRAN



	--Delete Temporary Details

	DELETE tbTempTransactionStockUpdate WHERE tbTempTransactionStockUpdate.Doc_No = @TempDocNo AND iid = @Iid

		IF @@Error <> 0  SET @ErrorSave=@@Error



	DELETE TransactionTemp_Details WHERE Doc_No = @TempDocNo AND iid = @Iid AND Loca = @Loca

		IF @@Error <> 0  SET @ErrorSave=@@Error



	DELETE TransactionTemp_Details WHERE Doc_No = @TempDocNo AND iid = 'AGN' AND Loca = @Loca

		IF @@Error <> 0  SET @ErrorSave=@@Error



		-- BY (L) 

		--ADD NORMAL (NON DUAL MEASURE) PRODUCTS

		IF @SellingPriceTF=1

		BEGIN

			INSERT INTO TransactionTemp_Details(Doc_No,  Loca, To_Loca, Iid, Post_Date, Prod_Code, Prod_Name, Qty, FreeQty, Purchase_Price, Selling_Price, Unit, Disc, Discount, Pack_Size, Amount, Ln,ToLoca_Qty,Loca_Unit,To_Loca_Unit)

			SELECT @TempDocNo,  DL.Loca, DL.To_Loca, 'AGN', DL.Post_Date, DL.Prod_Code, DL.Prod_Name, DL.Qty, DL.FreeQty, DL.Purchase_Price, DL.Selling_Price, DL.Unit, DL.Disc, DL.Discount, DL.Pack_Size, (DL.Selling_Price * DL.Qty), Ln, DL.Qty,'','' 

			FROM DL_Transaction_Details  DL LEFT JOIN Product ON DL.Prod_Code= Product.Prod_Code  LEFT JOIN ProductColourSize ON DL.Prod_Code = ProductColourSize.Prod_CodeCol_Siz AND Product.Prod_Code = ProductColourSize.Prod_Code and DL.To_Loca = ProductColourSiz
e.Loca   WHERE Doc_No = @TGNNo AND To_Loca = @Loca AND iid = 'TGN' AND DL.Prod_Code

			NOT IN (select Distinct Prod_Code  from tb_MeasureSelect) /*AND ISNULL(Product.MeasureProd,'F') = 'F'*/

			IF @@Error <> 0  SET @ErrorSave=@@Error

			print 'okkkk'

		END

		ELSE

		BEGIN

			INSERT INTO TransactionTemp_Details(Doc_No,  Loca, To_Loca, Iid, Post_Date, Prod_Code, Prod_Name, Qty, FreeQty, Purchase_Price, Selling_Price, Unit, Disc, Discount, Pack_Size, Amount, Ln,ToLoca_Qty,Loca_Unit,To_Loca_Unit)

			SELECT @TempDocNo,  DL.Loca, DL.To_Loca, 'AGN', DL.Post_Date, DL.Prod_Code, DL.Prod_Name, DL.Qty, DL.FreeQty, DL.Purchase_Price, DL.Selling_Price, DL.Unit, DL.Disc, DL.Discount, DL.Pack_Size, (DL.Purchase_Price * DL.Qty), Ln, DL.Qty,'','' FROM DL_Trans
action_Details  DL LEFT JOIN Product ON DL.Prod_Code= Product.Prod_Code  LEFT JOIN ProductColourSize ON DL.Prod_Code = ProductColourSize.Prod_CodeCol_Siz AND Product.Prod_Code = ProductColourSize.Prod_Code and DL.To_Loca = ProductColourSize.Loca   WHERE D
oc_No = @TGNNo AND To_Loca = @Loca AND iid = 'TGN'  AND DL.Prod_Code NOT IN (select Distinct Prod_Code  from tb_MeasureSelect) /*AND ISNULL(Product.MeasureProd,'F') = 'F'*/

			IF @@Error <> 0  SET @ErrorSave=@@Error

		END



		DECLARE @To_LocaType nvarchar(20)

		DECLARE @LocaType nvarchar(20)

		SET @To_LocaType = (SELECT DISTINCT Loca_Type FROM Location where Loca = @Loca)

		SET @LocaType = (SELECT DISTINCT Loca_Type FROM Location where Loca = (SELECT DISTINCT Loca FROM DL_Transaction_Details WHERE Doc_No = @TGNNo AND To_Loca = @Loca AND iid = 'TGN' ))

		IF (@To_LocaType = @LocaType)

		BEGIN

				--ADD SAME LOCA TYPE (DUAL MEASURE) PRODUCTS

				IF @SellingPriceTF=1

				BEGIN

					INSERT INTO TransactionTemp_Details(Doc_No,  Loca, To_Loca, Iid, Post_Date, Prod_Code, Prod_Name, Qty, FreeQty, Purchase_Price, Selling_Price, Unit, Disc, Discount, Pack_Size, Amount, Ln,ToLoca_Qty,Loca_Unit,To_Loca_Unit)

					SELECT @TempDocNo,  DL.Loca, DL.To_Loca, 'AGN', DL.Post_Date, DL.Prod_Code, DL.Prod_Name, DL.Qty, DL.FreeQty, DL.Purchase_Price, DL.Selling_Price, DL.Unit, DL.Disc, DL.Discount, DL.Pack_Size, (DL.Selling_Price * DL.Qty), Ln, DL.Qty,'','' FROM DL_Tran
saction_Details  DL LEFT JOIN Product ON Product.Prod_Code = DL.Prod_Code  LEFT JOIN ProductColourSize ON Product.Prod_Code = ProductColourSize.Prod_Code and DL.Prod_Code = ProductColourSize.Prod_CodeCol_Siz and DL.To_Loca = ProductColourSize.Loca  INNER 
JOIN tb_MeasureSelect  ON tb_MeasureSelect.Prod_Code = DL.Prod_Code  WHERE Doc_No = @TGNNo AND To_Loca = @Loca AND iid = 'TGN' /*AND Product.MeasureProd = 'T' */

					IF @@Error <> 0  SET @ErrorSave=@@Error

					print 'ok2'

				END

				ELSE

				BEGIN

					INSERT INTO TransactionTemp_Details(Doc_No,  Loca, To_Loca, Iid, Post_Date, Prod_Code, Prod_Name, Qty, FreeQty, Purchase_Price, Selling_Price, Unit, Disc, Discount, Pack_Size, Amount, Ln,ToLoca_Qty,Loca_Unit,To_Loca_Unit)

					SELECT @TempDocNo,  DL.Loca, DL.To_Loca, 'AGN', DL.Post_Date, DL.Prod_Code, DL.Prod_Name, DL.Qty, DL.FreeQty, DL.Purchase_Price, DL.Selling_Price, DL.Unit, DL.Disc, DL.Discount, DL.Pack_Size, (DL.Purchase_Price * DL.Qty), Ln, DL.Qty,'','' FROM DL_Tra
nsaction_Details  DL LEFT JOIN Product ON Product.Prod_Code = DL.Prod_Code  LEFT JOIN ProductColourSize ON Product.Prod_Code = ProductColourSize.Prod_Code and DL.Prod_Code = ProductColourSize.Prod_CodeCol_Siz and DL.To_Loca = ProductColourSize.Loca  INNER
 JOIN tb_MeasureSelect  ON tb_MeasureSelect.Prod_Code = DL.Prod_Code  WHERE Doc_No = @TGNNo AND To_Loca = @Loca AND iid = 'TGN' /*AND Product.MeasureProd = 'T' */

					IF @@Error <> 0  SET @ErrorSave=@@Error

					print 'okkkk2'

				END

		END

		IF(@LocaType = 'WHOLESALE' AND @To_LocaType = 'RETAIL')

		BEGIN



				--ADD  (DUAL MEASURE) PRODUCTS

				IF @SellingPriceTF=1

				BEGIN

					INSERT INTO TransactionTemp_Details(Doc_No,  Loca, To_Loca, Iid, Post_Date, Prod_Code, Prod_Name, Qty, FreeQty, Purchase_Price, Selling_Price, Unit, Disc, Discount, Pack_Size, Amount, Ln,ToLoca_Qty,Loca_Unit,To_Loca_Unit)

					SELECT @TempDocNo,  DL.Loca, DL.To_Loca, 'AGN', DL.Post_Date, DL.Prod_Code, DL.Prod_Name, DL.Qty, DL.FreeQty, DL.Purchase_Price, DL.Selling_Price, DL.Unit, DL.Disc, DL.Discount, DL.Pack_Size, (DL.Selling_Price * DL.Qty), Ln, DL.Qty  *  (WhlQty / RetQ
ty) Qty,RetUnit,WhlUnit FROM DL_Transaction_Details  DL LEFT JOIN Product ON Product.Prod_Code = DL.Prod_Code  LEFT JOIN ProductColourSize ON Product.Prod_Code = ProductColourSize.Prod_Code and DL.Prod_Code = ProductColourSize.Prod_CodeCol_Siz  and DL.To_
Loca = ProductColourSize.Loca  INNER JOIN tb_MeasureSelect  ON tb_MeasureSelect.Prod_Code = DL.Prod_Code  WHERE Doc_No = @TGNNo AND To_Loca = @Loca AND iid = 'TGN' /*AND Product.MeasureProd = 'T' */

					IF @@Error <> 0  SET @ErrorSave=@@Error

					print 'ok3'

				END

				ELSE

				BEGIN

					INSERT INTO TransactionTemp_Details(Doc_No,  Loca, To_Loca, Iid, Post_Date, Prod_Code, Prod_Name, Qty, FreeQty, Purchase_Price, Selling_Price, Unit, Disc, Discount, Pack_Size, Amount, Ln,ToLoca_Qty,Loca_Unit,To_Loca_Unit)

					SELECT @TempDocNo,  DL.Loca, DL.To_Loca, 'AGN', DL.Post_Date, DL.Prod_Code, DL.Prod_Name, DL.Qty, DL.FreeQty, DL.Purchase_Price, DL.Selling_Price, DL.Unit, DL.Disc, DL.Discount, DL.Pack_Size, (DL.Purchase_Price * DL.Qty), Ln, DL.Qty  *  (WhlQty / Ret
Qty) Qty,RetUnit,WhlUnit FROM DL_Transaction_Details  DL LEFT JOIN Product ON Product.Prod_Code = DL.Prod_Code  LEFT JOIN ProductColourSize ON Product.Prod_Code = ProductColourSize.Prod_Code and DL.Prod_Code = ProductColourSize.Prod_CodeCol_Siz  and DL.To
_Loca = ProductColourSize.Loca  INNER JOIN tb_MeasureSelect  ON tb_MeasureSelect.Prod_Code = DL.Prod_Code  WHERE Doc_No = @TGNNo AND To_Loca = @Loca AND iid = 'TGN' /*AND Product.MeasureProd = 'T' */

					IF @@Error <> 0  SET @ErrorSave=@@Error

					print 'okkkk3'

				END

				--INSERT INTO Dl_Transaction_Details(Doc_No, Loca, To_Loca, To_LocaDesc, Iid, Post_Date, Prod_Code, Prod_Name, Qty, Purchase_Price, Selling_Price, Amount, Ln,[User_Name],code)

				--SELECT @OrgDoc_No, @Loca, @To_Loca, @To_LocaDesc, Iid, @Post_Date,  TransactionTemp_Details.Prod_Code,  TransactionTemp_Details.Prod_Name, Qty *  (WhlQty * RetQty),  TransactionTemp_Details.Purchase_Price,  TransactionTemp_Details.Selling_Price, Amo
unt, Ln, @User_Name,code FROM TransactionTemp_Details INNER JOIN Product ON Product.Prod_Code = TransactionTemp_Details.Prod_Code INNER JOIN tb_MeasureSelect  ON tb_MeasureSelect.Prod_Code = TransactionTemp_Details.Prod_Code  WHERE Doc_No = @TempDocNo AND
 iid = @Iid AND Loca = @Loca AND Product.MeasureProd = 'T' 

				--IF @@Error <> 0  SET @ErrorSave=@@Error



		END

		IF(@LocaType = 'RETAIL' AND @To_LocaType = 'WHOLESALE' )

		BEGIN

				--ADD  (DUAL MEASURE) PRODUCTS

				IF @SellingPriceTF=1

				BEGIN

					INSERT INTO TransactionTemp_Details(Doc_No,  Loca, To_Loca, Iid, Post_Date, Prod_Code, Prod_Name, Qty, FreeQty, Purchase_Price, Selling_Price, Unit, Disc, Discount, Pack_Size, Amount, Ln,ToLoca_Qty,Loca_Unit,To_Loca_Unit)

					SELECT @TempDocNo,  DL.Loca, DL.To_Loca, 'AGN', DL.Post_Date, DL.Prod_Code, DL.Prod_Name, DL.Qty, DL.FreeQty, DL.Purchase_Price, DL.Selling_Price, DL.Unit, DL.Disc, DL.Discount, DL.Pack_Size, (DL.Selling_Price * DL.Qty), Ln, DL.Qty  *  (WhlQty * RetQ
ty) Qty,WhlUnit,RetUnit FROM DL_Transaction_Details  DL LEFT JOIN Product ON Product.Prod_Code = DL.Prod_Code  LEFT JOIN ProductColourSize ON Product.Prod_Code = ProductColourSize.Prod_Code and DL.Prod_Code = ProductColourSize.Prod_CodeCol_Siz  and DL.To_
Loca = ProductColourSize.Loca   INNER JOIN tb_MeasureSelect  ON tb_MeasureSelect.Prod_Code = DL.Prod_Code   WHERE Doc_No = @TGNNo AND To_Loca = @Loca AND iid = 'TGN' /*AND Product.MeasureProd = 'T' */

					IF @@Error <> 0  SET @ErrorSave=@@Error

					print 'ok4'

				END

				ELSE

				BEGIN

					INSERT INTO TransactionTemp_Details(Doc_No,  Loca, To_Loca, Iid, Post_Date, Prod_Code, Prod_Name, Qty, FreeQty, Purchase_Price, Selling_Price, Unit, Disc, Discount, Pack_Size, Amount, Ln,ToLoca_Qty,Loca_Unit,To_Loca_Unit)

					SELECT @TempDocNo,  DL.Loca, DL.To_Loca, 'AGN', DL.Post_Date, DL.Prod_Code, DL.Prod_Name, DL.Qty, DL.FreeQty, DL.Purchase_Price, DL.Selling_Price, DL.Unit, DL.Disc, DL.Discount, DL.Pack_Size, (DL.Purchase_Price * DL.Qty), Ln, DL.Qty  *  (WhlQty * Ret
Qty) Qty,WhlUnit,RetUnit FROM DL_Transaction_Details  DL LEFT JOIN Product ON Product.Prod_Code = DL.Prod_Code  LEFT JOIN ProductColourSize ON Product.Prod_Code = ProductColourSize.Prod_Code and DL.Prod_Code = ProductColourSize.Prod_CodeCol_Siz  and DL.To
_Loca = ProductColourSize.Loca   INNER JOIN tb_MeasureSelect  ON tb_MeasureSelect.Prod_Code = DL.Prod_Code   WHERE Doc_No = @TGNNo AND To_Loca = @Loca AND iid = 'TGN' /*AND Product.MeasureProd = 'T' */

					IF @@Error <> 0  SET @ErrorSave=@@Error

					print 'okkkk4'

				END

				--INSERT INTO Dl_Transaction_Details(Doc_No, Loca, To_Loca, To_LocaDesc, Iid, Post_Date, Prod_Code, Prod_Name, Qty, Purchase_Price, Selling_Price, Amount, Ln,[User_Name],code)

				--SELECT @OrgDoc_No, @Loca, @To_Loca, @To_LocaDesc, Iid, @Post_Date, TransactionTemp_Details.Prod_Code,  TransactionTemp_Details.Prod_Name, Qty *  (WhlQty / RetQty),  TransactionTemp_Details.Purchase_Price,  TransactionTemp_Details.Selling_Price, Amou
nt, Ln, @User_Name,code FROM TransactionTemp_Details INNER JOIN Product ON Product.Prod_Code = TransactionTemp_Details.Prod_Code INNER JOIN tb_MeasureSelect  ON tb_MeasureSelect.Prod_Code = TransactionTemp_Details.Prod_Code  WHERE Doc_No = @TempDocNo AND 
iid = @Iid AND Loca = @Loca AND Product.MeasureProd = 'T' 

				--IF @@Error <> 0  SET @ErrorSave=@@Error

				--INSERT INTO tbTempTransactionStockUpdate(Prod_Code, Qty, Loca, Doc_No, iid)

				--SELECT TransactionTemp_Details.Prod_Code, ISNULL(SUM(Qty), 0) *  (WhlQty / RetQty), @To_Loca, @OrgDoc_No, @Iid FROM  TransactionTemp_Details INNER JOIN Product ON Product.Prod_Code = TransactionTemp_Details.Prod_Code INNER JOIN tb_MeasureSelect  ON 
tb_MeasureSelect.Prod_Code = TransactionTemp_Details.Prod_Code  WHERE Doc_No = @TempDocNo AND iid = @Iid AND To_Loca = @To_Loca AND Product.MeasureProd = 'T' GROUP BY TransactionTemp_Details.Prod_Code,WhlQty,RetQty

				--IF @@Error <> 0  GOTO PROBLEM

		END





	IF @ErrorSave<> 0 

		ROLLBACK TRAN

	ELSE

		COMMIT TRAN

		SET  @Err_x =@Errorsave



	 	RETURN @Err_x

