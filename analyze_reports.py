import re

user_reports = set()
with open("user_reports_list.txt", "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line or line in ['Business overview', 'Who owes you', 'Inventory', 'Sales and customers', 'What you owe', 'Expenses and suppliers', 'Sales tax', 'Employees', 'For my accountant', 'Payroll', 'Time', 'NEW', 'Learn more about QuickBooks Payroll']: continue
        user_reports.add(line.lower())

existing_reports = set()
with open("src/components/modals/AdminReports/ReportsModal.jsx", "r", encoding="utf-8") as f:
    content = f.read()
    matches = re.findall(r"'([^']+)'", content)
    matches += re.findall(r'"([^"]+)"', content)
    for match in matches:
        existing_reports.add(match.lower())

missing = [r for r in user_reports if r not in existing_reports]
print("Missing from ReportsModal.jsx:")
print(len(missing))
for m in sorted(missing):
    print(m)
