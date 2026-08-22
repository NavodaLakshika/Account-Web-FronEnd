const fs = require('fs');
let c = fs.readFileSync('src/components/TransactionFormWrapper.jsx', 'utf8');
c = c.replace('const handlePopOut = () => {', 'const handlePopOut = () => {\n    if (boardName) {\n      window.open(`/board?name=${boardName}`, \'_blank\');\n      if (onClose) onClose();\n      return;\n    }');
fs.writeFileSync('src/components/TransactionFormWrapper.jsx', c);