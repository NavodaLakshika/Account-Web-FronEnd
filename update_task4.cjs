const fs = require('fs');
const taskPath = 'C:/Users/LENOVO/.gemini/antigravity-ide/brain/299bfe48-11b3-4c24-b6fc-e39ab5e5c81e/task.md';
let content = fs.readFileSync(taskPath, 'utf8');

content = content.replace('- `[/]` Update `ReportTemplate.jsx` to fetch from the new .NET API endpoints', '- `[x]` Update `ReportTemplate.jsx` to fetch from the new .NET API endpoints');

fs.writeFileSync(taskPath, content);
