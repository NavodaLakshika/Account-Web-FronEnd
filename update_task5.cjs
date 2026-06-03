const fs = require('fs');
const taskPath = 'C:/Users/LENOVO/.gemini/antigravity-ide/brain/299bfe48-11b3-4c24-b6fc-e39ab5e5c81e/task.md';
let content = fs.readFileSync(taskPath, 'utf8');

content = content.replace('- `[ ]` Write generator script for 87 reports', '- `[x]` Write generator script for 87 reports');
content = content.replace('- `[ ]` Generate `mass_create_reports_sps.sql`', '- `[x]` Generate `mass_create_reports_sps.sql`');
content = content.replace('- `[ ]` Inject C# endpoints into `ReportController.cs`', '- `[x]` Inject C# endpoints into `ReportController.cs`');
content = content.replace('- `[ ]` Update `ReportTemplate.jsx` dynamic mapping', '- `[x]` Update `ReportTemplate.jsx` dynamic mapping');

fs.writeFileSync(taskPath, content);
