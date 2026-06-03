const fs = require('fs');
const taskPath = 'C:/Users/LENOVO/.gemini/antigravity-ide/brain/299bfe48-11b3-4c24-b6fc-e39ab5e5c81e/task.md';
let content = fs.readFileSync(taskPath, 'utf8');

content = content.replace('- `[/]` Initialize `.NET Core Web API` project (`Acc_Web_API`)', '- `[x]` Initialize `.NET Core Web API` project (`Acc_Web_API`)');
content = content.replace('- `[ ]` Configure `appsettings.json` for SQL Server connection', '- `[x]` Configure `appsettings.json` for SQL Server connection');
content = content.replace('- `[ ]` Create Data Access layer using ADO.NET', '- `[x]` Create Data Access layer using ADO.NET');
content = content.replace('- `[ ]` Create `ReportsController` with endpoints for the 3 reports', '- `[x]` Create `ReportsController` with endpoints for the 3 reports');
content = content.replace('- `[ ]` Update `ReportTemplate.jsx` to fetch from the new .NET API endpoints', '- `[/]` Update `ReportTemplate.jsx` to fetch from the new .NET API endpoints');

fs.writeFileSync(taskPath, content);
