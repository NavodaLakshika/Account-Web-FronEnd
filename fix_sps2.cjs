const fs = require('fs');
let content = fs.readFileSync('create_financial_reports_sps.sql', 'utf8');
content = content.replace(/ACC_TransactionSave_Header/g, 'ACC_Transaction_Header');
fs.writeFileSync('create_financial_reports_sps.sql', content);
