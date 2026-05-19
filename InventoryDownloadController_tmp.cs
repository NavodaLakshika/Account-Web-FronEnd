using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace Acc_Web_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryDownloadController : ControllerBase
    {
        private readonly string _connectionString;

        public InventoryDownloadController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? "";
        }

        [HttpGet("locations")]
        public async Task<IActionResult> GetLocations()
        {
            try
            {
                var result = new List<object>();
                using (var conn = new SqlConnection(_connectionString))
                {
                    await conn.OpenAsync();
                    string sql = "SELECT Code, Loca_Name FROM ACC_Location ORDER BY Code";
                    using (var cmd = new SqlCommand(sql, conn))
                    {
                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                result.Add(new
                                {
                                    code = reader["Code"].ToString()?.Trim(),
                                    name = reader["Loca_Name"].ToString()?.Trim()
                                });
                            }
                        }
                    }
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("cost-centers")]
        public async Task<IActionResult> GetCostCenters()
        {
            try
            {
                var result = new List<object>();
                using (var conn = new SqlConnection(_connectionString))
                {
                    await conn.OpenAsync();
                    string sql = "SELECT CostCenterCode, CostCenterName FROM ACC_CostCenter ORDER BY CostCenterCode";
                    using (var cmd = new SqlCommand(sql, conn))
                    {
                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                result.Add(new
                                {
                                    code = reader["CostCenterCode"].ToString()?.Trim(),
                                    name = reader["CostCenterName"].ToString()?.Trim()
                                });
                            }
                        }
                    }
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("download-master")]
        public async Task<IActionResult> DownloadMaster([FromBody] DownloadRequest request)
        {
            try
            {
                using (var conn = new SqlConnection(_connectionString))
                {
                    await conn.OpenAsync();
                    using (var cmd = new SqlCommand("ACC_sp_Download_Inv_Masterfile", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@Create_User", request.UserName);
                        cmd.Parameters.AddWithValue("@Comp", request.CompCode);
                        
                        var errParam = new SqlParameter("@Err_x", SqlDbType.Int) { Direction = ParameterDirection.Output };
                        var msgParam = new SqlParameter("@Message", SqlDbType.NVarChar, 50) { Direction = ParameterDirection.Output };
                        
                        cmd.Parameters.Add(errParam);
                        cmd.Parameters.Add(msgParam);

                        await cmd.ExecuteNonQueryAsync();

                        string message = msgParam.Value?.ToString() ?? "Masterfile downloaded successfully";
                        return Ok(new { message });
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("download-purchase")]
        public async Task<IActionResult> DownloadPurchase([FromBody] DownloadRequest request)
        {
            return await ExecuteDownloadSP("ACC_sp_Download_Purchase", request);
        }

        [HttpPost("download-sales")]
        public async Task<IActionResult> DownloadSales([FromBody] DownloadRequest request)
        {
            return await ExecuteDownloadSP("ACC_sp_Download_Sales", request);
        }

        [HttpPost("download-receipt")]
        public async Task<IActionResult> DownloadReceipt([FromBody] DownloadRequest request)
        {
            return await ExecuteDownloadSP("ACC_sp_Download_Inv_Receipt", request);
        }

        private async Task<IActionResult> ExecuteDownloadSP(string spName, DownloadRequest request)
        {
            try
            {
                using (var conn = new SqlConnection(_connectionString))
                {
                    await conn.OpenAsync();
                    using (var cmd = new SqlCommand(spName, conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@Create_User", request.UserName);
                        cmd.Parameters.AddWithValue("@Comp", request.CompCode);
                        cmd.Parameters.AddWithValue("@Loca", request.LocationCode);
                        cmd.Parameters.AddWithValue("@DateFrom", request.DateFrom);
                        cmd.Parameters.AddWithValue("@DateTo", request.DateTo);
                        
                        var errParam = new SqlParameter("@Err_x", SqlDbType.Int) { Direction = ParameterDirection.Output };
                        var msgParam = new SqlParameter("@Message", SqlDbType.NVarChar, 50) { Direction = ParameterDirection.Output };
                        
                        cmd.Parameters.Add(errParam);
                        cmd.Parameters.Add(msgParam);

                        await cmd.ExecuteNonQueryAsync();

                        string message = msgParam.Value?.ToString() ?? "Process completed successfully";
                        return Ok(new { message });
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPost("save-download-excel")]
        public async Task<IActionResult> SaveDownloadExcel([FromBody] SaveExcelDownloadRequest request)
        {
            try
            {
                using (var conn = new SqlConnection(_connectionString))
                {
                    await conn.OpenAsync();
                    using (var trans = conn.BeginTransaction())
                    {
                        try
                        {
                            // 1. Delete existing undownloaded records in staging tables for this location code
                            if (request.Category == "Purchase" || request.Category == "Whole Sale" || request.Category == "Returned Cheques" || 
                                request.Category == "Credit Note Issued" || request.Category == "Credit Note Received")
                            {
                                string delHeader = "DELETE FROM ACC_Download_Inv_Trans_Header WHERE Loca = @Loca AND Download = 'F'";
                                using (var cmdDel = new SqlCommand(delHeader, conn, trans))
                                {
                                    cmdDel.Parameters.AddWithValue("@Loca", request.LocationCode);
                                    await cmdDel.ExecuteNonQueryAsync();
                                }
                                
                                string delDetails = "DELETE FROM ACC_Download_Inv_Trans_Details WHERE Loca = @Loca AND Download = 'F'";
                                using (var cmdDel = new SqlCommand(delDetails, conn, trans))
                                {
                                    cmdDel.Parameters.AddWithValue("@Loca", request.LocationCode);
                                    await cmdDel.ExecuteNonQueryAsync();
                                }
                            }
                            else if (request.Category == "Receipt")
                            {
                                string delSql = "DELETE FROM ACC_Download_Inv_PaymentSummary WHERE Loca = @Loca AND Download = 'F'";
                                using (var cmdDel = new SqlCommand(delSql, conn, trans))
                                {
                                    cmdDel.Parameters.AddWithValue("@Loca", request.LocationCode);
                                    await cmdDel.ExecuteNonQueryAsync();
                                }
                            }
                            else if (request.Category == "Retail")
                            {
                                string delSql = "DELETE FROM ACC_Download_Inv_PosSale WHERE Loca = @Loca AND Download = 'F'";
                                using (var cmdDel = new SqlCommand(delSql, conn, trans))
                                {
                                    cmdDel.Parameters.AddWithValue("@Loca", request.LocationCode);
                                    await cmdDel.ExecuteNonQueryAsync();
                                }
                            }
                            else if (request.Category == "Payroll Data")
                            {
                                string delSql = "DELETE FROM Accounts.dbo.ACC_Download_Payroll WHERE Loca = @Loca AND Download = 'F'";
                                using (var cmdDel = new SqlCommand(delSql, conn, trans))
                                {
                                    cmdDel.Parameters.AddWithValue("@Loca", request.LocationCode);
                                    await cmdDel.ExecuteNonQueryAsync();
                                }
                            }

                            // 2. Insert rows into staging tables
                            foreach (var row in request.Rows)
                            {
                                if (request.Category == "Purchase" || request.Category == "Credit Note Received")
                                {
                                    string suppId = await LookupSupplierCode(conn, trans, row.Name ?? "");
                                    string iid = request.Category == "Credit Note Received" ? "SRN" : (row.Type == "Return" ? "SRN" : "GRN");
                                    
                                    string insHeader = @"INSERT INTO ACC_Download_Inv_Trans_Header 
                                        (Doc_No, Post_Date, Supplier_Id, Iid, balance, Amount, Net_Amount, Loca, Download) 
                                        VALUES 
                                        (@Doc_No, @Post_Date, @Supplier_Id, @Iid, @balance, @Amount, @Net_Amount, @Loca, 'F')";
                                        
                                    using (var cmd = new SqlCommand(insHeader, conn, trans))
                                    {
                                        cmd.Parameters.AddWithValue("@Doc_No", row.DocNo ?? "");
                                        cmd.Parameters.AddWithValue("@Post_Date", row.Date ?? "");
                                        cmd.Parameters.AddWithValue("@Supplier_Id", suppId);
                                        cmd.Parameters.AddWithValue("@Iid", iid);
                                        cmd.Parameters.AddWithValue("@balance", row.Balance ?? 0);
                                        cmd.Parameters.AddWithValue("@Amount", row.Amount ?? 0);
                                        cmd.Parameters.AddWithValue("@Net_Amount", row.ToBeTransfer ?? row.Amount ?? 0);
                                        cmd.Parameters.AddWithValue("@Loca", request.LocationCode);
                                        await cmd.ExecuteNonQueryAsync();
                                    }

                                    string insDetails = @"INSERT INTO ACC_Download_Inv_Trans_Details 
                                        (Doc_No, Post_Date, Supplier_Id, Iid, Prod_Code, Prod_Name, Qty, Purchase_Price, Amount, Loca, Download) 
                                        VALUES 
                                        (@Doc_No, @Post_Date, @Supplier_Id, @Iid, 'DUMMY', 'DUMMY PRODUCT', 1, @Purchase_Price, @Amount, @Loca, 'F')";
                                        
                                    using (var cmd = new SqlCommand(insDetails, conn, trans))
                                    {
                                        cmd.Parameters.AddWithValue("@Doc_No", row.DocNo ?? "");
                                        cmd.Parameters.AddWithValue("@Post_Date", row.Date ?? "");
                                        cmd.Parameters.AddWithValue("@Supplier_Id", suppId);
                                        cmd.Parameters.AddWithValue("@Iid", iid);
                                        cmd.Parameters.AddWithValue("@Purchase_Price", row.ToBeTransfer ?? row.Amount ?? 0);
                                        cmd.Parameters.AddWithValue("@Amount", row.ToBeTransfer ?? row.Amount ?? 0);
                                        cmd.Parameters.AddWithValue("@Loca", request.LocationCode);
                                        await cmd.ExecuteNonQueryAsync();
                                    }
                                }
                                else if (request.Category == "Whole Sale" || request.Category == "Credit Note Issued")
                                {
                                    string custId = await LookupCustomerCode(conn, trans, row.Name ?? "");
                                    string iid = request.Category == "Credit Note Issued" ? "CUR" : (row.Type == "Return" ? "CUR" : "INV");
                                    
                                    string insHeader = @"INSERT INTO ACC_Download_Inv_Trans_Header 
                                        (Doc_No, Post_Date, Supplier_Id, Iid, Amount, Net_Amount, Loca, Download) 
                                        VALUES 
                                        (@Doc_No, @Post_Date, @Supplier_Id, @Iid, @Amount, @Net_Amount, @Loca, 'F')";
                                        
                                    using (var cmd = new SqlCommand(insHeader, conn, trans))
                                    {
                                        cmd.Parameters.AddWithValue("@Doc_No", row.DocNo ?? "");
                                        cmd.Parameters.AddWithValue("@Post_Date", row.Date ?? "");
                                        cmd.Parameters.AddWithValue("@Supplier_Id", custId);
                                        cmd.Parameters.AddWithValue("@Iid", iid);
                                        cmd.Parameters.AddWithValue("@Amount", row.Amount ?? 0);
                                        cmd.Parameters.AddWithValue("@Net_Amount", row.Amount ?? 0);
                                        cmd.Parameters.AddWithValue("@Loca", request.LocationCode);
                                        await cmd.ExecuteNonQueryAsync();
                                    }

                                    string insDetails = @"INSERT INTO ACC_Download_Inv_Trans_Details 
                                        (Doc_No, Post_Date, Supplier_Id, Iid, Prod_Code, Prod_Name, Qty, Purchase_Price, Amount, Loca, Download) 
                                        VALUES 
                                        (@Doc_No, @Post_Date, @Supplier_Id, @Iid, 'DUMMY', 'DUMMY PRODUCT', 1, @Purchase_Price, @Amount, @Loca, 'F')";
                                        
                                    using (var cmd = new SqlCommand(insDetails, conn, trans))
                                    {
                                        cmd.Parameters.AddWithValue("@Doc_No", row.DocNo ?? "");
                                        cmd.Parameters.AddWithValue("@Post_Date", row.Date ?? "");
                                        cmd.Parameters.AddWithValue("@Supplier_Id", custId);
                                        cmd.Parameters.AddWithValue("@Iid", iid);
                                        cmd.Parameters.AddWithValue("@Purchase_Price", row.Amount ?? 0);
                                        cmd.Parameters.AddWithValue("@Amount", row.Amount ?? 0);
                                        cmd.Parameters.AddWithValue("@Loca", request.LocationCode);
                                        await cmd.ExecuteNonQueryAsync();
                                    }
                                }
                                else if (request.Category == "Receipt")
                                {
                                    string insSql = @"INSERT INTO ACC_Download_Inv_PaymentSummary 
                                        (Org_Doc_No, Post_Date, Payment_Mode, Amount, Loca, Download, Iid) 
                                        VALUES 
                                        (@Org_Doc_No, @Post_Date, @Payment_Mode, @Amount, @Loca, 'F', 'REC')";
                                        
                                    using (var cmd = new SqlCommand(insSql, conn, trans))
                                    {
                                        cmd.Parameters.AddWithValue("@Org_Doc_No", row.DocNo ?? "");
                                        cmd.Parameters.AddWithValue("@Post_Date", row.Date ?? "");
                                        cmd.Parameters.AddWithValue("@Payment_Mode", row.PaymentMode ?? "");
                                        cmd.Parameters.AddWithValue("@Amount", row.Amount ?? 0);
                                        cmd.Parameters.AddWithValue("@Loca", request.LocationCode);
                                        await cmd.ExecuteNonQueryAsync();
                                    }
                                }
                                else if (request.Category == "Retail")
                                {
                                    string insSql = @"INSERT INTO ACC_Download_Inv_PosSale 
                                        (TransDocNo, Sale_Date, PosNet_Amt, PosCash_Amt, PosCredit_amt, Iid, Loca, Download) 
                                        VALUES 
                                        (@TransDocNo, @Sale_Date, @PosNet_Amt, @PosCash_Amt, @PosCredit_amt, @Iid, @Loca, 'F')";
                                        
                                    using (var cmd = new SqlCommand(insSql, conn, trans))
                                    {
                                        cmd.Parameters.AddWithValue("@TransDocNo", row.DocNo ?? row.Date ?? "");
                                        cmd.Parameters.AddWithValue("@Sale_Date", row.Date ?? "");
                                        cmd.Parameters.AddWithValue("@PosNet_Amt", row.Amount ?? 0);
                                        cmd.Parameters.AddWithValue("@PosCash_Amt", row.CashAmount ?? 0);
                                        cmd.Parameters.AddWithValue("@PosCredit_amt", row.CreditAmount ?? 0);
                                        cmd.Parameters.AddWithValue("@Iid", row.Type ?? "POS");
                                        cmd.Parameters.AddWithValue("@Loca", request.LocationCode);
                                        await cmd.ExecuteNonQueryAsync();
                                    }
                                }
                                else if (request.Category == "Returned Cheques")
                                {
                                    string insHeader = @"INSERT INTO ACC_Download_Inv_Trans_Header 
                                        (Doc_No, Post_Date, Inv_No, Amount, Iid, Loca, Download) 
                                        VALUES 
                                        (@Doc_No, @Post_Date, @Inv_No, @Amount, 'RRT', @Loca, 'F')";
                                        
                                    using (var cmd = new SqlCommand(insHeader, conn, trans))
                                    {
                                        cmd.Parameters.AddWithValue("@Doc_No", row.DocNo ?? "");
                                        cmd.Parameters.AddWithValue("@Post_Date", row.Date ?? "");
                                        cmd.Parameters.AddWithValue("@Inv_No", row.ChequeNo ?? "");
                                        cmd.Parameters.AddWithValue("@Amount", row.Amount ?? 0);
                                        cmd.Parameters.AddWithValue("@Loca", request.LocationCode);
                                        await cmd.ExecuteNonQueryAsync();
                                    }
                                }
                                else if (request.Category == "Payroll Data")
                                {
                                    string insSql = @"INSERT INTO Accounts.dbo.ACC_Download_Payroll 
                                        (PayYear, PayMonth, DeptCode, DeptName, BasicSal, Nopay, Allowance, Advance, Welfare, Loan, OtherDeduction, EPF12, EPF8, ETF, Loca, Post_Date, Create_User, Download) 
                                        VALUES 
                                        (@PayYear, @PayMonth, @DeptCode, @DeptName, @BasicSal, @Nopay, @Allowance, @Advance, @Welfare, @Loan, @OtherDeduction, @EPF12, @EPF8, @ETF, @Loca, @Post_Date, @Create_User, 'F')";
                                        
                                    using (var cmd = new SqlCommand(insSql, conn, trans))
                                    {
                                        cmd.Parameters.AddWithValue("@PayYear", row.PayYear ?? "");
                                        cmd.Parameters.AddWithValue("@PayMonth", row.PayMonth ?? "");
                                        cmd.Parameters.AddWithValue("@DeptCode", row.DeptCode ?? "");
                                        cmd.Parameters.AddWithValue("@DeptName", row.DeptName ?? "");
                                        cmd.Parameters.AddWithValue("@BasicSal", row.BasicSal ?? 0);
                                        cmd.Parameters.AddWithValue("@Nopay", row.NoPay ?? 0);
                                        cmd.Parameters.AddWithValue("@Allowance", row.Allowance ?? 0);
                                        cmd.Parameters.AddWithValue("@Advance", row.Advance ?? 0);
                                        cmd.Parameters.AddWithValue("@Welfare", row.Welfare ?? 0);
                                        cmd.Parameters.AddWithValue("@Loan", row.Loan ?? 0);
                                        cmd.Parameters.AddWithValue("@OtherDeduction", row.OtherDeduction ?? 0);
                                        cmd.Parameters.AddWithValue("@EPF12", row.EPF12 ?? 0);
                                        cmd.Parameters.AddWithValue("@EPF8", row.EPF8 ?? 0);
                                        cmd.Parameters.AddWithValue("@ETF", row.ETF ?? 0);
                                        cmd.Parameters.AddWithValue("@Loca", request.LocationCode);
                                        cmd.Parameters.AddWithValue("@Post_Date", DateTime.Now.ToString("dd/MM/yyyy"));
                                        cmd.Parameters.AddWithValue("@Create_User", request.UserName);
                                        await cmd.ExecuteNonQueryAsync();
                                    }
                                }
                            }

                            // Commit transaction
                            trans.Commit();
                            return Ok(new { message = "Staging data saved successfully. Click APPLY to process." });
                        }
                        catch (Exception ex)
                        {
                            trans.Rollback();
                            return BadRequest(new { message = ex.Message });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("apply-download")]
        public async Task<IActionResult> ApplyDownload([FromBody] SaveExcelDownloadRequest request)
        {
            try
            {
                using (var conn = new SqlConnection(_connectionString))
                {
                    await conn.OpenAsync();
                    using (var trans = conn.BeginTransaction())
                    {
                        try
                        {
                            // 1. Determine SP name based on category
                            string spName = "";
                            if (request.Category == "Purchase" || request.Category == "Credit Note Received") spName = "ACC_sp_Download_Purchase";
                            else if (request.Category == "Whole Sale" || request.Category == "Credit Note Issued") spName = "ACC_sp_Download_Sales";
                            else if (request.Category == "Receipt") spName = "ACC_sp_Download_Inv_Receipt";
                            else if (request.Category == "Retail") spName = "ACC_sp_Download_Inv_PosSale";
                            else if (request.Category == "Returned Cheques") spName = "ACC_sp_Download_Inv_ChequeReturn";
                            else if (request.Category == "Payroll Data") spName = "ACC_sp_Download_PayrollData";

                            string message = "Process completed successfully";
                            if (!string.IsNullOrEmpty(spName))
                            {
                                using (var cmd = new SqlCommand(spName, conn, trans))
                                {
                                    cmd.CommandType = CommandType.StoredProcedure;
                                    cmd.Parameters.AddWithValue("@Create_User", request.UserName);
                                    cmd.Parameters.AddWithValue("@Comp", request.CompCode);
                                    cmd.Parameters.AddWithValue("@Loca", request.LocationCode);
                                    cmd.Parameters.AddWithValue("@DateFrom", request.DateFrom);
                                    cmd.Parameters.AddWithValue("@DateTo", request.DateTo);
                                    
                                    var errParam = new SqlParameter("@Err_x", SqlDbType.Int) { Direction = ParameterDirection.Output };
                                    var msgParam = new SqlParameter("@Message", SqlDbType.NVarChar, 50) { Direction = ParameterDirection.Output };
                                    
                                    cmd.Parameters.Add(errParam);
                                    cmd.Parameters.Add(msgParam);

                                    await cmd.ExecuteNonQueryAsync();
                                    message = msgParam.Value?.ToString() ?? "Process completed successfully";
                                }
                            }

                            // 2. Perform post-SP manual overrides for specific categories
                            foreach (var row in request.Rows)
                            {
                                if (request.Category == "Purchase" || request.Category == "Credit Note Received")
                                {
                                    // Update CostCenter and ToBeTransfer on ACC_Transaction_Header
                                    string updHeader = @"UPDATE ACC_Transaction_Header 
                                        SET CostCenter = @CostCenter, 
                                            Net_Amount = @ToBeTransfer,
                                            Amount = @Amount
                                        WHERE Doc_No = @DocNo AND (Iid = 'GRN' OR Iid = 'PRN' OR Iid = 'SRN')";
                                    using (var cmd = new SqlCommand(updHeader, conn, trans))
                                    {
                                        cmd.Parameters.AddWithValue("@CostCenter", row.CostCenter ?? request.CostCenterCode ?? "");
                                        cmd.Parameters.AddWithValue("@ToBeTransfer", row.ToBeTransfer ?? row.Amount ?? 0);
                                        cmd.Parameters.AddWithValue("@Amount", row.Amount ?? 0);
                                        cmd.Parameters.AddWithValue("@DocNo", row.DocNo ?? "");
                                        await cmd.ExecuteNonQueryAsync();
                                    }

                                    // Update ACC_Paybll_Sumary
                                    string updPayable = @"UPDATE ACC_Paybll_Sumary
                                        SET Amount_Due = @ToBeTransfer,
                                            Balance = @ToBeTransfer
                                        WHERE Doc_No = @DocNo AND (Iid = 'GRN' OR Iid = 'PRN' OR Iid = 'SRN')";
                                    using (var cmd = new SqlCommand(updPayable, conn, trans))
                                    {
                                        cmd.Parameters.AddWithValue("@ToBeTransfer", row.ToBeTransfer ?? row.Amount ?? 0);
                                        cmd.Parameters.AddWithValue("@DocNo", row.DocNo ?? "");
                                        await cmd.ExecuteNonQueryAsync();
                                    }
                                }
                                else if (request.Category == "Whole Sale" || request.Category == "Credit Note Issued")
                                {
                                    // Update CostCenter on ACC_Transaction_Header
                                    string updHeader = @"UPDATE ACC_Transaction_Header 
                                        SET CostCenter = @CostCenter
                                        WHERE Doc_No = @DocNo AND (Iid = 'INV' OR Iid = 'CUR' OR Iid = 'SRN')";
                                    using (var cmd = new SqlCommand(updHeader, conn, trans))
                                    {
                                        cmd.Parameters.AddWithValue("@CostCenter", request.CostCenterCode ?? "");
                                        cmd.Parameters.AddWithValue("@DocNo", row.DocNo ?? "");
                                        await cmd.ExecuteNonQueryAsync();
                                    }
                                }
                            }

                            trans.Commit();
                            return Ok(new { message });
                        }
                        catch (Exception ex)
                        {
                            trans.Rollback();
                            return BadRequest(new { message = ex.Message });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private async Task<string> LookupSupplierCode(SqlConnection conn, SqlTransaction trans, string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return "VND0001";
            string sql = "SELECT TOP 1 Code FROM ACC_Supplier WHERE Supplier_Name = @Name OR Code = @Name";
            using (var cmd = new SqlCommand(sql, conn, trans))
            {
                cmd.Parameters.AddWithValue("@Name", name.Trim());
                var res = await cmd.ExecuteScalarAsync();
                return res?.ToString()?.Trim() ?? "VND0001";
            }
        }

        private async Task<string> LookupCustomerCode(SqlConnection conn, SqlTransaction trans, string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return "CUS-0001";
            string sql = "SELECT TOP 1 Code FROM ACC_Customer WHERE Cust_Name = @Name OR Code = @Name";
            using (var cmd = new SqlCommand(sql, conn, trans))
            {
                cmd.Parameters.AddWithValue("@Name", name.Trim());
                var res = await cmd.ExecuteScalarAsync();
                return res?.ToString()?.Trim() ?? "CUS-0001";
            }
        }
    }

    public class DownloadRequest
    {
        public string UserName { get; set; } = "";
        public string CompCode { get; set; } = "";
        public string LocationCode { get; set; } = "";
        public string DateFrom { get; set; } = "";
        public string DateTo { get; set; } = "";
    }

    public class SaveExcelDownloadRequest
    {
        public string Category { get; set; } = "";
        public string LocationCode { get; set; } = "";
        public string CostCenterCode { get; set; } = "";
        public string DateFrom { get; set; } = "";
        public string DateTo { get; set; } = "";
        public string UserName { get; set; } = "";
        public string CompCode { get; set; } = "";
        public List<ExcelRowData> Rows { get; set; } = new();
    }

    public class ExcelRowData
    {
        public string? DocNo { get; set; }
        public string? Date { get; set; }
        public string? Name { get; set; }
        public decimal? Amount { get; set; }
        public string? Type { get; set; }
        public string? CostCenter { get; set; }
        public decimal? ToBeTransfer { get; set; }
        public decimal? Balance { get; set; }
        public string? PaymentMode { get; set; }
        public decimal? SaleAmount { get; set; }
        public decimal? CashAmount { get; set; }
        public decimal? CreditAmount { get; set; }
        public string? ChequeNo { get; set; }
        public string? PayYear { get; set; }
        public string? PayMonth { get; set; }
        public string? DeptCode { get; set; }
        public string? DeptName { get; set; }
        public decimal? BasicSal { get; set; }
        public decimal? NoPay { get; set; }
        public decimal? Allowance { get; set; }
        public decimal? Advance { get; set; }
        public decimal? Welfare { get; set; }
        public decimal? Loan { get; set; }
        public decimal? OtherDeduction { get; set; }
        public decimal? EPF12 { get; set; }
        public decimal? EPF8 { get; set; }
        public decimal? ETF { get; set; }
    }
}
