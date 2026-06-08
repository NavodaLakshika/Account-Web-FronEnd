import re

file_path = r"e:\Project\Accounts\Acc-Web_BackEnd\backend\Account-Web-Backend\Acc-Web-API\Controllers\ReportController.cs"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Revert ExecuteFinancialReportSP to accept DateTime?
old_def = '''private async Task<IActionResult> ExecuteFinancialReportSP(string spName, string companyId, string startDate, string endDate)
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

new_def = '''private async Task<IActionResult> ExecuteFinancialReportSP(string spName, string companyId, DateTime? startDate, DateTime? endDate)
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
                        
                    if (startDate.HasValue)
                        cmd.Parameters.Add(new SqlParameter("@StartDate", startDate.Value));
                        
                    if (endDate.HasValue)
                        cmd.Parameters.Add(new SqlParameter("@EndDate", endDate.Value));

                    if (connection.State != ConnectionState.Open)'''

content = content.replace(old_def, new_def)

# 2. Change all the [FromQuery] string startDate = null, [FromQuery] string endDate = null to DateTime?
content = content.replace(
    '[FromQuery] string startDate = null, [FromQuery] string endDate = null',
    '[FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null'
)

# 3. For Balance Sheet and Trial Balance, they pass `null, asOfDate`. The compiler expects DateTime? for both.
# We don't need to change them because `null` can implicitly convert to `DateTime?`. 
# Wait, the compiler errors were: 
# Argument 3: cannot convert from 'System.DateTime?' to 'string'
# Argument 4: cannot convert from 'System.DateTime?' to 'string'
# This was because ExecuteFinancialReportSP expected strings. Now it expects DateTime?, so they will compile fine.

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
