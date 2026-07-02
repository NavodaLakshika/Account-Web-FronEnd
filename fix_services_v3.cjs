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

  // Match the axios import and custom api creation block
  const blockRegex = /import axios from 'axios';([\s\S]*?)const api = axios\.create\(\{[\s\S]*?baseURL:\s*'(\/api\/[^']+)'[\s\S]*?\}\);([\s\S]*?)api\.interceptors\.request\.use\([\s\S]*?\}\s*,\s*\(error\)\s*=>\s*Promise\.reject\(error\)\s*\);/m;

  const match = content.match(blockRegex);
  if (match) {
    const originalImports = match[1]; // Any other imports between axios and const api
    const baseURL = match[2];
    const routePrefix = baseURL.replace('/api', '');
    
    // Replace the matched block with our new import and preserve other imports
    const newTop = `import api from './api';${originalImports}`;
    
    let newContent = content.replace(blockRegex, newTop);
    
    // Replace api.get('/path') with api.get('/Controller/path')
    newContent = newContent.replace(/api\.(get|post|put|delete)\(['"]\/([^'"]*)['"]/g, `api.$1('${routePrefix}/$2'`);
    newContent = newContent.replace(/api\.(get|post|put|delete)\(\`\/([^`]*)\`/g, `api.$1(\`${routePrefix}/$2\``);

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Fixed completely safely:', file);
  }
}
