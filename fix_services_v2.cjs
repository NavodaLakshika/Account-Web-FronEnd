const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'services');
const filesToFix = [
  'cardCommission.service.js',
  'depRate.service.js',
  'fixedAsset.service.js',
  'fixedExpenses.service.js',
  'fixedIncome.service.js',
  'grn.service.js',
  'longTermLiab.service.js',
  'payBill.service.js',
  'pettyCash.service.js',
  'purchOrder.service.js',
  'quotation.service.js',
  'writeCheque.service.js'
];

for (const file of filesToFix) {
  const filePath = path.join(servicesDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  const match = content.match(/const api = axios\.create\(\{\s*baseURL:\s*'(\/api\/[^']+)'/);
  if (match) {
    const baseURL = match[1]; // e.g. /api/PayBill
    const routePrefix = baseURL.replace('/api', ''); // e.g. /PayBill
    
    // Find where the interceptor ends by looking for export const
    const exportIndex = content.indexOf('export const');
    if (exportIndex !== -1) {
      // Everything before export const is imports and interceptors
      const topPart = content.substring(0, exportIndex);
      const bottomPart = content.substring(exportIndex);
      
      let newTopPart = `import api from './api';\n\n`;
      let newBottomPart = bottomPart;
      
      newBottomPart = newBottomPart.replace(/api\.(get|post|put|delete)\(['"]\/([^'"]*)['"]/g, `api.$1('${routePrefix}/$2'`);
      newBottomPart = newBottomPart.replace(/api\.(get|post|put|delete)\(\`\/([^`]*)\`/g, `api.$1(\`${routePrefix}/$2\``);

      fs.writeFileSync(filePath, newTopPart + newBottomPart, 'utf8');
      console.log('Fixed', file);
    }
  }
}
