import re

file_path = r"e:\Project\Accounts\Acc-Web_BackEnd\backend\Account-Web-Backend\Acc-Web-API\Controllers\ReportController.cs"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the definition of ExecuteFinancialReportSP completely using a simpler regex
old_def_pattern = re.compile(
    r'private async Task<IActionResult> ExecuteFinancialReportSP\(string spName, string companyId, DateTime\? startDate, DateTime\? endDate\).*?if \(connection\.State != ConnectionState\.Open\)',
    re.DOTALL
)

new_def = '''private async Task<IActionResult> ExecuteFinancialReportSP(string spName, string companyId, string startDate, string endDate)
        {
            if (string.IsNullOrEmpty(companyId))
            {
                return BadRequest("Company ID is required to fetch report data.");
            }

            try
            {
                var result = new List<Dictionary<string, object>>();
                var connection = _context.Database.GetDbConnection();
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = spName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    
                    cmd.Parameters.Add(new SqlParameter("@CompanyId", companyId));
                        
                    if (!string.IsNullOrEmpty(startDate))
                        cmd.Parameters.Add(new SqlParameter("@StartDate", startDate));
                        
                    if (!string.IsNullOrEmpty(endDate))
                        cmd.Parameters.Add(new SqlParameter("@EndDate", endDate));

                    if (connection.State != ConnectionState.Open)'''

content = old_def_pattern.sub(new_def, content)

# Update all route methods again in case it failed
content = re.sub(
    r'public async Task<IActionResult> (\w+)\(\[FromQuery\] string companyId\)',
    r'public async Task<IActionResult> \1([FromQuery] string companyId, [FromQuery] string startDate = null, [FromQuery] string endDate = null)',
    content
)

# Update the calls inside the methods again in case it failed
content = re.sub(
    r'return await ExecuteFinancialReportSP\("([^"]+)", companyId, null, null\);',
    r'return await ExecuteFinancialReportSP("\1", companyId, startDate, endDate);',
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
