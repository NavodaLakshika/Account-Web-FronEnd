import re
import subprocess

categories = [
    "Business overview", "Who owes you", "Inventory", "Sales and customers",
    "What you owe", "Expenses and suppliers", "Sales tax", "Employees",
    "For my accountant", "Payroll", "Time", "NEW", "Learn more about QuickBooks Payroll"
]

user_reports = []
with open("user_reports_list.txt", "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line or line in categories: continue
        user_reports.append(line)

# Clean duplicates while preserving case for the summary
unique_reports = []
seen = set()
for r in user_reports:
    if r.lower() not in seen:
        unique_reports.append(r)
        seen.add(r.lower())

# Read ReportController.cs
with open(r"e:\Project\Accounts\Acc-Web_BackEnd\backend\Account-Web-Backend\Acc-Web-API\Controllers\ReportController.cs", "r", encoding="utf-8") as f:
    controller_content = f.read()

# Get existing SPs from SQL
sql_cmd = 'sqlcmd -S 192.168.1.7\\onimtait -U sa -P "it@onimta1+" -d Acc_Web -Q "SELECT name FROM sys.procedures WHERE name LIKE \'ACC_sp_Get%\'" -W -h -1'
result = subprocess.run(sql_cmd, shell=True, capture_output=True, text=True)
sps = result.stdout.lower()

def to_csharp_method(name):
    # e.g. "Profit and Loss" -> "GetProfitAndLoss"
    clean = re.sub(r'[^a-zA-Z0-9 ]', '', name)
    words = clean.split()
    return "Get" + "".join(w.capitalize() for w in words)

def to_sp_name(name):
    clean = re.sub(r'[^a-zA-Z0-9 ]', '', name)
    words = clean.split()
    return "acc_sp_get" + "".join(w.capitalize() for w in words).lower()

missing_backend = []
missing_sps = []

for report in unique_reports:
    method = to_csharp_method(report)
    sp = to_sp_name(report)
    
    if method not in controller_content:
        missing_backend.append(report)
        
    if sp not in sps:
        missing_sps.append(report)

print(f"Total Unique Reports Requested: {len(unique_reports)}")
print(f"\nMissing from Backend C# Controller: {len(missing_backend)}")
for m in missing_backend: print("-", m)

print(f"\nMissing from SQL Server SPs: {len(missing_sps)}")
for m in missing_sps: print("-", m)
