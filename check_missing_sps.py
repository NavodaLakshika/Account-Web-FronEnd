import re
import subprocess

with open(r"e:\Project\Accounts\Acc-Web_BackEnd\backend\Account-Web-Backend\Acc-Web-API\Controllers\ReportController.cs", "r") as f:
    content = f.read()

sps = set(re.findall(r'"dbo\.(ACC_sp_Get[^"]+)"', content))
print(f"Total SPs in Controller: {len(sps)}")

missing = []
for sp in sorted(sps):
    cmd = f'sqlcmd -S 192.168.1.7\\onimtait -U sa -P "it@onimta1+" -d Acc_Web -h -1 -W -Q "IF OBJECT_ID(\'dbo.{sp}\', \'P\') IS NULL PRINT \'MISSING\'"'
    try:
        out = subprocess.check_output(cmd, shell=True, text=True).strip()
        if 'MISSING' in out:
            missing.append(sp)
    except Exception as e:
        print(f"Error checking {sp}: {e}")

print("Missing SPs:")
for m in missing:
    print(m)
