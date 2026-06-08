import re

# Read reports from UI menu
with open(r"C:\Users\LENOVO\.gemini\antigravity-ide\brain\299bfe48-11b3-4c24-b6fc-e39ab5e5c81e\reports_menu.txt", "r") as f:
    ui_content = f.read()

# Extract all UI labels
ui_labels = re.findall(r"label:\s*'([^']+)'", ui_content)
# Convert to a set of formatted SP names we expect
expected_sps = set()
for label in ui_labels:
    # Convert 'Account List' to 'ACC_sp_GetAccountList'
    sp_name = "ACC_sp_Get" + "".join([w.capitalize() for w in re.sub(r'[^a-zA-Z0-9\s]', '', label).split()])
    expected_sps.add(sp_name)

# Read backend controller SPs
with open(r"e:\Project\Accounts\Acc-Web_BackEnd\backend\Account-Web-Backend\Acc-Web-API\Controllers\ReportController.cs", "r") as f:
    ctrl_content = f.read()

ctrl_sps = set(re.findall(r'"dbo\.(ACC_sp_Get[^"]+)"', ctrl_content))

print(f"Total UI Reports: {len(ui_labels)} (Unique: {len(expected_sps)})")
print(f"Total SPs in Controller: {len(ctrl_sps)}")

missing_in_ctrl = expected_sps - ctrl_sps
print("\nExpected SPs missing in Controller:")
for sp in sorted(missing_in_ctrl):
    print(sp)
