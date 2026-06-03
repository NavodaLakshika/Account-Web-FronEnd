const fs = require('fs');
const taskPath = 'C:/Users/LENOVO/.gemini/antigravity-ide/brain/299bfe48-11b3-4c24-b6fc-e39ab5e5c81e/task.md';
let content = fs.readFileSync(taskPath, 'utf8');

content = content.replace('- `[ ]` Write `sp_GetProfitAndLoss`', '- `[x]` Write `sp_GetProfitAndLoss`');
content = content.replace('- `[ ]` Write `sp_GetBalanceSheet`', '- `[x]` Write `sp_GetBalanceSheet`');
content = content.replace('- `[ ]` Write `sp_GetTrialBalance`', '- `[x]` Write `sp_GetTrialBalance`');

fs.writeFileSync(taskPath, content);
