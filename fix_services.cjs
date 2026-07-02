const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'services');
const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.service.js'));

for (const file of files) {
  const filePath = path.join(servicesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  const match = content.match(/const api = axios\.create\(\{\s*baseURL:\s*'(\/api\/[^']+)'/);
  if (match) {
    const baseURL = match[1];
    const routePrefix = baseURL.replace('/api', '');
    
    const regex = /import axios from 'axios';[\s\S]+?api\.interceptors\.request\.use\([\s\S]+?\);/m;
    if (regex.test(content)) {
      content = content.replace(regex, `import api from './api';`);
      
      content = content.replace(/api\.(get|post|put|delete)\(['"]\/([^'"]*)['"]/g, `api.$1('${routePrefix}/$2'`);
      content = content.replace(/api\.(get|post|put|delete)\(\`\/([^`]*)\`/g, `api.$1(\`${routePrefix}/$2\``);

      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', file);
    }
  }
}
